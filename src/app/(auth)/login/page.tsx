"use client";

import { useRouter } from "next/navigation";

import { LoginIllustration } from "@/components/auth/login-illustration";
import { LoginFormType } from "@/lib/schemas/loginSchema";
import { LoginForm } from "@/components/auth/loginForm";
import { useLoginMutation } from "@/services/authApi";



export default function LoginPage() {
  const router = useRouter();
  const [login, { isLoading, error }] = useLoginMutation();

  const handleLogin = async (values: LoginFormType) => {
    try {
      const result = await login(values).unwrap();
      router.push("/dashboard");
    } catch (err) {
      
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          <LoginForm onSubmit={handleLogin} isSubmitting={isLoading} />
          {error && (
            <p className="mt-4 text-center text-sm text-red-500">
              Invalid email or password
            </p>
          )}
        </div>
      </div>

      <LoginIllustration />
    </div>
  );
}