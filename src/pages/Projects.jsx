import React from "react";
import { Link } from "react-router-dom";

const projects = [
  { title: "Realtime Chat", tag: "Firebase • React", href: "#", year: "2025" },
  { title: "3D Product Card", tag: "CSS 3D • Accessibility", href: "#", year: "2025" },
  { title: "Laravel API", tag: "PHP • REST • Auth", href: "#", year: "2024" },
  { title: "SQL Dashboard", tag: "MySQL • Charts", href: "#", year: "2024" },
];

export default function Projects(){
  return (
    <section className="container" style={{padding:'2rem 0'}} aria-label="Projects">
      <h2 className="display-xxl" style={{fontSize:"clamp(1.8rem,4.2vw,3rem)"}}>Selected Work</h2>
      <ul style={{listStyle:"none", padding:0, margin:"1.5rem 0"}}>
        {projects.map(p => (
          <li key={p.title} style={{marginBottom:"1.25rem"}}>
            <Link to={p.href} className="project-row" data-cursor-color="#8b5cf6">
              <div className="project-cover" aria-hidden="true"></div>
              <div className="project-meta">
                <div className="project-title">{p.title}</div>
                <div className="project-tag">{p.tag}</div>
              </div>
              <div className="project-year">{p.year}</div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
