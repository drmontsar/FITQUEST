import React, { useState } from 'react';
import { EXPERIENCE_LEVELS } from '../constants/data';
import { saveUser, todayStr } from '../utils/helpers';
import { S } from '../styles/theme';

export function Onboarding({ onComplete }) {
    const [step, setStep] = useState(0);
    const [name, setName] = useState("");
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [goal, setGoal] = useState("");
    const [experience, setExperience] = useState("");

    const goals = ["Lose fat + build muscle", "Lose fat only", "Build muscle only", "Just get healthier"];

    function finish() {
        if (!name.trim()) return;
        const uid = Date.now().toString(36);
        const w = parseFloat(weight) || 80;
        const h = parseFloat(height) || 170;
        const targetWeight = Math.round(w * 0.78);
        const dailyKcal = Math.round(w * 24 * 0.85);
        const protein = Math.round(w * 1.7);
        const expLevel = EXPERIENCE_LEVELS.find(e => e.id === experience) || EXPERIENCE_LEVELS[0];
        const userData = {
            uid, name: name.trim(), startWeight: w, height: h, goal,
            experience: expLevel.id,
            targetWeight, dailyKcal, protein,
            xp: expLevel.xp,
            hasCustomised: expLevel.hasCustomised,
            streak: 0, lastWorkoutDate: null,
            weightLog: [{ date: "Start", weight: w, ts: Date.now() }],
            completedWorkouts: {}, completedHabits: {},
            mealLog: {},
            joinedDate: todayStr(),
        };
        saveUser(uid, userData);
        onComplete(userData);
    }

    const steps = [
        // Step 0 — Name
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

        // Step 1 — Stats
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

        // Step 2 — Goal
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
                <button style={{ ...S.btn("linear-gradient(135deg,#7B68EE,#5A4FCF)"), flex: 1 }} onClick={() => goal && setStep(3)}>Next →</button>
            </div>
        </div>,

        // Step 3 — Experience
        <div key={3} style={S.col}>
            <div style={{ ...S.heading, fontSize: 28 }}>Training Experience 🏋️</div>
            <p style={{ fontSize: 14, color: "#666" }}>Be honest — this sets your starting point fairly.</p>
            {EXPERIENCE_LEVELS.map(e => (
                <button key={e.id} onClick={() => setExperience(e.id)}
                    style={{ ...S.btn(experience === e.id ? "linear-gradient(135deg,#7B68EE,#5A4FCF)" : "#1E1E2E", experience === e.id ? "#fff" : "#888"), textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24 }}>{e.emoji}</span>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 700 }}>{experience === e.id ? "✅ " : ""}{e.label}</div>
                        <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{e.detail}{e.xp > 0 ? " · Starts at " + e.xp + " AURA" : ""}</div>
                    </div>
                </button>
            ))}
            <div style={{ padding: "10px 14px", background: "#0F1020", borderRadius: 10, border: "1px solid #1E1E2E" }}>
                <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6 }}>
                    💡 Experienced users unlock plan customisation immediately. Newbies unlock it as they level up — so the app grows with you.
                </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
                <button style={{ ...S.btn("#1E1E2E", "#888"), flex: "0 0 80px" }} onClick={() => setStep(2)}>← Back</button>
                <button style={{ ...S.btn("linear-gradient(135deg,#E8921A,#C07010)"), flex: 1 }} onClick={() => experience && finish()}>
                    Start Quest 🚀
                </button>
            </div>
        </div>,
    ];

    return (
        <div style={{ ...S.app, padding: "40px 20px 60px" }}>
            {/* Step indicator */}
            <div style={{ display: "flex", gap: 6, marginBottom: 24, justifyContent: "center" }}>
                {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, background: i === step ? "#7B68EE" : i < step ? "#7B68EE55" : "#1E1E2E", transition: "all 0.3s" }} />
                ))}
            </div>
            {steps[step]}
        </div>
    );
}
