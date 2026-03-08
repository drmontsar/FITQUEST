export const WORKOUT_PLAN = [
    { day: "Monday", type: "PUSH", emoji: "🔴", xp: 100, exercises: ["Bench Press 4×8", "Overhead Press 3×10", "Incline DB Press 3×12", "Tricep Pushdowns 3×12", "Lateral Raises 3×15"] },
    { day: "Tuesday", type: "PULL", emoji: "🔵", xp: 100, exercises: ["Barbell Rows 4×8", "Lat Pulldowns 3×10", "Seated Cable Rows 3×12", "Bicep Curls 3×12", "Face Pulls 3×15"] },
    { day: "Wednesday", type: "LEGS", emoji: "🟡", xp: 120, exercises: ["Squats 4×8", "Romanian Deadlifts 3×10", "Leg Press 3×12", "Leg Curls 3×12", "Calf Raises 4×15"] },
    { day: "Thursday", type: "REST", emoji: "🟢", xp: 30, exercises: ["30-min brisk walk", "Stretching / Mobility"] },
    { day: "Friday", type: "PUSH", emoji: "🔴", xp: 100, exercises: ["DB Press 4×10", "Arnold Press 3×10", "Cable Flyes 3×12", "Skull Crushers 3×12", "Lateral Raises 3×15"] },
    { day: "Saturday", type: "PULL", emoji: "🔵", xp: 120, exercises: ["Deadlifts 4×5", "Pull-ups 3×8", "DB Rows 3×10", "Hammer Curls 3×12", "Reverse Flyes 3×15"] },
    { day: "Sunday", type: "REST", emoji: "🟢", xp: 20, exercises: ["Full rest", "Light yoga / stretching", "Sleep 7–8 hours"] },
];

export const HABITS = [
    { id: "protein", label: "Hit protein goal", detail: "150–170g per day", xp: 30, icon: "🥩" },
    { id: "water", label: "Drink 3–4L water", detail: "Stay hydrated all day", xp: 20, icon: "💧" },
    { id: "sleep", label: "Sleep 7–8 hours", detail: "Recovery = gains", xp: 25, icon: "😴" },
    { id: "nojunk", label: "No junk food", detail: "No sugary drinks either", xp: 20, icon: "🚫" },
    { id: "steps", label: "10,000+ steps", detail: "Keep moving all day", xp: 15, icon: "👟" },
];

export const RANKS = [
    { name: "Couch Warrior", min: 0, color: "#8B7355", badge: "🛋️" },
    { name: "Gym Newbie", min: 500, color: "#6B9E6B", badge: "🌱" },
    { name: "Iron Beginner", min: 1500, color: "#4A90B8", badge: "⚡" },
    { name: "Grind Mode", min: 3000, color: "#7B68EE", badge: "💜" },
    { name: "Beast Mode", min: 5000, color: "#E8921A", badge: "🔥" },
    { name: "Bangalore Alpha", min: 8000, color: "#E84040", badge: "👑" },
];

export const MEAL_PLAN = [
    { time: "7:00 AM", name: "Breakfast", food: "6 eggs (3 whole + 3 whites) + 2 whole wheat rotis + 1 banana", macros: "450 kcal · 40g protein" },
    { time: "10:30 AM", name: "Snack", food: "200g Greek yogurt / hung curd + handful of peanuts", macros: "250 kcal · 20g protein" },
    { time: "1:00 PM", name: "Lunch", food: "200g chicken/paneer + 1 cup dal + 2 rotis + salad", macros: "550 kcal · 45g protein" },
    { time: "4:00 PM", name: "Pre-Workout", food: "1 banana + 1 scoop whey protein in water", macros: "250 kcal · 25g protein" },
    { time: "7:00 PM", name: "Post-Workout", food: "1 scoop whey + low-fat milk OR 200g chicken breast", macros: "300 kcal · 35g protein" },
    { time: "8:30 PM", name: "Dinner", food: "2 egg omelette + 1 cup sabzi + 1 roti + dal", macros: "400 kcal · 30g protein" },
];

export const FOOD_DB = [
    // Grains & Rotis
    { id: "roti", name: "Roti (wheat)", cal: 71, protein: 2.7, unit: "per roti", cat: "🌾 Grains" },
    { id: "rice", name: "Rice (cooked)", cal: 130, protein: 2.7, unit: "per 100g", cat: "🌾 Grains" },
    { id: "brown_rice", name: "Brown Rice (cooked)", cal: 112, protein: 2.6, unit: "per 100g", cat: "🌾 Grains" },
    { id: "oats", name: "Oats (cooked)", cal: 68, protein: 2.4, unit: "per 100g", cat: "🌾 Grains" },
    { id: "bread", name: "Whole wheat bread", cal: 69, protein: 3.6, unit: "per slice", cat: "🌾 Grains" },
    { id: "idli", name: "Idli", cal: 39, protein: 1.9, unit: "per idli", cat: "🌾 Grains" },
    { id: "dosa", name: "Plain Dosa", cal: 133, protein: 3.4, unit: "per dosa", cat: "🌾 Grains" },
    { id: "poha", name: "Poha (cooked)", cal: 130, protein: 2.6, unit: "per 100g", cat: "🌾 Grains" },
    { id: "upma", name: "Upma", cal: 150, protein: 3.5, unit: "per 100g", cat: "🌾 Grains" },

    // Proteins
    { id: "egg_whole", name: "Egg (whole)", cal: 77, protein: 6, unit: "per egg", cat: "🥩 Protein" },
    { id: "egg_white", name: "Egg white", cal: 17, protein: 3.6, unit: "per white", cat: "🥩 Protein" },
    { id: "chicken", name: "Chicken breast", cal: 165, protein: 31, unit: "per 100g", cat: "🥩 Protein" },
    { id: "chicken_leg", name: "Chicken leg/thigh", cal: 209, protein: 26, unit: "per 100g", cat: "🥩 Protein" },
    { id: "fish", name: "Fish (rohu/tilapia)", cal: 97, protein: 20, unit: "per 100g", cat: "🥩 Protein" },
    { id: "paneer", name: "Paneer", cal: 265, protein: 18, unit: "per 100g", cat: "🥩 Protein" },
    { id: "whey", name: "Whey protein (scoop)", cal: 120, protein: 25, unit: "per scoop", cat: "🥩 Protein" },
    { id: "dal", name: "Dal (cooked)", cal: 116, protein: 7.6, unit: "per 100g", cat: "🥩 Protein" },
    { id: "chana", name: "Chana (boiled)", cal: 164, protein: 8.9, unit: "per 100g", cat: "🥩 Protein" },
    { id: "rajma", name: "Rajma (cooked)", cal: 127, protein: 8.7, unit: "per 100g", cat: "🥩 Protein" },
    { id: "tofu", name: "Tofu", cal: 76, protein: 8, unit: "per 100g", cat: "🥩 Protein" },
    { id: "soya", name: "Soya chunks (dry)", cal: 345, protein: 52, unit: "per 100g", cat: "🥩 Protein" },

    // Dairy
    { id: "milk", name: "Milk (full fat)", cal: 61, protein: 3.2, unit: "per 100ml", cat: "🥛 Dairy" },
    { id: "milk_low", name: "Milk (low fat)", cal: 42, protein: 3.4, unit: "per 100ml", cat: "🥛 Dairy" },
    { id: "curd", name: "Curd / Dahi", cal: 60, protein: 3.1, unit: "per 100g", cat: "🥛 Dairy" },
    { id: "greek_yogurt", name: "Greek yogurt", cal: 59, protein: 10, unit: "per 100g", cat: "🥛 Dairy" },
    { id: "cheese", name: "Cheese slice", cal: 79, protein: 5, unit: "per slice", cat: "🥛 Dairy" },

    // Vegetables
    { id: "sabzi", name: "Sabzi / stir-fry veg", cal: 80, protein: 2, unit: "per 100g", cat: "🥦 Veggies" },
    { id: "spinach", name: "Palak / Spinach", cal: 23, protein: 2.9, unit: "per 100g", cat: "🥦 Veggies" },
    { id: "broccoli", name: "Broccoli", cal: 34, protein: 2.8, unit: "per 100g", cat: "🥦 Veggies" },
    { id: "salad", name: "Salad (mixed)", cal: 20, protein: 1, unit: "per 100g", cat: "🥦 Veggies" },

    // Fruits
    { id: "banana", name: "Banana", cal: 89, protein: 1.1, unit: "per banana", cat: "🍎 Fruits" },
    { id: "apple", name: "Apple", cal: 52, protein: 0.3, unit: "per 100g", cat: "🍎 Fruits" },
    { id: "mango", name: "Mango", cal: 60, protein: 0.8, unit: "per 100g", cat: "🍎 Fruits" },

    // Fats & Extras
    { id: "peanuts", name: "Peanuts", cal: 567, protein: 26, unit: "per 100g", cat: "🥜 Fats" },
    { id: "almonds", name: "Almonds", cal: 579, protein: 21, unit: "per 100g", cat: "🥜 Fats" },
    { id: "ghee", name: "Ghee", cal: 112, protein: 0, unit: "per tbsp", cat: "🥜 Fats" },
    { id: "oil", name: "Cooking oil", cal: 120, protein: 0, unit: "per tbsp", cat: "🥜 Fats" },
];

export const EXERCISE_DB = {
    "🔴 Push": [
        "Bench Press", "Incline Bench Press", "Decline Bench Press", "DB Press", "Incline DB Press",
        "Cable Flyes", "Pec Deck", "Push-ups", "Dips", "Overhead Press", "Arnold Press",
        "DB Lateral Raises", "Cable Lateral Raises", "Front Raises", "Tricep Pushdowns",
        "Skull Crushers", "Overhead Tricep Extension", "Close Grip Bench", "Tricep Dips",
    ],
    "🔵 Pull": [
        "Barbell Rows", "DB Rows", "Cable Rows", "Seated Cable Rows", "T-Bar Rows",
        "Lat Pulldowns", "Pull-ups", "Chin-ups", "Face Pulls", "Rear Delt Flyes",
        "Reverse Flyes", "Shrugs", "Barbell Curls", "DB Curls", "Hammer Curls",
        "Preacher Curls", "Cable Curls", "Incline DB Curls", "Deadlifts",
    ],
    "🟡 Legs": [
        "Squats", "Front Squats", "Bulgarian Split Squats", "Leg Press", "Hack Squats",
        "Romanian Deadlifts", "Stiff Leg Deadlifts", "Leg Curls", "Leg Extensions",
        "Walking Lunges", "Reverse Lunges", "Hip Thrusts", "Glute Bridges",
        "Calf Raises", "Seated Calf Raises", "Box Jumps", "Step-ups",
    ],
    "🟢 Cardio / Rest": [
        "Brisk Walk 30 min", "Brisk Walk 45 min", "Jog 20 min", "Jog 30 min",
        "Cycling 30 min", "Swimming 30 min", "Jump Rope 15 min", "Stairmaster 20 min",
        "Stretching / Mobility", "Foam Rolling", "Full Rest", "Light Walk", "Sleep 7-8 hours",
    ],
    "💪 Full Body": [
        "Clean and Press", "Thrusters", "Kettlebell Swings", "Burpees", "Turkish Get-ups",
        "Farmer Walks", "Sled Push", "Battle Ropes", "Medicine Ball Slams",
    ],
    "🤸 Calisthenics": [
        "Push-ups", "Diamond Push-ups", "Wide Push-ups", "Archer Push-ups", "Pike Push-ups",
        "Pull-ups", "Chin-ups", "Australian Rows", "Dips", "Tricep Dips",
        "Bodyweight Squats", "Jump Squats", "Pistol Squats", "Bulgarian Split Squats",
        "Lunges", "Reverse Lunges", "Glute Bridges", "Single Leg Glute Bridge",
        "Plank", "Side Plank", "Hollow Body Hold", "L-Sit",
        "Hanging Knee Raises", "Leg Raises", "V-Ups", "Mountain Climbers",
        "Burpees", "Bear Crawl", "Inchworm", "Superman Hold",
        "Muscle-up", "Handstand Hold", "Handstand Push-ups", "Human Flag Progression",
    ],
    "🧘 Yoga": [
        "Sun Salutation A", "Sun Salutation B", "Warrior I", "Warrior II", "Warrior III",
        "Triangle Pose", "Extended Side Angle", "Half Moon Pose", "Chair Pose",
        "Downward Dog", "Upward Dog", "Cobra", "Locust Pose", "Bow Pose",
        "Child's Pose", "Pigeon Pose", "Seated Forward Fold", "Seated Twist",
        "Bridge Pose", "Wheel Pose", "Camel Pose", "Fish Pose",
        "Tree Pose", "Eagle Pose", "Dancer Pose", "Standing Split",
        "Shavasana 10 min", "Yin Yoga 30 min", "Restorative Yoga 30 min",
        "Yoga Flow 20 min", "Yoga Flow 45 min", "Power Yoga 30 min",
    ],
    "🥊 Sports & Martial Arts": [
        "Boxing Rounds 3x3 min", "Shadow Boxing 15 min", "Heavy Bag 20 min",
        "Kickboxing 30 min", "BJJ Drilling 30 min", "Wrestling Practice",
        "Badminton 30 min", "Cricket Net Practice", "Football Practice",
        "Basketball 30 min", "Swimming Laps 30 min", "Cycling Outdoors 45 min",
        "Rock Climbing 1 hr", "Rowing 20 min", "Skipping 15 min",
    ],
    "🧠 Mind & Recovery": [
        "Meditation 10 min", "Meditation 20 min", "Breathwork 10 min", "Pranayama 15 min",
        "Foam Rolling 15 min", "Mobility Flow 20 min", "Cold Shower", "Ice Bath",
        "Full Body Stretch 20 min", "Hip Mobility 15 min", "Shoulder Mobility 15 min",
        "Ankle Mobility 10 min", "Sleep 7-8 hours", "Nap 20 min", "Rest Day",
    ],
};

export const ALL_EXERCISES = Object.values(EXERCISE_DB).flat();

export const DAY_TYPES = [
    { type: "PUSH", emoji: "🔴", xp: 100, cat: "🔴 Push" },
    { type: "PULL", emoji: "🔵", xp: 100, cat: "🔵 Pull" },
    { type: "LEGS", emoji: "🟡", xp: 120, cat: "🟡 Legs" },
    { type: "FULL BODY", emoji: "💪", xp: 120, cat: "💪 Full Body" },
    { type: "CALISTHENICS", emoji: "🤸", xp: 100, cat: "🤸 Calisthenics" },
    { type: "YOGA", emoji: "🧘", xp: 60, cat: "🧘 Yoga" },
    { type: "SPORT", emoji: "🥊", xp: 80, cat: "🥊 Sports & Martial Arts" },
    { type: "RECOVERY", emoji: "🧠", xp: 40, cat: "🧠 Mind & Recovery" },
    { type: "CARDIO", emoji: "🏃", xp: 60, cat: "🟢 Cardio / Rest" },
    { type: "REST", emoji: "🟢", xp: 30, cat: "🟢 Cardio / Rest" },
];

export const EXPERIENCE_LEVELS = [
    { id: "new", label: "Just starting out", detail: "Brand new to training", xp: 0, hasCustomised: false, emoji: "🌱" },
    { id: "beginner", label: "3–6 months", detail: "Some gym experience", xp: 600, hasCustomised: true, emoji: "⚡" },
    { id: "intermediate", label: "1–2 years", detail: "I follow a structured plan", xp: 1600, hasCustomised: true, emoji: "💪" },
    { id: "advanced", label: "Gym regular (2+ years)", detail: "I know what I'm doing", xp: 3100, hasCustomised: true, emoji: "🔥" },
];
