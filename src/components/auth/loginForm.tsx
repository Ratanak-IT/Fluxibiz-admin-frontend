"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/passwordInput";
import { Button } from "@/components/ui/button";
import { LoginFormType, loginSchema } from "@/lib/schemas/loginSchema";
import { useLoginMutation } from "@/services/authApi";

export function LoginForm() {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormType) => {
    try {
      await login(values).unwrap();
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login failed:", error);
      setError("root", {
        message: error?.data?.message || "Invalid email or password",
      });
    }
  };

  return (
    <div className="w-full max-w-[420px]">
      <h1 className="mb-8 text-3xl font-bold text-[#00932A]">
        Log in Your Account
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">
            Email <span className="text-red-500">*</span>
          </label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="sokkhim@gmail.com"
                className="border-[#D9D9D9] focus-visible:ring-[#00932A]"
              />
            )}
          />
          {errors.email && (
            <p className="text-sm font-medium text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Password <span className="text-red-500">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[#00932A] hover:underline"
            >
              Forgot password
            </Link>
          </div>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <PasswordInput
                {...field}
                placeholder="••••••••••••"
                className="border-[#D9D9D9] focus-visible:ring-[#00932A]"
              />
            )}
          />
          {errors.password && (
            <p className="text-sm font-medium text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        {errors.root && (
          <p className="text-sm font-medium text-red-500">
            {errors.root.message}
          </p>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full bg-[#00932A] text-white hover:bg-[#00932A]/90"
        >
          {isLoading ? "Logging in..." : "Log in"}
        </Button>
      </form>
    </div>
  );
}