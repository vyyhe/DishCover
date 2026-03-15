"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { TAG_OPTIONS } from "@/lib/tags";
import type { Tag } from "@/lib/tags";

const STEP_CONFIG: {
  key: "diets" | "allergies" | "intolerances";
  title: string;
  description: string;
  descriptionJsx?: React.ReactNode;
  options: { tag: Tag | "none"; label: string; image?: string; target?: "likes" | "prefer_not" | "none" }[];
  target: "likes" | "cannot_eat" | "prefer_not";
}[] = [
  {
    key: "diets",
    title: "Dietary Preferences",
    description:
      "Select any diets you follow so we can recommend restaurants that fit your lifestyle.",
    descriptionJsx: (
      <>
        Select any <strong>diets</strong> you follow so we can recommend restaurants that fit your <strong>lifestyle</strong>.
      </>
    ),
    target: "likes",
    options: [
      { tag: "vegetarian", label: "Vegetarian", image: "/vegetarian.svg" },
      { tag: "vegan", label: "Vegan", image: "/vegan.svg" },
      { tag: "seafood", label: "Pescatarian", image: "/pescatarian.svg" },
      { tag: "pork", label: "Pork-Free", image: "/porkfree.svg", target: "prefer_not" },
      { tag: "none", label: "None, I eat anything!", image: "/none.svg", target: "none" },
    ],
  },
  {
    key: "allergies",
    title: "Allergies",
    description:
      "Select any foods that you cannot eat you have so we can help you avoid triggering a reaction.",
    target: "cannot_eat",
    options: [
      { tag: "nuts", label: "Nuts" },
      { tag: "seafood", label: "Seafood" },
      { tag: "egg", label: "Egg" },
    ],
  },
  {
    key: "intolerances",
    title: "Intolerances",
    description:
      "Tell us about any food intolerances so we can suggest meals that are easier for you to digest.",
    target: "cannot_eat",
    options: [
      { tag: "gluten", label: "Gluten", image: "/gluten intolerance.svg" },
      { tag: "dairy", label: "Lactose", image: "/lactose intolerance.png" },
    ],
  },
];

function toggleTag(list: Tag[], tag: Tag): Tag[] {
  return list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag];
}

function getTagLabel(tag: Tag | "none") {
  if (tag === "none") return "None, I eat anything!";
  return TAG_OPTIONS.find((t) => t.tag === tag)?.label ?? tag;
}

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditPreferences = searchParams.get("preferences") === "1";
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (isEditPreferences) setStepIndex(1);
  }, [isEditPreferences]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [likes, setLikes] = useState<Tag[]>([]);
  const [cannotEat, setCannotEat] = useState<Tag[]>([]);
  const [preferNot, setPreferNot] = useState<Tag[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dietStepTouched, setDietStepTouched] = useState(false);
  const [noneDietSelected, setNoneDietSelected] = useState(false);
  const [allergySearch, setAllergySearch] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
        return;
      }
      // Load existing profile so user doesn't have to re-enter preferences
      const userId = data.session.user.id;
      supabase
        .from("profiles")
        .select("display_name, username, cannot_eat, prefer_not, likes")
        .eq("id", userId)
        .single()
        .then(({ data: profile }) => {
          if (profile) {
            const parts = (profile.display_name || "").trim().split(/\s+/);
            setFirstName(parts[0] || "");
            setLastName(parts.slice(1).join(" ") || "");
            setUsername((profile.username as string) || "");
            setCannotEat((profile.cannot_eat || []) as Tag[]);
            setPreferNot((profile.prefer_not || []) as Tag[]);
            const likesData = (profile.likes || []) as Tag[];
            setLikes(likesData);
            setNoneDietSelected((profile.likes || []).length === 0 && !((profile.prefer_not || []).includes("pork")));
            if (likesData.length > 0 || (profile.prefer_not ?? []).includes("pork")) {
              setDietStepTouched(true);
            }
          }
        });
    });
  }, [router]);

  const isNameStep = stepIndex === 0;
  const step = isNameStep ? null : STEP_CONFIG[stepIndex - 1];
  const isLastStep = stepIndex === STEP_CONFIG.length;

  function getSelectedForStep(): Tag[] {
    if (!step) return [];
    if (step.target === "likes") return likes;
    if (step.target === "cannot_eat") return cannotEat;
    return preferNot;
  }

  function setSelectedForStep(next: Tag[]) {
    if (!step) return;
    if (step.target === "likes") setLikes(next);
    else if (step.target === "cannot_eat") setCannotEat(next);
    else setPreferNot(next);
  }

  function toggleOption(opt: { tag: Tag | "none"; target?: "likes" | "prefer_not" | "none" }) {
    setDietStepTouched(true);
    if (opt.target === "none" || opt.tag === "none") {
      setLikes([]);
      setPreferNot((prev) => prev.filter((t) => t !== "pork"));
      setNoneDietSelected(true);
      return;
    }
    setNoneDietSelected(false);
    if (opt.target === "prefer_not") {
      setPreferNot(toggleTag(preferNot, opt.tag as Tag));
      return;
    }
    setSelectedForStep(toggleTag(getSelectedForStep(), opt.tag as Tag));
  }

  function isOptionSelected(opt: { tag: Tag | "none"; target?: "likes" | "prefer_not" | "none" }): boolean {
    if (opt.target === "none" || opt.tag === "none") {
      return noneDietSelected;
    }
    if (opt.target === "prefer_not") {
      return preferNot.includes(opt.tag as Tag);
    }
    return getSelectedForStep().includes(opt.tag as Tag);
  }

  function skip() {
    if (isNameStep) return; // No skip on name step
    if (isLastStep) saveAndGo();
    else setStepIndex((i) => i + 1);
  }

  async function saveAndGo() {
    setBusy(true);
    setError(null);
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error("Not logged in");

      const u = username.trim().toLowerCase();
      if (!u) throw new Error("Username is required.");

      const { data: available } = await supabase.rpc("check_username_available", { uname: u });
      if (!available) throw new Error("Username is already taken. Please choose a different one.");

      const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const payload = {
        id: user.id,
        display_name: displayName,
        username: u,
        cannot_eat: cannotEat,
        prefer_not: preferNot,
        likes,
      };

      const { error: upsertErr } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "id" });
      if (upsertErr) {
        if (upsertErr.code === "23505") throw new Error("Username is already taken. Please choose a different one.");
        throw upsertErr;
      }

      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function continueToNext() {
    if (isNameStep) {
      const f = firstName.trim();
      const l = lastName.trim();
      const u = username.trim();
      if (!f || !l) {
        setError("First name and last name are required.");
        return;
      }
      if (!u) {
        setError("Username is required.");
        return;
      }

      setBusy(true);
      setError(null);
      try {
        const { data: available } = await supabase.rpc("check_username_available", { uname: u.toLowerCase() });
        if (!available) {
          setError("Username is already taken. Please choose a different one.");
          return;
        }
        setStepIndex(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      } finally {
        setBusy(false);
      }
      return;
    }
    if (isLastStep) saveAndGo();
    else setStepIndex((i) => i + 1);
  }

  if (!isNameStep && !step) return null;

  return (
    <div className="min-h-screen bg-white text-black flex flex-col max-w-md mx-auto">
      {/* Header: Back */}
      <div className="flex items-center px-4 pt-6 pb-2">
        <button
          type="button"
          onClick={() => {
            if (isNameStep) router.replace("/login");
            else if (isEditPreferences && stepIndex === 1) router.replace("/dashboard?tab=profile");
            else setStepIndex((i) => i - 1);
          }}
          className="text-black text-xl leading-none py-2"
          aria-label="Back"
        >
          ←
        </button>
      </div>

      <div className="flex-1 px-6 pb-8">
        {isNameStep ? (
          <>
            <h1 className="text-2xl font-bold text-black">Create your profile</h1>
            <p className="mt-1 text-sm text-zinc-600 leading-snug">
              Tell us a bit about yourself so others can find you.
            </p>
            <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">
                First name <span className="text-red-500">*</span>
              </span>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-dc-gray-border bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-dc-green-border"
                placeholder="e.g. Evie"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">
                Last name <span className="text-red-500">*</span>
              </span>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-dc-gray-border bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-dc-green-border"
                placeholder="e.g. Smith"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">
                Username <span className="text-red-500">*</span>
              </span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full rounded-xl border border-dc-gray-border bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-dc-green-border"
                placeholder="e.g. eviesmith"
                required
              />
              <span className="text-xs text-zinc-500 mt-1 block">Must be unique. Others can add you to groups by this username.</span>
            </label>
          </div>
          </>
        ) : (
          <>
        <h1 className="text-4xl font-bold text-black">{step!.title}</h1>
        <p className="mt-2 text-base text-zinc-700 leading-snug">{step!.descriptionJsx ?? step!.description}</p>
        <div className="mt-6" />
        {/* Grid of selectable options */}
        {step!.key === "diets" ? (
          <div className="mt-2 flex flex-col items-center gap-4">
            {/* Vegetarian + Vegan row */}
            <div className="flex gap-2 justify-center">
              {step!.options.slice(0, 2).map((opt) => {
                const selected = isOptionSelected(opt);
                const hasImage = "image" in opt && opt.image;
                return (
                  <button
                    key={opt.tag}
                    type="button"
                    onClick={() => toggleOption(opt)}
                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 px-4 py-4 text-sm font-medium transition min-h-[120px] w-[150px] ${
                      selected ? "bg-[#D4E298]/50 border-[#D4E298] text-black" : "bg-white border-dc-gray-border text-zinc-700"
                    }`}
                  >
                    {hasImage && (
                      <div className="w-12 h-12 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={opt.image} alt="" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <span className="text-center">{opt.label}</span>
                  </button>
                );
              })}
            </div>
            {/* Pescatarian + Pork-Free row */}
            <div className="flex gap-2 justify-center">
              {step!.options.slice(2, 4).map((opt) => {
                const selected = isOptionSelected(opt);
                const hasImage = "image" in opt && opt.image;
                return (
                  <button
                    key={opt.tag}
                    type="button"
                    onClick={() => toggleOption(opt)}
                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 px-4 py-4 text-sm font-medium transition min-h-[120px] w-[150px] ${
                      selected ? "bg-[#D4E298]/50 border-[#D4E298] text-black" : "bg-white border-dc-gray-border text-zinc-700"
                    }`}
                  >
                    {hasImage && (
                      <div className="w-12 h-12 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={opt.image} alt="" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <span className="text-center">{opt.label}</span>
                  </button>
                );
              })}
            </div>
            {/* None row */}
            {step!.options.slice(4, 5).map((opt) => {
              const selected = isOptionSelected(opt);
              const hasImage = "image" in opt && opt.image;
              return (
                <button
                  key={opt.tag}
                  type="button"
                  onClick={() => toggleOption(opt)}
                  className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 px-4 py-4 text-sm font-medium transition min-h-[120px] w-[150px] ${
                    selected ? "bg-[#D4E298]/50 border-[#D4E298] text-black" : "bg-white border-dc-gray-border text-zinc-700"
                  }`}
                >
                  {hasImage && (
                    <div className="w-12 h-12 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={opt.image} alt="" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <span className="text-center">{opt.label}</span>
                </button>
              );
            })}
          </div>
        ) : step!.key === "allergies" ? (
          <>
            <p className="mt-1 text-sm text-zinc-700">Choose all that apply. You can update these at any time.</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "Eggs",
                "Gluten",
                "Seeds",
                "Milk & Dairy",
                "Sesame",
                "Nuts",
                "Shellfish",
                "Soy",
              ].map((label) => {
                const normalized = label.toLowerCase().replace(/\s+&\s+|\s+/g, "-") as Tag;
                const selected = cannotEat.includes(normalized as Tag);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setCannotEat(toggleTag(cannotEat, normalized))}
                    className={`rounded-full border px-4 py-2 text-sm font-medium ${
                      selected ? "bg-[#D4E298]/50 border-[#D4E298] text-black" : "bg-white border-zinc-200 text-zinc-800"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <p className="mt-5 text-sm text-zinc-700">Don’t see your allergy? Search to add manually.</p>
            <div className="mt-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 flex items-center gap-2">
              <span className="text-zinc-400 text-xl">🔍</span>
              <input
                value={allergySearch}
                onChange={(e) => setAllergySearch(e.target.value)}
                placeholder="Search"
                className="w-full border-none bg-transparent text-sm font-medium outline-none"
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {cannotEat.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setCannotEat((prev) => prev.filter((t) => t !== tag))}
                  className="flex items-center gap-2 rounded-full bg-[#D4E298]/50 border border-[#D4E298] px-3 py-2 text-sm font-semibold text-black"
                >
                  <span className="text-lg">×</span>
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          </>
        ) : step!.key === "intolerances" ? (
          <>
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="flex gap-2 justify-center">
                {step!.options.slice(0, 2).map((opt) => {
                  const selected = getSelectedForStep().includes(opt.tag as Tag);
                  const hasImage = "image" in opt && opt.image;
                  return (
                    <button
                      key={opt.tag}
                      type="button"
                      onClick={() => setSelectedForStep(toggleTag(getSelectedForStep(), opt.tag as Tag))}
                      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 px-4 py-4 text-sm font-medium transition min-h-[120px] w-[150px] ${
                        selected ? "bg-[#D4E298]/50 border-[#D4E298] text-black" : "bg-white border-zinc-200 text-zinc-700"
                      }`}
                    >
                      {hasImage && (
                        <div className={`w-12 h-12 flex-shrink-0 ${opt.tag === "gluten" ? "scale-110" : ""}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={opt.image} alt={opt.label} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <span className="text-center">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-1">
              {step!.options.map((opt) => {
                const selected = getSelectedForStep().includes(opt.tag as Tag);
                const hasImage = "image" in opt && opt.image;
                return (
                  <button
                    key={opt.tag}
                    type="button"
                    onClick={() => setSelectedForStep(toggleTag(getSelectedForStep(), opt.tag as Tag))}
                    className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 px-4 py-4 text-sm font-medium transition min-h-[130px] ${
                      selected ? "bg-[#D4E298]/50 border-[#D4E298] text-black" : "bg-white border-zinc-200 text-zinc-700"
                    }`}
                  >
                    {hasImage && (
                      <div className="w-16 h-16 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={opt.image}
                          alt={opt.label}
                          className={`w-full h-full object-contain ${opt.tag === "gluten" ? "scale-110" : ""}`}
                        />
                      </div>
                    )}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
          </>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Bottom: Continue */}
      <div className="px-6 pb-10 pt-4">
        <button
          type="button"
          onClick={continueToNext}
          disabled={busy}
          className="w-full rounded-full bg-dc-yellow hover:bg-dc-yellow-dark py-4 text-base font-semibold text-black disabled:opacity-50 transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
