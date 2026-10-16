/**
 * JAANKAR Universal User Web Experience — Master Application Logic
 * Connected to Firebase Firestore: jaankar-1c6ba
 * Includes: Mandatory Auth Gate, Steady 3-Dot Sidebar, Dynamic Hero Slider,
 * 6 Electronics Category Pages with 6-Photo Gallery, News Desk with Date Calendar Filter,
 * In-Site Modal Video/YouTube Player, Jaankar AI Voice Assistant,
 * Account Center with PC Photo Upload, and 2-Way Live Support with Voice Notes.
 */

// 1. Firebase Configuration matching JAANKAR Android app
const firebaseConfig = {
  apiKey: "AIzaSyANc8IHVw2NXoJ1NC7E-2bQa7PDscQG3Vo",
  authDomain: "jaankar-1c6ba.firebaseapp.com",
  projectId: "jaankar-1c6ba",
  storageBucket: "jaankar-1c6ba.firebasestorage.app",
  messagingSenderId: "359575085234",
  appId: "1:359575085234:web:jaankar_admin"
};

let db = null;
let currentLanguage = localStorage.getItem("jaankar_lang") || "hi";
let currentTab = "home";
let currentCategory = "computers";
let liveNewsList = [];
let liveReelsList = [];
let liveProductsList = [];
let liveHomeSlides = [];
let currentPlayingVideoUrl = "";
let isSidebarOpen = false;
let currentSlideIndex = 0;
let slideIntervalTimer = null;
let supportChatUnsubscribe = null;
let mediaRecorder = null;
let audioChunks = [];
let isRecordingVoice = false;

// Default Curated Fallback Data for 6 Electronics Categories (Guarantees zero-blank UI)
const defaultProductsCatalog = [
  // 1. Computers
  {
    id: "pc_1",
    name: "JAANKAR Stealth Pro Gaming & AI Rig",
    category: "computers",
    price: "₹1,45,000",
    mrp: "₹1,75,000",
    discount: "17% OFF",
    rating: "4.9",
    featuredImage: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Ultimate custom-built workstation for 4K video rendering, deep learning local AI workloads, and 144Hz 1440p gaming.",
    specs: {
      "Processor": "AMD Ryzen 7 7800X3D (8C/16T, up to 5.0GHz)",
      "Graphics Card": "NVIDIA GeForce RTX 4070 Ti Super 16GB GDDR6X",
      "RAM Memory": "32GB (2x16GB) Corsair Vengeance DDR5 6000MHz CL30",
      "Primary Storage": "2TB Kingston KC3000 PCIe Gen4 NVMe M.2 SSD",
      "Motherboard": "MSI MAG B650 Tomahawk WiFi (AM5)",
      "Cooling & Power": "DeepCool LT720 360mm Liquid Cooler • Corsair RM850e 850W Gold PSU",
      "Cabinet": "NZXT H6 Flow Dual-Chamber Panoramic Tempered Glass"
    },
    buyLinks: {
      amazon: "https://www.amazon.in/s?k=gaming+pc+rtx+4070",
      flipkart: "https://www.flipkart.com/search?q=gaming+desktop+rtx"
    }
  },
  // 2. Laptops
  {
    id: "lap_1",
    name: "Apple MacBook Pro 14 (M3 Pro, 18GB/512GB)",
    category: "laptops",
    price: "₹1,89,900",
    mrp: "₹1,99,900",
    discount: "5% OFF",
    rating: "4.9",
    featuredImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Industry standard laptop for software developers, video editors, and audio engineers with Liquid Retina XDR screen.",
    specs: {
      "Processor": "Apple M3 Pro Chip with 11-core CPU, 14-core GPU",
      "Unified RAM": "18GB Unified High-Speed Memory",
      "Storage": "512GB Ultra-Fast NVMe SSD Storage",
      "Display": "14.2-inch Liquid Retina XDR (3024x1964) 120Hz ProMotion",
      "Battery Life": "Up to 18 Hours Apple TV app playback (70Wh)",
      "Ports": "3x Thunderbolt 4 (USB-C), HDMI, SDXC, MagSafe 3"
    },
    buyLinks: {
      amazon: "https://www.amazon.in/s?k=macbook+pro+m3",
      flipkart: "https://www.flipkart.com/search?q=macbook+pro+m3"
    }
  },
  // 3. Mobiles
  {
    id: "mob_1",
    name: "Samsung Galaxy S24 Ultra 5G (AI Edition)",
    category: "mobiles",
    price: "₹1,24,999",
    mrp: "₹1,34,999",
    discount: "7% OFF",
    rating: "4.8",
    featuredImage: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&auto=format&fit=crop&q=80"
    ],
    description: "The pinnacle of Android engineering featuring Titanium frame, 200MP Quad Telephoto OIS camera, Galaxy AI, and built-in S-Pen.",
    specs: {
      "Processor": "Qualcomm Snapdragon 8 Gen 3 for Galaxy (4nm)",
      "RAM & Storage": "12GB LPDDR5X + 256GB UFS 4.0",
      "Display": "6.8-inch Dynamic AMOLED 2X Quad HD+ (120Hz, 2600 nits, Gorilla Armor)",
      "Cameras": "200MP Wide OIS + 50MP 5x Periscope + 10MP 3x + 12MP Ultra-Wide",
      "Battery & Charging": "5,000 mAh with 45W Fast Wired & 15W Wireless",
      "Build": "Titanium Armor Frame, IP68 Water/Dust Resistant"
    },
    buyLinks: {
      amazon: "https://www.amazon.in/s?k=s24+ultra",
      flipkart: "https://www.flipkart.com/search?q=s24+ultra"
    }
  },
  // 4. TV & Display
  {
    id: "tv_1",
    name: "LG C3 55-inch 4K OLED Smart Cinema TV",
    category: "tv",
    price: "₹1,14,990",
    mrp: "₹1,69,990",
    discount: "32% OFF",
    rating: "4.9",
    featuredImage: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Self-lit OLED pixels delivering infinite contrast, true blacks, 0.1ms response time, Dolby Vision IQ, and 4x HDMI 2.1 120Hz ports for PS5 and PC gaming.",
    specs: {
      "Panel Technology": "Self-Lit 4K OLED evo Panel (3840 x 2160)",
      "Refresh Rate": "Native 120Hz Refresh Rate with VRR, G-Sync & FreeSync",
      "Processor": "α9 AI Processor 4K Gen6 with AI Super Upscaling",
      "HDR Standards": "Dolby Vision, HDR10 Pro, HLG, Filmmaker Mode",
      "Audio Output": "40W 2.2 Channel Dolby Atmos Virtual 9.1.2 Up-mix",
      "Connectivity": "4x HDMI 2.1 (4K 120Hz), 3x USB, eARC, Wi-Fi 5, Bluetooth 5.0"
    },
    buyLinks: {
      amazon: "https://www.amazon.in/s?k=lg+oled+c3+55",
      flipkart: "https://www.flipkart.com/search?q=lg+c3+oled"
    }
  },
  // 5. Cameras
  {
    id: "cam_1",
    name: "Sony Alpha 7 IV Full-Frame Hybrid Camera",
    category: "cameras",
    price: "₹2,14,990",
    mrp: "₹2,42,490",
    discount: "11% OFF",
    rating: "4.8",
    featuredImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Benchmark hybrid camera for content creators, photographers, and cinematic video producers with Real-time Eye AF and 10-bit 4:2:2 recording.",
    specs: {
      "Image Sensor": "33.0 Megapixel 35mm Full-Frame Exmor R CMOS Sensor",
      "Video Recording": "4K 60p (Super 35) & 4K 30p (7K oversampled) 10-bit 4:2:2 All-Intra",
      "Autofocus System": "759 Phase-detection AF points with Real-time Human/Animal/Bird Eye AF",
      "Image Stabilization": "5-Axis In-Body Optical Image Stabilization (5.5-step benefit)",
      "Viewfinder & LCD": "3.68M-dot OLED EVF + Vari-angle Side-Opening Touchscreen",
      "Card Slots": "Dual slots: Slot 1 (CFexpress Type A / SD UHS-II) + Slot 2 (SD UHS-II)"
    },
    buyLinks: {
      amazon: "https://www.amazon.in/s?k=sony+a7iv",
      flipkart: "https://www.flipkart.com/search?q=sony+a7+iv"
    }
  },
  // 6. Audio Products
  {
    id: "aud_1",
    name: "Sony WH-1000XM5 Wireless Noise Cancelling",
    category: "audio",
    price: "₹26,990",
    mrp: "₹34,990",
    discount: "23% OFF",
    rating: "4.8",
    featuredImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800&auto=format&fit=crop&q=80"
    ],
    description: "Industry-leading active noise cancellation powered by dual V1 + QN1 processors, 8 microphones, and ultra-comfortable lightweight design.",
    specs: {
      "Noise Cancellation": "Auto NC Optimizer with Integrated Processor V1 + HD QN1 Chip",
      "Drivers": "Specially designed 30mm carbon fiber composite driver units",
      "Battery Life": "Up to 30 Hours with ANC On (3 min quick charge gives 3 hours playback)",
      "Audio Codecs": "LDAC (Hi-Res Audio Wireless), AAC, SBC, DSEE Extreme upscaling",
      "Microphones": "8 Microphones with AI beamforming noise reduction for crystal clear calls",
      "Smart Features": "Multipoint connection (pair 2 devices simultaneously), Speak-to-Chat"
    },
    buyLinks: {
      amazon: "https://www.amazon.in/s?k=sony+wh1000xm5",
      flipkart: "https://www.flipkart.com/search?q=sony+xm5"
    }
  }
];

// Fallback News Items with date tags & video branches
const fallbackNews = [
  {
    id: "news_1",
    title: "AI Smartphones 2026: On-Device GenAI Feature Guide & Real Battery Tests",
    category: "smartphones",
    author: "JAANKAR Tech Desk",
    timestamp: Date.now() - 3600000 * 2,
    dateTag: new Date().toISOString().split("T")[0],
    readTime: "3 min read",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isYouTube: true,
    content: "Latest on-device artificial intelligence processing transforms how smartphones handle photography, voice translation, and battery endurance. In this breakdown, we examine NPU architectures across flagship chipsets."
  },
  {
    id: "news_2",
    title: "Laptops with 30-Hour Battery: ARM Silicon Architecture Comparison",
    category: "laptops",
    author: "Hardware Lab",
    timestamp: Date.now() - 3600000 * 5,
    dateTag: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    readTime: "4 min read",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    videoUrl: "",
    isYouTube: false,
    content: "ARM architecture on modern laptops offers unprecedented battery efficiency without compromising thermal limits. Here is how modern instruction sets optimize multithreaded coding workloads."
  },
  {
    id: "news_3",
    title: "Cyber Security Alert: New Two-Factor Authentication Phishing Bypasses Detected",
    category: "security",
    author: "JAANKAR Shield",
    timestamp: Date.now() - 3600000 * 8,
    dateTag: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
    readTime: "2 min read",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
    videoUrl: "",
    isYouTube: false,
    content: "Security researchers have identified automated reverse-proxy attacks designed to intercept session cookies during 2FA logins. Learn how to switch to hardware security keys and Passkeys for foolproof security."
  },
  {
    id: "news_4",
    title: "How to Build Custom Offline AI Voice Assistants on Android",
    category: "ai",
    author: "AI Lab",
    timestamp: Date.now() - 3600000 * 12,
    dateTag: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0],
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
    isYouTube: true,
    content: "Quantized 4-bit local LLMs can now run seamlessly on modern mid-range Android devices. Follow our step-by-step developer guide on configuring MediaPipe and Gemini Nano for edge inference."
  }
];

// Fallback Reels
const fallbackReels = [
  { id: "r1", title: "Top 5 Hidden Android Settings", views: "142K", videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4", thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80" },
  { id: "r2", title: "How to Compress Any PDF in 5 Sec", views: "98K", videoUrl: "", thumbnail: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80" },
  { id: "r3", title: "Clean Your Phone Cache Safely", views: "210K", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnail: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&auto=format&fit=crop&q=80" },
  { id: "r4", title: "Generate UPI QR Codes in seconds", views: "75K", videoUrl: "", thumbnail: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80" },
  { id: "r5", title: "What is RAM vs SSD Speed?", views: "340K", videoUrl: "", thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop&q=80" },
  { id: "r6", title: "OLED vs AMOLED Screen Difference", views: "185K", videoUrl: "", thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&auto=format&fit=crop&q=80" }
];

// Fallback Slides
const fallbackSlides = [
  {
    id: "s1",
    title: "JAANKAR 2.0 Tech Hub Live",
    subtitle: "Complete Gadgets Matrix, PC Compatibility Lab & Real-time AI Assistant",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
    badge: "Official Launch",
    btnText: "Explore Electronics",
    tabAction: "categories"
  },
  {
    id: "s2",
    title: "PC Build Compatibility Lab",
    subtitle: "Simulate Socket, DDR5 Memory, GPU Length & Thermal Headroom instantly",
    imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&auto=format&fit=crop&q=80",
    badge: "Hardware Lab",
    btnText: "Launch PC Lab",
    tabAction: "pc-lab"
  },
  {
    id: "s3",
    title: "Ask JAANKAR AI with Voice",
    subtitle: "Direct voice talk powered by Gemini AI with verified Flipkart & Amazon deals",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    badge: "Gemini AI",
    btnText: "Talk to AI",
    tabAction: "ai"
  }
];

// ----------------------------------------------------------------------------
// 2. Boot Application
// ----------------------------------------------------------------------------
function bootJaankarApp() {
  console.log("Booting JAANKAR 2.0 User Web Experience...");
  try { initFirebase(); } catch (e) { console.error("initFirebase err:", e); }
  try { checkMandatoryAuthGate(); } catch (e) { console.error("checkMandatoryAuthGate err:", e); }
  try { initHeroSlider(); } catch (e) { console.error("initHeroSlider err:", e); }
  try { renderCategoryProducts(currentCategory); } catch (e) { console.error("renderCategoryProducts err:", e); }
  try { renderHomeFeed(); } catch (e) { console.error("renderHomeFeed err:", e); }
  try { renderReelsRail(); } catch (e) { console.error("renderReelsRail err:", e); }
  try { renderAccountDetails(); } catch (e) { console.error("renderAccountDetails err:", e); }
  try { applyTranslations(); } catch (e) { console.error("applyTranslations err:", e); }
  
  if (window.lucide && typeof lucide.createIcons === "function") {
    try { lucide.createIcons(); } catch (e) { console.error("lucide err:", e); }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootJaankarApp);
} else {
  bootJaankarApp();
}

window.addEventListener("load", () => {
  if (window.lucide && typeof lucide.createIcons === "function") {
    try { lucide.createIcons(); } catch (_) {}
  }
});

// ----------------------------------------------------------------------------
// 3. Firebase Initialization & Live Synchronizers
// ----------------------------------------------------------------------------
function initFirebase() {
  try {
    if (typeof firebase !== "undefined") {
      const app = (firebase.apps && firebase.apps.length) ? firebase.app() : firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      try {
        db.settings({ experimentalForceLongPolling: true, merge: true });
      } catch (_) {}
      console.log("Firebase initialized successfully for JAANKAR User Web:", firebaseConfig.projectId);
      listenToLiveFirestore();
    } else {
      console.warn("Firebase SDK not loaded, fallback data active.");
    }
  } catch (err) {
    console.error("Firebase init failed, fallback active:", err);
  }
}

function listenToLiveFirestore() {
  if (!db) return;

  // 1. Live Home Slides from Firestore (Managed via Web Admin)
  db.collection("homeSlides").orderBy("order").onSnapshot((snapshot) => {
    if (snapshot && !snapshot.empty) {
      liveHomeSlides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderHeroSlides(liveHomeSlides);
    } else {
      renderHeroSlides(fallbackSlides);
    }
  }, (err) => {
    console.warn("Slides note:", err.message);
    renderHeroSlides(fallbackSlides);
  });

  // 2. Live News Desk & Bulletins from Admin Web
  db.collection("app_news").orderBy("timestamp", "desc").limit(30).onSnapshot((snapshot) => {
    if (snapshot && !snapshot.empty) {
      liveNewsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderHomeFeed(liveNewsList);
      renderNewsDesk(liveNewsList);
      renderBreakingNewsSlider(liveNewsList);
    } else {
      renderHomeFeed(fallbackNews);
      renderNewsDesk(fallbackNews);
      renderBreakingNewsSlider(fallbackNews);
    }
  }, (err) => {
    console.warn("News note:", err.message);
  });

  // 3. Live 6-Category Products from Admin Web
  db.collection("products").onSnapshot((snapshot) => {
    if (snapshot && !snapshot.empty) {
      liveProductsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      liveProductsList = [...defaultProductsCatalog];
    }
    renderCategoryProducts(currentCategory);
  }, (err) => {
    console.warn("Products note:", err.message);
    liveProductsList = [...defaultProductsCatalog];
    renderCategoryProducts(currentCategory);
  });

  // 4. Live Reels / Shorts
  db.collection("reels").onSnapshot((snapshot) => {
    if (snapshot && !snapshot.empty) {
      liveReelsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      liveReelsList = [...fallbackReels];
    }
    renderReelsRail();
  }, (err) => {
    console.warn("Reels note:", err.message);
  });

  // 5. Live Website CMS Master Config (Background Graphic, Maintenance, Contacts, APK)
  db.collection("system_settings").doc("website_config").onSnapshot((doc) => {
    if (doc.exists) {
      const cfg = doc.data();
      applyWebsiteCmsConfig(cfg);
    }
  }, (err) => {
    console.warn("Website config note:", err.message);
  });
}

// ----------------------------------------------------------------------------
// 4. Mandatory Auth Gate Guard & Session Persistence
// ----------------------------------------------------------------------------
let authTargetEmail = "";
let authOtpSessionToken = "";

function checkMandatoryAuthGate() {
  const gateEl = document.getElementById("mandatory-auth-gate");
  const savedUserStr = localStorage.getItem("jaankar_user");

  if (!savedUserStr) {
    if (gateEl) {
      gateEl.classList.remove("hidden");
      gateEl.classList.add("flex");
    }
    document.body.classList.add("overflow-hidden");
  } else {
    try {
      const user = JSON.parse(savedUserStr);
      updateUserUiDisplays(user);
      if (gateEl) {
        gateEl.classList.add("hidden");
        gateEl.classList.remove("flex");
      }
      document.body.classList.remove("overflow-hidden");
      // Subscribe to support chat messages for this user
      initSupportChatStream(user.uid || user.email);
    } catch (_) {
      localStorage.removeItem("jaankar_user");
      if (gateEl) {
        gateEl.classList.remove("hidden");
        gateEl.classList.add("flex");
      }
      document.body.classList.add("overflow-hidden");
    }
  }
}
window.checkMandatoryAuthGate = checkMandatoryAuthGate;

function updateUserUiDisplays(user) {
  if (!user) return;
  const name = user.displayName || user.name || (user.email ? user.email.split("@")[0] : "Expert Shiva");
  const email = user.email || "user@jaankar.in";
  const photo = user.photoUrl || user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

  // Header display
  const headerName = document.getElementById("header-user-name");
  if (headerName) headerName.textContent = name;
  const headerInitial = document.getElementById("header-user-avatar-badge");
  if (headerInitial) headerInitial.textContent = name.charAt(0).toUpperCase();

  // Sidebar display
  const sideName = document.getElementById("sidebar-user-name");
  if (sideName) sideName.textContent = name;
  const sideEmail = document.getElementById("sidebar-user-email");
  if (sideEmail) sideEmail.textContent = email;
  const sideAvatar = document.getElementById("sidebar-user-avatar");
  if (sideAvatar) sideAvatar.src = photo;

  // Account Page display
  const accName = document.getElementById("account-display-name");
  if (accName) accName.textContent = name;
  const accEmail = document.getElementById("account-display-email");
  if (accEmail) accEmail.textContent = email;
  const accAvatar = document.getElementById("account-avatar-img");
  if (accAvatar) accAvatar.src = photo;
}

function showGateAuthAlert(msg, isError = true) {
  const box = document.getElementById("gate-auth-alert-box");
  if (!box) return;
  box.className = isError
    ? "p-3 rounded-xl text-xs font-semibold flex items-center gap-2 bg-rose-500/10 text-rose-300 border border-rose-500/20"
    : "p-3 rounded-xl text-xs font-semibold flex items-center gap-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20";
  box.innerHTML = `<i data-lucide="${isError ? 'alert-triangle' : 'check-circle'}" class="w-4 h-4 shrink-0"></i><span>${escapeHtml(msg)}</span>`;
  box.classList.remove("hidden");
  if (window.lucide) lucide.createIcons();
}

function hideGateAuthAlert() {
  const box = document.getElementById("gate-auth-alert-box");
  if (box) box.classList.add("hidden");
}

function switchGateAuthStep(step) {
  hideGateAuthAlert();
  const stepEmail = document.getElementById("gate-step-email");
  const stepOtp = document.getElementById("gate-step-otp");
  if (step === "email") {
    if (stepEmail) stepEmail.classList.remove("hidden");
    if (stepOtp) stepOtp.classList.add("hidden");
  } else {
    if (stepEmail) stepEmail.classList.add("hidden");
    if (stepOtp) stepOtp.classList.remove("hidden");
    const otpInput = document.getElementById("gate-otp-input");
    if (otpInput) {
      otpInput.value = "";
      setTimeout(() => otpInput.focus(), 150);
    }
  }
}
window.switchGateAuthStep = switchGateAuthStep;

async function requestEmailOtp(isResend = false, isGate = true) {
  hideGateAuthAlert();
  const emailInput = document.getElementById(isGate ? "gate-email-input" : "auth-email-input");
  const sendBtn = document.getElementById(isGate ? "gate-send-otp-btn" : "auth-send-otp-btn");
  const sendBtnText = document.getElementById(isGate ? "gate-send-btn-text" : "auth-send-btn-text");

  let email = (emailInput ? emailInput.value : "").trim().toLowerCase();
  if (isResend && authTargetEmail) {
    email = authTargetEmail;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    showGateAuthAlert("Kripya ek valid email address enter karein.");
    return;
  }

  authTargetEmail = email;
  if (sendBtnText) sendBtnText.textContent = "Sending Code...";
  if (sendBtn) sendBtn.disabled = true;

  try {
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: authTargetEmail })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      authOtpSessionToken = data.token;
      const targetDisplay = document.getElementById(isGate ? "gate-target-email-display" : "auth-target-email-display");
      if (targetDisplay) targetDisplay.textContent = authTargetEmail;
      switchGateAuthStep("otp");
      showGateAuthAlert("OTP aapke email par bhej diya gaya hai!", false);
    } else {
      showGateAuthAlert(data.error || "OTP bhejne mein asafal. Kripya punah prayas karein.");
    }
  } catch (err) {
    showGateAuthAlert("Network Error: Netlify Function se connect nahi ho saka. " + err.message);
  } finally {
    if (sendBtnText) sendBtnText.textContent = "Send 6-Digit OTP";
    if (sendBtn) sendBtn.disabled = false;
  }
}
window.requestEmailOtp = requestEmailOtp;

async function verifyEmailOtp(isGate = true) {
  const otpInput = document.getElementById(isGate ? "gate-otp-input" : "auth-otp-input");
  const verifyBtnText = document.getElementById(isGate ? "gate-verify-btn-text" : "auth-verify-btn-text");
  const verifyBtn = document.getElementById(isGate ? "gate-verify-btn" : "auth-verify-btn");

  const otp = (otpInput ? otpInput.value : "").trim();
  if (!otp || otp.length !== 6 || isNaN(otp)) {
    showGateAuthAlert("Kripya 6-digit ka sahi code enter karein.");
    return;
  }

  hideGateAuthAlert();
  if (verifyBtnText) verifyBtnText.textContent = "Verifying...";
  if (verifyBtn) verifyBtn.disabled = true;

  try {
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: authTargetEmail,
        otp: otp,
        token: authOtpSessionToken
      })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      const user = data.user;
      localStorage.setItem("jaankar_user", JSON.stringify(user));
      
      // Save / Sync to Firestore users collection for Web Admin visibility
      if (db && user && user.uid) {
        db.collection("users").doc(user.uid).set({
          uid: user.uid,
          email: user.email || "",
          displayName: user.displayName || user.email.split("@")[0],
          device: "Web Browser (OTP)",
          platform: "Web",
          status: "Active",
          source: "user-web",
          lastActive: Date.now(),
          createdAt: Date.now()
        }, { merge: true }).catch(err => console.warn("Firestore sync:", err));
      }

      showGateAuthAlert("Login Safal Raha! Swagatam, " + user.displayName, false);
      setTimeout(() => {
        checkMandatoryAuthGate();
      }, 800);
    } else {
      showGateAuthAlert(data.error || "Galat OTP! Kripya apna email check karein.");
    }
  } catch (err) {
    showGateAuthAlert("Verification network error: " + err.message);
  } finally {
    if (verifyBtnText) verifyBtnText.textContent = "Verify & Enter";
    if (verifyBtn) verifyBtn.disabled = false;
  }
}
window.verifyEmailOtp = verifyEmailOtp;

async function loginWithGoogle() {
  hideGateAuthAlert();
  try {
    if (typeof firebase === "undefined" || !firebase.auth) {
      throw new Error("Firebase Auth SDK loading... Kripya 2 second baad punah prayas karein.");
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");

    const result = await firebase.auth().signInWithPopup(provider);
    const u = result.user;

    const userData = {
      email: u.email,
      displayName: u.displayName || u.email.split("@")[0],
      photoUrl: u.photoURL || "",
      uid: u.uid,
      loginTime: new Date().toISOString()
    };

    localStorage.setItem("jaankar_user", JSON.stringify(userData));

    // Save to Firestore users collection
    if (db && userData.uid) {
      db.collection("users").doc(userData.uid).set({
        uid: userData.uid,
        email: userData.email || "",
        displayName: userData.displayName || "User",
        photoUrl: userData.photoUrl || null,
        device: "Web Browser (Google)",
        platform: "Web",
        status: "Active",
        source: "user-web",
        lastActive: Date.now(),
        createdAt: Date.now()
      }, { merge: true }).catch(err => console.warn("Firestore sync:", err));
    }

    showGateAuthAlert("Google Login Successful!", false);
    setTimeout(() => {
      checkMandatoryAuthGate();
    }, 800);
  } catch (err) {
    console.error("Google sign in note:", err);
    showGateAuthAlert(err.message || "Google Sign-In failed.");
  }
}
window.loginWithGoogle = loginWithGoogle;

function logoutUser() {
  localStorage.removeItem("jaankar_user");
  if (supportChatUnsubscribe) {
    supportChatUnsubscribe();
    supportChatUnsubscribe = null;
  }
  checkMandatoryAuthGate();
  showAppToast("Aap successfully logout ho chuke hain.");
}
window.logoutUser = logoutUser;

// ----------------------------------------------------------------------------
// 5. Sidebar & Master Navigation
// ----------------------------------------------------------------------------
function toggleAppSidebar(forceState = null) {
  const sidebar = document.getElementById("app-sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (!sidebar) return;

  isSidebarOpen = (forceState !== null) ? forceState : !isSidebarOpen;
  if (isSidebarOpen) {
    sidebar.classList.remove("-translate-x-full");
    if (backdrop) backdrop.classList.remove("hidden");
  } else {
    sidebar.classList.add("-translate-x-full");
    if (backdrop) backdrop.classList.add("hidden");
  }
}
window.toggleAppSidebar = toggleAppSidebar;

function toggleSidebarCategorySubmenu() {
  const sublinks = document.getElementById("sidebar-category-sublinks");
  const chevron = document.getElementById("sidebar-cat-chevron");
  if (!sublinks) return;
  const isHidden = sublinks.classList.contains("hidden");
  if (isHidden) {
    sublinks.classList.remove("hidden");
    if (chevron) chevron.style.transform = "rotate(180deg)";
  } else {
    sublinks.classList.add("hidden");
    if (chevron) chevron.style.transform = "rotate(0deg)";
  }
}
window.toggleSidebarCategorySubmenu = toggleSidebarCategorySubmenu;

function switchTab(tabId) {
  currentTab = tabId;
  const allViews = [
    "home",
    "videos-shorts",
    "news",
    "categories",
    "pc-lab",
    "compare",
    "academy",
    "learning",
    "saved",
    "settings",
    "account"
  ];

  allViews.forEach((v) => {
    const el = document.getElementById(`view-${v}`);
    if (el) {
      if (v === tabId) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    }

    // Sidebar active styling
    const sideBtn = document.getElementById(`sidebar-tab-${v}`);
    if (sideBtn) {
      if (v === tabId) {
        sideBtn.className = "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition text-orange-400 bg-orange-600/20 border border-orange-500/30 font-bold";
      } else {
        sideBtn.className = "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition hover:bg-orange-600/10 hover:text-orange-400 text-slate-300 font-bold";
      }
    }
  });

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (tabId === "categories") renderCategoryProducts(currentCategory);
  if (tabId === "news") renderNewsDesk(liveNewsList.length ? liveNewsList : fallbackNews);
  if (tabId === "saved") renderSavedItems();
  if (tabId === "pc-lab" && typeof runPcCompatibilityCheck === "function") runPcCompatibilityCheck();
  if (tabId === "compare" && typeof renderComparisonMatrix === "function") renderComparisonMatrix();
  if (tabId === "settings") loadSettingsInfo();
  if (tabId === "account") renderAccountDetails();

  if (window.lucide && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  }
}
window.switchTab = switchTab;

// ----------------------------------------------------------------------------
// 6. HD Graphic Background & Website CMS Controller
// ----------------------------------------------------------------------------
function applyWebsiteCmsConfig(cfg) {
  if (!cfg) return;

  // 1. Dynamic HD Graphic Background
  const bgLayer = document.getElementById("dynamic-hd-background-layer");
  if (bgLayer) {
    if (cfg.bgGraphicUrl && cfg.bgGraphicUrl.trim().length > 0) {
      bgLayer.style.backgroundImage = `linear-gradient(rgba(11, 15, 25, 0.85), rgba(15, 23, 42, 0.95)), url('${cfg.bgGraphicUrl}')`;
    }
  }

  // 2. Emergency Maintenance Shield
  const shield = document.getElementById("live-web-maintenance-shield");
  if (shield) {
    if (cfg.maintenanceMode) {
      shield.classList.remove("hidden");
      shield.classList.add("flex");
    } else {
      shield.classList.add("hidden");
      shield.classList.remove("flex");
    }
  }

  // 3. Top Announcement Bar
  const bar = document.getElementById("live-web-announcement-bar");
  const txt = document.getElementById("live-announcement-text");
  if (bar && txt) {
    if (cfg.announcementText && cfg.announcementText.trim().length > 0 && cfg.showAnnouncement !== false) {
      txt.textContent = cfg.announcementText;
      bar.classList.remove("hidden");
    } else {
      bar.classList.add("hidden");
    }
  }

  // 4. APK Download Link
  if (cfg.apkDownloadUrl) {
    window.LATEST_APK_URL = cfg.apkDownloadUrl;
    const downloadBtns = document.querySelectorAll(".dynamic-apk-download-trigger");
    downloadBtns.forEach(b => { b.href = cfg.apkDownloadUrl; });
  }

  // 5. Support Contact details
  if (cfg.supportEmail) {
    const el = document.getElementById("settings-support-email");
    if (el) el.textContent = cfg.supportEmail;
  }
  if (cfg.supportPhone) {
    const el = document.getElementById("settings-support-phone");
    if (el) el.textContent = cfg.supportPhone;
  }
}

// ----------------------------------------------------------------------------
// 7. Dynamic Hero Slider (Admin Managed from PC to Web)
// ----------------------------------------------------------------------------
function initHeroSlider() {
  renderHeroSlides(liveHomeSlides.length ? liveHomeSlides : fallbackSlides);
  if (slideIntervalTimer) clearInterval(slideIntervalTimer);
  slideIntervalTimer = setInterval(() => {
    nextSlide();
  }, 5000);
}

function renderHeroSlides(slides) {
  const track = document.getElementById("hero-slider-track");
  const dotsContainer = document.getElementById("hero-slider-dots");
  if (!track) return;

  const list = (slides && slides.length) ? slides : fallbackSlides;
  currentSlideIndex = 0;

  track.innerHTML = list.map((s, idx) => `
    <div class="hero-slide min-w-full h-64 sm:h-80 md:h-96 relative rounded-3xl overflow-hidden flex items-end p-6 sm:p-10 select-none">
      <img src="${s.imageUrl || fallbackSlides[0].imageUrl}" alt="${escapeHtml(s.title)}" class="absolute inset-0 w-full h-full object-cover">
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
      
      <div class="relative z-10 max-w-2xl space-y-2.5">
        <span class="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-orange-600/90 text-white backdrop-blur-sm shadow-md">
          ${escapeHtml(s.badge || "Featured Hub")}
        </span>
        <h2 class="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
          ${escapeHtml(s.title)}
        </h2>
        <p class="text-xs sm:text-sm text-slate-200 line-clamp-2 font-medium max-w-lg">
          ${escapeHtml(s.subtitle || "")}
        </p>
        <div class="pt-2 flex items-center gap-3">
          <button type="button" onclick="handleSlideAction('${s.tabAction || 'categories'}')" class="btn-primary-orange text-xs py-2.5 px-4 sm:px-5 shadow-lg shadow-orange-600/40">
            <span>${escapeHtml(s.btnText || "Explore Now")}</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
          <a href="${window.LATEST_APK_URL || 'https://github.com/Jaankar-Expert/Jaankar/releases/download/v1.1.0/app-release.apk'}" target="_blank" download="JAANKAR-v1.1.0.apk" class="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition flex items-center gap-2">
            <i data-lucide="smartphone" class="w-4 h-4 text-orange-400"></i>
            <span>Download App</span>
          </a>
        </div>
      </div>
    </div>
  `).join("");

  if (dotsContainer) {
    dotsContainer.innerHTML = list.map((_, i) => `
      <button type="button" onclick="goToSlide(${i})" class="w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === 0 ? 'w-8 bg-orange-500' : 'bg-white/40 hover:bg-white/80'}"></button>
    `).join("");
  }

  updateSliderTrackPosition();
  if (window.lucide) lucide.createIcons();
}

function handleSlideAction(act) {
  if (act === "ai") {
    openJaankarAiDrawer();
  } else {
    switchTab(act);
  }
}
window.handleSlideAction = handleSlideAction;

function nextSlide() {
  const track = document.getElementById("hero-slider-track");
  if (!track || !track.children.length) return;
  currentSlideIndex = (currentSlideIndex + 1) % track.children.length;
  updateSliderTrackPosition();
}
window.nextSlide = nextSlide;

function prevSlide() {
  const track = document.getElementById("hero-slider-track");
  if (!track || !track.children.length) return;
  currentSlideIndex = (currentSlideIndex - 1 + track.children.length) % track.children.length;
  updateSliderTrackPosition();
}
window.prevSlide = prevSlide;

function goToSlide(idx) {
  currentSlideIndex = idx;
  updateSliderTrackPosition();
}
window.goToSlide = goToSlide;

function updateSliderTrackPosition() {
  const track = document.getElementById("hero-slider-track");
  const dotsContainer = document.getElementById("hero-slider-dots");
  if (!track) return;
  track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;

  if (dotsContainer && dotsContainer.children) {
    Array.from(dotsContainer.children).forEach((dot, idx) => {
      if (idx === currentSlideIndex) {
        dot.className = "w-8 h-2.5 rounded-full bg-orange-500 transition-all duration-300";
      } else {
        dot.className = "w-2.5 h-2.5 rounded-full bg-white/40 hover:bg-white/80 transition-all duration-300";
      }
    });
  }
}

// ----------------------------------------------------------------------------
// 8. Categories Hub & 6 Electronics Sub-Pages
// ----------------------------------------------------------------------------
function openCategoryTab(catName) {
  currentCategory = catName;
  switchTab("categories");

  // Highlight pill
  const categoryPills = ["computers", "laptops", "mobiles", "tv", "cameras", "audio"];
  categoryPills.forEach(c => {
    const btn = document.getElementById(`cat-pill-${c}`);
    if (btn) {
      if (c === catName) {
        btn.className = "px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-600/30 transition";
      } else {
        btn.className = "px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 font-bold text-xs transition";
      }
    }
  });

  renderCategoryProducts(catName);
}
window.openCategoryTab = openCategoryTab;

function renderCategoryProducts(catName) {
  const container = document.getElementById("category-products-grid");
  const titleEl = document.getElementById("category-page-title");
  const descEl = document.getElementById("category-page-desc");
  if (!container) return;

  const titles = {
    computers: "Desktop Computers & Workstations",
    laptops: "Laptops, Ultrabooks & Gaming Rigs",
    mobiles: "Flagship & Gaming Smartphones",
    tv: "OLED Smart TVs & Gaming Displays",
    cameras: "Mirrorless & Cinema Cameras",
    audio: "Hi-Res Audio, ANC Headphones & Soundbars"
  };

  const descs = {
    computers: "Curated custom gaming builds, enterprise workstations, and liquid-cooled setups.",
    laptops: "Apple Silicon, Intel 14th Gen, and Ryzen 8000 series notebooks with high battery life.",
    mobiles: "Top-tier smartphones with optical zoom, Snapdragon 8 Gen 3/4 chipsets, and AI features.",
    tv: "Infinite contrast OLEDs, 144Hz Mini-LEDs, and HDR10+ gaming monitors.",
    cameras: "Full-frame 4K/8K cameras with 10-bit recording and real-time animal/human eye AF.",
    audio: "Lossless LDAC wireless earphones, studio reference monitors, and spatial audio headsets."
  };

  if (titleEl) titleEl.textContent = titles[catName] || "Electronics Products";
  if (descEl) descEl.textContent = descs[catName] || "Browse certified tech products";

  const allItems = (liveProductsList && liveProductsList.length) ? liveProductsList : defaultProductsCatalog;
  const filtered = allItems.filter(p => (p.category || "").toLowerCase() === catName.toLowerCase());

  if (!filtered.length) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center space-y-3 bg-slate-900/60 border border-slate-800 rounded-3xl p-8">
        <i data-lucide="package-open" class="w-12 h-12 text-slate-500 mx-auto"></i>
        <h4 class="text-base font-bold text-white">No products added in this category yet</h4>
        <p class="text-xs text-slate-400">Web Admin can add products directly from PC with 6 photos and specs!</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(p => {
    const mainImg = p.featuredImage || (p.images && p.images[0]) || defaultProductsCatalog[0].images[0];
    return `
      <div onclick="openProductDetailModal('${p.id}')" class="bg-slate-900/80 border border-slate-800 hover:border-orange-500/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 cursor-pointer group flex flex-col justify-between">
        <div class="space-y-3">
          <div class="relative h-48 rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center p-2">
            <img src="${mainImg}" alt="${escapeHtml(p.name)}" class="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300">
            <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-orange-600/90 text-white shadow-sm">
              ${escapeHtml(p.discount || "DEAL")}
            </span>
          </div>

          <div class="space-y-1">
            <div class="flex items-center justify-between text-[11px] text-slate-400">
              <span class="font-bold text-orange-400">${escapeHtml(p.category.toUpperCase())}</span>
              <span class="flex items-center gap-1"><i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400"></i> ${p.rating || "4.8"}</span>
            </div>
            <h3 class="font-black text-sm text-white group-hover:text-orange-400 transition-colors line-clamp-2">
              ${escapeHtml(p.name)}
            </h3>
            <p class="text-[11px] text-slate-400 line-clamp-2 font-medium">
              ${escapeHtml(p.description || "")}
            </p>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-800 flex items-center justify-between mt-3">
          <div>
            <span class="text-base font-black text-white">${p.price || "₹0"}</span>
            ${p.mrp ? `<span class="text-[11px] text-slate-500 line-through ml-1.5">${p.mrp}</span>` : ""}
          </div>
          <button type="button" class="px-3 py-1.5 rounded-lg bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white font-bold text-xs border border-orange-500/30 transition flex items-center gap-1">
            <span>Details</span>
            <i data-lucide="chevron-right" class="w-3 h-3"></i>
          </button>
        </div>
      </div>
    `;
  }).join("");

  if (window.lucide) lucide.createIcons();
}

// Interactive Product Detail Modal with 5–6 Photo Gallery
function openProductDetailModal(productId) {
  const allItems = (liveProductsList && liveProductsList.length) ? liveProductsList : defaultProductsCatalog;
  const p = allItems.find(item => item.id === productId);
  if (!p) return;

  const modal = document.getElementById("modal-product-detail");
  if (!modal) return;

  const titleEl = document.getElementById("prod-modal-title");
  const catEl = document.getElementById("prod-modal-category");
  const priceEl = document.getElementById("prod-modal-price");
  const mrpEl = document.getElementById("prod-modal-mrp");
  const discEl = document.getElementById("prod-modal-discount");
  const descEl = document.getElementById("prod-modal-description");
  const mainImgEl = document.getElementById("prod-modal-main-image");
  const thumbsContainer = document.getElementById("prod-modal-thumbnails");
  const specsContainer = document.getElementById("prod-modal-specs-table");
  const amazonBtn = document.getElementById("prod-modal-amazon-link");
  const flipkartBtn = document.getElementById("prod-modal-flipkart-link");

  if (titleEl) titleEl.textContent = p.name;
  if (catEl) catEl.textContent = (p.category || "Electronics").toUpperCase();
  if (priceEl) priceEl.textContent = p.price;
  if (mrpEl) mrpEl.textContent = p.mrp ? `M.R.P: ${p.mrp}` : "";
  if (discEl) discEl.textContent = p.discount || "";
  if (descEl) descEl.textContent = p.description || "";

  // Gallery images (up to 6 photos)
  const images = (p.images && p.images.length) ? p.images : [p.featuredImage || defaultProductsCatalog[0].images[0]];
  if (mainImgEl) mainImgEl.src = images[0];

  if (thumbsContainer) {
    thumbsContainer.innerHTML = images.map((img, idx) => `
      <div onclick="switchProductModalImage('${img}', this)" class="w-14 h-14 rounded-xl bg-slate-950 overflow-hidden border-2 transition cursor-pointer ${idx === 0 ? 'border-orange-500 scale-105' : 'border-slate-800 hover:border-slate-600'}">
        <img src="${img}" class="w-full h-full object-cover">
      </div>
    `).join("");
  }

  // Specifications table
  if (specsContainer) {
    const specs = p.specs || {};
    const keys = Object.keys(specs);
    if (!keys.length) {
      specsContainer.innerHTML = `<p class="text-xs text-slate-400">Specifications not detailed.</p>`;
    } else {
      specsContainer.innerHTML = keys.map(k => `
        <div class="flex items-start justify-between py-2 border-b border-slate-800 text-xs">
          <span class="text-slate-400 font-semibold w-1/3">${escapeHtml(k)}</span>
          <span class="text-white font-bold w-2/3 text-right">${escapeHtml(specs[k])}</span>
        </div>
      `).join("");
    }
  }

  // E-Commerce Buy Links (Amazon & Flipkart)
  const buyLinks = p.buyLinks || {};
  if (amazonBtn) {
    amazonBtn.href = buyLinks.amazon || `https://www.amazon.in/s?k=${encodeURIComponent(p.name)}`;
  }
  if (flipkartBtn) {
    flipkartBtn.href = buyLinks.flipkart || `https://www.flipkart.com/search?q=${encodeURIComponent(p.name)}`;
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  if (window.lucide) lucide.createIcons();
}
window.openProductDetailModal = openProductDetailModal;

function switchProductModalImage(imgUrl, el) {
  const mainImgEl = document.getElementById("prod-modal-main-image");
  if (mainImgEl) mainImgEl.src = imgUrl;

  const thumbsContainer = document.getElementById("prod-modal-thumbnails");
  if (thumbsContainer) {
    Array.from(thumbsContainer.children).forEach(c => {
      c.className = "w-14 h-14 rounded-xl bg-slate-950 overflow-hidden border-2 border-slate-800 hover:border-slate-600 transition cursor-pointer";
    });
  }
  if (el) {
    el.className = "w-14 h-14 rounded-xl bg-slate-950 overflow-hidden border-2 border-orange-500 scale-105 transition cursor-pointer";
  }
}
window.switchProductModalImage = switchProductModalImage;

function closeProductDetailModal() {
  const modal = document.getElementById("modal-product-detail");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}
window.closeProductDetailModal = closeProductDetailModal;

// ----------------------------------------------------------------------------
// 9. In-Site Video Modal Player (Local PC Uploads & YouTube Branching)
// ----------------------------------------------------------------------------
function playVideoInApp(videoUrl, title = "JAANKAR Video") {
  if (!videoUrl) {
    alert("No video source provided for this item.");
    return;
  }

  currentPlayingVideoUrl = videoUrl;
  const modal = document.getElementById("modal-video-player");
  const titleEl = document.getElementById("video-modal-title");
  const frameContainer = document.getElementById("video-frame-container");
  const ytBtn = document.getElementById("video-external-youtube-btn");

  if (titleEl) titleEl.textContent = title;

  // Check if YouTube
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = videoUrl.match(ytRegex);

  if (match && match[1]) {
    const embedUrl = `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`;
    frameContainer.innerHTML = `
      <iframe src="${embedUrl}" title="${escapeHtml(title)}" class="w-full h-full rounded-2xl" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    `;
    if (ytBtn) {
      ytBtn.href = videoUrl;
      ytBtn.classList.remove("hidden");
    }
  } else {
    // Native HTML5 Local PC Uploaded Video
    frameContainer.innerHTML = `
      <video controls autoplay class="w-full h-full rounded-2xl bg-black">
        <source src="${videoUrl}" type="video/mp4">
        Your browser does not support HTML5 video.
      </video>
    `;
    if (ytBtn) ytBtn.classList.add("hidden");
  }

  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
  if (window.lucide) lucide.createIcons();
}
window.playVideoInApp = playVideoInApp;

function closeInAppVideoModal() {
  const modal = document.getElementById("modal-video-player");
  const frameContainer = document.getElementById("video-frame-container");
  if (frameContainer) frameContainer.innerHTML = "";
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}
window.closeInAppVideoModal = closeInAppVideoModal;

// ----------------------------------------------------------------------------
// 10. News Desk with Date Calendar & Search
// ----------------------------------------------------------------------------
function renderBreakingNewsSlider(newsArray = null) {
  const container = document.getElementById("breaking-news-carousel");
  if (!container) return;

  const list = newsArray || (liveNewsList.length ? liveNewsList : fallbackNews);
  container.innerHTML = list.slice(0, 5).map(item => `
    <div onclick="openArticleReader('${item.id}')" class="min-w-[280px] sm:min-w-[340px] p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-orange-500/40 flex items-center gap-3 cursor-pointer group transition">
      <img src="${item.imageUrl}" class="w-16 h-16 rounded-xl object-cover shrink-0">
      <div class="flex-1 min-w-0">
        <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-orange-600/30 text-orange-400">BREAKING</span>
        <h4 class="text-xs font-bold text-white group-hover:text-orange-400 truncate mt-1">${escapeHtml(item.title)}</h4>
        <p class="text-[10px] text-slate-400 mt-0.5">${item.readTime || "2 min read"}</p>
      </div>
    </div>
  `).join("");
}

function renderNewsDesk(newsArray = null) {
  const container = document.getElementById("news-desk-container");
  if (!container) return;

  const list = newsArray || (liveNewsList.length ? liveNewsList : fallbackNews);
  container.innerHTML = list.map(item => createNewsCardHtml(item)).join("");
  if (window.lucide) lucide.createIcons();
}

function renderHomeFeed(newsArray = null) {
  const container = document.getElementById("home-news-container");
  if (!container) return;

  const list = newsArray || (liveNewsList.length ? liveNewsList : fallbackNews);
  container.innerHTML = list.slice(0, 6).map(item => createNewsCardHtml(item)).join("");
  if (window.lucide) lucide.createIcons();
}

function filterNewsByDate(dateStr) {
  if (!dateStr) {
    renderNewsDesk(liveNewsList.length ? liveNewsList : fallbackNews);
    return;
  }
  const all = liveNewsList.length ? liveNewsList : fallbackNews;
  const filtered = all.filter(n => {
    if (n.dateTag === dateStr || n.dateStr === dateStr) return true;
    if (n.timestamp) {
      const d = new Date(n.timestamp).toISOString().split("T")[0];
      return d === dateStr;
    }
    return false;
  });

  const resetBtn = document.getElementById("news-date-reset-btn");
  if (resetBtn) resetBtn.classList.remove("hidden");
  renderNewsDesk(filtered);
}
window.filterNewsByDate = filterNewsByDate;

function resetNewsDateFilter() {
  const dateInput = document.getElementById("news-calendar-filter");
  const resetBtn = document.getElementById("news-date-reset-btn");
  if (dateInput) dateInput.value = "";
  if (resetBtn) resetBtn.classList.add("hidden");
  renderNewsDesk(liveNewsList.length ? liveNewsList : fallbackNews);
}
window.resetNewsDateFilter = resetNewsDateFilter;

function handleNewsSearch(query) {
  const q = (query || "").trim().toLowerCase();
  const all = liveNewsList.length ? liveNewsList : fallbackNews;
  if (!q) {
    renderNewsDesk(all);
    return;
  }
  const filtered = all.filter(n => 
    (n.title && n.title.toLowerCase().includes(q)) ||
    (n.content && n.content.toLowerCase().includes(q)) ||
    (n.category && n.category.toLowerCase().includes(q))
  );
  renderNewsDesk(filtered);
}
window.handleNewsSearch = handleNewsSearch;

function createNewsCardHtml(item) {
  const hasVideo = !!item.videoUrl;
  const safeImg = item.imageUrl || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80";
  const dateStr = item.dateTag || (item.timestamp ? new Date(item.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Today");

  return `
    <div class="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col justify-between group transition">
      <div class="relative h-44 bg-slate-950 overflow-hidden cursor-pointer" onclick="openArticleReader('${item.id}')">
        <img src="${safeImg}" alt="${escapeHtml(item.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
        <span class="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/80 text-orange-400 border border-orange-500/30">
          ${escapeHtml(item.category || "TECH")}
        </span>

        ${hasVideo ? `
          <div onclick="event.stopPropagation(); playVideoInApp('${escapeHtml(item.videoUrl)}', '${escapeHtml(item.title)}')"
               class="absolute inset-0 m-auto w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
               title="Play In-App">
            <i data-lucide="play" class="w-6 h-6 fill-white ml-0.5"></i>
          </div>
        ` : ""}
      </div>

      <div class="p-4 flex-1 flex flex-col justify-between space-y-2">
        <div class="space-y-1.5 cursor-pointer" onclick="openArticleReader('${item.id}')">
          <div class="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
            <span>📅 ${dateStr}</span>
            <span>•</span>
            <span>${item.readTime || "3 min read"}</span>
          </div>
          <h4 class="font-bold text-sm text-white group-hover:text-orange-400 transition-colors line-clamp-2">
            ${escapeHtml(item.title)}
          </h4>
          <p class="text-xs text-slate-400 line-clamp-2 font-normal">
            ${escapeHtml(item.content || "")}
          </p>
        </div>

        <div class="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <button type="button" onclick="openArticleReader('${item.id}')" class="font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1">
            <span>Read Article</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </button>
          <button type="button" onclick="shareArticle('${escapeHtml(item.title)}')" class="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-orange-400 transition">
            <i data-lucide="share-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// 11. Reels & Shorts Rail
// ----------------------------------------------------------------------------
function renderReelsRail() {
  const container = document.getElementById("home-reels-container");
  if (!container) return;

  const list = liveReelsList.length ? liveReelsList : fallbackReels;
  container.innerHTML = list.map(reel => `
    <div onclick="playVideoInApp('${escapeHtml(reel.videoUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ")}', '${escapeHtml(reel.title)}')"
         class="relative rounded-2xl overflow-hidden aspect-[9/16] bg-slate-950 group cursor-pointer border border-slate-800 hover:border-orange-500/50 shadow-md transition">
      <img src="${reel.thumbnail}" alt="${escapeHtml(reel.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
      
      <div class="absolute inset-0 m-auto w-10 h-10 rounded-full bg-orange-600/90 text-white flex items-center justify-center group-hover:scale-110 transition shadow-lg">
        <i data-lucide="play" class="w-5 h-5 fill-white ml-0.5"></i>
      </div>

      <div class="absolute bottom-3 left-3 right-3 text-white space-y-1">
        <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/20 backdrop-blur-xs">${reel.views || "100K"} views</span>
        <h5 class="text-[11px] font-bold line-clamp-2 leading-tight">${escapeHtml(reel.title)}</h5>
      </div>
    </div>
  `).join("");
}

// ----------------------------------------------------------------------------
// 12. Jaankar AI Voice Assistant with Flipkart/Amazon Links
// ----------------------------------------------------------------------------
function openJaankarAiDrawer() {
  const drawer = document.getElementById("drawer-jaankar-ai");
  if (drawer) {
    drawer.classList.remove("hidden");
    drawer.classList.add("flex");
  }
}
window.openJaankarAiDrawer = openJaankarAiDrawer;

function closeJaankarAiDrawer() {
  const drawer = document.getElementById("drawer-jaankar-ai");
  if (drawer) {
    drawer.classList.add("hidden");
    drawer.classList.remove("flex");
  }
}
window.closeJaankarAiDrawer = closeJaankarAiDrawer;

function toggleVoiceMic() {
  const micBtn = document.getElementById("ai-mic-btn");
  if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
    alert("Speech recognition is not supported in this browser. Please type your query.");
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = currentLanguage === "hi" ? "hi-IN" : "en-US";
  recognition.interimResults = false;

  if (micBtn) micBtn.classList.add("animate-pulse", "text-rose-500");

  recognition.onstart = () => {
    console.log("Listening to user voice...");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById("ai-chat-input");
    if (input) input.value = transcript;
    handleSendAiMessage(transcript);
  };

  recognition.onerror = (e) => {
    console.warn("Speech recognition error:", e);
  };

  recognition.onend = () => {
    if (micBtn) micBtn.classList.remove("animate-pulse", "text-rose-500");
  };

  recognition.start();
}
window.toggleVoiceMic = toggleVoiceMic;

function speakAiText(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace(/[#*_`]/g, ""));
  utterance.lang = currentLanguage === "hi" ? "hi-IN" : "en-US";
  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
}

function handleSendAiMessage(customPrompt = null) {
  const input = document.getElementById("ai-chat-input");
  const msgContainer = document.getElementById("ai-chat-messages-container");
  if (!msgContainer) return;

  const userQuery = customPrompt || (input ? input.value : "").trim();
  if (!userQuery) return;
  if (input) input.value = "";

  // Append user bubble
  msgContainer.insertAdjacentHTML("beforeend", `
    <div class="flex items-start justify-end gap-2.5">
      <div class="p-3 rounded-2xl rounded-tr-none bg-orange-600 text-white text-xs font-medium max-w-[85%] shadow-md">
        <p>${escapeHtml(userQuery)}</p>
      </div>
    </div>
  `);
  msgContainer.scrollTop = msgContainer.scrollHeight;

  // Typing placeholder
  const typingId = "ai-typing-" + Date.now();
  msgContainer.insertAdjacentHTML("beforeend", `
    <div id="${typingId}" class="flex items-start gap-2.5 max-w-[85%]">
      <div class="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 text-xs font-black shadow-md">AI</div>
      <div class="p-3 rounded-2xl rounded-tl-none bg-slate-800 text-slate-300 text-xs font-medium space-y-1">
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-orange-400 animate-bounce"></span>
          <span class="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style="animation-delay: 0.2s"></span>
          <span class="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style="animation-delay: 0.4s"></span>
        </div>
      </div>
    </div>
  `);
  msgContainer.scrollTop = msgContainer.scrollHeight;

  setTimeout(() => {
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();

    const q = userQuery.toLowerCase();
    let reply = "";
    let buyCard = "";

    if (q.includes("phone") || q.includes("mobile") || q.includes("20000") || q.includes("25000") || q.includes("s24")) {
      reply = "📱 **Top Smartphone Recommendations:**\n\n1. **Samsung Galaxy S24 Ultra**: Titanium body, 200MP camera & Snapdragon 8 Gen 3.\n2. **OnePlus Nord CE4 5G**: Best value under ₹25,000 with 100W fast charging & Sony LYT-600 sensor.";
      buyCard = `
        <div class="mt-2.5 p-3 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between gap-2">
          <div>
            <p class="text-xs font-bold text-white">Samsung S24 Ultra 5G</p>
            <p class="text-[10px] text-orange-400 font-bold">₹1,24,999 (7% Off)</p>
          </div>
          <div class="flex items-center gap-1.5">
            <a href="https://www.amazon.in/s?k=s24+ultra" target="_blank" class="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] transition">Amazon</a>
            <a href="https://www.flipkart.com/search?q=s24+ultra" target="_blank" class="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] transition">Flipkart</a>
          </div>
        </div>
      `;
    } else if (q.includes("laptop") || q.includes("macbook") || q.includes("gaming")) {
      reply = "💻 **Recommended Laptops:**\n\n1. **Apple MacBook Pro 14 (M3 Pro)**: 18 hours battery life, 120Hz ProMotion XDR display.\n2. **Lenovo LOQ 15**: Intel Core i5 + RTX 4050 for heavy coding and 1080p gaming.";
      buyCard = `
        <div class="mt-2.5 p-3 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between gap-2">
          <div>
            <p class="text-xs font-bold text-white">Apple MacBook Pro M3</p>
            <p class="text-[10px] text-orange-400 font-bold">₹1,89,900</p>
          </div>
          <div class="flex items-center gap-1.5">
            <a href="https://www.amazon.in/s?k=macbook+pro+m3" target="_blank" class="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] transition">Amazon</a>
            <a href="https://www.flipkart.com/search?q=macbook+pro+m3" target="_blank" class="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] transition">Flipkart</a>
          </div>
        </div>
      `;
    } else {
      reply = `Namaste! Aapka prashna mila: "${escapeHtml(userQuery)}".\n\nJAANKAR AI ke anusar, kisi bhi tech product ko kharidne se pehle Processor, RAM generation (DDR5) aur warranty terms zaroor verify karein. Categories tab mein sabhi 6 categories ke specs live updated hain!`;
    }

    msgContainer.insertAdjacentHTML("beforeend", `
      <div class="flex items-start gap-2.5 max-w-[85%]">
        <div class="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 text-xs font-black shadow-md">AI</div>
        <div class="p-3.5 rounded-2xl rounded-tl-none bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium space-y-1.5">
          <p class="whitespace-pre-line leading-relaxed">${reply}</p>
          ${buyCard}
        </div>
      </div>
    `);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // Speak aloud with SpeechSynthesis
    speakAiText(reply.split("\n")[0] || reply);
  }, 600);
}
window.handleSendAiMessage = handleSendAiMessage;

// ----------------------------------------------------------------------------
// 13. Account Portal (Avatar Upload from PC, Edit Profile & Sub-Pages)
// ----------------------------------------------------------------------------
function renderAccountDetails() {
  const savedUserStr = localStorage.getItem("jaankar_user");
  if (!savedUserStr) return;
  try {
    const user = JSON.parse(savedUserStr);
    updateUserUiDisplays(user);
    renderSavedItems();
  } catch (_) {}
}

function handleUserAvatarUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64Img = e.target.result;
    const savedUserStr = localStorage.getItem("jaankar_user");
    if (savedUserStr) {
      const user = JSON.parse(savedUserStr);
      user.photoUrl = base64Img;
      localStorage.setItem("jaankar_user", JSON.stringify(user));
      updateUserUiDisplays(user);

      // Save to Firestore
      if (db && user.uid) {
        db.collection("users").doc(user.uid).set({
          photoUrl: base64Img,
          updatedAt: Date.now()
        }, { merge: true }).then(() => {
          showAppToast("Profile photo successfully updated!");
        }).catch(err => {
          console.warn("Avatar upload Firestore note:", err);
        });
      }
    }
  };
  reader.readAsDataURL(file);
}
window.handleUserAvatarUpload = handleUserAvatarUpload;

function openEditProfileModal() {
  const modal = document.getElementById("modal-edit-profile");
  const savedUserStr = localStorage.getItem("jaankar_user");
  if (!modal || !savedUserStr) return;

  const user = JSON.parse(savedUserStr);
  const nameInp = document.getElementById("profile-name-input");
  const phoneInp = document.getElementById("profile-phone-input");
  const addressInp = document.getElementById("profile-address-input");

  if (nameInp) nameInp.value = user.displayName || user.name || "";
  if (phoneInp) phoneInp.value = user.phone || "";
  if (addressInp) addressInp.value = user.address || "";

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}
window.openEditProfileModal = openEditProfileModal;

function closeEditProfileModal() {
  const modal = document.getElementById("modal-edit-profile");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}
window.closeEditProfileModal = closeEditProfileModal;

function saveUserProfile() {
  const nameInp = document.getElementById("profile-name-input");
  const phoneInp = document.getElementById("profile-phone-input");
  const addressInp = document.getElementById("profile-address-input");
  const savedUserStr = localStorage.getItem("jaankar_user");
  if (!savedUserStr) return;

  const user = JSON.parse(savedUserStr);
  if (nameInp) user.displayName = nameInp.value.trim() || user.displayName;
  if (phoneInp) user.phone = phoneInp.value.trim();
  if (addressInp) user.address = addressInp.value.trim();

  localStorage.setItem("jaankar_user", JSON.stringify(user));
  updateUserUiDisplays(user);

  if (db && user.uid) {
    db.collection("users").doc(user.uid).set({
      displayName: user.displayName,
      phone: user.phone || "",
      address: user.address || "",
      updatedAt: Date.now()
    }, { merge: true }).then(() => {
      showAppToast("Profile details updated!");
      closeEditProfileModal();
    }).catch(e => {
      alert("Error saving profile: " + e.message);
    });
  } else {
    closeEditProfileModal();
  }
}
window.saveUserProfile = saveUserProfile;

function switchAccountSubTab(subTab) {
  const tabs = ["learning", "saved", "downloads"];
  tabs.forEach(t => {
    const section = document.getElementById(`acc-section-${t}`);
    const btn = document.getElementById(`acc-subtab-${t}`);
    if (section) {
      if (t === subTab) section.classList.remove("hidden");
      else section.classList.add("hidden");
    }
    if (btn) {
      if (t === subTab) {
        btn.className = "flex-1 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs shadow-md transition";
      } else {
        btn.className = "flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-400 font-bold text-xs hover:text-white transition";
      }
    }
  });

  if (subTab === "saved") renderSavedItems();
}
window.switchAccountSubTab = switchAccountSubTab;

// ----------------------------------------------------------------------------
// 14. Settings & 2-Way Live Help Desk (Text, Image & Audio Voice Notes)
// ----------------------------------------------------------------------------
function loadSettingsInfo() {
  const emailEl = document.getElementById("settings-support-email");
  const phoneEl = document.getElementById("settings-support-phone");
  if (emailEl && !emailEl.textContent) emailEl.textContent = "support@jaankar.in";
  if (phoneEl && !phoneEl.textContent) phoneEl.textContent = "+91 98765 43210";
}

function initSupportChatStream(userId) {
  if (!db || !userId) return;
  if (supportChatUnsubscribe) {
    supportChatUnsubscribe();
    supportChatUnsubscribe = null;
  }

  const streamContainer = document.getElementById("support-chat-stream");
  if (!streamContainer) return;

  supportChatUnsubscribe = db.collection("support_chats").doc(userId).collection("messages")
    .orderBy("timestamp", "asc")
    .onSnapshot((snapshot) => {
      if (!snapshot || snapshot.empty) {
        streamContainer.innerHTML = `
          <div class="text-center py-8 text-xs text-slate-400 space-y-1">
            <i data-lucide="message-square" class="w-8 h-8 text-slate-600 mx-auto"></i>
            <p>Welcome to JAANKAR Live Support.</p>
            <p>You can send text messages, images, or record voice notes!</p>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      streamContainer.innerHTML = snapshot.docs.map(doc => {
        const d = doc.data();
        const isAdmin = d.sender === "admin";
        return `
          <div class="flex items-start ${isAdmin ? 'justify-start' : 'justify-end'} gap-2">
            ${isAdmin ? `<div class="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">AD</div>` : ""}
            <div class="p-3 rounded-2xl ${isAdmin ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700' : 'bg-orange-600 text-white rounded-tr-none'} text-xs max-w-[80%] space-y-2 shadow-sm">
              ${d.text ? `<p class="whitespace-pre-line">${escapeHtml(d.text)}</p>` : ""}
              ${d.imageUrl ? `<img src="${d.imageUrl}" class="w-48 h-auto rounded-lg object-cover cursor-pointer" onclick="window.open('${d.imageUrl}', '_blank')">` : ""}
              ${d.audioUrl ? `<audio controls src="${d.audioUrl}" class="w-48 h-8 rounded-lg mt-1"></audio>` : ""}
              <p class="text-[9px] text-right ${isAdmin ? 'text-slate-400' : 'text-orange-200'}">${d.timestamp ? new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</p>
            </div>
          </div>
        `;
      }).join("");

      streamContainer.scrollTop = streamContainer.scrollHeight;
      if (window.lucide) lucide.createIcons();
    }, (err) => {
      console.warn("Support stream note:", err.message);
    });
}

async function sendSupportTextMessage() {
  const input = document.getElementById("support-chat-input");
  const text = (input ? input.value : "").trim();
  if (!text) return;
  input.value = "";

  const savedUserStr = localStorage.getItem("jaankar_user");
  const user = savedUserStr ? JSON.parse(savedUserStr) : { uid: "guest_user", email: "guest@jaankar.in", displayName: "Guest" };
  const userId = user.uid || user.email;

  if (db) {
    try {
      await db.collection("support_chats").doc(userId).collection("messages").add({
        sender: "user",
        text: text,
        timestamp: Date.now()
      });

      await db.collection("support_chats").doc(userId).set({
        userId: userId,
        userName: user.displayName || user.name || "User",
        userEmail: user.email || "",
        lastMessage: text,
        lastTimestamp: Date.now(),
        unreadAdminCount: firebase.firestore.FieldValue.increment(1)
      }, { merge: true });
    } catch (e) {
      console.error("Support msg error:", e);
    }
  }
}
window.sendSupportTextMessage = sendSupportTextMessage;

function handleSupportImageUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64Img = e.target.result;
    const savedUserStr = localStorage.getItem("jaankar_user");
    const user = savedUserStr ? JSON.parse(savedUserStr) : { uid: "guest_user" };
    const userId = user.uid || user.email;

    if (db) {
      await db.collection("support_chats").doc(userId).collection("messages").add({
        sender: "user",
        text: "Attached Image",
        imageUrl: base64Img,
        timestamp: Date.now()
      });

      await db.collection("support_chats").doc(userId).set({
        lastMessage: "📷 Sent an image",
        lastTimestamp: Date.now(),
        unreadAdminCount: firebase.firestore.FieldValue.increment(1)
      }, { merge: true });
    }
  };
  reader.readAsDataURL(file);
}
window.handleSupportImageUpload = handleSupportImageUpload;

async function toggleSupportVoiceRecording() {
  const recBtn = document.getElementById("support-voice-btn");
  if (!isRecordingVoice) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks = [];
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result;
          const savedUserStr = localStorage.getItem("jaankar_user");
          const user = savedUserStr ? JSON.parse(savedUserStr) : { uid: "guest_user" };
          const userId = user.uid || user.email;

          if (db) {
            await db.collection("support_chats").doc(userId).collection("messages").add({
              sender: "user",
              text: "🎤 Voice Note",
              audioUrl: base64Audio,
              timestamp: Date.now()
            });

            await db.collection("support_chats").doc(userId).set({
              lastMessage: "🎤 Sent a voice note",
              lastTimestamp: Date.now(),
              unreadAdminCount: firebase.firestore.FieldValue.increment(1)
            }, { merge: true });
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      isRecordingVoice = true;
      if (recBtn) recBtn.classList.add("bg-rose-600", "text-white", "animate-pulse");
      showAppToast("Voice recording started... Speak now!");
    } catch (err) {
      alert("Microphone access denied: " + err.message);
    }
  } else {
    if (mediaRecorder && isRecordingVoice) {
      mediaRecorder.stop();
      isRecordingVoice = false;
      if (recBtn) recBtn.classList.remove("bg-rose-600", "text-white", "animate-pulse");
      showAppToast("Voice note sent to support desk!");
    }
  }
}
window.toggleSupportVoiceRecording = toggleSupportVoiceRecording;

// ----------------------------------------------------------------------------
// 15. Global Live Search Engine
// ----------------------------------------------------------------------------
function handleGlobalSearch(query) {
  const q = (query || "").trim().toLowerCase();
  const dropdown = document.getElementById("home-search-results-dropdown");
  if (!dropdown) return;

  if (!q || q.length < 2) {
    dropdown.classList.add("hidden");
    return;
  }

  const allNews = liveNewsList.length ? liveNewsList : fallbackNews;
  const allProds = liveProductsList.length ? liveProductsList : defaultProductsCatalog;

  const matchedNews = allNews.filter(n => (n.title && n.title.toLowerCase().includes(q))).slice(0, 3);
  const matchedProds = allProds.filter(p => (p.name && p.name.toLowerCase().includes(q)) || (p.category && p.category.toLowerCase().includes(q))).slice(0, 3);

  if (!matchedNews.length && !matchedProds.length) {
    dropdown.innerHTML = `
      <div class="p-4 text-center text-xs text-slate-400">
        No direct results found for "${escapeHtml(q)}". Try searching "iPhone", "MacBook", "RTX", or "AI".
      </div>
    `;
    dropdown.classList.remove("hidden");
    return;
  }

  let html = `<div class="p-2 space-y-1">`;
  if (matchedProds.length) {
    html += `<div class="px-3 py-1 text-[10px] font-black uppercase text-orange-400">Products & Gadgets</div>`;
    matchedProds.forEach(p => {
      html += `
        <div onclick="openProductDetailModal('${p.id}'); document.getElementById('home-search-results-dropdown').classList.add('hidden')" class="p-2.5 rounded-xl hover:bg-slate-800 flex items-center justify-between cursor-pointer transition">
          <div class="flex items-center gap-2.5">
            <img src="${p.featuredImage || p.images[0]}" class="w-8 h-8 rounded-lg object-cover">
            <div>
              <p class="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs">${escapeHtml(p.name)}</p>
              <p class="text-[10px] text-slate-400">${escapeHtml(p.category.toUpperCase())}</p>
            </div>
          </div>
          <span class="text-xs font-black text-orange-400">${p.price}</span>
        </div>
      `;
    });
  }

  if (matchedNews.length) {
    html += `<div class="px-3 py-1 text-[10px] font-black uppercase text-blue-400 mt-2">News Articles</div>`;
    matchedNews.forEach(n => {
      html += `
        <div onclick="openArticleReader('${n.id}'); document.getElementById('home-search-results-dropdown').classList.add('hidden')" class="p-2.5 rounded-xl hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer transition">
          <img src="${n.imageUrl}" class="w-8 h-8 rounded-lg object-cover">
          <p class="text-xs font-bold text-white truncate">${escapeHtml(n.title)}</p>
        </div>
      `;
    });
  }
  html += `</div>`;

  dropdown.innerHTML = html;
  dropdown.classList.remove("hidden");
}
window.handleGlobalSearch = handleGlobalSearch;

// ----------------------------------------------------------------------------
// 16. Article Reader Modal & Bookmarking
// ----------------------------------------------------------------------------
function openArticleReader(articleId) {
  const all = liveNewsList.length ? liveNewsList : fallbackNews;
  const article = all.find(a => a.id === articleId);
  if (!article) return;

  const modal = document.getElementById("article-reader-modal");
  const titleEl = document.getElementById("reader-title");
  const catEl = document.getElementById("reader-category");
  const dateEl = document.getElementById("reader-date");
  const authorEl = document.getElementById("reader-author");
  const imgEl = document.getElementById("reader-image");
  const contentEl = document.getElementById("reader-body");

  if (titleEl) titleEl.textContent = article.title;
  if (catEl) catEl.textContent = (article.category || "Technology").toUpperCase();
  if (dateEl) dateEl.textContent = article.dateTag || "Latest";
  if (authorEl) authorEl.textContent = article.author || "JAANKAR Editorial";
  if (imgEl) imgEl.src = article.imageUrl;
  if (contentEl) contentEl.textContent = article.content || "Full article body coming soon.";

  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
  if (window.lucide) lucide.createIcons();
}
window.openArticleReader = openArticleReader;

function closeArticleReader() {
  const modal = document.getElementById("article-reader-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}
window.closeArticleReader = closeArticleReader;

function isItemSaved(id) {
  try {
    const list = JSON.parse(localStorage.getItem("jaankar_saved_items") || "[]");
    return list.some(item => item.id === id);
  } catch (_) {
    return false;
  }
}

function renderSavedItems() {
  const container = document.getElementById("saved-items-container");
  if (!container) return;
  try {
    const list = JSON.parse(localStorage.getItem("jaankar_saved_items") || "[]");
    if (!list.length) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center text-xs text-slate-400 space-y-2">
          <i data-lucide="bookmark" class="w-8 h-8 text-slate-600 mx-auto"></i>
          <p>No saved items yet. Bookmark gadgets or news to view them offline!</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }
    container.innerHTML = list.map(item => `
      <div class="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <img src="${item.image || fallbackNews[0].imageUrl}" class="w-12 h-12 rounded-xl object-cover">
          <div>
            <h4 class="text-xs font-bold text-white">${escapeHtml(item.title || "Saved Item")}</h4>
            <span class="text-[10px] text-slate-400">${escapeHtml(item.type || "Article")}</span>
          </div>
        </div>
      </div>
    `).join("");
    if (window.lucide) lucide.createIcons();
  } catch (_) {}
}

// ----------------------------------------------------------------------------
// 17. Utilities & Toasts
// ----------------------------------------------------------------------------
function toggleLanguage() {
  currentLanguage = currentLanguage === "hi" ? "en" : "hi";
  localStorage.setItem("jaankar_lang", currentLanguage);
  applyTranslations();
  showAppToast(currentLanguage === "hi" ? "भाषा हिन्दी में सेट की गई" : "Language set to English");
}
window.toggleLanguage = toggleLanguage;

function applyTranslations() {
  const langText = document.getElementById("current-lang-text");
  if (langText) langText.textContent = currentLanguage === "hi" ? "हिन्दी" : "English";
}

function showAppToast(msg) {
  let toast = document.getElementById("jaankar-app-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "jaankar-app-toast";
    toast.className = "fixed bottom-6 right-6 z-[9999999] px-4 py-3 rounded-2xl bg-orange-600 text-white font-bold text-xs shadow-2xl transition-all duration-300 transform translate-y-12 opacity-0 pointer-events-none";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.remove("translate-y-12", "opacity-0", "pointer-events-none");
  setTimeout(() => {
    toast.classList.add("translate-y-12", "opacity-0", "pointer-events-none");
  }, 3000);
}
window.showAppToast = showAppToast;

function shareCurrentPage() {
  if (navigator.share) {
    navigator.share({
      title: "JAANKAR — Technology & Knowledge Hub",
      text: "Check out the new JAANKAR Tech Hub with PC Compatibility Lab & Electronics Matrix!",
      url: window.location.href
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href);
    showAppToast("Link copied to clipboard!");
  }
}
window.shareCurrentPage = shareCurrentPage;

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
window.escapeHtml = escapeHtml;
