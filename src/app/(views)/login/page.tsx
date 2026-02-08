"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getSession, signIn } from "next-auth/react";

import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import GlobalLoader from "@/components/ui/common/GlobalLoader";

export default function SignIn() {
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const res = await signIn("credentials", {
      code,
      redirect: false,
    });

    if (res?.ok) {
      const session = await getSession();
      if (session?.user?.id) {
        setIsRedirecting(true);
        router.push(`/profile/${session.user.id}`);
        return;
      }
    } else {
      setErrorMsg("The code you entered is incorrect. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div>
      {isRedirecting && <GlobalLoader />}
      <div className="flex flex-col md:flex-row w-full h-[calc(100vh-64px)] overflow-hidden">
        
        {/* Left Section: Form */}
        <div className="md:px-10 h-full px-4 flex flex-col justify-center flex-1 w-full">
          <div className="text-center mb-8">
            <Image
              src="/images/logo.svg"
              alt="Platform Logo"
              width={150}
              height={150}
              className="mx-auto"
              priority
            />
            <h1 className="mt-2 font-semibold text-gray-800 text-xl dark:text-white/90 lg:text-4xl md:text-3xl">
              Welcome Back
            </h1>
          </div>

          <div>
            <div className="mb-5 sm:mb-8 lg:px-7">
              <h2 className="mb-2 font-semibold text-brand-800 dark:text-white/90 text-lg">
                Sign In
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Access your treatment plan and records.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter the unique access code provided by your provider.
              </p>
            </div>

            <form className="space-y-6 lg:px-8" onSubmit={handleSubmit}>
              <div>
                <Label>
                  Access Code <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  name="code"
                  placeholder="Enter your code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              {errorMsg && (
                <p className="text-sm text-red-600 font-semibold">
                  {errorMsg}
                </p>
              )}

              <Button className="w-full" size="sm" type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Sign In"}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Section: Hero Image */}
        <div className="hidden md:block md:w-1/2 h-full relative">
          <Image
            fill
            priority
            className="object-cover object-left"
            src="/images/auth-hero.webp"
            alt="Healthcare Services"
          />
        </div>
      </div>
    </div>
  );
}