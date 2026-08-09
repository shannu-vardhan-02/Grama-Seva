import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * ImageLightbox — Fullscreen interactive image viewer with swipe/scroll & maximize
 *
 * Props:
 *  - images: string[] (Array of image URLs)
 *  - initialIndex: number (Index of image clicked)
 *  - onClose: () => void
 */
export default function ImageLightbox({ images = [], initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStartX, setTouchStartX] = useState(null);

  const total = images.length;
  if (total === 0) return null;

  const currentUrl = images[currentIndex] || images[0];

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  }, [total]);

  // Keyboard Navigation (Arrow Keys + Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "ArrowRight") handleNext();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext, onClose]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;

    if (Math.abs(diffX) > 40) {
      if (diffX > 0) handleNext(); // Swiped left -> next
      else handlePrev();           // Swiped right -> prev
    }
    setTouchStartX(null);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2500,
        background: "rgba(10, 10, 10, 0.92)",
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px",
        userSelect: "none",
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      {/* Top Header Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "1100px",
          display: "flex",
          justify: "space-between",
          alignItems: "center",
          color: "#faf9f5",
          zIndex: 10,
        }}
      >
        <div style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "0.04em", background: "rgba(255,255,255,0.12)", padding: "6px 14px", borderRadius: "999px", fontVariantNumeric: "tabular-nums" }}>
          📷 {currentIndex + 1} of {total}
        </div>

        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#ffffff",
            borderRadius: "50%",
            width: "42px",
            height: "42px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
        >
          <X size={22} />
        </button>
      </div>

      {/* Main Maximized Image Area */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "1100px",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "16px 0",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous Button */}
        {total > 1 && (
          <button
            onClick={handlePrev}
            style={{
              position: "absolute",
              left: "12px",
              background: "rgba(0, 0, 0, 0.55)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#ffffff",
              borderRadius: "50%",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <ChevronLeft size={28} />
          </button>
        )}

        {/* Maximized Image */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "relative",
            maxHeight: "78vh",
            maxWidth: "88vw",
            borderRadius: "14px",
            overflow: "hidden",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={currentUrl}
            alt={`Gallery item ${currentIndex + 1}`}
            style={{
              maxHeight: "78vh",
              maxWidth: "88vw",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>

        {/* Next Button */}
        {total > 1 && (
          <button
            onClick={handleNext}
            style={{
              position: "absolute",
              right: "12px",
              background: "rgba(0, 0, 0, 0.55)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#ffffff",
              borderRadius: "50%",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {total > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "flex",
            gap: "10px",
            overflowX: "auto",
            maxWidth: "100%",
            padding: "8px",
            zIndex: 10,
          }}
        >
          {images.map((url, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "8px",
                overflow: "hidden",
                border: idx === currentIndex ? "2.5px solid #cc785c" : "2px solid rgba(255,255,255,0.2)",
                opacity: idx === currentIndex ? 1 : 0.5,
                padding: 0,
                cursor: "pointer",
                background: "none",
                transition: "all 0.15s",
                flexShrink: 0,
              }}
            >
              <img src={url} alt="Thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
