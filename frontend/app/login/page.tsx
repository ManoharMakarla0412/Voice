"use client";

import Link from "next/link";
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
  FormMessage,
} from "../../components/ui/form";
import { useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useLogin } from "../hooks/auth/useAuth";
import { useToast } from "../../components/ui/use-toast";
import { Toaster } from "../../components/ui/toaster";

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
  const router = useRouter();
  const { toast } = useToast();

  const signInForm = useForm<LoginRequest>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useLogin();

  const onSignInSubmit = async (data: LoginRequest) => {
    try {
      const response = await loginMutation.mutateAsync(data);
      if (response.data.token) {
        sessionStorage.setItem("auth_token", response.data.token);
        sessionStorage.setItem("username", response.data.user.username);
        sessionStorage.setItem("email", response.data.user.email);
        toast({
          title: "Login Successful",
          description: "You have been successfully logged in.",
          variant: "success",
        });
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "failure",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:32px_32px]">
      <Toaster />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-[400px] rounded-lg bg-[#141414] p-6 shadow-xl">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-white">
                Sign into your account
              </h1>
              <p className="text-sm text-gray-400">
                Easily manage your autonomous voice assistants all in one
                dashboard.
              </p>
            </div>

            <Form {...signInForm}>
              <form
                onSubmit={signInForm.handleSubmit(onSignInSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={signInForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Your email address"
                          type="email"
                          className="border-[#222222] bg-[#141414] text-white placeholder:text-gray-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signInForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="Your password"
                            type={showPassword ? "text" : "password"}
                            className="border-[#222222] bg-[#141414] text-white placeholder:text-gray-400 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-[#2F9C7E] hover:bg-[#268C6E] text-white"
                >
                  Sign In
                </Button>
              </form>
            </Form>

            <div className="space-y-2 text-center text-sm">
              <p className="text-gray-400">
                Don't have an account?{" "}
                <Link href="/signup" className="text-[#2F9C7E] hover:underline">
                  Sign up
                </Link>
              </p>
              <Link
                href="/reset-password"
                className="text-[#2F9C7E] hover:underline block"
              >
                Forgot your password?
              </Link>

              <p className="text-white">
                  By signing in, you agree to our{" "}
                  <Link
                    href="/terms-and-conditions"
                    className="text-[#2F9C7E] hover:underline font-medium"
                  >
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-[#2F9C7E] hover:underline font-medium"
                  >
                    Privacy Policy
                  </Link>.
                  and {" "}

                  <Link 
                  href= "/refund-policy"
                  className="text-[#2F9C7E] hover:underline font-medium"
>
                                      Refund Policy
                  </Link>
                </p>
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
      <LoginPageContent />
    </QueryClientProvider>
  );
}
