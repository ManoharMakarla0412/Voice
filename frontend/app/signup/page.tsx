"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useSignUp } from "../hooks/auth/useAuth";
import Image from "next/image";
import logo from "../../public/images/logo.png";
import { PricingSection } from "../dashboard/components/pricing-section";

// Define the complete type for the signup form including plan and billing
const signUpSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(20, { message: "Username must not exceed 20 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain an uppercase letter" })
    .regex(/[0-9]/, { message: "Password must contain a number" }),
});

// Basic form type without plan/billing (for the form only)
type SignupFormData = z.infer<typeof signUpSchema>;

// Extended type for the API request that includes plan/billing
interface SignupRequest extends SignupFormData {
  plan: string;
  billing: "monthly" | "yearly";
}

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [selectedBilling, setSelectedBilling] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const signUpMutation = useSignUp();

  const handlePlanSelect = (
    planType: string,
    billingCycle: "monthly" | "yearly"
  ) => {
    setSelectedPlan(planType);
    setSelectedBilling(billingCycle);
    setShowSignupForm(true);
    document.body.appendChild(
      createToast(
        `Selected ${planType} plan with ${billingCycle} billing!`,
        "success"
      )
    );
  };

  const onSignUpSubmit = async (data: SignupFormData) => {
    if (!selectedPlan) {
      document.body.appendChild(
        createToast("Please select a plan first", "error")
      );
      return;
    }

    try {
      setIsLoading(true);
      setSignupError(null);

      // Create the complete request with plan and billing
      const signupRequest: SignupRequest = {
        ...data,
        plan: selectedPlan,
        billing: selectedBilling,
      };

      const response = await signUpMutation.mutateAsync(signupRequest);

      if (response.status === "success" && response.data.token) {
        sessionStorage.setItem("auth_token", response.data.token);
        sessionStorage.setItem("username", response.data.user.username);
        sessionStorage.setItem("email", response.data.user.email);

        document.body.appendChild(createToast("Signup successful!", "success"));
        if(response.status == "success"){
        router.push("/login");
        }
      } else {
        setSignupError("Unexpected response from server");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred. Please try again.";
      setSignupError(errorMessage);
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

  // Go back to plan selection
  const handleChangePlan = () => {
    setShowSignupForm(false);
  };

  // Helper function to get descriptive plan name
  const getPlanLabel = () => {
    const planName =
      selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1);
    return `${planName} (${selectedBilling})`;
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center p-4 bg-grid-pattern">
      <style jsx>{`
        .bg-grid-pattern {
          background-image: radial-gradient(
            rgba(255, 255, 255, 0.1) 1px,
            transparent 1px
          );
          background-size: 32px 32px;
        }
      `}</style>

      <div className="w-full max-w-4xl">
        {!showSignupForm ? (
          <PricingSection onPlanSelect={handlePlanSelect} />
        ) : (
          <div className="card bg-base-200 shadow-xl max-w-sm mx-auto">
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

              <h2 className="card-title text-xl font-bold mb-1">
                Create your account
              </h2>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-base-content/70">
                    Selected plan:
                  </span>
                  <span className="badge badge-primary capitalize">
                    {getPlanLabel()}
                  </span>
                </div>
                <button
                  onClick={handleChangePlan}
                  className="btn btn-ghost btn-xs"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Change plan
                </button>
              </div>

              {signupError && (
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
                  <span>{signupError}</span>
                </div>
              )}

              <form
                onSubmit={handleSubmit(onSignUpSubmit)}
                className="space-y-3"
              >
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm">Username</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Your username"
                    className={`input input-bordered input-sm w-full ${
                      errors.username ? "input-error" : ""
                    }`}
                    {...register("username")}
                    disabled={isLoading}
                  />
                  {errors.username && (
                    <label className="label py-0">
                      <span className="label-text-alt text-error text-xs">
                        {errors.username.message}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm">Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className={`input input-bordered input-sm w-full ${
                      errors.email ? "input-error" : ""
                    }`}
                    {...register("email")}
                    disabled={isLoading}
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
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`input input-bordered input-sm w-full pr-10 ${
                        errors.password ? "input-error" : ""
                      }`}
                      {...register("password")}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-base-content/60 hover:text-primary"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
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
                    className="btn btn-primary btn-sm"
                    disabled={isLoading || !isValid}
                  >
                    {isLoading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      "Sign Up"
                    )}
                  </button>
                </div>
              </form>

              <div className="divider my-2 text-xs">OR</div>

              <div className="text-center space-y-2">
                <p className="text-base-content/70 text-sm">
                  Already have an account?{" "}
                  <Link href="/login" className="link link-primary">
                    Sign in
                  </Link>
                </p>

                <div className="text-xs text-base-content/60 max-w-sm mx-auto">
                  By signing up, you agree to our{" "}
                  <Link
                    href="/terms-and-conditions"
                    className="link link-primary"
                  >
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
        )}
      </div>
    </div>
  );
}
