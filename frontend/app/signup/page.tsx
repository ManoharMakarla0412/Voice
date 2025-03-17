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
import { Eye, EyeOff, Loader } from "lucide-react";
import { useSignUp } from "../hooks/auth/useAuth";
import { useToast } from "../../components/ui/use-toast";
import { Toaster } from "../../components/ui/toaster";

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

type SignupRequest = z.infer<typeof signUpSchema>;

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [showSignupForm, setShowSignupForm] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const signUpForm = useForm<SignupRequest>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    mode: "onChange", // Real-time validation
  });

  const signUpMutation = useSignUp();

  const handlePlanSelect = (plan: "monthly" | "yearly") => {
    setSelectedPlan(plan);
    setShowSignupForm(true);
    toast({
      title:`Selected ${plan} plan!` ,
      description: "You have been successfully Selected plan.",
      variant: "success",
    });
  };

  const onSignUpSubmit = async (data: SignupRequest) => {
    if (!selectedPlan) {
      toast({
        title:"Please select a plan first" ,
        description: "You must need select a plan.",
        variant: "failure",
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await signUpMutation.mutateAsync({
        ...data,
        plan: selectedPlan,
      });

      // Handle successful signup based on updated backend response
      if (response.status === "success" && response.data.token) {
        sessionStorage.setItem("auth_token", response.data.token);
        sessionStorage.setItem("username", response.data.user.username);
        sessionStorage.setItem("email", response.data.user.email);
        toast({
          title:`Signup successful!` ,
          description: "You have been successfully Selected plan.",
          variant: "success",
        });
        router.push("/login");
      } else {
        toast({
          title:"Error" ,
          description: "Unexpected response from server",
          variant: "failure",
        });
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error("Signup error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred. Please try again.";

        toast({
          title:"Error" ,
          description: errorMessage || "Unexpected response from server",
          variant: "failure",
        });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:32px_32px]">
      <Toaster />
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
                  <span className="capitalize">
                    {selectedPlan || "None selected"}
                  </span>
                </p>
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
                              className="border-[#222222] bg-[#141414] text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#2F9C7E] transition-all"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
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
                              className="border-[#222222] bg-[#141414] text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#2F9C7E] transition-all"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
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
                              className="border-[#222222] bg-[#141414] text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#2F9C7E] transition-all pr-10"
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                              disabled={isLoading}
                              aria-label="Toggle password visibility"
                            >
                              {showPassword ? (
                                <Eye className="h-4 w-4" />
                              ) : (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-[#2F9C7E] hover:bg-[#268C6E] text-white font-semibold py-2.5 rounded-lg transition-all"
                    disabled={isLoading || !signUpForm.formState.isValid}
                  >
                    {isLoading ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Signing up...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </form>
              </Form>

              <div className="text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#2F9C7E] hover:underline font-medium"
                >
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