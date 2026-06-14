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
      id: "bakery-box",
      name: "Perfect bakery box",
      description: "description",
      price: 20,
      image: "assets/flyerpicschirag/24608.jpg",
    },
    {
      id: "cookies",
      name: "Cookies",
      description: "description",
      price: 5,
      image: "assets/flyerpicschirag/24609.jpg",
    },
    {
      id: "pastries",
      name: "Pastries",
      description: "description",
      price: 5,
      image: "assets/flyerpicschirag/24612.jpg",
    },
    {
      id: "berry-pastries",
      name: "Pastries with berry filling",
      description: "description",
      price: 5,
      image: "assets/flyerpicschirag/24613.jpg",
    },
  ],
};
