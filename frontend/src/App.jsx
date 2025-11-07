import React, { useEffect, useMemo, useState, useRef } from 'react'
import './landing.css'
import DotField from './DotField.jsx'
import GeometricDrift from './GeometricDrift.jsx'
import SplashOrbits from './SplashOrbits.jsx'

// Prefer relative /api during dev (Vite proxy will forward). Override with VITE_API_BASE for prod.
const API_BASE = import.meta.env.VITE_API_BASE || ''

function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u) : null
  })
  const [greeting, setGreeting] = useState(() => localStorage.getItem('loginGreeting') || '')
  function computeGreeting(){
    const h = new Date().getHours()
    if(h>=5 && h<12) return 'Good morning'
    if(h>=12 && h<17) return 'Good afternoon'
    if(h>=17 && h<22) return 'Good evening'
    return 'Hello night owl'
  }
  function save({ token, learner }) {
    setToken(token)
    setUser(learner)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(learner))
    // Compute a greeting on each successful login and persist
    const g = computeGreeting()
    setGreeting(g)
    localStorage.setItem('loginGreeting', g)
    localStorage.setItem('loginGreetingAt', String(Date.now()))
    // Shuffle quotes per login: store high-entropy seed (timestamp) and mark previous
    const seed = Date.now() + Math.floor(Math.random()*1000)
    localStorage.setItem('loginQuoteIndex', String(seed))
  }
  function logout() {
    setToken(''); setUser(null); localStorage.clear()
  }
  return { token, user, greeting, save, logout }
}

// Simple outline epsilon logo in theme cobalt
function EpsilonLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" role="img">
      <g stroke="#1e4fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* upper curve */}
        <path d="M48 18 C 40 12, 28 12, 20 18 C 14 23, 14 29, 22 31" />
        {/* lower curve */}
        <path d="M22 31 C 14 33, 14 41, 20 46 C 28 52, 40 52, 48 46" />
      </g>
    </svg>
  );
}

// Lightweight autoplay carousel for landing feature highlights
// Simplified static feature grid (carousel removed for visibility reliability)
function FeatureCarousel(){
  const features = useMemo(()=>[
    { id:'flow', title:'Adaptive Flow', text:'Every response dynamically shifts difficulty & spacing so you stay in the sweet learning zone — not bored, not overwhelmed.', bullets:['Smart difficulty ramps','Spaced repetition core','Fatigue avoidance logic'], subjects:['ER Model','Normalization','SQL Basics','Arrays','Stacks'] },
    { id:'streaks', title:'Streak & XP', text:'Consistency is rewarded. Streak multipliers amplify XP and accelerate level gains tied to real mastery.', bullets:['Daily streak multiplier','Level curve (100 XP ≈ lvl)','Hint penalty integration'], subjects:['XP Curve','Daily Bonus','Hint Penalty'] },
    { id:'mastery', title:'Mastery Heatmap', text:'Visual topic gradients show weak spots in seconds; target practice instead of guessing.', bullets:['Per-topic mastery %','Decline detection','Recovery suggestions'], subjects:['Heatmap','Progress Bar','Weak Spot Ping'] },
    { id:'engine', title:'Selection Engine', text:'Transparent rule stack: spacing + difficulty filters + multi-layer fallbacks ensure a ready question every time.', bullets:['Eligibility filters','Global fallback safety','Low-latency caching'], subjects:['Spaced Filter','Difficulty Gate','Fallback Pool'] }
  ], [])
  return (
    <div className="feature-grid" aria-label="Key platform features">
      {features.map(f => (
        <div key={f.id} className="feature-card qcard">
          <span className="blub" aria-hidden="true" />
          <span className="blub" aria-hidden="true" />
            <span className="blub" aria-hidden="true" />
            <span className="blub" aria-hidden="true" />
          <div className="inner">
            <h3>{f.title}</h3>
            <p className="feat-text">{f.text}</p>
            <ul className="feat-bullets">{f.bullets.map(b=> <li key={b}>{b}</li>)}</ul>
            {f.subjects && (
              <div className="feat-subjects" aria-label="Sample subjects">
                {f.subjects.map(s=> <span key={s} className="pill sub-pill">{s}</span>)}
              </div>
            )}
            {f.id==='streaks' && (
              <div className="feat-extra" aria-label="Streak XP example">
                <div className="mini-bar"><div style={{width:'70%'}} /></div>
                <small>Streak day 5 → +35% XP</small>
              </div>
            )}
            {f.id==='mastery' && (
              <div className="feat-extra" aria-label="Mastery heat example">
                {['ER Model','Arrays','SQL Basics','Stacks','Queues'].map(t=> <div key={t} className="m-cell"><span>{t}</span><div className="m-bar"><div style={{width:`${40 + Math.random()*50}%`}} /></div></div>)}
              </div>
            )}
            {f.id==='engine' && (
              <div className="feat-extra" aria-label="Engine speed example">
                <div className="mini-bar"><div style={{width:'88%'}} /></div>
                <small>Cached selection latency &lt; 30ms</small>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function Landing({ onGetStarted, onBrandReboot }){
  const [navHidden, setNavHidden] = useState(false)
  const [lastScroll, setLastScroll] = useState(0)
  const [scrolling, setScrolling] = useState(false)
  useEffect(() => {
    let idleTimer
    function onScroll(){
      const y = window.scrollY
      const now = Date.now()
      setScrolling(true)
      setLastScroll(now)
      // Always show navbar while actively scrolling
      setNavHidden(false)
      clearTimeout(idleTimer)
      idleTimer = setTimeout(()=>{
        setScrolling(false)
        const heroFold = window.innerHeight * 0.65
        if(window.scrollY > heroFold){
          setNavHidden(true)
        }
      }, 650) // idle threshold
    }
    window.addEventListener('scroll', onScroll, { passive:true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  function revealOnUp(){ if(navHidden) setNavHidden(false) }
  useEffect(() => {
    let lastY = window.scrollY
    function detectDirection(){
      const y = window.scrollY
      if(y < lastY - 10){
        // Scrolling up - reveal
        setNavHidden(false)
      }
      lastY = y
      requestAnimationFrame(detectDirection)
    }
    const raf = requestAnimationFrame(detectDirection)
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div className={`hero fun`}>
  <DotField density={52} fullPage variant="page" spacing={50} jitter={16} />
  <GeometricDrift side="both" />
      {/* Minimal word-only nav */}
      <header className={`navbar navbar-plain ${navHidden ? 'hide-nav' : 'show-nav'}`}>
        <div className="nav-left">
          <span className="logo-mark" aria-hidden="true"><EpsilonLogo size={40} /></span>
          <button type="button" className="brand cobalt brand-btn" onClick={onBrandReboot} aria-label="Replay splash" title="Replay splash">Elera</button>
        </div>
        <nav className="nav-links nav-center">
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="nav-right" />
      </header>

      {/* No grid/glass - keep it clean pastel */}

      {/* Center hero */}
      <section className="hero-center">
        <div className="brand-label">Elera</div>
        <h1 className="hero-title"><em>Play</em> to master.</h1>
        <svg className="hero-underline" viewBox="0 0 800 90" aria-hidden="true">
          <path d="M20 60 C 220 20, 580 20, 780 60" />
        </svg>
        <p className="subtitle">
          Turn study reps into streaks. Light, adaptive, and rewarding. Pick a topic and start leveling up.
        </p>
        <div className="cta-row">
          <button className="btn-primary lg sheen" onClick={onGetStarted}><span>Start practice</span> <span className="caret">→</span></button>
        </div>
        <div className="badges fun-badges">
          <span className="badge pill">Streaks</span>
          <span className="badge pill">XP Gain</span>
          <span className="badge pill">Adaptive</span>
          <span className="badge pill">Mastery</span>
        </div>
      </section>

      {/* Feature carousel replacing static sections */}
      <section id="features" className="section fun-lite carousel-wrap">
        <FeatureCarousel />
      </section>
      <section id="contact" className="section fun-lite contact-block">
        <h3>Say hi</h3>
        <p>Drop ideas at <a href="mailto:hello@elera.local">hello@elera.local</a>.</p>
      </section>
      <footer className="footer-band">
        <div className="footer-inner">
          <span className="muted">THIS IS THE END, MY FRIEND ©</span>
        </div>
        <svg className="footer-mascot" viewBox="0 0 160 160" aria-hidden="true">
          {/* Constructed mascot: head peeking + two hands gripping + subtle mouth */}
          <g>
            <circle className="face" cx="80" cy="80" r="42" />
            {/* Eyes */}
            <circle className="eye" cx="64" cy="78" r="5" />
            <circle className="eye" cx="96" cy="78" r="5" />
            {/* Simple mouth curve */}
            <path className="line" d="M68 94 Q80 102 92 94" />
            {/* Hands gripping bottom edge */}
            <path className="hand" d="M50 118 Q56 110 62 118" />
            <path className="hand" d="M98 118 Q104 110 110 118" />
          </g>
        </svg>
      </footer>
    </div>
  )
}

function Auth({ mode='login', onLoggedIn, onSwitch, onBack }) {
  const [email, setEmail] = useState('demo@elera.test')
  const [password, setPassword] = useState('password')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [isRegister, setIsRegister] = useState(mode === 'register')
  const [quote, setQuote] = useState('')
  useEffect(() => {
    const quotes = [
      'Learning is a treasure that will follow its owner everywhere.',
      'Small steps every day lead to big changes.',
      'Practice is the path from novice to master.',
      'The more you learn, the more you earn your confidence.',
      'Consistency beats intensity.'
    ]
    setQuote(quotes[(Math.random()*quotes.length)|0])
  }, [])

  async function submit(e){
    e.preventDefault(); setErr(''); setLoading(true)
    const m = isRegister ? 'register' : 'login'
    try {
      const url = m === 'register' ? '/api/auth/register' : '/api/auth/login'
      const body = m === 'register' ? { name, email, password } : { email, password }
      const res = await fetch(`${API_BASE}${url}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
      const data = await res.json()
      if(!res.ok) throw new Error(data.msg || data.error || (m==='register'?'Registration failed':'Login failed'))
      if(m==='register'){
        const lr = await fetch(`${API_BASE}/api/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) })
        const ldata = await lr.json()
        if(!lr.ok) throw new Error(ldata.msg || ldata.error || 'Auto-login failed')
        onLoggedIn(ldata)
      } else {
        onLoggedIn(data)
      }
    } catch (e) {
      // Make network errors friendlier
      if (e?.message?.includes('Failed to fetch')) {
        setErr('Cannot reach the server. Is the backend running? Try: npm run dev:5050 in backend.')
      } else {
        setErr(e.message)
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-pastel" aria-live="polite">
      <DotField density={36} fullPage variant="page" spacing={56} jitter={14} />
      <SplashOrbits />
      <div className="auth-center">
        <div className="auth-head">
          <div className="auth-logo" aria-hidden="true"><EpsilonLogo size={44} /></div>
          <div className="auth-brand">ELERA</div>
          <p className="auth-quote">{quote}</p>
          <button type="button" className="link-back" onClick={onBack}>← Back</button>
        </div>
        <form className="nova-form" onSubmit={submit}>
          <div className="nf-circle" aria-hidden="true" />
          <div className="nf-intro">
            <p>{isRegister ? 'Create account' : 'Welcome back!'}</p>
            <div className="nf-intro-behind" aria-hidden="true"><p>|||||||||||||||||||||||||||||||||||||||||||||</p></div>
          </div>
          <div className="nf-middle">
            {isRegister && (
              <>
                <p>Name</p>
                <input className="nf-input" type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" />
              </>
            )}
            <p>Email</p>
            <input className="nf-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@elera.test" />
            <p>Password</p>
            <input className="nf-input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="nf-end">
            <button className="nf-btn" disabled={loading} type="submit">{loading ? (isRegister ? 'Creating…' : 'Signing in…') : (isRegister ? 'Create account' : 'Submit')}</button>
          </div>
          <div className="nf-end2">
            <button className="nf-btn small" type="button" onClick={()=> { setIsRegister(!isRegister); onSwitch && onSwitch(isRegister?'login':'register') }}>
              {isRegister ? 'Have an account? Log in' : 'Create account'}
            </button>
            <button className="nf-btn small nf-passbtn" type="button" onClick={()=> alert('Password reset link would be sent to your email in a real app.')}>Reset Password</button>
          </div>
        </form>
        {err && <p style={{color:'#b91c1c', marginTop:8, textAlign:'center'}}>{err}</p>}
        {!isRegister && <p style={{opacity:.7, fontSize:12, marginTop:8, textAlign:'center'}}>Demo: demo@elera.test / password</p>}
      </div>
    </div>
  )
}

function ProgressBar({ pct }){
  return <div className="progress"><div style={{ width:`${Math.round(pct*100)}%`}} /></div>
}

function QuestionCard({ q, onSubmit, streak }){
  const [answer, setAnswer] = useState('')
  const [usedHint, setUsedHint] = useState(false)
  const [result, setResult] = useState(null)

  function submit(){
    onSubmit({ selectedOption: answer, usedHint }).then((resp)=>{
      setResult(resp?.isCorrect ?? null)
    })
  }

  return (
    <div className={`qcard ${result===true?'correct':result===false?'incorrect':''}`}>      
      <span className="blub" aria-hidden="true" />
      <span className="blub" aria-hidden="true" />
      <span className="blub" aria-hidden="true" />
      <span className="blub" aria-hidden="true" />
      <div className="inner">
        <svg className="check-icon" viewBox="0 0 512 512" aria-hidden="true"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" /></svg>
        <div className="meta-row">
          <span className="badge">{q.topic}</span>
          <span className="badge">{q.difficulty}</span>
          <span className="badge">Streak {streak}</span>
        </div>
        <h3>{q.text}</h3>
        {q.type === 'mcq' && (
          <div className="options" role="radiogroup" aria-label="Answer options">
            {q.options.map(opt => (
              <label key={opt}>
                <input type="radio" name="opt" value={opt} onChange={()=>setAnswer(opt)} /> {opt}
              </label>
            ))}
          </div>
        )}
        {q.hints?.length > 0 && (
          <details>
            <summary>Need a hint?</summary>
            <ul style={{margin:'6px 0 8px 18px'}}>{q.hints.map((h, i) => <li key={i}>{h}</li>)}</ul>
            <label style={{fontSize:12}}><input type="checkbox" checked={usedHint} onChange={e=>setUsedHint(e.target.checked)} /> Apply hint penalty</label>
          </details>
        )}
        <hr />
        <div className="actions">
          <button className="submit-btn" type="button" onClick={submit} disabled={!answer}>Submit
            <svg className="arrow" viewBox="0 0 512 512"><path d="M470.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 256 265.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160zm-352 160l160-160c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L210.7 256 73.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0z" /></svg>
          </button>
          {result !== null && (
            <div className="result" style={{color: result ? '#16a34a' : '#dc2626'}}>{result ? 'Correct!' : 'Not quite.'}</div>
          )}
        </div>
        {result !== null && q.explanation && (
          <p style={{fontSize:12, opacity:.8, marginTop:4}}>Explanation: {q.explanation}</p>
        )}
      </div>
    </div>
  )
}

// ---------- New themed header + dashboard + path + quiz ----------

function ProfileWidget({ user }){
  const masteryAvg = (user.mastery?.length
    ? user.mastery.reduce((s,m)=>s+(m.score||0),0)/user.mastery.length
    : 0.5)
  const xp = Math.round(masteryAvg*100) + (user.loginCount || 0)*5
  const level = Math.floor(xp/100)+1
  const initials = (user.name||'?').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase()
  return (
    <div className="profile-pill">
      <div className="avatar">{initials}</div>
      <div className="meta">
        <div className="row"><strong>{user.name}</strong><span className="level">Lv {level}</span></div>
        <div className="row small">XP {xp}</div>
      </div>
    </div>
  )
}

// Removed rotating greeting; greeting is computed once at login

function AppHeader({ onHome, onLogout, user, greet }){
  return (
    <header className="app-header">
      <div className="left" onClick={onHome} role="button" tabIndex={0}>
        <EpsilonLogo size={28} />
        <span className="brand cobalt">Elera</span>
      </div>
      {greet ? (
        <div className="center">
          <span className="greet" aria-live="polite">{greet}</span>
        </div>
      ) : <div className="center" />}
      <div className="right">
        <ProfileWidget user={user} />
        <button className="btn-outline" onClick={onLogout}>Logout</button>
      </div>
    </header>
  )
}

const DEFAULT_COURSES = [
  { name:'DBMS', code:'DBMS', subjects:['ER Model','Normalization','SQL Basics'], active:true },
  { name:'DSA', code:'DSA', subjects:['Arrays','Stacks','Queues'], active:true },
  { name:'Operating Systems', code:'OS', subjects:[], active:false },
  { name:'Discrete Maths', code:'DM', subjects:[], active:false },
  { name:'Machine Learning', code:'ML', subjects:[], active:false },
  { name:'Computer Networks', code:'CN', subjects:[], active:false },
  { name:'Predictive Analytics', code:'PA', subjects:[], active:false },
  { name:'Full Stack', code:'FS', subjects:[], active:false },
]

function CourseCard({ course, onOpen }){
  const coming = course.active === false
  return (
    <div className={`course-card ${coming?'disabled':''}`} onClick={()=>!coming && onOpen(course)}>
      <div className="title-row">
        <h4>{course.name}</h4>
        {coming ? <span className="badge">Coming soon</span> : <span className="badge ok">Available</span>}
      </div>
      <p className="muted">{course.subjects?.length || 0} subjects</p>
    </div>
  )
}

function Dashboard({ auth, onOpenCourse }){
  const headers = useMemo(()=> ({ 'Authorization': `Bearer ${auth.token}` }), [auth.token])
  const [courses, setCourses] = useState(DEFAULT_COURSES)
  const COMING_SOON = useMemo(()=> new Set([
    'Operating Systems','Discrete Maths','Machine Learning','Computer Networks','Predictive Analytics','Full Stack'
  ]), [])
  const quotes = useMemo(()=>[
    { text: 'Fortune favors the bold.', author: 'Virgil', meta: 'Latin poet' },
    { text: 'Small steps add up.', author: 'Anon', meta: 'Daily habit' },
    { text: 'Consistency beats intensity.', author: 'Learning maxim', meta: 'Study mantra' },
    { text: 'Practice makes progress.', author: 'Adapted Proverb', meta: 'Skill growth' },
    { text: 'Think clearly, learn deeply.', author: 'Elera', meta: 'Platform ethos' }
  ], [])
  const seedRaw = Number(localStorage.getItem('loginQuoteIndex') || Date.now())
  // Deterministic seed shuffle (Fisher-Yates) to vary ordering each login
  function shuffleSeed(arr, seed){
    const a = arr.slice()
    for(let i=a.length-1;i>0;i--){
      seed = (seed*9301 + 49297) % 233280
      const r = seed / 233280
      const j = Math.floor(r * (i+1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  const shuffled = shuffleSeed(quotes, seedRaw)
  const quote = shuffled[0]
  useEffect(()=>{
    fetch(`${API_BASE}/api/courses`, { headers }).then(r=>r.json()).then(data=>{
      const apiCourses = (data.courses||[]).map(c=>({ name:c.name, code:c.code||c.name, subjects:c.subjects||[], active:true }))
      // merge with defaults; ensure coming soon courses are present and flagged inactive
      const names = new Set(apiCourses.map(c=>c.name))
      const merged = [
        ...apiCourses,
        ...DEFAULT_COURSES.filter(c=>!names.has(c.name))
      ].map(c => COMING_SOON.has(c.name) ? { ...c, active:false } : c)
      setCourses(merged)
    }).catch(()=>{/* ignore, keep defaults */})
  }, [])
  return (
    <div className="dashboard">
      <div style={{display:'flex', flexWrap:'wrap', gap:20, marginBottom:28}}>
        <div className="quotecard" aria-label="Quote of the month">
          <div className="card-name">Quote of the month</div>
          <div className="quote" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 330 307"><path fill="currentColor" d="M302.258 176.221C320.678 176.221 329.889 185.432 329.889 203.853V278.764C329.889 297.185 320.678 306.395 302.258 306.395H231.031C212.61 306.395 203.399 297.185 203.399 278.764V203.853C203.399 160.871 207.902 123.415 216.908 91.4858C226.323 59.1472 244.539 30.902 271.556 6.75027C280.562 -1.02739 288.135 -2.05076 294.275 3.68014L321.906 29.4692C328.047 35.2001 326.614 42.1591 317.608 50.3461C303.69 62.6266 292.228 80.4334 283.223 103.766C274.626 126.69 270.328 150.842 270.328 176.221H302.258ZM99.629 176.221C118.05 176.221 127.26 185.432 127.26 203.853V278.764C127.26 297.185 118.05 306.395 99.629 306.395H28.402C9.98126 306.395 0.770874 297.185 0.770874 278.764V203.853C0.770874 160.871 5.27373 123.415 14.2794 91.4858C23.6945 59.1472 41.9106 30.902 68.9277 6.75027C77.9335 -1.02739 85.5064 -2.05076 91.6467 3.68014L119.278 29.4692C125.418 35.2001 123.985 42.1591 114.98 50.3461C101.062 62.6266 89.6 80.4334 80.5942 103.766C71.9979 126.69 67.6997 150.842 67.6997 176.221H99.629Z" /></svg>
          </div>
          <div className="body-text">{quote.text}</div>
          <div className="author-container">
            <div className="author">- {quote.author} <br /><span>({quote.meta})</span>
              <svg viewBox="0 0 24 24"><path d="M0 0H24V24H0z" fill="none"></path><path d="M16.5 3C19.538 3 22 5.5 22 9c0 7-7.5 11-10 12.5C9.5 20 2 16 2 9c0-3.5 2.5-6 5.5-6C9.36 3 11 4 12 5c1-1 2.64-2 4.5-2z"></path></svg>
            </div>
          </div>
        </div>
      </div>
      <div className="grid">
        {courses.map(c => (
          <CourseCard key={c.name} course={c} onOpen={onOpenCourse} />
        ))}
      </div>
    </div>
  )
}

function LearningPath({ course, onSelectTopic }){
  const [path, setPath] = useState([])
  useEffect(()=>{
    if(!course){ setPath([]); return }
    fetch(`${API_BASE}/api/courses/learning-path/${encodeURIComponent(course)}`)
      .then(r=>r.json()).then(data=>{
        const p = (data.path||[]).map((n,i)=>({ ...n, idx:i+1 }))
        // Fallback to local defaults if API empty
        if(p.length===0){
          const local = {
            'DBMS': ['ER Model','Normalization','SQL Basics'],
            'DSA': ['Arrays','Stacks','Queues']
          }[course] || []
          setPath(local.map((t,i)=>({ title:t, topic:t, idx:i+1 })))
        } else {
          setPath(p)
        }
      }).catch(()=>{
        const local = {
          'DBMS': ['ER Model','Normalization','SQL Basics'],
          'DSA': ['Arrays','Stacks','Queues']
        }[course] || []
        setPath(local.map((t,i)=>({ title:t, topic:t, idx:i+1 })))
      })
  }, [course])
  return (
    <div className="learning-path">
      {path.map((n, i) => (
        <div key={n.topic||n.title} className="node" onClick={()=>onSelectTopic(n.topic||n.title)}>
          <div className="circle">{n.idx}</div>
          <div className="label">{n.title || n.topic}</div>
          {i<path.length-1 && <div className="connector" />}
        </div>
      ))}
      {path.length===0 && <p className="muted">No path yet.</p>}
    </div>
  )
}

function QuizView({ auth, course, topic, onBack }){
  const headers = useMemo(()=> ({ 'Content-Type':'application/json', 'Authorization': `Bearer ${auth.token}` }), [auth.token])
  const [state, setState] = useState({ q:null, mastery:0.5, streak:0, count:0, correctCount:0, done:false })
  const [error, setError] = useState("")

  async function fetchNext(){
    const payload = { learnerId: auth.user._id, course, topic }
    setError("")
    let res = await fetch(`${API_BASE}/api/quiz/next`, { method:'POST', headers, body: JSON.stringify(payload) })
    let data = await res.json()
    if(!res.ok || !data?.question){
      // Fallbacks: try without topic, then without course
      const try1 = await fetch(`${API_BASE}/api/quiz/next`, { method:'POST', headers, body: JSON.stringify({ learnerId: auth.user._id, course }) })
      if(try1.ok){
        data = await try1.json();
        if(data?.question){ setState(s=>({ ...s, q:data.question })); return }
      }
      const try2 = await fetch(`${API_BASE}/api/quiz/next`, { method:'POST', headers, body: JSON.stringify({ learnerId: auth.user._id }) })
      if(try2.ok){
        data = await try2.json();
        if(data?.question){ setState(s=>({ ...s, q:data.question })); return }
      }
      setError(data?.msg || data?.error || 'No questions available')
      setState(s=>({ ...s, q:null }))
      return
    }
    setState(s => ({ ...s, q:data.question }))
  }

  async function submit({ selectedOption, usedHint }){
    const res = await fetch(`${API_BASE}/api/quiz/submit`, { method:'POST', headers, body: JSON.stringify({ learnerId: auth.user._id, questionId: state.q._id, topic: state.q.topic, difficulty: state.q.difficulty, selectedOption, usedHint }) })
    const data = await res.json()
    if(res.ok){
      setState(s => {
        const nextCount = s.count + 1
        const nextCorrect = s.correctCount + (data.isCorrect ? 1 : 0)
        const done = nextCount >= 10
        return { ...s, mastery: data.newMastery, streak: data.streak, count: nextCount, correctCount: nextCorrect, done }
      })
      if(!state.done){
        await fetchNext()
      }
    }
    return data
  }

  useEffect(()=>{ fetchNext() }, [course, topic])

  return (
    <div className="quiz-view">
      <div className="subheader">
        <button className="btn-outline" onClick={onBack}>← Back</button>
        <div className="info">
          <span className="badge">{course}</span>
          <span className="badge">{topic}</span>
        </div>
      </div>
      {error && (
        <div className="card" style={{marginBottom:12}}>
          <strong style={{color:'#1e4fff'}}>No questions found</strong>
          <p className="muted">Try another topic or tap Back to choose a different course.</p>
          <div style={{display:'flex', gap:8}}>
            <button className="btn-outline" onClick={onBack}>Back</button>
            <button className="btn-outline" onClick={()=>{ setError(""); fetchNext(); }}>Retry</button>
          </div>
        </div>
      )}
      {state.q ? (
        <QuestionCard q={state.q} onSubmit={submit} streak={state.streak} />
      ) : <p>Loading…</p>}
    </div>
  )
}

function Student({ auth }){
  const [view, setView] = useState('dashboard')
  const [activeCourse, setActiveCourse] = useState(null)
  const [activeTopic, setActiveTopic] = useState(null)
  const goHome = () => { setView('dashboard'); setActiveCourse(null); setActiveTopic(null) }
  return (
    <div className="app-shell" style={{position:'relative', minHeight:'100vh', overflow:'hidden'}}>
      <DotField density={36} fullPage variant="page" spacing={62} jitter={18} />
  <GeometricDrift side="both" bottomBand />
      <AppHeader onHome={goHome} onLogout={auth.logout} user={auth.user} greet={view==='dashboard' ? auth.greeting : ''} />
      <main className="app-main">
        {view === 'dashboard' && (
          <>
            <h2 className="page-title">Dashboard</h2>
            <Dashboard auth={auth} onOpenCourse={(c)=>{ setActiveCourse(c.name); setView('course') }} />
          </>
        )}
        {view === 'course' && (
          <>
            <div className="crumbs"><button className="link" onClick={()=>setView('dashboard')}>← Back to Dashboard</button></div>
            <h2 className="page-title">{activeCourse} Learning Path</h2>
            <LearningPath course={activeCourse} onSelectTopic={(t)=>{ setActiveTopic(t); setView('quiz') }} />
          </>
        )}
        {view === 'quiz' && (
          <QuizView auth={auth} course={activeCourse} topic={activeTopic} onBack={()=> setView('course')} />
        )}
      </main>
    </div>
  )
}

function Instructor({ auth }){
  const [summary, setSummary] = useState(null)
  const headers = useMemo(()=> ({ 'Authorization': `Bearer ${auth.token}` }), [auth.token])
  useEffect(() => {
    fetch(`${API_BASE}/api/analytics/learner/${auth.user._id}/summary`, { headers })
      .then(r=>r.json()).then(setSummary).catch(()=>{})
  }, [])
  return (
    <div className="pastel-ui" style={{maxWidth:820, margin:'32px auto', padding:'0 16px'}}>
      <div className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <strong>Instructor Console</strong>
        <button className="btn-primary" onClick={auth.logout}>Logout</button>
      </div>
      <div style={{height:16}} />
      {!summary ? <p>Loading…</p> : (
        <div className="card">
          <h3>My Summary (demo)</h3>
          <ul>
            {summary.learner.mastery.map(m => (
              <li key={m.topic}>{m.topic}: {(m.score*100|0)}%</li>
            ))}
          </ul>
          <h4>Heatmap</h4>
          <ul>
            {summary.heatmap.map(h => <li key={h.topic}>{h.topic}: {(h.rate*100|0)}%</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function App(){
  const auth = useAuth()
  const [booting, setBooting] = useState(true)
  const [showLanding, setShowLanding] = useState(true)
  const [mode, setMode] = useState('login')
  const rebootSplash = ()=> { setBooting(true); setTimeout(()=> setBooting(false), 900) }
  useEffect(() => {
    const t = setTimeout(()=> setBooting(false), 900) // short elegant splash
    return () => clearTimeout(t)
  }, [])

  if(booting){
    return (
      <div className="splash peach-theme">
        <div className="splash-pattern" aria-hidden></div>
        <SplashOrbits />
        <div className="splash-typography">
          <h1 className="splash-word">Elera</h1>
          <svg className="splash-underline" viewBox="0 0 400 60" aria-hidden="true">
            <path d="M10 40 C 120 10, 280 10, 390 40" />
          </svg>
        </div>
      </div>
    )
  }
  if(!auth.user){
    return (
      <>
        {showLanding ? (
          <Landing onGetStarted={()=> setShowLanding(false)} onBrandReboot={rebootSplash} />
        ) : (
          <Auth mode={mode} onLoggedIn={auth.save} onSwitch={setMode} onBack={()=> setShowLanding(true)} />
        )}
      </>
    )
  }
  return auth.user.role === 'instructor' ? <Instructor auth={auth} /> : <Student auth={auth} />
}
