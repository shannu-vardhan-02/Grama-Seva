import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket, getDistance } from "../context/SocketContext";
import { useToast } from "../context/ToastContext";
import { Search, Phone, Star, MapPin, Award, CheckCircle, X, Copy, Check, Filter, Navigation, DollarSign, Image, MessageSquare, Edit3, Crosshair, Trash2 } from "lucide-react";
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
      proofOfWork: [{ url: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=600" }],
      services: [
        { name: "Fan Repair & Fitting", price: 100 },
        { name: "Switchboard Installation", price: 250 },
        { name: "Inverter Wiring & Connection", price: 450 }
      ],
      gallery: [
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600"
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
      proofOfWork: [{ url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600" }],
      services: [
        { name: "3-Phase Submersible Starter Fix", price: 350 },
        { name: "Complete Room Wiring", price: 1200 },
        { name: "LED Ceiling Light Fitting", price: 150 }
      ],
      gallery: [
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600"
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
      proofOfWork: [{ url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600" }],
      services: [
        { name: "Tile Laying per sq ft", price: 25 },
        { name: "Wall Plastering per Day", price: 700 },
        { name: "Compound Wall Construction", price: 1500 }
      ],
      gallery: [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600"
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
      proofOfWork: [{ url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600" }],
      services: [
        { name: "Tap & Pipe Leakage Fix", price: 120 },
        { name: "Water Tank Line Cleaning", price: 400 },
        { name: "Overhead Tank Installation", price: 800 }
      ],
      gallery: [
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=600"
      ],
      reviews: [
        { customerName: "Srinivasa Reddy", rating: 5, comment: "Fixed underground PVC pipe leakage cleanly in 30 minutes.", date: "May 02, 2026" },
        { customerName: "Kishore V", rating: 5, comment: "Installed 1000L overhead water tank with booster pipes.", date: "Apr 11, 2026" }
      ]
    }
  }
];

const SKILL_CATEGORIES = [
  { id: "all", label: "All Skills", icon: "✨" },
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

  const [selectedSkill, setSelectedSkill] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortByRadius, setSortByRadius] = useState(false);
  const [userCoords, setUserCoords] = useState([78.3489, 17.2181]); // Default: Shamshabad
  const [geoStatus, setGeoStatus] = useState("idle"); // "idle" | "loading" | "granted" | "denied"

  const [activeModalWorker, setActiveModalWorker] = useState(null);
  const [activeTab, setActiveTab] = useState("services"); // "services" | "gallery" | "reviews"
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [cardStyle, setCardStyle] = useState(() => {
    try {
      return localStorage.getItem("gs_card_design") || "mist";
    } catch {
      return "mist";
    }
  });

  // Write Review State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  // Lightbox State
  const [lightboxImages, setLightboxImages] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Request geolocation on mount for accurate radius sorting
  useEffect(() => {
    if (navigator.geolocation) {
      setGeoStatus("loading");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords([pos.coords.longitude, pos.coords.latitude]);
          setGeoStatus("granted");
        },
        () => setGeoStatus("denied"),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // Also update userCoords from currentUser's stored location if available
  useEffect(() => {
    if (geoStatus === "denied" || geoStatus === "idle") {
      const loc = currentUser?.workerProfile?.location?.coordinates || currentUser?.location?.coordinates;
      if (loc && loc[0] !== 0 && loc[1] !== 0) {
        setUserCoords(loc);
      }
    }
  }, [currentUser, geoStatus]);

  const handleRequestLocation = useCallback(() => {
    if (!navigator.geolocation) { showToast("Geolocation not supported by your browser", "error"); return; }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords([pos.coords.longitude, pos.coords.latitude]);
        setGeoStatus("granted");
        showToast("Location updated! Workers sorted by distance.", "success");
        setSortByRadius(true);
      },
      () => {
        setGeoStatus("denied");
        showToast("Location permission denied. Using default location.", "error");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [showToast]);

  const debouncedSearchQuery = useDebounce(searchQuery, 250);

  const realWorkers = users.filter((u) => u.role === "Worker" && u.workerProfile?.isVerified);
  const allWorkers = realWorkers.length > 0 ? realWorkers : MOCK_TELUGU_WORKERS;

  // Filter workers with debounced search query for 60fps typing performance
  const filteredBase = useMemo(() => {
    return allWorkers.filter((w) => {
      const prof = w.workerProfile || {};
      const skillMatch = selectedSkill === "all" || prof.skill === selectedSkill || prof.skills?.includes(selectedSkill);
      const searchLower = (debouncedSearchQuery || "").toLowerCase().trim();
      if (!searchLower) return skillMatch;

      const nameMatch = w.name?.toLowerCase().includes(searchLower);
      const addressMatch = prof.address?.toLowerCase().includes(searchLower);
      const bioMatch = prof.bio?.toLowerCase().includes(searchLower);
      return skillMatch && (nameMatch || addressMatch || bioMatch);
    });
  }, [allWorkers, selectedSkill, debouncedSearchQuery]);

  // Calculate distance for workers
  const workersWithDist = useMemo(() => {
    return filteredBase.map(w => {
      const coords = w.workerProfile?.location?.coordinates;
      const hasCoords = coords && coords[0] !== 0 && coords[1] !== 0;
      const dist = hasCoords ? getDistance(userCoords, coords) : 999;
      return { ...w, calculatedDistance: dist };
    });
  }, [filteredBase, userCoords]);

  // Sort by radius if active
  const filteredWorkers = useMemo(() => {
    if (sortByRadius) {
      return [...workersWithDist].sort((a, b) => a.calculatedDistance - b.calculatedDistance);
    }
    return workersWithDist;
  }, [workersWithDist, sortByRadius]);

  const handleCopyPhone = (phone) => {
    navigator.clipboard.writeText(phone);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleOpenWorkerModal = (worker) => {
    setActiveModalWorker(worker);
    setActiveTab("services");
    setReviewRating(0);
    setReviewComment("");
  };

  const handleAddReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewComment.trim() || reviewRating === 0) return;

    const workerId = activeModalWorker._id || activeModalWorker.id;
    const previousModalWorker = { ...activeModalWorker };
    const savedComment = reviewComment;
    const savedRating = reviewRating;

    // 1. Construct optimistic review object
    const newRev = {
      customerName: currentUser?.name || "Verified Customer",
      rating: savedRating,
      comment: savedComment,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    };

    const existingReviews = activeModalWorker.workerProfile?.reviews || [];
    const updatedRevList = [newRev, ...existingReviews];
    const totalRating = updatedRevList.reduce((sum, r) => sum + Number(r.rating || 0), 0);
    const newAvg = totalRating / updatedRevList.length;

    // 2. Optimistically update local active worker modal in 0ms
    setActiveModalWorker({
      ...activeModalWorker,
      workerProfile: {
        ...activeModalWorker.workerProfile,
        reviews: updatedRevList,
        reviewCount: updatedRevList.length,
        averageRating: newAvg,
      },
    });

    // 3. Immediately close modal and reset inputs — zero perceived latency!
    setShowReviewModal(false);
    setReviewComment("");
    setReviewRating(0);
    showToast("Review submitted successfully!", "success");

    // 4. Perform network request in background
    if (workerId && !String(workerId).startsWith("tw-")) {
      submitWorkerReview(workerId, savedRating, savedComment)
        .then(() => {
          if (fetchUsers) fetchUsers();
        })
        .catch((err) => {
          // 5. Rollback on failure
          setActiveModalWorker(previousModalWorker);
          showToast(err.message || "Failed to submit review", "error");
        });
    }
  };

  return (
    <div className="bookservice-page-padding" style={{ background: "var(--ch-canvas)", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      {/* ── SEARCH & FILTER BAR ── */}
      <div style={{ 
        borderBottom: "1px solid var(--ch-hairline)", 
        padding: "20px 24px",
        background: "var(--ch-canvas)",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              flex: "1 1 300px",
              position: "relative"
            }}>
              <Search size={18} color="var(--ch-muted)" style={{ position: "absolute", left: "14px" }} />
              <input
                type="text"
                placeholder="Search by name, village, or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  width: "100%",
                  background: "var(--ch-input-bg)",
                  border: "1px solid var(--ch-hairline)", 
                  borderRadius: "8px", 
                  padding: "10px 14px 10px 40px", 
                  fontSize: "14px", 
                  color: "var(--ch-ink)",
                  outline: "none",
                  fontFamily: "'Inter', sans-serif"
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--ch-action-blue)"}
                onBlur={(e) => e.target.style.borderColor = "var(--ch-hairline)"}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", color: "var(--ch-muted)" }}>
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                if (!sortByRadius && geoStatus !== "granted") {
                  handleRequestLocation();
                } else {
                  setSortByRadius(!sortByRadius);
                }
              }}
              style={{
                padding: "10px 16px",
                background: sortByRadius ? "var(--ch-deep-green)" : "var(--ch-canvas)",
                color: sortByRadius ? "var(--ch-canvas)" : "var(--ch-ink)",
                border: `1px solid ${sortByRadius ? "var(--ch-deep-green)" : "var(--ch-hairline)"}`,
                borderRadius: "8px",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              {geoStatus === "loading" ? (
                <><Crosshair size={16} className="animate-spin" /> Locating...</>
              ) : (
                <><Navigation size={16} /> Sort by Distance {sortByRadius && "✓"}</>
              )}
            </button>
            {geoStatus === "denied" && (
              <button
                onClick={handleRequestLocation}
                style={{
                  padding: "10px 16px", background: "var(--ch-coral-soft)", color: "var(--ch-coral)",
                  border: "none", borderRadius: "8px", fontSize: "14px",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
                }}
              >
                <Crosshair size={14} /> Enable Location
              </button>
            )}
            {(searchQuery || selectedSkill !== "all") && (
              <button
                onClick={() => { setSearchQuery(""); setSelectedSkill("all"); }}
                style={{ background: "none", border: "none", color: "var(--ch-action-blue)", fontSize: "14px", cursor: "pointer", padding: "10px" }}
              >
                Clear all
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }} className="hide-scrollbar">
            {SKILL_CATEGORIES.map((cat) => {
              const active = selectedSkill === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedSkill(cat.id)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 14px",
                    borderRadius: "32px",
                    fontSize: "13px",
                    background: active ? "var(--ch-deep-green)" : "var(--ch-canvas)",
                    color: active ? "var(--ch-canvas)" : "var(--ch-body-muted)",
                    border: `1px solid ${active ? "var(--ch-deep-green)" : "var(--ch-hairline)"}`,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── WORKERS LIST ── */}
      <div style={{ maxWidth: "1200px", margin: "32px auto", padding: "0 24px" }}>
        
        {filteredWorkers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 24px" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.2px", color: "var(--ch-muted)", fontSize: "12px", marginBottom: "16px" }}>
              Directory Empty
            </div>
            <h3 style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "24px", color: "var(--ch-ink)", fontWeight: 400, letterSpacing: "-0.02em", margin: "0 0 12px" }}>
              No matching workers found
            </h3>
            <p style={{ fontSize: "15px", color: "var(--ch-body-muted)", marginBottom: "24px" }}>
              Try adjusting your search or filter criteria.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedSkill("all"); }}
              style={{ padding: "10px 20px", background: "var(--ch-primary)", color: "var(--ch-canvas)", border: "none", borderRadius: "9999px", fontSize: "14px", cursor: "pointer" }}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 260px))", gap: "16px", justifyContent: "start" }}>
            {filteredWorkers.map((worker) => {
              const prof = worker.workerProfile || {};
              const photo = prof.proofOfWork?.[0]?.url || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=600";
              const rating = prof.averageRating || 4.9;
              const reviews = prof.reviewCount || 12;
              const distanceKm = worker.calculatedDistance ? worker.calculatedDistance.toFixed(1) : "5.1";
              const skillLabel = (prof.skill || "worker").charAt(0).toUpperCase() + (prof.skill || "worker").slice(1);

              return (
                <div
                  key={worker.id || worker._id}
                  onClick={() => handleOpenWorkerModal(worker)}
                  style={{
                    background: "#1c1c1e",
                    borderRadius: "20px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    transition: "transform 0.18s, box-shadow 0.18s",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.28)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.18)";
                  }}
                >
                  {/* ── Photo Zone ── */}
                  <div style={{ height: "200px", position: "relative", overflow: "hidden" }}>
                    <img
                      src={photo}
                      alt={worker.name}
                      style={{
                        width: "100%", height: "100%", objectFit: "cover",
                        borderRadius: "16px 16px 0 0",
                        display: "block",
                      }}
                    />
                    {/* Gradient fade into card bottom */}
                    <div style={{
                      position: "absolute", bottom: 0, left: 0, right: 0,
                      height: "50%",
                      background: "linear-gradient(to bottom, transparent 0%, #1c1c1e 100%)",
                      pointerEvents: "none",
                    }} />
                    {/* Skill mono label top-left */}
                    <div style={{
                      position: "absolute", top: "12px", left: "12px",
                      background: "rgba(0,0,0,0.5)",
                      backdropFilter: "blur(8px)",
                      borderRadius: "99px",
                      padding: "3px 10px",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "10px",
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.8)",
                      letterSpacing: "0.2px",
                      textTransform: "uppercase",
                    }}>
                      {skillLabel}
                    </div>
                  </div>

                  {/* ── Content ── */}
                  <div style={{ padding: "4px 16px 16px" }}>
                    {/* Name + verified */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                      <span style={{
                        fontFamily: "'Space Grotesk', 'Inter', sans-serif",
                        fontSize: "16px", fontWeight: 600, color: "#ffffff",
                        letterSpacing: "-0.02em",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        flex: 1,
                      }}>
                        {worker.name}
                      </span>
                      {prof.isVerified && (
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                          <circle cx="10" cy="10" r="10" fill="#22c55e" />
                          <path d="M6 10.5l2.5 2.5 5.5-5.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    {/* Bio */}
                    <p style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "12.5px", color: "rgba(255,255,255,0.5)",
                      lineHeight: 1.45, margin: "0 0 14px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}>
                      {prof.bio || `${prof.experience || 0}-year ${skillLabel} serving village communities.`}
                    </p>

                    {/* Stats row + Call button */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {/* Rating */}
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <svg width="13" height="13" viewBox="0 0 20 20" fill="#f59e0b"><path d="M10 1l2.63 5.33L18.5 7.27l-4.25 4.14 1 5.84L10 14.77l-5.25 2.48 1-5.84L1.5 7.27l5.87-.94z"/></svg>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: "12.5px", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{rating.toFixed(1)}</span>
                      </div>
                      {/* Distance */}
                      <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                        <MapPin size={11} color="rgba(255,255,255,0.4)" />
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10.5px", color: "rgba(255,255,255,0.4)", letterSpacing: "0.1px" }}>{distanceKm} km</span>
                      </div>
                      {/* Experience */}
                      <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                        <Award size={11} color="rgba(255,255,255,0.4)" />
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10.5px", color: "rgba(255,255,255,0.4)" }}>{prof.experience || 0}y</span>
                      </div>
                      {/* Spacer + Call pill */}
                      <div style={{ flex: 1 }} />
                      <button
                        onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${worker.phone}`; }}
                        style={{
                          background: "#ffffff", color: "#17171c",
                          border: "none", borderRadius: "99px",
                          padding: "7px 14px",
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "12.5px", fontWeight: 600,
                          cursor: "pointer", whiteSpace: "nowrap",
                          display: "flex", alignItems: "center", gap: "4px",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f0f0f0"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#ffffff"}
                      >
                        <Phone size={11} />
                        Call
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        )}
      </div>

      {/* ── WORKER PROFILE POP-UP MODAL ── */}
      {activeModalWorker && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModalWorker(null);
          }}
          style={{
            position: "fixed", inset: 0, background: "rgba(23,23,28,0.5)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px"
          }}
        >
          <div style={{ background: "var(--ch-canvas)", borderRadius: "8px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", border: "1px solid var(--ch-hairline)" }} onClick={(e) => e.stopPropagation()}>
            {/* Header Band */}
            <div style={{ background: "var(--ch-deep-green)", color: "var(--ch-canvas)", padding: "24px", position: "relative" }}>
              <button
                onClick={() => setActiveModalWorker(null)}
                style={{
                  position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.2)", border: "none", color: "var(--ch-canvas)",
                  borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
                }}
              >
                <X size={18} />
              </button>
              
              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                <img
                  src={activeModalWorker.workerProfile?.proofOfWork?.[0]?.url || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400"}
                  alt={activeModalWorker.name}
                  style={{ width: "80px", height: "80px", borderRadius: "8px", objectFit: "cover", border: "2px solid var(--ch-canvas)" }}
                />
                <div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2px", marginBottom: "4px", color: "rgba(255,255,255,0.7)" }}>
                    {activeModalWorker.workerProfile?.skill || "Worker"}
                  </div>
                  <h2 style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "24px", fontWeight: 500, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                    {activeModalWorker.name}
                  </h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "13px", background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "32px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={12} /> {activeModalWorker.calculatedDistance ? activeModalWorker.calculatedDistance.toFixed(1) : "5.1"} km
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontSize: "14px", fontWeight: 500 }}>
                        {activeModalWorker.workerProfile?.averageRating || 4.9}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                <button
                  onClick={() => window.location.href = `tel:${activeModalWorker.phone}`}
                  style={{ flex: 1, padding: "12px", background: "var(--ch-primary)", color: "var(--ch-canvas)", border: "none", borderRadius: "32px", fontSize: "14px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                >
                  <Phone size={16} /> {activeModalWorker.phone}
                </button>
              </div>

              {/* TABS */}
              <div style={{ display: "flex", borderBottom: "1px solid var(--ch-hairline)", marginBottom: "20px" }}>
                {[
                  { id: "services", label: "Services" },
                  { id: "gallery", label: "Gallery" },
                  { id: "reviews", label: "Reviews" },
                ].map((tab) => {
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        flex: 1, padding: "12px", background: "none", border: "none",
                        borderBottom: active ? "2px solid var(--ch-action-blue)" : "2px solid transparent",
                        color: active ? "var(--ch-action-blue)" : "var(--ch-muted)",
                        fontSize: "14px", fontWeight: 500, cursor: "pointer"
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* SERVICES TAB */}
              {activeTab === "services" && (
                <div>
                  {(activeModalWorker.workerProfile?.services || [
                    { name: "Fan Repair & Fitting", price: 100 }
                  ]).map((svc, idx) => (
                    <div key={idx} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "16px 0", borderBottom: "1px solid var(--ch-hairline)"
                    }}>
                      <span style={{ fontSize: "14px", color: "var(--ch-ink)" }}>{svc.name}</span>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--ch-deep-green)" }}>₹{svc.price}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* GALLERY TAB */}
              {activeTab === "gallery" && (
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {(activeModalWorker.workerProfile?.gallery || []).map((imgUrl, idx, arr) => (
                    <img
                      key={idx} src={imgUrl} alt="Work"
                      onClick={() => { setLightboxImages(arr); setLightboxIndex(idx); }}
                      style={{ width: "48px", height: "48px", borderRadius: "4px", objectFit: "cover", cursor: "pointer" }}
                    />
                  ))}
                </div>
              )}

              {/* REVIEWS TAB */}
              {activeTab === "reviews" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                    <button
                      onClick={() => setShowReviewModal(true)}
                      style={{ padding: "8px 16px", background: "var(--ch-canvas)", color: "var(--ch-action-blue)", border: "1px solid var(--ch-action-blue)", borderRadius: "32px", fontSize: "13px", cursor: "pointer" }}
                    >
                      Write Review
                    </button>
                  </div>
                  {(activeModalWorker.workerProfile?.reviews || []).map((rev, idx) => (
                    <div key={idx} style={{ padding: "16px 0", borderBottom: "1px solid var(--ch-hairline)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 500 }}>{rev.customerName}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Star size={12} fill="#f59e0b" color="#f59e0b" />
                          <span style={{ fontSize: "13px", fontWeight: 500 }}>{rev.rating}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: "14px", color: "var(--ch-body-muted)", margin: "0 0 4px" }}>{rev.comment}</p>
                      <div style={{ fontSize: "12px", color: "var(--ch-muted)" }}>{rev.date}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── WRITE REVIEW POP-UP MODAL ── */}
      {showReviewModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(23,23,28,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "20px" }}>
          <div style={{ background: "var(--ch-canvas)", borderRadius: "8px", maxWidth: "440px", width: "100%", padding: "24px", border: "1px solid var(--ch-hairline)", boxShadow: "0 16px 40px rgba(0,0,0,0.3)" }}>
            <h3 style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "20px", color: "var(--ch-primary)", margin: "0 0 16px" }}>Write a Review</h3>
            <form onSubmit={handleAddReviewSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setReviewRating(star)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                      <Star size={24} fill={star <= reviewRating ? "#f59e0b" : "none"} color={star <= reviewRating ? "#f59e0b" : "var(--ch-hairline)"} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                required rows="4" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience..."
                style={{ width: "100%", padding: "12px", background: "var(--ch-input-bg)", color: "var(--ch-ink)", border: "1px solid var(--ch-hairline)", borderRadius: "8px", marginBottom: "16px", fontFamily: "'Inter', sans-serif", outline: "none", boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowReviewModal(false)} style={{ padding: "8px 16px", border: "1px solid var(--ch-hairline)", borderRadius: "32px", background: "transparent", color: "var(--ch-body-muted)", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={reviewSubmitting || reviewRating === 0} style={{ padding: "8px 16px", background: "var(--ch-primary)", color: "var(--ch-canvas)", border: "none", borderRadius: "32px", cursor: "pointer" }}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lightboxImages && <ImageLightbox images={lightboxImages} initialIndex={lightboxIndex} onClose={() => setLightboxImages(null)} />}

      <ConfirmModal
        isOpen={!!reviewToDelete}
        title="Remove Review" message="Are you sure?"
        onCancel={() => setReviewToDelete(null)}
        onConfirm={() => {
          if (!reviewToDelete) return;
          const { rev, idx } = reviewToDelete;
          setReviewToDelete(null);
          const deletePromise = (rev._id || rev.id) ? deleteReview(rev._id || rev.id) : deleteWorkerProfileReview(activeModalWorker._id || activeModalWorker.id, idx);
          deletePromise.catch(err => showToast("Could not delete", "error"));
        }}
      />
    </div>
  );
}
