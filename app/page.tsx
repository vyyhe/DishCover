"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAE570] flex flex-col items-center justify-center px-6 py-10 max-w-md mx-auto">
      {/* Logo and tagline */}
      <div className="flex flex-col items-center text-center mt-8">
        <div className="w-48 h-20 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/DishCover.svg" alt="DishCover" className="w-full h-full object-contain" />
        </div>
        <p className="mt-2 text-base font-normal text-white">
          Restaurants everyone can eat at!
        </p>
      </div>

      {/* Food illustration */}
      <div className="flex-1 flex items-center justify-center w-full max-w-sm my-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/welcome.svg" alt="" className="w-full h-auto object-contain" />
      </div>

      {/* Buttons */}
      <div className="w-full flex flex-col gap-4 pb-12">
        <Link
          href="/login?signup=1"
          className="w-full rounded-full bg-white border-2 border-white py-4 text-base font-semibold text-black text-center hover:bg-white/95 transition"
        >
          Sign Up
        </Link>
        <Link
          href="/login"
          className="w-full rounded-full bg-dc-yellow-welcome border-2 border-white py-4 text-base font-semibold text-black text-center hover:opacity-95 transition"
        >
          Log In
        </Link>
      </div>
    </div>
  );
}
