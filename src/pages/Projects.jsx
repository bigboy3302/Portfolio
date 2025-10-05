import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink } from "react-router-dom";

/* ---------------- Ongoing projects (carousel) ---------------- */
const PROJECTS = [
  {
    id: "p1",
    title: "cafe page Idi_Ridi",
    cover: "/cover/ip.jpg",
    video: "/video/Idi_Ridi.mp4",
    desc:
      "This began as a PHP-only prototype. While I didn’t take that version to completion, I’m rebuilding it with a modern design and end-to-end features—most notably, table reservations that support large groups.",
    year: "2025",
    tech: ["PHP"],
  },
  {
    id: "p2",
    title: "Kliean-Kitchen",
    cover: "/cover/Clean-Kitchen.png",
    // If file names contain spaces, encode them (or rename the file).
    video: "/video/Masin darbs.mp4", // or "/video/Masin%20darbs.mp4"
    desc: `Smart Pantry — add items by typing or scanning barcodes; auto-merge duplicates; track quantities and expiry.
Fridge & Trash views — quick “what’s fresh / what’s expired” split with smooth focus mode.
Health Coach (beta) — logs consumption and visualizes weekly/monthly sugar, saturated fat, and sodium vs. soft targets.
Recipe discovery — search by name or ingredient; or generate suggestions that match what’s already in your pantry.
Your recipes — create structured recipes with ingredients & steps; upload a cover & gallery; edit later; favorite anything.
Favorites — one-click star across API and user recipes.`,
    year: "2025",
    tech: ["Next.js", "React", "Firebase", "API", "Realtime UX", "TypeScript"],
  },
];

/* ---------------- Future project ideas (cards) ---------------- */
const IDEAS = [
  {
    id: "f1",
    icon: "🎟️",
    title: "Local Event Radar",
    blurb:
      "Find cool events happening near you tonight. Uses city open-data + Google Places. One-tap directions, shareable mini flyers, and a 'bring friends' headcount.",
    tags: ["Next.js", "Maps", "Open-Data", "Edge Caching"],
    status: "Prototyping",
    progress: 15,
    impact: "Discover local culture in seconds",
  },
  {
  id: "f2",
  icon: "🧠",
  title: "Level-Up Coach — Gamified Workouts",
  blurb:
    "A fitness coach that turns real workouts into an RPG. Guided sessions with on-screen form feedback (pose estimation), live 1:1 or group workouts via WebRTC, and short quests that unlock gear, skills, and boss challenges. Tracks reps, tempo, and streaks; syncs with wearables; exports to Apple/Google Health.",
  tags: ["WebRTC", "Pose Estimation", "TensorFlow.js", "PWA", "Web Bluetooth"],
  status: "Planning",
  progress: 20,
  impact: "Make consistent training addictive—and fun.",
},
  {
    id: "f3",
    icon: "🌱",
    title: "Habit Garden",
    blurb:
      "Grow a tiny garden by completing habits. Streaks evolve plants; breaks create weeds. Gentle reminders, weekly reflection, exportable CSV.",
    tags: ["React", "PWA", "SQLite WASM", "Animations"],
    status: "Research",
    progress: 0,
    impact: "Make progress feel tangible",
  },
  {
    id: "f4",
    icon: "📦",
    title: "One-Link Drop",
    blurb:
      "Drag a file or paste a note → instant short link. Auto-expire, password, view counter, and QR. Great for sending assets to clients fast.",
    tags: ["S3/R2", "Signed URLs", "Rate Limit", "QR"],
    status: "Paused",
    progress: 2,
    impact: "Frictionless sharing with control",
  },
  {
  id: "f5",
  icon: "📅",
  title: "SlotSmith (Bookings SaaS)",
  blurb:
    "Self-serve bookings for barbers/tutors: services, staff availability, deposits, reminders, and iCal feeds. Owners get a clean calendar and revenue stats.",
  tags: ["Laravel", "Stripe/Cashier", "Queues/Horizon", "iCal", "Notifications"],
  status: "In Progress",
  progress: 35,
  impact: "Less back-and-forth, fewer no-shows",
},
{
  id: "f6",
  icon: "🧳",
  title: "Client Portal Pro",
  blurb:
    "A branded portal for agencies: deliverables, approvals, file sharing, invoices, and comments—everything in one login. Role-based access for clients and teammates.",
  tags: ["Laravel", "S3", "spatie/permission", "PDF", "Webhooks"],
  status: "Planning",
  progress: 10,
  impact: "Faster approvals and happier clients",
},
];

/* ---------------- Pretty letter button ---------------- */
function Button53({ children, onClick, as = "button", className = "" }) {
  const text = String(children);
  const Tag = as;
  return (
    <Tag className={`btn-53 ${className}`} onClick={onClick}>
      <div className="original">{text}</div>
      <div className="letters" aria-hidden="true">
        {text.split("").map((ch, i) => (
          <span key={`${ch}-${i}`}>{ch}</span>
        ))}
      </div>
    </Tag>
  );
}

/* ---------------- Video helpers ---------------- */
const isYouTube = (url = "") => /youtu\.be|youtube\.com/.test(url);
function asYouTubeEmbed(url = "") {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.replace("/", "")}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {}
  return null;
}

/* ========================= Page ========================= */
export default function Projects() {
  // views: menu | ongoing | future
  const [view, setView] = useState("menu");

  // ongoing state
  const [idx, setIdx] = useState(0);
  const [modalVideo, setModalVideo] = useState(null); // {src, title}
  const wrapRef = useRef(null);

  // future state
  const [query, setQuery] = useState("");
  const [hidePaused, setHidePaused] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    el.classList.toggle("mode-ongoing", view === "ongoing");
    setModalVideo(null);
  }, [view]);

  // keyboard nav + ESC close
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        if (modalVideo) return setModalVideo(null);
      }
      if (view !== "ongoing") return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, modalVideo]);

  function next() { setIdx((i) => (i + 1) % PROJECTS.length); }
  function prev() { setIdx((i) => (i - 1 + PROJECTS.length) % PROJECTS.length); }

  // touch swipe for ongoing
  const touch = useRef({ x: 0, y: 0 });
  function onTouchStart(e) {
    const t = e.changedTouches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  }
  function onTouchEnd(e) {
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    if (Math.abs(dx) > 40 && Math.abs(dy) < 80) dx < 0 ? next() : prev();
  }

  const current = PROJECTS[idx];

  function openVideo() {
    if (!current.video) return;
    const src = current.video.startsWith("http") ? current.video : encodeURI(current.video);
    setModalVideo({ src, title: current.title });
  }

  // filter future cards
  const filteredIdeas = useMemo(() => {
    const q = query.trim().toLowerCase();
    return IDEAS.filter((i) => {
      if (hidePaused && i.status === "Paused") return false;
      if (!q) return true;
      return (
        i.title.toLowerCase().includes(q) ||
        i.blurb.toLowerCase().includes(q) ||
        i.tags.join(" ").toLowerCase().includes(q)
      );
    });
  }, [query, hidePaused]);

  return (
    <section ref={wrapRef} className="projects-wrap">
      {/* ===== MENU ===== */}
      {view === "menu" && (
        <div className="projects-menu">
          <div className="big-buttons">
            <Button53 onClick={() => setView("ongoing")}>ONGOING PROJECTS</Button53>
            <Button53 className="alt" onClick={() => setView("future")}>
              FUTURE PROJECTS
            </Button53>
          </div>
        </div>
      )}

      {/* ===== ONGOING ===== */}
      {view === "ongoing" && (
        <>
          <header className="ongoing-topbar">
            <NavLink to="/" className="home-link">⟵ Home</NavLink>
            <div className="ongoing-actions">
              <button className="back-btn" onClick={() => setView("menu")}>✕ Menu</button>
              <button className="back-btn" onClick={() => setView("future")}>Future →</button>
            </div>
          </header>

          <div className="ongoing-stage">
            <div className="carousel" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <button className="nav left" onClick={prev} aria-label="Previous">‹</button>

              <article className="slide">
                <div className="media">
                  <button
                    className="cover-btn"
                    onClick={openVideo}
                    aria-label={current.video ? "Play project video" : "Project cover"}
                  >
                    <img src={current.cover} alt={`${current.title} cover`} className="cover" loading="lazy" />
                    {current.video && <span className="play">▶</span>}
                  </button>
                </div>

                <div className="meta">
                  {/* <h2 className="title">{current.title}</h2> */}
                  <div className="minor">
                    <span className="year">{current.year}</span>
                    <span className="dot">•</span>
                    <span className="stack">{current.tech.join(" · ")}</span>
                  </div>
                  <p className="desc">{current.desc}</p>
                </div>
              </article>

              <button className="nav right" onClick={next} aria-label="Next">›</button>
            </div>

            <div className="dots" role="tablist" aria-label="Project slides">
              {PROJECTS.map((p, i) => (
                <button
                  key={p.id}
                  role="tab"
                  className={`dot ${i === idx ? "active" : ""}`}
                  aria-selected={i === idx}
                  aria-label={`Go to ${p.title}`}
                  onClick={() => setIdx(i)}
                />
              ))}
            </div>
          </div>

          {/* Video modal */}
          {modalVideo && (
            <div className="video-modal" role="dialog" aria-modal="true" aria-label={`${modalVideo.title} video`}>
              <button className="video-backdrop" onClick={() => setModalVideo(null)} aria-label="Close" />
              <div className="video-sheet">
                <button className="video-close" onClick={() => setModalVideo(null)} aria-label="Close">✕</button>
                {isYouTube(modalVideo.src) ? (
                  <div className="video-player">
                    <iframe
                      key={modalVideo.src}
                      src={`${asYouTubeEmbed(modalVideo.src)}?autoplay=1&rel=0&modestbranding=1`}
                      title={modalVideo.title}
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="video-player">
                    <video key={modalVideo.src} src={modalVideo.src} controls autoPlay playsInline />
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== FUTURE (same page) ===== */}
      {view === "future" && (
        <>
          <header className="ongoing-topbar">
            <NavLink to="/" className="home-link">⟵ Home</NavLink>
            <div className="ongoing-actions">
              <button className="back-btn" onClick={() => setView("menu")}>✕ Menu</button>
              <button className="back-btn" onClick={() => setView("ongoing")}>Ongoing →</button>
            </div>
          </header>

          <div className="fp-header-inline">
            <h2 className="fp-title-inline">Future Projects</h2>
          </div>

          <div className="fp-toolbar-inline">
            <input
              className="fp-input"
              placeholder="Search ideas, tags…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <label className="fp-toggle">
              <input
                type="checkbox"
                checked={hidePaused}
                onChange={(e) => setHidePaused(e.target.checked)}
              />
              <span>Hide paused</span>
            </label>
          </div>

<div className="fp-grid">
  {filteredIdeas.map((idea) => {
    const ringStyle = {
      background: `conic-gradient(var(--fp-accent) ${idea.progress * 3.6}deg, rgba(255,255,255,.12) 0)`,
    };
    return (
      <article key={idea.id} className="fp-card">
        <div className="fp-border" aria-hidden="true" />
        <header className="fp-card-head">
          <div className="fp-id">
            <span className="fp-icon">{idea.icon}</span>
            <h3 className="fp-card-title">{idea.title}</h3>
          </div>
          <span className={`fp-badge ${idea.status.toLowerCase()}`}>{idea.status}</span>
        </header>

        <p className="fp-card-text">{idea.blurb}</p>
        {idea.impact && <p className="fp-impact">→ {idea.impact}</p>}

        {idea.tags?.length > 0 && (
          <ul className="fp-tags">
            {idea.tags.map((t) => (
              <li key={t} className="fp-tag">#{t}</li>
            ))}
          </ul>
        )}

        <div className="fp-bottom">
          <div className="fp-ring" style={ringStyle}>
            <span className="fp-ring-hole" />
            <span className="fp-ring-label">{idea.progress}%</span>
          </div>

          {idea.links?.length > 0 && (
            <div className="fp-links">
              {idea.links.map((l) => (
                <a key={l.label} className="fp-link" href={l.href}>{l.label} ↗</a>
              ))}
            </div>
          )}
        </div>
      </article>
    );
  })}

  {filteredIdeas.length === 0 && (
    <div className="fp-empty">No ideas match your search.</div>
  )}
</div>
        </>
      )}
    </section>
  );
}
