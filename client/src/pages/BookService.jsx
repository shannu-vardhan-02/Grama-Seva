import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket, getDistance } from "../context/SocketContext";
import { useToast } from "../context/ToastContext";
import { Search, Phone, Star, MapPin, Award, CheckCircle, X, Copy, Check, Filter, Navigation, DollarSign, Image, MessageSquare, Edit3, Crosshair } from "lucide-react";

// Rich Andhra / Telugu Seed Workers with Services, Gallery & Reviews
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
      averageRating: 5.0,
      reviewCount: 4,
      proofOfWork: [{ url: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400" }],
      services: [
        { name: "Fan Repair & Fitting", price: 100 },
        { name: "Switchboard Installation", price: 250 },
        { name: "Inverter Wiring & Connection", price: 450 },
        { name: "Motor Starter Replacement", price: 300 }
      ],
      gallery: [
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400"
      ],
      reviews: [
        { customerName: "Suresh Kumar", rating: 5, comment: "Very good technician", date: "May 09, 2026" },
        { customerName: "Venkatesh P", rating: 5, comment: "Nice explanation, reasonable prices. Keep in touch!", date: "Apr 07, 2026" },
        { customerName: "Naresh Reddy", rating: 5, comment: "Arrived on time in village within 15 minutes. Great work.", date: "Feb 14, 2026" }
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
      reviewCount: 18,
      proofOfWork: [{ url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400" }],
      services: [
        { name: "3-Phase Submersible Starter Fix", price: 350 },
        { name: "Complete Room Wiring", price: 1200 },
        { name: "LED Ceiling Light Fitting", price: 150 }
      ],
      gallery: [
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400"
      ],
      reviews: [
        { customerName: "Koti Rao", rating: 5, comment: "Prompt response and clean wiring work.", date: "Jun 12, 2026" }
      ]
    }
  },
  {
    id: "tw-3",
    name: "Ghouse Electrician & Appliances",
    phone: "+91 99892 34567",
    role: "Worker",
    workerProfile: {
      skill: "electrician",
      skills: ["electrician"],
      experience: 7,
      address: "Panchayat Junction",
      location: { type: "Point", coordinates: [78.3429, 17.2301] },
      bio: "Electrician house wiring, main line board shift, and short circuit emergency solving.",
      isVerified: true,
      averageRating: 4.7,
      reviewCount: 12,
      proofOfWork: [{ url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400" }],
      services: [
        { name: "Short Circuit Line Inspection", price: 200 },
        { name: "Main Board MCB Replacement", price: 250 }
      ],
      gallery: [
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400"
      ],
      reviews: [
        { customerName: "Subbaiah", rating: 4, comment: "Good service in our village.", date: "May 20, 2026" }
      ]
    }
  },
  {
    id: "tw-4",
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
      reviewCount: 22,
      proofOfWork: [{ url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400" }],
      services: [
        { name: "Tile Laying per sq ft", price: 25 },
        { name: "Wall Plastering per Day", price: 700 },
        { name: "Compound Wall Construction", price: 1500 }
      ],
      gallery: [
        "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&q=80&w=400"
      ],
      reviews: [
        { customerName: "Prasad Raju", rating: 5, comment: "Excellent masonry work done for my new house.", date: "Jan 18, 2026" }
      ]
    }
  },
  {
    id: "tw-5",
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
      reviewCount: 15,
      proofOfWork: [{ url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400" }],
      services: [
        { name: "Tap & Pipe Leakage Fix", price: 120 },
        { name: "Water Tank Line Cleaning", price: 400 },
        { name: "Overhead Tank Installation", price: 800 }
      ],
      gallery: [
        "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=400"
      ],
      reviews: [
        { customerName: "Venkateswarlu", rating: 5, comment: "Fixed pipe leak immediately.", date: "Apr 02, 2026" }
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
  const { submitWorkerReview } = useSocket();
  const { showToast } = useToast();

  const [selectedSkill, setSelectedSkill] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortByRadius, setSortByRadius] = useState(false);
  const [userCoords, setUserCoords] = useState([78.3489, 17.2181]); // Default: Shamshabad
  const [geoStatus, setGeoStatus] = useState("idle"); // "idle" | "loading" | "granted" | "denied"

  const [activeModalWorker, setActiveModalWorker] = useState(null);
  const [activeTab, setActiveTab] = useState("services"); // "services" | "gallery" | "reviews"
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Write Review State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

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

  const realWorkers = users.filter((u) => u.role === "Worker" && u.workerProfile?.isVerified);
  const allWorkers = realWorkers.length > 0 ? realWorkers : MOCK_TELUGU_WORKERS;

  // Filter workers
  const filteredBase = useMemo(() => {
    return allWorkers.filter((w) => {
      const prof = w.workerProfile || {};
      const skillMatch = selectedSkill === "all" || prof.skill === selectedSkill || prof.skills?.includes(selectedSkill);
      const searchLower = searchQuery.toLowerCase();
      const nameMatch = w.name?.toLowerCase().includes(searchLower);
      const addressMatch = prof.address?.toLowerCase().includes(searchLower);
      const bioMatch = prof.bio?.toLowerCase().includes(searchLower);
      return skillMatch && (nameMatch || addressMatch || bioMatch);
    });
  }, [allWorkers, selectedSkill, searchQuery]);

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

  const handleAddReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim() || reviewRating === 0) return;
    setReviewSubmitting(true);
    try {
      const workerId = activeModalWorker._id || activeModalWorker.id;
      if (workerId && !String(workerId).startsWith("tw-")) {
        await submitWorkerReview(workerId, reviewRating, reviewComment);
        // Refetch users so the new review appears in users array & across all pages
        if (fetchUsers) await fetchUsers();
      }
      // Optimistically add review to local worker modal
      const newRev = {
        customerName: currentUser?.name || "Verified Customer",
        rating: reviewRating,
        comment: reviewComment,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
      };
      const updatedRevList = [newRev, ...(activeModalWorker.workerProfile?.reviews || [])];
      setActiveModalWorker({
        ...activeModalWorker,
        workerProfile: {
          ...activeModalWorker.workerProfile,
          reviews: updatedRevList,
          reviewCount: updatedRevList.length
        }
      });
      showToast("Review submitted successfully!", "success");
      setShowReviewModal(false);
      setReviewComment("");
      setReviewRating(0);
    } catch (err) {
      showToast(err.message || "Failed to submit review", "error");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "40px 24px", background: "#faf9f5", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      {/* ── HEADER ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto 32px" }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "36px", fontWeight: 400, color: "#141413", letterSpacing: "-0.02em" }}>
          Search Local Skilled Workers
        </div>
        <p style={{ fontSize: "15px", color: "#6c6a64", marginTop: "6px" }}>
          Browse administrator-verified workers in your village area, inspect services & pricing, and contact them directly.
        </p>
      </div>

      {/* ── SEARCH, LOCATION & SORT BY RADIUS ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto 32px" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "20px" }}>
          {/* Search Input */}
          <div style={{
            flex: 1,
            minWidth: "280px",
            display: "flex",
            alignItems: "center",
            background: "#ffffff",
            border: "1px solid #e6dfd8",
            borderRadius: "12px",
            padding: "12px 18px",
            boxShadow: "0 2px 12px rgba(20,20,19,0.03)",
          }}>
            <Search size={20} color="#8e8b82" style={{ marginRight: "12px" }} />
            <input
              type="text"
              placeholder="Search by name, village location, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "15px", color: "#141413" }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#8e8b82" }}>
                <X size={18} />
              </button>
            )}
          </div>

          {/* Sort by Radius Toggle */}
          <button
            onClick={() => {
              if (!sortByRadius && geoStatus !== "granted") {
                handleRequestLocation();
              } else {
                setSortByRadius(!sortByRadius);
              }
            }}
            style={{
              padding: "12px 20px",
              background: sortByRadius ? "#cc785c" : "#ffffff",
              color: sortByRadius ? "#ffffff" : "#141413",
              border: sortByRadius ? "none" : "1px solid #e6dfd8",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              boxShadow: "0 2px 12px rgba(20,20,19,0.03)",
              transition: "all 0.15s",
            }}
          >
            {geoStatus === "loading" ? (
              <><Crosshair size={16} className="animate-spin" /> Locating...</>
            ) : (
              <><Navigation size={16} /> Sort by Radius {sortByRadius && "✓"}</>
            )}
          </button>
          {geoStatus === "denied" && (
            <button
              onClick={handleRequestLocation}
              style={{
                padding: "12px 16px", background: "#fff5e6", color: "#c07000",
                border: "1px solid #fce3b8", borderRadius: "12px", fontSize: "13px",
                fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px",
              }}
            >
              <Crosshair size={14} /> Enable Location
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "8px" }}>
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
                  padding: "10px 18px",
                  borderRadius: "9999px",
                  fontSize: "14px",
                  fontWeight: active ? 600 : 400,
                  background: active ? "#cc785c" : "#efe9de",
                  color: active ? "#ffffff" : "#141413",
                  border: active ? "none" : "1px solid #e6dfd8",
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

      {/* ── WORKERS LIST ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#6c6a64", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "20px" }}>
          Available Verified Workers ({filteredWorkers.length})
        </div>

        {filteredWorkers.length === 0 ? (
          <div style={{ background: "#efe9de", borderRadius: "16px", padding: "48px", textAlign: "center", border: "1px solid #e6dfd8" }}>
            <Filter size={36} color="#8e8b82" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", color: "#141413" }}>No matching workers</h3>
            <p style={{ fontSize: "15px", color: "#6c6a64", marginTop: "6px" }}>Try clearing your search filters or choosing another skill.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
            {filteredWorkers.map((worker) => {
              const prof = worker.workerProfile || {};
              const photo = prof.proofOfWork?.[0]?.url || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400";
              const rating = prof.averageRating || 4.9;
              const reviews = prof.reviewCount || 12;
              const distanceKm = worker.calculatedDistance ? worker.calculatedDistance.toFixed(1) : "5.1";
              const skillDisplay = prof.skills?.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(", ") || prof.skill || "Electrician";

              return (
                <div
                  key={worker.id || worker._id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e6dfd8",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 2px 12px rgba(20,20,19,0.03)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                  onClick={() => handleOpenWorkerModal(worker)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(20,20,19,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 12px rgba(20,20,19,0.03)";
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "16px" }}>
                      <img
                        src={photo}
                        alt={worker.name}
                        style={{ width: "72px", height: "72px", borderRadius: "14px", objectFit: "cover", border: "1.5px solid #e6dfd8", flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "20px", fontWeight: 600, color: "#141413", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {worker.name}
                        </h3>

                        {/* Badges */}
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap", marginTop: "4px" }}>
                          <span style={{ fontSize: "12px", color: "#cc785c", fontWeight: 600 }}>✔ Verified</span>
                          <span style={{ fontSize: "12px", color: "#8e8b82" }}>•</span>
                          <span style={{ fontSize: "12px", color: "#e8a55a", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                            ⚡ {distanceKm} km away
                          </span>
                        </div>

                        <div style={{ fontSize: "13px", color: "#6c6a64", marginTop: "4px", fontWeight: 500 }}>
                          {skillDisplay}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "6px" }}>
                          <Star size={14} fill="#e8a55a" color="#e8a55a" />
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#141413", fontVariantNumeric: "tabular-nums" }}>{rating.toFixed(1)}</span>
                          <span style={{ fontSize: "12px", color: "#8e8b82" }}>({reviews})</span>
                        </div>
                      </div>
                    </div>

                    <p style={{
                      fontSize: "14px", color: "#3d3d3a", lineHeight: 1.45, margin: "0 0 20px 0",
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                    }}>
                      "{prof.bio || "Available for home repairs and local village work requests."}"
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenWorkerModal(worker);
                    }}
                    style={{
                      width: "100%", padding: "11px 16px", background: "#cc785c", color: "#ffffff",
                      border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 500,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer",
                    }}
                  >
                    View Profile & Call Now
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── WORKER PROFILE POP-UP MODAL (Services, Gallery, Reviews Tabs) ── */}
      {activeModalWorker && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(24,23,21,0.65)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px"
        }}>
          <div style={{
            background: "#ffffff", border: "1px solid #e6dfd8", borderRadius: "20px",
            maxWidth: "560px", width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "32px", position: "relative",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
          }}>
            {/* Close Button */}
            <button
              onClick={() => setActiveModalWorker(null)}
              style={{
                position: "absolute", top: "20px", right: "20px", background: "#faf9f5", border: "1px solid #e6dfd8",
                borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
              }}
            >
              <X size={18} />
            </button>

            {/* Header Info */}
            <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", marginBottom: "20px" }}>
              <img
                src={activeModalWorker.workerProfile?.proofOfWork?.[0]?.url || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400"}
                alt={activeModalWorker.name}
                style={{ width: "88px", height: "88px", borderRadius: "16px", objectFit: "cover", border: "2px solid #cc785c", flexShrink: 0 }}
              />
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "24px", fontWeight: 600, color: "#141413", margin: 0 }}>
                  {activeModalWorker.name}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
                  <span style={{ fontSize: "13px", color: "#cc785c", fontWeight: 600 }}>✔ Admin Verified</span>
                  <span style={{ fontSize: "13px", color: "#e8a55a", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                    ⚡ {activeModalWorker.calculatedDistance ? activeModalWorker.calculatedDistance.toFixed(1) : "5.1"} km away
                  </span>
                </div>
                <div style={{ fontSize: "14px", color: "#6c6a64", marginTop: "4px" }}>
                  {activeModalWorker.workerProfile?.skills?.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(", ") || activeModalWorker.workerProfile?.skill || "Electrician"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "6px" }}>
                  <Star size={16} fill="#e8a55a" color="#e8a55a" />
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#141413", fontVariantNumeric: "tabular-nums" }}>
                    {activeModalWorker.workerProfile?.averageRating || 4.9}
                  </span>
                  <span style={{ fontSize: "13px", color: "#8e8b82" }}>
                    ({activeModalWorker.workerProfile?.reviews?.length || activeModalWorker.workerProfile?.reviewCount || 4} ratings)
                  </span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: "14px", color: "#3d3d3a", lineHeight: 1.5, marginBottom: "20px" }}>
              "{activeModalWorker.workerProfile?.bio || "24/7 Service available. Best working skills, no delay work."}"
            </p>

            {/* CALL NOW BUTTON & PHONE STRIP */}
            <div style={{ background: "#181715", color: "#faf9f5", borderRadius: "14px", padding: "18px", marginBottom: "24px", textAlign: "center" }}>
              <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", color: "#a09d96", marginBottom: "4px" }}>
                Direct Contact Phone Number
              </div>
              <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", fontSize: "22px", color: "#faf9f5", marginBottom: "12px", fontVariantNumeric: "tabular-nums", fontWeight: 600, letterSpacing: "0.02em" }}>
                {activeModalWorker.phone || "+91 98480 12345"}
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <a
                  href={`tel:${activeModalWorker.phone || "+919848012345"}`}
                  style={{
                    flex: 1, padding: "11px", background: "#cc785c", color: "#ffffff", borderRadius: "8px",
                    fontWeight: 600, fontSize: "15px", textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px"
                  }}
                >
                  <Phone size={16} /> Call Now
                </a>
                <button
                  onClick={() => handleCopyPhone(activeModalWorker.phone || "+919848012345")}
                  style={{
                    padding: "11px 18px", background: "#252320", color: "#faf9f5", border: "1px solid #3d3d3a",
                    borderRadius: "8px", fontWeight: 500, fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                  }}
                >
                  {copiedNumber ? <Check size={16} color="#5db872" /> : <Copy size={16} />}
                  {copiedNumber ? "Copied" : "Copy"}
                </button>
              </div>
            </div>

            {/* ── PROFILE TABS: Services | Gallery | Reviews ── */}
            <div style={{ display: "flex", borderBottom: "1px solid #e6dfd8", marginBottom: "20px" }}>
              {[
                { id: "services", label: "Services", icon: "💲" },
                { id: "gallery", label: "Gallery", icon: "🖼️" },
                { id: "reviews", label: "Reviews", icon: "💬" },
              ].map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "none",
                      border: "none",
                      borderBottom: active ? "2.5px solid #cc785c" : "2.5px solid transparent",
                      color: active ? "#cc785c" : "#6c6a64",
                      fontSize: "14px",
                      fontWeight: active ? 600 : 400,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.15s"
                    }}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: SERVICES */}
            {activeTab === "services" && (
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#8e8b82", textTransform: "uppercase", marginBottom: "12px" }}>
                  Services & Pricing List
                </div>
                {(activeModalWorker.workerProfile?.services || [
                  { name: "Fan Repair & Fitting", price: 100 },
                  { name: "Switchboard Fitting", price: 250 },
                  { name: "Inverter Line Wiring", price: 450 }
                ]).map((svc, idx) => (
                  <div key={idx} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 16px", background: "#faf9f5", border: "1px solid #e6dfd8", borderRadius: "10px", marginBottom: "8px"
                  }}>
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "#141413" }}>{svc.name}</span>
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "#cc785c", fontVariantNumeric: "tabular-nums" }}>₹{svc.price}</span>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: GALLERY */}
            {activeTab === "gallery" && (
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#8e8b82", textTransform: "uppercase", marginBottom: "12px" }}>
                  Work Photos & Pictures
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  {(activeModalWorker.workerProfile?.gallery || [
                    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400",
                    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400",
                    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400"
                  ]).map((imgUrl, idx) => (
                    <div key={idx} style={{ borderRadius: "10px", overflow: "hidden", aspectRatio: "1", border: "1px solid #e6dfd8" }}>
                      <img src={imgUrl} alt="Work example" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: REVIEWS */}
            {activeTab === "reviews" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "#141413" }}>Customer Reviews</div>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    style={{
                      padding: "8px 14px", background: "#cc785c", color: "#ffffff", border: "none",
                      borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px"
                    }}
                  >
                    <Edit3 size={14} /> Write Review
                  </button>
                </div>

                {(activeModalWorker.workerProfile?.reviews || [
                  { customerName: "Suresh Kumar", rating: 5, comment: "very good techian", date: "May 09, 2026" },
                  { customerName: "Venkatesh P", rating: 5, comment: "nice Explanation reasonable Prices keep in touch", date: "Apr 07, 2026" }
                ]).map((rev, idx) => (
                  <div key={idx} style={{ padding: "16px", background: "#faf9f5", border: "1px solid #e6dfd8", borderRadius: "12px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "#141413" }}>{rev.customerName}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#fff5e6", padding: "2px 8px", borderRadius: "9999px", border: "1px solid #fce3b8" }}>
                        <Star size={12} fill="#e8a55a" color="#e8a55a" />
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#141413", fontVariantNumeric: "tabular-nums" }}>{rev.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: "14px", color: "#3d3d3a", margin: "0 0 6px 0", lineHeight: 1.4 }}>"{rev.comment}"</p>
                    <div style={{ fontSize: "11px", color: "#8e8b82" }}>{rev.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── WRITE REVIEW POP-UP MODAL ── */}
      {showReviewModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(24,23,21,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: "20px" }}>
          <div style={{ background: "#ffffff", border: "1px solid #e6dfd8", borderRadius: "16px", maxWidth: "440px", width: "100%", padding: "28px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "22px", color: "#141413", marginBottom: "8px" }}>
              Write a Customer Review
            </h3>
            <p style={{ fontSize: "14px", color: "#6c6a64", marginBottom: "20px" }}>
              Share your experience with <strong>{activeModalWorker?.name}</strong> to help the village community.
            </p>



            <form onSubmit={handleAddReviewSubmit}>
              {/* Star Rating Picker */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#141413", marginBottom: "8px" }}>Select Star Rating</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
                    >
                      <Star size={26} fill={star <= reviewRating ? "#e8a55a" : "none"} color={star <= reviewRating ? "#e8a55a" : "#e6dfd8"} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Textbox */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#141413", marginBottom: "6px" }}>Your Review & Feedback</label>
                <textarea
                  required
                  rows="4"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details of your experience, work quality, and timeliness..."
                  style={{ width: "100%", padding: "10px 14px", background: "#faf9f5", border: "1px solid #e6dfd8", borderRadius: "8px", fontSize: "14px", outline: "none", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  style={{ padding: "10px 18px", background: "#efe9de", color: "#141413", border: "1px solid #e6dfd8", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting || reviewRating === 0}
                  style={{ padding: "10px 18px", background: reviewRating === 0 ? "#e6dfd8" : "#cc785c", color: reviewRating === 0 ? "#8e8b82" : "#ffffff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: reviewRating === 0 ? "not-allowed" : "pointer" }}
                >
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
