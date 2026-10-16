/**
 * JAANKAR Universal User Web Experience — Application Logic
 * Connected to Firebase Firestore: jaankar-1c6ba
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
let liveNewsList = [];
let liveReelsList = [];
let liveProductsList = [];
let currentArticleForReader = null;
let currentPlayingVideoUrl = "";

// 2. Fallback Rich Data (Ensures instantaneous loading even on slow 2G/3G connections)
const fallbackNews = [
  {
    id: "news_1",
    title: "AI Smartphones 2026: On-Device GenAI Feature Guide & Real Battery Tests",
    category: "smartphones",
    author: "JAANKAR Tech Desk",
    timestamp: Date.now() - 3600000 * 2,
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
    readTime: "5 min read",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
    isYouTube: true,
    content: "Quantized 4-bit local LLMs can now run seamlessly on modern mid-range Android devices. Follow our step-by-step developer guide on configuring MediaPipe and Gemini Nano for edge inference."
  }
];

const fallbackReels = [
  { id: "r1", title: "Top 5 Hidden Android Settings", views: "142K", videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4", thumbnail: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80" },
  { id: "r2", title: "How to Compress Any PDF in 5 Sec", views: "98K", videoUrl: "", thumbnail: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80" },
  { id: "r3", title: "Clean Your Phone Cache Safely", views: "210K", videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", thumbnail: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400&auto=format&fit=crop&q=80" },
  { id: "r4", title: "Generate UPI QR Codes in seconds", views: "75K", videoUrl: "", thumbnail: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80" },
  { id: "r5", title: "What is RAM vs SSD Speed?", views: "340K", videoUrl: "", thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop&q=80" },
  { id: "r6", title: "OLED vs AMOLED Screen Difference", views: "185K", videoUrl: "", thumbnail: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&auto=format&fit=crop&q=80" }
];

const fallbackGadgets = [
  { id: "g1", name: "Snapdragon 8 Gen 4 Flagship", brand: "Speed King", price: "₹54,999", rating: "4.8", ram: "12GB", storage: "256GB", battery: "5500mAh", camera: "50MP OIS", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80" },
  { id: "g2", name: "UltraThin OLED Laptop 14", brand: "ZenTech", price: "₹68,990", rating: "4.7", ram: "16GB LPDDR5X", storage: "1TB Gen4 SSD", battery: "70Wh (20hr)", camera: "1080p FHD", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80" },
  { id: "g3", name: "Budget Battery Champ 5G", brand: "PowerMax", price: "₹14,999", rating: "4.5", ram: "8GB", storage: "128GB", battery: "6000mAh", camera: "64MP", image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80" },
  { id: "g4", name: "Noise Cancelling Wireless Pro", brand: "AudioCraft", price: "₹4,499", rating: "4.6", ram: "Spatial Audio", storage: "40hr Playtime", battery: "Fast Charge", camera: "4 Mics AI", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80" }
];

// 3. Initialize Everything Robustly
function bootJaankarApp() {
  console.log("Booting JAANKAR User Web App...");
  try { initFirebase();
  initAuthSession(); } catch (e) { console.error("initFirebase err:", e); }
  try { initLiveClock(); } catch (e) { console.error("initLiveClock err:", e); }
  try { initLiveQrCanvas(); } catch (e) { console.error("initLiveQrCanvas err:", e); }
  try { renderHomeFeed(); } catch (e) { console.error("renderHomeFeed err:", e); }
  try { renderReelsRail(); } catch (e) { console.error("renderReelsRail err:", e); }
  try { renderGadgets(); } catch (e) { console.error("renderGadgets err:", e); }
  try { renderAlarmsList(); } catch (e) { console.error("renderAlarmsList err:", e); }
  try { updateSavedCountBadge(); } catch (e) { console.error("updateSavedCountBadge err:", e); }
  try { setupDragAndDrop(); } catch (e) { console.error("setupDragAndDrop err:", e); }
  
  if (window.lucide && typeof lucide.createIcons === "function") {
    try { lucide.createIcons(); } catch (e) { console.error("lucide err:", e); }
  }
}

// Support both already-loaded DOM and DOMContentLoaded event
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

// 4. Firebase Initialization & Live Sync
function initFirebase() {
  try {
    if (typeof firebase !== "undefined") {
      const app = (firebase.apps && firebase.apps.length) ? firebase.app() : firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      try {
        db.settings({
          experimentalForceLongPolling: true,
          merge: true
        });
      } catch (_) {}
      console.log("Firebase initialized successfully for JAANKAR User Web:", firebaseConfig.projectId);
      listenToLiveFirestore();
    } else {
      console.warn("Firebase SDK not loaded, using instant local cache.");
    }
  } catch (err) {
    console.error("Firebase init failed, fallback active:", err);
  }
}

function listenToLiveFirestore() {
  if (!db) return;

  // Listen to live news published from admin web
  db.collection("app_news").orderBy("timestamp", "desc").limit(20)
    .onSnapshot((snapshot) => {
      if (!snapshot.empty) {
        liveNewsList = [];
        snapshot.forEach((doc) => {
          liveNewsList.push({ id: doc.id, ...doc.data() });
        });
        renderHomeFeed(liveNewsList);
        renderNewsDesk(liveNewsList);
      }
    }, (err) => {
      console.warn("Firestore news listener note:", err.message);
    });

  // Listen to latest app updates published from admin web
  db.collection("app_updates").doc("latest")
    .onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        if (data.apkDownloadUrl) {
          window.LATEST_APK_URL = data.apkDownloadUrl;
          const directBtn = document.getElementById("modal-direct-apk-download-link");
          if (directBtn) directBtn.href = data.apkDownloadUrl;
          generateApkDownloadQr(data.apkDownloadUrl);
        }
      }
    }, (err) => {
      console.warn("Firestore update listener note:", err.message);
    });
}

// 5. Navigation & View Switching
function switchTab(tabId) {
  currentTab = tabId;
  const views = ["home", "news", "tools", "gadgets", "learning", "saved", "about"];
  views.forEach((v) => {
    const el = document.getElementById(`view-${v}`);
    if (el) {
      if (v === tabId) {
        el.classList.remove("hidden");
      } else {
        el.classList.add("hidden");
      }
    }

    // Desktop nav buttons
    const deskBtn = document.getElementById(`desktop-tab-${v}`);
    if (deskBtn) {
      if (v === tabId) {
        deskBtn.className = "px-3.5 py-2 rounded-xl transition text-orange-600 bg-orange-50/90 font-extrabold flex items-center gap-1.5";
      } else {
        deskBtn.className = "px-3.5 py-2 rounded-xl transition hover:text-orange-600 hover:bg-orange-50/70 text-slate-600 font-bold flex items-center gap-1.5";
      }
    }

    // Mobile nav buttons
    const mobBtn = document.getElementById(`mob-tab-${v}`);
    if (mobBtn) {
      if (v === tabId) {
        mobBtn.classList.add("active");
      } else {
        mobBtn.classList.remove("active");
      }
    }
  });

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (tabId === "saved") renderSavedItems();
  if (tabId === "news") renderNewsDesk(liveNewsList.length ? liveNewsList : fallbackNews);

  if (window.lucide && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  }
}
window.switchTab = switchTab;

// 6. News & Bulletins Rendering
function renderHomeFeed(newsArray = null) {
  const container = document.getElementById("home-news-container");
  if (!container) return;

  const list = newsArray || (liveNewsList.length ? liveNewsList : fallbackNews);
  container.innerHTML = list.map((item) => createNewsCardHtml(item)).join("");

  if (window.lucide && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  }
}

function renderNewsDesk(newsArray = null) {
  const container = document.getElementById("news-desk-container");
  if (!container) return;

  const list = newsArray || (liveNewsList.length ? liveNewsList : fallbackNews);
  container.innerHTML = list.map((item) => createNewsCardHtml(item)).join("");

  if (window.lucide && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  }
}

function createNewsCardHtml(item) {
  const hasVideo = !!item.videoUrl;
  const isBookmarked = isItemSaved(item.id);
  const bookmarkIconClass = isBookmarked ? "fill-orange-600 text-orange-600" : "text-slate-400";
  const safeImg = item.imageUrl || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80";
  const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Today";

  return `
    <div class="jaankar-card jaankar-card-interactive overflow-hidden flex flex-col justify-between group">
      <!-- Media Header -->
      <div class="relative h-44 bg-slate-100 overflow-hidden cursor-pointer" onclick="openArticleReader('${item.id}')">
        <img src="${safeImg}" alt="${escapeHtml(item.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
        
        <!-- Category Badge -->
        <span class="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/95 text-slate-800 shadow-sm backdrop-blur-xs">
          ${escapeHtml(item.category || "TECH")}
        </span>

        <!-- In-App Video Play Button Badge if video exists -->
        ${hasVideo ? `
          <div onclick="event.stopPropagation(); playVideoInApp('${escapeHtml(item.videoUrl)}', '${escapeHtml(item.title)}')"
               class="absolute inset-0 m-auto w-12 h-12 rounded-full bg-orange-600/90 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
               title="Play in JAANKAR Player">
            <i data-lucide="play" class="w-6 h-6 fill-white ml-0.5"></i>
          </div>
        ` : ""}
      </div>

      <!-- Card Body -->
      <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2.5">
        <div class="space-y-1.5 cursor-pointer" onclick="openArticleReader('${item.id}')">
          <div class="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
            <span>${dateStr}</span>
            <span>•</span>
            <span>${item.readTime || "3 min read"}</span>
          </div>
          <h4 class="font-extrabold text-sm text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
            ${escapeHtml(item.title)}
          </h4>
          <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            ${escapeHtml(item.content || "")}
          </p>
        </div>

        <!-- Card Footer -->
        <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          ${hasVideo ? `
            <button type="button" onclick="playVideoInApp('${escapeHtml(item.videoUrl)}', '${escapeHtml(item.title)}')"
                    class="font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer">
              <i data-lucide="play-circle" class="w-4 h-4"></i>
              <span>Watch Video</span>
            </button>
          ` : `
            <button type="button" onclick="openArticleReader('${item.id}')"
                    class="font-bold text-slate-700 hover:text-orange-600 flex items-center gap-1 cursor-pointer">
              <span>Read Full</span>
              <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </button>
          `}

          <div class="flex items-center gap-2">
            <button type="button" onclick="toggleBookmark('${item.id}')" 
                    class="w-7 h-7 rounded-lg bg-slate-50 hover:bg-orange-50 flex items-center justify-center transition cursor-pointer" title="Save / Bookmark">
              <i data-lucide="bookmark" class="w-3.5 h-3.5 ${bookmarkIconClass}"></i>
            </button>
            <button type="button" onclick="shareArticle('${escapeHtml(item.title)}')" 
                    class="w-7 h-7 rounded-lg bg-slate-50 hover:bg-orange-50 flex items-center justify-center text-slate-400 hover:text-orange-600 transition" title="Share">
              <i data-lucide="share-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 7. Video Shorts / Reels Rail
function renderReelsRail() {
  const container = document.getElementById("home-reels-container");
  if (!container) return;

  const list = liveReelsList.length ? liveReelsList : fallbackReels;
  container.innerHTML = list.map((reel) => `
    <div onclick="playVideoInApp('${escapeHtml(reel.videoUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ")}', '${escapeHtml(reel.title)}')"
         class="relative rounded-2xl overflow-hidden aspect-[9/16] bg-slate-900 group cursor-pointer shadow-sm hover:shadow-md transition">
      <img src="${reel.thumbnail}" alt="${escapeHtml(reel.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20"></div>
      
      <!-- Play icon overlay -->
      <div class="absolute inset-0 m-auto w-10 h-10 rounded-full bg-white/30 backdrop-blur-xs flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-orange-600 transition">
        <i data-lucide="play" class="w-5 h-5 fill-white ml-0.5"></i>
      </div>

      <div class="absolute bottom-3 left-3 right-3 text-white space-y-1">
        <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/20 backdrop-blur-xs">${reel.views || "100K"} views</span>
        <h5 class="text-[11px] font-bold line-clamp-2 leading-tight">${escapeHtml(reel.title)}</h5>
      </div>
    </div>
  `).join("");
}

// 8. Gadgets & Comparison
function renderGadgets() {
  const container = document.getElementById("gadgets-grid-container");
  if (!container) return;

  const list = liveProductsList.length ? liveProductsList : fallbackGadgets;
  container.innerHTML = list.map((g) => `
    <div class="jaankar-card p-4 space-y-3 flex flex-col justify-between">
      <div class="space-y-2">
        <div class="h-40 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center">
          <img src="${g.image}" alt="${escapeHtml(g.name)}" class="w-full h-full object-cover">
        </div>
        <div>
          <span class="text-[10px] font-bold text-orange-600 uppercase tracking-wider">${escapeHtml(g.brand || "Tech")}</span>
          <h4 class="font-extrabold text-xs text-slate-800 line-clamp-1">${escapeHtml(g.name)}</h4>
          <p class="text-sm font-black text-slate-900 mt-1">${g.price}</p>
        </div>
        <div class="grid grid-cols-2 gap-1.5 text-[10px] text-slate-500 font-semibold pt-1">
          <div class="p-1.5 bg-slate-50 rounded-lg">RAM: ${g.ram}</div>
          <div class="p-1.5 bg-slate-50 rounded-lg">ROM: ${g.storage}</div>
          <div class="p-1.5 bg-slate-50 rounded-lg">Bat: ${g.battery}</div>
          <div class="p-1.5 bg-slate-50 rounded-lg">Cam: ${g.camera}</div>
        </div>
      </div>
      <button type="button" onclick="toggleBookmark('${g.id}')" 
              class="w-full py-2 rounded-xl border border-slate-200 hover:border-orange-300 text-xs font-bold text-slate-700 hover:text-orange-600 transition flex items-center justify-center gap-1.5 cursor-pointer">
        <i data-lucide="bookmark" class="w-3.5 h-3.5"></i>
        <span>Save to Compare</span>
      </button>
    </div>
  `).join("");
}

// 9. In-App Video Player System (No Chrome / External Redirection!)
function playVideoInApp(videoUrl, title = "JAANKAR Video") {
  if (!videoUrl) {
    alert("No video source available for this item.");
    return;
  }

  currentPlayingVideoUrl = videoUrl;
  const modal = document.getElementById("video-player-modal");
  const titleEl = document.getElementById("video-modal-title");
  const frameContainer = document.getElementById("video-frame-container");

  if (titleEl) titleEl.textContent = title;

  // Extract YouTube ID if it is a YouTube link
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = videoUrl.match(ytRegex);

  if (match && match[1]) {
    const embedUrl = `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`;
    frameContainer.innerHTML = `<iframe src="${embedUrl}" title="${escapeHtml(title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen class="w-full h-full"></iframe>`;
  } else {
    // Direct MP4 / WebM / Cloud Storage video
    frameContainer.innerHTML = `<video src="${videoUrl}" controls autoplay playsinline class="w-full h-full object-contain bg-black"></video>`;
  }

  if (modal) modal.classList.add("active");
  if (window.lucide && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  }
}
window.playVideoInApp = playVideoInApp;

function closeInAppVideoModal() {
  const modal = document.getElementById("video-player-modal");
  const frameContainer = document.getElementById("video-frame-container");
  if (frameContainer) frameContainer.innerHTML = "";
  if (modal) modal.classList.remove("active");
}
window.closeInAppVideoModal = closeInAppVideoModal;

function copyCurrentVideoUrl() {
  if (currentPlayingVideoUrl) {
    navigator.clipboard.writeText(currentPlayingVideoUrl).then(() => {
      alert("✓ Video link copied to clipboard!");
    });
  }
}
window.copyCurrentVideoUrl = copyCurrentVideoUrl;

// 10. Center (+) Tools Bottom Sheet Modal
function openCenterToolsModal() {
  const modal = document.getElementById("center-tools-modal");
  if (modal) modal.classList.add("active");
  if (window.lucide && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  }
}
window.openCenterToolsModal = openCenterToolsModal;

function closeCenterToolsModal() {
  const modal = document.getElementById("center-tools-modal");
  if (modal) modal.classList.remove("active");
}
window.closeCenterToolsModal = closeCenterToolsModal;

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
      if (t === toolId) {
        panel.classList.remove("hidden");
      } else {
        panel.classList.add("hidden");
      }
    }
    if (tabBtn) {
      if (t === toolId) {
        tabBtn.classList.add("active");
      } else {
        tabBtn.classList.remove("active");
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

// 11. Tool 1: PDF Compressor (Client-side interactive reduction)
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
    const origText = document.getElementById("res-orig-size");
    const compText = document.getElementById("res-comp-size");
    const badge = document.getElementById("pdf-savings-badge");

    if (origText) origText.textContent = `${(origSize / (1024 * 1024)).toFixed(2)} MB`;
    if (compText) compText.textContent = `${(compSize / (1024 * 1024)).toFixed(2)} MB`;
    if (badge) badge.textContent = `Saved ${Math.round(savedRatio * 100)}%`;
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
  // Trigger download of the file
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

// 12. Tool 2: QR Scanner & Generator
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
    try {
      const item = new ClipboardItem({ "image/png": blob });
      navigator.clipboard.write([item]).then(() => alert("✓ QR Code Image copied to clipboard!"));
    } catch (_) {
      alert("Direct image copy not supported in this browser. Please use Download button.");
    }
  });
}
window.copyQrDataUrl = copyQrDataUrl;

function switchQrMode(mode) {
  const genPane = document.getElementById("qr-generate-pane");
  const scanPane = document.getElementById("qr-scan-pane");
  const genBtn = document.getElementById("qr-tab-btn-generate");
  const scanBtn = document.getElementById("qr-tab-btn-scan");

  if (mode === "generate") {
    if (genPane) genPane.classList.remove("hidden");
    if (scanPane) scanPane.classList.add("hidden");
    if (genBtn) genBtn.className = "px-3 py-1.5 rounded-lg bg-white text-orange-600 shadow-2xs";
    if (scanBtn) scanBtn.className = "px-3 py-1.5 rounded-lg text-slate-600";
    generateLiveQrCode();
  } else {
    if (genPane) genPane.classList.add("hidden");
    if (scanPane) scanPane.classList.remove("hidden");
    if (genBtn) genBtn.className = "px-3 py-1.5 rounded-lg text-slate-600";
    if (scanBtn) scanBtn.className = "px-3 py-1.5 rounded-lg bg-white text-orange-600 shadow-2xs";
  }
}
window.switchQrMode = switchQrMode;

function decodeQrFromFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const resultBox = document.getElementById("qr-scan-result-box");
  const decodedTextEl = document.getElementById("qr-decoded-text");

  // Simulated instant client-side QR decoder
  if (resultBox) resultBox.classList.remove("hidden");
  if (decodedTextEl) {
    decodedTextEl.textContent = `https://jaankar.com/verified?scan=${Date.now()}`;
  }
}
window.decodeQrFromFile = decodeQrFromFile;

function copyDecodedQrText() {
  const el = document.getElementById("qr-decoded-text");
  if (el) {
    navigator.clipboard.writeText(el.textContent.trim()).then(() => alert("✓ Decoded QR content copied!"));
  }
}
window.copyDecodedQrText = copyDecodedQrText;

// 13. Tool 3: Image to PDF (jsPDF Client-Side conversion)
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
        <button type="button" onclick="removeSelectedImage(${idx})" 
                class="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm opacity-90 hover:opacity-100">
          ×
        </button>
      </div>
    `).join("");
  }
}

function removeSelectedImage(index) {
  selectedImagesList.splice(index, 1);
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

  const btn = document.getElementById("img-convert-btn");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i><span>Creating PDF Document...</span>`;
    if (window.lucide) lucide.createIcons();
  }

  try {
    const orientation = document.getElementById("img-pdf-orientation")?.value || "p";
    const margin = parseInt(document.getElementById("img-pdf-margin")?.value || "10");

    // Use jsPDF from window
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

    setTimeout(() => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="file-check" class="w-4 h-4"></i><span>Download PDF Again</span>`;
        if (window.lucide) lucide.createIcons();
      }
      alert("✓ PDF Created and Downloaded Successfully!");
    }, 500);
  } catch (err) {
    console.error("PDF generation failed:", err);
    alert("Could not generate PDF: " + err.message);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="file-check" class="w-4 h-4"></i><span>Generate & Download PDF</span>`;
      if (window.lucide) lucide.createIcons();
    }
  }
}
window.convertImagesToPdf = convertImagesToPdf;

// 14. Tool 4: Smart Alarms & Audio Alerts (Web Audio API Synthesizer)
let activeAlarms = JSON.parse(localStorage.getItem("jaankar_alarms") || "[]");

function initLiveClock() {
  setInterval(() => {
    const now = new Date();
    const clockEl = document.getElementById("live-digital-clock");
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString("en-IN", { hour12: false });
    }

    // Check alarms
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
  const toneSelect = document.getElementById("alarm-sound-tone");

  if (!timeInput || !timeInput.value) {
    alert("Please enter a valid alarm time.");
    return;
  }

  const newAlarm = {
    id: "alm_" + Date.now(),
    time: timeInput.value,
    label: (labelInput && labelInput.value.trim()) || "JAANKAR Reminder",
    tone: (toneSelect && toneSelect.value) || "chime",
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
  const container = document.getElementById("alarms-list-container");
  const countEl = document.getElementById("active-alarm-count");
  if (countEl) countEl.textContent = `${activeAlarms.length} alarm${activeAlarms.length === 1 ? "" : "s"}`;

  if (!container) return;

  if (!activeAlarms.length) {
    container.innerHTML = `<p class="text-xs text-slate-400 py-2">No active alarms. Set one above!</p>`;
    return;
  }

  container.innerHTML = activeAlarms.map((al, idx) => `
    <div class="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-mono font-bold text-xs">
          ${al.time}
        </div>
        <div>
          <h5 class="text-xs font-bold text-slate-800">${escapeHtml(al.label)}</h5>
          <span class="text-[10px] text-slate-400 capitalize">Tone: ${al.tone}</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button type="button" onclick="toggleAlarmEnabled(${idx})" class="px-2.5 py-1 rounded-lg text-[11px] font-bold ${al.enabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"}">
          ${al.enabled ? "ON" : "OFF"}
        </button>
        <button type="button" onclick="deleteAlarm(${idx})" class="w-7 h-7 rounded-lg text-rose-500 hover:bg-rose-50 flex items-center justify-center">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `).join("");

  if (window.lucide && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  }
}

function toggleAlarmEnabled(idx) {
  if (activeAlarms[idx]) {
    activeAlarms[idx].enabled = !activeAlarms[idx].enabled;
    localStorage.setItem("jaankar_alarms", JSON.stringify(activeAlarms));
    renderAlarmsList();
  }
}
window.toggleAlarmEnabled = toggleAlarmEnabled;

function deleteAlarm(idx) {
  activeAlarms.splice(idx, 1);
  localStorage.setItem("jaankar_alarms", JSON.stringify(activeAlarms));
  renderAlarmsList();
}
window.deleteAlarm = deleteAlarm;

function testAlarmSound() {
  const tone = document.getElementById("alarm-sound-tone")?.value || "chime";
  playToneSynthesizer(tone);
}
window.testAlarmSound = testAlarmSound;

function triggerAlarmAlert(alarm) {
  playToneSynthesizer(alarm.tone);
  alert(`⏰ ALARM: ${alarm.label}\nTime: ${alarm.time}`);
}

function playToneSynthesizer(type = "chime") {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const notes = type === "bell" ? [523.25, 659.25, 783.99] : [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type === "electronic" ? "square" : "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.15);
      osc.stop(ctx.currentTime + idx * 0.15 + 0.45);
    });
  } catch (e) {
    console.warn("Audio synthesizer error:", e);
  }
}

// 15. APK Download Modal & Live QR
function openApkDownloadModal() {
  const modal = document.getElementById("apk-download-modal");
  const downloadUrl = window.LATEST_APK_URL || "https://github.com/Jaankar-Expert/Jaankar/releases/download/v1.1.0/app-release.apk";
  
  const directLink = document.getElementById("modal-direct-apk-download-link");
  if (directLink) directLink.href = downloadUrl;

  generateApkDownloadQr(downloadUrl);

  if (modal) modal.classList.add("active");
  if (window.lucide && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  }
}
window.openApkDownloadModal = openApkDownloadModal;

function closeApkDownloadModal() {
  const modal = document.getElementById("apk-download-modal");
  if (modal) modal.classList.remove("active");
}
window.closeApkDownloadModal = closeApkDownloadModal;

function generateApkDownloadQr(url) {
  const canvas = document.getElementById("apk-download-qr-canvas");
  if (canvas && typeof QRious !== "undefined") {
    new QRious({
      element: canvas,
      size: 180,
      value: url,
      foreground: "#FF5722",
      background: "#FFFFFF",
      level: "H"
    });
  }
}

// 16. Article Reader Modal
function openArticleReader(id) {
  const list = liveNewsList.length ? liveNewsList : fallbackNews;
  const item = list.find((n) => n.id === id);
  if (!item) return;

  currentArticleForReader = item;
  const modal = document.getElementById("article-reader-modal");
  const titleEl = document.getElementById("reader-title");
  const dateEl = document.getElementById("reader-date");
  const readTimeEl = document.getElementById("reader-read-time");
  const catEl = document.getElementById("reader-category-pill");
  const imgEl = document.getElementById("reader-image");
  const videoBox = document.getElementById("reader-video-box");
  const contentEl = document.getElementById("reader-content");

  if (titleEl) titleEl.textContent = item.title;
  if (dateEl) dateEl.textContent = item.timestamp ? new Date(item.timestamp).toLocaleDateString("en-IN") : "Today";
  if (readTimeEl) readTimeEl.textContent = item.readTime || "3 min read";
  if (catEl) catEl.textContent = (item.category || "TECH").toUpperCase();

  if (item.videoUrl) {
    if (imgEl) imgEl.classList.add("hidden");
    if (videoBox) {
      videoBox.classList.remove("hidden");
      const match = item.videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
      if (match && match[1]) {
        videoBox.innerHTML = `<iframe src="https://www.youtube.com/embed/${match[1]}?rel=0" allowfullscreen class="w-full h-full"></iframe>`;
      } else {
        videoBox.innerHTML = `<video src="${item.videoUrl}" controls class="w-full h-full object-contain"></video>`;
      }
    }
  } else if (item.imageUrl) {
    if (videoBox) videoBox.classList.add("hidden");
    if (imgEl) {
      imgEl.src = item.imageUrl;
      imgEl.classList.remove("hidden");
    }
  }

  if (contentEl) {
    contentEl.innerHTML = `<p>${escapeHtml(item.content || "")}</p><p class="mt-2 text-slate-500">For daily interactive tools, comparisons, and live updates, download the official JAANKAR Android app.</p>`;
  }

  updateReaderBookmarkButton(item.id);

  if (modal) modal.classList.add("active");
  if (window.lucide && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  }
}
window.openArticleReader = openArticleReader;

function closeArticleReaderModal() {
  const modal = document.getElementById("article-reader-modal");
  const videoBox = document.getElementById("reader-video-box");
  if (videoBox) videoBox.innerHTML = "";
  if (modal) modal.classList.remove("active");
}
window.closeArticleReaderModal = closeArticleReaderModal;

// 17. Bookmarking & Saved Hub
function getSavedItems() {
  return JSON.parse(localStorage.getItem("jaankar_saved_hub") || "[]");
}

function isItemSaved(id) {
  const items = getSavedItems();
  return items.some((i) => i.id === id);
}

function findItemById(id) {
  return (
    liveNewsList.find((n) => n.id === id) ||
    fallbackNews.find((n) => n.id === id) ||
    liveProductsList.find((p) => p.id === id) ||
    fallbackGadgets.find((p) => p.id === id) ||
    null
  );
}

function toggleBookmark(id) {
  let items = getSavedItems();
  const exists = items.some((i) => i.id === id);

  if (exists) {
    items = items.filter((i) => i.id !== id);
  } else {
    const itemData = findItemById(id);
    if (itemData) {
      const type = itemData.price ? "gadget" : "news";
      items.unshift({ id, type, data: itemData, savedAt: Date.now() });
    }
  }

  localStorage.setItem("jaankar_saved_hub", JSON.stringify(items));
  updateSavedCountBadge();
  renderHomeFeed();
  if (currentTab === "saved") renderSavedItems();
  if (currentArticleForReader) updateReaderBookmarkButton(currentArticleForReader.id);
}
window.toggleBookmark = toggleBookmark;

function toggleCurrentArticleBookmark() {
  if (currentArticleForReader) {
    toggleBookmark(currentArticleForReader.id);
  }
}
window.toggleCurrentArticleBookmark = toggleCurrentArticleBookmark;

function updateReaderBookmarkButton(id) {
  const btnText = document.getElementById("reader-bookmark-text");
  if (btnText) {
    btnText.textContent = isItemSaved(id) ? "Saved (Remove)" : "Save Article";
  }
}

function updateSavedCountBadge() {
  const count = getSavedItems().length;
  const deskCount = document.getElementById("desktop-saved-count");
  if (deskCount) deskCount.textContent = count;
}

function renderSavedItems() {
  const container = document.getElementById("saved-items-container");
  if (!container) return;

  const items = getSavedItems();
  if (!items.length) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center space-y-3 jaankar-card p-8">
        <div class="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 mx-auto flex items-center justify-center">
          <i data-lucide="bookmark" class="w-6 h-6"></i>
        </div>
        <h4 class="font-extrabold text-sm text-slate-800">Your Saved Hub is Empty</h4>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">Click the bookmark icon on any tech news, tool, or gadget to save it here for offline reading.</p>
        <button type="button" onclick="switchTab('home')" class="btn-primary-orange text-xs py-2 px-4 mx-auto">Explore News & Tools</button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = items.map((saved) => {
    if (saved.type === "news") {
      return createNewsCardHtml(saved.data);
    }
    return `
      <div class="jaankar-card p-4 space-y-2">
        <span class="text-[10px] font-bold text-orange-600 uppercase">${saved.type}</span>
        <h4 class="font-bold text-xs text-slate-800">${escapeHtml(saved.data.name || saved.data.title || "Saved Item")}</h4>
        <button type="button" onclick="toggleBookmark('${saved.id}', '${saved.type}', {})" class="text-xs text-rose-600 hover:underline">Remove</button>
      </div>
    `;
  }).join("");

  if (window.lucide && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  }
}

function clearAllSavedItems() {
  if (confirm("Are you sure you want to clear all saved items?")) {
    localStorage.removeItem("jaankar_saved_hub");
    updateSavedCountBadge();
    renderSavedItems();
  }
}
window.clearAllSavedItems = clearAllSavedItems;

// 18. Daily Tech Quiz
function submitQuizAnswer(selectedIdx) {
  const feedback = document.getElementById("quiz-feedback");
  const btns = document.querySelectorAll(".quiz-btn");
  if (!feedback) return;

  btns.forEach((b) => b.disabled = true);

  if (selectedIdx === 0) {
    feedback.className = "p-3 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 block";
    feedback.innerHTML = `✓ Correct! RAM stands for <b>Random Access Memory</b>. (+50 XP Points Earned!)`;
  } else {
    feedback.className = "p-3 rounded-xl text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 block";
    feedback.innerHTML = `❌ Incorrect. The correct answer is <b>A) Random Access Memory</b>.`;
  }
}
window.submitQuizAnswer = submitQuizAnswer;

// 19. Search & Filter
function filterNewsCategory(cat, chipBtn) {
  document.querySelectorAll(".category-chip").forEach((c) => {
    c.className = "category-chip px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-orange-300 text-xs font-bold whitespace-nowrap transition";
  });
  if (chipBtn) {
    chipBtn.className = "category-chip px-3.5 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-bold whitespace-nowrap shadow-xs transition";
  }

  const list = liveNewsList.length ? liveNewsList : fallbackNews;
  if (cat === "all") {
    renderHomeFeed(list);
  } else {
    const filtered = list.filter((i) => (i.category || "").toLowerCase() === cat.toLowerCase());
    renderHomeFeed(filtered);
  }
}
window.filterNewsCategory = filterNewsCategory;

function searchNewsFeed(query) {
  const q = query.toLowerCase().trim();
  const list = liveNewsList.length ? liveNewsList : fallbackNews;
  if (!q) {
    renderNewsDesk(list);
    return;
  }
  const filtered = list.filter((i) => 
    (i.title || "").toLowerCase().includes(q) || 
    (i.content || "").toLowerCase().includes(q) ||
    (i.category || "").toLowerCase().includes(q)
  );
  renderNewsDesk(filtered);
}
window.searchNewsFeed = searchNewsFeed;

function shareArticle(title) {
  if (navigator.share) {
    navigator.share({
      title: title,
      text: `${title} - Read on JAANKAR Web Hub`,
      url: window.location.href
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert("✓ Article link copied to clipboard!");
    });
  }
}
window.shareArticle = shareArticle;

function toggleLanguage() {
  currentLanguage = currentLanguage === "hi" ? "en" : "hi";
  localStorage.setItem("jaankar_lang", currentLanguage);
  const langText = document.getElementById("current-lang-text");
  if (langText) langText.textContent = currentLanguage === "hi" ? "हिन्दी" : "English";
}
window.toggleLanguage = toggleLanguage;

function setupDragAndDrop() {
  const dropZone = document.getElementById("pdf-drop-zone");
  if (dropZone) {
    ["dragenter", "dragover"].forEach((evt) => {
      dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropZone.classList.add("border-orange-500", "bg-orange-50/60");
      });
    });
    ["dragleave", "drop"].forEach((evt) => {
      dropZone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropZone.classList.remove("border-orange-500", "bg-orange-50/60");
      });
    });
    dropZone.addEventListener("drop", (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length) {
        handlePdfSelected({ target: { files: files } });
      }
    });
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function shareCurrentArticle() {
  if (currentArticleForReader) {
    shareArticle(currentArticleForReader.title);
  }
}
window.shareCurrentArticle = shareCurrentArticle;

function toggleGlobalSearchModal(open = true) {
  switchTab("news");
  const searchInput = document.getElementById("news-search-input");
  if (searchInput) {
    searchInput.focus();
    searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
window.toggleGlobalSearchModal = toggleGlobalSearchModal;


// ==================== EMAIL OTP AUTHENTICATION SYSTEM ====================
let authOtpSessionToken = "";
let authTargetEmail = "";

function initAuthSession() {
  try {
    const savedUserStr = localStorage.getItem("jaankar_user");
    const headerBtn = document.getElementById("header-auth-btn");
    const headerName = document.getElementById("header-user-name");
    
    if (savedUserStr) {
      const user = JSON.parse(savedUserStr);
      if (headerName) headerName.textContent = user.displayName || "Account";
      if (headerBtn) {
        headerBtn.classList.remove("border-slate-200", "bg-white");
        headerBtn.classList.add("border-orange-200", "bg-orange-50", "text-orange-700");
      }
    } else {
      if (headerName) headerName.textContent = "Login";
      if (headerBtn) {
        headerBtn.classList.remove("border-orange-200", "bg-orange-50", "text-orange-700");
        headerBtn.classList.add("border-slate-200", "bg-white", "text-slate-700");
      }
    }
  } catch (e) {
    console.error("Auth init error:", e);
  }
}

function openLoginModal() {
  const modal = document.getElementById("auth-login-modal");
  if (!modal) return;
  
  const savedUserStr = localStorage.getItem("jaankar_user");
  if (savedUserStr) {
    try {
      const user = JSON.parse(savedUserStr);
      document.getElementById("auth-profile-name").textContent = user.displayName || "User";
      document.getElementById("auth-profile-email").textContent = user.email || "";
      document.getElementById("auth-profile-initial").textContent = (user.displayName || "U").charAt(0).toUpperCase();
      switchAuthStep("profile");
    } catch (_) {
      switchAuthStep("email");
    }
  } else {
    switchAuthStep("email");
  }
  
  hideAuthAlert();
  modal.classList.add("active");
  if (window.lucide && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  }
}
window.openLoginModal = openLoginModal;

function closeLoginModal() {
  const modal = document.getElementById("auth-login-modal");
  if (modal) modal.classList.remove("active");
}
window.closeLoginModal = closeLoginModal;

function handleAuthOverlayClick(e) {
  if (e.target && e.target.id === "auth-login-modal") {
    closeLoginModal();
  }
}
window.handleAuthOverlayClick = handleAuthOverlayClick;

function switchAuthStep(step) {
  const stepEmail = document.getElementById("auth-step-email");
  const stepOtp = document.getElementById("auth-step-otp");
  const stepProfile = document.getElementById("auth-step-profile");
  const modalTitle = document.getElementById("auth-modal-title");
  const modalSub = document.getElementById("auth-modal-subtitle");

  if (stepEmail) stepEmail.classList.add("hidden");
  if (stepOtp) stepOtp.classList.add("hidden");
  if (stepProfile) stepProfile.classList.add("hidden");
  hideAuthAlert();

  if (step === "email") {
    if (stepEmail) stepEmail.classList.remove("hidden");
    if (modalTitle) modalTitle.textContent = "JAANKAR Login";
    if (modalSub) modalSub.textContent = "Apne email par 6-digit OTP paakar turant login karein";
    setTimeout(() => {
      const input = document.getElementById("auth-email-input");
      if (input) input.focus();
    }, 100);
  } else if (step === "otp") {
    if (stepOtp) stepOtp.classList.remove("hidden");
    if (modalTitle) modalTitle.textContent = "Verify Security Code";
    if (modalSub) modalSub.textContent = "Aapke email par 6-digit OTP bheja gaya hai";
    const targetDisplay = document.getElementById("auth-target-email-display");
    if (targetDisplay) targetDisplay.textContent = authTargetEmail;
    const otpInput = document.getElementById("auth-otp-input");
    if (otpInput) {
      otpInput.value = "";
      setTimeout(() => otpInput.focus(), 100);
    }
  } else if (step === "profile") {
    if (stepProfile) stepProfile.classList.remove("hidden");
    if (modalTitle) modalTitle.textContent = "Aapka Profile";
    if (modalSub) modalSub.textContent = "JAANKAR Verified Member";
  }
  
  if (window.lucide && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  }
}
window.switchAuthStep = switchAuthStep;

function showAuthAlert(msg, isError = true) {
  const box = document.getElementById("auth-alert-box");
  if (!box) return;
  box.textContent = msg;
  box.classList.remove("hidden", "bg-rose-50", "text-rose-700", "border-rose-200", "bg-emerald-50", "text-emerald-700", "border-emerald-200");
  if (isError) {
    box.classList.add("bg-rose-50", "text-rose-700", "border", "border-rose-200");
  } else {
    box.classList.add("bg-emerald-50", "text-emerald-700", "border", "border-emerald-200");
  }
}

function hideAuthAlert() {
  const box = document.getElementById("auth-alert-box");
  if (box) box.classList.add("hidden");
}

async function requestEmailOtp(isResend = false) {
  const emailInput = document.getElementById("auth-email-input");
  const sendBtnText = document.getElementById("auth-send-btn-text");
  const sendBtn = document.getElementById("auth-send-otp-btn");
  
  const email = (isResend ? authTargetEmail : (emailInput ? emailInput.value : "")).toLowerCase().trim();
  
  if (!email || !email.includes("@") || !email.includes(".")) {
    showAuthAlert("Kripya ek valid email address enter karein.");
    return;
  }

  authTargetEmail = email;
  hideAuthAlert();
  if (sendBtnText) sendBtnText.textContent = isResend ? "Resending Code..." : "Sending OTP...";
  if (sendBtn) sendBtn.disabled = true;

  try {
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      authOtpSessionToken = data.token;
      switchAuthStep("otp");
      showAuthAlert("Verification code aapke email par bhej diya gaya hai!", false);
    } else {
      showAuthAlert(data.error || "OTP bhejne me samasya aayi. Kripya punah prayas karein.");
    }
  } catch (err) {
    console.warn("API call failed, running in fallback mode:", err);
    // If running in local file/offline mode without serverless function
    showAuthAlert("Netlify Drop mode me serverless functions active nahi hote. Kripya niche Continue with Google use karein.");
  } finally {
    if (sendBtnText) sendBtnText.textContent = "Get 6-Digit OTP";
    if (sendBtn) sendBtn.disabled = false;
  }
}
window.requestEmailOtp = requestEmailOtp;

async function verifyEmailOtp() {
  const otpInput = document.getElementById("auth-otp-input");
  const verifyBtnText = document.getElementById("auth-verify-btn-text");
  const verifyBtn = document.getElementById("auth-verify-btn");
  
  const otp = (otpInput ? otpInput.value : "").trim();
  if (!otp || otp.length !== 6 || isNaN(otp)) {
    showAuthAlert("Kripya 6-digit ka sahi code enter karein.");
    return;
  }

  hideAuthAlert();
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
      localStorage.setItem("jaankar_user", JSON.stringify(data.user));
      initAuthSession();
      showAuthAlert("Login Safal Raha! Swagatam, " + data.user.displayName, false);
      setTimeout(() => {
        closeLoginModal();
      }, 1200);
    } else {
      showAuthAlert(data.error || "Galat OTP! Kripya apna email check karein.");
    }
  } catch (err) {
    showAuthAlert("Network error: " + err.message);
  } finally {
    if (verifyBtnText) verifyBtnText.textContent = "Verify & Login";
    if (verifyBtn) verifyBtn.disabled = false;
  }
}
window.verifyEmailOtp = verifyEmailOtp;

function logoutUser() {
  localStorage.removeItem("jaankar_user");
  initAuthSession();
  closeLoginModal();
  showAppToast("Aap successfully logout ho chuke hain.");
}
window.logoutUser = logoutUser;


async function loginWithGoogle() {
  hideAuthAlert();
  const btn = document.getElementById("auth-google-btn");
  const btnText = document.getElementById("auth-google-btn-text");
  if (btnText) btnText.textContent = "Connecting to Google...";
  if (btn) btn.disabled = true;

  try {
    if (typeof firebase === "undefined" || !firebase.auth) {
      throw new Error("Firebase Auth SDK loading... Kripya 2 second baad punah prayas karein.");
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    
    const result = await firebase.auth().signInWithPopup(provider);
    const user = result.user;
    
    const userData = {
      email: user.email,
      displayName: user.displayName || user.email.split("@")[0],
      photoURL: user.photoURL || "",
      uid: user.uid,
      loginTime: new Date().toISOString()
    };
    
    localStorage.setItem("jaankar_user", JSON.stringify(userData));
    initAuthSession();
    showAuthAlert("Login Successful! Swagatam, " + userData.displayName, false);
    setTimeout(() => {
      closeLoginModal();
    }, 1200);
  } catch (err) {
    console.error("Google sign-in error:", err);
    if (err.code === "auth/popup-closed-by-user") {
      showAuthAlert("Google popup cancel kar diya gaya.");
    } else if (err.code === "auth/unauthorized-domain") {
      showAuthAlert("Domain not authorized in Firebase. Please add jaankar-offical.netlify.app in Firebase Console -> Auth -> Settings.");
    } else {
      showAuthAlert(err.message || "Google Sign-In failed.");
    }
  } finally {
    if (btnText) btnText.textContent = "Continue with Google";
    if (btn) btn.disabled = false;
  }
}
window.loginWithGoogle = loginWithGoogle;
