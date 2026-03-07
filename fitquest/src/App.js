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
  const d = new Date().getDay(); // 0=Sun
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

// ─── Screens ──────────────────────────────────────────────────────────────────

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
      joinedDate: todayStr(),
    };
    saveUser(uid, userData);
    onComplete(userData);
  }

  const steps = [
    // Step 0: Name
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

    // Step 1: Stats
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

    // Step 2: Goal
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

  // Load saved user on mount
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
          {[["today","📅 Today"],["plan","💪 Plan"],["stats","📊 Stats"]].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "9px 0", background: "none", border: "none", borderBottom: tab === t ? `2px solid ${rank.color}` : "2px solid transparent", color: tab === t ? "#E8E8F0" : "#444", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase", transition: "all 0.2s", fontFamily: "'Barlow Condensed', sans-serif" }}>
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

            {/* Targets */}
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
            {/* Grid */}
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

            {/* Weight Log */}
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

            {/* Ranks */}
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

            {/* 6-month milestones */}
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
