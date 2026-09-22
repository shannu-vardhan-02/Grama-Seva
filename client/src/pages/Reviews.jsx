import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { Star, MessageSquare, Trash2 } from "lucide-react";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";

export default function Reviews() {
  const { currentUser, users, fetchUsers, removeWorkerProfileReview } = useAuth();
  const { reviews: bookingReviews, deleteReview } = useSocket();
  const { showToast } = useToast();
  const [deletedReviewIds, setDeletedReviewIds] = useState([]);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  if (!currentUser) return null;

  let displayReviews = [];

  if (currentUser.role === "Customer") {
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

    users.forEach(u => {
      if (u.role === "Worker" && u.workerProfile?.reviews) {
        u.workerProfile.reviews.forEach((rev, idx) => {
          if (rev.customerName === currentUser.name) {
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
    displayReviews = bookingReviews.map(r => ({
      id: r._id || r.id,
      customerName: r.customerName || "Customer",
      workerName: r.workerName || "Worker",
      rating: r.rating,
      comment: r.comment,
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "",
      source: "booking"
    }));

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

  displayReviews = displayReviews.filter(r => !deletedReviewIds.includes(r.id));

  const avgRating = displayReviews.length
    ? (displayReviews.reduce((a, r) => a + r.rating, 0) / displayReviews.length).toFixed(1)
    : null;

  return (
    <div style={{ background: "var(--ch-canvas)", color: "var(--ch-ink)", padding: "32px 40px", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase", color: "var(--ch-muted)", letterSpacing: "0.2px", marginBottom: "8px" }}>
            Feedback
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "28px", fontWeight: 400, color: "var(--ch-primary)", letterSpacing: "-0.02em", margin: 0 }}>
            {currentUser.role === "Customer" ? "My Reviews" : currentUser.role === "Worker" ? "Client Feedback" : "All Reviews"}
          </h1>
        </div>

        {displayReviews.length > 0 && (
          <div style={{ display: "flex", gap: "16px", marginBottom: "32px", flexWrap: "wrap" }}>
            <div style={{ background: "var(--ch-card-bg)", border: "1px solid var(--ch-hairline)", borderRadius: "8px", padding: "20px 24px", flex: 1, minWidth: "160px", maxWidth: "200px" }}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--ch-muted)", textTransform: "uppercase", marginBottom: "8px" }}>Total Reviews</div>
              <div style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "32px", color: "var(--ch-action-blue)" }}>{displayReviews.length}</div>
            </div>
            {avgRating && (
              <div style={{ background: "var(--ch-card-bg)", border: "1px solid var(--ch-hairline)", borderRadius: "8px", padding: "20px 24px", flex: 1, minWidth: "160px", maxWidth: "200px" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--ch-muted)", textTransform: "uppercase", marginBottom: "8px" }}>Avg Rating</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "32px", color: "var(--ch-deep-green)" }}>{avgRating}</div>
                  <Star size={20} fill="#f59e0b" color="#f59e0b" />
                </div>
              </div>
            )}
          </div>
        )}

        {displayReviews.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 0" }}>
            <MessageSquare size={40} color="var(--ch-muted)" style={{ marginBottom: "16px" }} />
            <h3 style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "20px", color: "var(--ch-primary)", margin: "0 0 8px 0" }}>No reviews yet</h3>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
            {displayReviews.map((r) => (
              <div key={r.id} style={{ background: "var(--ch-card-bg)", border: "1px solid var(--ch-hairline)", borderRadius: "8px", padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <div style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", fontSize: "15px", fontWeight: 500, color: "var(--ch-primary)" }}>
                      {currentUser.role === "Worker" ? r.customerName : r.workerName}
                    </div>
                    {currentUser.role === "Customer" && (
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--ch-muted)", textTransform: "uppercase", marginTop: "4px" }}>WORKER: {r.workerName}</div>
                    )}
                    {currentUser.role === "Admin" && (
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--ch-muted)", textTransform: "uppercase", marginTop: "4px" }}>{r.customerName} → {r.workerName}</div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "2px" }}>
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={14} fill={s <= r.rating ? "#f59e0b" : "none"} color={s <= r.rating ? "#f59e0b" : "var(--ch-hairline)"} />
                    ))}
                  </div>
                </div>
                
                {r.comment && (
                  <p style={{ fontSize: "14px", color: "var(--ch-body-muted)", lineHeight: 1.5, margin: "0 0 16px 0" }}>"{r.comment}"</p>
                )}
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "var(--ch-muted)" }}>{r.date}</div>
                  {(currentUser.role === "Admin" || (currentUser.role === "Customer" && r.customerName === currentUser.name)) && (
                    <button
                      onClick={() => setReviewToDelete(r)}
                      style={{ background: "none", border: "none", color: "var(--ch-error)", fontSize: "13px", cursor: "pointer", textDecoration: "underline" }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <ConfirmModal
          isOpen={!!reviewToDelete}
          title="Remove Customer Review"
          message={`Are you sure you want to delete this review?`}
          confirmText="Yes, Delete Review"
          cancelText="Cancel"
          variant="danger"
          onCancel={() => setReviewToDelete(null)}
          onConfirm={() => {
            if (!reviewToDelete) return;
            const r = reviewToDelete;
            setReviewToDelete(null);

            setDeletedReviewIds((prev) => [...prev, r.id]);
            showToast("Review deleted.", "success");

            const deletePromise =
              r.source === "booking"
                ? deleteReview(r.id)
                : (() => {
                    const parts = r.id.split("-");
                    const workerId = parts[1];
                    const idx = parseInt(parts[2], 10);
                    return workerId && !isNaN(idx)
                      ? removeWorkerProfileReview(workerId, idx)
                      : Promise.resolve();
                  })();

            deletePromise
              .then(() => {
                if (fetchUsers) fetchUsers();
              })
              .catch((err) => {
                setDeletedReviewIds((prev) => prev.filter((id) => id !== r.id));
                showToast(err.message || "Failed to delete review.", "error");
                if (fetchUsers) fetchUsers();
              });
          }}
        />
      </div>
    </div>
  );
}
