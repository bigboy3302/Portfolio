import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

export default function MobileNav(){
  const [open, setOpen] = useState(false);

  // Close menu when route changes or window resizes large
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="mobile-nav">
      <button className="burger" aria-label="Menu" onClick={() => setOpen(o => !o)}>
        <span/><span/><span/>
      </button>
      <div className={`sheet ${open ? "open" : ""}`}>
        <NavLink to="/" onClick={()=>setOpen(false)}>Home</NavLink>
        <NavLink to="/skills" onClick={()=>setOpen(false)}>Skills</NavLink>
        <NavLink to="/skills-3d" onClick={()=>setOpen(false)}>Skills 3D</NavLink>
        <NavLink to="/projects" onClick={()=>setOpen(false)}>Projects</NavLink>
        <NavLink to="/contact" onClick={()=>setOpen(false)}>Contact</NavLink>
      </div>
    </div>
  );
}
