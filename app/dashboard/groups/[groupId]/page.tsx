"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { RESTAURANT_PAGES } from "@/lib/restaurants";
import { rankRestaurantsForGroup } from "@/lib/ranking";

type ProfileRow = {
  id: string;
  display_name: string;
  cannot_eat: string[];
  prefer_not: string[];
  likes: string[];
};

export default function GroupRestaurantsPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = typeof params.groupId === "string" ? params.groupId : "";
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "green" | "yellow" | "red">("all");

  useEffect(() => {
    async function load() {
      if (!groupId) {
        setLoading(false);
        return;
      }
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/login");
        return;
      }
      const { data: group } = await supabase
        .from("groups")
        .select("id,name,owner_id")
        .eq("id", groupId)
        .single();
      if (!group || group.owner_id !== sessionData.session.user.id) {
        router.replace("/dashboard");
        return;
      }
      setGroupName(group.name);
      const { data: membersData } = await supabase
        .from("group_members")
        .select("user_id")
        .eq("group_id", groupId);
      const memberIds = [...new Set((membersData ?? []).map((m) => m.user_id))];
      if (memberIds.length) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", memberIds);
        setMembers((profiles ?? []) as ProfileRow[]);
      } else {
        setMembers([]);
      }
      setLoading(false);
    }
    load();
  }, [groupId, router]);

  const ranked = useMemo(() => rankRestaurantsForGroup(members), [members]);
  const filteredRanked = useMemo(() => {
    if (filterStatus === "all") return ranked;
    return ranked.filter((r) => r.status === filterStatus);
  }, [ranked, filterStatus]);

  const statusDotColor = (status: "green" | "yellow" | "red") => {
    if (status === "green") return "bg-dc-green border-dc-green-border";
    if (status === "yellow") return "bg-dc-orange border-dc-gray-border";
    return "bg-red-400 border-red-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-zinc-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col max-w-md mx-auto pb-20">
      <header className="sticky top-0 z-10 bg-white border-b border-dc-gray-border px-4 py-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard?tab=groups")}
          className="p-2 -ml-2 text-zinc-600"
          aria-label="Back"
        >
          ←
        </button>
        <h1 className="text-xl font-bold mt-2">Recommended Restaurants</h1>
      </header>

      <main className="px-4 pt-4 flex-1">
        <div className="flex flex-wrap gap-2 mb-4">
          {(["all", "green", "yellow", "red"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilterStatus(f)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                filterStatus === f
                  ? "bg-dc-orange text-black"
                  : "bg-dc-gray text-zinc-600 border border-dc-gray-border"
              }`}
            >
              {f === "all" ? "All" : f === "green" ? "Great match" : f === "yellow" ? "Okay" : "Poor match"}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredRanked.map((row) => {
            const img = RESTAURANT_PAGES[row.restaurant.id]?.image;
            return (
              <Link
                key={row.restaurant.id}
                href={`/dashboard/restaurant/${row.restaurant.id}`}
                className="block rounded-2xl bg-white overflow-hidden shadow-sm"
              >
                <div className="aspect-[16/9] bg-white relative overflow-hidden rounded-b-2xl">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                  <span
                    className={`absolute top-2 right-2 w-5 h-5 rounded-full border ${statusDotColor(row.status)}`}
                  />
                </div>
                <div className="bg-white p-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-sm text-zinc-600 mb-1">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusDotColor(row.status)}`} />
                      {row.hardCount} dishes for everyone
                    </p>
                    <p className="font-bold text-black">{row.restaurant.name}</p>
                    <p className="text-sm text-zinc-500">{row.restaurant.cuisine}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
