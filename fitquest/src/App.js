import React, { useState, useEffect, useCallback } from "react";
import { HABITS, RANKS } from "./constants/data";
import { getRank, getNextRank, todayStr, getTodayWorkout, saveUser, loadUser, listUsers } from "./utils/helpers";
import { S } from "./styles/theme";

import { MealTracker } from "./components/MealTracker";
import { PlanEditor } from "./components/PlanEditor";
import { ProgressPhotos } from "./components/ProgressPhotos";
import { Onboarding } from "./components/Onboarding";

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("today");
  const [levelUpRank, setLevelUpRank] = useState(null);
  const [weightInput, setWeightInput] = useState("");
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const lastUid = localStorage.getItem("fq_last_uid");
    if (lastUid) {
      const u = loadUser(lastUid);
      if (u) setUser(u);
    }
    setAllUsers(listUsers());

    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    // Detect if already installed as PWA
    const installed = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    setIsInstalled(installed);

    // Capture Android/Chrome install prompt
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
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
    // Trigger install banner after first workout — good engagement moment
    if (done && !isInstalled && !localStorage.getItem("fq_install_dismissed")) {
      setTimeout(() => setShowInstallBanner(true), 1500);
    }
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

      {/* ── INSTALL BANNER ── */}
      {showInstallBanner && !isInstalled && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 150, maxWidth: 480, margin: "0 auto" }}>
          <div style={{ background: "linear-gradient(135deg,#12121E,#1A1A2E)", borderTop: "1px solid #7B68EE55", borderRadius: "20px 20px 0 0", padding: "18px 20px 28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 28 }}>💪</span>
                <div>
                  <div style={{ ...S.heading, fontSize: 17, color: "#E8E8F0" }}>Add FitQuest to Home Screen</div>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>Open it like an app, anytime</div>
                </div>
              </div>
              <button onClick={() => { setShowInstallBanner(false); localStorage.setItem("fq_install_dismissed", "1"); }}
                style={{ background: "none", border: "none", color: "#444", fontSize: 22, cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {installPrompt ? (
                <button onClick={async () => {
                  installPrompt.prompt();
                  const { outcome } = await installPrompt.userChoice;
                  if (outcome === "accepted") { setIsInstalled(true); }
                  setShowInstallBanner(false);
                  localStorage.setItem("fq_install_dismissed", "1");
                }} style={S.btn("linear-gradient(135deg,#7B68EE,#5A4FCF)")}>
                  📲 Install Now
                </button>
              ) : (
                <button onClick={() => { setShowInstallBanner(false); setShowInstallGuide(true); }}
                  style={S.btn("linear-gradient(135deg,#7B68EE,#5A4FCF)")}>
                  📲 Show Me How
                </button>
              )}
              <button onClick={() => { setShowInstallBanner(false); localStorage.setItem("fq_install_dismissed", "1"); }}
                style={{ ...S.btn("#1A1A2A", "#666"), flex: "0 0 100px" }}>
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INSTALL GUIDE MODAL ── */}
      {showInstallGuide && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
          <div style={{ background: "#111118", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, margin: "0 auto", padding: "24px 20px 40px", border: "1px solid #1E1E2E" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ ...S.heading, fontSize: 22 }}>📲 Add to Home Screen</div>
              <button onClick={() => { setShowInstallGuide(false); localStorage.setItem("fq_install_dismissed", "1"); }}
                style={{ background: "none", border: "none", color: "#444", fontSize: 24, cursor: "pointer" }}>×</button>
            </div>

            {isIOS ? (
              // iPhone instructions
              <div style={S.col}>
                <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>Follow these steps in Safari:</div>
                {[
                  { step: "1", icon: "⬆️", text: "Tap the Share button at the bottom of Safari (the box with an arrow pointing up)" },
                  { step: "2", icon: "📋", text: 'Scroll down in the share menu and tap "Add to Home Screen"' },
                  { step: "3", icon: "✅", text: 'Tap "Add" in the top right corner' },
                  { step: "4", icon: "🏠", text: "FitQuest will appear on your home screen like a real app!" },
                ].map(s => (
                  <div key={s.step} style={{ display: "flex", gap: 14, padding: "12px 14px", background: "#1A1A2A", borderRadius: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontSize: 11, color: "#555", letterSpacing: 1, marginBottom: 3 }}>STEP {s.step}</div>
                      <div style={{ fontSize: 14, color: "#C0C0D8", lineHeight: 1.5 }}>{s.text}</div>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "10px 14px", background: "#0F1020", borderRadius: 10, fontSize: 12, color: "#555", lineHeight: 1.6 }}>
                  💡 Make sure you are using Safari — Chrome on iPhone does not support this yet.
                </div>
              </div>
            ) : (
              // Android instructions
              <div style={S.col}>
                <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>Follow these steps in Chrome:</div>
                {[
                  { step: "1", icon: "⋮", text: 'Tap the three dots menu (⋮) in the top right corner of Chrome' },
                  { step: "2", icon: "📲", text: 'Tap "Add to Home screen" or "Install app"' },
                  { step: "3", icon: "✅", text: 'Tap "Add" to confirm' },
                  { step: "4", icon: "🏠", text: "FitQuest will appear on your home screen like a real app!" },
                ].map(s => (
                  <div key={s.step} style={{ display: "flex", gap: 14, padding: "12px 14px", background: "#1A1A2A", borderRadius: 12, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontSize: 11, color: "#555", letterSpacing: 1, marginBottom: 3 }}>STEP {s.step}</div>
                      <div style={{ fontSize: 14, color: "#C0C0D8", lineHeight: 1.5 }}>{s.text}</div>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "10px 14px", background: "#0F1020", borderRadius: 10, fontSize: 12, color: "#555", lineHeight: 1.6 }}>
                  💡 Make sure you are using Chrome — some other browsers may not support this.
                </div>
              </div>
            )}

            <button onClick={() => { setShowInstallGuide(false); localStorage.setItem("fq_install_dismissed", "1"); }}
              style={{ ...S.btn("linear-gradient(135deg,#7B68EE,#5A4FCF)"), marginTop: 20 }}>
              Got it!
            </button>
          </div>
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
                  <div style={{ fontSize: 11, opacity: 0.6, fontWeight: 400 }}>{u.xp} AURA · {getRank(u.xp).name}</div>
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

        {/* AURA Bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: rank.color }}>{rank.name}</span>
            <span style={{ fontSize: 12, color: "#555" }}>{user.xp} AURA{nextRank ? ` / ${nextRank.min}` : " MAX"}</span>
          </div>
          <div style={{ background: "#1A1A2A", borderRadius: 6, height: 8, overflow: "hidden" }}>
            <div style={{ width: `${rankProgress}%`, height: "100%", background: `linear-gradient(90deg,${rank.color},${rank.color}99)`, transition: "width 0.6s ease", borderRadius: 6 }} />
          </div>
          {nextRank && <div style={{ fontSize: 10, color: "#444", marginTop: 3, textAlign: "right" }}>next: {nextRank.name}</div>}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex" }}>
          {[["today", "📅 Today"], ["meals", "🍽️ Meals"], ["photos", "📸 Photos"], ["plan", "💪 Plan"], ["stats", "📊 Stats"]].map(([t, label]) => (
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
                <div style={{ ...S.heading, fontSize: 22, color: "#FFD700" }}>+{todayWorkout.xp} AURA</div>
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
                {workoutDone ? `✅ Done! +${todayWorkout.xp} AURA earned` : `🏋️ Mark Workout Complete`}
              </button>
            </div>

            {/* Habits */}
            <div style={S.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ ...S.heading, fontSize: 18 }}>Daily Habits</div>
                <div style={{ ...S.heading, fontSize: 16, color: "#FFD700" }}>+{totalHabitXp} AURA</div>
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
                      <span style={{ fontSize: 12, color: "#FFD700", fontWeight: 700, marginRight: 4 }}>+{h.xp} AURA</span>
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
          <PlanEditor user={user} save={save} rank={rank} />
        )}

        {/* ── STATS ── */}
        {tab === "stats" && (
          <div style={S.col}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Total AURA", value: user.xp, unit: "pts", color: "#FFD700" },
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
                    <span style={{ fontSize: 11, color: "#444" }}>{r.min} AURA</span>
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
