"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Zap,
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building2,
  Shield,
  Video,
  Users,
  Trophy,
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

const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be under 100 characters"),
    username: z
      .string()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be under 30 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.string().min(1, "Please select a role"),
    sport: z.string().min(1, "Please select a sport"),
    organization: z.string().optional(),
    terms: z.literal(true, {
      message: "You must accept the terms of service",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const roles = [
  { value: "coach", label: "Coach" },
  { value: "analyst", label: "Analyst" },
  { value: "athlete", label: "Athlete" },
  { value: "scout", label: "Scout" },
  { value: "team_manager", label: "Team Manager" },
];

const sports = [
  { value: "soccer", label: "Soccer" },
  { value: "basketball", label: "Basketball" },
  { value: "baseball", label: "Baseball" },
  { value: "tennis", label: "Tennis" },
  { value: "hockey", label: "Hockey" },
  { value: "volleyball", label: "Volleyball" },
  { value: "rugby", label: "Rugby" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const registerUser = useAppStore((s) => s.register);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      sport: "",
      organization: "",
      terms: undefined,
    },
  });

  const termsValue = watch("terms");

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    setApiError(null);
    try {
      await registerUser({
        fullName: data.fullName,
        email: data.email,
        username: data.username,
        password: data.password,
        role: data.role,
        sport: data.sport,
        organization: data.organization,
      });
      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed. Please try again.";
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dark">
      <div className="flex min-h-screen bg-[#0a0e1a]">
        {/* Left Side - Hero Visual */}
        <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a] via-[#0f2b1a] to-[#0a0e1a]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a]/50 via-transparent to-[#0a0e1a]" />

          {/* Field Pattern Overlay */}
          <div className="absolute inset-0 field-pattern opacity-30" />

          {/* Animated Glows */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-[#22c55e]/10 blur-[100px]" />
          <div className="absolute bottom-1/4 left-1/4 h-48 w-48 rounded-full bg-[#22c55e]/5 blur-[80px]" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full px-10">
            {/* Central Icon */}
            <div className="mb-8">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#22c55e]/10 ring-1 ring-[#22c55e]/20 backdrop-blur-sm">
                  <Zap className="h-10 w-10 text-[#22c55e]" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#22c55e] animate-pulse" />
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-3xl font-bold text-white text-center mb-3 leading-tight">
              Join the Future of
              <br />
              <span className="text-[#22c55e]">Sports Analytics</span>
            </h2>
            <p className="text-slate-400 text-center max-w-xs mb-10 leading-relaxed">
              Empower your team with AI-driven insights, tactical breakdowns,
              and performance optimization tools.
            </p>

            {/* Feature Cards */}
            <div className="space-y-3 w-full max-w-xs">
              <div className="flex items-center gap-4 rounded-xl border border-[#1e3a5f]/50 bg-[#0f1629]/60 backdrop-blur-sm p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#22c55e]/10">
                  <Video className="h-5 w-5 text-[#22c55e]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    AI Video Analysis
                  </p>
                  <p className="text-xs text-slate-500">
                    Automatic play detection and tagging
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-[#1e3a5f]/50 bg-[#0f1629]/60 backdrop-blur-sm p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#22c55e]/10">
                  <Users className="h-5 w-5 text-[#22c55e]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Team Collaboration
                  </p>
                  <p className="text-xs text-slate-500">
                    Share insights with coaches and players
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-[#1e3a5f]/50 bg-[#0f1629]/60 backdrop-blur-sm p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#22c55e]/10">
                  <Trophy className="h-5 w-5 text-[#22c55e]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Competitive Edge
                  </p>
                  <p className="text-xs text-slate-500">
                    Data-driven strategies that win games
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="flex w-full flex-col justify-center px-6 py-8 lg:w-7/12 lg:px-16 xl:px-24">
          <div className="mx-auto w-full max-w-lg">
            {/* Branding */}
            <div className="mb-8">
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

            {/* Registration Card */}
            <Card className="border-[#1e3a5f]/50 bg-[#0f1629]/80 backdrop-blur-sm shadow-2xl shadow-black/20">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl font-semibold text-white">
                  Create your account
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Set up your profile to start analyzing performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="fullName"
                      className="text-sm font-medium text-slate-300"
                    >
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Smith"
                        className={cn(
                          "h-11 border-[#1e3a5f] bg-[#0a0e1a]/60 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-[#22c55e]/50",
                          errors.fullName &&
                            "border-red-500/50 focus-visible:ring-red-500/50"
                        )}
                        {...register("fullName")}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-xs text-red-400">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="username"
                      className="text-sm font-medium text-slate-300"
                    >
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="johndoe"
                        className={cn(
                          "h-11 border-[#1e3a5f] bg-[#0a0e1a]/60 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-[#22c55e]/50",
                          errors.username &&
                            "border-red-500/50 focus-visible:ring-red-500/50"
                        )}
                        {...register("username")}
                      />
                    </div>
                    {errors.username && (
                      <p className="text-xs text-red-400">
                        {errors.username.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-slate-300"
                    >
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        id="email"
                        type="email"
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

                  {/* Password Row */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                          placeholder="Min. 8 characters"
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

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-sm font-medium text-slate-300"
                      >
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Re-enter password"
                          className={cn(
                            "h-11 border-[#1e3a5f] bg-[#0a0e1a]/60 pl-10 pr-10 text-white placeholder:text-slate-500 focus-visible:ring-[#22c55e]/50",
                            errors.confirmPassword &&
                              "border-red-500/50 focus-visible:ring-red-500/50"
                          )}
                          {...register("confirmPassword")}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-xs text-red-400">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Role & Sport Row */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Role */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="role"
                        className="text-sm font-medium text-slate-300"
                      >
                        Role
                      </Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none z-10" />
                        <select
                          id="role"
                          className={cn(
                            "flex h-11 w-full appearance-none rounded-md border border-[#1e3a5f] bg-[#0a0e1a]/60 pl-10 pr-8 text-sm text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#22c55e]/50 cursor-pointer",
                            !watch("role") && "text-slate-500",
                            errors.role &&
                              "border-red-500/50 focus-visible:ring-red-500/50"
                          )}
                          {...register("role")}
                        >
                          <option value="" disabled className="bg-[#0f1629] text-slate-500">
                            Select role
                          </option>
                          {roles.map((role) => (
                            <option
                              key={role.value}
                              value={role.value}
                              className="bg-[#0f1629] text-white"
                            >
                              {role.label}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                          <svg
                            className="h-4 w-4 text-slate-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                      {errors.role && (
                        <p className="text-xs text-red-400">
                          {errors.role.message}
                        </p>
                      )}
                    </div>

                    {/* Sport */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="sport"
                        className="text-sm font-medium text-slate-300"
                      >
                        Sport
                      </Label>
                      <div className="relative">
                        <Trophy className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none z-10" />
                        <select
                          id="sport"
                          className={cn(
                            "flex h-11 w-full appearance-none rounded-md border border-[#1e3a5f] bg-[#0a0e1a]/60 pl-10 pr-8 text-sm text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#22c55e]/50 cursor-pointer",
                            !watch("sport") && "text-slate-500",
                            errors.sport &&
                              "border-red-500/50 focus-visible:ring-red-500/50"
                          )}
                          {...register("sport")}
                        >
                          <option value="" disabled className="bg-[#0f1629] text-slate-500">
                            Select sport
                          </option>
                          {sports.map((sport) => (
                            <option
                              key={sport.value}
                              value={sport.value}
                              className="bg-[#0f1629] text-white"
                            >
                              {sport.label}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                          <svg
                            className="h-4 w-4 text-slate-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                      {errors.sport && (
                        <p className="text-xs text-red-400">
                          {errors.sport.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Organization */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="organization"
                      className="text-sm font-medium text-slate-300"
                    >
                      Team / Organization{" "}
                      <span className="text-slate-600 font-normal">
                        (optional)
                      </span>
                    </Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        id="organization"
                        type="text"
                        placeholder="e.g. FC Barcelona, Lakers"
                        className="h-11 border-[#1e3a5f] bg-[#0a0e1a]/60 pl-10 text-white placeholder:text-slate-500 focus-visible:ring-[#22c55e]/50"
                        {...register("organization")}
                      />
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 pt-1">
                      <Checkbox
                        id="terms"
                        checked={termsValue === true}
                        onCheckedChange={(checked) =>
                          setValue("terms", checked === true ? true : undefined as unknown as true, {
                            shouldValidate: true,
                          })
                        }
                        className="mt-0.5 border-[#1e3a5f] data-[state=checked]:bg-[#22c55e] data-[state=checked]:border-[#22c55e]"
                      />
                      <Label
                        htmlFor="terms"
                        className="text-sm font-normal leading-relaxed text-slate-400 cursor-pointer"
                      >
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          className="font-medium text-[#22c55e] hover:text-[#22c55e]/80 underline underline-offset-2 transition-colors"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="font-medium text-[#22c55e] hover:text-[#22c55e]/80 underline underline-offset-2 transition-colors"
                        >
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                    {errors.terms && (
                      <p className="text-xs text-red-400">
                        {errors.terms.message}
                      </p>
                    )}
                  </div>

                  {/* API Error */}
                  {apiError && (
                    <div className="rounded-md bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                      {apiError}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 w-full bg-[#22c55e] font-semibold text-[#052e16] hover:bg-[#22c55e]/90 disabled:opacity-50 transition-all"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#052e16]/30 border-t-[#052e16]" />
                        Creating account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>

                {/* Login Link */}
                <p className="mt-6 text-center text-sm text-slate-400">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-[#22c55e] hover:text-[#22c55e]/80 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </CardContent>
            </Card>

            {/* Footer */}
            <p className="mt-6 text-center text-xs text-slate-600">
              Need help?{" "}
              <Link
                href="/support"
                className="text-slate-500 hover:text-slate-400 underline underline-offset-2"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
