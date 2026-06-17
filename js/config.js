const SITE_CONFIG = {
  brandName: "Chef Chirag",
  tagline: "Handcrafted cakes, cookies & treats — delivered to your door",
  heroHeadline: "Gourmet Box",
  heroSubheadline: "delivered to your door",
  heroDeliveryNote: "(home delivery available for Naperville and Aurora)",
  heroDescription:
    "Celebrate Father's Day with freshly baked goods from Chef\u00A0Chirag!",
  footerNote: "Father's Day orders — door-to-door delivery available",

  youtube: {
    url: "https://www.youtube.com/@ChefChiragcooking/shorts",
    handle: "@ChefChiragcooking",
  },

  allergyWarning: "Allergy warning: Contains milk, eggs, tree nuts, wheat, peanuts, and soybeans.",

  ingredientsAllergens: {
    summary:
      "Contains milk, eggs, tree nuts, wheat, peanuts, and soybeans. May contain shellfish and fish.",
    contains: ["Milk", "Eggs", "Tree nuts", "Wheat", "Peanuts", "Soybeans"],
    mayContain: ["Shellfish", "Fish"],
    allergenDisclosure: [
      "Milk",
      "Eggs",
      "Fish",
      "Shellfish",
      "Tree nuts",
      "Peanuts",
      "Wheat",
      "Soybean",
    ],
    ingredients: [
      {
        name: "Cookies",
        list:
          "Flour, sugar, eggs, baking soda, baking powder, salt, halal vanilla, marshmallow (corn syrup, water, dextrose, halal gelatin, corn starch, artificial vanilla flavor, potassium sorbate), pistachio cream (pistachio, sugar, non-hydrogenated vegetable fats, milk powder, extra virgin olive oil, emulsifier: soy lecithin), Hershey's chocolate.",
      },
      {
        name: "Pies",
        list:
          "Flour, water, butter, sugar, molasses, halal vanilla, apples, lemon, salt, cinnamon.",
      },
      {
        name: "Muffins",
        list:
          "Flour, milk, sugar, eggs, halal vanilla, blueberries, baking powder, salt.",
      },
    ],
  },

  // Paste your Google Apps Script Web App URL here after setup (see SETUP.md)
  googleScriptUrl:
    "https://script.google.com/macros/s/AKfycbzme_R8azNqOjzvTOwSpJCGc6pyNEEMjPw9Koh-64jLth8816rP7ZMo3qHAqOCvXC-1/exec",

  paymentMethods: [
    "Cash/Card on delivery",
    "Venmo",
    "Zelle",
  ],

  paymentDetails: {
    Venmo: {
      label: "Send payment to this Venmo address:",
      value: "@amodak",
    },
    Zelle: {
      label: "Send payment to this Zelle address:",
      value: "modak.anagha@gmail.com",
    },
  },

  products: [
    {
      id: "bakery-box",
      name: "Perfect Bakery Box",
      description: "Includes 2 blueberry muffins, 2 specialty cookies, 1 apple pie, 1 almond danish.",
      price: 20,
      image: "assets/flyerpicschirag/24592.jpg",
      images: [
        "assets/flyerpicschirag/24592.jpg",
        "assets/flyerpicschirag/24605.jpg",
        "assets/flyerpicschirag/24612.jpg",
      ],
    },
    {
      id: "a-la-carte",
      name: "À la carte",
      description: "Order individual items.",
      price: 4,
      orderable: false,
      image: "assets/flyerpicschirag/24266.png",
      items: [
        {
          id: "a-la-carte-24618",
          name: "Blueberry Muffin",
          price: 4,
          image: "assets/flyerpicschirag/24618.jpg",
        },
        {
          id: "a-la-carte-24621",
          name: "Apple pie",
          price: 4,
          image: "assets/flyerpicschirag/24621.jpg",
        },
        {
          id: "a-la-carte-24622",
          name: "Blueberry Almond Danish",
          price: 4,
          image: "assets/flyerpicschirag/24622.jpg",
        },
        {
          id: "a-la-carte-24619",
          name: "S'mores Cookie",
          price: 4,
          image: "assets/flyerpicschirag/24619.jpg",
        },
        {
          id: "a-la-carte-24620",
          name: "Dubai Chocolate Cookie",
          price: 4,
          image: "assets/flyerpicschirag/24620.jpg",
        },
      ],
    },
  ],
};
