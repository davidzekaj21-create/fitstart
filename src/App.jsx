import { useEffect, useMemo, useState } from "react";
import "./App.css";

const STORAGE_KEY = "fitstart_progress_v1";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function App() {
  const [page, setPage] = useState("home");
  const [workoutTab, setWorkoutTab] = useState("bulk"); // bulk | cut | home
  const [dietTab, setDietTab] = useState("bulk"); // bulk | cut | maintain

  // -------- Track Progress (localStorage) --------
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(todayISO());
  const [weightKg, setWeightKg] = useState("");
  const [workouts, setWorkouts] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setEntries(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // ignore
    }
  }, [entries]);

  const latestEntry = useMemo(() => {
    if (!entries.length) return null;
    const sorted = [...entries].sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
    return sorted[0];
  }, [entries]);

  const totalEntries = entries.length;

  const handleAddEntry = (e) => {
    e.preventDefault();

    const w = Number(weightKg);
    const wd = Number(workouts);

    if (!date) return alert("Please select a date.");
    if (!Number.isFinite(w) || w <= 0) return alert("Please enter a valid weight in kg.");
    if (!Number.isFinite(wd) || wd < 0 || wd > 14) {
      return alert("Workouts must be a number (0–14).");
    }

    const newEntry = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      date,
      weightKg: Math.round(w * 10) / 10,
      workouts: Math.round(wd),
      notes: (notes || "").trim(),
      createdAt: Date.now(),
    };

    setEntries((prev) => [newEntry, ...prev]);
    setWeightKg("");
    setWorkouts("");
    setNotes("");
  };

  const deleteEntry = (id) => setEntries((prev) => prev.filter((x) => x.id !== id));

  const clearAll = () => {
    const ok = window.confirm("Are you sure you want to delete ALL progress data?");
    if (!ok) return;
    setEntries([]);
  };

  // -------- shared UI --------
  const TopBar = ({ active }) => (
    <header className="topBar fadeDown">
      <button className="logoBtn" onClick={() => setPage("home")}>
        <span className="logoMark" />
        <span className="logoText">FitStart</span>
      </button>

      <nav className="navGrid">
        <button
          className={`navBtn ${active === "story" ? "active" : ""}`}
          onClick={() => setPage("story")}
        >
          Our Story
        </button>

        <button
          className={`navBtn ${active === "fitness" ? "active" : ""}`}
          onClick={() => setPage("fitness")}
        >
          What Is Fitness
        </button>

        <button
          className={`navBtn ${active === "workouts" ? "active" : ""}`}
          onClick={() => setPage("workouts")}
        >
          Workouts
        </button>

        <button
          className={`navBtn ${active === "diets" ? "active" : ""}`}
          onClick={() => setPage("diets")}
        >
          Diets
        </button>

        <button
          className={`navBtn ${active === "track" ? "active" : ""}`}
          onClick={() => setPage("track")}
        >
          Track Progress
        </button>
      </nav>
    </header>
  );

  const BottomBar = () => (
    <footer className="bottomBar fadeUp2">
      <span className="credit">Created by MagnorGroup</span>
    </footer>
  );

  // -------- Workouts data --------
  const workoutData = useMemo(
    () => ({
      bulk: {
        title: "Bulking",
        subtitle: "Build muscle + strength with an Upper/Lower split (4 days/week).",
        tags: ["Strength", "Hypertrophy", "Progressive Overload"],
        plan: [
          { day: "Day 1 — Upper (Push Focus)", items: [
            "Bench Press / Dumbbell Press — 4×6–10",
            "Incline Dumbbell Press — 3×8–12",
            "Shoulder Press — 3×6–10",
            "Lateral Raises — 3×12–15",
            "Triceps Pushdown / Dips — 3×10–12",
          ]},
          { day: "Day 2 — Lower", items: [
            "Squat / Leg Press — 4×6–10",
            "Romanian Deadlift — 3×8–12",
            "Walking Lunges — 3×10 each leg",
            "Calf Raises — 4×10–15",
            "Planks / Hanging Knee Raises — 3 sets",
          ]},
          { day: "Day 3 — Upper (Pull Focus)", items: [
            "Pull-ups / Lat Pulldown — 4×6–12",
            "Row (Barbell / Machine / DB) — 4×8–12",
            "Face Pulls — 3×12–15",
            "Rear Delts — 3×12–15",
            "Biceps Curls — 3×10–12",
          ]},
          { day: "Day 4 — Lower + Accessories", items: [
            "Deadlift / Hip Hinge — 3×3–6 (or RDL 3×8–12)",
            "Split Squats — 3×8–12 each leg",
            "Hamstring Curl — 3×10–12",
            "Calf Raises — 3×12–15",
            "Core (Your choice) — 3 sets",
          ]},
        ],
        tips: [
          "Progression rule: add reps first, then add weight.",
          "Rest 90–150 seconds for big lifts; 60–90 seconds for accessories.",
          "Train close to failure on your last set (good form).",
        ],
      },

      cut: {
        title: "Cutting",
        subtitle: "Lose fat while keeping muscle: Full Body (3 days/week) + cardio.",
        tags: ["Fat Loss", "Muscle Retention", "Conditioning"],
        plan: [
          { day: "Day 1 — Full Body A", items: [
            "Squat / Leg Press — 3×6–10",
            "Bench Press / DB Press — 3×6–10",
            "Row — 3×8–12",
            "Lateral Raises — 2×12–15",
            "Core (Planks) — 3 sets",
          ]},
          { day: "Day 2 — Full Body B", items: [
            "Romanian Deadlift — 3×8–12",
            "Incline Press — 3×8–12",
            "Lat Pulldown / Pull-ups — 3×8–12",
            "Lunges — 2×10 each leg",
            "Core (Leg Raises) — 3 sets",
          ]},
          { day: "Day 3 — Full Body C", items: [
            "Hip Hinge (Deadlift light / RDL) — 3×6–10",
            "Overhead Press — 3×6–10",
            "Row / Pulldown — 3×8–12",
            "Leg Accessory (Ham curl or extensions) — 2×10–12",
            "Core (Your choice) — 3 sets",
          ]},
        ],
        tips: [
          "Add 2–3 cardio sessions/week (20–30 min).",
          "Keep weights challenging; don’t go too light.",
          "Shorter rests (60–90 sec) keeps intensity high.",
        ],
      },

      home: {
        title: "Home",
        subtitle: "Dumbbells/bodyweight plan (3–4 days/week) — simple and effective.",
        tags: ["Dumbbells", "Bodyweight", "Tempo Training"],
        plan: [
          { day: "Day 1 — Push", items: [
            "Push-ups — 4×AMRAP (good form)",
            "DB Floor Press / DB Press — 3×8–15",
            "Shoulder Press — 3×8–15",
            "Lateral Raises — 3×12–20",
            "Triceps Extensions — 3×10–15",
          ]},
          { day: "Day 2 — Pull", items: [
            "One-arm DB Row — 4×8–15 each side",
            "Rear Delt Raises — 3×12–20",
            "Biceps Curls — 3×10–15",
            "Shrugs — 3×10–15",
            "Optional: Band Pull-aparts — 2×20",
          ]},
          { day: "Day 3 — Legs + Core", items: [
            "Goblet Squat — 4×10–15",
            "DB Romanian Deadlift — 3×8–15",
            "Walking Lunges — 3×10 each leg",
            "Calf Raises — 4×12–20",
            "Planks — 3 sets",
          ]},
          { day: "Optional Day 4 — Full Body", items: [
            "DB Press — 3×10–15",
            "DB Row — 3×10–15",
            "Goblet Squat — 3×12–15",
            "Shoulder Press — 2×10–15",
            "Core — 3 sets",
          ]},
        ],
        tips: [
          "Use slow tempo: 3 seconds down, 1 second up.",
          "Push sets close to failure, keep form clean.",
          "If weights are light: increase reps (12–20) or slow tempo.",
        ],
      },
    }),
    []
  );

  const currentWorkout = workoutData[workoutTab];

  // -------- Diets data (NEW) --------
  const dietsData = useMemo(
    () => ({
      bulk: {
        title: "Bulking",
        subtitle: "Goal: eat slightly more to build muscle while staying consistent.",
        rules: [
          "Protein at every meal (chicken, eggs, yogurt, fish, lean beef).",
          "Carbs around training (rice, pasta, potatoes, oats).",
          "Healthy fats daily (olive oil, nuts, avocado).",
          "Drink water and sleep well (recovery matters).",
        ],
        week: [
          { day: "Monday", b:"Oats + banana + Greek yogurt", l:"Chicken rice bowl + veggies", d:"Salmon + potatoes + salad", s:"Peanut butter toast + fruit" },
          { day: "Tuesday", b:"Eggs + wholegrain toast + fruit", l:"Turkey wrap + yogurt", d:"Beef mince + pasta + veg", s:"Protein yogurt + nuts" },
          { day: "Wednesday", b:"Smoothie (milk + banana + oats)", l:"Tuna sandwich + salad", d:"Chicken + rice + olive oil veg", s:"Cheese + crackers + fruit" },
          { day: "Thursday", b:"Overnight oats + berries", l:"Pasta + chicken + veg", d:"Fish + rice + veg", s:"Trail mix + yogurt" },
          { day: "Friday", b:"Egg omelette + toast", l:"Rice bowl (beef/chicken) + veg", d:"Homemade burger + potatoes + salad", s:"Milk + banana" },
          { day: "Saturday", b:"Pancakes + fruit + yogurt", l:"Chicken wrap + salad", d:"Steak + potatoes + veg", s:"Nuts + fruit" },
          { day: "Sunday", b:"Oats + honey + berries", l:"Tuna rice bowl + veg", d:"Chicken curry + rice", s:"Dark chocolate + yogurt" },
        ],
      },

      cut: {
        title: "Cutting",
        subtitle: "Goal: eat a bit less while keeping protein high (keep muscle).",
        rules: [
          "High protein, every day (helps keep muscle).",
          "Choose filling foods (vegetables, potatoes, oats).",
          "Keep snacks planned (don’t snack randomly).",
          "Drink water first if you feel hungry.",
        ],
        week: [
          { day: "Monday", b:"Greek yogurt + berries", l:"Chicken salad + potatoes", d:"White fish + veg + rice (small)", s:"Apple + yogurt" },
          { day: "Tuesday", b:"Eggs + veg (omelette)", l:"Turkey wrap (light sauce) + salad", d:"Chicken stir-fry + veg", s:"Carrots + hummus" },
          { day: "Wednesday", b:"Oats (smaller) + banana", l:"Tuna salad bowl", d:"Salmon + veg + potatoes", s:"Protein yogurt" },
          { day: "Thursday", b:"Skyr + fruit", l:"Chicken rice bowl (smaller rice)", d:"Lean beef + veg", s:"Fruit + nuts (small)" },
          { day: "Friday", b:"Eggs + toast (1 slice)", l:"Tuna sandwich + salad", d:"Turkey/chicken + veg + potatoes", s:"Popcorn (small) or fruit" },
          { day: "Saturday", b:"Yogurt + oats (small) + berries", l:"Chicken wrap + salad", d:"Fish + veg + rice (small)", s:"Cottage cheese / yogurt" },
          { day: "Sunday", b:"Protein smoothie (milk + berries)", l:"Chicken salad + olive oil (small)", d:"Lean mince + veg", s:"Fruit" },
        ],
      },

      maintain: {
        title: "Maintenance",
        subtitle: "Goal: stay healthy and consistent with balanced meals.",
        rules: [
          "80/20 rule: mostly healthy foods, some flexibility.",
          "Protein + carbs + fats each day.",
          "Same meal times (helps routine).",
          "Adjust portions depending on activity.",
        ],
        week: [
          { day: "Monday", b:"Oats + fruit", l:"Chicken rice + veg", d:"Fish + potatoes + salad", s:"Yogurt + nuts" },
          { day: "Tuesday", b:"Eggs + toast + fruit", l:"Turkey wrap + salad", d:"Pasta + chicken + veg", s:"Fruit + peanut butter" },
          { day: "Wednesday", b:"Yogurt + granola + berries", l:"Tuna sandwich + salad", d:"Beef + rice + veg", s:"Dark chocolate (small)" },
          { day: "Thursday", b:"Overnight oats", l:"Rice bowl + veg", d:"Salmon + veg + potatoes", s:"Nuts + fruit" },
          { day: "Friday", b:"Omelette + toast", l:"Chicken pasta + veg", d:"Homemade burger + salad", s:"Yogurt" },
          { day: "Saturday", b:"Pancakes + fruit", l:"Tuna rice bowl", d:"Steak + veg + potatoes", s:"Smoothie" },
          { day: "Sunday", b:"Oats + honey + fruit", l:"Chicken salad + bread", d:"Chicken curry + rice", s:"Fruit" },
        ],
      },
    }),
    []
  );

  const currentDiet = dietsData[dietTab];

  return (
    <div className="appShell">
      {/* HOME */}
      {page === "home" && (
        <div className="homePage">
          <TopBar active="home" />

          <main className="hero">
            <div className="heroInner fadeUp">
              <h1 className="heroTitle">FitStart</h1>
              <p className="heroQuote">
                Discipline is the bridge between goals and accomplishments
              </p>
              <button className="heroBtn" onClick={() => setPage("story")}>
                Start Your Journey
              </button>
            </div>
          </main>

          <BottomBar />
        </div>
      )}

      {/* OUR STORY */}
      {page === "story" && (
        <div className="storyPage">
          <TopBar active="story" />

          <main className="storyMain fadeUp">
            <div className="storyCard">
              <aside className="storyLeft">
                <img className="founderImg" src="/founder.jpg" alt="Founder" />
                <div className="founderTag">
                  Founder: <span className="hl">David Zekaj</span>
                </div>
              </aside>

              <section className="storyRight">
                <h2 className="storyTitle">Our Story</h2>

                <p className="storyP">
                  <span className="hl">FitStart</span> began with a feeling many
                  people know but rarely talk about — walking into a gym and
                  realizing you have no idea where to start.
                </p>

                <p className="storyP">
                  My name is <span className="hl">David Zekaj</span>, and I am the
                  founder of <span className="hl">FitStart</span>. When I first
                  started going to the gym, I was motivated to improve myself,
                  but <span className="hl">motivation alone wasn’t enough</span>.
                  I remember standing there surrounded by equipment, workouts,
                  and people who seemed to know exactly what they were doing,
                  while I felt completely lost. I didn’t know which exercises to
                  follow, how to train properly, or what I should be eating to
                  support my progress.
                </p>

                <p className="storyP">
                  That experience stayed with me. I realized that many beginners
                  give up not because they lack determination, but because they
                  lack <span className="hl">guidance</span>. Starting something new
                  can feel intimidating when you don’t have direction.
                </p>

                <p className="storyP">
                  As I continued training, fitness slowly became more than just
                  physical improvement. It taught me{" "}
                  <span className="hl">discipline</span>,{" "}
                  <span className="hl">consistency</span>, and{" "}
                  <span className="hl">patience</span> — qualities that began to
                  influence my life outside the gym as well. Showing up even on
                  difficult days, staying committed to long-term goals, and
                  learning to trust the process helped me grow not only as an
                  athlete, but as a person and as a student.
                </p>

                <p className="storyP">
                  As a student at{" "}
                  <span className="hl">OTR International School</span>, I wanted my
                  personal project to reflect something meaningful and personal to
                  me. Creating <span className="hl">FitStart</span>{" "}
                  felt natural because it was inspired by my own journey — the
                  confusion at the beginning, the lessons learned along the way,
                  and the desire to make starting easier for others.
                </p>

                <p className="storyP">
                  <span className="hl">FitStart</span> was created for newcomers who
                  feel unsure about workouts, training plans, or nutrition. It
                  exists to provide <span className="hl">clarity</span>,{" "}
                  <span className="hl">confidence</span>, and a{" "}
                  <span className="hl">starting point</span> for anyone ready to
                  improve themselves but unsure how to take the first step. The
                  goal is simple: to help beginners avoid the uncertainty I once
                  experienced and to support them as they build both physical
                  strength and personal discipline.
                </p>

                <p className="storyP">
                  Fitness changed the way I approach challenges, teaching me that
                  real progress comes from <span className="hl">discipline</span>{" "}
                  and <span className="hl">consistency</span>. As the saying goes,
                  “<span className="hl">
                    Discipline is the bridge between goals and accomplishments.
                  </span>”
                </p>

                <div className="storyQuestion">
                  Now the question is simple —{" "}
                  <span className="hl">are you ready to start your journey?</span>
                </div>

                <div className="boxGrid">
                  <button className="boxBtn" onClick={() => setPage("fitness")}>
                    What is Fitness
                  </button>
                  <button className="boxBtn" onClick={() => setPage("workouts")}>
                    Workouts
                  </button>
                  <button className="boxBtn" onClick={() => setPage("diets")}>
                    Diets
                  </button>
                  <button className="boxBtn" onClick={() => setPage("track")}>
                    Track Progress
                  </button>
                </div>
              </section>
            </div>
          </main>

          <BottomBar />
        </div>
      )}

      {/* WHAT IS FITNESS */}
      {page === "fitness" && (
        <div className="storyPage">
          <TopBar active="fitness" />

          <main className="fitnessMain fadeUp">
            <div className="fitnessCard">
              <h2 className="fitnessTitle">What Is Fitness?</h2>

              <p className="fitnessP">
                <span className="hl">Fitness</span> is a comprehensive approach to
                health and well-being that goes far beyond physical appearance. It
                represents a balanced lifestyle built on proper{" "}
                <span className="hl">exercise</span>,{" "}
                <span className="hl">nutrition</span>,{" "}
                <span className="hl">recovery</span>,{" "}
                <span className="hl">hydration</span>, and sustainable daily habits.
                When these elements work together, they support physical performance,
                mental clarity, long-term health, and overall quality of life.
              </p>

              <p className="fitnessP">
                At its core, fitness focuses on improving the body’s ability to
                function efficiently in everyday activities while reducing the risk
                of injury, illness, and chronic disease. A well-structured lifestyle
                promotes <span className="hl">strength</span>,{" "}
                <span className="hl">endurance</span>,{" "}
                <span className="hl">mobility</span>, and{" "}
                <span className="hl">resilience</span>.
              </p>

              <div className="fitnessSection">
                <h3 className="fitnessH3">Exercise</h3>
                <p className="fitnessP">
                  Exercise is one of the fundamental components of fitness. Regular
                  physical activity strengthens the cardiovascular system, improves
                  muscle tone, enhances flexibility, and supports metabolic health.
                  Effective training programs combine different forms including{" "}
                  <span className="hl">cardio</span>,{" "}
                  <span className="hl">strength</span>,{" "}
                  <span className="hl">mobility</span>, and{" "}
                  <span className="hl">functional movement</span>.
                </p>
              </div>

              <div className="fitnessSection">
                <h3 className="fitnessH3">Nutrition</h3>
                <p className="fitnessP">
                  Nutrition provides the fuel required for performance, recovery, and
                  daily functioning. A balanced diet includes proteins, carbohydrates,
                  and healthy fats along with essential vitamins and minerals.
                </p>
              </div>

              <div className="fitnessSection">
                <h3 className="fitnessH3">Recovery</h3>
                <p className="fitnessP">
                  Rest and recovery are essential. During rest, the body repairs
                  muscle tissue, restores energy, and adapts to training. Quality{" "}
                  <span className="hl">sleep</span>, stretching, and active recovery
                  maintain performance and reduce injury risk.
                </p>
              </div>

              <div className="fitnessSection">
                <h3 className="fitnessH3">Hydration</h3>
                <p className="fitnessP">
                  Water supports temperature regulation, nutrient transport, joint
                  lubrication, and muscle function. Proper hydration improves
                  endurance, concentration, and recovery.
                </p>
              </div>

              <p className="fitnessP">
                Beyond physical benefits, fitness supports{" "}
                <span className="hl">mental well-being</span>—reducing stress,
                improving mood, increasing focus, and building self-confidence.
              </p>

              <p className="fitnessP">
                A professional approach recognizes every individual is unique.
                Personalized strategies, gradual progression, and overall wellness
                help fitness become a lifelong foundation for health and performance.
              </p>

              <div className="boxGrid">
                <button className="boxBtn" onClick={() => setPage("story")}>
                  Back to Our Story
                </button>
                <button className="boxBtn" onClick={() => setPage("workouts")}>
                  Workouts
                </button>
                <button className="boxBtn" onClick={() => setPage("diets")}>
                  Diets
                </button>
                <button className="boxBtn" onClick={() => setPage("track")}>
                  Track Progress
                </button>
              </div>
            </div>
          </main>

          <BottomBar />
        </div>
      )}

      {/* WORKOUTS */}
      {page === "workouts" && (
        <div className="storyPage">
          <TopBar active="workouts" />

          <main className="workoutsMain fadeUp">
            <div className="workoutsCard">
              <h2 className="workoutsTitle">Workouts</h2>
              <p className="workoutsSub">Choose your goal — Bulking, Cutting, or Home.</p>

              <div className="goalGrid">
                <button
                  className={`goalCard ${workoutTab === "bulk" ? "selected" : ""}`}
                  onClick={() => setWorkoutTab("bulk")}
                >
                  <div className="goalName">Bulking</div>
                  <div className="goalHint">Muscle + Strength</div>
                </button>

                <button
                  className={`goalCard ${workoutTab === "cut" ? "selected" : ""}`}
                  onClick={() => setWorkoutTab("cut")}
                >
                  <div className="goalName">Cutting</div>
                  <div className="goalHint">Fat Loss + Retain Muscle</div>
                </button>

                <button
                  className={`goalCard ${workoutTab === "home" ? "selected" : ""}`}
                  onClick={() => setWorkoutTab("home")}
                >
                  <div className="goalName">Home</div>
                  <div className="goalHint">Dumbbells / Bodyweight</div>
                </button>
              </div>

              <div className="workoutTop">
                <div>
                  <h3 className="workoutTitle">{currentWorkout.title} Plan</h3>
                  <p className="workoutSubtitle">{currentWorkout.subtitle}</p>
                </div>

                <div className="tagRow">
                  {currentWorkout.tags.map((t) => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
              </div>

              <div className="planGrid">
                {currentWorkout.plan.map((block) => (
                  <div key={block.day} className="dayCard">
                    <div className="dayTitle">{block.day}</div>
                    <ul className="dayList">
                      {block.items.map((it) => <li key={it}>{it}</li>)}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="tipsBox">
                <div className="tipsTitle">Rules / Tips</div>
                <ul className="tipsList">
                  {currentWorkout.tips.map((t) => <li key={t}>{t}</li>)}
                </ul>
              </div>

              <div className="boxGrid">
                <button className="boxBtn" onClick={() => setPage("story")}>Back to Our Story</button>
                <button className="boxBtn" onClick={() => setPage("fitness")}>What is Fitness</button>
                <button className="boxBtn" onClick={() => setPage("diets")}>Diets</button>
                <button className="boxBtn" onClick={() => setPage("track")}>Track Progress</button>
              </div>
            </div>
          </main>

          <BottomBar />
        </div>
      )}

      {/* DIETS (NEW) */}
      {page === "diets" && (
        <div className="storyPage">
          <TopBar active="diets" />

          <main className="dietsMain fadeUp">
            <div className="dietsCard">
              <h2 className="dietsTitle">Diets</h2>
              <p className="dietsSub">
                Weekly meal plans for beginners — choose your goal.
              </p>

              <div className="goalGrid">
                <button
                  className={`goalCard ${dietTab === "bulk" ? "selected" : ""}`}
                  onClick={() => setDietTab("bulk")}
                >
                  <div className="goalName">Bulking</div>
                  <div className="goalHint">Muscle Gain</div>
                </button>

                <button
                  className={`goalCard ${dietTab === "cut" ? "selected" : ""}`}
                  onClick={() => setDietTab("cut")}
                >
                  <div className="goalName">Cutting</div>
                  <div className="goalHint">Fat Loss</div>
                </button>

                <button
                  className={`goalCard ${dietTab === "maintain" ? "selected" : ""}`}
                  onClick={() => setDietTab("maintain")}
                >
                  <div className="goalName">Maintenance</div>
                  <div className="goalHint">Balanced Lifestyle</div>
                </button>
              </div>

              <div className="dietTop">
                <div>
                  <h3 className="dietTitle">{currentDiet.title} Plan</h3>
                  <p className="dietSubtitle">{currentDiet.subtitle}</p>
                </div>
                <div className="dietNote">
                  Tip: adjust portion sizes based on your hunger + training.
                </div>
              </div>

              <div className="dietRules">
                <div className="tipsTitle">Simple Rules</div>
                <ul className="tipsList">
                  {currentDiet.rules.map((r) => <li key={r}>{r}</li>)}
                </ul>
              </div>

              <div className="dietTableWrap">
                <div className="tipsTitle">7-Day Meal Plan</div>
                <div className="tableScroll">
                  <table className="dietTable">
                    <thead>
                      <tr>
                        <th>Day</th>
                        <th>Breakfast</th>
                        <th>Lunch</th>
                        <th>Dinner</th>
                        <th>Snack</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentDiet.week.map((d) => (
                        <tr key={d.day}>
                          <td>{d.day}</td>
                          <td>{d.b}</td>
                          <td>{d.l}</td>
                          <td>{d.d}</td>
                          <td>{d.s}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="dietFooterHint">
                  Want it more personal? We can add a “shopping list” section next.
                </div>
              </div>

              <div className="boxGrid">
                <button className="boxBtn" onClick={() => setPage("story")}>Back to Our Story</button>
                <button className="boxBtn" onClick={() => setPage("fitness")}>What is Fitness</button>
                <button className="boxBtn" onClick={() => setPage("workouts")}>Workouts</button>
                <button className="boxBtn" onClick={() => setPage("track")}>Track Progress</button>
              </div>
            </div>
          </main>

          <BottomBar />
        </div>
      )}

      {/* TRACK PROGRESS */}
      {page === "track" && (
        <div className="storyPage">
          <TopBar active="track" />

          <main className="trackMain fadeUp">
            <div className="trackCard">
              <div className="trackHeader">
                <h2 className="trackTitle">Track Progress</h2>
                <p className="trackSub">
                  Log your weight (kg), workouts per week, and notes. Saved automatically.
                </p>
              </div>

              <div className="summaryGrid">
                <div className="summaryCard">
                  <div className="summaryLabel">Latest Weight</div>
                  <div className="summaryValue">
                    {latestEntry ? `${latestEntry.weightKg} kg` : "—"}
                  </div>
                </div>

                <div className="summaryCard">
                  <div className="summaryLabel">Latest Workouts</div>
                  <div className="summaryValue">
                    {latestEntry ? `${latestEntry.workouts}/week` : "—"}
                  </div>
                </div>

                <div className="summaryCard">
                  <div className="summaryLabel">Total Entries</div>
                  <div className="summaryValue">{totalEntries}</div>
                </div>
              </div>

              <div className="trackGrid">
                <form className="trackForm" onSubmit={handleAddEntry}>
                  <div className="formTitle">Add Entry</div>

                  <label className="fieldLabel">
                    Date
                    <input
                      className="fieldInput"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </label>

                  <label className="fieldLabel">
                    Weight (kg)
                    <input
                      className="fieldInput"
                      type="number"
                      step="0.1"
                      min="1"
                      placeholder="e.g. 72.5"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      required
                    />
                  </label>

                  <label className="fieldLabel">
                    Workouts this week
                    <input
                      className="fieldInput"
                      type="number"
                      min="0"
                      max="14"
                      placeholder="e.g. 4"
                      value={workouts}
                      onChange={(e) => setWorkouts(e.target.value)}
                      required
                    />
                  </label>

                  <label className="fieldLabel">
                    Notes (optional)
                    <textarea
                      className="fieldInput fieldTextarea"
                      placeholder="How did you feel? What improved?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                    />
                  </label>

                  <button className="trackAddBtn" type="submit">Add Entry</button>
                  <button className="trackDangerBtn" type="button" onClick={clearAll}>
                    Clear All Data
                  </button>
                </form>

                <div className="trackTableWrap">
                  <div className="formTitle">History</div>

                  {entries.length === 0 ? (
                    <div className="emptyState">
                      No entries yet. Add your first one on the left.
                    </div>
                  ) : (
                    <div className="tableScroll">
                      <table className="trackTable">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Weight (kg)</th>
                            <th>Workouts</th>
                            <th>Notes</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {entries.map((e) => (
                            <tr key={e.id}>
                              <td>{e.date}</td>
                              <td>{e.weightKg}</td>
                              <td>{e.workouts}</td>
                              <td className="notesCell">{e.notes || "—"}</td>
                              <td className="actionsCell">
                                <button className="rowDeleteBtn" onClick={() => deleteEntry(e.id)}>
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="boxGrid">
                <button className="boxBtn" onClick={() => setPage("story")}>Back to Our Story</button>
                <button className="boxBtn" onClick={() => setPage("fitness")}>What is Fitness</button>
                <button className="boxBtn" onClick={() => setPage("workouts")}>Workouts</button>
                <button className="boxBtn" onClick={() => setPage("diets")}>Diets</button>
              </div>
            </div>
          </main>

          <BottomBar />
        </div>
      )}
    </div>
  );
}
