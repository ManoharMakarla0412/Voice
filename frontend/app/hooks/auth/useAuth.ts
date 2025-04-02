import { useMutation } from "@tanstack/react-query";
import { BASE_URL } from "../../../app/utils/constants";

type SignupRequest = {
  username: string;
  email: string;
  password: string;
  plan: string;
  billing: "monthly" | "yearly";
};

type OtpVerificationRequest = {
  email: string;
  otp: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

export const useSignUp = () => {
  return useMutation({
    mutationFn: async (data: SignupRequest) => {
      const response = await fetch(`${BASE_URL}/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Signup failed");
      }

      const result = await response.json();
      sessionStorage.setItem("auth_token", result.data.token);
      return result;
    },
  });
};

export const useResendOTP = () => {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const response = await fetch(`${BASE_URL}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to resend OTP");
      }
      return response.json();
    },
  });
};

export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: async (data: OtpVerificationRequest) => {
      const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "OTP verification failed");
      }
      return response.json();
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await fetch(`${BASE_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const result = await response.json();
      sessionStorage.setItem("auth_token", result.data.token);
      return result;
    },
  });
};

async function completeProfile(profileData: any) {
  const response = await fetch(`${BASE_URL}/auth/complete-profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("auth_token")}`,
    },
    credentials: "include",
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Error completing profile");
  }

  return response.json();
}

export const useCompleteProfileMutation = () => {
  return useMutation({
    mutationFn: completeProfile,
  });
};
