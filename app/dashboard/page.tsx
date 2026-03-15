"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { Tag } from "@/lib/tags";
import { SAMPLE_RESTAURANTS, RESTAURANT_PAGES } from "@/lib/restaurants";
import type { Dish, Restaurant } from "@/lib/restaurants";
import Link from "next/link";

type ProfileRow = {
  id: string;
  display_name: string;
  username?: string;
  cannot_eat: string[];
  prefer_not: string[];
  likes: string[];
};

type GroupRow = { id: string; name: string; owner_id: string };
//CHANGE HERE
//type FriendEdgeRow = { id: string; friend_user_id: string };
type FriendEdgeRow = {
  id: string;
  friend_user_id: string;
  display_name: string;
};

function uniq<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function statusFromCount(count: number): "green" | "yellow" | "red" {
  if (count > 5) return "green";
  if (count > 2) return "yellow";
  return "red";
}

function dishMatchesHard(dish: Dish, groupCannot: Tag[]): boolean {
  return groupCannot.every((forbidden) => !dish.tags.includes(forbidden));
}

function dishAvoidsPreferNot(dish: Dish, groupPreferNot: Tag[]): boolean {
  return groupPreferNot.every((softAvoid) => !dish.tags.includes(softAvoid));
}

function countLikes(dish: Dish, groupLikes: Tag[]): number {
  let score = 0;
  for (const t of groupLikes) if (dish.tags.includes(t)) score += 1;
  return score;
}

type Tab = "home" | "groups" | "profile";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("home");
  const [me, setMe] = useState<ProfileRow | null>(null);
  const [friendEdges, setFriendEdges] = useState<FriendEdgeRow[]>([]);
  const [groups, setGroups] = useState<GroupRow[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<ProfileRow[]>([]);
  const [addFriendUserId, setAddFriendUserId] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [groupMembersToAdd, setGroupMembersToAdd] = useState<{ user_id: string; display_name: string }[]>([]);
  const [groupMemberInput, setGroupMemberInput] = useState("");
  const [editGroupMemberInput, setEditGroupMemberInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "green" | "yellow" | "red">("all");
  const [groupMemberCounts, setGroupMemberCounts] = useState<Record<string, number>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inviteModalGroupId, setInviteModalGroupId] = useState<string | null>(null);
  const [inviteModalMembers, setInviteModalMembers] = useState<ProfileRow[]>([]);

  async function loadAll() {
    setError(null);
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      router.replace("/login");
      return;
    }
    const userId = sessionData.session.user.id;

    const meRes = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (meRes.error || !meRes.data) {
      router.replace("/onboarding");
      return;
    }
    const profile = meRes.data as ProfileRow & { username?: string };
    if (!profile.display_name?.trim() || !profile.username?.trim()) {
      router.replace("/onboarding");
      return;
    }
    setMe(profile);

    //CHANGE HERE
    // const edgesRes = await supabase.from("friend_edges").select("id,friend_user_id");
    // if (!edgesRes.error) setFriendEdges((edgesRes.data ?? []) as FriendEdgeRow[]);

const edgesRes = await supabase
  .from("friend_edges")
  .select(`
    id,
    friend_user_id,
    friend:profiles(display_name)
  `)
  .eq("owner_id", userId);

if (!edgesRes.error && edgesRes.data) {
  const edgesWithNames = edgesRes.data.map((e: any) => ({
    id: e.id,
    friend_user_id: e.friend_user_id,
    display_name: e.friend?.display_name ?? "Unknown",
  }));

  setFriendEdges(edgesWithNames);
}

//END CHANGE

    const groupsRes = await supabase.from("groups").select("id,name,owner_id").order("created_at", { ascending: false });
    if (!groupsRes.error && groupsRes.data) {
      setGroups(groupsRes.data as GroupRow[]);
      if (!selectedGroup && groupsRes.data[0]?.id) setSelectedGroup(groupsRes.data[0].id);
      const groupIds = groupsRes.data.map((g) => g.id);
      const { data: membersData } = await supabase
        .from("group_members")
        .select("group_id")
        .in("group_id", groupIds);
      const counts: Record<string, number> = {};
      for (const g of groupIds) counts[g] = 0;
      for (const m of membersData ?? []) {
        counts[m.group_id] = (counts[m.group_id] ?? 0) + 1;
      }
      setGroupMemberCounts(counts);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "groups" || t === "home" || t === "profile") setTab(t);
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      if (!selectedGroup) {
        setSelectedGroupMembers([]);
        return;
      }
      const membersRes = await supabase.from("group_members").select("group_id,user_id").eq("group_id", selectedGroup);
      if (membersRes.error) {
        setSelectedGroupMembers([]);
        return;
      }
      const memberIds = uniq((membersRes.data ?? []).map((m) => m.user_id));
      if (!memberIds.length) {
        setSelectedGroupMembers([]);
        return;
      }
      const profilesRes = await supabase.from("profiles").select("*").in("id", memberIds);
      if (profilesRes.error) {
        setSelectedGroupMembers([]);
        return;
      }
      setSelectedGroupMembers((profilesRes.data ?? []) as ProfileRow[]);
    }
    load();
  }, [selectedGroup]);

  useEffect(() => {
    async function load() {
      if (!inviteModalGroupId) {
        setInviteModalMembers([]);
        return;
      }
      const membersRes = await supabase
        .from("group_members")
        .select("user_id")
        .eq("group_id", inviteModalGroupId);
      if (membersRes.error || !membersRes.data?.length) {
        setInviteModalMembers([]);
        return;
      }
      const memberIds = uniq(membersRes.data.map((m) => m.user_id));
      const profilesRes = await supabase.from("profiles").select("*").in("id", memberIds);
      setInviteModalMembers((profilesRes.data ?? []) as ProfileRow[]);
    }
    load();
  }, [inviteModalGroupId]);

  const groupCannot = useMemo<Tag[]>(() => {
    const src = selectedGroupMembers.length ? selectedGroupMembers : me ? [me] : [];
    return uniq(src.flatMap((p) => (p.cannot_eat ?? []) as Tag[]));
  }, [me, selectedGroupMembers]);

  const groupPreferNot = useMemo<Tag[]>(() => {
    const src = selectedGroupMembers.length ? selectedGroupMembers : me ? [me] : [];
    return uniq(src.flatMap((p) => (p.prefer_not ?? []) as Tag[]));
  }, [me, selectedGroupMembers]);

  const groupLikes = useMemo<Tag[]>(() => {
    const src = selectedGroupMembers.length ? selectedGroupMembers : me ? [me] : [];
    return uniq(src.flatMap((p) => (p.likes ?? []) as Tag[]));
  }, [me, selectedGroupMembers]);

  const ranked = useMemo(() => {
    return SAMPLE_RESTAURANTS.map((r) => {
      const hardOk = r.dishes.filter((d) => dishMatchesHard(d, groupCannot));
      const hardOkAndSoftOk = hardOk.filter((d) => dishAvoidsPreferNot(d, groupPreferNot));
      const likeScore = hardOkAndSoftOk.reduce((sum, d) => sum + countLikes(d, groupLikes), 0);
      const hardCount = hardOk.length;
      const status = statusFromCount(hardCount);
      return { restaurant: r, hardCount, hardOk, hardOkAndSoftOk, likeScore, status };
    }).sort((a, b) => {
      const order = { green: 3, yellow: 2, red: 1 } as const;
      if (order[b.status] !== order[a.status]) return order[b.status] - order[a.status];
      if (b.hardCount !== a.hardCount) return b.hardCount - a.hardCount;
      return b.likeScore - a.likeScore;
    });
  }, [groupCannot, groupPreferNot, groupLikes]);

  const filteredRanked = useMemo(() => {
    if (filterStatus === "all") return ranked;
    return ranked.filter((r) => r.status === filterStatus);
  }, [ranked, filterStatus]);

  /* async function addFriend() {
    setBusy(true);
    setError(null);
    try {
      const { data } = await supabase.auth.getSession();
      const ownerId = data.session?.user.id;
      if (!ownerId) throw new Error("Not logged in");
      const friendUserId = addFriendUserId.trim();
      if (!friendUserId) throw new Error("Enter a friend user id (UUID)");
      const { error: insErr } = await supabase.from("friend_edges").insert({
        owner_id: ownerId,
        friend_user_id: friendUserId,
      });
      if (insErr) throw insErr;
      setAddFriendUserId("");
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  } */
  async function addFriend() {
  setBusy(true);
  setError(null);
  try {
    const { data } = await supabase.auth.getSession();
    const ownerId = data.session?.user.id;
    if (!ownerId) throw new Error("Not logged in");

    const friendEmail = addFriendUserId.trim().toLowerCase();

const { data: userData, error: userErr } = await supabase
  .from("profiles")
  .select("id")
  .ilike("email", friendEmail)
  .single();
    if (userErr || !userData) throw new Error("User not found");

    const friendUserId = userData.id;

    // Prevent adding self as friend
    if (friendUserId === ownerId) throw new Error("You cannot add yourself");

    // Check if the friendship already exists
    const { data: existing, error: existErr } = await supabase
      .from("friend_edges")
      .select("id")
      .eq("owner_id", ownerId)
      .eq("friend_user_id", friendUserId)
      .single();

    if (existing) throw new Error("This user is already your friend");

    // Insert friend edge
    const { error: insErr } = await supabase.from("friend_edges").insert({
      owner_id: ownerId,
      friend_user_id: friendUserId,
    });

    if (insErr) throw insErr;

    setAddFriendUserId("");
    await loadAll();
  } catch (err) {
    setError(err instanceof Error ? err.message : "Something went wrong");
  } finally {
    setBusy(false);
  }
}

  async function addGroupMember() {
    const contact = groupMemberInput.trim();
    if (!contact) return;
    setError(null);
    setBusy(true);
    try {
      const { data, error: rpcErr } = await supabase.rpc("lookup_user_for_group", { contact });
      if (rpcErr) throw rpcErr;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.user_id) {
        setError("No user found with that email or username.");
        return;
      }
      const { data: sessionData } = await supabase.auth.getSession();
      const myId = sessionData.session?.user.id;
      if (row.user_id === myId) {
        setError("You are already in the group.");
        return;
      }
      if (groupMembersToAdd.some((m) => m.user_id === row.user_id)) {
        setError("Already added.");
        return;
      }
      setGroupMembersToAdd((prev) => [...prev, { user_id: row.user_id, display_name: row.display_name }]);
      setGroupMemberInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not find user.");
    } finally {
      setBusy(false);
    }
  }

  async function addMemberToExistingGroup() {
    const targetGroupId = inviteModalGroupId ?? selectedGroup;
    if (!targetGroupId) return;
    const contact = editGroupMemberInput.trim();
    if (!contact) return;
    setError(null);
    setBusy(true);
    try {
      const { data, error: rpcErr } = await supabase.rpc("lookup_user_for_group", { contact });
      if (rpcErr) throw rpcErr;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.user_id) {
        setError("No user found with that email or username.");
        return;
      }
      const { data: sessionData } = await supabase.auth.getSession();
      const myId = sessionData.session?.user.id;
      if (row.user_id === myId) {
        setError("You are already in the group.");
        return;
      }
      const membersToCheck = inviteModalGroupId ? inviteModalMembers : selectedGroupMembers;
      if (membersToCheck.some((m) => m.id === row.user_id)) {
        setError("Already in the group.");
        return;
      }
      const { error: insertErr } = await supabase.from("group_members").insert({
        group_id: targetGroupId,
        user_id: row.user_id,
        added_by: myId,
      });
      if (insertErr) throw insertErr;
      setEditGroupMemberInput("");
      // Reload members
      const membersRes = await supabase.from("group_members").select("group_id,user_id").eq("group_id", targetGroupId);
      if (!membersRes.error && membersRes.data) {
        const memberIds = uniq(membersRes.data.map((m) => m.user_id));
        const profilesRes = await supabase.from("profiles").select("*").in("id", memberIds);
        if (!profilesRes.error && profilesRes.data) {
          const data = profilesRes.data as ProfileRow[];
          if (inviteModalGroupId) setInviteModalMembers(data);
          else setSelectedGroupMembers(data);
        }
        setGroupMemberCounts((prev) => ({ ...prev, [targetGroupId]: memberIds.length }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add member.");
    } finally {
      setBusy(false);
    }
  }

  async function removeMemberFromGroup(userId: string) {
    const targetGroupId = inviteModalGroupId ?? selectedGroup;
    if (!targetGroupId) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const myId = sessionData.session?.user.id;
    if (userId === myId) return; // Don't remove self
    setError(null);
    setBusy(true);
    try {
      const { error: delErr } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", targetGroupId)
        .eq("user_id", userId);
      if (delErr) throw delErr;
      if (inviteModalGroupId) {
        setInviteModalMembers((prev) => prev.filter((m) => m.id !== userId));
      } else {
        setSelectedGroupMembers((prev) => prev.filter((m) => m.id !== userId));
      }
      setGroupMemberCounts((prev) => ({
        ...prev,
        [targetGroupId]: (prev[targetGroupId] ?? 1) - 1,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove member.");
    } finally {
      setBusy(false);
    }
  }

  async function createGroup() {
    setBusy(true);
    setError(null);
    try {
      const { data } = await supabase.auth.getSession();
      const ownerId = data.session?.user.id;
      if (!ownerId) throw new Error("Not logged in");
      const name = newGroupName.trim();
      if (!name) throw new Error("Group name is required");
      const { data: group, error: groupErr } = await supabase
        .from("groups")
        .insert({ owner_id: ownerId, name })
        .select("id,name,owner_id")
        .single();
      if (groupErr) throw groupErr;
      const memberIds = uniq([ownerId, ...groupMembersToAdd.map((m) => m.user_id)]);
      await supabase.from("group_members").insert(
        memberIds.map((user_id) => ({ group_id: group.id, user_id, added_by: ownerId }))
      );
      setNewGroupName("");
      setGroupMembersToAdd([]);
      setSelectedGroup(group.id);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const displayName = me?.display_name?.trim() || "there";

  return (
    <div className="min-h-screen bg-white text-black flex flex-col max-w-md mx-auto pb-20">
      {error && (
        <div className="mx-4 mt-2 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {tab === "home" && (
        <>
          <header className="px-6 pt-8 pb-4">
            <h1 className="text-[32px] font-medium">Welcome, {displayName}!</h1>
          </header>

          {/* Groups - 2x2 */}
          <section className="px-6">
            <h2 className="text-lg font-bold mb-3">Groups</h2>
            <div className="grid grid-cols-2 gap-3">
              {groups.length ? (
                groups.slice(0, 4).map((g) => (
                  <Link
                    key={g.id}
                    href={`/dashboard/groups/${g.id}`}
                    className="rounded-2xl bg-[#EBF2CC]/50 px-4 py-2.5 text-left block"
                  >
                    <div className="font-semibold text-black text-sm">{g.name}</div>
                  </Link>
                ))
              ) : (
                <p className="col-span-2 text-sm text-zinc-500 py-4">No groups yet. Create one in the Groups tab.</p>
              )}
            </div>
          </section>

          {/* Recommended for You - fixed, does not change */}
          <section className="px-6 mt-6">
            <h2 className="text-lg font-bold mb-3">Recommended for You</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6">
              {ranked.slice(0, 6).map((row) => {
                const img = RESTAURANT_PAGES[row.restaurant.id]?.image;
                return (
                  <Link
                    key={row.restaurant.id}
                    href={`/dashboard/restaurant/${row.restaurant.id}`}
                    className="flex-shrink-0 w-[180px] rounded-2xl bg-white overflow-hidden block"
                  >
                    <div className="aspect-[4/3] bg-white relative overflow-hidden rounded-b-2xl">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                      {/* status dot removed */}
                    
                    </div>
                    <div className="bg-white p-3 flex items-start justify-between gap-1">
                      <div>
                        <div className="font-semibold text-sm text-black">{row.restaurant.name}</div>
                        <div className="text-xs text-zinc-500">{row.restaurant.cuisine}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Filter By - same card layout, content changes with filter */}
          <section className="px-6 mt-6">
            <h2 className="text-lg font-bold mb-3">Filter By...</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {(["all", "green", "yellow", "red"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilterStatus(f)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    filterStatus === f
                      ? "bg-[#D4E298]/50 border-2 border-[#D4E298] border-opacity-100 text-black"
                      : "bg-white text-black border-2 border-[#E5E7EB] border-opacity-100"
                  }`}
                >
                  {f === "all" ? "All" : f === "green" ? "Great match" : f === "yellow" ? "Okay" : "Poor match"}
                </button>
              ))}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6">
              {filteredRanked.map((row) => {
                const img = RESTAURANT_PAGES[row.restaurant.id]?.image;
                return (
                  <Link
                    key={row.restaurant.id}
                    href={`/dashboard/restaurant/${row.restaurant.id}`}
                    className="flex-shrink-0 w-[180px] rounded-2xl bg-white overflow-hidden block"
                  >
                    <div className="aspect-[4/3] bg-white relative overflow-hidden rounded-b-2xl">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                      {/* status dot removed */}
                    </div>
                    <div className="bg-white p-3 flex items-start justify-between gap-1">
                      <div>
                        <div className="font-semibold text-sm text-black">{row.restaurant.name}</div>
                        <div className="text-xs text-zinc-500">{row.restaurant.cuisine}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      )}

      {tab === "groups" && (
        <div className="px-4 pt-6 flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Groups</h2>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="w-10 h-10 rounded-full bg-dc-gray border border-dc-gray-border flex items-center justify-center text-zinc-600 hover:bg-dc-gray-border transition"
              aria-label="Add group"
            >
              <span className="text-xl leading-none">+</span>
            </button>
          </div>
          {groups.length ? (
            <div className="space-y-4">
              {groups.map((g) => {
                const count = groupMemberCounts[g.id] ?? 0;
                const displayCount = Math.min(4, count);
                const moreCount = Math.max(0, count - 4);
                return (
                  <div
                    key={g.id}
                    className="rounded-2xl bg-[#EBF2CC]/50 p-4 shadow-sm"
                  >
                    <div className="font-bold text-black mb-3">{g.name}</div>
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: displayCount }).map((_, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full overflow-hidden border border-dc-gray-border flex-shrink-0"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/noprofile.png" alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {moreCount > 0 && (
                        <span className="text-sm text-zinc-600">+ {moreCount} More</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setInviteModalGroupId(g.id);
                          setEditGroupMemberInput("");
                          setError(null);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white border border-white py-3 text-sm font-medium text-black hover:bg-dc-gray transition"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/invite-friends.png" alt="" className="w-4 h-4 object-contain" />
                        Invite
                      </button>
                      <Link
                        href={`/dashboard/groups/${g.id}`}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#FAE570] py-3 text-sm font-medium text-black hover:opacity-95 transition"
                      >
                        Find Restaurants
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No groups yet. Tap + to create one.</p>
          )}

          {/* Create group modal */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={() => setShowCreateModal(false)}>
              <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Create group</h3>
                  <button type="button" onClick={() => setShowCreateModal(false)} className="p-2 text-zinc-500">×</button>
                </div>
                <input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Group name"
                  className="w-full rounded-xl border border-dc-gray-border bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-dc-green-border mb-3"
                />
                <div className="text-sm font-medium text-zinc-600 mb-2">Add members by email or username</div>
                <div className="flex gap-2 mb-3">
                  <input
                    value={groupMemberInput}
                    onChange={(e) => setGroupMemberInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addGroupMember()}
                    placeholder="Email or username"
                    className="flex-1 rounded-xl border border-dc-gray-border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-dc-green-border"
                  />
                  <button
                    type="button"
                    onClick={addGroupMember}
                    disabled={busy || !groupMemberInput.trim()}
                    className="rounded-full bg-dc-yellow px-4 py-3 font-semibold text-black disabled:opacity-50 shrink-0"
                  >
                    Add
                  </button>
                </div>
                {groupMembersToAdd.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {groupMembersToAdd.map((m) => (
                      <span
                        key={m.user_id}
                        className="inline-flex items-center gap-2 rounded-full bg-dc-green border border-dc-green-border pl-1 pr-3 py-1.5 text-sm"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/noprofile.png" alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                        {m.display_name || "Unknown"}
                        <button
                          type="button"
                          onClick={() => setGroupMembersToAdd((prev) => prev.filter((x) => x.user_id !== m.user_id))}
                          className="ml-1 text-zinc-600 hover:text-black"
                          aria-label="Remove"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    await createGroup();
                    setShowCreateModal(false);
                  }}
                  disabled={busy}
                  className="w-full rounded-full bg-dc-yellow py-3 font-semibold text-black disabled:opacity-50"
                >
                  Create group
                </button>
              </div>
            </div>
          )}

          {/* Invite (edit members) modal */}
          {inviteModalGroupId && groups.find((g) => g.id === inviteModalGroupId) && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={() => setInviteModalGroupId(null)}>
              <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Invite to {groups.find((g) => g.id === inviteModalGroupId)?.name}</h3>
                  <button type="button" onClick={() => setInviteModalGroupId(null)} className="p-2 text-zinc-500">×</button>
                </div>
                <div className="flex gap-2 mb-3">
                  <input
                    value={editGroupMemberInput}
                    onChange={(e) => setEditGroupMemberInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addMemberToExistingGroup()}
                    placeholder="Email or username to add"
                    className="flex-1 rounded-xl border border-dc-gray-border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-dc-green-border"
                  />
                  <button
                    type="button"
                    onClick={addMemberToExistingGroup}
                    disabled={busy || !editGroupMemberInput.trim()}
                    className="rounded-full bg-dc-yellow px-4 py-3 font-semibold text-black disabled:opacity-50 shrink-0"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {inviteModalMembers.map((m) => {
                    const isMe = me?.id === m.id;
                    return (
                      <span
                        key={m.id}
                        className="inline-flex items-center gap-2 rounded-full bg-dc-gray border border-dc-gray-border pl-1 pr-3 py-1.5 text-sm"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/noprofile.png" alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                        {m.display_name || "Unknown"}
                        {isMe && <span className="text-xs text-zinc-500">(you)</span>}
                        {!isMe && (
                          <button
                            type="button"
                            onClick={() => removeMemberFromGroup(m.id)}
                            disabled={busy}
                            className="ml-1 text-zinc-600 hover:text-red-600 disabled:opacity-50"
                            aria-label="Remove from group"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "profile" && (
        <div className="px-6 pt-6 flex-1">
          <h2 className="text-xl font-bold mb-4">Profile</h2>
          <div className="flex items-center gap-3 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/noprofile.png" alt="" className="w-12 h-12 rounded-full object-cover border border-dc-gray-border" />
            <p className="text-sm text-zinc-600">Logged in as {me?.display_name || me?.id || "…"}</p>
          </div>
          <div className="space-y-6">
            <section className="rounded-2xl bg-dc-gray border border-dc-gray-border p-4">
              <h3 className="font-semibold text-black mb-2">Edit preferences</h3>
              <p className="text-sm text-zinc-600 mb-3">
                Update your dietary preferences, allergies, and food likes.
              </p>
              <button
                type="button"
                onClick={() => router.push("/onboarding?preferences=1")}
                className="w-full rounded-full bg-dc-yellow py-3 font-semibold text-black"
              >
                Edit preferences
              </button>
            </section>
            <div className="rounded-2xl bg-dc-gray border border-dc-gray-border p-4">
              <div className="font-semibold mb-2">Add friend (by user email)</div>
              <div className="flex gap-2">
                <input
                  value={addFriendUserId}
                  onChange={(e) => setAddFriendUserId(e.target.value)}
                  placeholder="Friend user email"
                  className="flex-1 rounded-xl border border-dc-gray-border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-dc-green-border"
                />
                <button
                  type="button"
                  onClick={addFriend}
                  disabled={busy}
                  className="rounded-full bg-dc-yellow px-4 py-3 font-semibold text-black disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              <div className="mt-3 text-sm text-zinc-600">
{/*                 CHANGE HERE

                Your friends: {friendEdges.length ? friendEdges.map((e) => e.friend_user_id.slice(0, 8)).join(", ") + "…" : "None yet."} */}
                Your friends: {friendEdges.length
  ? friendEdges.map((e) => e.display_name).join(", ")
  : "None yet."}
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                router.replace("/");
              }}
              className="w-full rounded-full bg-dc-yellow py-3 font-semibold text-black"
            >
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-dc-gray border-t border-dc-gray-border flex justify-around items-center py-2 safe-area-pb">
        {(
          [
            { id: "home" as Tab, label: "Home" },
            { id: "groups" as Tab, label: "Groups" },
            { id: "profile" as Tab, label: "Profile" },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id);
              router.replace(id === "home" ? "/dashboard" : `/dashboard?tab=${id}`);
            }}
            className={`flex flex-col items-center gap-0.5 py-2 px-4 rounded-xl transition ${
              tab === id ? "font-semibold text-black" : "text-zinc-500"
            }`}
          >
            <span className="inline-flex items-center justify-center w-6 h-6 [&_svg]:w-full [&_svg]:h-full shrink-0">
              {id === "home" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3L2 12h3v9h6v-6h2v6h6v-9h3L12 3z" />
                </svg>
              ) : id === "groups" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="6" cy="7" r="2.5" />
                  <path d="M1 20c0-2.5 2-4 5-4s5 1.5 5 4" />
                  <circle cx="18" cy="7" r="2.5" />
                  <path d="M13 20c0-2.5 2-4 5-4s5 1.5 5 4" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              )}
            </span>
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-zinc-500">Loading…</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
