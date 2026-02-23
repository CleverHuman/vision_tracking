"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Zap,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Chrome,
  Monitor,
  Activity,
  Target,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email or username is required")
    .refine(
      (val) =>
        val.includes("@")
          ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
          : val.length >= 3,
      "Please enter a valid email or username (min 3 characters)"
    ),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Login attempt:", { ...data, rememberMe });
      router.push("/dashboard");
    } catch {
      console.error("Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dark">
      <div className="flex min-h-screen bg-[#0a0e1a]">
        {/* Left Side - Login Form */}
        <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-md">
            {/* Branding */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#22c55e]/10 ring-1 ring-[#22c55e]/20">
                  <Zap className="h-6 w-6 text-[#22c55e]" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white">
                  Vision<span className="text-[#22c55e]">Track</span>
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Sports video analysis platform
              </p>
            </div>

            {/* Login Card */}
            <Card className="border-[#1e3a5f]/50 bg-[#0f1629]/80 backdrop-blur-sm shadow-2xl shadow-black/20">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl font-semibold text-white">
                  Sign in to your account
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Enter your credentials to access the dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Email / Username */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-slate-300"
                    >
                      Email or Username
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        id="email"
                        type="text"
                        placeholder="name@team.com"
                        className={cn(
                          "h-11 border-[#1e3a5f] bg-[#0a0e1a]/60 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-[#22c55e]/50",
                          errors.email &&
                            "border-red-500/50 focus-visible:ring-red-500/50"
                        )}
                        {...register("email")}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-400">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-slate-300"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className={cn(
                          "h-11 border-[#1e3a5f] bg-[#0a0e1a]/60 pl-10 pr-10 text-white placeholder:text-slate-500 focus-visible:ring-[#22c55e]/50",
                          errors.password &&
                            "border-red-500/50 focus-visible:ring-red-500/50"
                        )}
                        {...register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-400">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) =>
                          setRememberMe(checked === true)
                        }
                        className="border-[#1e3a5f] data-[state=checked]:bg-[#22c55e] data-[state=checked]:border-[#22c55e]"
                      />
                      <Label
                        htmlFor="remember"
                        className="text-sm font-normal text-slate-400 cursor-pointer"
                      >
                        Remember me
                      </Label>
                    </div>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-[#22c55e] hover:text-[#22c55e]/80 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 w-full bg-[#22c55e] font-semibold text-[#052e16] hover:bg-[#22c55e]/90 disabled:opacity-50 transition-all"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#052e16]/30 border-t-[#052e16]" />
                        Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#1e3a5f]" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-[#0f1629] px-3 text-slate-500">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* OAuth Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 border-[#1e3a5f] bg-[#0a0e1a]/40 text-slate-300 hover:bg-[#1e3a5f]/30 hover:text-white transition-all"
                  >
                    <Chrome className="h-4 w-4 mr-2" />
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 border-[#1e3a5f] bg-[#0a0e1a]/40 text-slate-300 hover:bg-[#1e3a5f]/30 hover:text-white transition-all"
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    Microsoft
                  </Button>
                </div>

                {/* Register Link */}
                <p className="mt-6 text-center text-sm text-slate-400">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-[#22c55e] hover:text-[#22c55e]/80 transition-colors"
                  >
                    Create an account
                  </Link>
                </p>
              </CardContent>
            </Card>

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-slate-600">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-slate-500 hover:text-slate-400 underline underline-offset-2">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-slate-500 hover:text-slate-400 underline underline-offset-2">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side - Hero Visual */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#0f2b1a] to-[#0a0e1a]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a] via-transparent to-[#0a0e1a]/50" />

          {/* Field Pattern Overlay */}
          <div className="absolute inset-0 field-pattern opacity-30" />

          {/* Animated Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-[#22c55e]/10 blur-[100px]" />
          <div className="absolute bottom-1/3 left-1/3 h-48 w-48 rounded-full bg-[#22c55e]/5 blur-[80px]" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full px-12">
            {/* Central Icon */}
            <div className="mb-10">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#22c55e]/10 ring-1 ring-[#22c55e]/20 backdrop-blur-sm">
                  <Zap className="h-12 w-12 text-[#22c55e]" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#22c55e] animate-pulse" />
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-3xl font-bold text-white text-center mb-3 leading-tight">
              Elevate Your
              <br />
              <span className="text-[#22c55e]">Game Analysis</span>
            </h2>
            <p className="text-slate-400 text-center max-w-sm mb-12 leading-relaxed">
              AI-powered video analysis, real-time performance tracking, and
              tactical insights for competitive sports teams.
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <div className="flex items-center gap-3 rounded-xl border border-[#1e3a5f]/50 bg-[#0f1629]/60 backdrop-blur-sm p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#22c55e]/10">
                  <Activity className="h-5 w-5 text-[#22c55e]" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">10K+</p>
                  <p className="text-xs text-slate-500">Videos Analyzed</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-[#1e3a5f]/50 bg-[#0f1629]/60 backdrop-blur-sm p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#22c55e]/10">
                  <Target className="h-5 w-5 text-[#22c55e]" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">98%</p>
                  <p className="text-xs text-slate-500">Accuracy Rate</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-[#1e3a5f]/50 bg-[#0f1629]/60 backdrop-blur-sm p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#22c55e]/10">
                  <TrendingUp className="h-5 w-5 text-[#22c55e]" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">500+</p>
                  <p className="text-xs text-slate-500">Teams Active</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-[#1e3a5f]/50 bg-[#0f1629]/60 backdrop-blur-sm p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#22c55e]/10">
                  <BarChart3 className="h-5 w-5 text-[#22c55e]" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">24/7</p>
                  <p className="text-xs text-slate-500">Live Tracking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
