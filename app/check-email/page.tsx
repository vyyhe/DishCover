"use client";

import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col max-w-md mx-auto px-6">
      <div className="flex-1 flex flex-col justify-center py-12">
        <h1 className="text-2xl font-bold text-center mb-4">
          We have sent you an email to confirm your account
        </h1>
        <p className="text-zinc-600 text-center">
          Please check your inbox and click the confirmation link to complete your
          sign up. You can then log in and continue.
        </p>
      </div>
      <div className="pb-12">
        <Link
          href="/login"
          className="block w-full rounded-full bg-dc-yellow hover:bg-dc-yellow-dark py-4 text-center text-base font-semibold text-black"
        >
          Back to Log in
        </Link>
      </div>
    </div>
  );
}
