import type { Tag } from "@/lib/tags";

export type Dish = { name: string; tags: Tag[] };
export type Restaurant = { id: string; name: string; cuisine: string; dishes: Dish[] };

export const SAMPLE_RESTAURANTS: Restaurant[] = [
  {
    id: "ramen-yard",
    name: "Ramen Yard",
    cuisine: "Japanese",
    dishes: [
      { name: "Shoyu Ramen", tags: ["gluten", "egg"] },
      { name: "Miso Ramen", tags: ["gluten", "egg"] },
      { name: "Spicy Tantanmen", tags: ["gluten", "egg", "spicy", "nuts"] },
      { name: "Edamame", tags: ["vegan", "gluten-free", "dairy-free"] },
      { name: "Gyoza", tags: ["gluten", "pork"] },
      { name: "Tofu Salad", tags: ["vegan", "gluten-free", "dairy-free"] },
      { name: "Seaweed Salad", tags: ["vegan", "gluten-free", "dairy-free"] },
    ],
  },
  {
    id: "mezze-street",
    name: "Mezze Street",
    cuisine: "Middle Eastern",
    dishes: [
      { name: "Falafel Plate", tags: ["vegan", "dairy-free"] },
      { name: "Hummus & Pita", tags: ["vegan", "gluten"] },
      { name: "Tabbouleh", tags: ["vegan", "gluten-free", "dairy-free"] },
      { name: "Shawarma (Chicken)", tags: ["halal", "dairy-free", "poultry"] },
      { name: "Shawarma (Beef)", tags: ["halal", "beef", "dairy-free"] },
      { name: "Baklava", tags: ["nuts", "dairy", "gluten", "egg"] },
      { name: "Stuffed Vine Leaves", tags: ["vegan", "gluten-free", "dairy-free"] },
    ],
  },
  {
    id: "green-bowl",
    name: "Green Bowl",
    cuisine: "Healthy",
    dishes: [
      { name: "Vegan Burrito Bowl", tags: ["vegan", "gluten-free", "dairy-free"] },
      { name: "Pesto Pasta", tags: ["vegetarian", "gluten", "dairy", "nuts"] },
      { name: "Tofu Stir-fry", tags: ["vegan", "gluten-free", "dairy-free"] },
      { name: "Grilled Salmon Salad", tags: ["seafood", "gluten-free", "dairy-free"] },
      { name: "Caesar Salad", tags: ["egg", "dairy", "gluten"] },
      { name: "Chia Pudding", tags: ["vegan", "gluten-free", "dairy-free"] },
      { name: "Roasted Veg Plate", tags: ["vegan", "gluten-free", "dairy-free"] },
      { name: "Spicy Lentil Soup", tags: ["vegan", "gluten-free", "dairy-free", "spicy"] },
    ],
  },
  {
    id: "bbq-den",
    name: "BBQ Den",
    cuisine: "American BBQ",
    dishes: [
      { name: "Pulled Pork Sandwich", tags: ["pork", "gluten"] },
      { name: "Brisket Plate", tags: ["beef", "gluten-free", "dairy-free"] },
      { name: "Mac & Cheese", tags: ["dairy", "gluten"] },
      { name: "Cornbread", tags: ["gluten", "dairy"] },
      { name: "Coleslaw", tags: ["dairy-free", "gluten-free", "vegan"] },
      { name: "Smoked Wings (Spicy)", tags: ["spicy", "gluten-free", "dairy-free", "poultry"] },
    ],
  },
  {
    id: "the-pasta-bar",
    name: "The Pasta Bar",
    cuisine: "Italian",
    dishes: [
      { name: "Spaghetti Bolognese", tags: ["beef", "gluten"] },
      { name: "Spicy Vodka Rigatoni", tags: ["vegetarian", "spicy", "dairy", "gluten"] },
      { name: "Margherita Pizza", tags: ["dairy", "gluten", "vegetarian"] },
      { name: "Prosciutto Pizza", tags: ["dairy", "gluten", "pork"] },
      { name: "Bruschetta", tags: ["gluten-free", "dairy-free", "vegetarian"] },
      { name: "Tiramisu", tags: ["dairy", "gluten", "egg"] },
    ],
  },
  {
    id: "pho-house",
    name: "Pho House",
    cuisine: "Vietnamese",
    dishes: [
      { name: "Beef Pho Soup", tags: ["beef", "gluten-free", "dairy-free"] },
      { name: "Chicken Pho Soup", tags: ["gluten-free", "dairy-free", "poultry"] },
      { name: "Bahn Mi Sandwich", tags: ["gluten-free", "dairy-free", "vegetarian", "vegan"] },
      { name: "Spring Rolls", tags: ["gluten-free", "dairy-free", "vegetarian", "vegan"] },
      { name: "Rice Paper Rolls", tags: ["gluten-free", "dairy-free", "vegetarian", "vegan"] },
      { name: "Ice-cream", tags: ["dairy", "gluten-free", "vegetarian"] },
    ],
  },
  {
    id: "le-petit-bistro",
    name: "Le Petit Bistro",
    cuisine: "French",
    dishes: [
      { name: "Soupe à l'oignon", tags: ["dairy", "gluten-free", "vegetarian"] },
      { name: "Boeuf Bourguignon", tags: ["beef", "gluten-free", "dairy-free"] },
      { name: "Duck Confit", tags: ["gluten-free", "dairy-free", "poultry"] },
      { name: "Escargots", tags: ["gluten-free", "seafood"] },
      { name: "Crème Brûlée", tags: ["dairy", "egg", "gluten-free", "vegetarian"] },
      { name: "Pain au chocolat", tags: ["vegetarian", "dairy"] },
    ],
  },
  {
    id: "sakura-garden",
    name: "Sakura Garden",
    cuisine: "Japanese",
    dishes: [
      { name: "Assorted sushi rolls", tags: ["dairy-free", "gluten-free", "seafood"] },
      { name: "Assorted Gyoza", tags: ["dairy-free", "vegetarian", "pork"] },
      { name: "Ramen", tags: ["dairy-free", "vegetarian", "egg", "pork"] },
      { name: "Edamame", tags: ["gluten-free", "dairy-free", "vegetarian", "vegan"] },
      { name: "Mochi", tags: ["gluten-free", "dairy-free", "vegetarian"] },
      { name: "Matcha ice-cream", tags: ["dairy", "gluten-free", "vegetarian"] },
    ],
  },
  {
    id: "red-lantern",
    name: "Red Lantern",
    cuisine: "Chinese",
    dishes: [
      { name: "Dumplings", tags: ["pork", "dairy-free"] },
      { name: "Fried rice", tags: ["dairy-free", "gluten-free", "vegetarian"] },
      { name: "Stirfry", tags: ["beef", "pork", "dairy-free", "gluten-free"] },
      { name: "Noodle soup", tags: ["gluten-free", "dairy-free", "vegetarian"] },
      { name: "Kung Pao chicken", tags: ["spicy", "gluten-free", "dairy-free", "poultry"] },
      { name: "Mapo tofu", tags: ["spicy", "pork", "dairy-free", "gluten-free"] },
    ],
  },
  {
    id: "burger-bros",
    name: "Burger Bros",
    cuisine: "American",
    dishes: [
      { name: "Assorted burgers", tags: ["dairy-free", "gluten-free", "beef", "poultry"] },
      { name: "Chips", tags: ["dairy-free", "vegetarian"] },
      { name: "Garden salad", tags: ["dairy-free", "gluten-free", "vegetarian", "vegan"] },
      { name: "Mozarella sticks", tags: ["vegetarian", "dairy"] },
      { name: "Chicken pieces", tags: ["dairy-free", "poultry"] },
      { name: "Sundaes", tags: ["gluten-free", "dairy"] },
    ],
  },
  {
    id: "taco-fiesta",
    name: "Taco Fiesta",
    cuisine: "Mexican",
    dishes: [
      { name: "Assorted tacos", tags: ["gluten-free", "dairy-free", "beef", "poultry"] },
      { name: "Assorted burritos", tags: ["dairy-free", "beef", "poultry"] },
      { name: "Assorted quesadillas", tags: ["dairy", "vegetarian"] },
      { name: "Loaded fries", tags: ["dairy-free", "gluten-free", "vegetarian"] },
      { name: "Nachos", tags: ["dairy-free", "gluten-free", "vegetarian"] },
      { name: "Churros", tags: ["dairy", "vegetarian"] },
    ],
  },
  {
    id: "bella-cucina",
    name: "Bella Cucina",
    cuisine: "Italian",
    dishes: [
      { name: "Chicken Parmagiana", tags: ["gluten-free", "dairy-free", "poultry"] },
      { name: "Lasagna", tags: ["dairy", "beef"] },
      { name: "Fettucine Alfredo", tags: ["dairy", "vegetarian"] },
      { name: "Pepperoni Pizza", tags: ["dairy", "pork"] },
      { name: "Garlic bread", tags: ["dairy", "gluten-free", "vegetarian"] },
      { name: "Canoli", tags: ["dairy", "nuts", "vegetarian"] },
    ],
  },
  {
    id: "seoul-kitchen",
    name: "Seoul Kitchen",
    cuisine: "Korean",
    dishes: [
      { name: "Kimchi", tags: ["gluten-free", "dairy-free", "vegan"] },
      { name: "Korean Fried Chicken", tags: ["dairy", "spicy", "poultry"] },
      { name: "Bibimbap", tags: ["dairy", "vegetarian", "egg"] },
      { name: "Tteokbokki (Spicy Rice Cakes)", tags: ["spicy", "dairy"] },
      { name: "Japchae (Glass Noodles with Vegetables)", tags: ["dairy", "gluten-free", "vegetarian"] },
      { name: "Hotteok (Sweet Korean Pancakes)", tags: ["dairy", "nuts", "vegetarian"] },
    ],
  },
  {
    id: "cantina-loco",
    name: "Cantina Loco",
    cuisine: "Mexican",
    dishes: [
      { name: "Tacos al Pastor", tags: ["pork"] },
      { name: "Chicken Quesadilla", tags: ["dairy", "poultry"] },
      { name: "Guacamole & Chips", tags: ["gluten-free", "dairy-free", "vegetarian", "vegan"] },
      { name: "Beef Enchiladas", tags: ["dairy", "beef"] },
      { name: "Vegetarian Burrito", tags: ["dairy", "vegetarian"] },
      { name: "Churros", tags: ["dairy", "vegetarian"] }
    ]
  },
  {
    id: "the-old-tavern",
    name: "The Old Tavern",
    cuisine: "Pub",
    dishes: [
      { name: "Fish and Chips", tags: ["dairy-free", "seafood"] },
      { name: "Beef Burger", tags: ["beef", "dairy"] },
      { name: "Veggie Pie", tags: ["dairy", "vegetarian"] },
      { name: "Chicken Wings", tags: ["gluten-free", "dairy-free", "poultry"] },
      { name: "Steak and chips", tags: ["dairy-free", "gluten-free", "beef"] },
      { name: "Sticky Toffee Pudding", tags: ["dairy", "nuts", "vegetarian"] }
    ]
  },
  {
    id: "grill-and-go",
    name: "Grill & Go",
    cuisine: "Fast Food",
    dishes: [
      { name: "Classic Cheeseburger", tags: ["dairy", "beef"] },
      { name: "Crispy Fries", tags: ["gluten-free", "dairy-free", "vegetarian"] },
      { name: "Spicy Chicken Nuggets", tags: ["spicy", "dairy-free", "gluten-free"] },
      { name: "BBQ Pulled Pork Sandwich", tags: ["dairy-free", "gluten-free", "pork"] },
      { name: "Veggie Wrap", tags: ["dairy-free", "gluten-free", "vegetarian"] },
      { name: "Vanilla Milkshake", tags: ["dairy", "gluten-free", "vegetarian"] }
    ]
  },
  {
    id: "thai-basil",
    name: "Thai Basil",
    cuisine: "Thai",
    dishes: [
      { name: "Pad Thai", tags: ["gluten-free", "dairy-free", "nuts", "egg"] },
      { name: "Green Curry", tags: ["spicy", "gluten-free", "dairy", "beef"] },
      { name: "Vegetable Spring Rolls", tags: ["dairy-free", "gluten-free", "vegetarian"] },
      { name: "Tom Yum Soup", tags: ["dairy-free", "gluten-free", "vegetarian"] },
      { name: "Thai Mango Salad", tags: ["dairy-free", "gluten-free", "vegetarian", "vegan"] },
      { name: "Coconut Sticky Rice", tags: ["dairy", "gluten-free", "vegetarian"] }
    ]
  },
  {
    id: "sunny-side-cafe",
    name: "Sunny Side Cafe",
    cuisine: "Brunch",
    dishes: [
      { name: "Avocado Toast", tags: ["dairy-free", "gluten-free", "vegetarian", "egg"] },
      { name: "Eggs Benedict", tags: ["dairy", "egg"] },
      { name: "Vegetable Frittata", tags: ["dairy", "gluten-free", "vegetarian", "egg"] },
      { name: "Buttermilk Pancakes", tags: ["dairy", "vegetarian"] },
      { name: "Granola & Yogurt Bowl", tags: ["dairy", "nuts", "vegetarian"] },
      { name: "Fresh Fruit Smoothie", tags: ["dairy", "gluten-free", "vegetarian"] }
    ]
  },
  {
    id: "morning-bloom",
    name: "Morning Bloom",
    cuisine: "Brunch",
    dishes: [
      { name: "Egg & Avocado Bagel", tags: ["dairy", "egg", "gluten-free", "vegetarian"] },
      { name: "Smoked Salmon Croissant", tags: ["dairy", "seafood", "gluten-free"] },
      { name: "Spinach & Feta Omelette", tags: ["dairy", "egg", "gluten-free", "vegetarian"] },
      { name: "Banana Pancakes", tags: ["dairy", "vegetarian"] },
      { name: "Acai Bowl", tags: ["gluten-free", "dairy-free", "vegetarian", "vegan"] },
      { name: "Chia Seed Pudding", tags: ["dairy", "nuts", "gluten-free", "vegetarian"] }
    ]
  },
  {
    id: "berliner-keller",
    name: "Berliner Keller",
    cuisine: "German",
    dishes: [
      { name: "Bratwurst with Sauerkraut", tags: ["gluten-free", "dairy-free", "pork"] },
      { name: "Schnitzel", tags: ["dairy-free", "gluten-free", "pork"] },
      { name: "Pretzel with Mustard", tags: ["dairy", "vegetarian"] },
      { name: "Kartoffelsalat (Potato Salad)", tags: ["dairy", "gluten-free", "vegetarian"] },
      { name: "Rotkohl (Braised Red Cabbage)", tags: ["gluten-free", "dairy-free", "vegetarian", "vegan"] },
      { name: "Apfelstrudel", tags: ["dairy", "nuts", "vegetarian"] }
    ]
  }
];

/** Hardcoded extra info for each restaurant (address, hours, description, banner image) */
export const RESTAURANT_PAGES: Record<
  string,
  { address: string; hours: string; description: string; image: string }
> = {
  "ramen-yard": {
    address: "42 Noodle Lane, Melbourne VIC 3000",
    hours: "Mon–Sun 11:30am–9:30pm",
    description:
      "Authentic Japanese ramen in a cosy lane. House-made noodles, rich broths and classic toppings.",
    image: "https://static.wixstatic.com/media/35f44e_c77db72e64294eeabb471f774d84dfd0~mv2.png/v1/fill/w_800,h_502,al_c,q_90,enc_avif,quality_auto/35f44e_c77db72e64294eeabb471f774d84dfd0~mv2.png",
  },
  "mezze-street": {
    address: "15 Spice Alley, Melbourne VIC 3000",
    hours: "Mon–Sat 12pm–10pm, Sun 12pm–9pm",
    description:
      "Middle Eastern mezze and grills. Falafel, hummus, shawarma and baklava in a vibrant setting.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
  },
  "green-bowl": {
    address: "8 Health St, Melbourne VIC 3000",
    hours: "Mon–Fri 7am–4pm, Sat–Sun 8am–3pm",
    description:
      "Healthy bowls, salads and plant-forward dishes. Plenty of vegan and gluten-free options.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
  },
  "bbq-den": {
    address: "22 Smoke Rd, Melbourne VIC 3000",
    hours: "Tue–Sun 5pm–10pm (closed Mon)",
    description:
      "American-style BBQ with slow-smoked meats, sides and sauces. Brisket, pulled pork and more.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
  },
  "the-pasta-bar": {
    address: "16 City Lane, Carlton VIC 3053",
    hours: "Mon–Sun 5pm–10pm",
    description:
      "Traditional italian cuisine with a modern twist. Pasta, pizza and more.",
    image: "https://img.delicious.com.au/POHIM8dm/del/2023/02/fabbrica-balmain-184914-2.jpg",
  },
  "pho-house": {
    address: "25 Main St, Springvale VIC 3171",
    hours: "Mon–Sun 10am–10pm",
    description:
      "Authentic Vietnamese dishes with fresh ingredients and bold flavours.",
    image: "https://glamadelaide.com.au/wp-content/uploads/2025/07/Ba-Nam-feature-pho.jpg",
  },
  "le-petit-bistro": {
    address: "66 Laurier Ave, South Yarra VIC 3141",
    hours: "Mon–Sat 10am–11pm",
    description:
      "Taste of France in Melbourne. Soups, mains, desserts and more.",
    image: "https://cdn.broadsheet.com.au/cache/40/f1/40f1bb3faf1b06d776bdc4a17fd44885.jpg",
  },
  "sakura-garden": {
    address: "10 Floral Dr, Brighton VIC 3186",
    hours: "Mon–Sun 10am–9pm",
    description:
      "Authentic Japanese flavours with fresh, artfully crafted dishes.",
    image: "https://zushi.com.au/wp-content/uploads/2020/12/zushi-home-hero.jpg",
  },
  "red-lantern": {
    address: "8 Spring Rd, Hawthorn VIC 3122",
    hours: "Mon–Sun 9am–9pm",
    description:
      "Taste the essence of China with dishes full of flavour, colour and tradition.",
    image: "https://www.privatedining.com.au/wp-content/uploads/2018/07/Red-Lantern-Restaurant-14.jpg",
  },
  "burger-bros": {
    address: "32 Beach Rd, St Kilda VIC 3182",
    hours: "Mon–Sun 8am–11pm",
    description:
      "The go-to spot for classic burgers and crispy sides.",
    image: "https://lifehacker.com/imagery/articles/01HF2H25FNY97E7KS82J8RFSXD/hero-image.fill.size_1200x675.jpg",
  },
  "taco-fiesta": {
    address: "18 Salsa St, Prahran VIC 3181",
    hours: "Mon–Sun 7am–12am",
    description:
      "Delicious street-style mexican food packed with bold flavours and fresh ingredients.",
    image: "https://images.squarespace-cdn.com/content/v1/65f3855a502d9f159b562c32/5c036385-2c33-40ca-9faa-74d0071de854/sisenor-apr2024-60.jpg",
  },
  "bella-cucina": {
    address: "25 Rosa Ave, Caulfield VIC 3162",
    hours: "Mon–Sun 11am–11pm",
    description:
      "Traditional taste of Italy with something for everyone.",
    image: "https://images.squarespace-cdn.com/content/v1/63d1dc483c77e31165bddc7a/acc9716e-cf2d-4b85-a28e-9167fff00347/OCT-2416194.jpg",
  },
  "seoul-kitchen": {
    address: "10 Spring Lane, Glen Waverly VIC 3150",
    hours: "Mon–Sun 10am–6pm",
    description:
      "Offers various Korean dishes full of unique flavours.",
    image: "https://images.squarespace-cdn.com/content/v1/68f01d9ee19fbe7cbcf6ac27/1760568911023-FRD80X4L4VI86NXWEW0B/Korean%2BRestaurant%2BHansang%2B8101.jpg",
  },
  "cantina-loco": {
    address: "55 Main St, Elsternwick VIC 3185",
    hours: "Mon–Sun 9am–10pm",
    description:
      "Delicious dishes, drinks and good vibes.",
    image: "https://images.squarespace-cdn.com/content/v1/65f3855a502d9f159b562c32/5c036385-2c33-40ca-9faa-74d0071de854/sisenor-apr2024-60.jpg",
  },
  "the-old-tavern": {
    address: "75 Nelson St, Sandringham VIC 3191",
    hours: "Mon–Sun 10am–11pm",
    description:
      "A cozy spot to enjoy classic meals and drinks with friends and family.",
    image: "https://whatson.melbourne.vic.gov.au/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6ImJjZDE2ZWRhLTdiNDktNDIzMi1hZTVjLTBhYmU3YmViY2IwOSIsInB1ciI6ImJsb2JfaWQifX0=--26dee44d9030866dbb330c3725c443519eaf75f2/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJqcGciLCJncmF2aXR5IjoiQ2VudGVyIiwicmVzaXplX3RvX2ZpbGwiOls4ODAsNTkwXX0sInB1ciI6InZhcmlhdGlvbiJ9fQ==--8ba21a1f014d91c43eb97f346a0dc62d26bd59b2/1967277b-4028-4bda-90e8-55b4d6d1caec.jpg",
  },
  "grill-and-go": {
    address: "20 Crescent St, Essendon VIC 3040",
    hours: "Mon–Sun 9am–11:30pm",
    description:
      "Enjoy fast, flavourful and fresh meals made to go",
    image: "https://media1.agfg.com.au/images/listing/106282/hero-400.jpg",
  },
  "thai-basil": {
    address: "64 Dale St, Bentleigh VIC 3204",
    hours: "Mon–Sun 11am–9pm",
    description:
      "Savor the bold and vibrant flavors of Thailand with fresh curries, noodles and street-food-inspired dishes.",
    image: "https://images.squarespace-cdn.com/content/v1/669f49ad862c2d461d8c46c0/726f6181-b322-4eb8-8f77-2003e623df3d/image.png",
  },
  "sunny-side-cafe": {
    address: "12 Sunningdale Rd, Toorak VIC 3142",
    hours: "Mon–Sun 9am–4pm",
    description:
      "A cozy café serving fresh coffee, brunch and light bites.",
    image: "https://homeadore.com/wp-content/uploads/2024/05/007-snidanishna-discover-ukraines-cozy-cafe-design-oasis-1390x927.jpg",
  },
  "morning-bloom": {
    address: "34 Amica Lane, Fitzroy VIC 3065",
    hours: "Mon–Sun 9am–3pm",
    description:
      "Fresh, flavourful brunch options to brighten your morning. ",
    image: "https://whatson.melbourne.vic.gov.au/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6IjA4MWE0NzZiLWQ5NGEtNDJkMS04NTg4LTcxNTg3YjE5YWM1OSIsInB1ciI6ImJsb2JfaWQifX0=--abdb5518e5f83236167bab64a98c0af1989381fa/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJqcGciLCJncmF2aXR5IjoiQ2VudGVyIiwicmVzaXplX3RvX2ZpbGwiOls4ODAsNTkwXX0sInB1ciI6InZhcmlhdGlvbiJ9fQ==--8ba21a1f014d91c43eb97f346a0dc62d26bd59b2/f57640ce-d752-4dd9-aff0-d9da8b2253e1.jpg",
  },
  "berliner-keller": {
    address: "48 Kuchen St, Kew VIC 3101",
    hours: "Mon–Sun 11am–10pm",
    description:
      "Experience authentic German cuisine with rich flavors, traditional recipes and warm atmosphere",
    image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/f5/ab/f8/interior.jpg",
  }
};

export function getRestaurantById(id: string): Restaurant | undefined {
  return SAMPLE_RESTAURANTS.find((r) => r.id === id);
}
