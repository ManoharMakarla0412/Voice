"use client";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useResendOTP, useVerifyOTP } from "../hooks/auth/useAuth";
import * as z from "zod";

const otpSchema = z.object({
  otp: z.string().length(6, { message: "OTP must be 6 characters long" }),
});

const OtpVerification = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [otp, setOtp] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const router = useRouter();

  const verifyOtpMutation = useVerifyOTP();
  const resendOtpMutation = useResendOTP();

  useEffect(() => {
    let countdown: NodeJS.Timeout;
    if (isResendDisabled) {
      countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(countdown);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [isResendDisabled]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const result = otpSchema.safeParse({ otp });
      
      if (!result.success) {
        setValidationError("OTP must be 6 characters long");
        return;
      }
      
      setValidationError(null);
      const email = sessionStorage.getItem("signup_email");
      
      if (!email) {
        setError("Email is missing. Please sign up again.");
        return;
      }
      
      await verifyOtpMutation.mutateAsync({ otp, email });
      router.push("/login");
    } catch (error) {
      setError("OTP verification failed. Please try again.");
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsResendDisabled(true);
      setTimer(30);
      const email = sessionStorage.getItem("signup_email");
      
      if (!email) {
        setError("Email is missing. Please sign up again.");
        return;
      }
      
      await resendOtpMutation.mutateAsync({ email });
      setSuccess("A new OTP has been sent to your email.");
    } catch (error) {
      setError("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card bg-base-100 shadow-xl w-full max-w-md">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold justify-center">Verify Your Account</h2>
          
          <p className="text-center mb-6 text-base-content/70">
            Enter the 6-digit OTP sent to your registered email.
          </p>
          
          {error && (
            <div className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="alert alert-success mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{success}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">OTP</span>
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                className={`input input-bordered w-full ${validationError ? 'input-error' : ''}`}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
              {validationError && (
                <label className="label">
                  <span className="label-text-alt text-error">{validationError}</span>
                </label>
              )}
            </div>
            
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={verifyOtpMutation.isPending}
            >
              {verifyOtpMutation.isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </button>
          </form>
          
          <div className="divider my-2">OR</div>
          
          <div className="text-center">
            <button
              className="btn btn-link"
              onClick={handleResendOTP}
              disabled={isResendDisabled}
            >
              {isResendDisabled ? (
                <>Resend OTP in {timer}s</>
              ) : (
                "Resend OTP"
              )}
            </button>
          </div>
          
          <div className="card-actions justify-center mt-2">
            <button 
              className="btn btn-ghost btn-sm" 
              onClick={() => router.push("/signup")}
            >
              Didn't receive the code? Sign up again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;