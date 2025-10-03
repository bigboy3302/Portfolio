import React, { useState } from 'react'
import { useToast } from '../components/Toast.jsx'

// Replace with your actual Formspree form ID after creating one.
// See README for setup. Example endpoint: https://formspree.io/f/abcdwxyz
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/your_form_id'


export default function Contact(){
  const { push } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', message:'' })

  function onChange(e){
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function validEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  async function onSubmit(e){
    e.preventDefault()
    if (!form.name || !form.email || !form.message){
      push('Please fill in all fields.', 'error'); return
    }
    if (!validEmail(form.email)){
      push('Please enter a valid email address.', 'error'); return
    }
    if (FORMSPREE_ENDPOINT.endsWith('your_form_id')){
      push('Form endpoint not configured. See README to connect to Formspree.', 'error'); return
    }
    try{
      setLoading(true)
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          name: form.name, email: form.email, message: form.message
        })
      })
      if (res.ok){
        push('Thanks! Your message has been sent.')
        setForm({ name:'', email:'', message:'' })
      }else{
        const text = await res.text()
        push('Error sending message. ' + text, 'error')
      }
    }catch(err){
      push('Network error. Please try again later.', 'error')
    }finally{
      setLoading(false)
    }
  }

  return (
    <section className="container" style={{padding:'2rem 0'}}>
      <h2>Contact</h2>
      <form onSubmit={onSubmit} className="card" aria-label="Contact form">
        <div className="form-row">
          <div>
            <label htmlFor="name">Name</label>
            <input id="name" name="name" value={form.name} onChange={onChange} autoComplete="name" required />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" value={form.email} onChange={onChange} autoComplete="email" required inputMode="email" />
          </div>
        </div>
        <div style={{marginTop:'1rem'}}>
          <label htmlFor="message">Message</label>
          <textarea id="message" name="message" value={form.message} onChange={onChange} required />
        </div>
        <div style={{marginTop:'1rem', display:'flex', gap:'.75rem', alignItems:'center'}}>
          <button className="button primary" disabled={loading} aria-busy={loading}>
            {loading ? 'Sending…' : 'Send'}
          </button>
          <span className="visually-hidden">Form submits via Formspree to avoid exposing credentials.</span>
        </div>
      </form>
      <div className="card" style={{marginTop:'1rem'}}>
        <details>
          <summary><strong>Prefer serverless (Vercel) instead of Formspree?</strong></summary>
          <p>See README for an optional /api/contact function that relays mail using Resend. Keep API keys in environment variables.</p>
        </details>
      </div>
    </section>
  )
}
