import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket, getDistance } from "../context/SocketContext";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import {
  Search,
  Phone,
  Star,
  MapPin,
  X,
  Copy,
  Check,
  Filter,
  Navigation,
  DollarSign,
  Image,
  MessageSquare,
  Edit3,
  Crosshair,
  Trash2,
  LayoutGrid,
  List,
  ChevronDown,
} from "lucide-react";
import ImageLightbox from "../components/ImageLightbox";
import { WorkerCardSkeleton } from "../components/SkeletonLoader";
import { useDebounce } from "../hooks/useDebounce";
import ConfirmModal from "../components/ConfirmModal";

const MOCK_TELUGU_WORKERS = [
  {
    id: "tw-1",
    name: "Mk Electricals Home Service",
    phone: "+91 98480 12345",
    role: "Worker",
    workerProfile: {
      skill: "electrician",
      skills: ["electrician", "mechanic"],
      experience: 8,
      address: "Shamshabad Ward 3",
      location: { type: "Point", coordinates: [78.3489, 17.2181] },
      bio: "24/7 Service available. Best working skills, no delay. Works on-time with hand-over customer satisfaction.",
      isVerified: true,
      averageRating: 4.9,
      reviewCount: 3,
      proofOfWork: [{ url: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400" }],
      services: [
        { name: "Fan Repair & Fitting", price: 100 },
        { name: "Switchboard Installation", price: 250 },
        { name: "Inverter Wiring & Connection", price: 450 }
      ],
      gallery: [
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400"
      ],
      reviews: [
        { customerName: "Suresh Kumar", rating: 5, comment: "Very fast and clean ceiling fan wiring work.", date: "May 09, 2026" },
        { customerName: "Venkatesh P", rating: 5, comment: "Nice explanation of inverter battery connection, reasonable charges.", date: "Apr 07, 2026" },
        { customerName: "Naresh Reddy", rating: 5, comment: "Arrived at our village farm within 15 minutes for motor starter repair.", date: "Feb 14, 2026" }
      ]
    }
  },
  {
    id: "tw-2",
    name: "AS Electrician & Motor Works",
    phone: "+91 98491 23456",
    role: "Worker",
    workerProfile: {
      skill: "electrician",
      skills: ["electrician", "plumber"],
      experience: 12,
      address: "Ammapally Temple Road",
      location: { type: "Point", coordinates: [78.3589, 17.2281] },
      bio: "I am an Electrician. All electrical services can be done, maintenance/repairs with guaranteed village service.",
      isVerified: true,
      averageRating: 4.8,
      reviewCount: 3,
      proofOfWork: [{ url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400" }],
      services: [
        { name: "3-Phase Submersible Starter Fix", price: 350 },
        { name: "Complete Room Wiring", price: 1200 },
        { name: "LED Ceiling Light Fitting", price: 150 }
      ],
      gallery: [
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400"
      ],
      reviews: [
        { customerName: "Koti Rao", rating: 5, comment: "Prompt response and clean wiring work.", date: "Jun 12, 2026" },
        { customerName: "Raju V", rating: 5, comment: "Fixed 3-phase motor starter switch in no time.", date: "May 01, 2026" }
      ]
    }
  },
  {
    id: "tw-3",
    name: "Satyanarayana Mason Building Works",
    phone: "+91 94403 45678",
    role: "Worker",
    workerProfile: {
      skill: "mason",
      skills: ["mason", "carpenter"],
      experience: 10,
      address: "Bustand Ward 5",
      location: { type: "Point", coordinates: [78.3389, 17.2081] },
      bio: "Specialist in concrete slab work, brick masonry, plastering, tile laying, and wall compound construction.",
      isVerified: true,
      averageRating: 4.9,
      reviewCount: 3,
      proofOfWork: [{ url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400" }],
      services: [
        { name: "Tile Laying per sq ft", price: 25 },
        { name: "Wall Plastering per Day", price: 700 },
        { name: "Compound Wall Construction", price: 1500 }
      ],
      gallery: [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400"
      ],
      reviews: [
        { customerName: "Prasad Raju", rating: 5, comment: "Excellent masonry and cement plastering work for my home extension.", date: "May 18, 2026" },
        { customerName: "Chandra Mohan", rating: 5, comment: "Constructed compound wall pillars solid with neat finishing.", date: "Apr 22, 2026" }
      ]
    }
  },
  {
    id: "tw-4",
    name: "Appa Rao Plumbing & Borewell",
    phone: "+91 98664 56789",
    role: "Worker",
    workerProfile: {
      skill: "plumber",
      skills: ["plumber", "mechanic"],
      experience: 9,
      address: "Market Street Shamshabad",
      location: { type: "Point", coordinates: [78.3489, 17.2181] },
      bio: "Borewell motor fitting, underground PVC pipe leakage fixing, tank installation, and bathroom fittings.",
      isVerified: true,
      averageRating: 4.8,
      reviewCount: 3,
      proofOfWork: [{ url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400" }],
      services: [
        { name: "Tap & Pipe Leakage Fix", price: 120 },
        { name: "Water Tank Line Cleaning", price: 400 },
        { name: "Overhead Tank Installation", price: 800 }
      ],
      gallery: [
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=400"
      ],
      reviews: [
        { customerName: "Srinivasa Reddy", rating: 5, comment: "Fixed underground PVC pipe leakage cleanly in 30 minutes.", date: "May 02, 2026" },
        { customerName: "Kishore V", rating: 5, comment: "Installed 1000L overhead water tank with booster pipes.", date: "Apr 11, 2026" }
      ]
    }
  },
  {
    id: "tw-5",
    name: "Ramaiah Painting Works",
    phone: "+91 95559 67890",
    role: "Worker",
    workerProfile: {
      skill: "painter",
      skills: ["painter"],
      experience: 7,
      address: "Gandhi Nagar, Shamshabad",
      location: { type: "Point", coordinates: [78.3589, 17.2381] },
      bio: "Interior & exterior house painting, whitewashing, waterproofing and texture designs for modern homes.",
      isVerified: true,
      averageRating: 4.7,
      reviewCount: 2,
      proofOfWork: [{ url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400" }],
      services: [
        { name: "Interior Emulsion per sqft", price: 18 },
        { name: "Exterior Painting per sqft", price: 22 },
        { name: "Waterproofing Treatment", price: 2500 }
      ],
      gallery: [
        "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400"
      ],
      reviews: [
        { customerName: "Madhavi Latha", rating: 5, comment: "Beautiful texture work on living room walls. Very neat.", date: "Jun 01, 2026" },
        { customerName: "Ravi Teja", rating: 4, comment: "Good exterior painting, completed in 3 days as promised.", date: "May 10, 2026" }
      ]
    }
  }
];

const SKILL_CATEGORIES = [
  { id: "electrician", label: "Electrician", icon: "⚡" },
  { id: "mason", label: "Mason / Builder", icon: "🧱" },
  { id: "plumber", label: "Plumber", icon: "🔧" },
  { id: "carpenter", label: "Carpenter", icon: "🪵" },
  { id: "mechanic", label: "Mechanic", icon: "⚙️" },
  { id: "painter", label: "Painter", icon: "🖌️" },
  { id: "cleaning", label: "House Cleaning", icon: "🧹" },
  { id: "other", label: "General Labour", icon: "🏠" },
];

export default function BookService() {
  const { currentUser, users, fetchUsers } = useAuth();
  const { submitWorkerReview, deleteWorkerProfileReview, deleteReview } = useSocket();
  const { showToast } = useToast();
  const { isDark } = useTheme();
  const { t, lang } = useLanguage();

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [filterSearchOpen, setFilterSearchOpen] = useState(false);
  const [filterSearchQuery, setFilterSearchQuery] = useState("");
  const filterDropdownRef = useRef(null);
  const filterSearchInputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortByRadius, setSortByRadius] = useState(false);
  const [userCoords, setUserCoords] = useState([78.3489, 17.2181]);
  const [geoStatus, setGeoStatus] = useState("idle");
  const [viewMode, setViewMode] = useState("grid");

  const [activeModalWorker, setActiveModalWorker] = useState(null);
  const [activeTab, setActiveTab] = useState("services");
  const [copiedNumber, setCopiedNumber] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  const [lightboxImages, setLightboxImages] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const debouncedSearchQuery = useDebounce(searchQuery, 160);

  // On initial mount: only use user profile coordinates if available.
  // Geolocation and distance sorting are NOT automatically triggered on page load;
  // they only apply when the user explicitly clicks the Nearby sort button.
  useEffect(() => {
    const loc = currentUser?.workerProfile?.location?.coordinates || currentUser?.location?.coordinates;
    if (loc && loc[0] !== 0 && loc[1] !== 0) {
      setUserCoords(loc);
    }
  }, [currentUser]);

  // Handle outside click for filter dropdown
  useEffect(() => {
    const handleClick = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setFilterDropdownOpen(false);
        setFilterSearchOpen(false);
        setFilterSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleRequestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setSortByRadius(true);
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords([pos.coords.longitude, pos.coords.latitude]);
        setGeoStatus("granted");
        setSortByRadius(true);
      },
      () => {
        setGeoStatus("denied");
        setSortByRadius(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleToggleNearbySort = useCallback(() => {
    if (sortByRadius) {
      // User explicitly toggling sort OFF -> restores default natural catalog order
      setSortByRadius(false);
    } else {
      // User explicitly toggling sort ON
      if (geoStatus !== "granted" && navigator.geolocation) {
        handleRequestLocation();
      } else {
        setSortByRadius(true);
      }
    }
  }, [sortByRadius, geoStatus, handleRequestLocation]);

  const handleOpenWorkerModal = useCallback((worker) => {
    setActiveModalWorker(worker);
    setActiveTab("services");
    setCopiedNumber(false);
  }, []);

  const handleCopyPhone = (phone) => {
    navigator.clipboard?.writeText(phone);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const toggleSkillFilter = (skillId) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]
    );
  };

  const removeSkillFilter = (skillId) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skillId));
  };

  // Helper to format skill with capital first letter
  const formatSkillName = (s) => {
    if (!s) return "";
    const str = String(s).trim();
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Localized skill helper
  const getLocalizedSkill = (s) => {
    if (!s) return "";
    const key = String(s).trim().toLowerCase();
    const translated = t(`skills.${key}`);
    if (translated && !translated.startsWith("skills.")) {
      return formatSkillName(translated);
    }
    return formatSkillName(s);
  };

  const realWorkers = users.filter((u) => u.role === "Worker" && u.workerProfile?.isVerified);
  const allWorkers = realWorkers.length > 0 ? realWorkers : MOCK_TELUGU_WORKERS;

  const filteredWorkers = useMemo(() => {
    let list = allWorkers.filter((w) => {
      const prof = w.workerProfile || {};
      const skillMatch =
        selectedSkills.length === 0 ||
        selectedSkills.some((s) => prof.skill === s || prof.skills?.includes(s));
      const searchLower = (debouncedSearchQuery || "").toLowerCase().trim();
      if (!searchLower) return skillMatch;
      return (
        skillMatch &&
        (w.name?.toLowerCase().includes(searchLower) ||
          prof.skill?.toLowerCase().includes(searchLower) ||
          prof.skills?.some((s) => s.toLowerCase().includes(searchLower)) ||
          prof.address?.toLowerCase().includes(searchLower) ||
          prof.bio?.toLowerCase().includes(searchLower))
      );
    });

    if (sortByRadius) {
      list = list
        .map((w) => {
          const coords = w.workerProfile?.location?.coordinates;
          const hasCoords = coords && coords[0] !== 0 && coords[1] !== 0;
          return {
            ...w,
            calculatedDistance: hasCoords ? getDistance(userCoords, coords) : 999,
          };
        })
        .sort((a, b) => a.calculatedDistance - b.calculatedDistance);
    }
    return list;
  }, [allWorkers, selectedSkills, debouncedSearchQuery, sortByRadius, userCoords]);

  const handleAddReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewRating) return;
    setReviewSubmitting(true);
    const workerId = activeModalWorker?._id || activeModalWorker?.id;
    const savedRating = reviewRating;
    const savedComment = reviewComment;
    const newRev = {
      customerName: currentUser?.name || "Anonymous",
      rating: savedRating,
      comment: savedComment,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    const existingReviews = activeModalWorker.workerProfile?.reviews || [];
    const updatedRevList = [newRev, ...existingReviews];
    const totalRating = updatedRevList.reduce((sum, r) => sum + Number(r.rating || 0), 0);
    const newAvg = totalRating / updatedRevList.length;

    setActiveModalWorker((prev) => ({
      ...prev,
      workerProfile: {
        ...prev.workerProfile,
        reviews: updatedRevList,
        reviewCount: updatedRevList.length,
        averageRating: newAvg,
      },
    }));

    setReviewSubmitting(false);
    setShowReviewModal(false);
    setReviewComment("");
    setReviewRating(0);
    showToast("Review submitted successfully!", "success");

    if (workerId && !String(workerId).startsWith("tw-")) {
      submitWorkerReview(workerId, savedRating, savedComment)
        .then(() => {
          if (fetchUsers) fetchUsers();
        })
        .catch((err) => showToast(err.message || "Failed to submit review", "error"));
    }
  };

  const T = {
    canvas: isDark ? "#0d0e12" : "#faf9f5",
    card: isDark ? "#15161e" : "#ffffff",
    cardBorder: isDark ? "#232532" : "#e6dfd8",
    cardHoverShadow: isDark ? "0 8px 28px rgba(0,0,0,0.45)" : "0 8px 24px rgba(20,20,19,0.08)",
    input: isDark ? "#161720" : "#ffffff",
    inputBorder: isDark ? "#232532" : "#e6dfd8",
    hairline: isDark ? "#232532" : "#e6dfd8",
    ink: isDark ? "#f0f1f5" : "#141413",
    muted: isDark ? "#7e8194" : "#6c6a64",
    muted2: isDark ? "#9396a8" : "#8e8b82",
    accent: isDark ? "#34d399" : "#cc785c",
    accentText: isDark ? "#071a12" : "#ffffff",
    tagBg: isDark ? "#171821" : "#efe9de",
    tagBorder: isDark ? "#2a2c3e" : "#e6dfd8",
    tagColor: isDark ? "#b2b5c5" : "#3d3d3a",
    emptyBg: isDark ? "#14151d" : "#efe9de",
    deepGreen: isDark ? "#34d399" : "#003c33",
    modalHeader: isDark ? "#0e1f19" : "#003c33",
  };

  // Filter skills in dropdown based on mini search
  const visibleCategories = SKILL_CATEGORIES.filter((cat) => {
    if (!filterSearchQuery) return true;
    const q = filterSearchQuery.toLowerCase();
    const trans = t(`skills.${cat.id}`);
    const localized = ((trans && !trans.startsWith("skills.")) ? trans : cat.label).toLowerCase();
    return localized.includes(q) || cat.label.toLowerCase().includes(q) || cat.id.toLowerCase().includes(q);
  });

  return (
    <div style={{ background: T.canvas, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>

      {/* ── STICKY SEARCH + FILTER BAR ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: T.canvas,
          borderBottom: `1px solid ${T.hairline}`,
          padding: "16px 24px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" }}>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>

            {/* Search Input */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flex: "1 1 280px",
                background: T.input,
                border: `1px solid ${T.inputBorder}`,
                borderRadius: "12px",
                padding: "10px 16px",
                boxShadow: isDark ? "none" : "0 2px 8px rgba(20,20,19,0.03)",
                gap: "10px",
              }}
            >
              <Search size={18} color={T.muted2} style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "14px",
                  color: T.ink,
                  fontFamily: "'Inter', sans-serif",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{ background: "none", border: "none", cursor: "pointer", color: T.muted2, display: "flex", padding: 0 }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Dropdown */}
            <div ref={filterDropdownRef} style={{ position: "relative", flexShrink: 0 }}>
              <button
                onClick={() => setFilterDropdownOpen((v) => !v)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 16px",
                  background: selectedSkills.length > 0 ? T.accent : T.input,
                  color: selectedSkills.length > 0 ? T.accentText : T.ink,
                  border: `1px solid ${selectedSkills.length > 0 ? T.accent : T.inputBorder}`,
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: isDark ? "none" : "0 2px 8px rgba(20,20,19,0.03)",
                  transition: "all 0.15s",
                }}
              >
                <Filter size={15} />
                {t("filterLabel")}{selectedSkills.length > 0 ? ` (${selectedSkills.length})` : ""}
                <ChevronDown
                  size={14}
                  style={{
                    transform: filterDropdownOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                />
              </button>

              {filterDropdownOpen && (
                <div
                  className="filter-dropdown-menu"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    background: T.card,
                    border: `1px solid ${T.cardBorder}`,
                    borderRadius: "12px",
                    padding: "8px",
                    boxShadow: isDark ? "0 16px 40px rgba(0,0,0,0.5)" : "0 8px 32px rgba(20,20,19,0.12)",
                    zIndex: 200,
                    minWidth: "240px",
                  }}
                >
                  {/* Dropdown Header with Mini Search Logo that expands */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 8px 8px",
                      gap: "8px",
                      minHeight: "34px",
                    }}
                  >
                    {!filterSearchOpen ? (
                      <>
                        <span
                          style={{
                            fontSize: "11px",
                            fontFamily: "'JetBrains Mono', monospace",
                            textTransform: "uppercase",
                            letterSpacing: "0.2px",
                            color: T.muted2,
                          }}
                        >
                          {t("selectSkillTypes")}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFilterSearchOpen(true);
                            setTimeout(() => filterSearchInputRef.current?.focus(), 60);
                          }}
                          title="Search skills"
                          style={{
                            background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                            border: `1px solid ${T.cardBorder}`,
                            borderRadius: "50%",
                            width: "24px",
                            height: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: T.muted2,
                            transition: "all 0.15s ease",
                            flexShrink: 0,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = T.ink;
                            e.currentTarget.style.borderColor = T.accent;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = T.muted2;
                            e.currentTarget.style.borderColor = T.cardBorder;
                          }}
                        >
                          <Search size={12} />
                        </button>
                      </>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          background: T.input,
                          border: `1px solid ${T.accent}`,
                          borderRadius: "8px",
                          padding: "3px 8px",
                          gap: "6px",
                          animation: "fadeIn 0.2s ease",
                        }}
                      >
                        <Search size={12} color={T.accent} style={{ flexShrink: 0 }} />
                        <input
                          ref={filterSearchInputRef}
                          type="text"
                          value={filterSearchQuery}
                          onChange={(e) => setFilterSearchQuery(e.target.value)}
                          placeholder={t("filterSkillsPlaceholder")}
                          style={{
                            flex: 1,
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            fontSize: "12px",
                            color: T.ink,
                            padding: "2px 0",
                            fontFamily: "'Inter', sans-serif",
                            minWidth: 0,
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFilterSearchQuery("");
                            setFilterSearchOpen(false);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: T.muted2,
                            padding: 0,
                            display: "flex",
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Skills List in Dropdown */}
                  <div style={{ maxHeight: "260px", overflowY: "auto" }}>
                    {visibleCategories.length === 0 ? (
                      <div style={{ padding: "12px 10px", fontSize: "12px", color: T.muted2, textAlign: "center" }}>
                        No skills found
                      </div>
                    ) : (
                      visibleCategories.map((cat) => {
                        const active = selectedSkills.includes(cat.id);
                        const trans = t(`skills.${cat.id}`);
                        const catLabel = (trans && !trans.startsWith("skills.")) ? trans : cat.label;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => toggleSkillFilter(cat.id)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              width: "100%",
                              padding: "8px 10px",
                              background: active
                                ? (isDark ? "rgba(52,211,153,0.12)" : "rgba(204,120,92,0.08)")
                                : "transparent",
                              border: "none",
                              borderRadius: "8px",
                              color: active ? T.accent : T.ink,
                              fontSize: "13.5px",
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "background 0.12s",
                              fontFamily: "'Inter', sans-serif",
                            }}
                          >
                            <span style={{ fontSize: "15px", width: "20px", textAlign: "center" }}>{cat.icon}</span>
                            <span style={{ flex: 1 }}>{catLabel}</span>
                            {active && (
                              <span
                                style={{
                                  width: "16px",
                                  height: "16px",
                                  borderRadius: "50%",
                                  background: T.accent,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <Check size={10} color={T.accentText} />
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {selectedSkills.length > 0 && (
                    <div style={{ borderTop: `1px solid ${T.hairline}`, marginTop: "6px", paddingTop: "6px" }}>
                      <button
                        onClick={() => {
                          setSelectedSkills([]);
                          setFilterDropdownOpen(false);
                          setFilterSearchOpen(false);
                          setFilterSearchQuery("");
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          width: "100%",
                          padding: "8px 10px",
                          background: "none",
                          border: "none",
                          color: isDark ? "#f87171" : "#b30000",
                          fontSize: "13px",
                          cursor: "pointer",
                          borderRadius: "8px",
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        <X size={13} /> {t("clearAllFilters")}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Nearby Sort */}
            <button
              onClick={handleToggleNearbySort}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                background: sortByRadius ? (isDark ? "#164e3f" : "#003c33") : T.input,
                color: sortByRadius ? "#ffffff" : T.ink,
                border: `1px solid ${sortByRadius ? (isDark ? "#34d399" : "#003c33") : T.inputBorder}`,
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                flexShrink: 0,
                boxShadow: isDark ? "none" : "0 2px 8px rgba(20,20,19,0.03)",
                transition: "all 0.15s",
              }}
            >
              {geoStatus === "loading" ? (
                <>
                  <Crosshair size={15} className="animate-spin" /> {t("locating")}
                </>
              ) : (
                <>
                  <Navigation size={15} /> {t("nearbyLabel")} {sortByRadius && "✓"}
                </>
              )}
            </button>

            {/* View Toggle */}
            <div
              style={{
                display: "inline-flex",
                borderRadius: "10px",
                border: `1px solid ${T.inputBorder}`,
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {[
                ["grid", LayoutGrid, t("cardView")],
                ["list", List, t("listView")],
              ].map(([mode, Icon, titleStr]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  title={titleStr}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px 12px",
                    background: viewMode === mode ? (isDark ? "#1a1c26" : "#17171c") : "transparent",
                    color: viewMode === mode ? (isDark ? "#f0f1f5" : "#ffffff") : T.muted,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Active filter tags */}
          {selectedSkills.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
              <span
                style={{
                  fontSize: "11px",
                  color: T.muted,
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.2px",
                }}
              >
                {t("filtering")}
              </span>
              {selectedSkills.map((skillId) => {
                const cat = SKILL_CATEGORIES.find((c) => c.id === skillId);
                const trans = t(`skills.${skillId}`);
                const tagLabel = (trans && !trans.startsWith("skills.")) ? trans : (cat?.label || formatSkillName(skillId));
                return (
                  <span
                    key={skillId}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 10px 4px 12px",
                      background: T.tagBg,
                      border: `1px solid ${T.tagBorder}`,
                      borderRadius: "9999px",
                      fontSize: "13px",
                      color: T.tagColor,
                    }}
                  >
                    {cat?.icon} {tagLabel}
                    <button
                      onClick={() => removeSkillFilter(skillId)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: T.muted2,
                        display: "flex",
                        padding: 0,
                        marginLeft: "2px",
                      }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── HEADER ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px 16px" }}>
        <div
          style={{
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            fontSize: "32px",
            fontWeight: 400,
            color: isDark ? "#f0f1f5" : "#141413",
            letterSpacing: "-0.03em",
          }}
        >
          {t("pageTitleSearch")}
        </div>
        <p style={{ fontSize: "15px", color: T.muted, marginTop: "6px" }}>
          {t("pageSubSearch")}
        </p>
      </div>

      {/* ── WORKERS LIST ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              color: T.muted,
              textTransform: "uppercase",
              letterSpacing: "0.2px",
            }}
          >
            {t("verifiedWorkersCount", filteredWorkers.length)}
          </div>
        </div>

        {filteredWorkers.length === 0 ? (
          <div
            style={{
              background: T.emptyBg,
              borderRadius: "16px",
              padding: "48px",
              textAlign: "center",
              border: `1px solid ${T.hairline}`,
            }}
          >
            <Filter size={36} color={T.muted2} style={{ margin: "0 auto 12px" }} />
            <h3
              style={{
                fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                fontSize: "22px",
                fontWeight: 400,
                color: isDark ? "#f0f1f5" : "#141413",
                margin: "0 0 8px",
              }}
            >
              {t("noMatchingWorkers")}
            </h3>
            <p style={{ fontSize: "15px", color: T.muted }}>
              {t("noMatchingDesc")}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          /* ── CARD GRID VIEW ── */
          <div className="worker-cards-grid">
            {filteredWorkers.map((worker) => {
              const prof = worker.workerProfile || {};
              const photo =
                prof.proofOfWork?.[0]?.url ||
                "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400";
              const rating = prof.averageRating || 4.9;
              const reviews = prof.reviewCount || 12;
              const distanceKm = worker.calculatedDistance ? worker.calculatedDistance.toFixed(1) : "5.1";
              const skillsList = prof.skills?.length ? prof.skills : (prof.skill ? [prof.skill] : ["Worker"]);

              return (
                <div
                  key={worker.id || worker._id}
                  style={{
                    background: T.card,
                    border: `1px solid ${T.cardBorder}`,
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: isDark ? "0 2px 16px rgba(0,0,0,0.2)" : "0 2px 12px rgba(20,20,19,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                  onClick={() => handleOpenWorkerModal(worker)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = T.cardHoverShadow;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = isDark
                      ? "0 2px 16px rgba(0,0,0,0.2)"
                      : "0 2px 12px rgba(20,20,19,0.03)";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "16px" }}>
                      <img
                        src={photo}
                        alt={worker.name}
                        style={{
                          width: "72px",
                          height: "72px",
                          borderRadius: "14px",
                          objectFit: "cover",
                          border: `1.5px solid ${T.cardBorder}`,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3
                          style={{
                            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                            fontSize: "18px",
                            fontWeight: 600,
                            color: isDark ? "#f0f1f5" : "#141413",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {worker.name}
                        </h3>

                        {/* Distance Indicator */}
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap", marginTop: "4px" }}>
                          <span style={{ fontSize: "12px", color: isDark ? "#fbbf24" : "#e8a55a", fontWeight: 600 }}>
                            ⚡ {distanceKm} {t("kmAway") || "km"}
                          </span>
                        </div>

                        {/* Highlighted Skills in Transparent Pill(s) with Capital First Letter */}
                        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "8px" }}>
                          {skillsList.map((sk, sIdx) => (
                            <span
                              key={sIdx}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "2.5px 10px",
                                borderRadius: "9999px",
                                border: isDark ? "1px solid rgba(255, 255, 255, 0.16)" : "1px solid rgba(20, 20, 19, 0.14)",
                                background: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(20, 20, 19, 0.03)",
                                fontSize: "11.5px",
                                fontWeight: 500,
                                color: isDark ? "#e2e4ee" : "#2d2d2a",
                                letterSpacing: "0.01em",
                              }}
                            >
                              {getLocalizedSkill(sk)}
                            </span>
                          ))}
                        </div>

                        {/* Rating */}
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "8px" }}>
                          <Star size={13} fill="#e8a55a" color="#e8a55a" />
                          <span
                            style={{
                              fontSize: "13px",
                              fontWeight: 600,
                              color: isDark ? "#f0f1f5" : "#141413",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {rating.toFixed(1)}
                          </span>
                          <span style={{ fontSize: "12px", color: T.muted2 }}>
                            ({reviews})
                          </span>
                        </div>
                      </div>
                    </div>

                    <p
                      style={{
                        fontSize: "14px",
                        color: isDark ? "#b2b5c5" : "#3d3d3a",
                        lineHeight: 1.45,
                        margin: "0 0 20px 0",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      "{prof.bio || "Available for home repairs and local village work requests."}"
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenWorkerModal(worker);
                    }}
                    style={{
                      width: "100%",
                      padding: "11px",
                      background: T.accent,
                      color: T.accentText,
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      fontFamily: "'Inter', sans-serif",
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    <Phone size={15} /> {t("viewProfileCall")}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── LIST VIEW ── */
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filteredWorkers.map((worker) => {
              const prof = worker.workerProfile || {};
              const photo =
                prof.proofOfWork?.[0]?.url ||
                "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400";
              const rating = prof.averageRating || 4.9;
              const distanceKm = worker.calculatedDistance ? worker.calculatedDistance.toFixed(1) : "5.1";
              const skillsList = prof.skills?.length ? prof.skills : (prof.skill ? [prof.skill] : ["Worker"]);

              return (
                <div
                  key={worker.id || worker._id}
                  style={{
                    background: T.card,
                    border: `1px solid ${T.cardBorder}`,
                    borderRadius: "12px",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    cursor: "pointer",
                    transition: "background 0.12s",
                  }}
                  onClick={() => handleOpenWorkerModal(worker)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "#1a1c26" : "#f5f0e8")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = T.card)}
                >
                  <img
                    src={photo}
                    alt={worker.name}
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "10px",
                      objectFit: "cover",
                      border: `1px solid ${T.cardBorder}`,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                          fontSize: "16px",
                          fontWeight: 600,
                          color: isDark ? "#f0f1f5" : "#141413",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {worker.name}
                      </span>
                    </div>

                    {/* Skills in Transparent Pills + Details */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "5px" }}>
                      {skillsList.map((sk, sIdx) => (
                        <span
                          key={sIdx}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "2px 8px",
                            borderRadius: "9999px",
                            border: isDark ? "1px solid rgba(255, 255, 255, 0.16)" : "1px solid rgba(20, 20, 19, 0.14)",
                            background: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(20, 20, 19, 0.03)",
                            fontSize: "11px",
                            fontWeight: 500,
                            color: isDark ? "#e2e4ee" : "#2d2d2a",
                          }}
                        >
                          {getLocalizedSkill(sk)}
                        </span>
                      ))}
                      <span style={{ fontSize: "12px", color: T.muted }}>
                        · {prof.experience || 0} {t("yrsExp") || "yrs"} · {distanceKm} {t("kmAway") || "km"}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                    <Star size={13} fill="#e8a55a" color="#e8a55a" />
                    <span style={{ fontSize: "13px", fontWeight: 600, color: isDark ? "#f0f1f5" : "#141413" }}>
                      {rating.toFixed(1)}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenWorkerModal(worker);
                    }}
                    style={{
                      padding: "8px 16px",
                      background: T.accent,
                      color: T.accentText,
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {t("view")}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── WORKER PROFILE MODAL ── */}
      {activeModalWorker && (
        <div
          className="modal-backdrop-smooth"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModalWorker(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            className="modal-card-smooth"
            style={{
              background: T.card,
              border: `1px solid ${T.cardBorder}`,
              borderRadius: "16px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background: T.modalHeader,
                color: "#ffffff",
                padding: "24px",
                position: "relative",
                borderRadius: "16px 16px 0 0",
              }}
            >
              <button
                onClick={() => setActiveModalWorker(null)}
                style={{
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  color: "#ffffff",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>

              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                <img
                  src={
                    activeModalWorker.workerProfile?.proofOfWork?.[0]?.url ||
                    "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400"
                  }
                  alt={activeModalWorker.name}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "12px",
                    objectFit: "cover",
                    border: "2px solid rgba(255,255,255,0.3)",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    const proofPhotos = activeModalWorker.workerProfile?.proofOfWork?.map((p) => p.url).filter(Boolean);
                    if (proofPhotos?.length > 0) {
                      setLightboxImages(proofPhotos);
                      setLightboxIndex(0);
                    }
                  }}
                />
                <div>
                  {/* Skills highlighted in transparent pills */}
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "6px" }}>
                    {(activeModalWorker.workerProfile?.skills?.length
                      ? activeModalWorker.workerProfile.skills
                      : [activeModalWorker.workerProfile?.skill || "Worker"]
                    ).map((sk, sIdx) => (
                      <span
                        key={sIdx}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          border: "1px solid rgba(255,255,255,0.25)",
                          background: "rgba(255,255,255,0.1)",
                          fontSize: "11px",
                          fontWeight: 500,
                          color: "#ffffff",
                          letterSpacing: "0.2px",
                        }}
                      >
                        {getLocalizedSkill(sk)}
                      </span>
                    ))}
                  </div>

                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                      fontSize: "22px",
                      fontWeight: 600,
                      margin: "0 0 8px",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {activeModalWorker.name}
                  </h2>

                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "13px",
                        background: "rgba(255,255,255,0.12)",
                        padding: "3px 10px",
                        borderRadius: "32px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <MapPin size={11} />{" "}
                      {activeModalWorker.calculatedDistance ? activeModalWorker.calculatedDistance.toFixed(1) : "5.1"}{" "}
                      {t("kmAway") || "km"}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Star size={13} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontSize: "13px", fontWeight: 600 }}>
                        {activeModalWorker.workerProfile?.averageRating || 4.9}
                      </span>
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                        (
                        {activeModalWorker.workerProfile?.reviews?.length ||
                          activeModalWorker.workerProfile?.reviewCount ||
                          4}{" "}
                        {t("reviews") || "reviews"})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "24px" }}>
              <p
                style={{
                  fontSize: "14px",
                  color: isDark ? "#b2b5c5" : "#3d3d3a",
                  lineHeight: 1.55,
                  margin: "0 0 20px",
                  fontStyle: "italic",
                }}
              >
                "{activeModalWorker.workerProfile?.bio || "24/7 Service available. Best working skills, no delay work."}"
              </p>

              <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
                <a
                  href={`tel:${activeModalWorker.phone}`}
                  style={{
                    flex: 1,
                    padding: "13px",
                    background: isDark ? "#003c33" : "#181715",
                    color: "#ffffff",
                    border: isDark ? "1px solid #34d399" : "none",
                    borderRadius: "12px",
                    fontSize: "15px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    textDecoration: "none",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  <Phone size={18} /> {activeModalWorker.phone || "+91 98480 12345"}
                </a>
                <button
                  onClick={() => handleCopyPhone(activeModalWorker.phone || "+919848012345")}
                  style={{
                    padding: "13px 18px",
                    background: T.tagBg,
                    border: `1px solid ${T.cardBorder}`,
                    borderRadius: "12px",
                    cursor: "pointer",
                    color: T.ink,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                  }}
                >
                  {copiedNumber ? (
                    <>
                      <Check size={14} /> {t("copied")}
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> {t("copy")}
                    </>
                  )}
                </button>
              </div>

              {/* Tabs */}
              <div
                style={{
                  display: "flex",
                  borderBottom: `1px solid ${T.hairline}`,
                  marginBottom: "20px",
                  gap: "4px",
                }}
              >
                {[
                  { id: "services", label: t("services") || "Services", Icon: DollarSign },
                  { id: "gallery", label: t("gallery") || "Gallery", Icon: Image },
                  {
                    id: "reviews",
                    label: `${t("reviews") || "Reviews"} (${
                      activeModalWorker.workerProfile?.reviews?.length ||
                      activeModalWorker.workerProfile?.reviewCount ||
                      0
                    })`,
                    Icon: MessageSquare,
                  },
                ].map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        padding: "10px 16px",
                        background: "none",
                        border: "none",
                        borderBottom: active ? `2px solid ${T.accent}` : "2px solid transparent",
                        color: active ? T.accent : T.muted,
                        fontSize: "13px",
                        fontWeight: 500,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontFamily: "'Inter', sans-serif",
                        transition: "color 0.12s",
                      }}
                    >
                      <tab.Icon size={13} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Services Tab */}
              {activeTab === "services" && (
                <div>
                  {(
                    activeModalWorker.workerProfile?.services || [
                      { name: "Fan Repair & Fitting", price: 100 },
                      { name: "Switchboard Fitting", price: 250 },
                      { name: "Inverter Line Wiring", price: 450 },
                    ]
                  ).map((svc, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "14px 0",
                        borderBottom: `1px solid ${T.hairline}`,
                      }}
                    >
                      <span style={{ fontSize: "14px", color: isDark ? "#e0e1eb" : "#141413" }}>{svc.name}</span>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: T.deepGreen,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        ₹{svc.price}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Gallery Tab */}
              {activeTab === "gallery" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  {(
                    activeModalWorker.workerProfile?.gallery || [
                      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400",
                      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400",
                      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400",
                    ]
                  ).map((imgUrl, idx, arr) => (
                    <img
                      key={idx}
                      src={imgUrl}
                      alt="Work"
                      onClick={() => {
                        setLightboxImages(arr);
                        setLightboxIndex(idx);
                      }}
                      style={{
                        width: "100%",
                        aspectRatio: "1",
                        objectFit: "cover",
                        borderRadius: "10px",
                        cursor: "pointer",
                        border: `1px solid ${T.cardBorder}`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                    <button
                      onClick={() => setShowReviewModal(true)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 16px",
                        background: T.tagBg,
                        color: isDark ? "#34d399" : "#1863dc",
                        border: `1px solid ${isDark ? "rgba(52,211,153,0.3)" : "#1863dc"}`,
                        borderRadius: "32px",
                        fontSize: "13px",
                        cursor: "pointer",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      <Edit3 size={13} /> {t("writeReview")}
                    </button>
                  </div>
                  {(
                    activeModalWorker.workerProfile?.reviews || [
                      { customerName: "Suresh Kumar", rating: 5, comment: "very good technician", date: "May 09, 2026" },
                      {
                        customerName: "Venkatesh P",
                        rating: 5,
                        comment: "nice explanation, reasonable prices",
                        date: "Apr 07, 2026",
                      },
                    ]
                  ).map((rev, idx) => {
                    const isAuthorOrAdmin =
                      rev.customerName === currentUser?.name || currentUser?.role === "Admin";
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: "14px",
                          background: T.tagBg,
                          border: `1px solid ${T.cardBorder}`,
                          borderRadius: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "14px", fontWeight: 600, color: isDark ? "#f0f1f5" : "#141413" }}>
                              {rev.customerName}
                            </span>
                            {isAuthorOrAdmin && (
                              <button
                                type="button"
                                onClick={() => setReviewToDelete({ rev, idx })}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: isDark ? "#f87171" : "#c64545",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  padding: 0,
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                              background: isDark ? "rgba(251,191,36,0.12)" : "#fff5e6",
                              padding: "2px 8px",
                              borderRadius: "9999px",
                              border: isDark ? "1px solid rgba(251,191,36,0.2)" : "1px solid #fce3b8",
                            }}
                          >
                            <Star size={11} fill="#e8a55a" color="#e8a55a" />
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                color: isDark ? "#fbbf24" : "#141413",
                              }}
                            >
                              {rev.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <p
                          style={{
                            fontSize: "13px",
                            color: isDark ? "#b2b5c5" : "#3d3d3a",
                            margin: "0 0 4px",
                            lineHeight: 1.45,
                          }}
                        >
                          "{rev.comment}"
                        </p>
                        <div style={{ fontSize: "11px", color: T.muted2 }}>{rev.date}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── WRITE REVIEW MODAL ── */}
      {showReviewModal && (
        <div
          className="modal-backdrop-smooth"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "20px",
          }}
        >
          <div
            className="modal-card-smooth"
            style={{
              background: T.card,
              border: `1px solid ${T.cardBorder}`,
              borderRadius: "16px",
              maxWidth: "440px",
              width: "100%",
              padding: "28px",
              boxShadow: isDark ? "0 24px 60px rgba(0,0,0,0.6)" : "0 20px 40px rgba(0,0,0,0.18)",
            }}
          >
            <h3
              style={{
                fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                fontSize: "20px",
                fontWeight: 500,
                color: isDark ? "#f0f1f5" : "#141413",
                margin: "0 0 8px",
                letterSpacing: "-0.02em",
              }}
            >
              {t("writeReview")}
            </h3>
            <p style={{ fontSize: "14px", color: T.muted, marginBottom: "20px" }}>
              Share your experience with{" "}
              <strong style={{ color: isDark ? "#f0f1f5" : "#141413" }}>{activeModalWorker?.name}</strong>.
            </p>
            <form onSubmit={handleAddReviewSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: T.muted,
                    marginBottom: "8px",
                    fontFamily: "'JetBrains Mono', monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.2px",
                  }}
                >
                  {t("rating")}
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                    >
                      <Star
                        size={26}
                        fill={star <= reviewRating ? "#e8a55a" : "none"}
                        color={star <= reviewRating ? "#e8a55a" : T.hairline}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: T.muted,
                    marginBottom: "6px",
                    fontFamily: "'JetBrains Mono', monospace",
                    textTransform: "uppercase",
                    letterSpacing: "0.2px",
                  }}
                >
                  {t("yourFeedback")}
                </label>
                <textarea
                  required
                  rows="4"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={t("shareExperience")}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: T.input,
                    color: isDark ? "#e0e1eb" : "#141413",
                    border: `1px solid ${T.inputBorder}`,
                    borderRadius: "10px",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "'Inter', sans-serif",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  style={{
                    padding: "10px 18px",
                    background: T.tagBg,
                    color: T.muted,
                    border: `1px solid ${T.cardBorder}`,
                    borderRadius: "10px",
                    fontSize: "14px",
                    cursor: "pointer",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting || reviewRating === 0}
                  style={{
                    padding: "10px 18px",
                    background: reviewRating === 0 ? T.hairline : T.accent,
                    color: reviewRating === 0 ? T.muted : T.accentText,
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: reviewRating === 0 ? "not-allowed" : "pointer",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {reviewSubmitting ? t("submitting") : t("submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lightboxImages && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxImages(null)}
        />
      )}

      <ConfirmModal
        isOpen={!!reviewToDelete}
        title="Remove Review"
        message="Are you sure you want to delete this review? This will recalculate the worker's average rating."
        confirmText="Yes, Delete"
        cancelText={t("cancel") || "Cancel"}
        variant="danger"
        onCancel={() => setReviewToDelete(null)}
        onConfirm={() => {
          if (!reviewToDelete) return;
          const { rev, idx } = reviewToDelete;
          setReviewToDelete(null);
          const previousWorker = { ...activeModalWorker };
          const targetReviews = activeModalWorker.workerProfile?.reviews || [];
          const updatedReviews = targetReviews.filter((_, i) => i !== idx);
          setActiveModalWorker((prev) => ({
            ...prev,
            workerProfile: { ...prev.workerProfile, reviews: updatedReviews },
          }));
          showToast("Review removed.", "success");
          const deletePromise =
            rev._id || rev.id
              ? deleteReview(rev._id || rev.id)
              : deleteWorkerProfileReview(activeModalWorker._id || activeModalWorker.id, idx);
          deletePromise
            .then(() => {
              if (fetchUsers) fetchUsers();
            })
            .catch(() => {
              setActiveModalWorker(previousWorker);
              showToast("Could not delete review.", "error");
            });
        }}
      />
    </div>
  );
}
