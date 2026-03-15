export type Tag =
  | "vegan"
  | "vegetarian"
  | "gluten"
  | "gluten-free"
  | "dairy"
  | "dairy-free"
  | "nuts"
  | "seafood"
  | "egg"
  | "halal"
  | "pork"
  | "beef"
  | "poultry"
  | "spicy";

export const TAG_OPTIONS: { tag: Tag; label: string }[] = [
  { tag: "vegan", label: "Vegan" },
  { tag: "vegetarian", label: "Vegetarian" },
  { tag: "halal", label: "Halal" },
  { tag: "gluten-free", label: "Gluten-free" },
  { tag: "dairy-free", label: "Dairy-free" },
  { tag: "nuts", label: "Nuts" },
  { tag: "seafood", label: "Seafood" },
  { tag: "egg", label: "Egg" },
  { tag: "pork", label: "Pork" },
  { tag: "beef", label: "Beef" },
  { tag: "poultry", label: "Poultry" },
  { tag: "spicy", label: "Spicy" },
  { tag: "gluten", label: "Contains gluten" },
  { tag: "dairy", label: "Contains dairy" },
];

