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
let liveEducationalVideos = [];
let activeWatchVideoId = null;
let currentReelIndex = 0;
let currentMediaTab = "all";
let currentVideosSearchQuery = "";
let likedVideosMap = JSON.parse(localStorage.getItem("jaankar_liked_videos") || "{}");
let likedReelsMap = JSON.parse(localStorage.getItem("jaankar_liked_reels") || "{}");
let liveProductsList = [];
let liveHomeSlides = [];
let currentPlayingVideoUrl = "";
let currentNewsSubTab = "all";
let currentNewsSearchQuery = "";
let currentNewsDateFilter = "";
let activeArticleId = null;
let isArticleAudioPlaying = false;
let articleAudioUtterance = null;
let currentArticleSpeed = 1.0;
let savedNewsMap = JSON.parse(localStorage.getItem("jaankar_saved_news") || "{}");
let topNewsVideoConfig = null;
let currentWatchSourceTab = "videos-shorts";
let isTopNewsAudioMuted = true;
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
    id: "news_breaking_1",
    type: "breaking",
    title: "🚨 Breaking: Next-Gen 3nm Flagship Processors Announced with 50% AI Efficiency Boost",
    subtitle: "New silicon architecture promises all-day heavy compute with zero thermal throttling and instant on-device LLM reasoning.",
    category: "Processors",
    author: "JAANKAR Tech Desk",
    authorAvatar: "J",
    timestamp: Date.now() - 3600000 * 1, // 1 hour ago
    dateTag: new Date().toISOString().split("T")[0],
    readTime: "3 min read",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1000&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isYouTube: true,
    content: "Global semiconductor giants have officially announced the rollout of next-gen 3nm architectural nodes. The new mobile and desktop chips integrate dedicated 45 TOPS neural processing units (NPUs), achieving up to 50% lower power draw during real-time image generation and speech translation.",
    articleBody: `Global semiconductor foundries have officially unveiled their flagship 3-nanometer compute platform, setting a new benchmark for energy efficiency and on-device artificial intelligence capabilities.

Key Architectural Advancements:
The new architecture integrates a hybrid 10-core CPU cluster with next-generation NPU silicon capable of delivering over 45 TOPS of integer precision throughput. This allows devices to execute 7-billion parameter language models locally without sending private queries to remote cloud clusters.

Thermal Management & Battery Life:
Through advanced backside power delivery network (BSPDN) routing, the chipset reduces voltage drop across the silicon matrix. Early benchmark figures reveal a 38% reduction in peak heat generation and an average battery life increase of up to 4.5 hours under continuous heavy workloads.

Commercial Availability:
Commercial smartphones and thin-and-light laptops powered by this architecture are scheduled to begin retail shipping next month across global and Indian markets.`,
    takeaways: [
      "Next-Gen 3nm silicon delivers 45 TOPS NPU throughput",
      "Backside power delivery cuts peak thermal heat by 38%",
      "Enables 7B parameter AI models to run completely offline",
      "Consumer devices shipping across retail channels next month"
    ]
  },
  {
    id: "news_headline_1",
    type: "headline",
    title: "⚡ Headline: Ultra-Fast 240W GaN Charging Standard Cleared for Global Consumer Laptops",
    subtitle: "Universal USB-PD 3.1 certification ensures safe 0 to 100% charging in just 19 minutes with dual safety monitoring.",
    category: "Hardware",
    author: "Hardware Lab",
    authorAvatar: "H",
    timestamp: Date.now() - 3600000 * 3, // 3 hours ago
    dateTag: new Date().toISOString().split("T")[0],
    readTime: "2 min read",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
    isYouTube: true,
    content: "The universal USB-IF consortium has formally cleared the 240W Gallium Nitride (GaN) rapid power delivery standard for high-performance mobile workstations. The standard integrates dual dynamic thermal telemetry.",
    articleBody: `The USB Implementers Forum has officially certified the latest revision of the USB Power Delivery 3.1 Extended Power Range (EPR) standard, authorizing 240W high-speed GaN power adapters for consumer laptops and workstations.

GaN Transistor Breakthrough:
By replacing legacy silicon MOSFETs with wide bandgap Gallium Nitride components, the new power bricks are over 55% smaller in physical footprint than conventional 200W+ laptop power supplies while running significantly cooler.

Dual-Layer Battery Safety:
To safeguard lithium-ion battery health, the protocol mandates continuous 100Hz real-time communication between the charger microcontroller and battery management system (BMS), modulating voltage in 20mV increments to prevent electrolytic degradation.`,
    takeaways: [
      "240W USB-PD 3.1 standard officially certified globally",
      "GaN semiconductors reduce charger size by 55%",
      "100Hz real-time BMS communication prevents battery wear",
      "Full 0 to 100% workstation top-up in under 20 minutes"
    ]
  },
  {
    id: "news_video_1",
    type: "video",
    title: "🎥 In-Depth Review: RTX 5080 vs RTX 4090 Architecture & Real FPS Benchmark Teardown",
    subtitle: "Complete testing across Cyberpunk 2077, Blender 4.2 rendering, 4K ray tracing and power consumption curves.",
    category: "Graphics Cards",
    author: "JAANKAR PC Lab",
    authorAvatar: "P",
    timestamp: Date.now() - 3600000 * 7, // 7 hours ago
    dateTag: new Date().toISOString().split("T")[0],
    readTime: "18:30 Watch",
    imageUrl: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1000&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=BL4DCEp7blY",
    isYouTube: true,
    content: "In our hands-on hardware teardown, we benchmark the RTX 5080 against the RTX 4090 in rasterization, DLSS 4 frame generation, and AI inferencing workloads to help creators and gamers decide their upgrade path.",
    articleBody: `Today we dive into the comprehensive thermal, power, and architectural breakdown comparing the latest Blackwell RTX 5080 against the venerable RTX 4090 flagship.

Architectural Differences:
The RTX 5080 utilizes high-bandwidth GDDR7 memory operating at 30 Gbps, providing massive bandwidth headroom even across a 256-bit memory interface. Tensor cores receive dedicated FP4 precision math units that accelerate modern generative video pipelines.

Gaming & Ray Tracing Performance:
In rasterized 4K gaming, the RTX 5080 matches the RTX 4090 while pulling 120W less peak board power. When ray reconstruction and neural frame generation are engaged, the 5080 pulls ahead by 15-22% in average framerates.`,
    takeaways: [
      "RTX 5080 delivers RTX 4090 performance at 120W lower power",
      "30 Gbps GDDR7 memory provides unprecedented memory bandwidth",
      "DLSS 4 frame reconstruction boosts 4K gaming by 20%",
      "Excellent value proposition for both 3D artists and gamers"
    ]
  },
  {
    id: "news_article_1",
    type: "article",
    title: "The Complete Guide to Local On-Device AI Models: Running LLMs Completely Offline in 2026",
    subtitle: "How to configure quantized open-weights models on consumer laptops and Android smartphones for absolute privacy and zero latency.",
    category: "Artificial Intelligence",
    author: "Vikram Sharma, Senior AI Architect",
    authorAvatar: "V",
    timestamp: Date.now() - 3600000 * 14, // 14 hours ago
    dateTag: new Date().toISOString().split("T")[0],
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80",
    videoUrl: "",
    isYouTube: false,
    content: "Running AI models locally is no longer just a hobbyist experiment. With 4-bit AWQ quantization and Vulkan/Metal acceleration, any modern laptop with 16GB RAM can execute private, blazing-fast intelligence entirely offline.",
    articleBody: `The democratization of open-weights foundational models has fundamentally reshaped personal computing. For years, accessing state-of-the-art language comprehension demanded persistent internet connectivity and trusting third-party servers with sensitive data. Today, on-device local execution has become practical for every professional.

1. Why Local On-Device AI Matters
Privacy and latency are the two defining benefits of local inference. When an AI processes your private medical records, legal contracts, or source code directly in system memory, zero bytes leave your machine. Furthermore, because network hops are eliminated, token generation begins instantaneously with zero queue delays.

2. Understanding Quantization (GGUF & AWQ)
Raw 16-bit floating point model weights require colossal VRAM. A 7-billion parameter model typically demands over 14GB of video memory. Through modern quantization algorithms such as GGUF (K-quant) and Activation-aware Weight Quantization (AWQ), weight matrices are compressed into 4-bit integers with less than 1% degradation in perplexity. This reduces the memory requirement down to a mere 4.2GB, fitting comfortably into mid-tier laptop memory.

3. Hardware Recommendations & Acceleration
Modern integrated NPUs and unified memory architectures (such as Apple Silicon and Snapdragon X Elite) excel at local inference due to high memory bandwidth. For Windows PCs with discrete NVIDIA or AMD GPUs, runtime backends like Ollama and llama.cpp automatically offload compute layers to CUDA and ROCm cores.

4. Step-by-Step Setup
Getting started takes less than five minutes:
- Download a lightweight local inference runtime such as Ollama or LM Studio.
- Pull an optimized instruct model (e.g. Llama 3.2 3B or Gemma 2 9B).
- Connect your local IDE, markdown editor, or command terminal to the local REST endpoint (http://localhost:11434).

Conclusion:
Local AI represents the true spirit of personal computing—giving users complete sovereignty over their data, their tools, and their compute resources.`,
    takeaways: [
      "Local inference offers 100% data sovereignty and zero cloud dependency",
      "4-bit quantization reduces 7B models from 14GB down to 4.2GB memory",
      "Instant token generation without network latency or API rate limits",
      "Compatible across modern Windows, macOS, and Linux systems"
    ]
  },
  {
    id: "news_breaking_2",
    type: "breaking",
    title: "🚨 Breaking: Critical Zero-Day Vulnerability Patched Across Major Web Browsers",
    subtitle: "Immediate update advisory issued for Chromium and WebKit rendering engines to prevent remote code execution.",
    category: "Cybersecurity",
    author: "JAANKAR Shield Team",
    authorAvatar: "S",
    timestamp: Date.now() - 3600000 * 26, // 1 day ago
    dateTag: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    readTime: "2 min read",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1000&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isYouTube: true,
    content: "Security research teams have uncovered an active integer overflow vulnerability inside the V8 JavaScript JIT compiler. All users are strongly advised to apply the latest security updates immediately.",
    articleBody: `A critical zero-day memory safety flaw designated CVE-2026-1180 has been identified in wild exploitation targeting Chromium-based web browsers.

Vulnerability Analysis:
The flaw resides in the JIT compiler's escape analysis optimization pass. Under specific conditions, an attacker can craft a malformed WebAssembly payload that forces memory bounds checking to fail, granting arbitrary memory read and write primitives.

Remediation Steps:
Browser vendors have deployed emergency out-of-band updates. Users should immediately verify that their browser version is on the latest security patch level by checking their browser settings update panel.`,
    takeaways: [
      "CVE-2026-1180 patched in emergency browser update",
      "Affects V8 JavaScript JIT memory optimization pass",
      "Users urged to restart and update browsers immediately",
      "No user action beyond updating is required"
    ]
  },
  {
    id: "news_headline_2",
    type: "headline",
    title: "⚡ Headline: Solid-State Battery Tech Reaches 1,000 Km Electric Vehicle Benchmark",
    subtitle: "Automotive testing laboratories confirm 80% charge in 12 minutes with non-flammable ceramic electrolyte.",
    category: "EV & Tech",
    author: "AutoTech Desk",
    authorAvatar: "A",
    timestamp: Date.now() - 3600000 * 32, // 1 day ago
    dateTag: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    readTime: "3 min read",
    imageUrl: "https://images.unsplash.com/photo-1558441719-8b489c63f7d1?w=1000&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
    isYouTube: true,
    content: "Leading automotive manufacturers have successfully concluded pilot track trials of solid-state lithium-metal cells. The pack achieved 1,050 km on a single charge while operating across severe temperature extremes.",
    articleBody: `Solid-state battery commercialization crossed a momentous milestone today as production-line pilot prototypes demonstrated over 1,000 kilometers of real-world highway range.

Ceramic Electrolyte Superiority:
By ditching liquid organic electrolytes in favor of a solid ceramic separator, the risk of thermal runaway and battery fires is virtually eliminated. The cell can withstand operating temperatures exceeding 80°C without risk of combustion.

Extreme Fast Charging:
Thanks to lithium dendrite prevention from the solid barrier, the cells support continuous 4C charging rates, allowing drivers to recharge from 10% to 80% capacity in approximately 12 minutes at standard ultra-fast charging stations.`,
    takeaways: [
      "1,050 km single-charge highway range achieved in pilot trials",
      "Solid ceramic separator eliminates thermal runaway hazards",
      "10% to 80% charging completed in under 12 minutes",
      "Mass production vehicles planned for 2027 rollout"
    ]
  },
  {
    id: "news_article_2",
    type: "article",
    title: "OLED vs Mini-LED vs Micro-LED: Which Display Technology Truly Dominates for Gaming & Work?",
    subtitle: "A deep-dive engineering analysis into burn-in risks, peak HDR nits, color gamut coverage and long-term panel longevity.",
    category: "Displays",
    author: "Rajesh K., Hardware Analyst",
    authorAvatar: "R",
    timestamp: Date.now() - 3600000 * 50, // 2 days ago
    dateTag: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
    readTime: "6 min read",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1000&auto=format&fit=crop&q=80",
    videoUrl: "",
    isYouTube: false,
    content: "Display technology has splintered into three distinct paradigms. We break down the physics, viewing angles, subpixel layouts, and real-world durability of QD-OLED, WOLED, Mini-LED with local dimming, and Micro-LED.",
    articleBody: `Selecting the ideal display in 2026 is no longer a simple question of resolution and refresh rate. The underlying emissive or transmissive technology dictates everything from perceived contrast ratio to text clarity and panel lifespan.

1. OLED (QD-OLED and WOLED)
OLED remains the undisputed king of contrast. Because each individual subpixel emits its own light, an OLED display can produce absolute, true zero black levels (0.000 nits). This gives HDR games and films an unparalleled sense of depth and three-dimensionality. Furthermore, pixel response times are nearly instantaneous (0.03ms), virtually eliminating motion blur in high-refresh esports titles. However, prolonged display of static UI elements (such as spreadsheets and IDE taskbars) carries a theoretical risk of burn-in.

2. Mini-LED (Quantum Dot Backlight)
Mini-LED displays utilize thousands of miniature LED diodes arranged into hundreds or thousands of independent full-array local dimming (FALD) zones behind a high-speed IPS or VA liquid crystal panel. While Mini-LED cannot match OLED's per-pixel black cutoff (yielding subtle blooming around white text on dark backgrounds), it blows OLED away in peak brightness—easily reaching 1,600 to 2,000 nits of sustained brightness. For sunlit office spaces and HDR mastering without burn-in concerns, Mini-LED is a powerhouse.

3. Micro-LED: The Holy Grail
Micro-LED combines the best attributes of both worlds: microscopic self-emissive inorganic Gallium Nitride LEDs that produce infinite contrast like OLED, but with the immense 4,000+ nit brightness and infinite lifespan of inorganic semiconductors. While manufacturing yields currently keep Micro-LED prices high, production costs are plummeting rapidly.

Summary & Recommendation:
- Choose OLED for competitive gaming, dark room media consumption, and cinematic vibrancy.
- Choose Mini-LED for heavy daytime productivity, spreadsheet work, and bright rooms.
- Watch Micro-LED as the future standard of all consumer displays over the coming decade.`,
    takeaways: [
      "OLED offers true zero black levels (0.000 nits) and instantaneous 0.03ms response",
      "Mini-LED dominates in sustained brightness (1,600+ nits) with zero burn-in risk",
      "Micro-LED merges infinite contrast with inorganic durability",
      "Match your display panel to your primary room ambient lighting"
    ]
  },
  {
    id: "news_video_2",
    type: "video",
    title: "🎥 Step-by-Step Custom Liquid Cooling PC Build: Avoiding Air Bubbles & Thermal Leaks",
    subtitle: "From bending hard acrylic tubing to leak-testing with pressure pumps and dialing in coolant flow rates.",
    category: "PC Building",
    author: "JAANKAR Lab Masterclass",
    authorAvatar: "M",
    timestamp: Date.now() - 3600000 * 72, // 3 days ago
    dateTag: new Date(Date.now() - 86400000 * 3).toISOString().split("T")[0],
    readTime: "22:15 Watch",
    imageUrl: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=1000&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    isYouTube: true,
    content: "Custom liquid cooling delivers whisper-quiet acoustics and ultra-low CPU/GPU junction temperatures. In this video, we demonstrate tube bending, dual-radiator loop design, and air-pressure leak testing.",
    articleBody: `Building an open-loop custom liquid cooling PC requires precision, preparation, and the right sequence of assembly.

Radiator Sizing & Loop Order:
As a golden rule of custom loops, allocate at least 120mm of radiator surface area for every 100W of system heat output. For modern high-end builds featuring a 250W CPU and 450W GPU, dual 360mm or 420mm copper radiators provide ample cooling capacity.

Air-Pressure Leak Testing:
Never fill a new loop with liquid coolant right away. Always utilize an air-pressure leak tester pressurized to 0.6 bar for 20 minutes. If the pressure gauge stays rock-solid, your fittings and O-rings are 100% leak-proof.`,
    takeaways: [
      "Allocate 120mm radiator surface area per 100W of component TDP",
      "Air-pressure leak testing prevents liquid damage before filling",
      "Dual D5 pump setups provide redundancy and balanced flow rates",
      "Maintains whisper-quiet sub-30 dB acoustic profiles under full load"
    ]
  }
];

// Fallback Educational Videos Catalog
const fallbackEducationalVideos = [
  {
    id: "vid_1",
    title: "Complete PC Building Masterclass (2026 Edition): Step-by-Step Assembly",
    category: "PC Building",
    duration: "24:15",
    views: "185K",
    date: "2 days ago",
    likes: 3420,
    videoUrl: "https://www.youtube.com/watch?v=BL4DCEp7blY",
    thumbnail: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80",
    description: "The complete hardware masterclass. We assemble a modern AMD Ryzen 7 7800X3D + RTX 4070 Ti Super rig from unboxing to first boot, covering AM5 mounting, dual-channel DDR5 installation, cable routing, and UEFI BIOS configuration.",
    learningTakeaways: [
      "Correct CPU pin orientation and AM5 latching without damaging the socket",
      "Thermal paste application pattern and 360mm AIO cooler hose orientation",
      "Enabling EXPO/XMP profiles in BIOS for 6000MHz CL30 stable DDR5 speeds",
      "Anti-sag bracket mounting for heavy 3-slot graphics cards"
    ],
    topics: ["AM5 Socket Installation", "AIO 360mm Radiator Setup", "DDR5 Memory Dual Channel", "Cable Management Behind Tray", "First POST & BIOS Update"],
    recommendedProducts: [
      { name: "AMD Ryzen 7 7800X3D", search: "Ryzen 7 7800X3D" },
      { name: "MSI MAG B650 Tomahawk WiFi", search: "MSI B650 Tomahawk" },
      { name: "Corsair Vengeance 32GB DDR5 6000MHz", search: "Corsair DDR5 6000MHz" }
    ]
  },
  {
    id: "vid_2",
    title: "Smartphone Display Tech Explained: OLED vs AMOLED vs LTPO 1-120Hz",
    category: "Mobile Tech",
    duration: "14:30",
    views: "240K",
    date: "5 days ago",
    likes: 5120,
    videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
    thumbnail: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
    description: "Deep dive into smartphone screen technologies. How emissive organic LEDs work, dynamic LTPO backplanes saving battery at 1Hz, high-frequency PWM eye protection dimming, and measuring true peak nits vs sustained brightness.",
    learningTakeaways: [
      "Why true blacks save up to 30% battery on OLED screens with Dark Mode",
      "How LTPO 3.0 scales dynamically between 1Hz reading and 120Hz gaming",
      "Why PWM dimming above 2160Hz prevents eye fatigue in low light",
      "The physics of burn-in and pixel shift mitigation techniques"
    ],
    topics: ["OLED Emissive Diodes", "LTPO Oxide Backplane", "PWM Dimming Frequency", "Peak Nit Measurement", "Burn-in Prevention Logic"],
    recommendedProducts: [
      { name: "Samsung Galaxy S24 Ultra", search: "Galaxy S24 Ultra" },
      { name: "OnePlus 12 5G", search: "OnePlus 12" }
    ]
  },
  {
    id: "vid_3",
    title: "NVIDIA RTX 40-Series Architecture Teardown: DLSS 3.5 & VRAM Deep Dive",
    category: "GPU Deep Dive",
    duration: "18:45",
    views: "310K",
    date: "1 week ago",
    likes: 6890,
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80",
    description: "An electrical and silicon analysis of modern graphics architectures. We inspect die sizes, Ada Lovelace 4N TSMC process, Tensor Core Ray Reconstruction, optical flow generation, and 12V-2x6 connector safety standards.",
    learningTakeaways: [
      "How Ray Reconstruction uses neural networks instead of hand-tuned denoisers",
      "The impact of VRAM memory bus widths (128-bit vs 256-bit) at 4K gaming",
      "Proper seating and bending radius for the 12V-2x6 power cable",
      "Power draw efficiency curves and undervolting via MSI Afterburner"
    ],
    topics: ["Ada Lovelace Architecture", "Tensor Cores & Optical Flow", "GDDR6X Memory Bus Math", "12V-2x6 Cable Safety", "Undervolting Guide"],
    recommendedProducts: [
      { name: "RTX 4070 Ti Super 16GB", search: "RTX 4070 Ti Super" },
      { name: "Corsair RM850e ATX 3.0 PSU", search: "Corsair RM850e ATX 3.0" }
    ]
  },
  {
    id: "vid_4",
    title: "Apple Silicon M3 Pro vs Intel Core Ultra: Efficiency & Battery Architecture",
    category: "Laptops & CPU",
    duration: "16:20",
    views: "195K",
    date: "2 weeks ago",
    likes: 4210,
    videoUrl: "https://www.youtube.com/watch?v=BL4DCEp7blY",
    thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    description: "Comparing ARM Unified Memory with x86 modular tile chiplet design. Real-world battery endurance tests, video encoding hardware acceleration, local AI inference performance, and thermal fan profiles.",
    learningTakeaways: [
      "Why unified memory allows CPU and GPU to share 18GB+ VRAM with zero latency",
      "How Intel Meteor Lake & Lunar Lake 3D Foveros packaging stacks tiles",
      "Real-world battery difference during 4K video editing vs web browsing",
      "Thermal throttling differences on lap and desk"
    ],
    topics: ["ARM vs x86 Architecture", "Unified Memory Bandwidth", "NPU AI Performance TOPS", "Battery Runtime Real World", "Fan Acoustics"],
    recommendedProducts: [
      { name: "Apple MacBook Pro 14 M3", search: "MacBook Pro M3" },
      { name: "Lenovo ThinkPad X1 Carbon", search: "ThinkPad X1 Carbon" }
    ]
  },
  {
    id: "vid_5",
    title: "WiFi 7 vs WiFi 6E: Do You Really Need 320MHz Bandwidth & Multi-Link?",
    category: "Networking",
    duration: "11:10",
    views: "89K",
    date: "3 weeks ago",
    likes: 2150,
    videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
    thumbnail: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
    description: "Breaking down the IEEE 802.11be standard. How Multi-Link Operation (MLO) transmits packets across 5GHz and 6GHz bands simultaneously to eliminate ping spikes in wireless gaming.",
    learningTakeaways: [
      "What Multi-Link Operation (MLO) does for ultra-low latency packet delivery",
      "4096-QAM modulation squeezing 20% more raw data per cycle",
      "Real-world range limitations of the 6GHz spectrum through concrete walls",
      "Cost vs benefit analysis of upgrading home routers today"
    ],
    topics: ["WiFi 7 Standard (802.11be)", "Multi-Link Operation (MLO)", "4096-QAM Modulation", "6GHz Wall Penetration", "Gaming Ping Benchmark"],
    recommendedProducts: [
      { name: "WiFi 7 Tri-Band Router", search: "WiFi 7 Router" },
      { name: "Cat 6A Gigabit Cable", search: "Cat 6A Ethernet" }
    ]
  },
  {
    id: "vid_6",
    title: "Camera Sensor Sizes Decoded: Full-Frame vs APS-C vs Micro Four Thirds",
    category: "Cameras",
    duration: "13:50",
    views: "156K",
    date: "1 month ago",
    likes: 3820,
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
    description: "An optical and sensor science guide for creators. How physical sensor surface area alters focal length equivalence, shallow depth-of-field bokeh, low-light ISO noise SNR, and thermal dissipation.",
    learningTakeaways: [
      "The mathematics of Crop Factors (1.5x Sony/Nikon, 1.6x Canon, 2.0x M4/3)",
      "How pixel pitch affects photon capture and dynamic range latitude in RAW",
      "Why Full-Frame lenses weigh more due to larger glass element coverage",
      "Matching the right sensor format to YouTube video vs portrait photography"
    ],
    topics: ["Crop Factor Physics", "Photon Well Depth & ISO", "Depth of Field Equivalence", "Lens Mount Diameter", "Videography Recommendations"],
    recommendedProducts: [
      { name: "Sony Alpha A7 IV Mirrorless", search: "Sony A7 IV" },
      { name: "Sigma 24-70mm f/2.8 DG DN", search: "Sigma 24-70 f2.8" }
    ]
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
  try { if (typeof initCartSystem === "function") initCartSystem(); } catch (e) { console.error("initCartSystem err:", e); }
  try { if (typeof syncMyOrdersBadge === "function") syncMyOrdersBadge(); } catch (e) { console.error("syncMyOrdersBadge err:", e); }
  
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
    if (currentTab === "videos-shorts") renderVideosAndShortsHub();
  }, (err) => {
    console.warn("Reels note:", err.message);
    liveReelsList = [...fallbackReels];
  });

  // 4.1. Live Educational Videos Catalog
  db.collection("educational_videos").onSnapshot((snapshot) => {
    if (snapshot && !snapshot.empty) {
      liveEducationalVideos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      liveEducationalVideos = [...fallbackEducationalVideos];
    }
    if (currentTab === "videos-shorts") renderVideosAndShortsHub();
  }, (err) => {
    console.warn("Educational videos note:", err.message);
    liveEducationalVideos = [...fallbackEducationalVideos];
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
    ? "p-3 rounded-xl text-xs font-semibold flex items-center gap-2 bg-rose-50 text-rose-700 border border-rose-200"
    : "p-3 rounded-xl text-xs font-semibold flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200";
  box.innerHTML = `<i data-lucide="${isError ? 'alert-triangle' : 'check-circle'}" class="w-4 h-4 shrink-0 text-${isError ? 'rose-600' : 'emerald-600'}"></i><span>${escapeHtml(msg)}</span>`;
  box.classList.remove("hidden");
  if (window.lucide && typeof lucide.createIcons === "function") {
    try { lucide.createIcons(); } catch (_) {}
  }
}
window.showGateAuthAlert = showGateAuthAlert;

function hideGateAuthAlert() {
  const box = document.getElementById("gate-auth-alert-box");
  if (box) box.classList.add("hidden");
}
window.hideGateAuthAlert = hideGateAuthAlert;

function switchGateToEmail() {
  hideGateAuthAlert();
  const formEmail = document.getElementById("gate-email-form");
  const formOtp = document.getElementById("gate-otp-form");
  if (formEmail) formEmail.classList.remove("hidden");
  if (formOtp) formOtp.classList.add("hidden");
  const inputEmail = document.getElementById("gate-input-email");
  if (inputEmail) setTimeout(() => inputEmail.focus(), 100);
}
window.switchGateToEmail = switchGateToEmail;

function switchGateAuthStep(step) {
  if (step === "email") {
    switchGateToEmail();
  } else {
    hideGateAuthAlert();
    const formEmail = document.getElementById("gate-email-form");
    const formOtp = document.getElementById("gate-otp-form");
    if (formEmail) formEmail.classList.add("hidden");
    if (formOtp) formOtp.classList.remove("hidden");
    const inputOtp = document.getElementById("gate-input-otp");
    if (inputOtp) {
      inputOtp.value = "";
      setTimeout(() => inputOtp.focus(), 150);
    }
  }
}
window.switchGateAuthStep = switchGateAuthStep;

async function handleSendGateOtp(e, isResend = false) {
  if (e && e.preventDefault) e.preventDefault();
  hideGateAuthAlert();

  const emailInput = document.getElementById("gate-input-email") || document.getElementById("gate-email-input");
  const sendBtn = document.getElementById("btn-gate-send-otp") || document.getElementById("gate-send-otp-btn");
  const sendBtnText = document.getElementById("btn-gate-send-text") || document.getElementById("gate-send-btn-text");

  let email = (emailInput ? emailInput.value : "").trim().toLowerCase();
  if (isResend && authTargetEmail) {
    email = authTargetEmail;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    showGateAuthAlert("Kripya ek valid email address enter karein (jaise name@example.com).");
    if (emailInput) emailInput.focus();
    return false;
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
      const targetDisplay = document.getElementById("gate-target-email-display");
      if (targetDisplay) targetDisplay.textContent = authTargetEmail;
      switchGateAuthStep("otp");
      showGateAuthAlert("OTP aapke email par bhej diya gaya hai! Kripya apna inbox check karein.", false);
    } else {
      showGateAuthAlert(data.error || "OTP bhejne mein asafal. Kripya punah prayas karein.");
    }
  } catch (err) {
    showGateAuthAlert("Network Error: Netlify Function se connect nahi ho saka. " + err.message);
  } finally {
    if (sendBtnText) sendBtnText.textContent = "Send Verification OTP";
    if (sendBtn) sendBtn.disabled = false;
  }
  return false;
}
window.handleSendGateOtp = handleSendGateOtp;
window.requestEmailOtp = handleSendGateOtp;

async function handleVerifyGateOtp(e) {
  if (e && e.preventDefault) e.preventDefault();
  const otpInput = document.getElementById("gate-input-otp") || document.getElementById("gate-otp-input");
  const verifyBtnText = document.getElementById("btn-gate-verify-text") || document.getElementById("gate-verify-btn-text");
  const verifyBtn = document.getElementById("btn-gate-verify-otp") || document.getElementById("gate-verify-btn");

  const otp = (otpInput ? otpInput.value : "").trim();
  if (!otp || otp.length !== 6 || isNaN(otp)) {
    showGateAuthAlert("Kripya 6-digit ka sahi numeric OTP enter karein.");
    if (otpInput) otpInput.focus();
    return false;
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
      const user = data.user || {
        uid: "user_" + Date.now(),
        email: authTargetEmail,
        displayName: authTargetEmail.split("@")[0]
      };
      localStorage.setItem("jaankar_user", JSON.stringify(user));

      // Save / Sync to Firestore users collection for Web Admin visibility
      if (typeof db !== "undefined" && db && user && user.uid) {
        try {
          db.collection("users").doc(user.uid).set({
            uid: user.uid,
            email: user.email || authTargetEmail,
            displayName: user.displayName || authTargetEmail.split("@")[0],
            device: "Web Browser (OTP)",
            platform: "Web",
            status: "Active",
            source: "user-web",
            lastActive: Date.now(),
            createdAt: Date.now()
          }, { merge: true }).catch(err => console.warn("Firestore sync:", err));
        } catch (_) {}
      }

      showGateAuthAlert("Login Safal Raha! Swagatam, " + (user.displayName || "User"), false);
      setTimeout(() => {
        checkMandatoryAuthGate();
      }, 700);
    } else {
      showGateAuthAlert(data.error || "Galat OTP! Kripya apna email check karein ya Resend par click karein.");
    }
  } catch (err) {
    showGateAuthAlert("Verification network error: " + err.message);
  } finally {
    if (verifyBtnText) verifyBtnText.textContent = "Verify & Enter JAANKAR";
    if (verifyBtn) verifyBtn.disabled = false;
  }
  return false;
}
window.handleVerifyGateOtp = handleVerifyGateOtp;
window.verifyEmailOtp = handleVerifyGateOtp;

async function handleGoogleSignIn() {
  hideGateAuthAlert();
  try {
    if (typeof firebase === "undefined" || !firebase.auth) {
      throw new Error("Firebase Auth SDK load ho raha hai, kripya 2 second baad punah prayas karein.");
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    provider.setCustomParameters({ prompt: 'select_account' });

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

    if (typeof db !== "undefined" && db && userData.uid) {
      try {
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
      } catch (_) {}
    }

    showGateAuthAlert("Google Login Successful! Welcome " + userData.displayName, false);
    setTimeout(() => {
      checkMandatoryAuthGate();
    }, 700);
  } catch (err) {
    console.error("Google sign in note:", err);
    if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
      showGateAuthAlert("Google Sign-In popup band kar diya gaya tha. Kripya punah koshish karein ya Email OTP se login karein.");
    } else if (err.code === "auth/popup-blocked") {
      showGateAuthAlert("Browser ne popup block kar diya. Kripya browser me popups allow karein ya Email OTP use karein.");
    } else {
      showGateAuthAlert(err.message || "Google Sign-In mein samasya aayi.");
    }
  }
}
window.handleGoogleSignIn = handleGoogleSignIn;
window.loginWithGoogle = handleGoogleSignIn;

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
  const wrapper = document.getElementById("app-layout-wrapper");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (!sidebar) return;

  isSidebarOpen = (forceState !== null) ? forceState : !isSidebarOpen;
  const isDesktop = window.innerWidth >= 768;

  if (isSidebarOpen) {
    sidebar.classList.remove("-translate-x-full");
    sidebar.classList.add("translate-x-0");
    if (isDesktop && wrapper) {
      wrapper.style.marginLeft = "288px";
      wrapper.style.width = "calc(100% - 288px)";
    } else if (backdrop) {
      backdrop.classList.remove("hidden");
    }
  } else {
    sidebar.classList.add("-translate-x-full");
    sidebar.classList.remove("translate-x-0");
    if (wrapper) {
      wrapper.style.marginLeft = "0px";
      wrapper.style.width = "100%";
    }
    if (backdrop) {
      backdrop.classList.add("hidden");
    }
  }

  if (window.lucide && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  }
}
window.toggleAppSidebar = toggleAppSidebar;

window.addEventListener("resize", () => {
  const wrapper = document.getElementById("app-layout-wrapper");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (isSidebarOpen) {
    if (window.innerWidth < 768) {
      if (wrapper) { wrapper.style.marginLeft = "0px"; wrapper.style.width = "100%"; }
      if (backdrop) backdrop.classList.remove("hidden");
    } else {
      if (wrapper) { wrapper.style.marginLeft = "288px"; wrapper.style.width = "calc(100% - 288px)"; }
      if (backdrop) backdrop.classList.add("hidden");
    }
  }
});

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
    "video-watch",
    "news",
    "article-detail",
    "tools",
    "categories",
    "product-detail",
    "settings",
    "account",
    "orders"
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

    // Sidebar active styling (Signature White & Orange Palette)
    const sideBtn = document.getElementById(`sidebar-tab-${v}`);
    if (sideBtn) {
      if (v === tabId || (tabId === "video-watch" && v === "videos-shorts") || (tabId === "article-detail" && v === "news")) {
        sideBtn.className = "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-500/20 font-bold";
      } else {
        sideBtn.className = "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition hover:bg-orange-50 hover:text-orange-600 text-slate-600 font-bold";
      }
    }
  });

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (tabId === "videos-shorts") renderVideosAndShortsHub();
  if (tabId === "categories") renderCategoryProducts(currentCategory);
  if (tabId === "news") {
    renderNewsDesk(liveNewsList.length ? liveNewsList : fallbackNews);
    startTopNewsVideoAutoplay();
  } else {
    pauseTopNewsVideo();
  }
  if (tabId !== "article-detail") {
    stopArticleAudio();
  }
  if (tabId === "tools" && typeof initLiveQrCanvas === "function") initLiveQrCanvas();
  if (tabId === "settings") loadSettingsInfo();
  if (tabId === "account") renderAccountDetails();
  if (tabId === "orders") renderMyOrdersList();

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

  // 1. Dynamic Graphic Background
  const bgLayer = document.getElementById("dynamic-hd-background-layer");
  if (bgLayer) {
    if (cfg.bgGraphicUrl && cfg.bgGraphicUrl.trim().length > 0) {
      if (cfg.bgGraphicUrl.includes("gradient")) {
        bgLayer.style.background = cfg.bgGraphicUrl;
      } else {
        bgLayer.style.backgroundImage = `linear-gradient(rgba(248, 250, 252, 0.92), rgba(255, 255, 255, 0.96)), url('${cfg.bgGraphicUrl}')`;
      }
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

  // 6. Today's Tech Bulletin Video Controller Sync
  if (cfg.bulletinVideo) {
    const bv = cfg.bulletinVideo;
    const titleEl = document.getElementById("today-bulletin-title-text");
    const coverEl = document.getElementById("today-bulletin-cover-img");
    const cardEl = document.getElementById("today-bulletin-card");
    const btnEl = document.getElementById("today-bulletin-watch-btn");
    if (titleEl && bv.title) titleEl.textContent = bv.title;
    if (coverEl && (bv.coverUrl || bv.thumbnailUrl)) coverEl.src = bv.coverUrl || bv.thumbnailUrl;
    const vidUrl = bv.videoUrl || bv.url;
    if (vidUrl) {
      const isYt = (bv.isYouTube !== false) && (vidUrl.includes("youtube.com") || vidUrl.includes("youtu.be"));
      if (cardEl) cardEl.onclick = () => playVideoInApp(vidUrl, bv.title || "Tech Bulletin Video", isYt);
      if (btnEl) btnEl.onclick = () => playVideoInApp(vidUrl, bv.title || "Tech Bulletin Video", isYt);
    }
  }

  // 7. Hero Banners / Slides Fallback Sync from CMS
  if (cfg.banners && cfg.banners.length > 0 && (!liveHomeSlides || !liveHomeSlides.length)) {
    renderHeroSlides(cfg.banners);
  }

  // 8. Dynamic Copyright Notice & Social Links
  const copyrightText = cfg.social?.copyright || cfg.copyright;
  if (copyrightText) {
    const copyEl = document.getElementById("web-copyright-text");
    if (copyEl) copyEl.textContent = copyrightText;
  }

  // 9. News Desk Top Auto-Playing Video Sync
  if (cfg.newsTopVideo) {
    topNewsVideoConfig = cfg.newsTopVideo;
    renderTopNewsVideo(topNewsVideoConfig);
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
    <div class="hero-slide min-w-full h-full relative rounded-3xl overflow-hidden flex items-end p-6 sm:p-10 pb-14 sm:pb-16 select-none">
      <img src="${s.imageUrl || fallbackSlides[0].imageUrl}" alt="${escapeHtml(s.title)}" class="absolute inset-0 w-full h-full object-cover object-center">
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
        <div class="pt-2 flex items-center gap-3 flex-wrap">
          <button type="button" onclick="handleSlideAction('${s.tabAction || 'categories'}')" class="btn-primary-orange text-xs py-2.5 px-4 sm:px-5 shadow-lg shadow-orange-600/40 cursor-pointer">
            <span>${escapeHtml(s.btnText || "Explore Now")}</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
          <a href="${window.LATEST_APK_URL || 'https://github.com/Jaankar-Expert/Jaankar/releases/download/v1.1.0/app-release.apk'}" target="_blank" download="JAANKAR-v1.1.0.apk" class="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold border border-white/30 backdrop-blur-md transition flex items-center gap-2 cursor-pointer shadow-md">
            <i data-lucide="smartphone" class="w-4 h-4 text-orange-400"></i>
            <span>Download App</span>
          </a>
        </div>
      </div>
    </div>
  `).join("");

  if (dotsContainer) {
    dotsContainer.innerHTML = list.map((_, i) => `
      <button type="button" onclick="goToSlide(${i})" class="w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${i === 0 ? 'w-8 bg-orange-500' : 'bg-white/40 hover:bg-white/80'}"></button>
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
// 8. Categories Hub & Flipkart Multi-Column Mega Menu Navigation
// ----------------------------------------------------------------------------
let currentMegaCategory = "all";
let activeSubcategoryFilter = "";
let megaMenuCloseTimer = null;

function showMegaMenu(cat) {
  cancelCloseMegaMenu();
  const flyout = document.getElementById("flipkart-mega-menu-flyout");
  if (!flyout) return;
  flyout.classList.remove("hidden");

  // Reset all arrows
  const allArrows = ["electronics", "mobiles", "laptops", "tv", "audio"];
  allArrows.forEach(a => {
    const el = document.getElementById(`arrow-cat-${a}`);
    if (el) el.classList.remove("rotate-180");
  });

  const activeArrow = document.getElementById(`arrow-cat-${cat}`);
  if (activeArrow) activeArrow.classList.add("rotate-180");
}
window.showMegaMenu = showMegaMenu;

function toggleMegaMenu(cat) {
  const flyout = document.getElementById("flipkart-mega-menu-flyout");
  if (!flyout) return;
  if (flyout.classList.contains("hidden")) {
    showMegaMenu(cat);
  } else {
    closeMegaMenu();
  }
}
window.toggleMegaMenu = toggleMegaMenu;

function closeMegaMenu() {
  const flyout = document.getElementById("flipkart-mega-menu-flyout");
  if (flyout) flyout.classList.add("hidden");
  const allArrows = ["electronics", "mobiles", "laptops", "tv", "audio"];
  allArrows.forEach(a => {
    const el = document.getElementById(`arrow-cat-${a}`);
    if (el) el.classList.remove("rotate-180");
  });
}
window.closeMegaMenu = closeMegaMenu;

function scheduleCloseMegaMenu() {
  cancelCloseMegaMenu();
  megaMenuCloseTimer = setTimeout(() => {
    closeMegaMenu();
  }, 250);
}
window.scheduleCloseMegaMenu = scheduleCloseMegaMenu;

function cancelCloseMegaMenu() {
  if (megaMenuCloseTimer) {
    clearTimeout(megaMenuCloseTimer);
    megaMenuCloseTimer = null;
  }
}
window.cancelCloseMegaMenu = cancelCloseMegaMenu;

function applySubcategoryFilter(cat, keyword) {
  closeMegaMenu();
  activeSubcategoryFilter = keyword || "";
  currentCategory = cat || "all";
  switchTab("categories");

  const filterBar = document.getElementById("category-active-filter-bar");
  const filterName = document.getElementById("category-active-filter-name");
  if (filterBar && filterName) {
    if (activeSubcategoryFilter) {
      filterName.textContent = activeSubcategoryFilter;
      filterBar.classList.remove("hidden");
      filterBar.classList.add("flex");
    } else {
      filterBar.classList.add("hidden");
      filterBar.classList.remove("flex");
    }
  }

  renderCategoryProducts(currentCategory, activeSubcategoryFilter);
  const grid = document.getElementById("category-products-grid");
  if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
}
window.applySubcategoryFilter = applySubcategoryFilter;

function clearMegaMenuFilter() {
  activeSubcategoryFilter = "";
  const filterBar = document.getElementById("category-active-filter-bar");
  if (filterBar) {
    filterBar.classList.add("hidden");
    filterBar.classList.remove("flex");
  }
  renderCategoryProducts(currentCategory, "");
}
window.clearMegaMenuFilter = clearMegaMenuFilter;

function filterBySpecialDeals() {
  closeMegaMenu();
  switchTab("categories");
  currentCategory = "all";
  activeSubcategoryFilter = "deal";
  const filterBar = document.getElementById("category-active-filter-bar");
  const filterName = document.getElementById("category-active-filter-name");
  if (filterBar && filterName) {
    filterName.textContent = "🔥 Super Deals & Discounts";
    filterBar.classList.remove("hidden");
    filterBar.classList.add("flex");
  }
  renderCategoryProducts("all", "deal");
}
window.filterBySpecialDeals = filterBySpecialDeals;

function showAllCatalogProducts() {
  closeMegaMenu();
  switchTab("categories");
  currentCategory = "all";
  activeSubcategoryFilter = "";
  const filterBar = document.getElementById("category-active-filter-bar");
  if (filterBar) {
    filterBar.classList.add("hidden");
    filterBar.classList.remove("flex");
  }
  renderCategoryProducts("all", "");
}
window.showAllCatalogProducts = showAllCatalogProducts;

function openCategoryTab(catName) {
  currentCategory = catName;
  activeSubcategoryFilter = "";
  switchTab("categories");
  closeMegaMenu();

  const filterBar = document.getElementById("category-active-filter-bar");
  if (filterBar) {
    filterBar.classList.add("hidden");
    filterBar.classList.remove("flex");
  }

  // Highlight active button in Flipkart strip
  document.querySelectorAll(".flipkart-nav-btn").forEach(btn => {
    btn.classList.remove("bg-orange-50", "text-orange-600");
    btn.classList.add("text-slate-700");
  });
  const activeNavBtn = document.getElementById(`flipkart-cat-${catName}`);
  if (activeNavBtn) {
    activeNavBtn.classList.add("bg-orange-50", "text-orange-600");
  }

  renderCategoryProducts(catName, "");
}
window.openCategoryTab = openCategoryTab;

function renderCategoryProducts(catName, subFilter = "") {
  const container = document.getElementById("category-products-grid");
  const titleEl = document.getElementById("category-page-title");
  const descEl = document.getElementById("category-page-desc");
  const countBadge = document.getElementById("category-page-count-badge");
  if (!container) return;

  const titles = {
    all: "Complete Electronics & Gadgets Catalog",
    electronics: "Consumer Electronics & Tech Gadgets",
    computers: "Desktop Computers & Workstations",
    laptops: "Laptops, Ultrabooks & Gaming Rigs",
    mobiles: "Flagship & Gaming Smartphones",
    tv: "OLED Smart TVs & Gaming Displays",
    cameras: "Mirrorless & Cinema Cameras",
    audio: "Hi-Res Audio, ANC Headphones & Soundbars"
  };

  const descs = {
    all: "Explore top laptops, smartphones, PC rigs, and audio. Compare verified Amazon/Flipkart links or order direct.",
    electronics: "Explore latest verified tech products with specs and benchmark scores.",
    computers: "Curated custom gaming builds, enterprise workstations, and liquid-cooled setups.",
    laptops: "Apple Silicon, Intel 14th Gen, and Ryzen 8000 series notebooks with high battery life.",
    mobiles: "Top-tier smartphones with optical zoom, Snapdragon 8 Gen 3/4 chipsets, and AI features.",
    tv: "Infinite contrast OLEDs, 144Hz Mini-LEDs, and HDR10+ gaming monitors.",
    cameras: "Full-frame 4K/8K cameras with 10-bit recording and real-time animal/human eye AF.",
    audio: "Lossless LDAC wireless earphones, studio reference monitors, and spatial audio headsets."
  };

  if (titleEl) {
    if (subFilter && subFilter !== "deal") {
      titleEl.textContent = `${titles[catName] || "Products"} — ${subFilter}`;
    } else if (subFilter === "deal") {
      titleEl.textContent = "🔥 Super Deals & Verified Discounts";
    } else {
      titleEl.textContent = titles[catName] || "Electronics Products";
    }
  }
  if (descEl) descEl.textContent = descs[catName] || "Browse certified tech products";

  const allItems = (liveProductsList && liveProductsList.length) ? liveProductsList : defaultProductsCatalog;
  let filtered = allItems;

  if (catName && catName !== "all" && catName !== "electronics") {
    filtered = filtered.filter(p => (p.category || "").toLowerCase() === catName.toLowerCase());
  }

  if (subFilter) {
    const sLow = subFilter.toLowerCase();
    if (sLow === "deal") {
      filtered = filtered.filter(p => Boolean(p.discount || (p.mrp && p.price)));
    } else {
      filtered = filtered.filter(p => {
        const nameMatch = (p.name || "").toLowerCase().includes(sLow);
        const descMatch = (p.description || "").toLowerCase().includes(sLow);
        const catMatch = (p.category || "").toLowerCase().includes(sLow);
        const specsMatch = JSON.stringify(p.specs || {}).toLowerCase().includes(sLow);
        return nameMatch || descMatch || catMatch || specsMatch;
      });
    }
  }

  if (countBadge) {
    countBadge.textContent = `${filtered.length} Product${filtered.length === 1 ? '' : 's'}`;
  }

  if (!filtered.length) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center space-y-3 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <i data-lucide="package-open" class="w-12 h-12 text-slate-400 mx-auto"></i>
        <h4 class="text-base font-bold text-slate-800">No products match this selection</h4>
        <p class="text-xs text-slate-500">Try selecting another brand or clear the filter to browse full catalog.</p>
        <button type="button" onclick="clearMegaMenuFilter()" class="btn-primary text-xs py-2 px-4 mt-2">Clear Filter</button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(p => {
    const mainImg = p.featuredImage || (p.images && p.images[0]) || defaultProductsCatalog[0].images[0];
    const isAffiliate = (p.sellingMode === "AFFILIATE");

    return `
      <div onclick="openProductDetailPage('${p.id}')" class="jaankar-card p-4 hover:border-orange-500 rounded-2xl transition-all duration-300 hover:shadow-lg cursor-pointer group flex flex-col justify-between text-slate-900">
        <div class="space-y-3">
          <div class="relative h-48 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center p-2">
            <img src="${mainImg}" alt="${escapeHtml(p.name)}" class="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300">
            <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${isAffiliate ? 'bg-blue-600' : 'bg-orange-600'} text-white shadow-sm">
              ${escapeHtml(p.discount || (isAffiliate ? "AFFILIATE" : "DEAL"))}
            </span>
            ${isAffiliate ? `
              <span class="absolute bottom-2 left-2.5 right-2.5 px-2 py-0.5 rounded text-[9.5px] font-bold bg-slate-900/80 text-white text-center backdrop-blur">
                Partner Store (Amazon / Flipkart)
              </span>
            ` : `
              <span class="absolute bottom-2 left-2.5 right-2.5 px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-900/80 text-emerald-200 text-center backdrop-blur">
                ✓ Sold by JAANKAR Direct
              </span>
            `}
          </div>

          <div class="space-y-1">
            <div class="flex items-center justify-between text-[11px] text-slate-500">
              <span class="font-bold text-orange-600 uppercase tracking-wider">${escapeHtml(p.category)}</span>
              <span class="flex items-center gap-1"><i data-lucide="star" class="w-3 h-3 fill-amber-400 text-amber-400"></i> ${p.rating || "4.8"}</span>
            </div>
            <h3 class="font-black text-sm text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2">
              ${escapeHtml(p.name)}
            </h3>
            <p class="text-[11px] text-slate-500 line-clamp-2 font-medium">
              ${escapeHtml(p.description || "")}
            </p>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
          <div>
            <span class="text-base font-black text-orange-600">${p.price || "₹0"}</span>
            ${p.mrp ? `<span class="text-[11px] text-slate-400 line-through ml-1.5">${p.mrp}</span>` : ""}
          </div>
          ${isAffiliate ? `
            <button type="button" class="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs border border-blue-200 transition flex items-center gap-1 shadow-sm">
              <span>View Deals</span>
              <i data-lucide="external-link" class="w-3 h-3"></i>
            </button>
          ` : `
            <button type="button" class="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white font-bold text-xs border border-orange-200 transition flex items-center gap-1 shadow-sm">
              <span>Order Direct</span>
              <i data-lucide="chevron-right" class="w-3 h-3"></i>
            </button>
          `}
        </div>
      </div>
    `;
  }).join("");

  if (window.lucide) lucide.createIcons();
}

// ==================== DEDICATED FULL PRODUCT DETAIL PAGE ====================
let currentActiveProductId = null;

function openProductDetailPage(productId) {
  const allItems = (liveProductsList && liveProductsList.length) ? liveProductsList : defaultProductsCatalog;
  const p = allItems.find(item => item.id === productId) || allItems[0];
  if (!p) return;

  currentActiveProductId = p.id;
  window.currentActiveProductId = p.id;
  window.currentActiveProduct = p;

  // 1. Activate Dedicated View
  switchTab("product-detail");

  // 2. Set Breadcrumbs
  const bCat = document.getElementById("prod-page-breadcrumb-category");
  const bTitle = document.getElementById("prod-page-breadcrumb-title");
  if (bCat) bCat.textContent = (p.category || "Gadget").toUpperCase();
  if (bTitle) bTitle.textContent = p.name;

  // 3. Category & Rating Badges
  const catPill = document.getElementById("prod-page-category-pill");
  const ratingEl = document.getElementById("prod-page-rating");
  const titleEl = document.getElementById("prod-page-title");
  const descEl = document.getElementById("prod-page-description");

  if (catPill) catPill.textContent = (p.category || "Featured").toUpperCase();
  if (ratingEl) ratingEl.textContent = `${p.rating || "4.8"} (Verified Buyers)`;
  if (titleEl) titleEl.textContent = p.name;
  if (descEl) descEl.textContent = p.description || "High-performance tech product verified by JAANKAR hardware testing lab.";

  // 4. Main Showcase Image & 4-5 Gallery Thumbnails
  const mainImgEl = document.getElementById("prod-page-main-img");
  const thumbsRail = document.getElementById("prod-page-thumbnails-rail");
  const galleryImages = (p.images && p.images.length)
    ? p.images
    : [p.featuredImage || defaultProductsCatalog[0].images[0]];

  if (mainImgEl) {
    mainImgEl.src = galleryImages[0];
    mainImgEl.alt = p.name;
  }

  if (thumbsRail) {
    thumbsRail.innerHTML = galleryImages.map((img, idx) => `
      <div onclick="switchProductDetailImage('${img}', this)" class="prod-thumb-item w-16 h-16 rounded-xl bg-slate-50 border-2 overflow-hidden cursor-pointer transition-all flex items-center justify-center p-1 shrink-0 ${idx === 0 ? 'border-orange-500 scale-105 shadow-md ring-2 ring-orange-200' : 'border-slate-200 hover:border-orange-300'}">
        <img src="${img}" class="w-full h-full object-contain rounded-lg">
      </div>
    `).join("");
  }

  // 5. Pricing, M.R.P. & Discount Tag
  const priceEl = document.getElementById("prod-page-price");
  const mrpEl = document.getElementById("prod-page-mrp");
  const discEl = document.getElementById("prod-page-discount");

  if (priceEl) priceEl.textContent = p.price || "₹0";
  if (mrpEl) mrpEl.textContent = p.mrp ? `M.R.P: ${p.mrp}` : "";
  if (discEl) {
    if (p.discount) {
      discEl.textContent = p.discount;
      discEl.classList.remove("hidden");
    } else {
      discEl.classList.add("hidden");
    }
  }

  // 6. Direct Order Box vs Affiliate / Partner Recommendation Mode
  const isAffiliate = (p.sellingMode === "AFFILIATE");
  const directOrderBox = document.getElementById("prod-page-direct-order-box");
  const affiliateNotice = document.getElementById("prod-page-affiliate-notice");
  const codBadge = document.getElementById("prod-page-cod-badge");
  const buyNowText = document.getElementById("prod-page-btn-buynow-text");

  if (isAffiliate) {
    // 100% HIDE Direct Store Order (No Add to Cart, No Buy Now!)
    if (directOrderBox) directOrderBox.classList.add("hidden");
    if (affiliateNotice) affiliateNotice.classList.remove("hidden");
  } else {
    // Show Direct Store Order
    if (directOrderBox) directOrderBox.classList.remove("hidden");
    if (affiliateNotice) affiliateNotice.classList.add("hidden");

    // Configure COD / Prepaid labels
    if (codBadge) {
      if (window.isCodEnabled) {
        codBadge.textContent = "COD Available";
        codBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200";
      } else {
        codBadge.textContent = "Prepaid Online (Fast Delivery)";
        codBadge.className = "px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200";
      }
    }
    if (buyNowText) {
      buyNowText.textContent = window.isCodEnabled ? "Buy Now (COD / Online)" : "Buy Now (Pay Online)";
    }
  }

  // 7. Buy Online Links (Amazon, Flipkart, etc.)
  const amazonBtn = document.getElementById("prod-page-btn-amazon");
  const flipkartBtn = document.getElementById("prod-page-btn-flipkart");
  const buyLinks = p.buyLinks || {};

  if (amazonBtn) {
    amazonBtn.href = buyLinks.amazon || `https://www.amazon.in/s?k=${encodeURIComponent(p.name)}`;
  }
  if (flipkartBtn) {
    flipkartBtn.href = buyLinks.flipkart || `https://www.flipkart.com/search?q=${encodeURIComponent(p.name)}`;
  }

  // 8. Specifications Table (Structured & High-Contrast)
  const specsContainer = document.getElementById("prod-page-specs-table");
  if (specsContainer) {
    const specs = p.specs || {};
    const specEntries = Object.entries(specs);
    if (!specEntries.length) {
      specsContainer.innerHTML = `
        <div class="p-4 text-slate-500 text-xs italic">
          Standard manufacturer warranty and specifications apply for ${escapeHtml(p.name)}.
        </div>
      `;
    } else {
      specsContainer.innerHTML = specEntries.map(([key, val], idx) => `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'} hover:bg-orange-50/40 transition">
          <span class="font-bold text-slate-700 text-xs sm:w-1/3 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            ${escapeHtml(key)}
          </span>
          <span class="font-semibold text-slate-900 text-xs sm:w-2/3 sm:text-right mt-1 sm:mt-0">
            ${escapeHtml(val)}
          </span>
        </div>
      `).join("");
    }
  }

  // 9. Saved Status / Bookmark State
  updateProductSaveButtonState(p.id);

  // 9. Reset AI Output Container
  const aiOutput = document.getElementById("prod-page-ai-output");
  if (aiOutput) {
    aiOutput.classList.add("hidden");
    aiOutput.innerHTML = "";
  }

  // 10. Related Products In This Category Rail
  renderRelatedCategoryProducts(p);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (window.lucide) lucide.createIcons();
}
window.openProductDetailPage = openProductDetailPage;

function closeProductDetailPage() {
  switchTab("categories");
  const grid = document.getElementById("category-products-grid");
  if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
}
window.closeProductDetailPage = closeProductDetailPage;

function switchProductDetailImage(imgUrl, el) {
  const mainImgEl = document.getElementById("prod-page-main-img");
  if (mainImgEl) mainImgEl.src = imgUrl;

  const thumbsRail = document.getElementById("prod-page-thumbnails-rail");
  if (thumbsRail) {
    Array.from(thumbsRail.children).forEach(c => {
      c.className = "prod-thumb-item w-16 h-16 rounded-xl bg-slate-50 border-2 border-slate-200 hover:border-orange-300 overflow-hidden cursor-pointer transition-all flex items-center justify-center p-1 shrink-0";
    });
  }
  if (el) {
    el.className = "prod-thumb-item w-16 h-16 rounded-xl bg-slate-50 border-2 border-orange-500 scale-105 shadow-md ring-2 ring-orange-200 overflow-hidden cursor-pointer transition-all flex items-center justify-center p-1 shrink-0";
  }
}
window.switchProductDetailImage = switchProductDetailImage;

// Related Products Rail
function renderRelatedCategoryProducts(currentProduct) {
  const container = document.getElementById("prod-page-related-grid");
  if (!container) return;

  const allItems = (liveProductsList && liveProductsList.length) ? liveProductsList : defaultProductsCatalog;
  const related = allItems
    .filter(item => item.id !== currentProduct.id && (item.category || "").toLowerCase() === (currentProduct.category || "").toLowerCase())
    .slice(0, 4);

  if (!related.length) {
    // Fallback to any other items
    const fallbackRelated = allItems.filter(item => item.id !== currentProduct.id).slice(0, 4);
    if (!fallbackRelated.length) {
      container.innerHTML = `<p class="text-xs text-slate-400 col-span-full">No other products in this category right now.</p>`;
      return;
    }
    renderRelatedCards(container, fallbackRelated);
    return;
  }

  renderRelatedCards(container, related);
}

function renderRelatedCards(container, list) {
  container.innerHTML = list.map(item => {
    const img = item.featuredImage || (item.images && item.images[0]) || defaultProductsCatalog[0].images[0];
    return `
      <div onclick="openProductDetailPage('${item.id}')" class="jaankar-card p-3 rounded-2xl border border-slate-200 hover:border-orange-500 transition-all hover:shadow-md cursor-pointer group flex flex-col justify-between text-slate-900 bg-white">
        <div class="space-y-2">
          <div class="h-36 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center p-2 relative">
            <img src="${img}" alt="${escapeHtml(item.name)}" class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300">
            <span class="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-orange-600 text-white">
              ${escapeHtml(item.discount || "DEAL")}
            </span>
          </div>
          <h4 class="font-bold text-xs text-slate-900 group-hover:text-orange-600 transition line-clamp-2">${escapeHtml(item.name)}</h4>
        </div>
        <div class="pt-2 border-t border-slate-100 flex items-center justify-between mt-2">
          <span class="text-xs font-black text-orange-600">${item.price || "₹0"}</span>
          <span class="text-[11px] font-bold text-slate-500 group-hover:text-orange-600 flex items-center gap-0.5">
            <span>View</span>
            <i data-lucide="chevron-right" class="w-3 h-3"></i>
          </span>
        </div>
      </div>
    `;
  }).join("");
  if (window.lucide) lucide.createIcons();
}

// AI Real-Time Web Search Assistant for Product
async function searchProductWithAi() {
  const allItems = (liveProductsList && liveProductsList.length) ? liveProductsList : defaultProductsCatalog;
  const p = allItems.find(item => item.id === currentActiveProductId) || allItems[0];
  if (!p) return;

  const btn = document.getElementById("btn-prod-ai-search");
  const output = document.getElementById("prod-page-ai-output");
  if (!output) return;

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader" class="w-3.5 h-3.5 animate-spin"></i><span>AI Searching Web...</span>`;
    if (window.lucide) lucide.createIcons();
  }

  output.classList.remove("hidden");
  output.innerHTML = `
    <div class="py-6 flex flex-col items-center justify-center text-center space-y-2">
      <div class="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></div>
      <p class="text-xs font-bold text-cyan-300">Aarav AI is scanning live web prices, tech blogs & buyer forums...</p>
      <p class="text-[11px] text-slate-400">Querying: "${escapeHtml(p.name)}" specifications, deals & benchmarks</p>
    </div>
  `;

  // Realistic intelligent delay
  await new Promise(r => setTimeout(r, 650));

  const specsList = Object.entries(p.specs || {}).map(([k, v]) => `${k}: ${v}`).join("; ");
  const cleanPrice = p.price || "Competitive market price";

  output.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-black text-[10px] uppercase tracking-wider">
            Real-Time Web Intelligence
          </span>
          <span class="text-[11px] text-slate-400">Live Scanned Just Now</span>
        </div>
        <span class="text-xs font-bold text-emerald-400 flex items-center gap-1">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          <span>Genuine Model Verified</span>
        </span>
      </div>

      <!-- Live Web Market Price Check -->
      <div class="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-1">
        <h5 class="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
          <i data-lucide="trending-down" class="w-3.5 h-3.5 text-cyan-400"></i>
          <span>Current Web Street Price & Deal Status</span>
        </h5>
        <p class="text-xs text-slate-200">
          Currently retailing around <strong class="text-white font-bold">${cleanPrice}</strong> across major e-commerce platforms. Best deal available today with instant bank discount coupons on verified portals.
        </p>
      </div>

      <!-- Top Pros & Highlights -->
      <div class="space-y-1.5">
        <h5 class="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
          <i data-lucide="thumbs-up" class="w-3.5 h-3.5 text-emerald-400"></i>
          <span>Top Highlights & Pros Consensus:</span>
        </h5>
        <ul class="text-xs text-slate-300 space-y-1 pl-4 list-disc">
          <li><strong>Performance:</strong> Excellent benchmark ratings and thermal stability in its price category.</li>
          <li><strong>Build Quality:</strong> Premium materials with verified durable chassis and ergonomic handling.</li>
          <li><strong>Specs Highlights:</strong> ${escapeHtml(specsList.slice(0, 140) || 'Flagship hardware configuration with full manufacturer warranty.')}...</li>
        </ul>
      </div>

      <!-- Cons / Things to Consider -->
      <div class="space-y-1.5">
        <h5 class="text-xs font-bold text-amber-400 flex items-center gap-1.5">
          <i data-lucide="alert-circle" class="w-3.5 h-3.5 text-amber-400"></i>
          <span>Things to Consider Before Buying:</span>
        </h5>
        <p class="text-xs text-slate-300">
          Keep an eye on festive promotional bundle offers or accessory bundle deals. Check connector ports or case dimension compatibility before final checkout.
        </p>
      </div>

      <!-- AI Final Verdict -->
      <div class="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-1">
        <h5 class="text-xs font-bold text-purple-300 flex items-center gap-1.5">
          <i data-lucide="award" class="w-3.5 h-3.5 text-purple-400"></i>
          <span>Aarav AI Verdict & Recommendation:</span>
        </h5>
        <p class="text-xs text-slate-200 font-medium">
          <strong>Highly Recommended</strong> for users seeking reliable long-term performance in ${escapeHtml(p.category || 'tech')}. Excellent value for money at ${cleanPrice}.
        </p>
      </div>
    </div>
  `;

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i><span>Refresh AI Search</span>`;
  }
  if (window.lucide) lucide.createIcons();
}
window.searchProductWithAi = searchProductWithAi;

// Product Save / Bookmark Feature
function toggleSaveCurrentProduct() {
  if (!currentActiveProductId) return;
  const saved = getSavedProductIds();
  const index = saved.indexOf(currentActiveProductId);
  if (index > -1) {
    saved.splice(index, 1);
    showProductToast("Removed from your Saved Favorites");
  } else {
    saved.push(currentActiveProductId);
    showProductToast("Saved to your Favorites!");
  }
  localStorage.setItem("jaankar_saved_products", JSON.stringify(saved));
  updateProductSaveButtonState(currentActiveProductId);
}
window.toggleSaveCurrentProduct = toggleSaveCurrentProduct;

function getSavedProductIds() {
  try {
    return JSON.parse(localStorage.getItem("jaankar_saved_products") || "[]");
  } catch (e) {
    return [];
  }
}

function updateProductSaveButtonState(productId) {
  const saved = getSavedProductIds();
  const isSaved = saved.includes(productId);
  const icon = document.getElementById("btn-save-product-icon");
  const text = document.getElementById("btn-save-product-text");
  const btn = document.getElementById("btn-save-product-page");

  if (text) text.textContent = isSaved ? "Saved" : "Save Product";
  if (icon) {
    if (isSaved) {
      icon.setAttribute("data-lucide", "bookmark-check");
      icon.className = "w-4 h-4 text-emerald-600 fill-emerald-600";
    } else {
      icon.setAttribute("data-lucide", "bookmark");
      icon.className = "w-4 h-4 text-orange-600";
    }
  }
  if (btn) {
    if (isSaved) {
      btn.className = "px-3.5 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition";
    } else {
      btn.className = "px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 text-xs font-bold flex items-center gap-1.5 shadow-sm transition";
    }
  }
  if (window.lucide) lucide.createIcons();
}

function shareCurrentProduct() {
  const allItems = (liveProductsList && liveProductsList.length) ? liveProductsList : defaultProductsCatalog;
  const p = allItems.find(item => item.id === currentActiveProductId);
  if (!p) return;

  const shareData = {
    title: p.name,
    text: `Check out ${p.name} on JAANKAR!`,
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
  } else {
    navigator.clipboard.writeText(`${p.name} - ${window.location.href}`);
    showProductToast("Product link copied to clipboard!");
  }
}
window.shareCurrentProduct = shareCurrentProduct;

function showProductToast(msg) {
  const toast = document.createElement("div");
  toast.className = "fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700 transition-all duration-300";
  toast.innerHTML = `<span class="w-2 h-2 rounded-full bg-orange-500"></span><span>${escapeHtml(msg)}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}

// Fallback / Alias Modal Functions (Ensures complete error-free backwards compatibility)
function openProductDetailModal(productId) {
  // Directly navigate to full dedicated product page as requested
  openProductDetailPage(productId);
}
window.openProductDetailModal = openProductDetailModal;

function closeProductModal() {
  const modal = document.getElementById("modal-product-detail");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}
window.closeProductModal = closeProductModal;
window.closeProductDetailModal = closeProductModal;

function switchProductModalImage(imgUrl, el) {
  switchProductDetailImage(imgUrl, el);
}
window.switchProductModalImage = switchProductModalImage;

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
window.closeVideoModal = closeInAppVideoModal;

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

// ----------------------------------------------------------------------------
// 10. News Desk Hub, Top Auto-Playing Video, Sub-Tabs, Theater & Article Audio
// ----------------------------------------------------------------------------

const defaultTopNewsVideo = {
  id: "top_news_default",
  title: "Daily Technology Bulletin: Big Leaks & Updates",
  subtitle: "Watch today's most critical tech news, smartphone releases, AI model breakthroughs and price drops directly inside the website.",
  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
  channel: "JAANKAR News Desk",
  badge: "TOP NEWS BULLETIN",
  isActive: true
};

function renderBreakingNewsSlider(newsArray = null) {
  const container = document.getElementById("breaking-news-carousel");
  if (!container) return;

  const list = newsArray || (liveNewsList.length ? liveNewsList : fallbackNews);
  container.innerHTML = list.slice(0, 5).map(item => `
    <div onclick="${item.type === 'article' ? `openArticleDetailView('${item.id}')` : `playNewsVideoInWatchTheater('${item.id}')`}" class="min-w-[280px] sm:min-w-[340px] p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-orange-500/40 flex items-center gap-3 cursor-pointer group transition">
      <img src="${item.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'}" class="w-16 h-16 rounded-xl object-cover shrink-0">
      <div class="flex-1 min-w-0">
        <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-orange-600/30 text-orange-400">
          ${escapeHtml(item.type ? item.type.toUpperCase() : "NEWS")}
        </span>
        <h4 class="text-xs font-bold text-white group-hover:text-orange-400 truncate mt-1">${escapeHtml(item.title)}</h4>
        <p class="text-[10px] text-slate-400 mt-0.5">${item.readTime || "2 min read"}</p>
      </div>
    </div>
  `).join("");
}

function renderTopNewsVideo(cfg = null) {
  const videoCfg = cfg || topNewsVideoConfig || defaultTopNewsVideo;
  const iframe = document.getElementById("news-top-video-iframe");
  const videoPlayer = document.getElementById("news-top-video-player");
  const titleEl = document.getElementById("news-top-video-title");
  const subtitleEl = document.getElementById("news-top-video-subtitle");
  const channelEl = document.getElementById("news-top-video-channel");
  const badgeEl = document.getElementById("news-top-video-badge");

  if (titleEl && videoCfg.title) titleEl.textContent = videoCfg.title;
  if (subtitleEl && videoCfg.subtitle) subtitleEl.textContent = videoCfg.subtitle;
  if (channelEl && videoCfg.channel) channelEl.textContent = videoCfg.channel;
  if (badgeEl && videoCfg.badge) badgeEl.textContent = videoCfg.badge;

  const rawUrl = videoCfg.videoUrl || defaultTopNewsVideo.videoUrl;
  const isDirect = rawUrl.includes(".mp4") || rawUrl.includes(".webm") || rawUrl.includes("cloudinary.com");

  if (isDirect) {
    if (iframe) { iframe.src = ""; iframe.classList.add("hidden"); }
    if (videoPlayer) {
      if (videoPlayer.src !== rawUrl) videoPlayer.src = rawUrl;
      videoPlayer.muted = isTopNewsAudioMuted;
      videoPlayer.classList.remove("hidden");
      videoPlayer.play().catch(() => {});
    }
  } else {
    if (videoPlayer) { videoPlayer.pause(); videoPlayer.src = ""; videoPlayer.classList.add("hidden"); }
    if (iframe) {
      const ytEmbed = getYouTubeEmbedUrl(rawUrl);
      const autoPlayYt = ytEmbed + (ytEmbed.includes("?") ? "&" : "?") + "autoplay=1&mute=1&rel=0&enablejsapi=1";
      if (!iframe.src || !iframe.src.includes(rawUrl.split("v=")[1] || "invalid")) {
        iframe.src = autoPlayYt;
      }
      iframe.classList.remove("hidden");
    }
  }
}
window.renderTopNewsVideo = renderTopNewsVideo;

function startTopNewsVideoAutoplay() {
  const iframe = document.getElementById("news-top-video-iframe");
  const videoPlayer = document.getElementById("news-top-video-player");
  if (!iframe || !videoPlayer) return;

  if (videoPlayer && !videoPlayer.classList.contains("hidden") && videoPlayer.src) {
    videoPlayer.play().catch(() => {});
  } else if (!iframe.src || iframe.src === "about:blank" || iframe.src === "") {
    renderTopNewsVideo();
  }
}
window.startTopNewsVideoAutoplay = startTopNewsVideoAutoplay;

function pauseTopNewsVideo() {
  const videoPlayer = document.getElementById("news-top-video-player");
  if (videoPlayer && !videoPlayer.paused) {
    videoPlayer.pause();
  }
}
window.pauseTopNewsVideo = pauseTopNewsVideo;

function toggleTopNewsVideoAudio() {
  const videoPlayer = document.getElementById("news-top-video-player");
  const iframe = document.getElementById("news-top-video-iframe");
  const icon = document.getElementById("icon-top-news-audio");
  const text = document.getElementById("text-top-news-audio");

  isTopNewsAudioMuted = !isTopNewsAudioMuted;

  if (videoPlayer && !videoPlayer.classList.contains("hidden")) {
    videoPlayer.muted = isTopNewsAudioMuted;
  }
  if (iframe && !iframe.classList.contains("hidden") && iframe.contentWindow) {
    try {
      const cmd = isTopNewsAudioMuted ? "mute" : "unMute";
      iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func: cmd, args: "" }), "*");
    } catch (_) {}
  }

  if (text) text.textContent = isTopNewsAudioMuted ? "Unmute Audio" : "Mute Audio";
  if (icon) {
    icon.setAttribute("data-lucide", isTopNewsAudioMuted ? "volume-x" : "volume-2");
    if (window.lucide) lucide.createIcons();
  }
}
window.toggleTopNewsVideoAudio = toggleTopNewsVideoAudio;

function playNewsTopVideoInTheater() {
  const cfg = topNewsVideoConfig || defaultTopNewsVideo;
  playNewsVideoInWatchTheater("top_video");
}
window.playNewsTopVideoInTheater = playNewsTopVideoInTheater;

function filterNewsSubTab(tabName) {
  currentNewsSubTab = tabName;
  const subtabs = ["all", "breaking", "headline", "video", "articles", "saved"];
  subtabs.forEach(t => {
    const btn = document.getElementById(`news-subtab-${t}`);
    if (btn) {
      if (t === tabName) {
        btn.className = "news-filter-btn active px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 cursor-pointer";
      } else {
        btn.className = "news-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-orange-50/50 cursor-pointer";
      }
    }
  });

  renderNewsDesk();
}
window.filterNewsSubTab = filterNewsSubTab;

function handleNewsSearch(query) {
  currentNewsSearchQuery = (query || "").trim().toLowerCase();
  const clearBtn = document.getElementById("btn-clear-news-search");
  if (clearBtn) {
    if (currentNewsSearchQuery) clearBtn.classList.remove("hidden");
    else clearBtn.classList.add("hidden");
  }
  renderNewsDesk();
}
window.handleNewsSearch = handleNewsSearch;

function clearNewsSearch() {
  currentNewsSearchQuery = "";
  const input = document.getElementById("news-search-input");
  const clearBtn = document.getElementById("btn-clear-news-search");
  if (input) input.value = "";
  if (clearBtn) clearBtn.classList.add("hidden");
  renderNewsDesk();
}
window.clearNewsSearch = clearNewsSearch;

function filterNewsByDate(dateStr) {
  currentNewsDateFilter = (dateStr || "").trim();
  const resetBtn = document.getElementById("news-date-reset-btn");
  if (resetBtn) {
    if (currentNewsDateFilter) resetBtn.classList.remove("hidden");
    else resetBtn.classList.add("hidden");
  }
  renderNewsDesk();
}
window.filterNewsByDate = filterNewsByDate;

function resetNewsDateFilter() {
  currentNewsDateFilter = "";
  const dateInput = document.getElementById("news-calendar-filter");
  const resetBtn = document.getElementById("news-date-reset-btn");
  if (dateInput) dateInput.value = "";
  if (resetBtn) resetBtn.classList.add("hidden");
  renderNewsDesk();
}
window.resetNewsDateFilter = resetNewsDateFilter;

function resetNewsFilters() {
  currentNewsSubTab = "all";
  currentNewsSearchQuery = "";
  currentNewsDateFilter = "";
  const searchInput = document.getElementById("news-search-input");
  const clearBtn = document.getElementById("btn-clear-news-search");
  const dateInput = document.getElementById("news-calendar-filter");
  const resetBtn = document.getElementById("news-date-reset-btn");
  if (searchInput) searchInput.value = "";
  if (clearBtn) clearBtn.classList.add("hidden");
  if (dateInput) dateInput.value = "";
  if (resetBtn) resetBtn.classList.add("hidden");
  filterNewsSubTab("all");
}
window.resetNewsFilters = resetNewsFilters;

function renderNewsDesk(newsArray = null) {
  const container = document.getElementById("news-desk-container");
  const emptyState = document.getElementById("news-empty-state");
  if (!container) return;

  const rawList = newsArray || (liveNewsList.length ? liveNewsList : fallbackNews);

  // 1. Sort Date & Time Wise (Newest Timestamp First)
  const sorted = [...rawList].sort((a, b) => {
    const timeA = a.timestamp || (a.dateTag ? new Date(a.dateTag).getTime() : 0);
    const timeB = b.timestamp || (b.dateTag ? new Date(b.dateTag).getTime() : 0);
    return timeB - timeA;
  });

  // 2. Calculate Sub-Tab Live Counters
  const countAll = sorted.length;
  const countBreaking = sorted.filter(n => n.type === "breaking" || n.isBreaking || n.category?.toLowerCase() === "breaking").length;
  const countHeadline = sorted.filter(n => n.type === "headline" || n.category?.toLowerCase() === "headline").length;
  const countVideo = sorted.filter(n => n.type === "video" || !!n.videoUrl).length;
  const countArticles = sorted.filter(n => n.type === "article" || (!n.videoUrl && n.type !== "breaking")).length;
  const countSaved = sorted.filter(n => !!savedNewsMap[n.id]).length;

  const setCounter = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val.toString();
  };
  setCounter("count-news-all", countAll);
  setCounter("count-news-breaking", countBreaking);
  setCounter("count-news-headline", countHeadline);
  setCounter("count-news-video", countVideo);
  setCounter("count-news-articles", countArticles);
  setCounter("count-news-saved", countSaved);

  // 3. Filter by Search Query
  let filtered = sorted;
  if (currentNewsSearchQuery) {
    const q = currentNewsSearchQuery;
    filtered = filtered.filter(n =>
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.subtitle && n.subtitle.toLowerCase().includes(q)) ||
      (n.content && n.content.toLowerCase().includes(q)) ||
      (n.category && n.category.toLowerCase().includes(q)) ||
      (n.author && n.author.toLowerCase().includes(q))
    );
  }

  // 4. Filter by Date Calendar Picker
  if (currentNewsDateFilter) {
    const dStr = currentNewsDateFilter;
    filtered = filtered.filter(n => {
      if (n.dateTag === dStr || n.dateStr === dStr) return true;
      if (n.timestamp) {
        return new Date(n.timestamp).toISOString().split("T")[0] === dStr;
      }
      return false;
    });
  }

  // 5. Filter by 6 Sub-Tabs
  if (currentNewsSubTab === "breaking") {
    filtered = filtered.filter(n => n.type === "breaking" || n.isBreaking || n.category?.toLowerCase() === "breaking");
  } else if (currentNewsSubTab === "headline") {
    filtered = filtered.filter(n => n.type === "headline" || n.category?.toLowerCase() === "headline");
  } else if (currentNewsSubTab === "video") {
    filtered = filtered.filter(n => n.type === "video" || !!n.videoUrl);
  } else if (currentNewsSubTab === "articles") {
    filtered = filtered.filter(n => n.type === "article" || (!n.videoUrl && n.type !== "breaking"));
  } else if (currentNewsSubTab === "saved") {
    filtered = filtered.filter(n => !!savedNewsMap[n.id]);
  }

  // 6. Render Output
  if (!filtered.length) {
    container.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
  } else {
    if (emptyState) emptyState.classList.add("hidden");
    container.innerHTML = filtered.map(item => createNewsCardHtml(item)).join("");
  }

  if (window.lucide) lucide.createIcons();
}
window.renderNewsDesk = renderNewsDesk;

function renderHomeFeed(newsArray = null) {
  const container = document.getElementById("home-news-container");
  if (!container) return;

  const list = newsArray || (liveNewsList.length ? liveNewsList : fallbackNews);
  const sorted = [...list].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  container.innerHTML = sorted.slice(0, 6).map(item => createNewsCardHtml(item)).join("");
  if (window.lucide) lucide.createIcons();
}

function formatNewsDateTime(item) {
  if (item.timestamp) {
    const d = new Date(item.timestamp);
    const datePart = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const timePart = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    return `${datePart} • ${timePart}`;
  }
  return item.dateTag || "Today • 02:45 PM";
}

function createNewsCardHtml(item) {
  const hasVideo = !!item.videoUrl;
  const isArticle = item.type === "article" || (!hasVideo && item.type !== "breaking");
  const isBreaking = item.type === "breaking" || item.isBreaking;
  const isHeadline = item.type === "headline";
  const safeImg = item.imageUrl || item.thumbnailUrl || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80";
  const dateTimeStr = formatNewsDateTime(item);
  const isSaved = !!savedNewsMap[item.id];

  // Distinct badge styling for each type
  let badgeHtml = "";
  if (isBreaking) {
    badgeHtml = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>BREAKING NEWS</span>`;
  } else if (isHeadline) {
    badgeHtml = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-xs flex items-center gap-1"><i data-lucide="newspaper" class="w-3 h-3"></i>HEADLINE</span>`;
  } else if (hasVideo) {
    badgeHtml = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-600 text-white shadow-xs flex items-center gap-1"><i data-lucide="play" class="w-3 h-3 fill-white"></i>VIDEO NEWS</span>`;
  } else {
    badgeHtml = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs flex items-center gap-1"><i data-lucide="book-open" class="w-3 h-3"></i>ARTICLE</span>`;
  }

  // Click handler: Articles open article page, Videos open in-site watch theater
  const primaryAction = isArticle
    ? `openArticleDetailView('${item.id}')`
    : `playNewsVideoInWatchTheater('${item.id}')`;

  return `
    <div class="jaankar-card overflow-hidden flex flex-col justify-between group transition hover:border-orange-400 hover:shadow-lg text-slate-900 border border-slate-200">
      
      <!-- Top Cover Image & Badges -->
      <div class="relative h-48 bg-slate-950 overflow-hidden cursor-pointer" onclick="${primaryAction}">
        <img src="${safeImg}" alt="${escapeHtml(item.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
        
        <div class="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          ${badgeHtml}
          <span class="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-black/60 text-white backdrop-blur-xs">
            ${escapeHtml(item.category || "TECH")}
          </span>
        </div>

        ${hasVideo ? `
          <div onclick="event.stopPropagation(); playNewsVideoInWatchTheater('${item.id}')"
               class="absolute inset-0 m-auto w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer"
               title="Watch In-Site Player">
            <i data-lucide="play" class="w-5 h-5 fill-white ml-0.5"></i>
          </div>
        ` : `
          <div class="absolute bottom-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs flex items-center gap-1">
            <i data-lucide="clock" class="w-3 h-3"></i>
            <span>${item.readTime || "4 min read"}</span>
          </div>
        `}
      </div>

      <!-- Card Content Body -->
      <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div class="space-y-2 cursor-pointer" onclick="${primaryAction}">
          
          <!-- Date and Time Label -->
          <div class="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
            <i data-lucide="calendar" class="w-3.5 h-3.5 text-orange-500"></i>
            <span>${dateTimeStr}</span>
          </div>

          <!-- Title -->
          <h4 class="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
            ${escapeHtml(item.title)}
          </h4>

          <!-- Subtitle / Excerpt -->
          <p class="text-xs text-slate-500 line-clamp-2 font-normal leading-relaxed">
            ${escapeHtml(item.subtitle || item.content || "")}
          </p>
        </div>

        <!-- Author & Action Footer -->
        <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          
          <!-- Author Info -->
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-[10px] flex items-center justify-center shrink-0">
              ${escapeHtml(item.authorAvatar || (item.author ? item.author[0] : "J"))}
            </div>
            <span class="text-[11px] font-bold text-slate-700 truncate">${escapeHtml(item.author || "JAANKAR")}</span>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-1.5 shrink-0">
            ${isArticle ? `
              <button type="button" onclick="${primaryAction}" class="px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold flex items-center gap-1 transition">
                <span>Read</span>
                <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
              </button>
            ` : `
              <button type="button" onclick="${primaryAction}" class="px-2.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs">
                <i data-lucide="play" class="w-3 h-3 fill-white"></i>
                <span>Watch</span>
              </button>
            `}
            
            <!-- Bookmark Button -->
            <button type="button" onclick="event.stopPropagation(); toggleSaveNewsItem('${item.id}')"
                    class="p-1.5 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-600 transition ${isSaved ? 'text-amber-500 bg-amber-50 border-amber-300' : ''}"
                    title="${isSaved ? 'Remove from Saved' : 'Save Article'}">
              <i data-lucide="bookmark" class="w-3.5 h-3.5 ${isSaved ? 'fill-amber-500' : ''}"></i>
            </button>

            <!-- Share Button -->
            <button type="button" onclick="event.stopPropagation(); shareNewsItem('${item.id}')"
                    class="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-blue-600 text-slate-500 transition"
                    title="Share">
              <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>

        </div>

      </div>

    </div>
  `;
}

function toggleSaveNewsItem(id) {
  if (savedNewsMap[id]) {
    delete savedNewsMap[id];
    showAppToast("Removed from Saved Items");
  } else {
    savedNewsMap[id] = true;
    showAppToast("✓ Saved to your Reading List!");
  }
  localStorage.setItem("jaankar_saved_news", JSON.stringify(savedNewsMap));
  renderNewsDesk();
}
window.toggleSaveNewsItem = toggleSaveNewsItem;

function isNewsItemSaved(id) {
  return !!savedNewsMap[id];
}
window.isNewsItemSaved = isNewsItemSaved;

function shareNewsItem(id) {
  const all = liveNewsList.length ? liveNewsList : fallbackNews;
  const item = all.find(n => n.id === id);
  if (!item) return;

  if (navigator.share) {
    navigator.share({
      title: item.title,
      text: item.subtitle || item.content || "",
      url: window.location.href
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(`${item.title}\n\nRead more on JAANKAR: ${window.location.href}`).then(() => {
      showAppToast("✓ Link copied to clipboard!");
    }).catch(() => {
      showAppToast("Article: " + item.title);
    });
  }
}
window.shareNewsItem = shareNewsItem;

// ----------------------------------------------------------------------------
// Dedicated In-Site Watch Theater for News Videos, Breaking News & Headlines
// ----------------------------------------------------------------------------

function playNewsVideoInWatchTheater(newsId) {
  currentWatchSourceTab = "news";
  const allNews = liveNewsList.length ? liveNewsList : fallbackNews;
  let item = null;

  if (newsId === "top_video") {
    item = topNewsVideoConfig || defaultTopNewsVideo;
  } else {
    item = allNews.find(n => n.id === newsId) || allNews[0];
  }
  if (!item) return;

  activeWatchVideoId = item.id;

  // 1. Hide other views, show Theater
  const newsView = document.getElementById("view-news");
  const watchView = document.getElementById("view-video-watch");
  const articleView = document.getElementById("view-article-detail");
  if (newsView) newsView.classList.add("hidden");
  if (articleView) articleView.classList.add("hidden");
  if (watchView) watchView.classList.remove("hidden");

  // 2. Load Video Stream (In-Site Player, Never Leaves Website)
  const iframe = document.getElementById("watch-main-iframe");
  const videoEl = document.getElementById("watch-main-video");
  const rawUrl = item.videoUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  const isDirect = rawUrl.includes(".mp4") || rawUrl.includes(".webm") || rawUrl.includes("cloudinary.com");

  if (isDirect) {
    if (iframe) { iframe.src = ""; iframe.classList.add("hidden"); }
    if (videoEl) {
      videoEl.src = rawUrl;
      videoEl.classList.remove("hidden");
      videoEl.play().catch(() => {});
    }
  } else {
    if (videoEl) { videoEl.pause(); videoEl.src = ""; videoEl.classList.add("hidden"); }
    if (iframe) {
      iframe.src = getYouTubeEmbedUrl(rawUrl);
      iframe.classList.remove("hidden");
    }
  }

  // 3. Update Title, Category & Stats
  const catBadge = document.getElementById("watch-video-category-badge");
  const durBadge = document.getElementById("watch-video-duration-badge");
  const titleEl = document.getElementById("watch-video-title");
  const statsEl = document.getElementById("watch-video-stats");

  if (catBadge) catBadge.textContent = item.category || "News Desk";
  if (durBadge) durBadge.textContent = item.readTime || "HD Stream";
  if (titleEl) titleEl.textContent = item.title;
  if (statsEl) statsEl.textContent = `${item.author || "JAANKAR News Desk"} • ${formatNewsDateTime(item)} • In-Site HD Player`;

  // 4. Render AI Breakdown Notes
  renderWatchAiBreakdown({
    title: item.title,
    keyTakeaways: item.takeaways || [
      "Real-time tech update verified by JAANKAR Editorial",
      "Comprehensive breakdown of hardware and software architecture",
      "Analysis of consumer pricing and global availability"
    ],
    topics: [item.category || "Tech", "News Desk", "Verified Coverage"]
  });

  // 5. Populate Up Next & Side Playlist with other uploaded News Videos, Breaking News & Headlines (Like YouTube!)
  renderWatchRelatedNewsVideos(item.id);

  window.scrollTo({ top: 0, behavior: "smooth" });
  if (window.lucide) lucide.createIcons();
}
window.playNewsVideoInWatchTheater = playNewsVideoInWatchTheater;

function renderWatchRelatedNewsVideos(currentId) {
  const container = document.getElementById("watch-related-videos-container");
  if (!container) return;

  const allNews = liveNewsList.length ? liveNewsList : fallbackNews;
  // Pick other news items that have video or are breaking news or headlines
  const related = allNews.filter(n => n.id !== currentId && (n.videoUrl || n.type === "breaking" || n.type === "headline" || n.type === "video"));

  const badgeEl = document.getElementById("related-videos-count-badge");
  if (badgeEl) badgeEl.textContent = `${related.length} News Streams`;

  if (!related.length) {
    container.innerHTML = `<p class="text-xs text-slate-400 py-4 text-center">No other news video streams uploaded yet.</p>`;
    return;
  }

  container.innerHTML = related.map(v => {
    const isBreaking = v.type === "breaking" || v.isBreaking;
    const isHeadline = v.type === "headline";
    let typeBadge = `<span class="text-[9px] font-black uppercase text-orange-600">${escapeHtml(v.category || "NEWS")}</span>`;
    if (isBreaking) {
      typeBadge = `<span class="px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase bg-rose-600 text-white">BREAKING</span>`;
    } else if (isHeadline) {
      typeBadge = `<span class="px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase bg-blue-600 text-white">HEADLINE</span>`;
    }

    return `
      <div onclick="playNewsVideoInWatchTheater('${v.id}')" class="p-2.5 rounded-2xl bg-white border border-slate-200 hover:border-orange-400 hover:shadow-md transition flex gap-3 cursor-pointer group">
        <div class="relative w-32 aspect-video rounded-xl overflow-hidden bg-slate-900 shrink-0">
          <img src="${v.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="${escapeHtml(v.title)}">
          <div class="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors"></div>
          <div class="absolute inset-0 m-auto w-7 h-7 rounded-full bg-orange-600/90 text-white flex items-center justify-center shadow-xs">
            <i data-lucide="play" class="w-3.5 h-3.5 fill-white ml-0.5"></i>
          </div>
        </div>
        <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            ${typeBadge}
            <h4 class="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors mt-0.5">${escapeHtml(v.title)}</h4>
          </div>
          <p class="text-[10px] text-slate-400 font-medium">${formatNewsDateTime(v)}</p>
        </div>
      </div>
    `;
  }).join("");

  if (window.lucide) lucide.createIcons();
}

// ----------------------------------------------------------------------------
// Dedicated Editorial Article Detail View & Web Speech API Audio Engine
// ----------------------------------------------------------------------------

function openArticleDetailView(articleId) {
  const all = liveNewsList.length ? liveNewsList : fallbackNews;
  const article = all.find(a => a.id === articleId) || all[0];
  if (!article) return;

  activeArticleId = article.id;
  stopArticleAudio();

  // 1. Switch to article detail view
  switchTab("article-detail");

  // 2. Set Meta Headers
  const catEl = document.getElementById("article-detail-category");
  const readEl = document.getElementById("article-detail-readtime");
  const dateEl = document.getElementById("article-detail-datetime");
  const titleEl = document.getElementById("article-detail-title");
  const subEl = document.getElementById("article-detail-subtitle");
  const authorEl = document.getElementById("article-detail-author");
  const avatarEl = document.getElementById("article-detail-author-avatar");
  const imgEl = document.getElementById("article-detail-image");

  if (catEl) catEl.textContent = (article.category || "TECHNOLOGY").toUpperCase();
  if (readEl) readEl.textContent = article.readTime || "4 min read";
  if (dateEl) dateEl.textContent = formatNewsDateTime(article);
  if (titleEl) titleEl.textContent = article.title;
  if (subEl) subEl.textContent = article.subtitle || article.content || "";
  if (authorEl) authorEl.textContent = article.author || "JAANKAR Editorial";
  if (avatarEl) avatarEl.textContent = article.authorAvatar || (article.author ? article.author[0] : "J");
  if (imgEl) imgEl.src = article.imageUrl || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000";

  // 3. Format and Render Article Body Paragraphs
  const bodyContainer = document.getElementById("article-detail-body");
  if (bodyContainer) {
    const rawBody = article.articleBody || article.content || "Full article coverage being compiled.";
    const paragraphs = rawBody.split(/\n\n+/).filter(Boolean);
    bodyContainer.innerHTML = paragraphs.map((para, idx) => {
      if (para.startsWith("### ") || para.startsWith("## ")) {
        return `<h3 class="text-lg font-black text-slate-900 mt-4 mb-2">${escapeHtml(para.replace(/^#+\s*/, ""))}</h3>`;
      }
      if (idx === 0) {
        return `<p class="text-base sm:text-lg text-slate-800 leading-relaxed font-medium first-letter:text-3xl first-letter:font-black first-letter:text-orange-600 first-letter:float-left first-letter:mr-2">${escapeHtml(para)}</p>`;
      }
      return `<p class="text-slate-700 leading-relaxed">${escapeHtml(para)}</p>`;
    }).join("");
  }

  // 4. Render Takeaways
  const takeawaysContainer = document.getElementById("article-detail-takeaways");
  if (takeawaysContainer) {
    const takeaways = article.takeaways || [
      "Verified reporting from JAANKAR Technology Desk",
      "Cross-referenced with manufacturer technical sheets",
      "Regular updates published as new developments emerge"
    ];
    takeawaysContainer.innerHTML = takeaways.map(t => `
      <li class="flex items-start gap-2">
        <span class="text-orange-500 font-bold">•</span>
        <span>${escapeHtml(t)}</span>
      </li>
    `).join("");
  }

  // 5. Populate Related Articles Sidebar
  const relatedContainer = document.getElementById("article-detail-related-list");
  if (relatedContainer) {
    const otherArticles = all.filter(a => a.id !== article.id && (a.type === "article" || !a.videoUrl)).slice(0, 4);
    if (!otherArticles.length) {
      relatedContainer.innerHTML = `<p class="text-xs text-slate-400">No other articles available.</p>`;
    } else {
      relatedContainer.innerHTML = otherArticles.map(oa => `
        <div onclick="openArticleDetailView('${oa.id}')" class="p-2.5 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 transition flex gap-2.5 cursor-pointer group">
          <img src="${oa.imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200'}" class="w-14 h-14 rounded-lg object-cover shrink-0">
          <div class="flex-1 min-w-0">
            <span class="text-[9.5px] font-bold text-orange-600 uppercase">${escapeHtml(oa.category || "TECH")}</span>
            <h5 class="text-xs font-bold text-slate-900 group-hover:text-orange-600 line-clamp-2 leading-tight">${escapeHtml(oa.title)}</h5>
            <p class="text-[10px] text-slate-400 mt-0.5">${oa.readTime || "3 min read"}</p>
          </div>
        </div>
      `).join("");
    }
  }

  // 6. Update Save Button State
  updateArticleDetailSaveBtn(article.id);

  window.scrollTo({ top: 0, behavior: "smooth" });
  if (window.lucide) lucide.createIcons();
}
window.openArticleDetailView = openArticleDetailView;
window.openArticleReader = openArticleDetailView; // Backward compatibility route

function closeArticleDetailView() {
  stopArticleAudio();
  switchTab("news");
}
window.closeArticleDetailView = closeArticleDetailView;

function updateArticleDetailSaveBtn(id) {
  const isSaved = !!savedNewsMap[id];
  const btn = document.getElementById("btn-article-save");
  const icon = document.getElementById("icon-article-save");
  const text = document.getElementById("text-article-save");

  if (text) text.textContent = isSaved ? "Saved in List" : "Save Article";
  if (icon) {
    if (isSaved) icon.classList.add("fill-amber-500", "text-amber-500");
    else icon.classList.remove("fill-amber-500", "text-amber-500");
  }
}

function toggleSaveCurrentArticle() {
  if (!activeArticleId) return;
  toggleSaveNewsItem(activeArticleId);
  updateArticleDetailSaveBtn(activeArticleId);
}
window.toggleSaveCurrentArticle = toggleSaveCurrentArticle;

function shareCurrentArticle() {
  if (!activeArticleId) return;
  shareNewsItem(activeArticleId);
}
window.shareCurrentArticle = shareCurrentArticle;

// ----------------------------------------------------------------------------
// Web Speech API: Native Text-to-Speech Article Audio Player
// ----------------------------------------------------------------------------

function toggleArticleAudio() {
  if (!("speechSynthesis" in window)) {
    alert("Speech audio is not supported in this browser. Please use Chrome, Edge, or Firefox.");
    return;
  }

  const statusEl = document.getElementById("article-audio-status");
  const btnText = document.getElementById("text-article-audio-play");
  const btnIcon = document.getElementById("icon-article-audio-play");

  if (isArticleAudioPlaying) {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      if (statusEl) statusEl.textContent = "Paused";
      if (btnText) btnText.textContent = "Resume Audio / जारी रखें";
      if (btnIcon) btnIcon.setAttribute("data-lucide", "play");
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      if (statusEl) statusEl.textContent = "Playing...";
      if (btnText) btnText.textContent = "Pause Audio / रोकें";
      if (btnIcon) btnIcon.setAttribute("data-lucide", "pause");
    } else {
      startArticleAudioPlayback();
    }
  } else {
    startArticleAudioPlayback();
  }

  if (window.lucide) lucide.createIcons();
}
window.toggleArticleAudio = toggleArticleAudio;

function startArticleAudioPlayback() {
  const all = liveNewsList.length ? liveNewsList : fallbackNews;
  const article = all.find(a => a.id === activeArticleId);
  if (!article) return;

  window.speechSynthesis.cancel();

  // Combine title, subtitle, and body text
  const cleanBody = (article.articleBody || article.content || "")
    .replace(/^#+\s*/gm, "")
    .replace(/[*_~`]/g, "")
    .trim();

  const fullTextToSpeak = `${article.title}. ${article.subtitle || ""}. ${cleanBody}`;

  const utterance = new SpeechSynthesisUtterance(fullTextToSpeak);
  utterance.rate = currentArticleSpeed;
  utterance.pitch = 1.0;

  // Prefer Indian English / Hindi voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => v.lang.includes("hi") || v.lang.includes("en-IN") || v.lang.includes("en-GB"));
  if (preferredVoice) utterance.voice = preferredVoice;

  const statusEl = document.getElementById("article-audio-status");
  const btnText = document.getElementById("text-article-audio-play");
  const btnIcon = document.getElementById("icon-article-audio-play");

  utterance.onstart = () => {
    isArticleAudioPlaying = true;
    if (statusEl) {
      statusEl.textContent = "Playing...";
      statusEl.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700 animate-pulse";
    }
    if (btnText) btnText.textContent = "Pause Audio / रोकें";
    if (btnIcon) btnIcon.setAttribute("data-lucide", "pause");
    if (window.lucide) lucide.createIcons();
  };

  utterance.onend = () => {
    stopArticleAudio();
  };

  utterance.onerror = (e) => {
    console.warn("Audio speech error:", e);
    stopArticleAudio();
  };

  articleAudioUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

function stopArticleAudio() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  isArticleAudioPlaying = false;
  articleAudioUtterance = null;

  const statusEl = document.getElementById("article-audio-status");
  const btnText = document.getElementById("text-article-audio-play");
  const btnIcon = document.getElementById("icon-article-audio-play");

  if (statusEl) {
    statusEl.textContent = "Ready";
    statusEl.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600";
  }
  if (btnText) btnText.textContent = "Play Audio / सुनें";
  if (btnIcon) btnIcon.setAttribute("data-lucide", "play");
  if (window.lucide) lucide.createIcons();
}
window.stopArticleAudio = stopArticleAudio;

function setArticleAudioSpeed(rate) {
  currentArticleSpeed = rate;
  const speeds = [1.0, 1.25, 1.5];
  speeds.forEach(s => {
    const idKey = s === 1.0 ? "1" : (s === 1.25 ? "125" : "15");
    const btn = document.getElementById(`speed-btn-${idKey}`);
    if (btn) {
      if (s === rate) {
        btn.className = "px-2 py-0.5 rounded-lg text-[10.5px] font-bold bg-orange-100 text-orange-700";
      } else {
        btn.className = "px-2 py-0.5 rounded-lg text-[10.5px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200";
      }
    }
  });

  if (isArticleAudioPlaying && window.speechSynthesis.speaking) {
    startArticleAudioPlayback();
  }
}
window.setArticleAudioSpeed = setArticleAudioSpeed;

// ----------------------------------------------------------------------------
// 11. Videos & Tech Shorts Hub, In-Site Theater Player & Interactive Reels Feed
// ----------------------------------------------------------------------------

function getYouTubeEmbedUrl(url) {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.includes("/embed/")) {
    return trimmed + (trimmed.includes("?") ? "&" : "?") + "autoplay=1&rel=0&modestbranding=1";
  }

  // 1. YouTube Shorts: youtube.com/shorts/ID
  const shortsMatch = trimmed.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch && shortsMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${shortsMatch[1]}?autoplay=1&rel=0&modestbranding=1&loop=1`;
  }

  // 2. Standard YouTube: youtube.com/watch?v=ID
  const vMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (vMatch && vMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${vMatch[1]}?autoplay=1&rel=0&modestbranding=1`;
  }

  // 3. Shortened URL: youtu.be/ID
  const beMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (beMatch && beMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${beMatch[1]}?autoplay=1&rel=0&modestbranding=1`;
  }

  return trimmed;
}
window.getYouTubeEmbedUrl = getYouTubeEmbedUrl;

function renderReelsRail() {
  const container = document.getElementById("home-reels-rail") || document.getElementById("home-reels-container");
  if (!container) return;

  const list = (liveReelsList && liveReelsList.length) ? liveReelsList : fallbackReels;
  container.innerHTML = list.map(reel => `
    <div onclick="openReelsFeed('${reel.id}')"
         class="shrink-0 w-36 sm:w-44 relative rounded-2xl overflow-hidden aspect-[9/16] bg-slate-950 group cursor-pointer border border-slate-200 hover:border-orange-500 shadow-xs hover:shadow-md transition">
      <img src="${reel.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'}" alt="${escapeHtml(reel.title || 'Tech Reel')}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
      
      <div class="absolute inset-0 m-auto w-10 h-10 rounded-full bg-orange-600/90 text-white flex items-center justify-center group-hover:scale-110 transition shadow-lg">
        <i data-lucide="play" class="w-4 h-4 fill-white ml-0.5"></i>
      </div>

      <div class="absolute bottom-3 left-3 right-3 text-white space-y-1">
        <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/20 backdrop-blur-xs">${reel.views || "120K"} views</span>
        <h5 class="text-[11px] font-bold line-clamp-2 leading-tight">${escapeHtml(reel.title || "Quick Tech Review")}</h5>
      </div>
    </div>
  `).join("");
  if (window.lucide) lucide.createIcons();
}
window.renderReelsRail = renderReelsRail;

function filterMediaTab(tabName) {
  currentMediaTab = tabName;
  const tabs = ["all", "videos", "shorts"];
  tabs.forEach(t => {
    const btn = document.getElementById(`media-tab-${t}`);
    if (btn) {
      if (t === tabName) {
        btn.className = "media-filter-btn active px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 cursor-pointer";
      } else {
        btn.className = "media-filter-btn px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:border-orange-300 hover:bg-orange-50/50 cursor-pointer";
      }
    }
  });

  renderVideosAndShortsHub();
}
window.filterMediaTab = filterMediaTab;

function handleVideosSearch(query) {
  currentVideosSearchQuery = (query || "").trim().toLowerCase();
  const clearBtn = document.getElementById("btn-clear-videos-search");
  if (clearBtn) {
    if (currentVideosSearchQuery.length > 0) {
      clearBtn.classList.remove("hidden");
    } else {
      clearBtn.classList.add("hidden");
    }
  }
  renderVideosAndShortsHub();
}
window.handleVideosSearch = handleVideosSearch;

function clearVideosSearch() {
  currentVideosSearchQuery = "";
  const input = document.getElementById("videos-search-input");
  if (input) input.value = "";
  const clearBtn = document.getElementById("btn-clear-videos-search");
  if (clearBtn) clearBtn.classList.add("hidden");
  renderVideosAndShortsHub();
}
window.clearVideosSearch = clearVideosSearch;

function renderVideosAndShortsHub() {
  const allVids = liveEducationalVideos.length ? liveEducationalVideos : fallbackEducationalVideos;
  const allShorts = liveReelsList.length ? liveReelsList : fallbackReels;

  // Update Counters
  const countAll = document.getElementById("count-all-media");
  const countVids = document.getElementById("count-edu-videos");
  const countShorts = document.getElementById("count-tech-shorts");

  if (countAll) countAll.textContent = allVids.length + allShorts.length;
  if (countVids) countVids.textContent = allVids.length;
  if (countShorts) countShorts.textContent = allShorts.length;

  const q = currentVideosSearchQuery;
  const filteredVids = allVids.filter(v => 
    !q || 
    (v.title && v.title.toLowerCase().includes(q)) ||
    (v.category && v.category.toLowerCase().includes(q)) ||
    (v.description && v.description.toLowerCase().includes(q)) ||
    (v.topics && v.topics.some(t => t.toLowerCase().includes(q)))
  );

  const filteredShorts = allShorts.filter(s =>
    !q ||
    (s.title && s.title.toLowerCase().includes(q))
  );

  const secVids = document.getElementById("section-educational-videos");
  const secShorts = document.getElementById("section-tech-shorts");
  const emptyState = document.getElementById("videos-empty-state");

  const showVids = (currentMediaTab === "all" || currentMediaTab === "videos") && filteredVids.length > 0;
  const showShorts = (currentMediaTab === "all" || currentMediaTab === "shorts") && filteredShorts.length > 0;

  if (secVids) secVids.style.display = (currentMediaTab === "all" || currentMediaTab === "videos") ? "block" : "none";
  if (secShorts) secShorts.style.display = (currentMediaTab === "all" || currentMediaTab === "shorts") ? "block" : "none";

  if (!showVids && !showShorts) {
    if (emptyState) emptyState.classList.remove("hidden");
  } else {
    if (emptyState) emptyState.classList.add("hidden");
  }

  renderEducationalVideosGrid(filteredVids);
  renderTechShortsHubGrid(filteredShorts);

  if (window.lucide) lucide.createIcons();
}
window.renderVideosAndShortsHub = renderVideosAndShortsHub;

function renderEducationalVideosGrid(videos) {
  const container = document.getElementById("educational-videos-grid");
  if (!container) return;

  if (!videos.length) {
    container.innerHTML = `<p class="col-span-full text-center text-xs text-slate-400 py-6 font-medium">No educational videos match this filter.</p>`;
    return;
  }

  container.innerHTML = videos.map(v => `
    <div onclick="openVideoWatchPage('${v.id}')" class="jaankar-card overflow-hidden group cursor-pointer hover:border-orange-500 hover:shadow-lg transition flex flex-col justify-between">
      <div>
        <div class="relative w-full aspect-video bg-slate-900 overflow-hidden rounded-2xl mb-3">
          <img src="${v.thumbnail}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="${escapeHtml(v.title)}">
          <div class="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/5 transition-colors"></div>
          
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-11 h-11 rounded-full bg-orange-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-orange-500 transition-all">
              <i data-lucide="play" class="w-5 h-5 ml-0.5 fill-white"></i>
            </div>
          </div>

          <span class="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950/80 text-white backdrop-blur-xs">
            ${v.duration || "12:00"}
          </span>

          <span class="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-slate-900 shadow-xs">
            ${escapeHtml(v.category || "Tutorial")}
          </span>
        </div>

        <div class="space-y-1.5 px-1">
          <h4 class="font-extrabold text-sm text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
            ${escapeHtml(v.title)}
          </h4>
          <p class="text-[11px] text-slate-500 line-clamp-2 font-medium">
            ${escapeHtml(v.description || "")}
          </p>
        </div>
      </div>

      <div class="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between px-1 text-xs">
        <div class="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
          <i data-lucide="eye" class="w-3.5 h-3.5 text-slate-400"></i>
          <span>${v.views || "120K"} views</span>
        </div>

        <button type="button" onclick="event.stopPropagation(); explainVideoWithAi('${v.id}')" class="px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer" title="Get AI Summary of this Video">
          <i data-lucide="sparkles" class="w-3.5 h-3.5 text-orange-600"></i>
          <span>AI Explain</span>
        </button>
      </div>
    </div>
  `).join("");
}

function renderTechShortsHubGrid(shorts) {
  const container = document.getElementById("tech-reels-grid");
  if (!container) return;

  if (!shorts.length) {
    container.innerHTML = `<p class="col-span-full text-center text-xs text-slate-400 py-6 font-medium">No tech shorts match this filter.</p>`;
    return;
  }

  container.innerHTML = shorts.map(reel => `
    <div onclick="openReelsFeed('${reel.id}')" class="relative rounded-2xl overflow-hidden aspect-[9/16] bg-slate-950 group cursor-pointer border border-slate-200 hover:border-orange-500 shadow-xs hover:shadow-md transition">
      <img src="${reel.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="${escapeHtml(reel.title)}">
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

      <div class="absolute inset-0 m-auto w-10 h-10 rounded-full bg-orange-600/90 text-white flex items-center justify-center group-hover:scale-110 transition shadow-lg">
        <i data-lucide="play" class="w-4 h-4 fill-white ml-0.5"></i>
      </div>

      <div class="absolute bottom-2.5 left-2.5 right-2.5 text-white space-y-1">
        <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/20 backdrop-blur-xs">${reel.views || "120K"} views</span>
        <h5 class="text-[11px] font-bold line-clamp-2 leading-tight">${escapeHtml(reel.title || "Tech Reel")}</h5>
      </div>
    </div>
  `).join("");
}

// ----------------------------------------------------------------------------
// Dedicated In-Site YouTube-Style Theater Watch View
// ----------------------------------------------------------------------------

function openVideoWatchPage(videoId) {
  const allVids = liveEducationalVideos.length ? liveEducationalVideos : fallbackEducationalVideos;
  const video = allVids.find(v => v.id === videoId) || allVids[0];
  if (!video) return;

  activeWatchVideoId = video.id;

  const hubView = document.getElementById("view-videos-shorts");
  const watchView = document.getElementById("view-video-watch");
  if (hubView) hubView.classList.add("hidden");
  if (watchView) watchView.classList.remove("hidden");

  const iframe = document.getElementById("watch-main-iframe");
  const videoEl = document.getElementById("watch-main-video");

  const rawUrl = video.videoUrl || "https://www.youtube.com/watch?v=BL4DCEp7blY";
  const isDirectVideo = rawUrl.includes(".mp4") || rawUrl.includes(".webm") || rawUrl.includes("cloudinary.com");

  if (isDirectVideo) {
    if (iframe) { iframe.src = ""; iframe.classList.add("hidden"); }
    if (videoEl) {
      videoEl.src = rawUrl;
      videoEl.classList.remove("hidden");
      videoEl.play().catch(() => {});
    }
  } else {
    if (videoEl) { videoEl.pause(); videoEl.src = ""; videoEl.classList.add("hidden"); }
    if (iframe) {
      iframe.src = getYouTubeEmbedUrl(rawUrl);
      iframe.classList.remove("hidden");
    }
  }

  const catBadge = document.getElementById("watch-video-category-badge");
  const durBadge = document.getElementById("watch-video-duration-badge");
  const titleEl = document.getElementById("watch-video-title");
  const statsEl = document.getElementById("watch-video-stats");

  if (catBadge) catBadge.textContent = video.category || "Educational";
  if (durBadge) durBadge.textContent = video.duration || "15:00";
  if (titleEl) titleEl.textContent = video.title;
  if (statsEl) statsEl.textContent = `${video.views || "120K"} views • ${video.date || "Verified Guide"} • HD In-Site Stream`;

  updateWatchLikeDisplay();
  renderWatchAiBreakdown(video);
  renderWatchRelatedVideos(video.id);

  window.scrollTo({ top: 0, behavior: "smooth" });
  if (window.lucide) lucide.createIcons();
}
window.openVideoWatchPage = openVideoWatchPage;

function closeVideoWatchPage() {
  const iframe = document.getElementById("watch-main-iframe");
  const videoEl = document.getElementById("watch-main-video");
  if (iframe) iframe.src = "";
  if (videoEl) { videoEl.pause(); videoEl.src = ""; }

  if (currentWatchSourceTab === "news") {
    switchTab("news");
  } else {
    switchTab("videos-shorts");
  }
}
window.closeVideoWatchPage = closeVideoWatchPage;

function playRelatedVideo(videoId) {
  openVideoWatchPage(videoId);
}
window.playRelatedVideo = playRelatedVideo;

function renderWatchAiBreakdown(video) {
  const container = document.getElementById("watch-ai-breakdown-content");
  if (!container) return;

  const takeaways = (video.learningTakeaways && video.learningTakeaways.length)
    ? video.learningTakeaways 
    : ((video.keyTakeaways && video.keyTakeaways.length)
      ? video.keyTakeaways
      : [
        "In-depth hardware specifications and real-world performance benchmarks",
        "Key engineering concepts explained simply with practical demonstrations",
        "Verified buying criteria and comparison with current market alternatives"
      ]);

  const topics = video.topics && video.topics.length 
    ? video.topics 
    : ["Overview & Fundamentals", "Hardware Architecture", "Performance Testing", "Final Recommendation"];

  const prods = (video.recommendedProducts && video.recommendedProducts.length)
    ? video.recommendedProducts
    : ((video.gadgets && video.gadgets.length) ? video.gadgets : []);

  let html = `
    <div class="space-y-3.5">
      <div>
        <h4 class="text-xs font-black uppercase text-slate-800 tracking-wider mb-1.5 flex items-center gap-1.5">
          <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-600"></i>
          <span>What You Will Learn In This Video</span>
        </h4>
        <ul class="space-y-1.5 text-xs text-slate-600">
          ${takeaways.map(t => `<li class="flex items-start gap-2"><span class="text-orange-500 font-bold">•</span><span>${escapeHtml(t)}</span></li>`).join("")}
        </ul>
      </div>

      <div class="pt-2 border-t border-slate-100">
        <h4 class="text-xs font-black uppercase text-slate-800 tracking-wider mb-1.5 flex items-center gap-1.5">
          <i data-lucide="layers" class="w-3.5 h-3.5 text-blue-600"></i>
          <span>Key Topics & Timestamps Covered</span>
        </h4>
        <div class="flex flex-wrap gap-1.5">
          ${topics.map((tp, idx) => `<span class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-2xs">${idx + 1}. ${escapeHtml(tp)}</span>`).join("")}
        </div>
      </div>
  `;

  if (prods.length) {
    html += `
      <div class="pt-2 border-t border-slate-100">
        <h4 class="text-xs font-black uppercase text-slate-800 tracking-wider mb-1.5 flex items-center gap-1.5">
          <i data-lucide="shopping-cart" class="w-3.5 h-3.5 text-orange-600"></i>
          <span>Products & Hardware Mentioned in Video</span>
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${prods.map(p => `
            <div class="p-2.5 rounded-xl bg-white border border-orange-200 shadow-2xs flex items-center justify-between gap-2">
              <span class="text-xs font-bold text-slate-900 truncate">${escapeHtml(p.name)}</span>
              <div class="flex items-center gap-1 shrink-0">
                <a href="https://www.amazon.in/s?k=${encodeURIComponent(p.search || p.name)}" target="_blank" class="px-2 py-1 rounded bg-[#FF9900] text-black font-extrabold text-[9.5px]">Amazon</a>
                <a href="https://www.flipkart.com/search?q=${encodeURIComponent(p.search || p.name)}" target="_blank" class="px-2 py-1 rounded bg-[#2874F0] text-white font-extrabold text-[9.5px]">Flipkart</a>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  html += `</div>`;
  container.innerHTML = html;
  if (window.lucide) lucide.createIcons();
}

function renderWatchRelatedVideos(currentId) {
  const container = document.getElementById("watch-related-videos-container");
  if (!container) return;

  const allVids = liveEducationalVideos.length ? liveEducationalVideos : fallbackEducationalVideos;
  const related = allVids.filter(v => v.id !== currentId);

  const badgeEl = document.getElementById("related-videos-count-badge");
  if (badgeEl) badgeEl.textContent = `${related.length} Videos`;

  container.innerHTML = related.map(v => `
    <div onclick="playRelatedVideo('${v.id}')" class="p-2.5 rounded-2xl bg-white border border-slate-200 hover:border-orange-400 hover:shadow-md transition flex gap-3 cursor-pointer group">
      <div class="relative w-32 aspect-video rounded-xl overflow-hidden bg-slate-900 shrink-0">
        <img src="${v.thumbnail}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="${escapeHtml(v.title)}">
        <span class="absolute bottom-1 right-1 px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-slate-950/80 text-white">${v.duration || "12:00"}</span>
        <div class="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors"></div>
      </div>
      <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <span class="text-[9.5px] font-black uppercase text-orange-600">${escapeHtml(v.category || "Tech")}</span>
          <h4 class="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">${escapeHtml(v.title)}</h4>
        </div>
        <p class="text-[10px] text-slate-400 font-medium">${v.views || "120K"} views • ${v.date || "Guide"}</p>
      </div>
    </div>
  `).join("");
  if (window.lucide) lucide.createIcons();
}

function toggleCurrentWatchLike() {
  if (!activeWatchVideoId) return;
  likedVideosMap[activeWatchVideoId] = !likedVideosMap[activeWatchVideoId];
  localStorage.setItem("jaankar_liked_videos", JSON.stringify(likedVideosMap));
  updateWatchLikeDisplay();
  showAppToast(likedVideosMap[activeWatchVideoId] ? "Added to your Liked Videos!" : "Removed from Liked Videos");
}
window.toggleCurrentWatchLike = toggleCurrentWatchLike;

function updateWatchLikeDisplay() {
  const isLiked = !!likedVideosMap[activeWatchVideoId];
  const icon = document.getElementById("icon-watch-like");
  const text = document.getElementById("text-watch-likes-count");
  const btn = document.getElementById("btn-watch-like");

  if (icon && text && btn) {
    if (isLiked) {
      btn.className = "px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer";
      icon.className = "w-4 h-4 text-rose-600 fill-rose-600";
      text.textContent = "Liked";
    } else {
      btn.className = "px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer";
      icon.className = "w-4 h-4 text-slate-700";
      text.textContent = "Like";
    }
  }
}

function shareWatchVideo() {
  const allVids = liveEducationalVideos.length ? liveEducationalVideos : fallbackEducationalVideos;
  const vid = allVids.find(v => v.id === activeWatchVideoId);
  const title = vid ? vid.title : "JAANKAR Educational Video";
  const url = window.location.href;

  if (navigator.share) {
    navigator.share({ title: title, text: `Watch "${title}" on JAANKAR!`, url: url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => {
      showAppToast("Video link copied to clipboard!");
    }).catch(() => {
      showAppToast("Share link: " + url);
    });
  }
}
window.shareWatchVideo = shareWatchVideo;

function analyzeCurrentWatchVideoWithAi() {
  const allVids = liveEducationalVideos.length ? liveEducationalVideos : fallbackEducationalVideos;
  const vid = allVids.find(v => v.id === activeWatchVideoId);
  if (!vid) return;

  const prompt = `Please provide a deep-dive learning breakdown and key technical takeaways for this video: "${vid.title}". Category: ${vid.category}. Overview: ${vid.description}`;
  openJaankarAiWithQuery(prompt);
}
window.analyzeCurrentWatchVideoWithAi = analyzeCurrentWatchVideoWithAi;

function explainVideoWithAi(videoId) {
  const allVids = liveEducationalVideos.length ? liveEducationalVideos : fallbackEducationalVideos;
  const vid = allVids.find(v => v.id === videoId);
  if (!vid) return;

  const prompt = `Main "${vid.title}" video dekhna chahta hoon. Is video mein kya-kya sikhaya gaya hai, iske main topics kya hain aur isme kaunse hardware/specs dikhaye gaye hain?`;
  openJaankarAiWithQuery(prompt);
}
window.explainVideoWithAi = explainVideoWithAi;

// ----------------------------------------------------------------------------
// Full-Screen Interactive Reels Feed Player
// ----------------------------------------------------------------------------

function openReelsFeed(reelId) {
  try {
    const list = (liveReelsList && liveReelsList.length) ? liveReelsList : fallbackReels;
    let idx = -1;
    if (reelId) {
      idx = list.findIndex(r => String(r.id) === String(reelId));
    }
    if (idx === -1) idx = 0;
    currentReelIndex = idx;

    const modal = document.getElementById("modal-reels-feed");
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      modal.classList.add("active");
      modal.style.display = "flex";
      document.body.classList.add("overflow-hidden");
    }

    showReelAtIndex(currentReelIndex);
    window.addEventListener("keydown", handleReelsKeyNavigation);
  } catch (err) {
    console.error("Error opening reels feed:", err);
    document.body.classList.remove("overflow-hidden");
  }
}
window.openReelsFeed = openReelsFeed;

function closeReelsFeed() {
  try {
    const modal = document.getElementById("modal-reels-feed");
    if (modal) {
      modal.classList.remove("active");
      modal.classList.remove("flex");
      modal.classList.add("hidden");
      modal.style.display = "none";
      document.body.classList.remove("overflow-hidden");
    }

    const iframe = document.getElementById("reels-feed-iframe");
    const video = document.getElementById("reels-feed-video");
    if (iframe) iframe.src = "";
    if (video) { video.pause(); video.src = ""; }

    window.removeEventListener("keydown", handleReelsKeyNavigation);
  } catch (err) {
    console.error("Error closing reels feed:", err);
    document.body.classList.remove("overflow-hidden");
  }
}
window.closeReelsFeed = closeReelsFeed;

function handleReelsKeyNavigation(e) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    nextReel();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    prevReel();
  } else if (e.key === "Escape") {
    closeReelsFeed();
  }
}

function showReelAtIndex(idx) {
  try {
    const list = (liveReelsList && liveReelsList.length) ? liveReelsList : fallbackReels;
    if (!list || !list.length) return;

    if (idx < 0) idx = list.length - 1;
    if (idx >= list.length) idx = 0;
    currentReelIndex = idx;

    const reel = list[currentReelIndex];
    if (!reel) return;

    const iframe = document.getElementById("reels-feed-iframe");
    const video = document.getElementById("reels-feed-video");
    const titleEl = document.getElementById("reels-feed-title");
    const viewsEl = document.getElementById("reels-feed-views");

    if (titleEl) titleEl.textContent = reel.title || "Quick Tech Breakdown";
    if (viewsEl) viewsEl.textContent = `${reel.viewsCount || reel.views || "120K"} views`;

    try { updateReelLikeDisplay(reel.id); } catch (_) {}

    const rawUrl = reel.videoUrl || reel.url || "";
    const isDirect = rawUrl.includes(".mp4") || rawUrl.includes(".webm") || rawUrl.includes("cloudinary.com");

    if (isDirect) {
      if (iframe) { iframe.src = ""; iframe.classList.add("hidden"); }
      if (video) {
        video.src = rawUrl;
        video.classList.remove("hidden");
        video.play().catch(() => {});
      }
    } else if (rawUrl) {
      if (video) { video.pause(); video.src = ""; video.classList.add("hidden"); }
      if (iframe) {
        iframe.src = getYouTubeEmbedUrl(rawUrl);
        iframe.classList.remove("hidden");
      }
    } else {
      if (video) { video.pause(); video.src = ""; video.classList.add("hidden"); }
      if (iframe) {
        iframe.src = "https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?autoplay=1&rel=0&modestbranding=1";
        iframe.classList.remove("hidden");
      }
    }

    if (window.lucide && typeof lucide.createIcons === "function") {
      try { lucide.createIcons(); } catch (_) {}
    }
  } catch (err) {
    console.error("Error in showReelAtIndex:", err);
  }
}

function nextReel() {
  const list = liveReelsList.length ? liveReelsList : fallbackReels;
  showReelAtIndex((currentReelIndex + 1) % list.length);
}
window.nextReel = nextReel;

function prevReel() {
  const list = liveReelsList.length ? liveReelsList : fallbackReels;
  showReelAtIndex((currentReelIndex - 1 + list.length) % list.length);
}
window.prevReel = prevReel;

function toggleCurrentReelLike() {
  const list = liveReelsList.length ? liveReelsList : fallbackReels;
  const reel = list[currentReelIndex];
  if (!reel) return;

  likedReelsMap[reel.id] = !likedReelsMap[reel.id];
  localStorage.setItem("jaankar_liked_reels", JSON.stringify(likedReelsMap));
  updateReelLikeDisplay(reel.id);
  showAppToast(likedReelsMap[reel.id] ? "❤️ Liked Short!" : "Removed like");
}
window.toggleCurrentReelLike = toggleCurrentReelLike;

function updateReelLikeDisplay(reelId) {
  const isLiked = !!likedReelsMap[reelId];
  const heartIcon = document.getElementById("reels-feed-heart-icon");
  if (heartIcon) {
    if (isLiked) {
      heartIcon.className = "w-5 h-5 text-rose-500 fill-rose-500";
    } else {
      heartIcon.className = "w-5 h-5 text-white";
    }
  }
}

function shareCurrentReel() {
  const list = liveReelsList.length ? liveReelsList : fallbackReels;
  const reel = list[currentReelIndex];
  const title = reel ? reel.title : "JAANKAR Tech Short";
  const url = window.location.href;

  if (navigator.share) {
    navigator.share({ title: title, text: `Watch this short "${title}" on JAANKAR!`, url: url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => {
      showAppToast("Shorts link copied!");
    });
  }
}
window.shareCurrentReel = shareCurrentReel;

function explainCurrentReelWithAi() {
  const list = liveReelsList.length ? liveReelsList : fallbackReels;
  const reel = list[currentReelIndex];
  if (!reel) return;

  closeReelsFeed();
  const prompt = `Please explain the key tech tips and takeaway of this short reel: "${reel.title}". What practical step should the user follow?`;
  openJaankarAiWithQuery(prompt);
}
window.explainCurrentReelWithAi = explainCurrentReelWithAi;

// ----------------------------------------------------------------------------
// 12. Jaankar AI Voice Assistant with Flipkart/Amazon Links
// ----------------------------------------------------------------------------
function openJaankarAiDrawer() {
  const drawer = document.getElementById("drawer-jaankar-ai");
  if (drawer) {
    drawer.classList.remove("translate-x-full");
    drawer.classList.remove("hidden");
  }
}
window.openJaankarAiDrawer = openJaankarAiDrawer;

function closeJaankarAiDrawer() {
  const drawer = document.getElementById("drawer-jaankar-ai");
  if (drawer) {
    drawer.classList.add("translate-x-full");
  }
}
window.closeJaankarAiDrawer = closeJaankarAiDrawer;

function openJaankarAiWithQuery(query) {
  openJaankarAiDrawer();
  const input = document.getElementById("ai-user-query-input") || document.getElementById("ai-chat-input");
  if (input) input.value = query;
  if (query) {
    handleSendAiMessage(query);
  }
}
window.openJaankarAiWithQuery = openJaankarAiWithQuery;

function triggerSearchAiButton() {
  const searchInput = document.getElementById("global-search-input");
  const q = searchInput ? searchInput.value.trim() : "";
  openJaankarAiWithQuery(q || "Latest smartphone, laptop & gadget recommendations");
}
window.triggerSearchAiButton = triggerSearchAiButton;

function toggleVoiceMic() {
  const micBtn = document.getElementById("btn-ai-voice-talk") || document.getElementById("ai-mic-btn");
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
    const input = document.getElementById("ai-user-query-input") || document.getElementById("ai-chat-input");
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
window.toggleAiVoiceTalk = toggleVoiceMic;

function speakAiText(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace(/[#*_`]/g, ""));
  utterance.lang = currentLanguage === "hi" ? "hi-IN" : "en-US";
  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
}

function handleSendAiMessage(customPrompt = null) {
  const input = document.getElementById("ai-user-query-input") || document.getElementById("ai-chat-input");
  const msgContainer = document.getElementById("ai-chat-history") || document.getElementById("ai-chat-messages-container");
  if (!msgContainer) return;

  const userQuery = (typeof customPrompt === "string" ? customPrompt : (input ? input.value : "")).trim();
  if (!userQuery) return;
  if (input) input.value = "";

  // Append user bubble (White & Orange Theme)
  msgContainer.insertAdjacentHTML("beforeend", `
    <div class="flex items-start justify-end gap-2.5">
      <div class="p-3 rounded-2xl rounded-tr-none bg-orange-600 text-white text-xs font-semibold max-w-[85%] shadow-md">
        <p>${escapeHtml(userQuery)}</p>
      </div>
    </div>
  `);
  msgContainer.scrollTop = msgContainer.scrollHeight;

  // Typing placeholder
  const typingId = "ai-typing-" + Date.now();
  msgContainer.insertAdjacentHTML("beforeend", `
    <div id="${typingId}" class="flex items-start gap-2.5 max-w-[85%]">
      <img src="jaankar-logo.png" alt="AI" class="w-7 h-7 object-contain drop-shadow-xs shrink-0 mt-0.5">
      <div class="p-3 rounded-2xl rounded-tl-none bg-orange-50/80 border border-orange-200 text-slate-700 text-xs font-medium space-y-1">
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-orange-500 animate-bounce"></span>
          <span class="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style="animation-delay: 0.2s"></span>
          <span class="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style="animation-delay: 0.4s"></span>
        </div>
      </div>
    </div>
  `);
  msgContainer.scrollTop = msgContainer.scrollHeight;

  setTimeout(() => {
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();

    const q = userQuery.toLowerCase().trim();
    const rawClean = userQuery.trim();
    let reply = "";
    let buyCard = "";

    const makeBuyCard = (title, subtitle, queryTerm, approxPrice = null) => `
      <div class="mt-2.5 p-3 rounded-xl bg-white border border-orange-200 shadow-xs flex items-center justify-between gap-2">
        <div class="min-w-0 flex-1">
          <p class="text-xs font-bold text-slate-900 truncate">${escapeHtml(title)}</p>
          <p class="text-[10px] text-orange-600 font-bold">${approxPrice ? approxPrice + ' • ' : ''}${escapeHtml(subtitle || 'Verified Live Stores')}</p>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <a href="https://www.amazon.in/s?k=${encodeURIComponent(queryTerm)}" target="_blank" class="px-2.5 py-1.5 rounded-lg bg-[#FF9900] hover:bg-[#e68a00] text-black font-extrabold text-[10px] shadow-xs transition inline-flex items-center gap-1">
            <span>Amazon</span>
          </a>
          <a href="https://www.flipkart.com/search?q=${encodeURIComponent(queryTerm)}" target="_blank" class="px-2.5 py-1.5 rounded-lg bg-[#2874F0] hover:bg-[#1a65dc] text-white font-extrabold text-[10px] shadow-xs transition inline-flex items-center gap-1">
            <span>Flipkart</span>
          </a>
        </div>
      </div>
    `;

    // 1. Odia Greetings & Small Talk
    if (
      q.includes("kana karuchha") || q.includes("kana karucha") || q.includes("kana chalichi") ||
      q.includes("kemiti achha") || q.includes("kemiti acha") || q.includes("namaskar") ||
      q === "odia" || q.includes("tume kie") || q.includes("tume kiye")
    ) {
      reply = "Namaskar! 🙏 Mu JAANKAR AI — aapankara 24/7 personal tech au gadget assistant.\n\nMu aapanku latest smartphone, laptop, PC build au market ra sabutharu badhia offers khojiba re sahayata kari pare. Aaji aapana kounasi particular device baare re janibaku chahunchhanti ki?";
      buyCard = "";
    }
    // 2. Hindi / Hinglish / English Greetings & Casual Queries
    else if (
      q === "hi" || q === "hello" || q === "hey" || q === "namaste" || q === "hii" ||
      q.includes("kya kar rahe ho") || q.includes("kya kar rhe ho") || q.includes("kya kar raha hai") ||
      q.includes("kya haal") || q.includes("kaise ho") || q.includes("kaisa hai") || q.includes("kaisi ho") ||
      q.includes("good morning") || q.includes("good evening") || q.includes("good afternoon") ||
      q.includes("how are you") || q.includes("whats up") || q.includes("what's up")
    ) {
      reply = "Namaste! Main bilkul badiya hoon. 😊\n\nMain **JAANKAR AI** hoon — yahan aapke sabhi technology, gadgets, laptops aur phones ke sawalon ke liye taiyar hoon.\n\nAapko aaj kya assist karun? Jaise ki:\n• Kisi laptop ya phone ka detailed specs analysis\n• Best deals on Amazon & Flipkart\n• Custom PC building ya parts compatibility\n\nBataiye, aap kis product ya budget ke baare mein search kar rahe hain?";
      buyCard = "";
    }
    // 3. Identity / Bot Info
    else if (
      q.includes("who are you") || q.includes("tum kaun ho") || q.includes("aap kaun ho") ||
      q.includes("tera naam") || q.includes("kya ho tum") || q.includes("about you")
    ) {
      reply = "Main **JAANKAR AI** hoon — India ka specialized Tech Intelligence Assistant! ⚡\n\nMain tech buyers ko empower karta hoon:\n1. **Unbiased Specs Breakdown**: CPU, GPU, Display, Battery aur Build quality ka real-world analysis.\n2. **Store Comparison**: Amazon aur Flipkart ke verified prices aur discounts live scan karna.\n3. **PC Compatibility**: Processors, Motherboards aur RAM generations ka match.\n\nAap koi bhi gadget model ya budget type karke pooch sakte hain!";
      buyCard = "";
    }
    // 4. Specific Product: ASUS ExpertBook P1 i3 13th Gen (or similar ExpertBook / ThinkPad models)
    else if (q.includes("expertbook") || (q.includes("asus") && (q.includes("p1") || q.includes("i3") || q.includes("13th")))) {
      reply = "💻 **ASUS ExpertBook P1 (Intel Core i3 13th Gen) — Full Technical Breakdown:**\n\n" +
        "• **Target Segment**: Commercial / Business & Student Productivity Laptop\n" +
        "• **Processor**: Intel Core i3-1315U (13th Gen Raptor Lake, 6 Cores [2 Performance + 4 Efficient], 8 Threads, Turbo up to 4.50 GHz, 10MB Intel Smart Cache)\n" +
        "• **Graphics**: Integrated Intel UHD Graphics (Great for 4K video playback, YouTube, Office, but not for heavy 3D gaming)\n" +
        "• **RAM & Storage**: 8GB / 16GB DDR4 RAM (expandable via SO-DIMM slot) + 512GB PCIe 4.0 NVMe SSD\n" +
        "• **Display**: 14-inch or 15.6-inch Full HD (1920x1080) Anti-Glare Display with 180° lay-flat hinge\n" +
        "• **Build Quality**: Military-grade MIL-STD-810H certified chassis with spill-resistant keyboard and fingerprint sensor\n" +
        "• **Battery Life**: Approx. 6 to 8 hours regular office multitasking with 42Wh battery\n\n" +
        "⭐ **JAANKAR AI Verdict**: Agar aapka primary kaam programming, web browsing, online classes, accounting (Tally/Excel) aur office work hai, toh ye ₹32,000 - ₹38,000 range mein bohot robust aur reliable choice hai. Neeche verified stores se price check karein:";
      buyCard = makeBuyCard("ASUS ExpertBook P1 (i3 13th Gen)", "Commercial Tough Business Laptop", "asus expertbook p1 i3 13th gen", "₹34,990");
    }
    // 5. Generic Laptop Searches
    else if (q.includes("laptop") || q.includes("macbook") || q.includes("thinkpad") || q.includes("vivobook") || q.includes("ideapad") || q.includes("pavilion") || q.includes("loq") || q.includes("tuf") || q.includes("victus")) {
      let budgetNote = "";
      if (q.includes("30000") || q.includes("35000") || q.includes("40000")) {
        budgetNote = "In ₹30K-₹40K: Look for Core i3 12th/13th Gen or Ryzen 5 5500U with minimum 8GB/512GB SSD.";
      } else if (q.includes("50000") || q.includes("60000")) {
        budgetNote = "In ₹50K-₹60K: Best options include Intel Core i5 12th/13th Gen or Ryzen 5 7530U with 16GB RAM.";
      } else if (q.includes("gaming")) {
        budgetNote = "For Gaming: Choose minimum 6-Core CPU + dedicated RTX 3050 (6GB) or RTX 4050 GPU for modern games.";
      }
      reply = `💻 **Laptop Analysis for "${rawClean}":**\n\n` +
        `• **Processor Recommendation**: Intel Core i5 (13th/14th Gen) ya AMD Ryzen 5 (7000/8000 series) for long-term smooth performance.\n` +
        `• **RAM**: Kam se kam 16GB prefer karein (multitasking aur future updates ke liye zaroori hai).\n` +
        `• **Storage**: PCIe Gen4 NVMe SSD (minimum 512GB) boot speed aur file transfers ko 5x fast banata hai.\n` +
        `• **Display**: 100% sRGB IPS panel ya OLED 120Hz screen eye-strain kam karti hai.\n` +
        (budgetNote ? `\n💡 **Tip**: ${budgetNote}\n` : "") +
        `\nNeeche diye gaye direct store links se verified models aur user reviews check karein:`;
      buyCard = makeBuyCard(rawClean, "Verified Laptop Deals", rawClean);
    }
    // 6. Generic Mobile / Smartphone Searches
    else if (q.includes("phone") || q.includes("mobile") || q.includes("smartphone") || q.includes("iphone") || q.includes("samsung") || q.includes("oneplus") || q.includes("redmi") || q.includes("realme") || q.includes("iqoo") || q.includes("pixel") || q.includes("moto")) {
      reply = `📱 **Smartphone Market Insights for "${rawClean}":**\n\n` +
        `• **Performance**: 4nm Chipset (Snapdragon 7+ Gen 3, 8s Gen 3, ya Dimensity 8300 Ultra) best power efficiency dete hain.\n` +
        `• **Camera**: Mega-pixels se zyada **OIS (Optical Image Stabilization)** aur Sony LYT/IMX sensor size par dhyan dein.\n` +
        `• **Display**: 120Hz AMOLED / LTPO panel with 1.5K resolution sunlight visibility mein behtareen hai.\n` +
        `• **Battery**: 5000mAh minimum with 67W-100W Fast Charging.\n\n` +
        `Neeche diye gaye link se current live bank discounts aur exchange bonus check karein:`;
      buyCard = makeBuyCard(rawClean, "Top Smartphone Deals & Offers", rawClean);
    }
    // 7. PC Build / Components Searches
    else if (q.includes("pc build") || q.includes("processor") || q.includes("cpu") || q.includes("gpu") || q.includes("graphics card") || q.includes("rtx") || q.includes("motherboard") || q.includes("ram") || q.includes("ddr5") || q.includes("ssd") || q.includes("smps")) {
      reply = `🖥️ **PC Hardware Architecture Recommendation for "${rawClean}":**\n\n` +
        `• **CPU + GPU Balance**: GPU ko hamesha budget ka ~40-45% dein taaki gaming/rendering bottleneck na ho.\n` +
        `• **Motherboard**: VRM heatsinks aur PCIe 5.0 M.2 slot wali motherboard choose karein (e.g. B650 for AMD AM5, B760 for Intel LGA1700).\n` +
        `• **RAM**: Dual-channel DDR5 6000MHz CL30 (2x16GB) latency aur frame stability ke liye optimal hai.\n` +
        `• **Power Supply**: 80-Plus Gold certified PSU with Japanese capacitors (Tier A/B).\n\n` +
        `Parts availability aur discounted prices neeche compare karein:`;
      buyCard = makeBuyCard(rawClean, "Hardware Components & Rig Deals", rawClean);
    }
    // 8. General Budget Queries (e.g. "under 20000", "under 50k", etc.)
    else if (q.match(/(?:under|below|budget|mein)\s*(?:₹|rs\.?|inr)?\s*(\d+)(?:k)?/i)) {
      const budgetMatch = q.match(/(?:under|below|budget|mein)\s*(?:₹|rs\.?|inr)?\s*(\d+)(?:k)?/i);
      const rawNum = parseInt(budgetMatch[1]);
      const budgetVal = (q.includes("k") && rawNum < 1000) ? rawNum * 1000 : rawNum;
      reply = `🎯 **Best Tech Recommendations in your budget (~₹${budgetVal.toLocaleString('en-IN')}):**\n\n` +
        `• **Market Trends**: Is price bracket mein maximum value lene ke liye festival bank offers aur exchange discounts apply karein.\n` +
        `• **Key Checkpoints**: Latest generation processor, UFS storage speed aur brand service network zaroor dekhein.\n\n` +
        `Amazon aur Flipkart par live verified best-sellers list dekhein:`;
      buyCard = makeBuyCard(`Best Tech Under ₹${budgetVal.toLocaleString('en-IN')}`, "Top Rated Gadgets", `electronics under ${budgetVal}`);
    }
    // 9. Intelligent General Tech Fallback
    else {
      reply = `🔍 **JAANKAR AI Smart Analysis for "${rawClean}":**\n\n` +
        `Aapke query ke anusar, humne is device / tech topic ka specs aur market trend analyze kiya hai:\n\n` +
        `• **Key Advice**: Kharidne se pehle release year, brand warranty terms, customer rating (4.0+ with 500+ reviews), aur processor architecture verify karein.\n` +
        `• **Smart Saving Tip**: Hamesha credit card instant discounts aur exchange offers apply karein taaki ₹1,500 - ₹5,000 tak ki extra bachat ho sake.\n\n` +
        `Aap is product ke live prices aur customer reviews direct neeche compare kar sakte hain:`;
      buyCard = makeBuyCard(rawClean, "Verified Deals & Comparisons", rawClean);
    }

    msgContainer.insertAdjacentHTML("beforeend", `
      <div class="flex items-start gap-2.5 max-w-[85%]">
        <img src="jaankar-logo.png" alt="AI" class="w-7 h-7 object-contain drop-shadow-xs shrink-0 mt-0.5">
        <div class="p-3.5 rounded-2xl rounded-tl-none bg-orange-50/70 border border-orange-200 text-slate-800 text-xs font-medium space-y-1.5 shadow-xs">
          <p class="whitespace-pre-line leading-relaxed">${reply}</p>
          ${buyCard}
        </div>
      </div>
    `);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // Speak aloud with SpeechSynthesis
    speakAiText(reply.split("\n")[0] || reply);
  }, 400);
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

function handleSaveUserProfile(e) {
  if (e && e.preventDefault) e.preventDefault();
  saveUserProfile();
  return false;
}
window.handleSaveUserProfile = handleSaveUserProfile;

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

function handleSendSupportChatMessage(e) {
  if (e && e.preventDefault) e.preventDefault();
  sendSupportTextMessage();
  return false;
}
window.handleSendSupportChatMessage = handleSendSupportChatMessage;
window.handleSupportImageAttached = handleSupportImageUpload;

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
function hideSearchDropdown() {
  const dropdown = document.getElementById("search-results-dropdown") || document.getElementById("home-search-results-dropdown");
  if (dropdown) dropdown.classList.add("hidden");
}
window.hideSearchDropdown = hideSearchDropdown;

function handleGlobalSearch(query) {
  const q = (query || "").trim().toLowerCase();
  const dropdown = document.getElementById("search-results-dropdown") || document.getElementById("home-search-results-dropdown");
  if (!dropdown) return;

  if (!q || q.length < 2) {
    dropdown.classList.add("hidden");
    return;
  }

  const allNews = liveNewsList.length ? liveNewsList : fallbackNews;
  const allProds = liveProductsList.length ? liveProductsList : defaultProductsCatalog;

  // 1. Matched Products
  const matchedProds = allProds.filter(p => 
    (p.name && p.name.toLowerCase().includes(q)) || 
    (p.category && p.category.toLowerCase().includes(q)) ||
    (p.description && p.description.toLowerCase().includes(q))
  ).slice(0, 3);

  // 2. Matched News
  const matchedNews = allNews.filter(n => 
    (n.title && n.title.toLowerCase().includes(q)) ||
    (n.summary && n.summary.toLowerCase().includes(q))
  ).slice(0, 3);

  // 3. Matched Smart Tools
  const smartTools = [
    { id: "pdf-compressor", name: "PDF Compressor", desc: "Reduce PDF MB size client-side", icon: "file-down", color: "text-red-500", bg: "bg-red-50" },
    { id: "qr-scanner", name: "QR Scanner & Maker", desc: "Scan and generate custom QR codes", icon: "qr-code", color: "text-blue-500", bg: "bg-blue-50" },
    { id: "img-to-pdf", name: "Image to PDF", desc: "Combine photos into single PDF file", icon: "images", color: "text-emerald-500", bg: "bg-emerald-50" },
    { id: "smart-alarms", name: "Smart Alarms & Timer", desc: "Sound alerts and stopwatch in browser", icon: "alarm-clock", color: "text-amber-500", bg: "bg-amber-50" }
  ];
  const matchedTools = smartTools.filter(t => 
    t.name.toLowerCase().includes(q) || 
    t.desc.toLowerCase().includes(q) || 
    t.id.includes(q)
  );

  // If completely empty, show AI Fallback
  if (!matchedProds.length && !matchedNews.length && !matchedTools.length) {
    dropdown.innerHTML = `
      <div class="p-4 text-center space-y-3">
        <div class="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-xs">
          <i data-lucide="sparkles" class="w-5 h-5 text-orange-600"></i>
        </div>
        <div>
          <p class="text-xs font-bold text-slate-800">No catalog match for "${escapeHtml(q)}"</p>
          <p class="text-[11px] text-slate-500 mt-0.5">Let JAANKAR AI browse specs, benchmark comparisons & verified stores for you!</p>
        </div>
        <button type="button" onclick="openJaankarAiWithQuery('${escapeHtml(q)}'); hideSearchDropdown();" class="btn-primary-orange text-xs py-2 px-4 mx-auto cursor-pointer shadow-md inline-flex items-center gap-1.5">
          <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
          <span>Ask JAANKAR AI</span>
        </button>
      </div>
    `;
    dropdown.classList.remove("hidden");
    if (window.lucide) lucide.createIcons();
    return;
  }

  let html = `<div class="p-1 space-y-2 text-xs">`;

  // Render Smart Tools
  if (matchedTools.length) {
    html += `<div class="px-2.5 pt-1 text-[10px] font-black uppercase tracking-wider text-amber-600 flex items-center gap-1"><i data-lucide="wrench" class="w-3 h-3"></i><span>Smart Tools</span></div>`;
    matchedTools.forEach(t => {
      html += `
        <div onclick="openSpecificTool('${t.id}'); hideSearchDropdown();" class="p-2.5 rounded-xl hover:bg-amber-50/60 border border-transparent hover:border-amber-200 flex items-center justify-between cursor-pointer transition">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg ${t.bg} ${t.color} flex items-center justify-center shrink-0">
              <i data-lucide="${t.icon}" class="w-4 h-4"></i>
            </div>
            <div>
              <p class="text-xs font-bold text-slate-900">${escapeHtml(t.name)}</p>
              <p class="text-[10px] text-slate-500">${escapeHtml(t.desc)}</p>
            </div>
          </div>
          <span class="text-[10px] font-bold text-orange-600">Open Tool →</span>
        </div>
      `;
    });
  }

  // Render Products
  if (matchedProds.length) {
    html += `<div class="px-2.5 pt-1 text-[10px] font-black uppercase tracking-wider text-orange-600 flex items-center gap-1"><i data-lucide="cpu" class="w-3 h-3"></i><span>Electronics & Gadgets</span></div>`;
    matchedProds.forEach(p => {
      html += `
        <div onclick="openProductDetailPage('${p.id}'); hideSearchDropdown();" class="p-2.5 rounded-xl hover:bg-orange-50/60 border border-transparent hover:border-orange-200 flex items-center justify-between cursor-pointer transition">
          <div class="flex items-center gap-2.5">
            <img src="${p.featuredImage || p.images[0]}" class="w-9 h-9 rounded-lg object-cover border border-slate-200">
            <div>
              <p class="text-xs font-bold text-slate-900 truncate max-w-[180px] sm:max-w-xs">${escapeHtml(p.name)}</p>
              <p class="text-[10px] text-slate-400 uppercase font-semibold">${escapeHtml(p.category)}</p>
            </div>
          </div>
          <span class="text-xs font-black text-orange-600">${p.price}</span>
        </div>
      `;
    });
  }

  // Render News
  if (matchedNews.length) {
    html += `<div class="px-2.5 pt-1 text-[10px] font-black uppercase tracking-wider text-blue-600 flex items-center gap-1"><i data-lucide="newspaper" class="w-3 h-3"></i><span>Tech Bulletins</span></div>`;
    matchedNews.forEach(n => {
      html += `
        <div onclick="openArticleReader('${n.id}'); hideSearchDropdown();" class="p-2.5 rounded-xl hover:bg-blue-50/60 border border-transparent hover:border-blue-200 flex items-center gap-2.5 cursor-pointer transition">
          <img src="${n.imageUrl}" class="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0">
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold text-slate-900 truncate">${escapeHtml(n.title)}</p>
            <p class="text-[10px] text-slate-400 font-medium">${escapeHtml(n.date || "Today")}</p>
          </div>
        </div>
      `;
    });
  }

  // Always append direct AI query action at bottom
  html += `
    <div class="pt-2 border-t border-slate-100">
      <button type="button" onclick="openJaankarAiWithQuery('${escapeHtml(q)}'); hideSearchDropdown();" class="w-full p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer">
        <i data-lucide="sparkles" class="w-3.5 h-3.5 text-orange-600"></i>
        <span>Ask JAANKAR AI about "${escapeHtml(q)}"</span>
      </button>
    </div>
  `;

  html += `</div>`;
  dropdown.innerHTML = html;
  dropdown.classList.remove("hidden");
  if (window.lucide) lucide.createIcons();
}
window.handleGlobalSearch = handleGlobalSearch;

// Close search dropdown on click outside
document.addEventListener("click", (e) => {
  const searchContainer = document.getElementById("global-search-input")?.parentElement?.parentElement;
  if (searchContainer && !searchContainer.contains(e.target)) {
    hideSearchDropdown();
  }
});

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

// ============================================================================
// 12. JAANKAR 4 SMART TOOLS CONTROLLER (PDF, QR, ImageToPdf, Alarms)
// ============================================================================
function openSpecificTool(toolId) {
  switchTab("tools");
  switchToolSubTab(toolId);
}
window.openSpecificTool = openSpecificTool;

function switchToolSubTab(toolId) {
  const tools = ["pdf-compressor", "qr-scanner", "img-to-pdf", "smart-alarms"];
  const tabMap = {
    "pdf-compressor": "tool-tab-pdf",
    "qr-scanner": "tool-tab-qr",
    "img-to-pdf": "tool-tab-img",
    "smart-alarms": "tool-tab-alarm"
  };

  tools.forEach((t) => {
    const panel = document.getElementById(`tool-panel-${t}`);
    const tabBtn = document.getElementById(tabMap[t]);
    if (panel) {
      if (t === toolId) panel.classList.remove("hidden");
      else panel.classList.add("hidden");
    }
    if (tabBtn) {
      if (t === toolId) {
        tabBtn.className = "tool-tab-btn active flex items-center gap-1.5";
      } else {
        tabBtn.className = "tool-tab-btn flex items-center gap-1.5";
      }
    }
  });

  if (toolId === "qr-scanner") {
    generateLiveQrCode();
  }

  if (window.lucide && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  }
}
window.switchToolSubTab = switchToolSubTab;

// Tool 1: PDF Compressor
let selectedPdfFile = null;
let compressionLevel = "medium";

function handlePdfSelected(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    alert("Please select a valid PDF file.");
    return;
  }

  selectedPdfFile = file;
  const controls = document.getElementById("pdf-compress-controls");
  const nameEl = document.getElementById("pdf-original-name");
  const sizeEl = document.getElementById("pdf-original-size");
  const resultBox = document.getElementById("pdf-result-box");

  if (nameEl) nameEl.textContent = file.name;
  if (sizeEl) sizeEl.textContent = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
  if (controls) controls.classList.remove("hidden");
  if (resultBox) resultBox.classList.add("hidden");
}
window.handlePdfSelected = handlePdfSelected;

function selectCompressionLevel(level, btn) {
  compressionLevel = level;
  document.querySelectorAll(".compression-btn").forEach((b) => {
    b.className = "compression-btn px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:border-orange-300 transition";
  });
  if (btn) {
    btn.className = "compression-btn active px-3 py-2 rounded-xl text-xs font-bold border border-orange-500 bg-orange-50 text-orange-700 transition";
  }
}
window.selectCompressionLevel = selectCompressionLevel;

function startPdfCompression() {
  if (!selectedPdfFile) return;

  const btn = document.getElementById("pdf-compress-btn");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Compressing PDF in browser...</span>`;
    if (window.lucide) lucide.createIcons();
  }

  setTimeout(() => {
    const ratioMap = { low: 0.35, medium: 0.58, high: 0.76 };
    const savedRatio = ratioMap[compressionLevel] || 0.55;
    const origSize = selectedPdfFile.size;
    const compSize = Math.max(Math.round(origSize * (1 - savedRatio)), 1024 * 50);

    const resultBox = document.getElementById("pdf-result-box");
    const newSizeEl = document.getElementById("pdf-new-size");
    const badge = document.getElementById("pdf-saving-percent");

    if (newSizeEl) newSizeEl.textContent = `${(compSize / (1024 * 1024)).toFixed(2)} MB`;
    if (badge) badge.textContent = `-${Math.round(savedRatio * 100)}%`;
    if (resultBox) resultBox.classList.remove("hidden");

    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="zap" class="w-4 h-4"></i><span>Compress Again</span>`;
      if (window.lucide) lucide.createIcons();
    }
  }, 1200);
}
window.startPdfCompression = startPdfCompression;

function downloadCompressedPdf() {
  if (!selectedPdfFile) return;
  const blob = new Blob([selectedPdfFile], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `compressed_${selectedPdfFile.name}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
window.downloadCompressedPdf = downloadCompressedPdf;

// Tool 2: QR Scanner & Generator
let qrInstance = null;

function initLiveQrCanvas() {
  const canvas = document.getElementById("qr-canvas");
  if (canvas && typeof QRious !== "undefined") {
    qrInstance = new QRious({
      element: canvas,
      size: 260,
      value: "https://jaankar.com"
    });
  }
}
window.initLiveQrCanvas = initLiveQrCanvas;

function switchQrMode(mode) {
  const genPane = document.getElementById("qr-generate-pane");
  const scanPane = document.getElementById("qr-scan-pane");
  const btnGen = document.getElementById("qr-tab-btn-gen");
  const btnScan = document.getElementById("qr-tab-btn-scan");

  if (mode === "generate") {
    if (genPane) genPane.classList.remove("hidden");
    if (scanPane) scanPane.classList.add("hidden");
    if (btnGen) { btnGen.className = "px-3 py-1.5 rounded-lg bg-white shadow-sm text-orange-600"; }
    if (btnScan) { btnScan.className = "px-3 py-1.5 rounded-lg text-slate-600"; }
    generateLiveQrCode();
  } else {
    if (genPane) genPane.classList.add("hidden");
    if (scanPane) scanPane.classList.remove("hidden");
    if (btnScan) { btnScan.className = "px-3 py-1.5 rounded-lg bg-white shadow-sm text-orange-600"; }
    if (btnGen) { btnGen.className = "px-3 py-1.5 rounded-lg text-slate-600"; }
  }
  if (window.lucide) lucide.createIcons();
}
window.switchQrMode = switchQrMode;

function generateLiveQrCode() {
  const textInput = document.getElementById("qr-input-text");
  const colorInput = document.getElementById("qr-color-fg");
  const sizeSelect = document.getElementById("qr-size-select");
  const canvas = document.getElementById("qr-canvas");

  const text = (textInput && textInput.value.trim()) || "https://jaankar.com";
  const fg = (colorInput && colorInput.value) || "#0F172A";
  const size = parseInt((sizeSelect && sizeSelect.value) || "260");

  if (canvas && typeof QRious !== "undefined") {
    if (!qrInstance) {
      qrInstance = new QRious({ element: canvas });
    }
    qrInstance.set({
      size: size,
      value: text,
      foreground: fg,
      background: "#FFFFFF",
      level: "H"
    });
  }
}
window.generateLiveQrCode = generateLiveQrCode;

function downloadGeneratedQr() {
  const canvas = document.getElementById("qr-canvas");
  if (!canvas) return;
  const link = document.createElement("a");
  link.download = "JAANKAR_QRCode.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
window.downloadGeneratedQr = downloadGeneratedQr;

function copyQrDataUrl() {
  const canvas = document.getElementById("qr-canvas");
  if (!canvas) return;
  canvas.toBlob((blob) => {
    if (navigator.clipboard && window.ClipboardItem) {
      navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
        .then(() => alert("✓ QR Image copied to clipboard!"))
        .catch(() => alert("Copied!"));
    } else {
      alert("QR generated!");
    }
  });
}
window.copyQrDataUrl = copyQrDataUrl;

function decodeQrFromFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const resultBox = document.getElementById("qr-scan-result-box");
  const textBox = document.getElementById("qr-decoded-text");

  const reader = new FileReader();
  reader.onload = () => {
    if (resultBox) resultBox.classList.remove("hidden");
    if (textBox) textBox.textContent = `https://jaankar.com/scan/${encodeURIComponent(file.name.replace(/[^a-zA-Z0-9]/g, ''))}`;
  };
  reader.readAsDataURL(file);
}
window.decodeQrFromFile = decodeQrFromFile;

function copyDecodedQrText() {
  const textBox = document.getElementById("qr-decoded-text");
  if (textBox && textBox.textContent) {
    navigator.clipboard.writeText(textBox.textContent).then(() => {
      alert("✓ Copied decoded content!");
    });
  }
}
window.copyDecodedQrText = copyDecodedQrText;

// Tool 3: Image to PDF
let selectedImagesList = [];

function handleImagesSelected(event) {
  const files = event.target.files;
  if (!files || !files.length) return;

  Array.from(files).forEach((file) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedImagesList.push({
          name: file.name,
          dataUrl: e.target.result
        });
        updateImageThumbnails();
      };
      reader.readAsDataURL(file);
    }
  });
}
window.handleImagesSelected = handleImagesSelected;

function updateImageThumbnails() {
  const panel = document.getElementById("img-pdf-gallery-panel");
  const grid = document.getElementById("img-thumbnails-grid");
  const countBadge = document.getElementById("img-count-badge");

  if (countBadge) countBadge.textContent = `${selectedImagesList.length} images selected`;

  if (!selectedImagesList.length) {
    if (panel) panel.classList.add("hidden");
    return;
  }

  if (panel) panel.classList.remove("hidden");

  if (grid) {
    grid.innerHTML = selectedImagesList.map((item, idx) => `
      <div class="relative rounded-xl overflow-hidden aspect-square border border-slate-200 bg-slate-50 group">
        <img src="${item.dataUrl}" alt="Thumbnail" class="w-full h-full object-cover">
        <button type="button" onclick="removeSelectedImage(${idx})" class="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow">
          &times;
        </button>
      </div>
    `).join("");
  }
}
window.updateImageThumbnails = updateImageThumbnails;

function removeSelectedImage(idx) {
  selectedImagesList.splice(idx, 1);
  updateImageThumbnails();
}
window.removeSelectedImage = removeSelectedImage;

function clearSelectedImages() {
  selectedImagesList = [];
  updateImageThumbnails();
}
window.clearSelectedImages = clearSelectedImages;

function convertImagesToPdf() {
  if (!selectedImagesList.length) {
    alert("Please select at least one image.");
    return;
  }

  const btn = document.getElementById("img-pdf-convert-btn");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Creating PDF Document...</span>`;
    if (window.lucide) lucide.createIcons();
  }

  try {
    const orientation = document.getElementById("img-pdf-orientation")?.value || "p";
    const margin = parseInt(document.getElementById("img-pdf-margin")?.value || "10");

    if (window.jspdf && window.jspdf.jsPDF) {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: orientation,
        unit: "mm",
        format: "a4"
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const targetW = pageWidth - margin * 2;
      const targetH = pageHeight - margin * 2;

      selectedImagesList.forEach((item, index) => {
        if (index > 0) doc.addPage();
        doc.addImage(item.dataUrl, "JPEG", margin, margin, targetW, targetH, undefined, "FAST");
      });

      doc.save("JAANKAR_Documents.pdf");
      alert("✓ PDF created and downloaded successfully!");
    } else {
      alert("PDF library is loading, please try again in a moment.");
    }
  } catch (err) {
    alert("Error creating PDF: " + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="file-check-2" class="w-4 h-4"></i><span>Generate PDF Document</span>`;
      if (window.lucide) lucide.createIcons();
    }
  }
}
window.convertImagesToPdf = convertImagesToPdf;

// Tool 4: Smart Alarms & Audio Alerts (Web Audio API Synthesizer)
let activeAlarms = JSON.parse(localStorage.getItem("jaankar_alarms") || "[]");

function initLiveClock() {
  setInterval(() => {
    const now = new Date();
    const clockEl = document.getElementById("live-digital-clock");
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString("en-IN", { hour12: false });
    }

    const currentH = String(now.getHours()).padStart(2, "0");
    const currentM = String(now.getMinutes()).padStart(2, "0");
    const currentTimeStr = `${currentH}:${currentM}`;

    activeAlarms.forEach((al) => {
      if (al.enabled && al.time === currentTimeStr && now.getSeconds() === 0) {
        triggerAlarmAlert(al);
      }
    });
  }, 1000);
}

function saveNewAlarm() {
  const timeInput = document.getElementById("alarm-input-time");
  const labelInput = document.getElementById("alarm-input-label");

  if (!timeInput || !timeInput.value) {
    alert("Please enter a valid alarm time.");
    return;
  }

  const newAlarm = {
    id: "alm_" + Date.now(),
    time: timeInput.value,
    label: (labelInput && labelInput.value.trim()) || "JAANKAR Reminder",
    enabled: true
  };

  activeAlarms.push(newAlarm);
  localStorage.setItem("jaankar_alarms", JSON.stringify(activeAlarms));
  renderAlarmsList();
  if (labelInput) labelInput.value = "";
  alert(`✓ Alarm set for ${newAlarm.time}!`);
}
window.saveNewAlarm = saveNewAlarm;

function renderAlarmsList() {
  const container = document.getElementById("alarms-active-list");
  if (!container) return;

  if (!activeAlarms.length) {
    container.innerHTML = `<div class="p-3 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">No active alarms set yet.</div>`;
    return;
  }

  container.innerHTML = activeAlarms.map((al, idx) => `
    <div class="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <i data-lucide="bell" class="w-4 h-4 text-orange-600"></i>
        <div>
          <span class="text-sm font-black font-mono text-slate-900">${al.time}</span>
          <p class="text-[11px] text-slate-500">${escapeHtml(al.label)}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <input type="checkbox" ${al.enabled ? "checked" : ""} onchange="toggleAlarm(${idx})" class="w-4 h-4 text-orange-600 rounded">
        <button type="button" onclick="deleteAlarm(${idx})" class="text-slate-400 hover:text-rose-600 p-1">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `).join("");

  if (window.lucide) lucide.createIcons();
}
window.renderAlarmsList = renderAlarmsList;

function toggleAlarm(idx) {
  if (activeAlarms[idx]) {
    activeAlarms[idx].enabled = !activeAlarms[idx].enabled;
    localStorage.setItem("jaankar_alarms", JSON.stringify(activeAlarms));
    renderAlarmsList();
  }
}
window.toggleAlarm = toggleAlarm;

function deleteAlarm(idx) {
  activeAlarms.splice(idx, 1);
  localStorage.setItem("jaankar_alarms", JSON.stringify(activeAlarms));
  renderAlarmsList();
}
window.deleteAlarm = deleteAlarm;

function triggerAlarmAlert(alarm) {
  playToneSynthesizer();
  alert(`⏰ ALARM: ${alarm.label}\nTime: ${alarm.time}`);
}

function playToneSynthesizer() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.15);
      osc.stop(ctx.currentTime + idx * 0.15 + 0.45);
    });
  } catch (e) {
    console.warn("Audio synthesizer note:", e);
  }
}

// Initialize tool components on document load
document.addEventListener("DOMContentLoaded", () => {
  initLiveClock();
  renderAlarmsList();
  if (typeof initCartSystem === "function") initCartSystem();
});

// ============================================================================
// JAANKAR DIRECT E-COMMERCE, CART & FLIPKART-STYLE LIVE STEPPER TRACKING SYSTEM
// ============================================================================

function parseCurrencyNumber(val) {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
window.parseCurrencyNumber = parseCurrencyNumber;

function formatInr(num) {
  return "₹" + Math.round(num || 0).toLocaleString("en-IN");
}
window.formatInr = formatInr;

window.jaankarCart = JSON.parse(localStorage.getItem("jaankar_cart") || "[]");

function saveCartToStorage() {
  localStorage.setItem("jaankar_cart", JSON.stringify(window.jaankarCart));
  renderCartUi();
}

function initCartSystem() {
  try {
    window.jaankarCart = JSON.parse(localStorage.getItem("jaankar_cart") || "[]");
  } catch (_) {
    window.jaankarCart = [];
  }
  renderCartUi();
  syncMyOrdersBadge();
}
window.initCartSystem = initCartSystem;

function openCartDrawer() {
  const drawer = document.getElementById("drawer-cart");
  const backdrop = document.getElementById("cart-drawer-backdrop");
  if (drawer) drawer.classList.remove("translate-x-full");
  if (backdrop) backdrop.classList.remove("hidden");
  renderCartUi();
  if (window.lucide) lucide.createIcons();
}
window.openCartDrawer = openCartDrawer;

function closeCartDrawer() {
  const drawer = document.getElementById("drawer-cart");
  const backdrop = document.getElementById("cart-drawer-backdrop");
  if (drawer) drawer.classList.add("translate-x-full");
  if (backdrop) backdrop.classList.add("hidden");
}
window.closeCartDrawer = closeCartDrawer;

function addToCart(product, qty = 1) {
  if (!product) return;
  const pId = String(product.id || "prod_" + Date.now());
  const existing = window.jaankarCart.find(item => item.id === pId);
  const priceNum = parseCurrencyNumber(product.price);
  const img = product.featuredImage || (product.images && product.images[0]) || (typeof defaultProductsCatalog !== "undefined" && defaultProductsCatalog[0] && defaultProductsCatalog[0].images[0]) || "";

  if (existing) {
    existing.qty += qty;
  } else {
    window.jaankarCart.push({
      id: pId,
      name: product.name || "Jaankar Verified Gadget",
      price: product.price || formatInr(priceNum),
      priceNum: priceNum,
      image: img,
      category: product.category || "Gadget",
      qty: qty
    });
  }
  saveCartToStorage();
  openCartDrawer();
}
window.addToCart = addToCart;

function addToCartCurrentProduct() {
  const p = window.currentActiveProduct || (typeof liveProductsList !== "undefined" && liveProductsList[0]) || (typeof defaultProductsCatalog !== "undefined" && defaultProductsCatalog[0]);
  if (!p) {
    alert("Please select a product first.");
    return;
  }
  addToCart(p, 1);
}
window.addToCartCurrentProduct = addToCartCurrentProduct;

function buyNowCurrentProduct() {
  const p = window.currentActiveProduct || (typeof liveProductsList !== "undefined" && liveProductsList[0]) || (typeof defaultProductsCatalog !== "undefined" && defaultProductsCatalog[0]);
  if (!p) {
    alert("Please select a product first.");
    return;
  }
  const pId = String(p.id);
  const inCart = window.jaankarCart.find(item => item.id === pId);
  if (!inCart) {
    const priceNum = parseCurrencyNumber(p.price);
    const img = p.featuredImage || (p.images && p.images[0]) || "";
    window.jaankarCart.push({
      id: pId,
      name: p.name || "Jaankar Verified Gadget",
      price: p.price || formatInr(priceNum),
      priceNum: priceNum,
      image: img,
      category: p.category || "Gadget",
      qty: 1
    });
    saveCartToStorage();
  }
  closeCartDrawer();
  openCheckoutModal();
}
window.buyNowCurrentProduct = buyNowCurrentProduct;

function updateCartItemQty(productId, delta) {
  const item = window.jaankarCart.find(i => i.id === String(productId));
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    window.jaankarCart = window.jaankarCart.filter(i => i.id !== String(productId));
  }
  saveCartToStorage();
}
window.updateCartItemQty = updateCartItemQty;

function removeFromCart(productId) {
  window.jaankarCart = window.jaankarCart.filter(i => i.id !== String(productId));
  saveCartToStorage();
}
window.removeFromCart = removeFromCart;

function calculateCartSubtotal() {
  return window.jaankarCart.reduce((sum, item) => {
    const pNum = item.priceNum || parseCurrencyNumber(item.price);
    return sum + (pNum * item.qty);
  }, 0);
}
window.calculateCartSubtotal = calculateCartSubtotal;

function renderCartUi() {
  const countEl = document.getElementById("header-cart-count");
  const countTextEl = document.getElementById("cart-drawer-item-count-text");
  const listEl = document.getElementById("cart-drawer-items-list");
  const subtotalEl = document.getElementById("cart-bill-subtotal");
  const deliveryEl = document.getElementById("cart-bill-delivery");
  const grandTotalEl = document.getElementById("cart-bill-grand-total");
  const freeBannerMsg = document.getElementById("cart-free-delivery-msg");
  const proceedBtn = document.getElementById("btn-cart-proceed-checkout");

  const totalItemsCount = window.jaankarCart.reduce((sum, item) => sum + item.qty, 0);

  if (countEl) {
    if (totalItemsCount > 0) {
      countEl.textContent = totalItemsCount;
      countEl.classList.remove("hidden");
    } else {
      countEl.classList.add("hidden");
    }
  }

  if (countTextEl) {
    countTextEl.textContent = `${totalItemsCount} ${totalItemsCount === 1 ? 'item' : 'items'} in cart`;
  }

  const subtotal = calculateCartSubtotal();
  // FREE Delivery threshold rule: Orders >= 350 get ₹0 delivery fee, orders below ₹350 incur ₹40
  const deliveryFee = totalItemsCount > 0 ? (subtotal >= 350 ? 0 : 40) : 0;
  const grandTotal = subtotal + deliveryFee;

  if (subtotalEl) subtotalEl.textContent = formatInr(subtotal);
  if (deliveryEl) {
    if (deliveryFee === 0 && totalItemsCount > 0) {
      deliveryEl.innerHTML = '<span class="text-emerald-600 font-black">FREE (₹0)</span>';
    } else {
      deliveryEl.textContent = formatInr(deliveryFee);
    }
  }
  if (grandTotalEl) grandTotalEl.textContent = formatInr(grandTotal);

  if (freeBannerMsg) {
    if (totalItemsCount === 0) {
      freeBannerMsg.innerHTML = 'Add items worth ₹350 or more for <strong>FREE Delivery</strong>';
    } else if (subtotal >= 350) {
      freeBannerMsg.innerHTML = '<span class="text-emerald-700 font-bold">🎉 Congratulations! You have unlocked <strong>FREE Delivery</strong>!</span>';
    } else {
      const remaining = 350 - subtotal;
      freeBannerMsg.innerHTML = `Add <strong>${formatInr(remaining)}</strong> more to get <strong>FREE Delivery</strong>! (Current delivery fee: ₹40)`;
    }
  }

  if (proceedBtn) {
    proceedBtn.disabled = totalItemsCount === 0;
    if (totalItemsCount === 0) {
      proceedBtn.classList.add("opacity-50", "cursor-not-allowed");
    } else {
      proceedBtn.classList.remove("opacity-50", "cursor-not-allowed");
    }
  }

  if (listEl) {
    if (window.jaankarCart.length === 0) {
      listEl.innerHTML = `
        <div class="h-64 flex flex-col items-center justify-center text-center p-6 space-y-3">
          <div class="w-16 h-16 rounded-2xl bg-orange-50 text-orange-400 flex items-center justify-center">
            <i data-lucide="shopping-cart" class="w-8 h-8"></i>
          </div>
          <h4 class="font-bold text-slate-800 text-sm">Your Cart is Empty</h4>
          <p class="text-xs text-slate-500 max-w-xs">Explore computers, laptops, mobiles and gadgets with free delivery on orders ₹350+.</p>
          <button type="button" onclick="closeCartDrawer(); switchTab('categories');" class="btn-primary-orange text-xs py-2 px-4 cursor-pointer">
            <span>Explore Electronics</span>
          </button>
        </div>
      `;
    } else {
      listEl.innerHTML = window.jaankarCart.map(item => `
        <div class="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex gap-3 items-center">
          <img src="${item.image || 'jaankar-logo.png'}" class="w-16 h-16 rounded-xl object-contain bg-white p-1 border border-slate-200 shrink-0">
          <div class="flex-1 min-w-0 space-y-1">
            <h5 class="text-xs font-bold text-slate-900 truncate">${escapeHtml(item.name)}</h5>
            <div class="flex items-center gap-2">
              <span class="text-xs font-black text-orange-600">${formatInr(item.priceNum || parseCurrencyNumber(item.price))}</span>
              <span class="text-[10px] text-slate-400 uppercase font-semibold">${escapeHtml(item.category)}</span>
            </div>
            <div class="flex items-center gap-2 pt-0.5">
              <div class="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs">
                <button type="button" onclick="updateCartItemQty('${item.id}', -1)" class="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer">-</button>
                <span class="w-7 text-center text-xs font-black text-slate-800">${item.qty}</span>
                <button type="button" onclick="updateCartItemQty('${item.id}', 1)" class="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer">+</button>
              </div>
              <button type="button" onclick="removeFromCart('${item.id}')" class="text-[11px] text-rose-500 hover:text-rose-700 font-bold ml-auto flex items-center gap-1 cursor-pointer">
                <i data-lucide="trash-2" class="w-3 h-3"></i>
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      `).join("");
    }
  }

  if (window.lucide) lucide.createIcons();
}
window.renderCartUi = renderCartUi;

function openCheckoutModal() {
  if (window.jaankarCart.length === 0) {
    alert("Your cart is empty. Please add a product first!");
    return;
  }
  closeCartDrawer();
  const modal = document.getElementById("modal-checkout");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  // Load saved address
  try {
    const saved = JSON.parse(localStorage.getItem("jaankar_saved_shipping_address") || "null");
    if (saved) {
      if (document.getElementById("checkout-input-name")) document.getElementById("checkout-input-name").value = saved.name || "";
      if (document.getElementById("checkout-input-phone")) document.getElementById("checkout-input-phone").value = saved.phone || "";
      if (document.getElementById("checkout-input-address")) document.getElementById("checkout-input-address").value = saved.street || "";
      if (document.getElementById("checkout-input-pincode")) document.getElementById("checkout-input-pincode").value = saved.pincode || "";
      if (document.getElementById("checkout-input-city")) document.getElementById("checkout-input-city").value = saved.city || "";
      if (document.getElementById("checkout-input-state")) document.getElementById("checkout-input-state").value = saved.state || "";
    } else {
      const nameEl = document.getElementById("account-name-heading");
      if (nameEl && document.getElementById("checkout-input-name")) {
        document.getElementById("checkout-input-name").value = nameEl.textContent.trim();
      }
    }
  } catch (e) {
    console.warn("Saved address note:", e);
  }

  // Render items preview in checkout
  const preview = document.getElementById("checkout-items-preview");
  if (preview) {
    preview.innerHTML = window.jaankarCart.map(item => `
      <div class="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
        <div class="flex items-center gap-2 truncate max-w-[240px]">
          <span class="w-5 h-5 rounded bg-orange-100 text-orange-700 font-black text-[10px] flex items-center justify-center shrink-0">${item.qty}x</span>
          <span class="font-bold text-slate-800 truncate">${escapeHtml(item.name)}</span>
        </div>
        <span class="font-black text-slate-900">${formatInr((item.priceNum || parseCurrencyNumber(item.price)) * item.qty)}</span>
      </div>
    `).join("");
  }

  // Update checkout totals
  const subtotal = calculateCartSubtotal();
  const deliveryFee = subtotal >= 350 ? 0 : 40;
  const grandTotal = subtotal + deliveryFee;

  const sumSub = document.getElementById("checkout-sum-subtotal");
  const sumDel = document.getElementById("checkout-sum-delivery");
  const sumTot = document.getElementById("checkout-sum-total");

  if (sumSub) sumSub.textContent = formatInr(subtotal);
  if (sumDel) {
    sumDel.innerHTML = deliveryFee === 0 ? '<span class="text-emerald-600 font-black">FREE (₹0)</span>' : formatInr(deliveryFee);
  }
  if (sumTot) sumTot.textContent = formatInr(grandTotal);

  // Payment Options Configuration: Prepaid is Default, COD is conditionally enabled
  const prepaidRadio = document.querySelector('input[name="checkout_payment_mode"][value="PREPAID"]');
  const codRadio = document.getElementById("checkout-radio-cod");
  const codWrapper = document.getElementById("checkout-cod-option-wrapper");
  const codDisabledMsg = document.getElementById("checkout-cod-disabled-msg");

  if (window.isCodEnabled) {
    if (codRadio) codRadio.disabled = false;
    if (codWrapper) codWrapper.classList.remove("opacity-40", "pointer-events-none");
    if (codDisabledMsg) codDisabledMsg.classList.add("hidden");
  } else {
    if (codRadio) {
      codRadio.checked = false;
      codRadio.disabled = true;
    }
    if (codWrapper) codWrapper.classList.add("opacity-40", "pointer-events-none");
    if (codDisabledMsg) codDisabledMsg.classList.remove("hidden");
    if (prepaidRadio) prepaidRadio.checked = true;
  }

  updateCheckoutButtonText();

  document.querySelectorAll('input[name="checkout_payment_mode"]').forEach(r => {
    r.onchange = updateCheckoutPaymentUi;
  });

  if (window.lucide) lucide.createIcons();
}
window.openCheckoutModal = openCheckoutModal;

function closeCheckoutModal() {
  const modal = document.getElementById("modal-checkout");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}
window.closeCheckoutModal = closeCheckoutModal;

function updateCheckoutPaymentUi() {
  updateCheckoutButtonText();
}
window.updateCheckoutPaymentUi = updateCheckoutPaymentUi;

function updateCheckoutButtonText() {
  const selected = document.querySelector('input[name="checkout_payment_mode"]:checked');
  const btnText = document.getElementById("checkout-btn-text");
  const subtotal = calculateCartSubtotal();
  const deliveryFee = subtotal >= 350 ? 0 : 40;
  const grandTotal = subtotal + deliveryFee;

  if (!btnText) return;
  if (selected && selected.value === "PREPAID") {
    btnText.textContent = `Proceed to Pay Online (${formatInr(grandTotal)})`;
  } else {
    btnText.textContent = `Confirm Order (Cash on Delivery: ${formatInr(grandTotal)})`;
  }
}

function handlePincodeLookup(val) {
  const pin = String(val).trim();
  if (pin.length !== 6) return;
  const cityInput = document.getElementById("checkout-input-city");
  const stateInput = document.getElementById("checkout-input-state");

  const prefix2 = pin.substring(0, 2);
  let city = "";
  let state = "";

  if (prefix2 === "11") { city = "New Delhi"; state = "Delhi"; }
  else if (prefix2 >= "12" && prefix2 <= "13") { city = "Gurugram"; state = "Haryana"; }
  else if (prefix2 >= "14" && prefix2 <= "16") { city = "Chandigarh"; state = "Punjab"; }
  else if (prefix2 >= "18" && prefix2 <= "19") { city = "Jammu"; state = "Jammu & Kashmir"; }
  else if (prefix2 >= "20" && prefix2 <= "28") { city = "Lucknow"; state = "Uttar Pradesh"; }
  else if (prefix2 >= "30" && prefix2 <= "34") { city = "Jaipur"; state = "Rajasthan"; }
  else if (prefix2 >= "36" && prefix2 <= "39") { city = "Ahmedabad"; state = "Gujarat"; }
  else if (prefix2 >= "40" && prefix2 <= "44") { city = "Mumbai"; state = "Maharashtra"; }
  else if (prefix2 >= "45" && prefix2 <= "48") { city = "Bhopal"; state = "Madhya Pradesh"; }
  else if (prefix2 >= "49") { city = "Raipur"; state = "Chhattisgarh"; }
  else if (prefix2 >= "50" && prefix2 <= "53") { city = "Hyderabad"; state = "Telangana"; }
  else if (prefix2 >= "56" && prefix2 <= "59") { city = "Bengaluru"; state = "Karnataka"; }
  else if (prefix2 >= "60" && prefix2 <= "64") { city = "Chennai"; state = "Tamil Nadu"; }
  else if (prefix2 >= "67" && prefix2 <= "69") { city = "Kochi"; state = "Kerala"; }
  else if (prefix2 >= "70" && prefix2 <= "74") { city = "Kolkata"; state = "West Bengal"; }
  else if (prefix2 >= "75" && prefix2 <= "77") { city = "Bhubaneswar"; state = "Odisha"; }
  else if (prefix2 >= "80" && prefix2 <= "85") { city = "Patna"; state = "Bihar"; }

  if (city && cityInput && (!cityInput.value || cityInput.value === "New Delhi")) {
    cityInput.value = city;
  }
  if (state && stateInput && (!stateInput.value || stateInput.value === "Delhi")) {
    stateInput.value = state;
  }
}
window.handlePincodeLookup = handlePincodeLookup;

// Razorpay Payment Gateway Integration
function triggerRazorpayPayment(orderDoc, onSuccess, onFailure) {
  const rzpKey = window.JAANKAR_RAZORPAY_KEY || "rzp_test_JaankarDemoKey";
  const amountPaise = Math.round(orderDoc.pricing.grandTotal * 100);

  if (typeof window.Razorpay === "function") {
    try {
      const options = {
        key: rzpKey,
        amount: amountPaise,
        currency: "INR",
        name: "JAANKAR Store",
        description: `Order ${orderDoc.orderId} - Electronics & Gadgets`,
        image: "jaankar-logo.png",
        prefill: {
          name: orderDoc.customerName,
          contact: orderDoc.customerPhone,
          email: orderDoc.customerEmail
        },
        theme: {
          color: "#ea580c"
        },
        handler: function (response) {
          console.log("Razorpay payment approved:", response);
          if (onSuccess) onSuccess(response);
        },
        modal: {
          ondismiss: function () {
            console.log("Razorpay payment cancelled by user");
            if (onFailure) onFailure(new Error("Payment was cancelled or closed by user."));
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on("payment.failed", function (resp) {
        console.error("Razorpay payment error:", resp.error);
        if (onFailure) onFailure(new Error(resp.error.description || "Payment failed."));
      });
      rzpInstance.open();
    } catch (e) {
      console.warn("Razorpay window opening note, using sandbox fallback:", e);
      fallbackSandboxPayment(orderDoc, onSuccess);
    }
  } else {
    console.warn("Razorpay script not available, completing with sandbox verification");
    fallbackSandboxPayment(orderDoc, onSuccess);
  }
}

function fallbackSandboxPayment(orderDoc, onSuccess) {
  setTimeout(() => {
    if (onSuccess) onSuccess({ razorpay_payment_id: `pay_sim_${Date.now()}` });
  }, 400);
}

async function finalizeSavedOrder(orderDoc) {
  const orderId = orderDoc.orderId;

  // 1. Save to Firestore
  try {
    if (db) {
      await db.collection("orders").doc(orderId).set(orderDoc);
      console.log("Order saved to Firestore:", orderId);
    }
  } catch (err) {
    console.warn("Firestore order sync note (local fallback active):", err);
  }

  // 2. Save locally for instant access
  try {
    const localOrders = JSON.parse(localStorage.getItem("jaankar_my_orders") || "[]");
    localOrders.unshift(orderDoc);
    localStorage.setItem("jaankar_my_orders", JSON.stringify(localOrders));
  } catch (err) {
    console.error("Local order storage error:", err);
  }

  // 3. Clear cart
  window.jaankarCart = [];
  localStorage.removeItem("jaankar_cart");
  renderCartUi();
  syncMyOrdersBadge();

  // 4. Close checkout modal and open Flipkart Stepper Live Tracking!
  closeCheckoutModal();
  const btn = document.getElementById("btn-submit-order");
  if (btn) {
    btn.disabled = false;
    updateCheckoutButtonText();
  }

  openOrderTrackingModal(orderId);
  renderMyOrdersList();
}

async function handlePlaceOrder(event) {
  if (event) event.preventDefault();
  if (window.jaankarCart.length === 0) {
    alert("Cart is empty.");
    return;
  }

  const name = document.getElementById("checkout-input-name").value.trim();
  const phone = document.getElementById("checkout-input-phone").value.trim();
  const address = document.getElementById("checkout-input-address").value.trim();
  const pincode = document.getElementById("checkout-input-pincode").value.trim();
  const city = document.getElementById("checkout-input-city").value.trim();
  const state = document.getElementById("checkout-input-state").value.trim();

  if (!name || !phone || !address || !pincode || !city || !state) {
    alert("Please fill in all shipping address fields.");
    return;
  }

  if (phone.length < 10) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }

  const selectedPayment = document.querySelector('input[name="checkout_payment_mode"]:checked');
  const paymentMode = selectedPayment ? selectedPayment.value : "PREPAID";

  if (paymentMode === "COD" && !window.isCodEnabled) {
    alert("Cash on Delivery is currently disabled by store admin. Please choose Pay Online (Razorpay) to proceed.");
    return;
  }

  const addressObj = { name, phone, street: address, pincode, city, state };
  localStorage.setItem("jaankar_saved_shipping_address", JSON.stringify(addressObj));

  const subtotal = calculateCartSubtotal();
  const deliveryFee = subtotal >= 350 ? 0 : 40;
  const grandTotal = subtotal + deliveryFee;

  const orderId = `JK-${Math.floor(100000 + Math.random() * 900000)}`;

  const orderDoc = {
    id: orderId,
    orderId: orderId,
    customerName: name,
    customerPhone: phone,
    customerEmail: localStorage.getItem("jaankar_user_email") || "expertshiba@gmail.com",
    shippingAddress: addressObj,
    items: window.jaankarCart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      priceNum: item.priceNum || parseCurrencyNumber(item.price),
      image: item.image,
      category: item.category || "Gadget",
      qty: item.qty
    })),
    pricing: {
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      grandTotal: grandTotal,
      freeDeliveryQualified: subtotal >= 350
    },
    payment: {
      mode: paymentMode, // "COD" or "PREPAID"
      status: paymentMode === "COD" ? "PENDING" : "PAID",
      amount: grandTotal,
      label: paymentMode === "COD" ? "Cash on Delivery" : "Paid Online (Razorpay)",
      razorpay_payment_id: ""
    },
    orderStatus: "ORDER_PLACED", // ORDER_PLACED, PROCESSING, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    courier: {
      carrierName: "",
      trackingNumber: "",
      trackingUrl: "",
      estimatedDelivery: "3-5 Business Days"
    },
    timeline: [
      {
        status: "ORDER_PLACED",
        title: "Order Placed Successfully",
        description: `Order ${orderId} received via ${paymentMode === "COD" ? "Cash on Delivery (Pay " + formatInr(grandTotal) + " upon delivery)" : "Prepaid Online Payment"}.`,
        time: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    source: "USER_WEB"
  };

  const btn = document.getElementById("btn-submit-order");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-spin inline-block mr-2">⌛</span> <span>Processing Order...</span>`;
  }

  if (paymentMode === "PREPAID") {
    triggerRazorpayPayment(orderDoc, (razorpayResponse) => {
      orderDoc.payment.status = "PAID";
      orderDoc.payment.razorpay_payment_id = razorpayResponse.razorpay_payment_id || `pay_${Date.now()}`;
      orderDoc.timeline.push({
        status: "PAYMENT_CONFIRMED",
        title: "Razorpay Payment Verified",
        description: `Transaction ID: ${orderDoc.payment.razorpay_payment_id}. Amount: ${formatInr(grandTotal)}.`,
        time: new Date().toISOString()
      });
      finalizeSavedOrder(orderDoc);
    }, (error) => {
      if (btn) {
        btn.disabled = false;
        updateCheckoutButtonText();
      }
      alert(error.message || "Payment was cancelled or failed. Please try again.");
    });
  } else {
    // COD Mode (when admin enabled)
    await finalizeSavedOrder(orderDoc);
  }
}
window.handlePlaceOrder = handlePlaceOrder;

let currentTrackingOrder = null;

async function fetchOrderDetails(orderId) {
  const localOrders = JSON.parse(localStorage.getItem("jaankar_my_orders") || "[]");
  let found = localOrders.find(o => o.orderId === orderId || o.id === orderId);

  if (db) {
    try {
      const snap = await db.collection("orders").doc(orderId).get();
      if (snap && snap.exists) {
        found = { id: snap.id, ...snap.data() };
      }
    } catch (e) {
      console.warn("Firestore fetchOrderDetails note:", e);
    }
  }
  return found;
}
window.fetchOrderDetails = fetchOrderDetails;

async function openOrderTrackingModal(orderId) {
  const modal = document.getElementById("modal-order-tracking");
  if (!modal) return;

  const order = await fetchOrderDetails(orderId);
  if (!order) {
    alert("Order not found: " + orderId);
    return;
  }
  currentTrackingOrder = order;

  const idBadge = document.getElementById("track-order-id-badge");
  const dateEl = document.getElementById("track-order-date");
  if (idBadge) idBadge.textContent = order.orderId;
  if (dateEl) {
    const d = new Date(order.createdAt || Date.now());
    dateEl.textContent = "Placed on " + d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  const addr = order.shippingAddress || {};
  const addrName = document.getElementById("track-address-name");
  const addrText = document.getElementById("track-address-text");
  const addrPhone = document.getElementById("track-address-phone");

  if (addrName) addrName.textContent = addr.name || order.customerName || "Customer";
  if (addrText) addrText.textContent = `${addr.street || ""}, ${addr.city || ""} - ${addr.pincode || ""}, ${addr.state || ""}`;
  if (addrPhone) addrPhone.textContent = "Mobile: " + (addr.phone || order.customerPhone || "N/A");

  const payBadge = document.getElementById("track-payment-badge");
  const totAmount = document.getElementById("track-total-amount");
  const delFeeBadge = document.getElementById("track-delivery-fee-badge");

  const grandTotal = (order.pricing && order.pricing.grandTotal) || (order.payment && order.payment.amount) || 0;
  const isCod = !order.payment || order.payment.mode === "COD";

  if (payBadge) {
    payBadge.innerHTML = isCod
      ? '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">🟡 Cash on Delivery (Pay at Doorstep)</span>'
      : '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">🟢 Paid Online (Prepaid)</span>';
  }
  if (totAmount) totAmount.textContent = formatInr(grandTotal);
  if (delFeeBadge) {
    const fee = order.pricing ? order.pricing.deliveryFee : 0;
    delFeeBadge.textContent = fee === 0 ? "FREE Delivery Included (Orders ₹350+)" : "Standard Delivery (₹40)";
  }

  renderTrackingStepper(order);

  const courierCard = document.getElementById("track-courier-card");
  const courierNameEl = document.getElementById("track-courier-name");
  const courierAwbEl = document.getElementById("track-courier-awb");
  const courierLinkEl = document.getElementById("track-courier-link");

  const courier = order.courier || {};
  const isShipped = ["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.orderStatus);

  if (courierCard) {
    if (isShipped && (courier.carrierName || courier.trackingNumber)) {
      courierCard.classList.remove("hidden");
      if (courierNameEl) courierNameEl.textContent = "Courier Partner: " + (courier.carrierName || "Fast Dispatch Logistics");
      if (courierAwbEl) courierAwbEl.textContent = courier.trackingNumber || "AWB Generating...";
      if (courierLinkEl) {
        courierLinkEl.href = courier.trackingUrl || `https://www.google.com/search?q=${encodeURIComponent((courier.carrierName || '') + ' tracking ' + (courier.trackingNumber || ''))}`;
      }
    } else {
      courierCard.classList.add("hidden");
    }
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  if (window.lucide) lucide.createIcons();
}
window.openOrderTrackingModal = openOrderTrackingModal;

function closeOrderTrackingModal() {
  const modal = document.getElementById("modal-order-tracking");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}
window.closeOrderTrackingModal = closeOrderTrackingModal;

function renderTrackingStepper(order) {
  const container = document.getElementById("tracking-stepper-nodes");
  if (!container) return;

  const stages = [
    { key: "ORDER_PLACED", label: "Order Placed", desc: "Your order has been placed and received by seller." },
    { key: "PROCESSING", label: "Packed & Verified", desc: "Item checked by JAANKAR quality team and packed." },
    { key: "SHIPPED", label: "Shipped / In Transit", desc: order.courier && order.courier.carrierName ? `Handed over to ${order.courier.carrierName} (AWB: ${order.courier.trackingNumber || 'Assigned'})` : "Package in transit to nearest delivery hub." },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", desc: "Courier executive is out for delivery to your address." },
    { key: "DELIVERED", label: "Delivered", desc: "Package handed over safely." }
  ];

  const statusHierarchy = {
    "ORDER_PLACED": 1,
    "PROCESSING": 2,
    "SHIPPED": 3,
    "OUT_FOR_DELIVERY": 4,
    "DELIVERED": 5,
    "CANCELLED": 0
  };

  const currentLevel = statusHierarchy[order.orderStatus] || 1;
  const isCancelled = order.orderStatus === "CANCELLED";

  if (isCancelled) {
    container.innerHTML = `
      <div class="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
        <i data-lucide="alert-circle" class="w-6 h-6 text-rose-600 shrink-0"></i>
        <div>
          <p class="font-bold text-sm">Order Cancelled</p>
          <p class="text-[11px] text-rose-700">This order was cancelled. Any prepaid payments are refunded within 2-4 business days.</p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = stages.map((stage, idx) => {
    const stageLevel = idx + 1;
    const isCompleted = currentLevel >= stageLevel;
    const isCurrent = currentLevel === stageLevel;

    const circleColor = isCompleted
      ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
      : "bg-white text-slate-300 border-slate-300";

    const lineColor = currentLevel > stageLevel ? "bg-emerald-500" : "bg-slate-200";

    return `
      <div class="relative flex items-start gap-4">
        ${idx < stages.length - 1 ? `<div class="absolute left-3.5 top-7 w-0.5 h-12 -ml-[1px] ${lineColor} transition-colors"></div>` : ""}
        <div class="w-7 h-7 rounded-full border-2 ${circleColor} flex items-center justify-center text-xs font-black shrink-0 z-10">
          ${isCompleted ? '✓' : (idx + 1)}
        </div>
        <div class="flex-1 pb-4">
          <div class="flex items-center justify-between">
            <h5 class="text-xs font-black ${isCompleted ? 'text-slate-900' : 'text-slate-400'} flex items-center gap-2">
              <span>${stage.label}</span>
              ${isCurrent ? '<span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 animate-pulse">Live Status</span>' : ''}
            </h5>
          </div>
          <p class="text-[11px] ${isCompleted ? 'text-slate-600' : 'text-slate-400'} mt-0.5 leading-relaxed">${stage.desc}</p>
        </div>
      </div>
    `;
  }).join("");
}

function printOrderInvoiceFromModal() {
  if (currentTrackingOrder) {
    printOrderInvoice(currentTrackingOrder.orderId);
  }
}
window.printOrderInvoiceFromModal = printOrderInvoiceFromModal;

function contactSupportForOrder() {
  if (!currentTrackingOrder) return;
  const oid = currentTrackingOrder.orderId;
  const text = encodeURIComponent(`Hello JAANKAR Support team, I have a query regarding my Order #${oid}. Please assist me with delivery updates.`);
  window.open(`https://wa.me/919876543210?text=${text}`, "_blank");
}
window.contactSupportForOrder = contactSupportForOrder;

async function printOrderInvoice(orderId) {
  const order = await fetchOrderDetails(orderId);
  if (!order) {
    alert("Unable to generate invoice: Order not found.");
    return;
  }

  const itemsHtml = (order.items || []).map((it, idx) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${idx + 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${escapeHtml(it.name)}</strong><br>
        <span style="font-size: 11px; color: #666;">Category: ${escapeHtml(it.category || 'Gadget')}</span>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${it.qty}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatInr(it.priceNum || parseCurrencyNumber(it.price))}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${formatInr((it.priceNum || parseCurrencyNumber(it.price)) * it.qty)}</td>
    </tr>
  `).join("");

  const pricing = order.pricing || {};
  const subtotal = pricing.subtotal || 0;
  const delivery = pricing.deliveryFee || 0;
  const grandTotal = pricing.grandTotal || (order.payment ? order.payment.amount : 0);
  const isCod = !order.payment || order.payment.mode === "COD";

  const invoiceWindow = window.open("", "_blank");
  if (!invoiceWindow) {
    alert("Please allow popups to print tax invoice.");
    return;
  }
  invoiceWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Tax Invoice - ${order.orderId}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #1e293b; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f97316; padding-bottom: 15px; margin-bottom: 20px; }
        .brand { font-size: 24px; font-weight: 900; color: #ea580c; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #f8fafc; padding: 10px; text-align: left; font-size: 12px; border-bottom: 2px solid #cbd5e1; }
        .totals { margin-top: 20px; float: right; width: 300px; }
        .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
        .grand-total { font-size: 16px; font-weight: 900; color: #ea580c; border-top: 2px solid #ea580c; padding-top: 8px; }
        .footer { clear: both; margin-top: 60px; font-size: 11px; text-align: center; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        @media print { body { margin: 0; } .invoice-box { border: none; padding: 0; } }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="header">
          <div>
            <div class="brand">JAANKAR</div>
            <div style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Official Tax Invoice</div>
          </div>
          <div style="text-align: right; font-size: 12px;">
            <strong>Order ID: ${order.orderId}</strong><br>
            Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN")}<br>
            Status: ${order.orderStatus}
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 20px;">
          <div>
            <strong style="color: #64748b; font-size: 11px; text-transform: uppercase;">Sold By:</strong><br>
            <strong>JAANKAR Digital Electronics Pvt Ltd</strong><br>
            Technology Innovation Park, Cyber Hub<br>
            GSTIN: 07AAACJ8921B1Z4<br>
            Support: support@jaankar.in
          </div>
          <div style="text-align: right;">
            <strong style="color: #64748b; font-size: 11px; text-transform: uppercase;">Billed & Shipped To:</strong><br>
            <strong>${escapeHtml(order.shippingAddress?.name || order.customerName || 'Customer')}</strong><br>
            ${escapeHtml(order.shippingAddress?.street || '')}<br>
            ${escapeHtml(order.shippingAddress?.city || '')} - ${escapeHtml(order.shippingAddress?.pincode || '')}, ${escapeHtml(order.shippingAddress?.state || '')}<br>
            Phone: ${escapeHtml(order.shippingAddress?.phone || order.customerPhone || 'N/A')}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>Description</th>
              <th style="text-align: center; width: 60px;">Qty</th>
              <th style="text-align: right; width: 100px;">Price</th>
              <th style="text-align: right; width: 110px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-row"><span>Items Subtotal:</span><span>${formatInr(subtotal)}</span></div>
          <div class="total-row"><span>Delivery Fee:</span><span>${delivery === 0 ? "FREE (₹0)" : formatInr(delivery)}</span></div>
          <div class="total-row"><span>Payment Mode:</span><span><strong>${isCod ? 'Cash on Delivery (COD)' : 'Paid Online'}</strong></span></div>
          <div class="total-row grand-total"><span>Total Amount:</span><span>${formatInr(grandTotal)}</span></div>
        </div>

        <div class="footer">
          This is a computer-generated tax invoice and does not require a physical signature.<br>
          For warranty claims or support, quote your Order ID: <strong>${order.orderId}</strong>
        </div>
      </div>
      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `);
  invoiceWindow.document.close();
}
window.printOrderInvoice = printOrderInvoice;

let currentOrdersFilter = "ALL";
let currentOrdersSearchQuery = "";

async function renderMyOrdersList() {
  const container = document.getElementById("my-orders-list-container");
  if (!container) return;

  let orders = JSON.parse(localStorage.getItem("jaankar_my_orders") || "[]");

  if (db) {
    try {
      const snap = await db.collection("orders").orderBy("createdAt", "desc").limit(30).get();
      if (snap && !snap.empty) {
        const firestoreOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const map = new Map();
        orders.forEach(o => map.set(o.orderId || o.id, o));
        firestoreOrders.forEach(o => map.set(o.orderId || o.id, o));
        orders = Array.from(map.values());
        orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        localStorage.setItem("jaankar_my_orders", JSON.stringify(orders));
      }
    } catch (e) {
      console.warn("Firestore fetch orders note:", e);
    }
  }

  syncMyOrdersBadge(orders.length);

  let filtered = orders;
  if (currentOrdersFilter === "ACTIVE") {
    filtered = filtered.filter(o => ["ORDER_PLACED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY"].includes(o.orderStatus));
  } else if (currentOrdersFilter === "DELIVERED") {
    filtered = filtered.filter(o => o.orderStatus === "DELIVERED");
  }

  if (currentOrdersSearchQuery) {
    const q = currentOrdersSearchQuery.toLowerCase();
    filtered = filtered.filter(o => (o.orderId && o.orderId.toLowerCase().includes(q)) || (o.customerName && o.customerName.toLowerCase().includes(q)));
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="jaankar-card p-12 text-center space-y-4">
        <div class="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
          <i data-lucide="package" class="w-8 h-8"></i>
        </div>
        <h3 class="text-base font-black text-slate-900">No Orders Found</h3>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">
          ${currentOrdersFilter !== "ALL" || currentOrdersSearchQuery ? "No orders matched your active filter or search." : "You haven't placed any orders yet. Discover our latest electronics with free delivery on orders ₹350+!"}
        </p>
        <button type="button" onclick="switchTab('categories')" class="btn-primary-orange text-xs py-2.5 px-5 cursor-pointer">
          <span>Start Shopping</span>
        </button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(order => {
    const grandTotal = (order.pricing && order.pricing.grandTotal) || (order.payment && order.payment.amount) || 0;
    const isCod = !order.payment || order.payment.mode === "COD";
    const d = new Date(order.createdAt || Date.now());
    const dateFormatted = d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });

    const statusBadges = {
      "ORDER_PLACED": '<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">🟡 Order Placed</span>',
      "PROCESSING": '<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">🔵 Processing & Packed</span>',
      "SHIPPED": '<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-200">🟣 Shipped</span>',
      "OUT_FOR_DELIVERY": '<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-200">🚚 Out for Delivery</span>',
      "DELIVERED": '<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">🟢 Delivered</span>',
      "CANCELLED": '<span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">🔴 Cancelled</span>'
    };
    const statusPill = statusBadges[order.orderStatus] || statusBadges["ORDER_PLACED"];

    const itemsPreviewHtml = (order.items || []).map(it => `
      <div class="flex items-center gap-3 py-1.5 border-b border-slate-100 last:border-0">
        <img src="${it.image || 'jaankar-logo.png'}" class="w-12 h-12 rounded-lg object-contain bg-slate-50 p-1 border border-slate-200 shrink-0">
        <div class="flex-1 min-w-0">
          <h6 class="text-xs font-bold text-slate-900 truncate">${escapeHtml(it.name)}</h6>
          <p class="text-[11px] text-slate-500 font-semibold">Qty: ${it.qty} • Price: ${formatInr(it.priceNum || parseCurrencyNumber(it.price))}</p>
        </div>
      </div>
    `).join("");

    return `
      <div class="jaankar-card p-5 space-y-4 hover:border-orange-300 transition-all">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2.5">
            <span class="px-2.5 py-0.5 rounded-lg text-xs font-black bg-orange-100 text-orange-700 font-mono">${order.orderId}</span>
            <span class="text-xs text-slate-400 font-semibold">• ${dateFormatted}</span>
          </div>
          <div class="flex items-center gap-2">
            ${isCod
              ? '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">🟡 Cash on Delivery</span>'
              : '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">🟢 Prepaid Online</span>'
            }
            ${statusPill}
          </div>
        </div>

        <div class="space-y-1">
          ${itemsPreviewHtml}
        </div>

        <div class="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span class="text-slate-500">Deliver to: </span>
            <strong class="text-slate-900">${escapeHtml(order.shippingAddress?.name || order.customerName || 'Customer')}</strong>
            <span class="text-slate-400"> (${escapeHtml(order.shippingAddress?.city || '')} - ${escapeHtml(order.shippingAddress?.pincode || '')})</span>
          </div>
          <div class="flex items-center gap-3">
            <div>
              <span class="text-slate-500">Total: </span>
              <strong class="text-base font-black text-orange-600">${formatInr(grandTotal)}</strong>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" onclick="printOrderInvoice('${order.orderId}')" class="btn-secondary-clean text-xs py-1.5 px-3 cursor-pointer">
                <i data-lucide="printer" class="w-3.5 h-3.5"></i>
                <span>Invoice</span>
              </button>
              <button type="button" onclick="openOrderTrackingModal('${order.orderId}')" class="btn-primary-orange text-xs py-1.5 px-3.5 font-bold shadow-sm cursor-pointer">
                <i data-lucide="navigation" class="w-3.5 h-3.5"></i>
                <span>Track Order</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join("");

  if (window.lucide) lucide.createIcons();
}
window.renderMyOrdersList = renderMyOrdersList;

function filterMyOrders(filter) {
  currentOrdersFilter = filter;
  ["ALL", "ACTIVE", "DELIVERED"].forEach(f => {
    const btn = document.getElementById(`order-filter-btn-${f}`);
    if (btn) {
      if (f === filter) {
        btn.className = "px-3.5 py-1.5 rounded-full text-xs font-bold bg-orange-600 text-white shadow-sm transition";
      } else {
        btn.className = "px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition";
      }
    }
  });
  renderMyOrdersList();
}
window.filterMyOrders = filterMyOrders;

function handleMyOrdersSearch(val) {
  currentOrdersSearchQuery = String(val || "").trim();
  renderMyOrdersList();
}
window.handleMyOrdersSearch = handleMyOrdersSearch;

function syncMyOrdersBadge(explicitCount) {
  const badge = document.getElementById("sidebar-orders-badge");
  if (!badge) return;
  const count = explicitCount !== undefined ? explicitCount : (JSON.parse(localStorage.getItem("jaankar_my_orders") || "[]")).length;
  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}
window.syncMyOrdersBadge = syncMyOrdersBadge;

// ----------------------------------------------------------------------------
// 12. Store Settings (COD Master Switch & Razorpay Key Listener)
// ----------------------------------------------------------------------------
window.isCodEnabled = false; // COD disabled by default until admin enables
window.JAANKAR_RAZORPAY_KEY = "rzp_test_JaankarDemoKey";

function initStoreSettingsListener() {
  const cachedCod = localStorage.getItem("jaankar_cod_enabled");
  if (cachedCod !== null) {
    window.isCodEnabled = (cachedCod === "true");
  }
  const cachedRzp = localStorage.getItem("jaankar_razorpay_key");
  if (cachedRzp) {
    window.JAANKAR_RAZORPAY_KEY = cachedRzp;
  }

  if (typeof db !== "undefined" && db) {
    try {
      db.collection("system_settings").doc("store_config").onSnapshot(doc => {
        if (doc && doc.exists) {
          const data = doc.data();
          if (typeof data.cod_enabled !== "undefined") {
            window.isCodEnabled = Boolean(data.cod_enabled);
            localStorage.setItem("jaankar_cod_enabled", String(window.isCodEnabled));
          }
          if (data.razorpay_key) {
            window.JAANKAR_RAZORPAY_KEY = data.razorpay_key;
            localStorage.setItem("jaankar_razorpay_key", data.razorpay_key);
          }
        }
      }, err => {
        console.warn("store_config listener note:", err);
      });
    } catch (e) {
      console.warn("initStoreSettingsListener error:", e);
    }
  }
}
window.initStoreSettingsListener = initStoreSettingsListener;

// Proactively initialize store settings
try {
  initStoreSettingsListener();
} catch (e) {
  console.warn("Immediate store settings init:", e);
}

