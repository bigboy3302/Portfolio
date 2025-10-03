// src/pages/Skills.jsx
import React from "react";
import FlipCardHover from "../components/FlipCardHover.jsx";
import SemiCircleProgress from "../components/SemiCircleProgress.jsx";

const skills = [
  {
    label: "PHP",
    value: 87,
    started: "2022",
    most: "APIs, tooling",
    gradient: "violet",
    backImg:
      "https://picperf.io/https://laravelnews.s3.amazonaws.com/images/phplogo.jpg",
  },
  {
    label: "Laravel",
    value: 80,
    started: "2023",
    most: "REST, auth",
    gradient: "cyan",
    backImg:
      "https://laravel.gallerycdn.vsassets.io/extensions/laravel/vscode-laravel/1.2.1/1758040816239/Microsoft.VisualStudio.Services.Icons.Default",
  },
  {
    label: "React",
    value: 89,
    started: "2023",
    most: "SPA routing",
    gradient: "pink",
    backImg:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1400&auto=format&fit=crop",
  },
  {
    label: "HTML",
    value: 97,
    started: "2021",
    most: "Semantic & a11y",
    gradient: "amber",
    backImg:
      "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?q=80&w=1400&auto=format&fit=crop",
  },
  {
    label: "CSS",
    value: 94,
    started: "2021",
    most: "Layouts, 3D transforms",
    gradient: "violet",
    backImg:
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=1400&auto=format&fit=crop",
  },
  {
    label: "Tailwind",
    value: 65,
    started: "2024",
    most: "Design systems",
    gradient: "cyan",
    backImg:
      "https://images.unsplash.com/photo-1529243856184-fd5465488984?q=80&w=1400&auto=format&fit=crop",
  },
  {
    label: "SQL",
    value: 87,
    started: "2022",
    most: "MySQL schemas",
    gradient: "pink",
    backImg:
      "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=1400&auto=format&fit=crop",
  },
  {
    label: "Firebase",
    value: 50,
    started: "2024",
    most: "Auth, realtime",
    gradient: "amber",
    backImg:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1400&auto=format&fit=crop",
  },
];

export default function Skills() {
  return (
    <section
      className="container"
      style={{ padding: "2rem 0" }}
      aria-label="Skills flip cards"
    >
      <h2
        className="display-xxl"
        style={{ fontSize: "clamp(1.8rem,4vw,3rem)" }}
      >
        Skills
      </h2>
      <p className="visually-hidden">
        Hover or focus a card to flip it. Percentage appears on the front only;
        the back shows a photo and details.
      </p>

      <div className="flip-grid" style={{ marginTop: "1rem" }}>
        {skills.map((s) => (
          <FlipCardHover
            key={s.label}
            gradient={s.gradient}
            backImg={s.backImg}
            front={
              <>
                {/* Centered gauge container (keeps meter perfectly in the middle) */}
                <div className="gauge-box">
                  <SemiCircleProgress label={s.label} value={s.value} />
                </div>

                {/* removed old % badge so nothing shows in the corner */}
              </>
            }
            back={
              <>
                <div className="flip-sub">Started {s.started}</div>
                <div className="flip-sub">
                  Most used: <strong>{s.most}</strong>
                </div>
                <p style={{ marginTop: ".4rem" }}>
                  Practiced in real projects; focused on clean architecture,
                  accessibility, and performance.
                </p>
              </>
            }
          />
        ))}
      </div>
    </section>
  );
}
