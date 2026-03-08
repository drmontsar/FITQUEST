import React, { useState } from 'react';
import { WORKOUT_PLAN, MEAL_PLAN, FOOD_DB, ALL_EXERCISES, EXERCISE_DB, DAY_TYPES } from '../constants/data';
import { S } from '../styles/theme';

export function PlanEditor({ user, save, rank }) {
    const [planTab, setPlanTab] = useState("workout");
    const [editingDay, setEditingDay] = useState(null);
    const [editingMeal, setEditingMeal] = useState(null);
    const [exSearch, setExSearch] = useState("");
    const [showAddEx, setShowAddEx] = useState(false);
    const [customExInput, setCustomExInput] = useState("");
    const [foodSearch, setFoodSearch] = useState("");
    const [selectedFood, setSelectedFood] = useState(null);
    const [foodQty, setFoodQty] = useState("1");
    const [showAddFood, setShowAddFood] = useState(false);
    const [showCustomFood, setShowCustomFood] = useState(false);
    const [customFood, setCustomFood] = useState({ name: "", cal: "", protein: "", unit: "per 100g" });
    const [showUnlockPrompt, setShowUnlockPrompt] = useState(false);

    // Customisation unlocks by AURA tier OR if manually unlocked via onboarding
    // 500 AURA  → meal editing
    // 1500 AURA → exercise editing
    // 3000 AURA → full plan builder + custom foods
    const canEditMeals = user.hasCustomised || user.xp >= 500;
    const canEditExercises = user.hasCustomised || user.xp >= 1500;
    const canFullCustomise = user.hasCustomised || user.xp >= 3000;
    const isAdvanced = canEditMeals; // used for general gating

    function unlockCustomise() {
        setShowUnlockPrompt(false);
        save({ hasCustomised: true });
    }

    const workoutPlan = user.customWorkoutPlan || WORKOUT_PLAN.map(d => ({ ...d, exercises: [...d.exercises] }));
    const mealPlan = user.customMealPlan || MEAL_PLAN.map(m => ({ ...m, items: [] }));
    const customFoods = user.customFoods || [];
    const allFoods = [...FOOD_DB, ...customFoods];

    function saveWorkoutPlan(plan) { save({ customWorkoutPlan: plan }); }
    function saveMealPlan(plan) { save({ customMealPlan: plan }); }

    function updateDayType(dayIdx, typeObj) {
        const plan = workoutPlan.map((d, i) => i === dayIdx ? { ...d, type: typeObj.type, emoji: typeObj.emoji, xp: typeObj.xp } : d);
        saveWorkoutPlan(plan);
    }

    function removeExercise(dayIdx, exIdx) {
        const plan = workoutPlan.map((d, i) => i === dayIdx ? { ...d, exercises: d.exercises.filter((_, j) => j !== exIdx) } : d);
        saveWorkoutPlan(plan);
    }

    function addExercise(dayIdx, ex) {
        const plan = workoutPlan.map((d, i) => i === dayIdx ? { ...d, exercises: [...d.exercises, ex] } : d);
        saveWorkoutPlan(plan);
        setExSearch(""); setShowAddEx(false);
    }

    function updateExercise(dayIdx, exIdx, val) {
        const plan = workoutPlan.map((d, i) => {
            if (i !== dayIdx) return d;
            const exs = [...d.exercises];
            exs[exIdx] = val;
            return { ...d, exercises: exs };
        });
        saveWorkoutPlan(plan);
    }

    function resetWorkout() { save({ customWorkoutPlan: null }); setEditingDay(null); }

    function updateMealFood(mealIdx, val) {
        const plan = mealPlan.map((m, i) => i === mealIdx ? { ...m, food: val } : m);
        saveMealPlan(plan);
    }

    function updateMealMacros(mealIdx, val) {
        const plan = mealPlan.map((m, i) => i === mealIdx ? { ...m, macros: val } : m);
        saveMealPlan(plan);
    }

    function updateMealTime(mealIdx, val) {
        const plan = mealPlan.map((m, i) => i === mealIdx ? { ...m, time: val } : m);
        saveMealPlan(plan);
    }

    function addMealSlot() {
        const plan = [...mealPlan, { time: "12:00 PM", name: "Meal " + (mealPlan.length + 1), food: "", macros: "0 kcal · 0g protein", items: [] }];
        saveMealPlan(plan);
    }

    function removeMealSlot(idx) { saveMealPlan(mealPlan.filter((_, i) => i !== idx)); }

    function addFoodToMeal(mealIdx) {
        if (!selectedFood) return;
        const q = parseFloat(foodQty) || 1;
        const cal = Math.round(selectedFood.cal * q);
        const protein = Math.round(selectedFood.protein * q * 10) / 10;
        const plan = mealPlan.map((m, i) => {
            if (i !== mealIdx) return m;
            const items = [...(m.items || []), { name: selectedFood.name, qty: q, unit: selectedFood.unit, cal, protein }];
            const totalCal = items.reduce((s, it) => s + it.cal, 0);
            const totalProt = items.reduce((s, it) => s + it.protein, 0).toFixed(1);
            return { ...m, items, food: items.map(it => it.qty + "x " + it.name).join(" + "), macros: totalCal + " kcal · " + totalProt + "g protein" };
        });
        saveMealPlan(plan);
        setSelectedFood(null); setFoodSearch(""); setFoodQty("1"); setShowAddFood(false);
    }

    function removeFoodItem(mealIdx, itemIdx) {
        const plan = mealPlan.map((m, i) => {
            if (i !== mealIdx) return m;
            const items = m.items.filter((_, j) => j !== itemIdx);
            const totalCal = items.reduce((s, it) => s + it.cal, 0);
            const totalProt = items.reduce((s, it) => s + it.protein, 0).toFixed(1);
            return { ...m, items, food: items.length ? items.map(it => it.qty + "x " + it.name).join(" + ") : m.food, macros: items.length ? totalCal + " kcal · " + totalProt + "g protein" : m.macros };
        });
        saveMealPlan(plan);
    }

    function saveCustomFood() {
        if (!customFood.name || !customFood.cal) return;
        const f = { id: "custom_" + Date.now(), name: customFood.name, cal: parseFloat(customFood.cal), protein: parseFloat(customFood.protein) || 0, unit: customFood.unit, cat: "⭐ My Foods" };
        save({ customFoods: [...customFoods, f] });
        setCustomFood({ name: "", cal: "", protein: "", unit: "per 100g" });
        setShowCustomFood(false);
    }

    function resetMeals() { save({ customMealPlan: null }); setEditingMeal(null); }

    const filteredEx = exSearch.length > 1 ? ALL_EXERCISES.filter(e => e.toLowerCase().includes(exSearch.toLowerCase())).slice(0, 10) : [];
    const filteredFood = foodSearch.length > 1 ? allFoods.filter(f => f.name.toLowerCase().includes(foodSearch.toLowerCase())).slice(0, 8) : [];

    return (
        <div style={S.col}>

            {/* Unlock prompt overlay */}
            {showUnlockPrompt && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                    <div style={{ ...S.card, maxWidth: 360, textAlign: "center", padding: 28 }}>
                        <div style={{ fontSize: 44, marginBottom: 12 }}>⚙️</div>
                        <div style={{ ...S.heading, fontSize: 24, marginBottom: 8 }}>Ready to customise?</div>
                        <div style={{ fontSize: 14, color: "#666", lineHeight: 1.6, marginBottom: 20 }}>
                            You can now edit exercises, swap meals, change sets & reps, and build your own plan from scratch.
                        </div>
                        <button onClick={unlockCustomise} style={S.btn("linear-gradient(135deg," + rank.color + "," + rank.color + "BB)")}>
                            Yes, unlock customisation
                        </button>
                        <button onClick={() => setShowUnlockPrompt(false)} style={{ ...S.btn("#1A1A2A", "#666"), marginTop: 10 }}>
                            Not yet
                        </button>
                    </div>
                </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
                {[["workout", "💪 Workout"], ["meals", "🍽️ Meals"]].map(([t, label]) => (
                    <button key={t} onClick={() => setPlanTab(t)} style={{ flex: 1, padding: "11px 0", borderRadius: 12, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", background: planTab === t ? rank.color : "#1A1A2A", color: planTab === t ? "#000" : "#666", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, textTransform: "uppercase" }}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Progressive unlock status */}
            {!canFullCustomise && (
                <div style={{ ...S.card, background: "#0F0F1A", padding: "12px 16px" }}>
                    <div style={{ fontSize: 12, color: "#555", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Customisation Unlocks</div>
                    {[
                        { label: "Edit meals", xp: 500, unlocked: canEditMeals },
                        { label: "Edit exercises & sets", xp: 1500, unlocked: canEditExercises },
                        { label: "Full plan builder + custom foods", xp: 3000, unlocked: canFullCustomise },
                    ].map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: i < 2 ? "1px solid #1A1A2A" : "none" }}>
                            <span style={{ fontSize: 16 }}>{item.unlocked ? "✅" : "🔒"}</span>
                            <span style={{ flex: 1, fontSize: 13, color: item.unlocked ? "#2ECC71" : "#555" }}>{item.label}</span>
                            <span style={{ fontSize: 11, color: item.unlocked ? "#2ECC71" : "#444", fontWeight: 700 }}>{item.xp} AURA</span>
                        </div>
                    ))}
                    {!isAdvanced && (
                        <button onClick={() => setShowUnlockPrompt(true)} style={{ ...S.btn("#1A1A2A", "#7B68EE"), marginTop: 10, fontSize: 11, padding: "8px" }}>
                            Already experienced? Unlock everything →
                        </button>
                    )}
                </div>
            )}

            {planTab === "workout" && (
                <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>Weekly Workout Plan</div>
                        {isAdvanced && user.customWorkoutPlan && (
                            <button onClick={resetWorkout} style={{ background: "none", border: "none", fontSize: 11, color: "#E84040", cursor: "pointer", fontWeight: 700, letterSpacing: 1 }}>RESET DEFAULT</button>
                        )}
                    </div>

                    {workoutPlan.map((day, dayIdx) => (
                        <div key={dayIdx} style={{ ...S.card, border: editingDay === dayIdx ? "1px solid " + rank.color + "55" : "1px solid #1E1E2E" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ fontSize: 22 }}>{day.emoji}</span>
                                    <div>
                                        <div style={{ ...S.heading, fontSize: 18 }}>{day.day}</div>
                                        <div style={{ fontSize: 11, color: "#555" }}>{day.type}</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 13, color: "#FFD700", fontWeight: 700 }}>+{day.xp} AURA</span>
                                    {canEditExercises && (
                                        <button onClick={() => setEditingDay(editingDay === dayIdx ? null : dayIdx)}
                                            style={{ background: editingDay === dayIdx ? rank.color : "#1A1A2A", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 11, color: editingDay === dayIdx ? "#000" : "#888", cursor: "pointer", fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}>
                                            {editingDay === dayIdx ? "DONE" : "EDIT"}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {editingDay === dayIdx && (
                                <div style={{ marginBottom: 12 }}>
                                    <label style={S.label}>Day Type</label>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                                        {DAY_TYPES.map(dt => (
                                            <button key={dt.type} onClick={() => updateDayType(dayIdx, dt)}
                                                style={{ padding: "5px 10px", borderRadius: 20, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", background: day.type === dt.type ? rank.color : "#1A1A2A", color: day.type === dt.type ? "#000" : "#666", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}>
                                                {dt.emoji} {dt.type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {day.exercises.map((ex, exIdx) => (
                                    <div key={exIdx} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#1A1A2A", borderRadius: 8 }}>
                                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: rank.color, flexShrink: 0 }} />
                                        {editingDay === dayIdx ? (
                                            <>
                                                <input value={ex} onChange={e => updateExercise(dayIdx, exIdx, e.target.value)}
                                                    style={{ ...S.input, flex: 1, padding: "5px 10px", fontSize: 13, background: "transparent", border: "none", borderBottom: "1px solid #2A2A40", borderRadius: 0 }} />
                                                <button onClick={() => removeExercise(dayIdx, exIdx)} style={{ background: "none", border: "none", color: "#E84040", cursor: "pointer", fontSize: 18, padding: "0 2px", lineHeight: 1 }}>×</button>
                                            </>
                                        ) : (
                                            <span style={{ fontSize: 13, color: "#C0C0D8", flex: 1 }}>{ex}</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {editingDay === dayIdx && (
                                <div style={{ marginTop: 10 }}>
                                    {!showAddEx ? (
                                        <button onClick={() => setShowAddEx(true)} style={{ ...S.btn("#1A1A2A", rank.color), fontSize: 12, padding: "9px 14px" }}>+ Add Exercise</button>
                                    ) : (
                                        <div style={{ background: "#0A0A0F", borderRadius: 12, padding: 12, border: "1px solid #1E1E2E" }}>
                                            <input style={{ ...S.input, marginBottom: 8 }} placeholder="Search exercises..." value={exSearch} onChange={e => setExSearch(e.target.value)} autoFocus />
                                            {filteredEx.length > 0 && (
                                                <div style={{ marginBottom: 8 }}>
                                                    {filteredEx.map((ex, i) => (
                                                        <button key={i} onClick={() => addExercise(dayIdx, ex + " 3x10")}
                                                            style={{ display: "block", width: "100%", padding: "8px 12px", background: "none", border: "none", borderBottom: "1px solid #1A1A2A", color: "#C0C0D8", fontSize: 13, cursor: "pointer", textAlign: "left" }}>
                                                            {ex}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {exSearch.length === 0 && (
                                                <div style={{ marginBottom: 8 }}>
                                                    <div style={{ fontSize: 11, color: "#444", marginBottom: 6, letterSpacing: 1 }}>BROWSE BY MUSCLE</div>
                                                    {Object.entries(EXERCISE_DB).map(([cat, exs]) => (
                                                        <div key={cat} style={{ marginBottom: 8 }}>
                                                            <div style={{ fontSize: 11, color: rank.color, fontWeight: 700, marginBottom: 4 }}>{cat}</div>
                                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                                                {exs.slice(0, 6).map((ex, i) => (
                                                                    <button key={i} onClick={() => addExercise(dayIdx, ex + " 3x10")}
                                                                        style={{ padding: "4px 9px", borderRadius: 20, border: "1px solid #1E1E2E", background: "#1A1A2A", color: "#888", fontSize: 11, cursor: "pointer", fontFamily: "'Barlow', sans-serif" }}>
                                                                        {ex}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div style={{ display: "flex", gap: 8 }}>
                                                <input style={{ ...S.input, flex: 1, padding: "9px 12px", fontSize: 13 }} placeholder="Custom: e.g. Cable Crunches 3x15" value={customExInput} onChange={e => setCustomExInput(e.target.value)} />
                                                <button onClick={() => { if (customExInput.trim()) { addExercise(dayIdx, customExInput.trim()); setCustomExInput(""); } }} style={{ ...S.btn(rank.color, "#000"), width: "auto", padding: "9px 14px", fontSize: 12 }}>ADD</button>
                                            </div>
                                            <button onClick={() => { setShowAddEx(false); setExSearch(""); }} style={{ ...S.btn("#1A1A2A", "#666"), marginTop: 8, fontSize: 12, padding: "8px" }}>Cancel</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </>
            )}

            {planTab === "meals" && (
                <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>Daily Meal Plan</div>
                        {isAdvanced && user.customMealPlan && (
                            <button onClick={resetMeals} style={{ background: "none", border: "none", fontSize: 11, color: "#E84040", cursor: "pointer", fontWeight: 700, letterSpacing: 1 }}>RESET DEFAULT</button>
                        )}
                    </div>

                    {mealPlan.map((meal, mealIdx) => (
                        <div key={mealIdx} style={{ ...S.card, border: editingMeal === mealIdx ? "1px solid " + rank.color + "55" : "1px solid #1E1E2E" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                <div style={{ flex: 1 }}>
                                    {editingMeal === mealIdx ? (
                                        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                            <input value={meal.time} onChange={e => updateMealTime(mealIdx, e.target.value)} style={{ ...S.input, flex: "0 0 100px", padding: "6px 10px", fontSize: 13 }} placeholder="Time" />
                                            <div style={{ fontSize: 14, fontWeight: 700, alignSelf: "center", color: "#E8E8F0" }}>{meal.name}</div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ fontSize: 11, color: rank.color, fontWeight: 700 }}>{meal.time}</div>
                                            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{meal.name}</div>
                                        </>
                                    )}
                                </div>
                                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                    {canEditMeals && (
                                        <button onClick={() => setEditingMeal(editingMeal === mealIdx ? null : mealIdx)}
                                            style={{ background: editingMeal === mealIdx ? rank.color : "#1A1A2A", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 11, color: editingMeal === mealIdx ? "#000" : "#888", cursor: "pointer", fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}>
                                            {editingMeal === mealIdx ? "DONE" : "EDIT"}
                                        </button>
                                    )}
                                    {canEditMeals && editingMeal === mealIdx && (
                                        <button onClick={() => removeMealSlot(mealIdx)} style={{ background: "none", border: "none", color: "#E84040", cursor: "pointer", fontSize: 20, padding: 0 }}>×</button>
                                    )}
                                </div>
                            </div>

                            {(meal.items || []).length > 0 && (
                                <div style={{ marginBottom: 8 }}>
                                    {meal.items.map((item, itemIdx) => (
                                        <div key={itemIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #1A1A2A" }}>
                                            <div>
                                                <span style={{ fontSize: 13, color: "#C0C0D8" }}>{item.qty}x {item.name}</span>
                                                <span style={{ fontSize: 11, color: "#555", marginLeft: 6 }}>{item.unit}</span>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <span style={{ fontSize: 12, color: "#E8921A" }}>{item.cal}kcal</span>
                                                <span style={{ fontSize: 12, color: rank.color }}>{item.protein}g P</span>
                                                {editingMeal === mealIdx && (
                                                    <button onClick={() => removeFoodItem(mealIdx, itemIdx)} style={{ background: "none", border: "none", color: "#E84040", cursor: "pointer", fontSize: 16, padding: 0 }}>×</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{ fontSize: 12, color: "#E8921A", fontWeight: 700, marginTop: 6, textAlign: "right" }}>{meal.macros}</div>
                                </div>
                            )}

                            {(meal.items || []).length === 0 && (
                                editingMeal === mealIdx ? (
                                    <textarea value={meal.food} onChange={e => updateMealFood(mealIdx, e.target.value)}
                                        style={{ ...S.input, fontSize: 13, minHeight: 60, resize: "vertical", marginBottom: 6 }} placeholder="Describe your meal..." />
                                ) : (
                                    <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5, marginBottom: 4 }}>{meal.food}</div>
                                )
                            )}

                            {editingMeal !== mealIdx && (
                                <div style={{ fontSize: 11, color: "#E8921A" }}>{meal.macros}</div>
                            )}

                            {editingMeal === mealIdx && (
                                <div style={{ marginTop: 10 }}>
                                    {!showAddFood ? (
                                        <button onClick={() => setShowAddFood(true)} style={{ ...S.btn("#1A1A2A", rank.color), fontSize: 12, padding: "9px 14px" }}>+ Add Food from Database</button>
                                    ) : (
                                        <div style={{ background: "#0A0A0F", borderRadius: 12, padding: 12, border: "1px solid #1E1E2E", marginTop: 8 }}>
                                            <input style={{ ...S.input, marginBottom: 8 }} placeholder="Search food..." value={foodSearch} onChange={e => { setFoodSearch(e.target.value); setSelectedFood(null); }} autoFocus />
                                            {filteredFood.length > 0 && !selectedFood && (
                                                <div style={{ marginBottom: 8, borderRadius: 10, overflow: "hidden", border: "1px solid #1A1A2A" }}>
                                                    {filteredFood.map((f, i) => (
                                                        <button key={f.id} onClick={() => { setSelectedFood(f); setFoodSearch(f.name); }}
                                                            style={{ display: "flex", justifyContent: "space-between", width: "100%", padding: "9px 12px", background: "none", border: "none", borderBottom: i < filteredFood.length - 1 ? "1px solid #1A1A2A" : "none", cursor: "pointer", textAlign: "left" }}>
                                                            <div style={{ fontSize: 13, color: "#E8E8F0" }}>{f.name}</div>
                                                            <div style={{ fontSize: 12, color: "#E8921A" }}>{f.cal}kcal / {f.unit}</div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {selectedFood && (
                                                <div style={{ background: "#0F1A2A", borderRadius: 10, padding: 10, marginBottom: 8 }}>
                                                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{selectedFood.name} <span style={{ color: "#555", fontWeight: 400 }}>({selectedFood.unit})</span></div>
                                                    <div style={{ display: "flex", gap: 8 }}>
                                                        <input type="number" min="0.5" step="0.5" value={foodQty} onChange={e => setFoodQty(e.target.value)} style={{ ...S.input, flex: "0 0 80px", padding: "8px 10px", fontSize: 14 }} placeholder="Qty" />
                                                        <div style={{ fontSize: 13, alignSelf: "center", color: "#E8921A" }}>= {Math.round(selectedFood.cal * (parseFloat(foodQty) || 1))} kcal / {Math.round(selectedFood.protein * (parseFloat(foodQty) || 1) * 10) / 10}g P</div>
                                                    </div>
                                                    <button onClick={() => addFoodToMeal(mealIdx)} style={{ ...S.btn("linear-gradient(135deg,#2ECC71,#27AE60)"), marginTop: 8, fontSize: 12, padding: "9px" }}>Add to {meal.name}</button>
                                                </div>
                                            )}
                                            <button onClick={() => { setShowAddFood(false); setFoodSearch(""); setSelectedFood(null); }} style={{ ...S.btn("#1A1A2A", "#666"), fontSize: 12, padding: "8px" }}>Cancel</button>
                                        </div>
                                    )}
                                    {(meal.items || []).length === 0 && (
                                        <div style={{ marginTop: 8 }}>
                                            <label style={S.label}>Macros (manual)</label>
                                            <input value={meal.macros} onChange={e => updateMealMacros(mealIdx, e.target.value)} style={{ ...S.input, fontSize: 13 }} placeholder="e.g. 450 kcal · 40g protein" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {canFullCustomise && <button onClick={addMealSlot} style={S.btn("#1A1A2A", rank.color)}>+ Add Meal Slot</button>}

                    <div style={S.card}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showCustomFood ? 14 : 0 }}>
                            <div style={{ ...S.heading, fontSize: 16 }}>⭐ My Custom Foods</div>
                            {canFullCustomise && (
                                <button onClick={() => setShowCustomFood(!showCustomFood)} style={{ background: "none", border: "none", color: rank.color, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}>
                                    {showCustomFood ? "CANCEL" : "+ ADD FOOD"}
                                </button>
                            )}
                        </div>
                        {showCustomFood && (
                            <div style={S.col}>
                                <div>
                                    <label style={S.label}>Food Name</label>
                                    <input style={S.input} placeholder="e.g. Moong Dal Chilla" value={customFood.name} onChange={e => setCustomFood({ ...customFood, name: e.target.value })} />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                    <div>
                                        <label style={S.label}>Calories</label>
                                        <input type="number" style={S.input} placeholder="e.g. 120" value={customFood.cal} onChange={e => setCustomFood({ ...customFood, cal: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={S.label}>Protein (g)</label>
                                        <input type="number" style={S.input} placeholder="e.g. 8" value={customFood.protein} onChange={e => setCustomFood({ ...customFood, protein: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label style={S.label}>Unit</label>
                                    <input style={S.input} placeholder="e.g. per 100g / per piece" value={customFood.unit} onChange={e => setCustomFood({ ...customFood, unit: e.target.value })} />
                                </div>
                                <button onClick={saveCustomFood} style={S.btn("linear-gradient(135deg," + rank.color + "," + rank.color + "BB)")}>Save Food</button>
                            </div>
                        )}
                        {customFoods.length > 0 && (
                            <div style={{ marginTop: showCustomFood ? 12 : 0 }}>
                                {customFoods.map((f, i) => (
                                    <div key={f.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: i < customFoods.length - 1 ? "1px solid #1A1A2A" : "none" }}>
                                        <span style={{ fontSize: 13, color: "#C0C0D8" }}>{f.name}</span>
                                        <span style={{ fontSize: 12, color: "#E8921A" }}>{f.cal} kcal / {f.unit}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={S.card}>
                        <div style={{ ...S.heading, fontSize: 16, marginBottom: 12 }}>Your Targets</div>
                        {[
                            { label: "Daily Calories", value: user.dailyKcal + " kcal" },
                            { label: "Daily Protein", value: user.protein + "g" },
                            { label: "Target Weight", value: user.targetWeight + " kg" },
                        ].map(t => (
                            <div key={t.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E1E2E" }}>
                                <span style={{ fontSize: 13, color: "#666" }}>{t.label}</span>
                                <span style={{ fontSize: 14, fontWeight: 700 }}>{t.value}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
