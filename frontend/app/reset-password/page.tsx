"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BASE_URL } from "../../app/utils/constants";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(1); // 1: Request reset, 2: Enter new password
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequestReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(errorData.message || "An error occurred");
        return;
      }

      const data = await response.json();
      setMessage(data.message);
      setStep(2);
    } catch (error) {
      console.error("Error during reset password request:", error);
      setMessage("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/auth/confirm-reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resetToken,
            newPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(errorData.message || "An error occurred");
        return;
      }

      const data = await response.json();
      setMessage(data.message);
      // Redirect to login after successful password reset
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error) {
      console.error("Error during password reset confirmation:", error);
      setMessage("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body p-8">
          <h2 className="card-title text-2xl font-bold text-primary justify-center mb-4">
            Reset Password
          </h2>
  
          {message && (
            <div className={`alert ${message.includes("error") ? "alert-error" : "alert-success"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                {message.includes("error") ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
              <span>{message}</span>
            </div>
          )}
  
          {step === 1 ? (
            <form className="space-y-6 mt-6" onSubmit={handleRequestReset}>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base">Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  className="input input-bordered w-full"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
  
              <div className="form-control w-full mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>
              
              <div className="divider">OR</div>
              
              <div className="form-control w-full">
                <button
                  type="button"
                  className="btn btn-outline btn-sm w-full"
                  onClick={() => router.push("/login")}
                >
                  Back to Login
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-6 mt-6" onSubmit={handleConfirmReset}>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base">Reset Token</span>
                </label>
                <input
                  type="text"
                  required
                  className="input input-bordered w-full"
                  placeholder="Enter reset token from email"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                />
              </div>
  
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base">New Password</span>
                </label>
                <input
                  type="password"
                  required
                  className="input input-bordered w-full"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <label className="label">
                  <span className="label-text-alt">
                    Password must be at least 8 characters
                  </span>
                </label>
              </div>
  
              <div className="form-control w-full mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </div>
              
              <div className="form-control w-full">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm w-full"
                  onClick={() => {
                    setStep(1);
                    setMessage("");
                  }}
                >
                  Back to Email Form
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}