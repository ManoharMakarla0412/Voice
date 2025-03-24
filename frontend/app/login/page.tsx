"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useLogin } from "../hooks/auth/useAuth";
import Image from "next/image";
import logo from "../../public/images/logo.png";

const queryClient = new QueryClient();

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

type LoginRequest = z.infer<typeof signInSchema>;

function LoginPageContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useLogin();

  const onSignInSubmit = async (data: LoginRequest) => {
    try {
      setIsLoading(true);
      setLoginError(null);
      const response = await loginMutation.mutateAsync(data);

      if (response.data.token) {
        sessionStorage.setItem("auth_token", response.data.token);
        sessionStorage.setItem("username", response.data.user.username);
        sessionStorage.setItem("email", response.data.user.email);

        // Show toast with DaisyUI
        document.body.appendChild(createToast("Login Successful", "success"));

        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to create toast notifications
  const createToast = (
    message: string,
    type: "info" | "success" | "warning" | "error"
  ) => {
    const toast = document.createElement("div");
    toast.className = `toast toast-end`;

    const alert = document.createElement("div");
    alert.className = `alert alert-${type} py-2`;
    alert.innerHTML = `<span>${message}</span>`;

    toast.appendChild(alert);

    setTimeout(() => {
      toast.remove();
    }, 3000);

    return toast;
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4 bg-grid-pattern">
      <div className="card w-full max-w-sm bg-base-200 shadow-xl">
        <div className="card-body p-5">
          {/* Logo Section */}
          <div className="flex justify-center mb-3">
            <div className="relative h-10 w-32">
              <Image
                src={logo}
                alt="Elide Pro Logo"
                fill
                style={{ objectFit: "contain" }}
                priority
                className="transition-all duration-300 hover:scale-105"
              />
            </div>
          </div>

          <h2 className="card-title text-xl font-bold mb-1">Welcome Back</h2>
          <p className="text-base-content/70 text-sm mb-4">
            Sign in to manage your autonomous voice assistants
          </p>

          {loginError && (
            <div className="alert alert-error py-2 text-xs mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-4 w-4"
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
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSignInSubmit)} className="space-y-3">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-sm">Email</span>
              </label>
              <input
                type="email"
                placeholder="your.email@example.com"
                className={`input input-bordered input-sm w-full ${
                  errors.email ? "input-error" : ""
                }`}
                {...register("email")}
              />
              {errors.email && (
                <label className="label py-0">
                  <span className="label-text-alt text-error text-xs">
                    {errors.email.message}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-sm">Password</span>
                <Link
                  href="/reset-password"
                  className="label-text-alt link link-primary text-xs"
                >
                  Forgot password?
                </Link>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`input input-bordered input-sm w-full pr-10 ${
                    errors.password ? "input-error" : ""
                  }`}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-base-content/60 hover:text-primary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <Eye className="h-3.5 w-3.5" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <label className="label py-0">
                  <span className="label-text-alt text-error text-xs">
                    {errors.password.message}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control mt-4">
              <button
                type="submit"
                className={`btn btn-primary btn-sm ${
                  isLoading ? "loading" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          <div className="divider my-2 text-xs">OR</div>

          <div className="text-center space-y-2">
            <p className="text-base-content/70 text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="link link-primary">
                Sign up
              </Link>
            </p>

            <div className="text-xs text-base-content/60 max-w-sm mx-auto">
              By signing in, you agree to our{" "}
              <Link href="/terms-and-conditions" className="link link-primary">
                Terms
              </Link>
              ,{" "}
              <Link href="/privacy-policy" className="link link-primary">
                Privacy
              </Link>{" "}
              and{" "}
              <Link href="/refund-policy" className="link link-primary">
                Refund
              </Link>{" "}
              policies
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <style jsx global>{`
        .bg-grid-pattern {
          background-image: radial-gradient(
            rgba(255, 255, 255, 0.1) 1px,
            transparent 1px
          );
          background-size: 32px 32px;
        }
      `}</style>
      <LoginPageContent />
    </QueryClientProvider>
  );
}
