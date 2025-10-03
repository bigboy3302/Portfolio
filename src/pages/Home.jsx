import React, { useEffect, useRef } from 'react'

export default function Home(){
  const layerRef = useRef(null)

  useEffect(() => {
    const layer = layerRef.current
    const onScroll = () => {
      const y = window.scrollY
      const z = Math.max(-200, -100 - y * 0.05)
      layer.style.transform = `translateZ(${z}px) translateY(${y * -0.05}px)`
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className="hero" aria-label="About section">
      <div ref={layerRef} className="layer" aria-hidden="true"></div>
      <div className="container">
        <div className="card" style={{padding:'2rem'}}>
          <h1 className="display-xxl">Adrians Raitums</h1>
<p className="kicker">Creative Front-End Developer</p>
<hr className="rule" />

          <p>
            I learn by building. My core subjects and skills include web development on the
            front end (HTML, CSS, Tailwind CSS, JavaScript, React) and back end (PHP, Laravel);
            databases (SQL/MySQL and Firebase) for schema design, queries, and data processing;
            programming fundamentals in C++ with a focus on algorithmic thinking; and computer
            hardware & networking—assembling PCs, configuring servers, and setting up networks.
          </p>

          <div className="grid" style={{marginTop:'1rem'}}>
            <section className="card" aria-labelledby="study-title">
              <h2 id="study-title" style={{marginTop:0}}>Where I’m studying</h2>
              <p><strong>From 2022</strong></p>
              <ul>
                <li>
                  <strong>Vidzeme Technical School of Technology and Design</strong>
                  <p>Programming Technician</p>
                  <p>
                    Built for the web end-to-end: React + Tailwind on the UI and PHP/Laravel on the server.
                    Modeled data and wrote queries in MySQL, and brought in Firebase (self-taught) for auth and
                    real-time features. Sharpened algorithmic thinking with C++, and got hands-on with hardware & networks—
                    from assembling PCs to wiring server connections and configuring internet/network setups.
                  </p>
                  <p>
                    I’m an enthusiastic, curious learner with a good sense of humor who enjoys helping people.
                    Give me a clear brief—say it once (or twice)—and I’ll break it down, tackle the hard parts, and deliver.
                    Tough jobs don’t scare me; with the time I’m given, I ship, iterate, and finish what I start—every time.
                  </p>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </section>
  )
}
