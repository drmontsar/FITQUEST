export const S = {
    app: { fontFamily: "'Barlow', sans-serif", background: "#0A0A0F", minHeight: "100dvh", color: "#E8E8F0", maxWidth: 480, margin: "0 auto", position: "relative" },
    card: { background: "#111118", border: "1px solid #1E1E2E", borderRadius: 16, padding: 18 },
    btn: (bg, color = "#fff") => ({ background: bg, border: "none", borderRadius: 12, color, padding: "13px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, textTransform: "uppercase", transition: "opacity 0.15s", width: "100%" }),
    input: { width: "100%", padding: "13px 16px", background: "#1A1A2A", border: "1px solid #2A2A40", borderRadius: 12, color: "#E8E8F0", fontSize: 16, outline: "none", fontFamily: "'Barlow', sans-serif" },
    label: { fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6, display: "block" },
    row: { display: "flex", alignItems: "center", gap: 10 },
    col: { display: "flex", flexDirection: "column", gap: 12 },
    heading: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, letterSpacing: 1 },
};
