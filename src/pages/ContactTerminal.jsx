// src/pages/ContactTerminal.jsx
import React, { useEffect, useRef, useState } from "react";
import { useToast } from "../components/Toast.jsx";

const API_ENDPOINT = "/api/contact"; // works on Vercel + vercel dev

export default function ContactTerminal() {
  const { push } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "Let's build something",
    message: "",
    website: "", // honeypot (must stay empty)
  });

  const msgRef = useRef(null);
  useEffect(() => { msgRef.current?.focus(); }, []);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  async function submit() {
    if (!form.name || !form.email || !form.message) {
      push("Please fill in name, email, and message.", "error");
      return;
    }
    if (!validEmail(form.email)) {
      push("Please enter a valid email address.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to send");

      push("Message sent. I’ll reply soon!");
      setForm({ name: "", email: "", subject: "Let's build something", message: "", website: "" });
    } catch (err) {
      push(err.message || "Network error. Try again later.", "error");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e) { e.preventDefault(); submit(); }
  function onKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault(); submit();
    }
  }

  return (
    <section className="container" style={{ padding: "2rem 0" }}>
      <h1 className="display-xxl">Contact</h1>

      <div className="terminal-card">
        <div className="terminal-head">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
          <span className="title">boot@portfolio — ssh</span>
        </div>

        <div className="terminal-body">
          <ul className="terminal-log">
            <li><span className="prompt">boot@portfolio:~$</span> <span>contact --init</span></li>
            <li>✔ ready. type your message and press <kbd>Enter</kbd> or click <kbd>Send</kbd>.</li>
          </ul>

          <form onSubmit={onSubmit} onKeyDown={onKeyDown} className="terminal-form" autoComplete="on">
            <label className="tlabel">name</label>
            <input
              className="tinput"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Jane Doe"
              autoComplete="name"
            />

            <label className="tlabel">email</label>
            <input
              className="tinput"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="jane@example.com"
              autoComplete="email"
              inputMode="email"
            />

            <label className="tlabel">subject</label>
            <input
              className="tinput"
              name="subject"
              value={form.subject}
              onChange={onChange}
              placeholder="Let's build something"
            />

            {/* Honeypot — must be empty; note the correct React style object */}
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={onChange}
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="off"
            />

            <label className="tlabel">message</label>
            <textarea
              ref={msgRef}
              className="tinput tarea"
              name="message"
              value={form.message}
              onChange={onChange}
              placeholder="Write your message…  (Ctrl/⌘ + Enter to send)"
              rows={6}
            />

            <div className="tsend">
              <button className="button primary glow" disabled={loading} aria-busy={loading}>
                {loading ? "Sending…" : "Send"}
              </button>
              <span className="hint">or press <kbd>Ctrl/⌘</kbd> + <kbd>Enter</kbd></span>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
