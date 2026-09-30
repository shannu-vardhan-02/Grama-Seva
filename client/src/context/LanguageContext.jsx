import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// ─── Translation Strings ──────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    // Meta
    _font: "'Inter', sans-serif",
    _headingFont: "'Space Grotesk', 'Inter', sans-serif",
    _monoFont: "'JetBrains Mono', monospace",

    // Nav
    searchWorkers: "Search Workers",
    reviews: "Reviews",
    settings: "Settings",
    vettingQueue: "Vetting Queue",
    manageUsers: "Manage Users",
    home: "Home",
    workers: "Workers",
    directory: "Directory",
    vetting: "Vetting",
    users: "Users",
    profile: "Profile",

    // BookService — Header
    pageTitleSearch: "Search Local Skilled Workers",
    pageSubSearch: "Browse administrator-verified workers in your village area, inspect services & pricing, and contact them directly.",

    // BookService — Search bar
    searchPlaceholder: "Search by name, village, or skill...",
    filterLabel: "Filter",
    filterSkillsPlaceholder: "Filter skills...",
    nearbyLabel: "Nearby",
    locating: "Locating...",
    cardView: "Card view",
    listView: "List view",
    selectSkillTypes: "Select skill types",
    clearAllFilters: "Clear all filters",
    filtering: "Filtering:",
    verifiedWorkersCount: (n) => `${n} available workers`,
    availableWorkersTitle: (n) => `Available Workers (${n})`,
    kmAway: "km away",
    yrsExp: "yrs exp",

    // BookService — Cards
    view: "View",
    viewProfileCall: "View Profile & Call",

    // BookService — Empty
    noMatchingWorkers: "No matching workers",
    noMatchingDesc: "Try clearing your search or filter criteria.",

    // BookService — Modal
    services: "Services",
    gallery: "Gallery",
    writeReview: "Write Review",
    copy: "Copy",
    copied: "Copied",
    cancel: "Cancel",
    submit: "Submit Review",
    submitting: "Submitting...",
    rating: "Rating",
    yourFeedback: "Your Feedback",
    shareExperience: "Share details of your experience...",
    reviewsCount: (n) => `${n} reviews`,
    ratingsCount: (n) => `(${n} ratings)`,

    // Skill categories
    skills: {
      all: "All Skills",
      electrician: "Electrician",
      mason: "Mason / Builder",
      plumber: "Plumber",
      carpenter: "Carpenter",
      mechanic: "Mechanic",
      painter: "Painter",
      cleaning: "House Cleaning",
      other: "General Labour",
    },

    // Home page
    heroTitle: "Find Skilled Local Workers.",
    heroSub: "Browse village-verified professionals — from electricians to masons — and connect directly.",
    searchWorkersBtn: "Search Workers",
    learnMore: "Learn More",
    workerDirectory: "Worker Directory",
    adminVerified: "Admin Verified",
    andhraVillageServices: "Andhra Pradesh\nVillage Services",
    adminVerifiedSub: "Profiles reviewed and approved by local village administrators.",

    // Auth & Layout
    signOut: "Sign Out",
    signOutConfirm: "Are you sure you want to sign out of your account?",
    yesSignOut: "Yes, Sign Out",
    language: "Language",
  },

  te: {
    // Meta — Noto Sans Telugu
    _font: "'Noto Sans Telugu', 'Inter', sans-serif",
    _headingFont: "'Noto Sans Telugu', 'Space Grotesk', sans-serif",
    _monoFont: "'Noto Sans Telugu', monospace",

    // Nav
    searchWorkers: "కార్మికులను వెతకండి",
    reviews: "సమీక్షలు",
    settings: "సెట్టింగ్‌లు",
    vettingQueue: "ధృవీకరణ వరుస",
    manageUsers: "వినియోగదారుల నిర్వహణ",
    home: "హోమ్",
    workers: "కార్మికులు",
    directory: "డైరెక్టరీ",
    vetting: "ధృవీకరణ",
    users: "వినియోగదారులు",
    profile: "ప్రొఫైల్",

    // BookService — Header
    pageTitleSearch: "స్థానిక నైపుణ్య కార్మికులను వెతకండి",
    pageSubSearch: "మీ గ్రామ ప్రాంతంలో నిర్వాహకులు ధృవీకరించిన కార్మికులను చూడండి, సేవలు & ధరలను తనిఖీ చేయండి, నేరుగా సంప్రదించండి.",

    // BookService — Search bar
    searchPlaceholder: "పేరు, గ్రామం లేదా నైపుణ్యం ద్వారా వెతకండి...",
    filterLabel: "ఫిల్టర్",
    filterSkillsPlaceholder: "నైపుణ్యాలను వెతకండి...",
    nearbyLabel: "సమీపంలో",
    locating: "స్థానం గుర్తిస్తోంది...",
    cardView: "కార్డ్ వీక్షణ",
    listView: "జాబితా వీక్షణ",
    selectSkillTypes: "నైపుణ్య రకాలు ఎంచుకోండి",
    clearAllFilters: "అన్ని ఫిల్టర్లు తీసివేయండి",
    filtering: "ఎంచుకున్నవి:",
    verifiedWorkersCount: (n) => `${n} అందుబాటులో ఉన్న కార్మికులు`,
    availableWorkersTitle: (n) => `అందుబాటులో ఉన్న కార్మికులు (${n})`,
    kmAway: "కి.మీ దూరంలో",
    yrsExp: "సం. అనుభవం",

    // BookService — Cards
    view: "చూడండి",
    viewProfileCall: "ప్రొఫైల్ & కాల్ చేయండి",

    // BookService — Empty
    noMatchingWorkers: "సరిపోయే కార్మికులు లేరు",
    noMatchingDesc: "వెతుకులాట లేదా ఫిల్టర్ తీసివేసి ప్రయత్నించండి.",

    // BookService — Modal
    services: "సేవలు",
    gallery: "గ్యాలరీ",
    writeReview: "సమీక్ష రాయండి",
    copy: "కాపీ",
    copied: "కాపీ అయింది",
    cancel: "రద్దు",
    submit: "సమీక్ష సమర్పించండి",
    submitting: "సమర్పిస్తోంది...",
    rating: "రేటింగ్",
    yourFeedback: "మీ అభిప్రాయం",
    shareExperience: "మీ అనుభవం వివరాలు పంచుకోండి...",
    reviewsCount: (n) => `${n} సమీక్షలు`,
    ratingsCount: (n) => `(${n} రేటింగ్‌లు)`,

    // Skill categories
    skills: {
      all: "అన్ని నైపుణ్యాలు",
      electrician: "ఎలక్ట్రీషియన్",
      mason: "మేస్త్రి / బిల్డర్",
      plumber: "ప్లంబర్",
      carpenter: "వడ్రంగి",
      mechanic: "మెకానిక్",
      painter: "పెయింటర్",
      cleaning: "ఇంటి క్లీనింగ్",
      other: "సాధారణ కూలీ",
    },

    // Home page
    heroTitle: "స్థానిక నైపుణ్య కార్మికులను కనుగొనండి.",
    heroSub: "ఎలక్ట్రీషియన్ నుండి మేస్త్రి వరకు గ్రామ ధృవీకరించిన నిపుణులను బ్రౌజ్ చేయండి — నేరుగా సంప్రదించండి.",
    searchWorkersBtn: "కార్మికులను వెతకండి",
    learnMore: "మరింత తెలుసుకోండి",
    workerDirectory: "కార్మిక డైరెక్టరీ",
    adminVerified: "అడ్మిన్ ధృవీకృతం",
    andhraVillageServices: "ఆంధ్రప్రదేశ్\nగ్రామ సేవలు",
    adminVerifiedSub: "స్థానిక గ్రామ నిర్వాహకులచే సమీక్షించబడి ఆమోదించబడిన ప్రొఫైల్‌లు.",

    // Auth & Layout
    signOut: "సైన్ అవుట్",
    signOutConfirm: "మీరు నిజంగా సైన్ అవుట్ చేయాలనుకుంటున్నారా?",
    yesSignOut: "అవును, సైన్ అవుట్",
    language: "భాష",
  },

  hi: {
    // Meta — Noto Sans Devanagari
    _font: "'Noto Sans Devanagari', 'Inter', sans-serif",
    _headingFont: "'Noto Sans Devanagari', 'Space Grotesk', sans-serif",
    _monoFont: "'Noto Sans Devanagari', monospace",

    // Nav
    searchWorkers: "कामगार खोजें",
    reviews: "समीक्षाएं",
    settings: "सेटिंग्स",
    vettingQueue: "सत्यापन कतार",
    manageUsers: "उपयोगकर्ता प्रबंधन",
    home: "होम",
    workers: "कामगार",
    directory: "डायरेक्टरी",
    vetting: "सत्यापन",
    users: "उपयोगकर्ता",
    profile: "प्रोफ़ाइल",

    // BookService — Header
    pageTitleSearch: "स्थानीय कुशल कामगारों को खोजें",
    pageSubSearch: "अपने गांव के क्षेत्र में प्रशासक-सत्यापित कामगारों को देखें, सेवाएं और कीमतें जांचें, और सीधे संपर्क करें।",

    // BookService — Search bar
    searchPlaceholder: "नाम, गांव, या कौशल से खोजें...",
    filterLabel: "फ़िल्टर",
    filterSkillsPlaceholder: "कौशल खोजें...",
    nearbyLabel: "पास में",
    locating: "स्थान ढूंढ रहे हैं...",
    cardView: "कार्ड दृश्य",
    listView: "सूची दृश्य",
    selectSkillTypes: "कौशल प्रकार चुनें",
    clearAllFilters: "सभी फ़िल्टर हटाएं",
    filtering: "चयनित:",
    verifiedWorkersCount: (n) => `${n} उपलब्ध कामगार`,
    availableWorkersTitle: (n) => `उपलब्ध कामगार (${n})`,
    kmAway: "किमी दूर",
    yrsExp: "वर्ष का अनुभव",

    // BookService — Cards
    view: "देखें",
    viewProfileCall: "प्रोफ़ाइल देखें और कॉल करें",

    // BookService — Empty
    noMatchingWorkers: "कोई कामगार नहीं मिला",
    noMatchingDesc: "अपनी खोज या फ़िल्टर साफ़ करके पुनः प्रयास करें।",

    // BookService — Modal
    services: "सेवाएं",
    gallery: "गैलरी",
    writeReview: "समीक्षा लिखें",
    copy: "कॉपी",
    copied: "कॉपी हो गया",
    cancel: "रद्द करें",
    submit: "समीक्षा जमा करें",
    submitting: "जमा हो रहा है...",
    rating: "रेटिंग",
    yourFeedback: "आपकी प्रतिक्रिया",
    shareExperience: "अपने अनुभव का विवरण साझा करें...",
    reviewsCount: (n) => `${n} समीक्षाएं`,
    ratingsCount: (n) => `(${n} रेटिंग)`,

    // Skill categories
    skills: {
      all: "सभी कौशल",
      electrician: "इलेक्ट्रीशियन",
      mason: "राजमिस्त्री",
      plumber: "प्लंबर",
      carpenter: "बढ़ई",
      mechanic: "मैकेनिक",
      painter: "पेंटर",
      cleaning: "घर की सफाई",
      other: "सामान्य मजदूर",
    },

    // Home page
    heroTitle: "स्थानीय कुशल कामगार खोजें।",
    heroSub: "इलेक्ट्रीशियन से राजमिस्त्री तक — गांव-सत्यापित पेशेवरों को ब्राउज़ करें और सीधे जुड़ें।",
    searchWorkersBtn: "कामगार खोजें",
    learnMore: "और जानें",
    workerDirectory: "कामगार निर्देशिका",
    adminVerified: "प्रशासक सत्यापित",
    andhraVillageServices: "आंध्र प्रदेश\nग्राम सेवाएं",
    adminVerifiedSub: "स्थानीय ग्राम प्रशासकों द्वारा समीक्षा और अनुमोदित प्रोफ़ाइल।",

    // Auth & Layout
    signOut: "साइन आउट",
    signOutConfirm: "क्या आप वाकई अपने खाते से साइन आउट करना चाहते हैं?",
    yesSignOut: "हाँ, साइन आउट करें",
    language: "भाषा",
  },
};

export const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", nativeLabel: "English", short: "EN" },
  { code: "te", label: "Telugu",  nativeLabel: "తెలుగు",  short: "తె" },
  { code: "hi", label: "Hindi",   nativeLabel: "हिंदी",   short: "हि" },
];

// ─── Context ──────────────────────────────────────────────────────────────────
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem("grama_seva_lang") || "en";
    } catch {
      return "en";
    }
  });

  const setLanguage = useCallback((code) => {
    setLang(code);
    try {
      localStorage.setItem("grama_seva_lang", code);
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.setAttribute("data-lang", lang);
    }
  }, [lang]);

  // ts("skills.electrician") — dot-path lookup
  const ts = useCallback((path) => {
    if (!path || typeof path !== "string") return path;
    const parts = path.split(".");
    let val = TRANSLATIONS[lang];
    for (const p of parts) {
      if (val === undefined || val === null) break;
      val = val[p];
    }
    if (val === undefined) {
      val = TRANSLATIONS.en;
      for (const p of parts) {
        if (val === undefined || val === null) break;
        val = val[p];
      }
    }
    return val ?? path;
  }, [lang]);

  // t("key") or t("key", arg) if function, with dot-path support
  const t = useCallback((key, ...args) => {
    if (!key || typeof key !== "string") return key;
    let entry = TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en?.[key];
    if (entry === undefined && key.includes(".")) {
      entry = ts(key);
      if (entry === key) entry = undefined; // couldn't resolve dot-path
    }
    if (typeof entry === "function") {
      return entry(...args);
    }
    return entry ?? key;
  }, [lang, ts]);

  const fonts = {
    body:    TRANSLATIONS[lang]?._font    ?? TRANSLATIONS.en._font,
    heading: TRANSLATIONS[lang]?._headingFont ?? TRANSLATIONS.en._headingFont,
    mono:    TRANSLATIONS[lang]?._monoFont ?? TRANSLATIONS.en._monoFont,
  };

  const value = { lang, setLanguage, t, ts, fonts };
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
