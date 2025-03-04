"use client";

import { useState } from "react";
import { PricingSection } from "../../components/ui/pricing-section";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader, Github } from "lucide-react";
import { useSignUp } from "../hooks/auth/useAuth";

const signUpSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

type SignupRequest = z.infer<typeof signUpSchema>;

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [showSignupForm, setShowSignupForm] = useState(false);
  const router = useRouter();

  const signUpForm = useForm<SignupRequest>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const signUpMutation = useSignUp();

  const handlePlanSelect = (plan: "monthly" | "yearly") => {
    setSelectedPlan(plan);
    setShowSignupForm(true);
  };

  const onSignUpSubmit = async (data: SignupRequest) => {
    if (!selectedPlan) {
      setError("Please select a plan first");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Call the signup API
      const response = await signUpMutation.mutateAsync({
        ...data,
        plan: selectedPlan,
      });

      // Check if a redirect URL for PhonePe is returned
      if (response.redirectUrl) {
        // Redirect the user to PhonePe to authenticate the mandate
        window.location.href = response.redirectUrl;
      } else {
        throw new Error("No redirect URL received from server");
      }
    } catch (error: any) {
      setIsLoading(false);
      if (error.message) {
        console.log("ERROR MESSAGE: ", error);
        setError(error.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:32px_32px]">
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        {!showSignupForm ? (
          <PricingSection onPlanSelect={handlePlanSelect} />
        ) : (
          <div className="w-full max-w-[400px] rounded-lg bg-[#141414] p-6 shadow-xl">
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-white">
                  Create your account
                </h1>
                <p className="text-sm text-gray-400">
                  Selected plan:{" "}
                  {selectedPlan?.charAt(0).toUpperCase() +
                    selectedPlan?.slice(1)}
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#222222]"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#141414] px-2 text-gray-400">
                    OR SIGN UP WITH
                  </span>
                </div>
              </div>

              <Form {...signUpForm}>
                <form
                  onSubmit={signUpForm.handleSubmit(onSignUpSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={signUpForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">
                            Username
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Your username"
                              className="border-[#222222] bg-[#141414] text-white placeholder:text-gray-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="name@example.com"
                              className="border-[#222222] bg-[#141414] text-white placeholder:text-gray-400"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Your password"
                              className="border-[#222222] bg-[#141414] text-white placeholder:text-gray-400 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                            >
                              {showPassword ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-[#2F9C7E] hover:bg-[#268C6E] text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Setting up autopay...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </form>
              </Form>

              {error && (
                <div className="text-sm text-red-500 text-center">{error}</div>
              )}

              <div className="text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-[#2F9C7E] hover:underline">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
