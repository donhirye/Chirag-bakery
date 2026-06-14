const SITE_CONFIG = {
  brandName: "Chirag's Bakery",
  tagline: "Handcrafted cakes, cookies & treats — delivered to your door",
  heroHeadline: "Sweet treats for Dad",
  heroSubheadline: "delivered to your door",
  heroDescription:
    "Celebrate Father's Day with freshly baked cakes, buttery cookies, and artisan pastries made with love.",
  footerNote: "Father's Day orders — door-to-door delivery available",

  // Paste your Google Apps Script Web App URL here after setup (see SETUP.md)
  googleScriptUrl:
    "https://script.google.com/macros/s/AKfycbzme_R8azNqOjzvTOwSpJCGc6pyNEEMjPw9Koh-64jLth8816rP7ZMo3qHAqOCvXC-1/exec",

  paymentMethods: [
    "Cash on delivery",
    "Venmo",
    "Zelle",
  ],

  paymentDetails: {
    Venmo: {
      label: "Send payment to this Venmo address:",
      value: "venmoaddress@gmail.com",
    },
    Zelle: {
      label: "Send payment to this Zelle address:",
      value: "zelleaddress@gmail.com",
    },
  },

  products: [
    {
      id: "chocolate-cake",
      name: "A",
      description: "description a.",
      price: 35,
      emoji: "🎂",
    },
    {
      id: "butter-cookies",
      name: "Butter Cookies (dozen)",
      description: "Classic golden butter cookies, perfect for gifting",
      price: 18,
      emoji: "🍪",
    },
    {
      id: "pastry-box",
      name: "B",
      description: "description B.",
      price: 28,
      emoji: "🥐",
    },
    {
      id: "cupcakes",
      name: "Custom Cupcakes (6)",
      description: "Six handcrafted cupcakes with your choice of flavors",
      price: 22,
      emoji: "🧁",
    },
    {
      id: "brownies",
      name: "Fudge Brownie Box",
      description: "Dense, fudgy brownies with a crackly top",
      price: 20,
      emoji: "🍫",
    },
    {
      id: "bread-loaf",
      name: "Artisan Bread Loaf",
      description: "Freshly baked crusty loaf, perfect for brunch",
      price: 12,
      emoji: "🍞",
    },
  ],
};
