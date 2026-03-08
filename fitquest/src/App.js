import { useState, useEffect, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const WORKOUT_PLAN = [
  { day: "Monday",    type: "PUSH", emoji: "🔴", xp: 100, exercises: ["Bench Press 4×8","Overhead Press 3×10","Incline DB Press 3×12","Tricep Pushdowns 3×12","Lateral Raises 3×15"] },
  { day: "Tuesday",   type: "PULL", emoji: "🔵", xp: 100, exercises: ["Barbell Rows 4×8","Lat Pulldowns 3×10","Seated Cable Rows 3×12","Bicep Curls 3×12","Face Pulls 3×15"] },
  { day: "Wednesday", type: "LEGS", emoji: "🟡", xp: 120, exercises: ["Squats 4×8","Romanian Deadlifts 3×10","Leg Press 3×12","Leg Curls 3×12","Calf Raises 4×15"] },
  { day: "Thursday",  type: "REST", emoji: "🟢", xp: 30,  exercises: ["30-min brisk walk","Stretching / Mobility"] },
  { day: "Friday",    type: "PUSH", emoji: "🔴", xp: 100, exercises: ["DB Press 4×10","Arnold Press 3×10","Cable Flyes 3×12","Skull Crushers 3×12","Lateral Raises 3×15"] },
  { day: "Saturday",  type: "PULL", emoji: "🔵", xp: 120, exercises: ["Deadlifts 4×5","Pull-ups 3×8","DB Rows 3×10","Hammer Curls 3×12","Reverse Flyes 3×15"] },
  { day: "Sunday",    type: "REST", emoji: "🟢", xp: 20,  exercises: ["Full rest","Light yoga / stretching","Sleep 7–8 hours"] },
];

const HABITS = [
  { id: "protein", label: "Hit protein goal",    detail: "150–170g per day",       xp: 30, icon: "🥩" },
  { id: "water",   label: "Drink 3–4L water",    detail: "Stay hydrated all day",  xp: 20, icon: "💧" },
  { id: "sleep",   label: "Sleep 7–8 hours",     detail: "Recovery = gains",       xp: 25, icon: "😴" },
  { id: "nojunk",  label: "No junk food",        detail: "No sugary drinks either",xp: 20, icon: "🚫" },
  { id: "steps",   label: "10,000+ steps",       detail: "Keep moving all day",    xp: 15, icon: "👟" },
];

const RANKS = [
  { name: "Couch Warrior",     min: 0,    color: "#8B7355", badge: "🛋️" },
  { name: "Gym Newbie",        min: 500,  color: "#6B9E6B", badge: "🌱" },
  { name: "Iron Beginner",     min: 1500, color: "#4A90B8", badge: "⚡" },
  { name: "Grind Mode",        min: 3000, color: "#7B68EE", badge: "💜" },
  { name: "Beast Mode",        min: 5000, color: "#E8921A", badge: "🔥" },
  { name: "Bangalore Alpha",   min: 8000, color: "#E84040", badge: "👑" },
];

const MEAL_PLAN = [
  { time: "7:00 AM",  name: "Breakfast",    food: "6 eggs (3 whole + 3 whites) + 2 whole wheat rotis + 1 banana", macros: "450 kcal · 40g protein" },
  { time: "10:30 AM", name: "Snack",        food: "200g Greek yogurt / hung curd + handful of peanuts", macros: "250 kcal · 20g protein" },
  { time: "1:00 PM",  name: "Lunch",        food: "200g chicken/paneer + 1 cup dal + 2 rotis + salad", macros: "550 kcal · 45g protein" },
  { time: "4:00 PM",  name: "Pre-Workout",  food: "1 banana + 1 scoop whey protein in water", macros: "250 kcal · 25g protein" },
  { time: "7:00 PM",  name: "Post-Workout", food: "1 scoop whey + low-fat milk OR 200g chicken breast", macros: "300 kcal · 35g protein" },
  { time: "8:30 PM",  name: "Dinner",       food: "2 egg omelette + 1 cup sabzi + 1 roti + dal", macros: "400 kcal · 30g protein" },
];

// ─── Indian Food Database ─────────────────────────────────────────────────────

const FOOD_DB = [
  // Grains & Rotis
  { id: "roti",         name: "Roti (wheat)",        cal: 71,  protein: 2.7, unit: "per roti",    cat: "🌾 Grains" },
  { id: "rice",         name: "Rice (cooked)",        cal: 130, protein: 2.7, unit: "per 100g",    cat: "🌾 Grains" },
  { id: "brown_rice",   name: "Brown Rice (cooked)",  cal: 112, protein: 2.6, unit: "per 100g",    cat: "🌾 Grains" },
  { id: "oats",         name: "Oats (cooked)",        cal: 68,  protein: 2.4, unit: "per 100g",    cat: "🌾 Grains" },
  { id: "bread",        name: "Whole wheat bread",    cal: 69,  protein: 3.6, unit: "per slice",   cat: "🌾 Grains" },
  { id: "idli",         name: "Idli",                 cal: 39,  protein: 1.9, unit: "per idli",    cat: "🌾 Grains" },
  { id: "dosa",         name: "Plain Dosa",           cal: 133, protein: 3.4, unit: "per dosa",    cat: "🌾 Grains" },
  { id: "poha",         name: "Poha (cooked)",        cal: 130, protein: 2.6, unit: "per 100g",    cat: "🌾 Grains" },
  { id: "upma",         name: "Upma",                 cal: 150, protein: 3.5, unit: "per 100g",    cat: "🌾 Grains" },

  // Proteins
  { id: "egg_whole",    name: "Egg (whole)",          cal: 77,  protein: 6,   unit: "per egg",     cat: "🥩 Protein" },
  { id: "egg_white",    name: "Egg white",            cal: 17,  protein: 3.6, unit: "per white",   cat: "🥩 Protein" },
  { id: "chicken",      name: "Chicken breast",       cal: 165, protein: 31,  unit: "per 100g",    cat: "🥩 Protein" },
  { id: "chicken_leg",  name: "Chicken leg/thigh",    cal: 209, protein: 26,  unit: "per 100g",    cat: "🥩 Protein" },
  { id: "fish",         name: "Fish (rohu/tilapia)",  cal: 97,  protein: 20,  unit: "per 100g",    cat: "🥩 Protein" },
  { id: "paneer",       name: "Paneer",               cal: 265, protein: 18,  unit: "per 100g",    cat: "🥩 Protein" },
  { id: "whey",         name: "Whey protein (scoop)", cal: 120, protein: 25,  unit: "per scoop",   cat: "🥩 Protein" },
  { id: "dal",          name: "Dal (cooked)",         cal: 116, protein: 7.6, unit: "per 100g",    cat: "🥩 Protein" },
  { id: "chana",        name: "Chana (boiled)",       cal: 164, protein: 8.9, unit: "per 100g",    cat: "🥩 Protein" },
  { id: "rajma",        name: "Rajma (cooked)",       cal: 127, protein: 8.7, unit: "per 100g",    cat: "🥩 Protein" },
  { id: "tofu",         name: "Tofu",                 cal: 76,  protein: 8,   unit: "per 100g",    cat: "🥩 Protein" },
  { id: "soya",         name: "Soya chunks (dry)",    cal: 345, protein: 52,  unit: "per 100g",    cat: "🥩 Protein" },

  // Dairy
  { id: "milk",         name: "Milk (full fat)",      cal: 61,  protein: 3.2, unit: "per 100ml",   cat: "🥛 Dairy" },
  { id: "milk_low",     name: "Milk (low fat)",       cal: 42,  protein: 3.4, unit: "per 100ml",   cat: "🥛 Dairy" },
  { id: "curd",         name: "Curd / Dahi",          cal: 60,  protein: 3.1, unit: "per 100g",    cat: "🥛 Dairy" },
  { id: "greek_yogurt", name: "Greek yogurt",         cal: 59,  protein: 10,  unit: "per 100g",    cat: "🥛 Dairy" },
  { id: "cheese",       name: "Cheese slice",         cal: 79,  protein: 5,   unit: "per slice",   cat: "🥛 Dairy" },

  // Vegetables
  { id: "sabzi",        name: "Sabzi / stir-fry veg", cal: 80,  protein: 2,   unit: "per 100g",    cat: "🥦 Veggies" },
  { id: "spinach",      name: "Palak / Spinach",      cal: 23,  protein: 2.9, unit: "per 100g",    cat: "🥦 Veggies" },
  { id: "broccoli",     name: "Broccoli",             cal: 34,  protein: 2.8, unit: "per 100g",    cat: "🥦 Veggies" },
  { id: "salad",        name: "Salad (mixed)",        cal: 20,  protein: 1,   unit: "per 100g",    cat: "🥦 Veggies" },

  // Fruits
  { id: "banana",       name: "Banana",               cal: 89,  protein: 1.1, unit: "per banana",  cat: "🍎 Fruits" },
  { id: "apple",        name: "Apple",                cal: 52,  protein: 0.3, unit: "per 100g",    cat: "🍎 Fruits" },
  { id: "mango",        name: "Mango",                cal: 60,  protein: 0.8, unit: "per 100g",    cat: "🍎 Fruits" },

  // Fats & Extras
  { id: "peanuts",      name: "Peanuts",              cal: 567, protein: 26,  unit: "per 100g",    cat: "🥜 Fats" },
  { id: "almonds",      name: "Almonds",              cal: 579, protein: 21,  unit: "per 100g",    cat: "🥜 Fats" },
  { id: "ghee",         name: "Ghee",                 cal: 112, protein: 0,   unit: "per tbsp",    cat: "🥜 Fats" },
  { id: "oil",          name: "Cooking oil",          cal: 120, protein: 0,   unit: "per tbsp",    cat: "🥜 Fats" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRank(xp) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].min) return { ...RANKS[i], index: i };
  }
  return { ...RANKS[0], index: 0 };
}

function getNextRank(xp) {
  const idx = getRank(xp).index;
  return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function getTodayWorkout() {
  const d = new Date().getDay();
  return WORKOUT_PLAN[(d + 6) % 7];
}

function saveUser(uid, data) {
  localStorage.setItem(`fq_user_${uid}`, JSON.stringify(data));
}

function loadUser(uid) {
  try { return JSON.parse(localStorage.getItem(`fq_user_${uid}`)); } catch { return null; }
}

function listUsers() {
  const users = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("fq_user_")) {
      try {
        const u = JSON.parse(localStorage.getItem(k));
        if (u) users.push(u);
      } catch {}
    }
  }
  return users;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  app: { fontFamily: "'Barlow', sans-serif", background: "#0A0A0F", minHeight: "100dvh", color: "#E8E8F0", maxWidth: 480, margin: "0 auto", position: "relative" },
  card: { background: "#111118", border: "1px solid #1E1E2E", borderRadius: 16, padding: 18 },
  btn: (bg, color="#fff") => ({ background: bg, border: "none", borderRadius: 12, color, padding: "13px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, textTransform: "uppercase", transition: "opacity 0.15s", width: "100%" }),
  input: { width: "100%", padding: "13px 16px", background: "#1A1A2A", border: "1px solid #2A2A40", borderRadius: 12, color: "#E8E8F0", fontSize: 16, outline: "none", fontFamily: "'Barlow', sans-serif" },
  label: { fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6, display: "block" },
  row: { display: "flex", alignItems: "center", gap: 10 },
  col: { display: "flex", flexDirection: "column", gap: 12 },
  heading: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, letterSpacing: 1 },
};

// ─── Meal Tracker Component ───────────────────────────────────────────────────

function MealTracker({ user, save, rank }) {
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

// ─── Progress Photos Component ────────────────────────────────────────────────

function ProgressPhotos({ user, save, rank }) {
  const [selectedView, setSelectedView] = useState("front");
  const photos = user.progressPhotos || [];

  const VIEWS = ["front", "side", "back"];
  const VIEW_LABELS = { front: "Front", side: "Side", back: "Back" };

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const entry = {
        id: Date.now(),
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        dateRaw: new Date().toISOString().split("T")[0],
        view: selectedView,
        img: ev.target.result,
        weight: user.weightLog?.slice(-1)[0]?.weight || user.startWeight,
      };
      save({ progressPhotos: [...photos, entry] });
    };
    reader.readAsDataURL(file);
  }

  function deletePhoto(id) {
    save({ progressPhotos: photos.filter(p => p.id !== id) });
  }

  const filtered = photos.filter(p => p.view === selectedView);
  const first = filtered[0];
  const latest = filtered.length > 1 ? filtered[filtered.length - 1] : null;

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

// ─── Onboarding ───────────────────────────────────────────────────────────────

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("");

  const goals = ["Lose fat + build muscle", "Lose fat only", "Build muscle only", "Just get healthier"];

  function finish() {
    if (!name.trim()) return;
    const uid = Date.now().toString(36);
    const w = parseFloat(weight) || 80;
    const h = parseFloat(height) || 170;
    const targetWeight = Math.round(w * 0.78);
    const dailyKcal = Math.round(w * 24 * 0.85);
    const protein = Math.round(w * 1.7);
    const userData = {
      uid, name: name.trim(), startWeight: w, height: h, goal,
      targetWeight, dailyKcal, protein,
      xp: 0, streak: 0, lastWorkoutDate: null,
      weightLog: [{ date: "Start", weight: w, ts: Date.now() }],
      completedWorkouts: {}, completedHabits: {},
      mealLog: {},
      joinedDate: todayStr(),
    };
    saveUser(uid, userData);
    onComplete(userData);
  }

  const steps = [
    <div key={0} style={S.col}>
      <div style={{ textAlign: "center", padding: "20px 0 10px" }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>💪</div>
        <div style={{ ...S.heading, fontSize: 36, color: "#E8E8F0" }}>FITQUEST</div>
        <div style={{ fontSize: 15, color: "#666", marginTop: 6 }}>Level up your body. For real.</div>
      </div>
      <div style={{ marginTop: 20 }}>
        <label style={S.label}>Your Name</label>
        <input style={S.input} placeholder="e.g. Rahul" value={name} onChange={e => setName(e.target.value)} autoFocus />
      </div>
      <button style={S.btn("linear-gradient(135deg,#7B68EE,#5A4FCF)")} onClick={() => name.trim() && setStep(1)}>
        Let's Go →
      </button>
    </div>,

    <div key={1} style={S.col}>
      <div style={{ ...S.heading, fontSize: 28 }}>Your Stats, {name} 📊</div>
      <p style={{ fontSize: 14, color: "#666" }}>We'll calculate your exact calorie & protein targets.</p>
      <div>
        <label style={S.label}>Current Weight (kg)</label>
        <input style={S.input} type="number" placeholder="e.g. 108" value={weight} onChange={e => setWeight(e.target.value)} />
      </div>
      <div>
        <label style={S.label}>Height (cm)</label>
        <input style={S.input} type="number" placeholder="e.g. 173" value={height} onChange={e => setHeight(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button style={{ ...S.btn("#1E1E2E", "#888"), flex: "0 0 80px" }} onClick={() => setStep(0)}>← Back</button>
        <button style={{ ...S.btn("linear-gradient(135deg,#7B68EE,#5A4FCF)"), flex: 1 }} onClick={() => weight && height && setStep(2)}>Next →</button>
      </div>
    </div>,

    <div key={2} style={S.col}>
      <div style={{ ...S.heading, fontSize: 28 }}>Your Goal 🎯</div>
      <p style={{ fontSize: 14, color: "#666" }}>Pick what matters most to you right now.</p>
      {goals.map(g => (
        <button key={g} onClick={() => setGoal(g)} style={{ ...S.btn(goal === g ? "linear-gradient(135deg,#7B68EE,#5A4FCF)" : "#1E1E2E", goal === g ? "#fff" : "#888"), textAlign: "left" }}>
          {goal === g ? "✅ " : "   "}{g}
        </button>
      ))}
      <div style={{ display: "flex", gap: 10 }}>
        <button style={{ ...S.btn("#1E1E2E", "#888"), flex: "0 0 80px" }} onClick={() => setStep(1)}>← Back</button>
        <button style={{ ...S.btn("linear-gradient(135deg,#E8921A,#C07010)"), flex: 1 }} onClick={() => goal && finish()}>
          Start Quest 🚀
        </button>
      </div>
    </div>,
  ];

  return (
    <div style={{ ...S.app, padding: "40px 20px 60px" }}>
      {steps[step]}
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("today");
  const [levelUpRank, setLevelUpRank] = useState(null);
  const [weightInput, setWeightInput] = useState("");
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const lastUid = localStorage.getItem("fq_last_uid");
    if (lastUid) {
      const u = loadUser(lastUid);
      if (u) setUser(u);
    }
    setAllUsers(listUsers());
  }, []);

  const save = useCallback((updates) => {
    setUser(prev => {
      const next = { ...prev, ...updates };
      saveUser(next.uid, next);
      return next;
    });
  }, []);

  function handleOnboard(userData) {
    localStorage.setItem("fq_last_uid", userData.uid);
    setUser(userData);
    setAllUsers(listUsers());
  }

  function switchUser(u) {
    localStorage.setItem("fq_last_uid", u.uid);
    setUser(u);
    setShowSwitcher(false);
  }

  if (!user) return <Onboarding onComplete={handleOnboard} />;

  const today = todayStr();
  const todayWorkout = getTodayWorkout();
  const workoutDone = !!user.completedWorkouts?.[today];
  const habitsToday = user.completedHabits?.[today] || {};
  const rank = getRank(user.xp);
  const nextRank = getNextRank(user.xp);
  const rankProgress = nextRank ? Math.min(100, ((user.xp - rank.min) / (nextRank.min - rank.min)) * 100) : 100;
  const lostKg = Math.max(0, user.startWeight - (user.weightLog?.slice(-1)[0]?.weight || user.startWeight)).toFixed(1);
  const toGoKg = Math.max(0, (user.weightLog?.slice(-1)[0]?.weight || user.startWeight) - user.targetWeight).toFixed(1);
  const totalHabitXp = HABITS.filter(h => habitsToday[h.id]).reduce((s, h) => s + h.xp, 0);

  // Meal summary for today tab
  const mealLog = user.mealLog?.[today] || [];
  const totalCalToday = mealLog.reduce((s, e) => s + e.cal, 0);
  const totalProteinToday = mealLog.reduce((s, e) => s + e.protein, 0);

  function toggleWorkout() {
    const done = !workoutDone;
    const prevRank = getRank(user.xp);
    const delta = todayWorkout.xp * (done ? 1 : -1);
    const newXp = Math.max(0, user.xp + delta);
    const newStreak = done ? user.streak + 1 : Math.max(0, user.streak - 1);
    const newRank = getRank(newXp);
    save({
      xp: newXp,
      streak: newStreak,
      lastWorkoutDate: done ? today : user.lastWorkoutDate,
      completedWorkouts: { ...user.completedWorkouts, [today]: done },
    });
    if (done && newRank.name !== prevRank.name) setLevelUpRank(newRank);
  }

  function toggleHabit(id, xp) {
    const prev = habitsToday[id];
    const delta = xp * (prev ? -1 : 1);
    save({
      xp: Math.max(0, user.xp + delta),
      completedHabits: { ...user.completedHabits, [today]: { ...habitsToday, [id]: !prev } },
    });
  }

  function logWeight() {
    const w = parseFloat(weightInput);
    if (!w || w < 30 || w > 250) return;
    const entry = { date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }), weight: w, ts: Date.now() };
    save({ weightLog: [...(user.weightLog || []), entry] });
    setWeightInput("");
  }

  return (
    <div style={S.app}>
      {/* Level Up Overlay */}
      {levelUpRank && (
        <div onClick={() => setLevelUpRank(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 72 }}>{levelUpRank.badge}</div>
          <div style={{ ...S.heading, fontSize: 42, color: "#FFD700" }}>RANK UP!</div>
          <div style={{ ...S.heading, fontSize: 24, color: levelUpRank.color }}>{levelUpRank.name}</div>
          <div style={{ fontSize: 13, color: "#555", marginTop: 8 }}>tap to continue</div>
        </div>
      )}

      {/* User Switcher */}
      {showSwitcher && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "flex-end" }}>
          <div style={{ ...S.card, width: "100%", maxWidth: 480, margin: "0 auto", borderRadius: "20px 20px 0 0", padding: 24, maxHeight: "70vh", overflowY: "auto" }}>
            <div style={{ ...S.heading, fontSize: 20, marginBottom: 16 }}>Switch Profile</div>
            {allUsers.map(u => (
              <button key={u.uid} onClick={() => switchUser(u)} style={{ ...S.btn(u.uid === user.uid ? "#1E1E3A" : "#1A1A2A", u.uid === user.uid ? "#A89EFF" : "#E8E8F0"), marginBottom: 8, textAlign: "left", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{getRank(u.xp).badge}</span>
                <div>
                  <div>{u.name}</div>
                  <div style={{ fontSize: 11, opacity: 0.6, fontWeight: 400 }}>{u.xp} XP · {getRank(u.xp).name}</div>
                </div>
              </button>
            ))}
            <button style={{ ...S.btn("linear-gradient(135deg,#7B68EE,#5A4FCF)"), marginTop: 8 }} onClick={() => { setShowSwitcher(false); setUser(null); localStorage.removeItem("fq_last_uid"); }}>
              + New Profile
            </button>
            <button style={{ ...S.btn("#1E1E2E", "#666"), marginTop: 8 }} onClick={() => setShowSwitcher(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: "linear-gradient(180deg,#12121E,#0A0A0F)", borderBottom: "1px solid #1E1E2E", padding: "16px 16px 0", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: "#444", letterSpacing: 3, textTransform: "uppercase" }}>FitQuest</div>
            <button onClick={() => setShowSwitcher(true)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
              <div style={{ ...S.heading, fontSize: 22, color: "#E8E8F0" }}>{user.name} {rank.badge}</div>
            </button>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, textTransform: "uppercase" }}>Streak</div>
            <div style={{ ...S.heading, fontSize: 28, color: "#FF6B35" }}>{user.streak} 🔥</div>
          </div>
        </div>

        {/* XP Bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: rank.color }}>{rank.name}</span>
            <span style={{ fontSize: 12, color: "#555" }}>{user.xp} XP{nextRank ? ` / ${nextRank.min}` : " MAX"}</span>
          </div>
          <div style={{ background: "#1A1A2A", borderRadius: 6, height: 8, overflow: "hidden" }}>
            <div style={{ width: `${rankProgress}%`, height: "100%", background: `linear-gradient(90deg,${rank.color},${rank.color}99)`, transition: "width 0.6s ease", borderRadius: 6 }} />
          </div>
          {nextRank && <div style={{ fontSize: 10, color: "#444", marginTop: 3, textAlign: "right" }}>next: {nextRank.name}</div>}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex" }}>
          {[["today","📅 Today"],["meals","🍽️ Meals"],["photos","📸 Photos"],["plan","💪 Plan"],["stats","📊 Stats"]].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "9px 0", background: "none", border: "none", borderBottom: tab === t ? `2px solid ${rank.color}` : "2px solid transparent", color: tab === t ? "#E8E8F0" : "#444", fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase", transition: "all 0.2s", fontFamily: "'Barlow Condensed', sans-serif" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Body */}
      <div style={{ padding: "16px 16px 100px", overflowY: "auto" }}>

        {/* ── TODAY ── */}
        {tab === "today" && (
          <div style={S.col}>
            {/* Quick stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { label: "Lost", value: `-${lostKg}kg`, color: "#2ECC71" },
                { label: "To go", value: `${toGoKg}kg`, color: "#E8921A" },
                { label: "Habits", value: `${Object.values(habitsToday).filter(Boolean).length}/${HABITS.length}`, color: rank.color },
              ].map(s => (
                <div key={s.label} style={{ ...S.card, textAlign: "center", padding: "12px 8px" }}>
                  <div style={{ ...S.heading, fontSize: 22, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "#555", letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Calorie mini summary */}
            <div style={{ ...S.card, padding: "12px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#555", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Today's calories</div>
                  <div style={{ ...S.heading, fontSize: 22, color: "#E8921A" }}>{totalCalToday} <span style={{ fontSize: 13, color: "#555", fontWeight: 400 }}>/ {user.dailyKcal} kcal</span></div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#555", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Protein</div>
                  <div style={{ ...S.heading, fontSize: 22, color: rank.color }}>{Math.round(totalProteinToday)}g <span style={{ fontSize: 13, color: "#555", fontWeight: 400 }}>/ {user.protein}g</span></div>
                </div>
              </div>
              <button onClick={() => setTab("meals")} style={{ ...S.btn("#1A1A2A", "#888"), marginTop: 10, fontSize: 12 }}>
                🍽️ Log food →
              </button>
            </div>

            {/* Workout card */}
            <div style={{ ...S.card, border: `1px solid ${workoutDone ? "#2ECC7155" : "#1E1E2E"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>
                    {new Date().toLocaleDateString("en-IN", { weekday: "long" })}
                  </div>
                  <div style={{ ...S.heading, fontSize: 24, marginTop: 3 }}>
                    {todayWorkout.emoji} {todayWorkout.type} DAY
                  </div>
                </div>
                <div style={{ ...S.heading, fontSize: 22, color: "#FFD700" }}>+{todayWorkout.xp} XP</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
                {todayWorkout.exercises.map((ex, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "7px 12px", background: "#1A1A2A", borderRadius: 8, alignItems: "center" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: rank.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: "#C0C0D8" }}>{ex}</span>
                  </div>
                ))}
              </div>
              <button onClick={toggleWorkout} style={S.btn(workoutDone ? "#1A2E1A" : `linear-gradient(135deg,${rank.color},${rank.color}BB)`, workoutDone ? "#2ECC71" : "#fff")}>
                {workoutDone ? `✅ Done! +${todayWorkout.xp} XP earned` : `🏋️ Mark Workout Complete`}
              </button>
            </div>

            {/* Habits */}
            <div style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ ...S.heading, fontSize: 18 }}>Daily Habits</div>
                <div style={{ ...S.heading, fontSize: 16, color: "#FFD700" }}>+{totalHabitXp} XP</div>
              </div>
              <div style={S.col}>
                {HABITS.map(h => {
                  const done = !!habitsToday[h.id];
                  return (
                    <button key={h.id} onClick={() => toggleHabit(h.id, h.xp)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", background: done ? "#0F1F0F" : "#141420", border: `1px solid ${done ? "#2ECC7133" : "#1E1E2E"}`, borderRadius: 12, cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                      <span style={{ fontSize: 22 }}>{h.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, color: done ? "#2ECC71" : "#C0C0D8", fontWeight: 600, textDecoration: done ? "line-through" : "none" }}>{h.label}</div>
                        <div style={{ fontSize: 11, color: "#555", marginTop: 1 }}>{h.detail}</div>
                      </div>
                      <span style={{ fontSize: 12, color: "#FFD700", fontWeight: 700, marginRight: 4 }}>+{h.xp}</span>
                      <span style={{ fontSize: 18 }}>{done ? "✅" : "⬜"}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Log Weight */}
            <div style={S.card}>
              <div style={{ ...S.heading, fontSize: 18, marginBottom: 14 }}>⚖️ Log Weight</div>
              <div style={{ display: "flex", gap: 10 }}>
                <input type="number" placeholder="e.g. 107.5 kg" value={weightInput} onChange={e => setWeightInput(e.target.value)} style={{ ...S.input, flex: 1 }} onKeyDown={e => e.key === "Enter" && logWeight()} />
                <button onClick={logWeight} style={{ ...S.btn("linear-gradient(135deg,#E8921A,#C07010)"), width: "auto", padding: "13px 20px" }}>LOG</button>
              </div>
              {user.weightLog?.length > 1 && (
                <div style={{ marginTop: 12, padding: "10px 14px", background: "#0F1A0F", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "#666" }}>Total lost so far</span>
                  <span style={{ ...S.heading, fontSize: 18, color: "#2ECC71" }}>−{lostKg} kg 📉</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MEALS ── */}
        {tab === "meals" && (
          <MealTracker user={user} save={save} rank={rank} />
        )}

        {/* ── PHOTOS ── */}
        {tab === "photos" && (
          <ProgressPhotos user={user} save={save} rank={rank} />
        )}

        {/* ── PLAN ── */}
        {tab === "plan" && (
          <div style={S.col}>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>Weekly Schedule</div>
            {WORKOUT_PLAN.map((w, i) => (
              <div key={i} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: w.type !== "REST" ? 12 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{w.emoji}</span>
                    <div>
                      <div style={{ ...S.heading, fontSize: 18 }}>{w.day}</div>
                      <div style={{ fontSize: 11, color: "#555", letterSpacing: 1 }}>{w.type}</div>
                    </div>
                  </div>
                  <div style={{ ...S.heading, fontSize: 16, color: "#FFD700" }}>+{w.xp} XP</div>
                </div>
                {w.exercises.map((ex, j) => (
                  <div key={j} style={{ fontSize: 13, color: "#8080A0", padding: "4px 0 4px 14px", borderLeft: "2px solid #1E1E2E", marginBottom: 3 }}>{ex}</div>
                ))}
              </div>
            ))}

            <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginTop: 8 }}>Daily Meal Plan</div>
            <div style={{ ...S.card, padding: "8px 0" }}>
              {MEAL_PLAN.map((m, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "12px 16px", borderBottom: i < MEAL_PLAN.length - 1 ? "1px solid #1E1E2E" : "none", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 11, color: rank.color, fontWeight: 700, minWidth: 60, paddingTop: 2 }}>{m.time}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: "#666", lineHeight: 1.4 }}>{m.food}</div>
                    <div style={{ fontSize: 11, color: "#E8921A", marginTop: 4 }}>{m.macros}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={S.card}>
              <div style={{ ...S.heading, fontSize: 18, marginBottom: 14 }}>🎯 Your Targets</div>
              {[
                { label: "Daily Calories", value: `${user.dailyKcal} kcal` },
                { label: "Daily Protein", value: `${user.protein}g` },
                { label: "Target Weight", value: `${user.targetWeight} kg` },
                { label: "Goal", value: user.goal },
              ].map(t => (
                <div key={t.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #1E1E2E" }}>
                  <span style={{ fontSize: 13, color: "#666" }}>{t.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{t.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STATS ── */}
        {tab === "stats" && (
          <div style={S.col}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Total XP", value: user.xp, unit: "pts", color: "#FFD700" },
                { label: "Streak", value: user.streak, unit: "days 🔥", color: "#FF6B35" },
                { label: "Lost", value: `-${lostKg}`, unit: "kg", color: "#2ECC71" },
                { label: "To Goal", value: toGoKg, unit: "kg left", color: "#E8921A" },
              ].map(s => (
                <div key={s.label} style={{ ...S.card, textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
                  <div style={{ ...S.heading, fontSize: 30, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#555" }}>{s.unit}</div>
                </div>
              ))}
            </div>

            <div style={S.card}>
              <div style={{ ...S.heading, fontSize: 18, marginBottom: 14 }}>⚖️ Weight History</div>
              {(user.weightLog || []).slice().reverse().slice(0, 10).map((w, i, arr) => {
                const prev = arr[i + 1];
                const diff = prev ? (w.weight - prev.weight).toFixed(1) : null;
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < arr.length - 1 ? "1px solid #1A1A2A" : "none" }}>
                    <span style={{ fontSize: 13, color: "#666" }}>{w.date}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ ...S.heading, fontSize: 18 }}>{w.weight} kg</span>
                      {diff !== null && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: parseFloat(diff) < 0 ? "#2ECC71" : "#E84040" }}>
                          {parseFloat(diff) < 0 ? "▼" : "▲"} {Math.abs(diff)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={S.card}>
              <div style={{ ...S.heading, fontSize: 18, marginBottom: 14 }}>⚔️ Rank Ladder</div>
              {RANKS.map((r, i) => {
                const active = user.xp >= r.min && (i === RANKS.length - 1 || user.xp < RANKS[i + 1].min);
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: i < RANKS.length - 1 ? "1px solid #1A1A2A" : "none", opacity: user.xp < r.min ? 0.3 : 1 }}>
                    <span style={{ fontSize: 20 }}>{r.badge}</span>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: active ? 800 : 400, color: active ? r.color : "#888" }}>{r.name}</span>
                    <span style={{ fontSize: 11, color: "#444" }}>{r.min} XP</span>
                    {active && <span style={{ fontSize: 10, background: r.color, color: "#000", padding: "3px 8px", borderRadius: 20, fontWeight: 800 }}>YOU</span>}
                  </div>
                );
              })}
            </div>

            <div style={S.card}>
              <div style={{ ...S.heading, fontSize: 18, marginBottom: 14 }}>🏁 6-Month Milestones</div>
              {[
                { m: "Month 1", kg: Math.round(user.startWeight * 0.963), focus: "Build the habit" },
                { m: "Month 2", kg: Math.round(user.startWeight * 0.926), focus: "Increase all weights" },
                { m: "Month 3", kg: Math.round(user.startWeight * 0.889), focus: "Visible face/chest change" },
                { m: "Month 6", kg: Math.round(user.startWeight * 0.796), focus: "Full transformation" },
              ].map((ms, i) => {
                const reached = (user.weightLog?.slice(-1)[0]?.weight || user.startWeight) <= ms.kg;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: i < 3 ? "1px solid #1A1A2A" : "none" }}>
                    <span style={{ fontSize: 20 }}>{reached ? "✅" : "🎯"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: reached ? "#2ECC71" : "#E8E8F0" }}>{ms.m} — {ms.kg} kg</div>
                      <div style={{ fontSize: 12, color: "#555" }}>{ms.focus}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
