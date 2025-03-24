"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BASE_URL } from "../../utils/constants";

export default function OAuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get("code"); // Extract the `code` parameter from the URL

      if (!code) {
        setError("Authorization code not found in URL.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/api/auth/calendly`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to handle OAuth callback");
        }

        const data = await response.json();

        if (data.token) {
          router.push("/dashboard/calendly"); // Redirect on success
        } else {
          throw new Error(data.message || "Unknown error occurred");
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [searchParams, router]);

  return (
    <div className="hero min-h-screen bg-base-100">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title justify-center text-2xl mb-4">
                Processing OAuth Callback
              </h2>

              {error ? (
                <div className="alert alert-error">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4">
                  <span className="loading loading-spinner loading-lg text-primary"></span>
                  <div className="alert alert-info">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="stroke-current shrink-0 h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span>Redirecting to Calendly integration...</span>
                  </div>
                </div>
              )}

              <div className="card-actions justify-center mt-4">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="btn btn-outline btn-sm"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
