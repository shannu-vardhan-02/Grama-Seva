import React, { useState, useRef, useCallback } from "react";
import api from "../api";

/**
 * ImageUpload — reusable drag-and-drop image uploader backed by Cloudinary.
 *
 * Props:
 *   mode        "single" | "multiple"  (default: "single")
 *   endpoint    "proof" | "gallery"    — maps to /api/upload/{endpoint}
 *   value       string | string[]      — current image url(s)
 *   onChange    (url | urls[]) => void — called after successful upload
 *   label       string                 — optional label text
 *   maxFiles    number                 — max images in multiple mode (default: 6)
 */
export default function ImageUpload({
  mode = "single",
  endpoint = "proof",
  value,
  onChange,
  label,
  maxFiles = 6,
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const images = mode === "multiple"
    ? (Array.isArray(value) ? value : (value ? [value] : []))
    : [];
  const singleImage = mode === "single" ? (value || null) : null;

  const uploadFiles = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    setError("");
    setUploading(true);
    setProgress(10);

    // Validate file types
    const invalid = Array.from(files).find(f => !f.type.startsWith("image/"));
    if (invalid) {
      setError("Only image files are allowed (JPG, PNG, WEBP).");
      setUploading(false);
      return;
    }

    // Validate file sizes (5MB each)
    const tooBig = Array.from(files).find(f => f.size > 5 * 1024 * 1024);
    if (tooBig) {
      setError("Each image must be under 5MB.");
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      if (mode === "single") {
        formData.append("image", files[0]);
        setProgress(40);
        const res = await api.post(`/api/upload/${endpoint}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            setProgress(Math.round((e.loaded / e.total) * 80));
          },
        });
        setProgress(100);
        onChange(res.data.url);
      } else {
        // Multiple — respect maxFiles limit
        const available = maxFiles - images.length;
        const toUpload = Array.from(files).slice(0, available);
        if (toUpload.length === 0) {
          setError(`Maximum ${maxFiles} images allowed.`);
          setUploading(false);
          return;
        }
        toUpload.forEach(f => formData.append("images", f));
        setProgress(40);
        const res = await api.post(`/api/upload/${endpoint}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            setProgress(Math.round((e.loaded / e.total) * 80));
          },
        });
        setProgress(100);
        const newUrls = res.data.urls || (res.data.url ? [res.data.url] : []);
        onChange([...images, ...newUrls]);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed. Please try again.");
    } finally {
      setTimeout(() => { setUploading(false); setProgress(0); }, 600);
    }
  }, [endpoint, mode, images, maxFiles, onChange]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    uploadFiles(e.dataTransfer.files);
  }, [uploadFiles]);

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleInputChange = (e) => uploadFiles(e.target.files);
  const handleRemoveSingle = () => onChange(null);
  const handleRemoveMultiple = (idx) => onChange(images.filter((_, i) => i !== idx));

  const canAddMore = mode === "multiple" ? images.length < maxFiles : !singleImage;

  const S = {
    wrapper: { fontFamily: "'Inter', sans-serif" },
    label: {
      display: "block",
      fontSize: "12px",
      fontWeight: 600,
      color: "#141413",
      marginBottom: "8px",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
    },
    dropzone: {
      border: `2px dashed ${dragging ? "#cc785c" : "#e0d8cf"}`,
      borderRadius: "12px",
      padding: "28px 20px",
      textAlign: "center",
      cursor: uploading ? "not-allowed" : "pointer",
      background: dragging ? "rgba(204,120,92,0.05)" : "#faf9f5",
      transition: "all 0.2s ease",
      position: "relative",
    },
    hiddenInput: { position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" },
    uploadIcon: {
      width: "44px",
      height: "44px",
      background: "#efe9de",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 12px",
    },
    uploadTitle: { fontSize: "14px", fontWeight: 600, color: "#141413", marginBottom: "4px" },
    uploadSub: { fontSize: "12px", color: "#8e8b82" },
    progressBar: {
      width: "100%",
      height: "4px",
      background: "#e6dfd8",
      borderRadius: "4px",
      marginTop: "12px",
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      background: "linear-gradient(90deg, #cc785c, #e8a55a)",
      borderRadius: "4px",
      transition: "width 0.3s ease",
      width: `${progress}%`,
    },
    singlePreview: {
      position: "relative",
      borderRadius: "12px",
      overflow: "hidden",
      border: "2px solid #e6dfd8",
      aspectRatio: "4/3",
    },
    singleImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
    removeBtn: {
      position: "absolute",
      top: "8px",
      right: "8px",
      background: "rgba(0,0,0,0.65)",
      color: "#fff",
      border: "none",
      borderRadius: "50%",
      width: "28px",
      height: "28px",
      cursor: "pointer",
      fontSize: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "10px",
      marginBottom: "12px",
    },
    gridItem: {
      position: "relative",
      aspectRatio: "1.2",
      borderRadius: "8px",
      overflow: "hidden",
      border: "1px solid #e6dfd8",
    },
    gridImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
    error: {
      marginTop: "8px",
      fontSize: "12px",
      color: "#c64545",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
  };

  return (
    <div style={S.wrapper}>
      {label && <label style={S.label}>{label}</label>}

      {/* Multiple mode — show existing grid */}
      {mode === "multiple" && images.length > 0 && (
        <div style={S.grid}>
          {images.map((url, idx) => (
            <div key={idx} style={S.gridItem}>
              <img src={url} alt={`Gallery ${idx + 1}`} style={S.gridImg} />
              <button
                type="button"
                onClick={() => handleRemoveMultiple(idx)}
                style={S.removeBtn}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Single mode — show preview when image exists */}
      {mode === "single" && singleImage && (
        <div style={{ ...S.singlePreview, marginBottom: "10px" }}>
          <img src={singleImage} alt="Uploaded" style={S.singleImg} />
          <button type="button" onClick={handleRemoveSingle} style={S.removeBtn}>×</button>
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            background: "linear-gradient(transparent, rgba(0,0,0,0.5))",
            padding: "8px 10px",
          }}>
            <span style={{ fontSize: "11px", color: "#fff", fontWeight: 500 }}>✓ Uploaded to cloud</span>
          </div>
        </div>
      )}

      {/* Drop zone — show if more images can be added */}
      {canAddMore && (
        <div
          style={S.dropzone}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={mode === "multiple"}
            onChange={handleInputChange}
            style={{ display: "none" }}
            disabled={uploading}
          />

          {uploading ? (
            <>
              <div style={{ ...S.uploadIcon, background: "#ffe4d6" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cc785c" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div style={S.uploadTitle}>Uploading to Cloudinary…</div>
              <div style={S.progressBar}>
                <div style={S.progressFill} />
              </div>
            </>
          ) : (
            <>
              <div style={S.uploadIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cc785c" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div style={S.uploadTitle}>
                {dragging
                  ? "Drop image here"
                  : mode === "multiple"
                  ? `Drag & drop or click to add photos (${images.length}/${maxFiles})`
                  : "Drag & drop or click to upload"}
              </div>
              <div style={S.uploadSub}>JPG, PNG, WEBP · Max 5MB per image</div>
            </>
          )}
        </div>
      )}

      {error && (
        <div style={S.error}>
          <span>⚠</span> {error}
        </div>
      )}
    </div>
  );
}
