import React, { useState } from 'react';
import { S } from '../styles/theme';

export function ProgressPhotos({ user, save, rank }) {
    const [selectedView, setSelectedView] = useState("front");
    const photos = user.progressPhotos || [];

    const VIEWS = ["front", "side", "back"];
    const VIEW_LABELS = { front: "Front", side: "Side", back: "Back" };

    function handleUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
                // Compress: resize to max 400px wide, JPEG quality 0.6
                const MAX = 400;
                const scale = Math.min(1, MAX / img.width);
                const canvas = document.createElement("canvas");
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const compressed = canvas.toDataURL("image/jpeg", 0.6);
                const entry = {
                    id: Date.now(),
                    date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
                    dateRaw: new Date().toISOString().split("T")[0],
                    view: selectedView,
                    img: compressed,
                    weight: user.weightLog?.slice(-1)[0]?.weight || user.startWeight,
                };
                try {
                    save({ progressPhotos: [...photos, entry] });
                } catch (err) {
                    alert("Storage full. Please delete some old photos to add new ones.");
                }
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
    }

    function deletePhoto(id) {
        save({ progressPhotos: photos.filter(p => p.id !== id) });
    }

    const filtered = photos.filter(p => p.view === selectedView);
    const first = filtered[0];
    const latest = filtered.length > 1 ? filtered[filtered.length - 1] : null;

    async function shareProgressCard() {
        if (!first) return;
        const photo1 = first;
        const photo2 = latest || first;
        const lostKg = Math.max(0, photo1.weight - photo2.weight).toFixed(1);
        const canvas = document.createElement("canvas");
        // Instagram story size 9:16
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext("2d");

        // Background
        ctx.fillStyle = "#0A0A0F";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Gradient overlay top
        const topGrad = ctx.createLinearGradient(0, 0, 0, 400);
        topGrad.addColorStop(0, "rgba(123,104,238,0.3)");
        topGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, canvas.width, 400);

        // Helper to load image
        function loadImg(src) {
            return new Promise((res, rej) => {
                const i = new Image();
                i.onload = () => res(i);
                i.onerror = rej;
                i.src = src;
            });
        }

        // Draw photos side by side
        const photoY = 280;
        const photoH = 900;
        const photoW = 490;
        const gap = 20;
        const leftX = 40;
        const rightX = leftX + photoW + gap;

        try {
            const img1 = await loadImg(photo1.img);
            const img2 = await loadImg(photo2.img);

            // Rounded rect clip for left photo
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(leftX, photoY, photoW, photoH, 20);
            ctx.clip();
            ctx.drawImage(img1, leftX, photoY, photoW, photoH);
            ctx.restore();

            // Rounded rect clip for right photo
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(rightX, photoY, photoW, photoH, 20);
            ctx.clip();
            ctx.drawImage(img2, rightX, photoY, photoW, photoH);
            ctx.restore();
        } catch (e) { }

        // Dark gradient over bottom of photos
        const photoGrad = ctx.createLinearGradient(0, photoY + photoH - 200, 0, photoY + photoH);
        photoGrad.addColorStop(0, "rgba(0,0,0,0)");
        photoGrad.addColorStop(1, "rgba(10,10,15,0.95)");
        ctx.fillStyle = photoGrad;
        ctx.fillRect(leftX, photoY, photoW + photoW + gap, photoH);

        // BEFORE / NOW labels
        ctx.font = "bold 36px Arial";
        ctx.fillStyle = "#888888";
        ctx.textAlign = "center";
        ctx.fillText("BEFORE", leftX + photoW / 2, photoY + 50);
        ctx.fillStyle = rank.color;
        ctx.fillText("NOW", rightX + photoW / 2, photoY + 50);

        // Dates under photos
        ctx.font = "32px Arial";
        ctx.fillStyle = "#666666";
        ctx.textAlign = "center";
        ctx.fillText(photo1.date, leftX + photoW / 2, photoY + photoH + 50);
        ctx.fillText(photo2.date, rightX + photoW / 2, photoY + photoH + 50);

        // Stats section
        const statsY = photoY + photoH + 100;

        // Lost kg — big number
        if (parseFloat(lostKg) > 0) {
            ctx.font = "bold 130px Arial";
            ctx.fillStyle = "#2ECC71";
            ctx.textAlign = "center";
            ctx.fillText("-" + lostKg + "kg", canvas.width / 2, statsY + 120);
            ctx.font = "bold 44px Arial";
            ctx.fillStyle = "#555555";
            ctx.fillText("LOST SO FAR", canvas.width / 2, statsY + 180);
        }

        // Divider line
        ctx.strokeStyle = "#1E1E2E";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(80, statsY + 220);
        ctx.lineTo(canvas.width - 80, statsY + 220);
        ctx.stroke();

        // AURA and streak stats
        const stat1X = canvas.width / 4;
        const stat2X = (canvas.width / 4) * 3;
        const statY2 = statsY + 340;

        ctx.font = "bold 80px Arial";
        ctx.fillStyle = "#FFD700";
        ctx.textAlign = "center";
        ctx.fillText(user.xp, stat1X, statY2);
        ctx.font = "bold 32px Arial";
        ctx.fillStyle = "#555555";
        ctx.fillText("AURA", stat1X, statY2 + 50);

        ctx.font = "bold 80px Arial";
        ctx.fillStyle = "#FF6B35";
        ctx.fillText(user.streak, stat2X, statY2);
        ctx.font = "bold 32px Arial";
        ctx.fillStyle = "#555555";
        ctx.fillText("DAY STREAK", stat2X, statY2 + 50);

        // Rank badge area
        const rankY = statY2 + 130;
        ctx.font = "bold 44px Arial";
        ctx.fillStyle = rank.color;
        ctx.textAlign = "center";
        ctx.fillText(rank.badge + "  " + rank.name.toUpperCase(), canvas.width / 2, rankY);

        // FitQuest branding — top
        ctx.font = "bold 52px Arial";
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.fillText("💪 FITQUEST", canvas.width / 2, 120);
        ctx.font = "32px Arial";
        ctx.fillStyle = "#555555";
        ctx.fillText(user.name + "'s Transformation", canvas.width / 2, 180);

        // Bottom branding
        ctx.font = "bold 34px Arial";
        ctx.fillStyle = "#333333";
        ctx.textAlign = "center";
        ctx.fillText("Track your transformation at FitQuest", canvas.width / 2, canvas.height - 60);

        // Export and share
        canvas.toBlob(async (blob) => {
            const file = new File([blob], "fitquest-progress.png", { type: "image/png" });
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: "My FitQuest Transformation",
                        text: user.name + " lost " + lostKg + "kg on FitQuest! " + rank.badge + " " + rank.name,
                    });
                } catch (e) {
                    // User cancelled — that's fine
                }
            } else {
                // Fallback: download the image
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "fitquest-progress.png";
                a.click();
                URL.revokeObjectURL(url);
            }
        }, "image/png");
    }

    return (
        <div style={S.col}>

            {/* Header card */}
            <div style={S.card}>
                <div style={{ ...S.heading, fontSize: 18, marginBottom: 6 }}>📸 Progress Photos</div>
                <div style={{ fontSize: 13, color: "#666" }}>Track your visual transformation week by week. Photos stay private on your device.</div>
            </div>

            {/* View selector */}
            <div style={{ display: "flex", gap: 8 }}>
                {VIEWS.map(v => (
                    <button
                        key={v}
                        onClick={() => setSelectedView(v)}
                        style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: selectedView === v ? rank.color : "#1A1A2A", color: selectedView === v ? "#000" : "#666", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, textTransform: "uppercase", transition: "all 0.2s" }}
                    >
                        {VIEW_LABELS[v]}
                    </button>
                ))}
            </div>

            {/* Upload button */}
            <label style={{ display: "block", cursor: "pointer" }}>
                <input type="file" accept="image/*" capture="environment" onChange={handleUpload} style={{ display: "none" }} />
                <div style={{ ...S.btn(`linear-gradient(135deg,${rank.color},${rank.color}BB)`), display: "block", textAlign: "center", padding: "13px 20px", borderRadius: 12, fontSize: 14, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, textTransform: "uppercase", color: "#fff" }}>
                    📷 Add {VIEW_LABELS[selectedView]} Photo
                </div>
            </label>

            {/* Share progress card button — shown when at least 1 photo exists */}
            {first && (
                <button onClick={shareProgressCard} style={S.btn("linear-gradient(135deg,#E8921A,#C07010)")}>
                    🚀 Share My Progress
                </button>
            )}

            {/* Before / After comparison */}
            {first && latest && (
                <div style={S.card}>
                    <div style={{ ...S.heading, fontSize: 16, marginBottom: 12 }}>Before vs Now</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {[{ label: "Before", photo: first }, { label: "Now", photo: latest }].map(({ label, photo }) => (
                            <div key={label}>
                                <div style={{ fontSize: 11, color: "#555", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, textAlign: "center" }}>{label}</div>
                                <img src={photo.img} alt={label} style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: 10, display: "block" }} />
                                <div style={{ fontSize: 11, color: "#666", textAlign: "center", marginTop: 5 }}>{photo.date}</div>
                                <div style={{ fontSize: 12, color: rank.color, textAlign: "center", fontWeight: 700 }}>{photo.weight} kg</div>
                            </div>
                        ))}
                    </div>
                    {first.weight && latest.weight && (
                        <div style={{ marginTop: 12, padding: "10px 14px", background: "#0F1A0F", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 13, color: "#666" }}>Change in this view</span>
                            <span style={{ ...S.heading, fontSize: 18, color: "#2ECC71" }}>−{Math.max(0, first.weight - latest.weight).toFixed(1)} kg 📉</span>
                        </div>
                    )}
                </div>
            )}

            {/* Photo timeline */}
            {filtered.length > 0 ? (
                <div style={S.card}>
                    <div style={{ ...S.heading, fontSize: 16, marginBottom: 12 }}>
                        {VIEW_LABELS[selectedView]} Timeline · {filtered.length} photo{filtered.length > 1 ? "s" : ""}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                        {filtered.slice().reverse().map((photo) => (
                            <div key={photo.id} style={{ position: "relative" }}>
                                <img src={photo.img} alt={photo.date} style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: 8, display: "block" }} />
                                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,rgba(0,0,0,0.85))", borderRadius: "0 0 8px 8px", padding: "12px 6px 5px" }}>
                                    <div style={{ fontSize: 10, color: "#ccc", textAlign: "center" }}>{photo.date}</div>
                                    <div style={{ fontSize: 11, color: rank.color, textAlign: "center", fontWeight: 700 }}>{photo.weight}kg</div>
                                </div>
                                <button
                                    onClick={() => deletePhoto(photo.id)}
                                    style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.7)", border: "none", color: "#E84040", borderRadius: "50%", width: 22, height: 22, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{ ...S.card, textAlign: "center", padding: "40px 20px" }}>
                    <div style={{ fontSize: 48, marginBottom: 10 }}>📷</div>
                    <div style={{ fontSize: 15, color: "#555", marginBottom: 6 }}>No {VIEW_LABELS[selectedView].toLowerCase()} photos yet</div>
                    <div style={{ fontSize: 12, color: "#333" }}>Add your first photo to start tracking your transformation</div>
                </div>
            )}

            {/* Tips */}
            <div style={{ ...S.card, background: "#0F0F1A" }}>
                <div style={{ ...S.heading, fontSize: 14, marginBottom: 10, color: "#888" }}>📌 Tips for consistent photos</div>
                {["Same time of day — morning is best", "Same lighting — near a window", "Same pose each time", "Weekly is enough — not daily"].map((tip, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#555", padding: "4px 0", borderBottom: i < 3 ? "1px solid #1A1A2A" : "none" }}>
                        · {tip}
                    </div>
                ))}
            </div>
        </div>
    );
}
