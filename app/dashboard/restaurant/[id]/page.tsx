"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { getRestaurantById, RESTAURANT_PAGES } from "@/lib/restaurants";
import type { Dish } from "@/lib/restaurants";

const VEGAN_FORBIDDEN = ["poultry", "beef", "pork", "seafood", "dairy", "egg"] as const;
const VEGETARIAN_FORBIDDEN = ["poultry", "beef", "pork", "seafood"] as const;

type ProfileRow = {
  cannot_eat: string[];
  prefer_not: string[];
  likes: string[];
};

function dishStatus(
  dish: Dish,
  cannotEat: string[],
  preferNot: string[],
  likes: string[]
): "green" | "yellow" | "red" {
  let effectiveCannotEat = [...cannotEat];
  if (likes.includes("vegan")) {
    effectiveCannotEat = [...new Set([...effectiveCannotEat, ...VEGAN_FORBIDDEN])];
  } else if (likes.includes("vegetarian")) {
    effectiveCannotEat = [...new Set([...effectiveCannotEat, ...VEGETARIAN_FORBIDDEN])];
  }
  const hasCannotEat = effectiveCannotEat.some((t) => dish.tags.includes(t as typeof dish.tags[number]));
  const hasPreferNot = preferNot.some((t) => dish.tags.includes(t as typeof dish.tags[number]));
  if (hasCannotEat) return "red";
  if (hasPreferNot) return "yellow";
  return "green";
}

export default function RestaurantPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const restaurant = getRestaurantById(id);
  const pageInfo = id ? RESTAURANT_PAGES[id] : null;
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      supabase
        .from("profiles")
        .select("cannot_eat, prefer_not, likes")
        .eq("id", data.session.user.id)
        .single()
        .then(({ data: p }) => {
          if (p) setProfile({ cannot_eat: p.cannot_eat ?? [], prefer_not: p.prefer_not ?? [], likes: p.likes ?? [] });
        });
    });
  }, []);

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col max-w-md mx-auto p-6">
        <p className="text-zinc-600">Restaurant not found.</p>
        <Link href="/dashboard" className="mt-4 text-dc-orange font-semibold">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col max-w-md mx-auto pb-8">
      <header className="sticky top-0 z-10 bg-white border-b border-dc-gray-border px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 -ml-2 text-zinc-600"
          aria-label="Back"
        >
          ←
        </button>
        <h1 className="text-lg font-bold truncate">{restaurant.name}</h1>
      </header>

      <main className="px-6 pt-4 flex-1">
        <div className="rounded-2xl border border-dc-gray-border w-full aspect-[3/1] mb-4 overflow-hidden bg-dc-gray">
          {pageInfo?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pageInfo.image}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-dc-gray" />
          )}
        </div>
        <p className="text-sm text-zinc-500 mb-1">{restaurant.cuisine}</p>
        {pageInfo && (
          <>
            <p className="text-sm text-zinc-700 mb-4">{pageInfo.description}</p>
            <div className="rounded-2xl bg-dc-gray border border-dc-gray-border p-4 mb-6 space-y-2">
              <p className="text-sm">
                <span className="font-semibold text-zinc-700">Address</span>
                <br />
                <span className="text-zinc-600">{pageInfo.address}</span>
              </p>
              <p className="text-sm">
                <span className="font-semibold text-zinc-700">Hours</span>
                <br />
                <span className="text-zinc-600">{pageInfo.hours}</span>
              </p>
            </div>
          </>
        )}

        <h2 className="text-lg font-bold mb-3">Menu</h2>
        <ul className="space-y-2">
          {[...restaurant.dishes]
            .sort((a, b) => {
              const order = { green: 0, yellow: 1, red: 2 } as const;
              const statusA = profile
                ? dishStatus(a, profile.cannot_eat, profile.prefer_not, profile.likes)
                : "green";
              const statusB = profile
                ? dishStatus(b, profile.cannot_eat, profile.prefer_not, profile.likes)
                : "green";
              return order[statusA] - order[statusB];
            })
            .map((dish) => {
            const status = profile
              ? dishStatus(dish, profile.cannot_eat, profile.prefer_not, profile.likes)
              : "green";
            const statusStyles = {
              green: "bg-dc-green border-dc-green-border",
              yellow: "bg-[#fdf8c0] border-amber-300",
              red: "bg-red-50 border-red-200",
            };
            return (
              <li
                key={dish.name}
                className={`rounded-xl border px-4 py-3 flex justify-between items-center ${statusStyles[status]}`}
              >
                <span className="font-medium text-black">{dish.name}</span>
                <span className="text-xs text-zinc-500">
                  {dish.tags.slice(0, 3).join(", ")}
                  {dish.tags.length > 3 ? "…" : ""}
                </span>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
