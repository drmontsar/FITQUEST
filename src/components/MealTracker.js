import React, { useState } from 'react';
import { FOOD_DB } from '../constants/data';
import { todayStr } from '../utils/helpers';
import { S } from '../styles/theme';

export function MealTracker({ user, save, rank }) {
    const today = todayStr();
    const mealLog = user.mealLog?.[today] || [];

    const [search, setSearch] = useState("");
    const [selectedFood, setSelectedFood] = useState(null);
    const [qty, setQty] = useState("1");
    const [mealTime, setMealTime] = useState("Breakfast");
    const [showSearch, setShowSearch] = useState(false);

    const MEAL_TIMES = ["Breakfast", "Snack", "Lunch", "Pre-Workout", "Post-Workout", "Dinner"];

    const filtered = search.length > 1
        ? FOOD_DB.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
        : [];

    const totalCal = mealLog.reduce((s, e) => s + e.cal, 0);
    const totalProtein = mealLog.reduce((s, e) => s + e.protein, 0);
    const calTarget = user.dailyKcal || 2200;
    const proteinTarget = user.protein || 160;
    const calPct = Math.min(100, (totalCal / calTarget) * 100);
    const proteinPct = Math.min(100, (totalProtein / proteinTarget) * 100);

    function addFood() {
        if (!selectedFood) return;
        const q = parseFloat(qty) || 1;
        const entry = {
            id: Date.now(),
            name: selectedFood.name,
            mealTime,
            cal: Math.round(selectedFood.cal * q),
            protein: Math.round(selectedFood.protein * q * 10) / 10,
            qty: q,
            unit: selectedFood.unit,
        };
        const updated = [...mealLog, entry];
        save({ mealLog: { ...user.mealLog, [today]: updated } });
        setSelectedFood(null);
        setSearch("");
        setQty("1");
        setShowSearch(false);
    }

    function removeEntry(id) {
        const updated = mealLog.filter(e => e.id !== id);
        save({ mealLog: { ...user.mealLog, [today]: updated } });
    }

    // Group by meal time
    const grouped = MEAL_TIMES.map(mt => ({
        time: mt,
        entries: mealLog.filter(e => e.mealTime === mt),
    })).filter(g => g.entries.length > 0);

    return (
        <div style={S.col}>

            {/* Daily Summary */}
            <div style={S.card}>
                <div style={{ ...S.heading, fontSize: 18, marginBottom: 14 }}>🍽️ Today's Nutrition</div>

                {/* Calories */}
                <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: "#888" }}>Calories</span>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>
                            <span style={{ color: calPct > 100 ? "#E84040" : "#E8921A" }}>{totalCal}</span>
                            <span style={{ color: "#444" }}> / {calTarget} kcal</span>
                        </span>
                    </div>
                    <div style={{ background: "#1A1A2A", borderRadius: 6, height: 10, overflow: "hidden" }}>
                        <div style={{ width: `${calPct}%`, height: "100%", background: calPct > 100 ? "#E84040" : "linear-gradient(90deg,#E8921A,#FFD700)", transition: "width 0.5s ease", borderRadius: 6 }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#444", marginTop: 3, textAlign: "right" }}>
                        {calTarget - totalCal > 0 ? `${calTarget - totalCal} kcal remaining` : `${totalCal - calTarget} kcal over`}
                    </div>
                </div>

                {/* Protein */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: "#888" }}>Protein</span>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>
                            <span style={{ color: proteinPct >= 100 ? "#2ECC71" : rank.color }}>{totalProtein}g</span>
                            <span style={{ color: "#444" }}> / {proteinTarget}g</span>
                        </span>
                    </div>
                    <div style={{ background: "#1A1A2A", borderRadius: 6, height: 10, overflow: "hidden" }}>
                        <div style={{ width: `${proteinPct}%`, height: "100%", background: proteinPct >= 100 ? "linear-gradient(90deg,#2ECC71,#27AE60)" : `linear-gradient(90deg,${rank.color},${rank.color}99)`, transition: "width 0.5s ease", borderRadius: 6 }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#444", marginTop: 3, textAlign: "right" }}>
                        {proteinTarget - totalProtein > 0 ? `${Math.round(proteinTarget - totalProtein)}g more needed` : "✅ Goal hit!"}
                    </div>
                </div>
            </div>

            {/* Add Food Button */}
            <button
                onClick={() => setShowSearch(!showSearch)}
                style={S.btn(`linear-gradient(135deg,${rank.color},${rank.color}BB)`)}
            >
                {showSearch ? "✕ Cancel" : "+ Add Food"}
            </button>

            {/* Search & Add Panel */}
            {showSearch && (
                <div style={{ ...S.card, border: `1px solid ${rank.color}44` }}>
                    <div style={{ ...S.heading, fontSize: 16, marginBottom: 12 }}>Search Food</div>

                    {/* Meal time selector */}
                    <div style={{ marginBottom: 12 }}>
                        <label style={S.label}>Meal</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {MEAL_TIMES.map(mt => (
                                <button
                                    key={mt}
                                    onClick={() => setMealTime(mt)}
                                    style={{ padding: "6px 12px", borderRadius: 20, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", background: mealTime === mt ? rank.color : "#1A1A2A", color: mealTime === mt ? "#000" : "#888", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}
                                >
                                    {mt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search input */}
                    <div style={{ marginBottom: 10 }}>
                        <label style={S.label}>Search food</label>
                        <input
                            style={S.input}
                            placeholder="e.g. chicken, roti, dal..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setSelectedFood(null); }}
                            autoFocus
                        />
                    </div>

                    {/* Search results */}
                    {filtered.length > 0 && !selectedFood && (
                        <div style={{ background: "#0A0A0F", borderRadius: 12, border: "1px solid #1E1E2E", marginBottom: 10, overflow: "hidden" }}>
                            {filtered.map((f, i) => (
                                <button
                                    key={f.id}
                                    onClick={() => { setSelectedFood(f); setSearch(f.name); }}
                                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "10px 14px", background: "none", border: "none", borderBottom: i < filtered.length - 1 ? "1px solid #1A1A2A" : "none", cursor: "pointer", textAlign: "left" }}
                                >
                                    <div>
                                        <div style={{ fontSize: 14, color: "#E8E8F0", fontWeight: 600 }}>{f.name}</div>
                                        <div style={{ fontSize: 11, color: "#555" }}>{f.unit}</div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: 13, color: "#E8921A", fontWeight: 700 }}>{f.cal} kcal</div>
                                        <div style={{ fontSize: 11, color: rank.color }}>{f.protein}g protein</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Quick browse by category */}
                    {search.length === 0 && (
                        <div style={{ marginBottom: 10 }}>
                            <label style={S.label}>Quick pick</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {[...new Set(FOOD_DB.map(f => f.cat))].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSearch(cat.split(" ")[1]?.toLowerCase() || "")}
                                        style={{ padding: "5px 10px", borderRadius: 20, border: "1px solid #1E1E2E", fontSize: 12, cursor: "pointer", background: "#1A1A2A", color: "#888", fontFamily: "'Barlow', sans-serif" }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity + Add */}
                    {selectedFood && (
                        <div style={{ padding: "12px 14px", background: "#0F1A2A", borderRadius: 12, marginBottom: 10 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{selectedFood.name}</div>
                            <div style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>{selectedFood.unit}</div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                                <div style={{ flex: 1 }}>
                                    <label style={S.label}>Quantity</label>
                                    <input
                                        type="number"
                                        min="0.5"
                                        step="0.5"
                                        style={{ ...S.input, padding: "10px 14px" }}
                                        value={qty}
                                        onChange={e => setQty(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid #1E1E2E", marginBottom: 10 }}>
                                <span style={{ fontSize: 13, color: "#888" }}>Total</span>
                                <span style={{ fontSize: 14, fontWeight: 700 }}>
                                    <span style={{ color: "#E8921A" }}>{Math.round(selectedFood.cal * (parseFloat(qty) || 1))} kcal</span>
                                    <span style={{ color: "#555" }}> · </span>
                                    <span style={{ color: rank.color }}>{Math.round(selectedFood.protein * (parseFloat(qty) || 1) * 10) / 10}g protein</span>
                                </span>
                            </div>
                            <button onClick={addFood} style={S.btn(`linear-gradient(135deg,#2ECC71,#27AE60)`)}>
                                ✅ Add to {mealTime}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Logged meals */}
            {grouped.length > 0 ? (
                grouped.map(group => (
                    <div key={group.time} style={S.card}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <div style={{ ...S.heading, fontSize: 16 }}>{group.time}</div>
                            <div style={{ fontSize: 12, color: "#555" }}>
                                {group.entries.reduce((s, e) => s + e.cal, 0)} kcal · {group.entries.reduce((s, e) => s + e.protein, 0).toFixed(1)}g protein
                            </div>
                        </div>
                        {group.entries.map(entry => (
                            <div key={entry.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1A1A2A" }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, color: "#C0C0D8" }}>{entry.name}</div>
                                    <div style={{ fontSize: 11, color: "#555" }}>×{entry.qty} {entry.unit}</div>
                                </div>
                                <div style={{ textAlign: "right", marginRight: 10 }}>
                                    <div style={{ fontSize: 13, color: "#E8921A", fontWeight: 700 }}>{entry.cal} kcal</div>
                                    <div style={{ fontSize: 11, color: rank.color }}>{entry.protein}g P</div>
                                </div>
                                <button
                                    onClick={() => removeEntry(entry.id)}
                                    style={{ background: "none", border: "none", color: "#E84040", cursor: "pointer", fontSize: 18, padding: "0 4px" }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                ))
            ) : (
                <div style={{ ...S.card, textAlign: "center", padding: "30px 20px" }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🍽️</div>
                    <div style={{ fontSize: 14, color: "#555" }}>No meals logged yet today</div>
                    <div style={{ fontSize: 12, color: "#333", marginTop: 4 }}>Tap + Add Food to start tracking</div>
                </div>
            )}
        </div>
    );
}
