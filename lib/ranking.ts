import type { Tag } from "@/lib/tags";
import { SAMPLE_RESTAURANTS } from "@/lib/restaurants";
import type { Dish, Restaurant } from "@/lib/restaurants";

export type ProfileLike = {
  cannot_eat?: string[];
  prefer_not?: string[];
  likes?: string[];
};

function uniq<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export function statusFromCount(count: number): "green" | "yellow" | "red" {
  if (count > 5) return "green";
  if (count >= 1) return "yellow";
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

export function rankRestaurantsForGroup(members: ProfileLike[]) {
  const groupCannot = uniq(members.flatMap((p) => (p.cannot_eat ?? []) as Tag[]));
  const groupPreferNot = uniq(members.flatMap((p) => (p.prefer_not ?? []) as Tag[]));
  const groupLikes = uniq(members.flatMap((p) => (p.likes ?? []) as Tag[]));

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
}
