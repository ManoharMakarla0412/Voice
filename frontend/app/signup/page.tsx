"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Image from "next/image";
import logo from "../../public/images/logo.png";
import { PricingSection } from "../dashboard/components/pricing-section";

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
type SignupFormData = z.infer<typeof signUpSchema>;

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [selectedBilling, setSelectedBilling] = useState<"monthly" | "yearly">("monthly");
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

  const handlePlanSelect = (planType: string, billingCycle: "monthly" | "yearly") => {
    setSelectedPlan(planType);
    setSelectedBilling(billingCycle);
    setShowSignupForm(true);
    document.body.appendChild(createToast(`Selected ${planType} plan with ${billingCycle} billing!`, "success"));
  };

  const onSignUpSubmit = (data: SignupFormData) => {
    if (!selectedPlan) {
      document.body.appendChild(createToast("Please select a plan first", "error"));
      return;
    }

    setIsLoading(true);
    setSignupError(null);

    // Store signup data in sessionStorage and redirect to checkout
    sessionStorage.setItem("signupData", JSON.stringify({
      username: data.username,
      email: data.email,
      password: data.password,
      plan: selectedPlan,
      billing: selectedBilling,
    }));
    router.push("/checkout");
    setIsLoading(false);
  };

  const createToast = (message: string, type: "info" | "success" | "warning" | "error") => {
    const toast = document.createElement("div");
    toast.className = `toast toast-end`;
    const alert = document.createElement("div");
    alert.className = `alert alert-${type} py-2`;
    alert.innerHTML = `<span>${message}</span>`;
    toast.appendChild(alert);
    setTimeout(() => toast.remove(), 3000);
    return toast;
  };

  const handleChangePlan = () => {
    setShowSignupForm(false);
  };

  const getPlanLabel = () => {
    const planName = selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1);
    return `${planName} (${selectedBilling})`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full">
        {!showSignupForm ? (
          <PricingSection onPlanSelect={handlePlanSelect} />
        ) : (
          <div className="mx-auto card max-w-sm bg-base-100/40 backdrop-blur-md border-primary/40 hover:border-primary-60 transition-all shadow-xl">
            <div className="card-body p-5 relative">
              <div className="absolute top-2 left-2">
                <button onClick={handleChangePlan} className="btn btn-primary btn-soft btn-xs">
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Change plan
                </button>
              </div>
              <div className="flex justify-center mb-3 mt-6">
                <div className="relative h-10 w-32">
                  <Image src={logo} alt="Logo" fill style={{ objectFit: "contain" }} priority className="transition-all duration-300 hover:scale-105" />
                </div>
              </div>
              <h2 className="card-title text-xl font-bold mb-1">Create your account</h2>
              <div className="mb-3">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-base-content/70">Selected plan:</span>
                  <span className="badge badge-soft badge-primary capitalize">{getPlanLabel()}</span>
                </div>
              </div>
              {signupError && (
                <div className="alert alert-error py-2 text-xs mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{signupError}</span>
                </div>
              )}
              <form onSubmit={handleSubmit(onSignUpSubmit)} className="space-y-3">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-sm">Username</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Your username"
                    className={`input input-bordered input-sm w-full ${errors.username ? "input-error" : ""}`}
                    {...register("username")}
                    disabled={isLoading}
                  />
                  {errors.username && (
                    <label className="label py-0">
                      <span className="label-text-alt text-error text-xs">{errors.username.message}</span>
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
                    className={`input input-bordered input-sm w-full ${errors.email ? "input-error" : ""}`}
                    {...register("email")}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <label className="label py-0">
                      <span className="label-text-alt text-error text-xs">{errors.email.message}</span>
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
                      className={`input input-bordered input-sm w-full pr-10 ${errors.password ? "input-error" : ""}`}
                      {...register("password")}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-base-content/60 hover:text-primary"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <label className="label py-0">
                      <span className="label-text-alt text-error text-xs">{errors.password.message}</span>
                    </label>
                  )}
                </div>
                <div className="form-control mt-2">
                  <label className="label cursor-pointer justify-start gap-2">
                    <input type="checkbox" className="checkbox checkbox-primary checkbox-xs" />
                    <span className="label-text text-xs text-base-content/70">
                      I agree to the{" "}
                      <Link href="/terms-and-conditions" className="link link-primary uppercase">Terms</Link>,{" "}
                      <Link href="/privacy-policy" className="link link-primary uppercase">Privacy</Link>{" "}
                      and{" "}
                      <Link href="/refund-policy" className="link link-primary uppercase">Refund</Link>{" "}
                      policies
                    </span>
                  </label>
                </div>
                <div className="form-control mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm w-full"
                    disabled={isLoading || !isValid}
                  >
                    {isLoading ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      "Proceed to Payment"
                    )}
                  </button>
                </div>
              </form>
              <div className="divider my-2 text-sm">OR</div>
              <div className="text-center space-y-2">
                <p className="text-base-content/70 text-xs">
                  Already have an account?{" "}
                  <Link href="/login" className="link link-primary">Sign in</Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}