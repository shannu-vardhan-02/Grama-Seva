import React from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { Star, MessageSquare } from "lucide-react";

export default function Reviews() {
  const { currentUser, users } = useAuth();
  const { reviews: bookingReviews } = useSocket();

  if (!currentUser) return null;

  // Gather reviews from both sources:
  // 1. Booking-based reviews from SocketContext
  // 2. Worker-profile-based reviews from users array (stored in workerProfile.reviews)

  let displayReviews = [];

  if (currentUser.role === "Customer") {
    // Show booking-based reviews from SocketContext
    const bookingBased = bookingReviews.filter((r) => r.customer === currentUser.id || r.customer === currentUser._id);
    displayReviews = bookingBased.map(r => ({
      id: r._id || r.id,
      customerName: r.customerName || currentUser.name,
      workerName: r.workerName || "Worker",
      rating: r.rating,
      comment: r.comment,
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "",
      source: "booking"
    }));

    // Also check worker profiles for reviews by this customer
    users.forEach(u => {
      if (u.role === "Worker" && u.workerProfile?.reviews) {
        u.workerProfile.reviews.forEach((rev, idx) => {
          if (rev.customerName === currentUser.name) {
            // Avoid duplicates
            const exists = displayReviews.some(dr => dr.comment === rev.comment && dr.rating === rev.rating);
            if (!exists) {
              displayReviews.push({
                id: `wp-${u._id || u.id}-${idx}`,
                customerName: rev.customerName,
                workerName: u.name,
                rating: rev.rating,
                comment: rev.comment,
                date: rev.date || "",
                source: "profile"
              });
            }
          }
        });
      }
    });
  } else if (currentUser.role === "Worker") {
    // Show booking-based reviews for this worker
    const bookingBased = bookingReviews.filter((r) => r.worker === currentUser.id || r.worker === currentUser._id);
    displayReviews = bookingBased.map(r => ({
      id: r._id || r.id,
      customerName: r.customerName || "Customer",
      workerName: r.workerName || currentUser.name,
      rating: r.rating,
      comment: r.comment,
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "",
      source: "booking"
    }));

    // Also get reviews from own workerProfile
    if (currentUser.workerProfile?.reviews) {
      currentUser.workerProfile.reviews.forEach((rev, idx) => {
        const exists = displayReviews.some(dr => dr.comment === rev.comment && dr.rating === rev.rating);
        if (!exists) {
          displayReviews.push({
            id: `wp-self-${idx}`,
            customerName: rev.customerName || "Customer",
            workerName: currentUser.name,
            rating: rev.rating,
            comment: rev.comment,
            date: rev.date || "",
            source: "profile"
          });
        }
      });
    }
  } else {
    // Admin sees all
    displayReviews = bookingReviews.map(r => ({
      id: r._id || r.id,
      customerName: r.customerName || "Customer",
      workerName: r.workerName || "Worker",
      rating: r.rating,
      comment: r.comment,
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "",
      source: "booking"
    }));

    // Also include all worker profile reviews
    users.forEach(u => {
      if (u.role === "Worker" && u.workerProfile?.reviews) {
        u.workerProfile.reviews.forEach((rev, idx) => {
          const exists = displayReviews.some(dr => dr.comment === rev.comment && dr.rating === rev.rating);
          if (!exists) {
            displayReviews.push({
              id: `wp-${u._id || u.id}-${idx}`,
              customerName: rev.customerName || "Customer",
              workerName: u.name,
              rating: rev.rating,
              comment: rev.comment,
              date: rev.date || "",
              source: "profile"
            });
          }
        });
      }
    });
  }

  const avgRating = displayReviews.length
    ? (displayReviews.reduce((a, r) => a + r.rating, 0) / displayReviews.length).toFixed(1)
    : null;

  function StarRow({ rating }) {
    return (
      <div style={{ display: "flex", gap: "3px" }}>
        {[1,2,3,4,5].map((s) => (
          <Star key={s} size={14} fill={s <= rating ? "#e8a55a" : "none"} color={s <= rating ? "#e8a55a" : "#e6dfd8"} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 24px", background: "#faf9f5", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "32px", fontWeight: 400, color: "#141413", letterSpacing: "-0.02em" }}>
            {currentUser.role === "Customer" ? "My Reviews" : currentUser.role === "Worker" ? "Client Feedback" : "All Reviews"}
          </h1>
          <p style={{ fontSize: "15px", color: "#6c6a64", marginTop: "6px" }}>
            {currentUser.role === "Customer" ? "Reviews you submitted for workers and completed services." :
             currentUser.role === "Worker"   ? "Ratings and reviews left by your clients." : "All reviews across the platform."}
          </p>
        </div>

        {/* Summary */}
        {displayReviews.length > 0 && (
          <div className="reviews-summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", maxWidth: "440px", gap: "16px", marginBottom: "28px" }}>
            <div style={{ background: "#ffffff", border: "1px solid #e6dfd8", borderRadius: "16px", padding: "20px 24px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#8e8b82", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Total Reviews
              </div>
              <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", fontSize: "36px", fontWeight: 700, color: "#cc785c", lineHeight: 1.1, marginTop: "4px", fontVariantNumeric: "tabular-nums" }}>
                {displayReviews.length}
              </div>
            </div>
            {avgRating && (
              <div style={{ background: "#ffffff", border: "1px solid #e6dfd8", borderRadius: "16px", padding: "20px 24px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#8e8b82", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Average Rating
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", fontSize: "36px", fontWeight: 700, color: "#e8a55a", lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>
                    {avgRating}
                  </div>
                  <Star size={22} fill="#e8a55a" color="#e8a55a" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews list */}
        {displayReviews.length === 0 ? (
          <div style={{ background: "#ffffff", border: "1px solid #e6dfd8", borderRadius: "16px", padding: "60px 40px", textAlign: "center", boxShadow: "0 2px 12px rgba(20,20,19,0.03)" }}>
            <MessageSquare size={48} color="#e6dfd8" style={{ margin: "0 auto 14px" }} />
            <div style={{ fontSize: "17px", fontWeight: 600, color: "#141413" }}>No reviews yet</div>
            <p style={{ fontSize: "14px", color: "#6c6a64", marginTop: "6px" }}>
              {currentUser.role === "Customer" ? "Visit a worker profile to write a review." : "Completed jobs will generate reviews here."}
            </p>
          </div>
        ) : (
          <div className="reviews-card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
            {displayReviews.map((r) => (
              <div key={r.id} style={{ background: "#ffffff", border: "1px solid #e6dfd8", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 12px rgba(20,20,19,0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: "#141413" }}>
                      {currentUser.role === "Worker" ? r.customerName : r.workerName}
                    </div>
                    {currentUser.role === "Customer" && (
                      <div style={{ fontSize: "12px", color: "#8e8b82", marginTop: "2px" }}>Worker: {r.workerName}</div>
                    )}
                    {currentUser.role === "Admin" && (
                      <div style={{ fontSize: "12px", color: "#8e8b82", marginTop: "2px" }}>{r.customerName} → {r.workerName}</div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#fff5e6", padding: "3px 10px", borderRadius: "9999px", border: "1px solid #fce3b8" }}>
                    <Star size={12} fill="#e8a55a" color="#e8a55a" />
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#141413", fontVariantNumeric: "tabular-nums" }}>{r.rating.toFixed(1)}</span>
                  </div>
                </div>
                {r.comment && (
                  <p style={{ fontSize: "14px", color: "#3d3d3a", lineHeight: 1.47, fontStyle: "italic", margin: "0 0 8px 0" }}>
                    "{r.comment}"
                  </p>
                )}
                {r.date && (
                  <div style={{ fontSize: "11px", color: "#8e8b82" }}>{r.date}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
