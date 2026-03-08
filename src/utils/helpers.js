import { RANKS, WORKOUT_PLAN } from '../constants/data';

export function getRank(xp) {
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (xp >= RANKS[i].min) return { ...RANKS[i], index: i };
    }
    return { ...RANKS[0], index: 0 };
}

export function getNextRank(xp) {
    const idx = getRank(xp).index;
    return idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

export function todayStr() {
    return new Date().toISOString().split("T")[0];
}

export function getTodayWorkout() {
    const d = new Date().getDay();
    return WORKOUT_PLAN[(d + 6) % 7];
}

export function saveUser(uid, data) {
    localStorage.setItem(`fq_user_${uid}`, JSON.stringify(data));
}

export function loadUser(uid) {
    try { return JSON.parse(localStorage.getItem(`fq_user_${uid}`)); } catch { return null; }
}

export function listUsers() {
    const users = [];
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("fq_user_")) {
            try {
                const u = JSON.parse(localStorage.getItem(k));
                if (u) users.push(u);
            } catch { }
        }
    }
    return users;
}
