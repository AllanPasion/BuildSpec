import { cloneElement, useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { api, assetUrl, githubLoginUrl, uploadPhoto } from './api'
import './App.css'

const vehicleInitial = { make: '', model: '', year: '', variant: '', engine: '', transmission: '', color: '', nickname: '', imageUrl: '', finalImageUrl: '' }
const modificationInitial = { name: '', category: 'Exhaust', brand: '', price: '', status: 'PLANNED', purchaseDate: '', installDate: '', installer: '', installImageUrl: '', notes: '' }
const categories = ['Engine', 'Exhaust', 'Exterior', 'Interior', 'Lighting', 'Suspension', 'Wheels & Tires', 'Other']
const statuses = ['PLANNED', 'PURCHASED', 'INSTALLED']
const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 })
const today = () => new Date().toISOString().slice(0, 10)
const showcaseFallback = '/assets/plates/vehicle-photo.png'
const signalDataChanged = () => window.dispatchEvent(new Event('buildspec:data-changed'))

function friendlyError(error, subject = 'data') {
  if (error?.message === 'Failed to fetch') return `BuildSpec could not connect to the ${subject} service. Make sure the server is running, then try again.`
  return error?.message || `BuildSpec could not load this ${subject}. Please try again.`
}

function Button({ children, variant = 'primary', className = '', ...props }) {
  return <button className={`button button--${variant} ${className}`} {...props}>{children}</button>
}

function HeaderTotals() {
  const [totals, setTotals] = useState({ paid: 0, projected: 0, loaded: false })
  useEffect(() => {
    let active = true
    async function load() {
      try {
        const vehicles = await api('/vehicles')
        if (active) setTotals({ paid: vehicles.reduce((sum, vehicle) => sum + vehicle.currentCost, 0), projected: vehicles.reduce((sum, vehicle) => sum + vehicle.projectedCost, 0), loaded: true })
      } catch { if (active) setTotals((current) => ({ ...current, loaded: false })) }
    }
    load()
    window.addEventListener('buildspec:data-changed', load)
    return () => { active = false; window.removeEventListener('buildspec:data-changed', load) }
  }, [])
  return <div className="header-total" aria-label={totals.loaded ? `${money.format(totals.paid)} paid out of ${money.format(totals.projected)} total parts cost` : 'Build cost unavailable'}><span>All builds</span><strong>{totals.loaded ? `${money.format(totals.paid)} / ${money.format(totals.projected)}` : '— / —'}</strong><small>paid / all parts</small></div>
}

function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [auth, setAuth] = useState({ loading: true, authenticated: false, configured: false, user: null, error: '' })
  const activeSection = location.pathname === '/showcase' ? 'showcase' : 'garage'
  const [notice, setNotice] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileMenuClosing, setMobileMenuClosing] = useState(false)
  const menuButtonRef = useRef(null)
  const drawerFirstLinkRef = useRef(null)
  const headerNavRef = useRef(null)
  const menuCloseTimerRef = useRef(null)
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('buildspec:theme')
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    let active = true
    api('/auth/me').then((result) => {
      if (active) setAuth({ loading: false, error: '', ...result })
    }).catch((error) => {
      if (active) setAuth({ loading: false, authenticated: false, configured: false, user: null, error: friendlyError(error, 'sign-in') })
    })
    return () => { active = false }
  }, [])

  async function signOut() {
    try {
      await api('/auth/logout', { method: 'POST' })
      setAuth((current) => ({ ...current, authenticated: false, user: null }))
      navigate('/')
    } catch (error) { setNotice(friendlyError(error, 'sign-out')) }
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    localStorage.setItem('buildspec:theme', theme)
  }, [theme])

  useEffect(() => {
    const routeNotice = location.state?.notice
    if (routeNotice) {
      // Route state is an external navigation signal; mirror it into the timed live region.
      // oxlint-disable-next-line react/set-state-in-effect
      setNotice(routeNotice)
      navigate(`${location.pathname}${location.search}`, { replace: true, state: {} })
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
    const heading = document.querySelector('main h1')
    if (heading) {
      heading.setAttribute('tabindex', '-1')
      heading.focus({ preventScroll: true })
    }
  }, [location.pathname, location.search, location.state, navigate])

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 4200)
    return () => window.clearTimeout(timer)
  }, [notice])

  const closeMobileMenu = useCallback(() => {
    if (!mobileMenuOpen) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setMobileMenuClosing(true)
    setMobileMenuOpen(false)
    window.clearTimeout(menuCloseTimerRef.current)
    menuCloseTimerRef.current = window.setTimeout(() => setMobileMenuClosing(false), reduceMotion ? 0 : 160)
  }, [mobileMenuOpen])

  useEffect(() => {
    if (!mobileMenuOpen) return undefined
    drawerFirstLinkRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        closeMobileMenu()
        menuButtonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [mobileMenuOpen, closeMobileMenu])

  useLayoutEffect(() => {
    const nav = headerNavRef.current
    if (!nav) return undefined
    let frame
    const positionIndicator = () => {
      const activeLink = nav.querySelector('[aria-current="page"]')
      if (!activeLink) return
      nav.style.setProperty('--nav-indicator-x', `${activeLink.offsetLeft}px`)
      nav.style.setProperty('--nav-indicator-width', `${activeLink.offsetWidth}px`)
      nav.classList.add('header-nav--measured')
    }
    positionIndicator()
    if (!nav.classList.contains('header-nav--animated')) {
      frame = window.requestAnimationFrame(() => nav.classList.add('header-nav--animated'))
    }
    const observer = new ResizeObserver(positionIndicator)
    observer.observe(nav)
    return () => { observer.disconnect(); window.cancelAnimationFrame(frame) }
  }, [activeSection])

  useEffect(() => () => window.clearTimeout(menuCloseTimerRef.current), [])

  const toggleMobileMenu = () => {
    if (mobileMenuOpen) { closeMobileMenu(); return }
    window.clearTimeout(menuCloseTimerRef.current)
    setMobileMenuClosing(false)
    setMobileMenuOpen(true)
  }

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <header className="app-header">
      <div className="header-content">
        <nav ref={headerNavRef} className="header-nav" aria-label="Primary"><Link className={`nav-link${activeSection === 'garage' ? ' nav-link--active' : ''}`} aria-current={activeSection === 'garage' ? 'page' : undefined} to="/">Garage</Link><Link className={`nav-link${activeSection === 'showcase' ? ' nav-link--active' : ''}`} aria-current={activeSection === 'showcase' ? 'page' : undefined} to="/showcase">Showcase</Link></nav>
        <Link className="brand" to="/"><span><span className="brand-name">BuildSpec</span><span className="brand-tagline">Automotive build archive</span></span></Link>
        <div className="header-utilities">
          {auth.authenticated && <HeaderTotals />}
          {auth.authenticated && <button className="signout-button" type="button" onClick={signOut} title={`Signed in as ${auth.user?.login || 'GitHub user'}`}>Sign out</button>}
          <button className="theme-toggle" type="button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} aria-pressed={theme === 'dark'} onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}><svg aria-hidden="true" viewBox="0 0 24 24">{theme === 'dark' ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" /></> : <path d="M20.4 15.2A8.5 8.5 0 0 1 8.8 3.6 8.5 8.5 0 1 0 20.4 15.2Z" />}</svg><span>{theme === 'dark' ? 'Light' : 'Dark'}</span></button>
          <button ref={menuButtonRef} className="mobile-menu-toggle" type="button" aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation" onClick={toggleMobileMenu}><svg aria-hidden="true" viewBox="0 0 24 24">{mobileMenuOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M5 7h14M5 12h14M5 17h14" />}</svg></button>
        </div>
      </div>
      {(mobileMenuOpen || mobileMenuClosing) && <><button className={`mobile-drawer-backdrop${mobileMenuClosing ? ' is-closing' : ''}`} type="button" aria-label="Close navigation menu" tabIndex={mobileMenuClosing ? -1 : undefined} onClick={() => { closeMobileMenu(); menuButtonRef.current?.focus() }} /><aside id="mobile-navigation" className={`mobile-drawer${mobileMenuClosing ? ' is-closing' : ''}`} aria-label="Mobile navigation" aria-hidden={mobileMenuClosing} inert={mobileMenuClosing ? true : undefined}><span className="mobile-drawer__label">Navigate</span><nav><Link ref={drawerFirstLinkRef} className={activeSection === 'garage' ? 'is-active' : undefined} aria-current={activeSection === 'garage' ? 'page' : undefined} to="/" onClick={closeMobileMenu}>Garage</Link><Link className={activeSection === 'showcase' ? 'is-active' : undefined} aria-current={activeSection === 'showcase' ? 'page' : undefined} to="/showcase" onClick={closeMobileMenu}>Showcase</Link></nav>{auth.authenticated && <button className="mobile-signout" type="button" onClick={() => { closeMobileMenu(); signOut() }}>Sign out of {auth.user?.login || 'GitHub'}</button>}</aside></>}
    </header>
    {notice && <div className="toast" role="status"><strong>Done.</strong> {notice}<button type="button" onClick={() => setNotice('')} aria-label="Dismiss notification">×</button></div>}
    <main id="main-content" className="main-content"><Routes>
      <Route path="/" element={auth.loading ? <PageState title="Checking sign-in…">Opening your garage.</PageState> : auth.authenticated ? <GaragePage /> : <LoginPage auth={auth} />} />
      <Route path="/showcase" element={<ShowcasePage authenticated={auth.authenticated} />} />
      <Route path="/vehicles/new" element={auth.loading ? <PageState title="Checking sign-in…">Opening your garage.</PageState> : auth.authenticated ? <VehicleFormPage /> : <Navigate to="/" replace />} />
      <Route path="/vehicles/:id/edit" element={auth.loading ? <PageState title="Checking sign-in…">Opening your garage.</PageState> : auth.authenticated ? <VehicleFormPage /> : <Navigate to="/" replace />} />
      <Route path="/vehicles/:id" element={auth.loading ? <PageState title="Checking sign-in…">Opening your garage.</PageState> : auth.authenticated ? <VehicleDashboardPage /> : <Navigate to="/" replace />} />
      <Route path="/vehicles/:id/modifications/new" element={auth.loading ? <PageState title="Checking sign-in…">Opening your garage.</PageState> : auth.authenticated ? <ModificationFormPage /> : <Navigate to="/" replace />} />
      <Route path="/modifications/:modificationId/edit" element={auth.loading ? <PageState title="Checking sign-in…">Opening your garage.</PageState> : auth.authenticated ? <ModificationFormPage /> : <Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes></main>
    <footer className="app-footer"><div className="footer-meta"><strong>BuildSpec</strong><span>Personal automotive build archive</span><span>Philippines · 2026</span></div><span className="footer-wordmark" aria-hidden="true">BUILDSPEC</span></footer>
  </div>
}

function PageState({ type = 'empty', title, children, action }) {
  return <section className={`page-state page-state--${type}`} role={type === 'error' ? 'alert' : 'status'}><h2>{title}</h2><p>{children}</p>{action}</section>
}

function LoginPage({ auth }) {
  const authError = new URLSearchParams(window.location.search).get('auth_error')
  return <section className="login-page"><span className="login-eyebrow">Private garage</span><h1>Your builds, your account.</h1><p>Sign in with the approved GitHub account to manage vehicles, parts, costs, and photos.</p>{authError && <p className="form-error" role="alert">{authError === 'denied' ? 'GitHub sign-in was cancelled. Try again when you are ready.' : 'GitHub sign-in could not finish. Please try again.'}</p>}{auth.error && <p className="form-error" role="alert">{auth.error}</p>}{auth.configured ? <a className="button button--primary" href={githubLoginUrl}>Continue with GitHub</a> : <p className="form-error" role="alert">GitHub sign-in needs its OAuth app credentials in the API environment.</p>}<Link className="login-showcase-link" to="/showcase">Browse completed builds →</Link></section>
}

function GaragePage() {
  const [state, setState] = useState({ loading: true, error: '', vehicles: [] })
  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: '' }))
    try { setState({ loading: false, error: '', vehicles: await api('/vehicles') }) }
    catch (error) { setState({ loading: false, error: friendlyError(error, 'garage'), vehicles: [] }) }
  }, [])
  // The request resets the visible loading state for initial load and retries.
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => { load() }, [load])
  return <>
    <div className="page-heading-row"><div><h1>My Garage</h1><p className="page-description">See where every build stands and choose the next part to plan, purchase, or install.</p></div><Link className="button button--primary" to="/vehicles/new">Add Vehicle</Link></div>
    {state.loading && <PageState title="Loading your garage…">Getting your vehicles and build progress ready.</PageState>}
    {state.error && <PageState type="error" title="Your garage is unavailable" action={<Button onClick={load}>Try again</Button>}>{state.error}</PageState>}
    {!state.loading && !state.error && state.vehicles.length === 0 && <PageState title="Your first build starts here" action={<Link className="button button--primary" to="/vehicles/new">Add your first vehicle</Link>}>Add a vehicle, then track every planned, purchased, and installed modification in one place.</PageState>}
    <div className="vehicle-grid">{state.vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>
  </>
}

function ShowcasePage({ authenticated }) {
  const [state, setState] = useState({ loading: true, error: '', vehicles: [] })
  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: '' }))
    try { setState({ loading: false, error: '', vehicles: await api('/vehicles/showcase/published') }) }
    catch (error) { setState({ loading: false, error: friendlyError(error, 'showcase'), vehicles: [] }) }
  }, [])
  useEffect(() => { load() }, [load])
  return <section className="showcase-page" aria-labelledby="showcase-title">
    <div className="showcase-intro"><div><h1 id="showcase-title">Completed Builds</h1><p>Vehicles finished, photographed, and deliberately published from your garage.</p></div><strong>{state.vehicles.length} <span>published</span></strong></div>
    {state.loading && <PageState title="Opening the archive…">Loading your completed builds.</PageState>}
    {state.error && <PageState type="error" title="The showcase is unavailable" action={<Button onClick={load}>Try again</Button>}>{state.error}</PageState>}
    {!state.loading && !state.error && state.vehicles.length === 0 && <PageState title="No published builds yet" action={authenticated && <Link className="button button--primary" to="/">Return to your garage</Link>}>Install every tracked part, add a final photo, then publish the vehicle from its dashboard.</PageState>}
    <div className="showcase-list">{state.vehicles.map((vehicle) => <ShowcaseCover key={vehicle.id} vehicle={vehicle} authenticated={authenticated} />)}</div>
  </section>
}

function ShowcaseCover({ vehicle, authenticated }) {
  const completedDate = vehicle.completedAt ? new Intl.DateTimeFormat('en-PH', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${vehicle.completedAt}T00:00:00`)) : 'Completed build'
  return <article className="showcase-cover"><img src={assetUrl(vehicle.finalImageUrl) || showcaseFallback} alt={`Completed ${vehicle.year} ${vehicle.make} ${vehicle.model}`} loading="lazy" decoding="async" /><div className="showcase-cover__body"><span className="showcase-cover__status">Completed build</span><h2>{vehicle.year} {vehicle.make} {vehicle.model}</h2><p>Completed {completedDate}</p><div className="showcase-cover__stats"><span><strong>{vehicle.installedCount}</strong> Installed parts</span><span><strong>{money.format(vehicle.currentCost)}</strong> Paid</span></div>{authenticated && <Link className="button button--primary" to={`/vehicles/${vehicle.id}`}>View Build</Link>}</div></article>
}

function VehicleCard({ vehicle }) {
  const total = vehicle.modificationCount || 0
  const installed = vehicle.installedCount || 0
  const progress = total ? Math.round((installed / total) * 100) : 0
  const nextAction = total === 0 ? 'Start Build' : vehicle.purchasedCount ? `Install ${vehicle.purchasedCount} Purchased` : vehicle.plannedCount ? `Review ${vehicle.plannedCount} Planned` : 'View Completed Build'
  return <article className="vehicle-card"><VehicleImage vehicle={vehicle} framed /><div className="card-content"><div className="card-heading"><div><h2>{vehicle.year} {vehicle.make} {vehicle.model}</h2><p className="vehicle-nickname">{vehicle.nickname || 'Build in progress'}</p></div><span className="progress-percent">{progress}%</span></div><p className="muted">{vehicle.variant || 'No variant listed'}</p><div className="card-progress"><div><span>Installed progress</span><strong>{installed} of {total}</strong></div><progress value={installed} max={total || 1}>{installed} of {total}</progress></div><div className="status-counts"><span><strong>{vehicle.plannedCount || 0}</strong> Planned</span><span><strong>{vehicle.purchasedCount || 0}</strong> Purchased</span><span><strong>{money.format(vehicle.currentCost)}</strong> Spent</span></div><Link className="button button--primary" to={`/vehicles/${vehicle.id}`}>{nextAction}</Link></div></article>
}

function VehicleImage({ vehicle, framed = false }) {
  const [failed, setFailed] = useState(false)
  if (!vehicle.imageUrl || failed) return <div className="vehicle-placeholder" role="img" aria-label={`${vehicle.make || 'Vehicle'} image placeholder`}><span>{vehicle.make?.[0] || 'B'}</span></div>
  const imageUrl = assetUrl(vehicle.imageUrl)
  const image = <img className="vehicle-image" src={imageUrl} alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`} loading="lazy" decoding="async" onError={() => setFailed(true)} />
  if (!framed) return image
  return <div className="vehicle-image-frame">{image}</div>
}

function ErrorSummary({ errors, summaryRef }) {
  const entries = Object.entries(errors)
  if (!entries.length) return null
  return <div className="error-summary" role="alert" tabIndex="-1" ref={summaryRef} aria-labelledby="error-summary-title"><h2 id="error-summary-title">Check the highlighted fields</h2><ul>{entries.map(([field, message]) => <li key={field}><a href={`#${field}`}>{message}</a></li>)}</ul></div>
}

function PhotoUpload({ id, label, value, onChange, hint = 'JPG, PNG, or WebP up to 8 MB.', required = false }) {
  const [state, setState] = useState({ uploading: false, success: false, error: '' })
  const successTimerRef = useRef(null)
  useEffect(() => () => window.clearTimeout(successTimerRef.current), [])
  async function choose(event) {
    const file = event.target.files?.[0]
    if (!file) return
    window.clearTimeout(successTimerRef.current)
    setState({ uploading: true, success: false, error: '' })
    try {
      const uploaded = await uploadPhoto(file)
      await onChange(uploaded.url)
      setState({ uploading: false, success: true, error: '' })
      successTimerRef.current = window.setTimeout(() => setState((current) => ({ ...current, success: false })), 1400)
    } catch (error) { setState({ uploading: false, success: false, error: error.message }) }
    event.target.value = ''
  }
  return <div className="photo-upload"><div className="photo-upload__copy"><strong>{label}{required ? ' *' : ''}</strong><span>{hint}</span></div>{value && <img src={assetUrl(value)} alt={`${label} preview`} />}{!value && <div className="photo-upload__empty">Photo preview</div>}<label className={`button button--secondary photo-upload__button${state.success ? ' photo-upload__button--success' : ''}`} htmlFor={id}>{state.uploading ? 'Uploading…' : state.success ? 'Photo ready' : value ? 'Replace photo' : 'Choose or take photo'}</label><input id={id} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={choose} disabled={state.uploading} /><span className="visually-hidden" role="status">{state.success ? `${label} uploaded.` : ''}</span>{state.error && <p className="field-error" role="alert">{state.error}</p>}</div>
}

function Field({ label, id, error, hint, className = '', children }) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const control = cloneElement(children, { id, 'aria-invalid': error ? 'true' : undefined, 'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined })
  return <label className={`form-field ${className}`} htmlFor={id}><span>{label}</span>{control}{hint && <small id={hintId} className="field-hint">{hint}</small>}{error && <small id={errorId} className="field-error">{error}</small>}</label>
}

function VehicleFormPage() {
  const { id } = useParams(); const navigate = useNavigate(); const editing = Boolean(id)
  const [form, setForm] = useState(() => {
    if (editing) return vehicleInitial
    try { return JSON.parse(localStorage.getItem('buildspec:vehicle-draft')) || vehicleInitial } catch { return vehicleInitial }
  })
  const [errors, setErrors] = useState({})
  const errorSummaryRef = useRef(null)
  const [state, setState] = useState({ loading: editing, saving: false, saved: false, error: '' })
  const saveTimerRef = useRef(null)
  useEffect(() => () => window.clearTimeout(saveTimerRef.current), [])
  useEffect(() => {
    if (!editing) return
    api(`/vehicles/${id}`).then(({ vehicle }) => setForm(vehicle)).catch((error) => setState((current) => ({ ...current, error: friendlyError(error, 'vehicle') }))).finally(() => setState((current) => ({ ...current, loading: false })))
  }, [editing, id])
  useEffect(() => { if (!editing) localStorage.setItem('buildspec:vehicle-draft', JSON.stringify(form)) }, [editing, form])
  function update(event) { setForm({ ...form, [event.target.name]: event.target.value }); setErrors({ ...errors, [event.target.name]: '' }) }
  function validate() {
    const next = {}
    if (!form.make.trim()) next.make = 'Enter the vehicle manufacturer.'
    if (!form.model.trim()) next.model = 'Enter the vehicle model.'
    const year = Number(form.year)
    if (!year || year < 1886 || year > new Date().getFullYear() + 1) next.year = `Enter a year from 1886 to ${new Date().getFullYear() + 1}.`
    setErrors(next)
    return Object.keys(next).length === 0
  }
  async function submit(event) {
    event.preventDefault(); if (!validate()) { window.requestAnimationFrame(() => { errorSummaryRef.current?.focus(); errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }); return }
    setState({ loading: false, saving: true, saved: false, error: '' })
    try {
      const saved = await api(editing ? `/vehicles/${id}` : '/vehicles', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(form) })
      signalDataChanged()
      localStorage.removeItem('buildspec:vehicle-draft')
      setState({ loading: false, saving: false, saved: true, error: '' })
      saveTimerRef.current = window.setTimeout(() => navigate(editing ? `/vehicles/${saved.id}` : '/', { state: { notice: editing ? 'Vehicle details updated.' : 'Vehicle added to your garage.' } }), 180)
    } catch (error) { setState({ loading: false, saving: false, saved: false, error: friendlyError(error, 'garage') }) }
  }
  if (state.loading) return <PageState title="Loading vehicle…">Preparing the vehicle form.</PageState>
  return <><Link className="back-link" to={editing ? `/vehicles/${id}` : '/'}>← {editing ? 'Back to vehicle' : 'Back to My Garage'}</Link><div className="page-intro"><h1>{editing ? 'Edit Vehicle' : 'Add Vehicle'}</h1><p className="page-description">Start with the vehicle identity. Specifications and photos can be added now or later.</p></div><form className="form-card" onSubmit={submit} noValidate><ErrorSummary errors={errors} summaryRef={errorSummaryRef} />
    <fieldset className="form-section"><legend>Vehicle identity</legend><p>These three details identify the vehicle in your garage.</p><div className="form-grid">
      <Field id="vehicle-make" label="Make *" error={errors.make}><input name="make" value={form.make} onChange={update} maxLength="60" autoComplete="organization" /></Field><Field id="vehicle-model" label="Model *" error={errors.model}><input name="model" value={form.model} onChange={update} maxLength="60" /></Field>
      <Field id="vehicle-year" label="Year *" error={errors.year}><input name="year" type="number" min="1886" max={new Date().getFullYear() + 1} value={form.year} onChange={update} inputMode="numeric" /></Field><Field id="vehicle-nickname" label="Build nickname" hint="Optional. Up to 40 characters."><input name="nickname" value={form.nickname} onChange={update} maxLength="40" placeholder="Daily Civic" /></Field>
    </div></fieldset>
    <details className="form-disclosure" open={editing}><summary><span>Specifications</span><small>Optional engine, transmission, variant, and color</small></summary><div className="form-grid">
      <Field id="vehicle-variant" label="Variant"><input name="variant" value={form.variant} onChange={update} maxLength="80" /></Field><Field id="vehicle-engine" label="Engine"><input name="engine" value={form.engine} onChange={update} maxLength="80" placeholder="1.5L Turbo" /></Field>
      <Field id="vehicle-transmission" label="Transmission"><input name="transmission" value={form.transmission} onChange={update} maxLength="80" placeholder="6-speed manual" /></Field><Field id="vehicle-color" label="Color"><input name="color" value={form.color} onChange={update} maxLength="60" /></Field>
    </div></details>
    <details className="form-disclosure" open={Boolean(form.imageUrl)}><summary><span>Vehicle photo</span><small>Optional garage cover image</small></summary><PhotoUpload id="vehicle-image" label="Garage photo" value={form.imageUrl} onChange={(imageUrl) => setForm((current) => ({ ...current, imageUrl }))} /></details>
    {state.error && <p className="form-error" role="alert">{state.error}</p>} {!editing && <p className="draft-note">Draft saved on this device while you type.</p>}<div className="form-actions"><Button variant="secondary" type="button" disabled={state.saved} onClick={() => navigate(editing ? `/vehicles/${id}` : '/')}>Cancel</Button><Button className={state.saved ? 'button--success' : ''} disabled={state.saving || state.saved}>{state.saving ? 'Saving vehicle…' : state.saved ? 'Vehicle saved' : 'Save Vehicle'}</Button></div></form></>
}

function Dialog({ title, children, actions, onClose }) {
  const closeRef = useRef(null)
  const dialogRef = useRef(null)
  useEffect(() => {
    const opener = document.activeElement
    closeRef.current?.focus()
    function onKey(event) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        const focusable = [...dialogRef.current.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
        const first = focusable[0]; const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); opener?.focus?.() }
  }, [onClose])
  return <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section ref={dialogRef} className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><h2 id="dialog-title">{title}</h2>{children}<div className="dialog-actions">{cloneElement(actions[0], { ref: closeRef })}{actions.slice(1)}</div></section></div>
}

function VehicleDashboardPage() {
  const { id } = useParams(); const navigate = useNavigate()
  const [state, setState] = useState({ loading: true, error: '', vehicle: null, modifications: [] })
  const [status, setStatus] = useState('ALL'); const [category, setCategory] = useState('ALL'); const [query, setQuery] = useState(''); const [sort, setSort] = useState('RECENT')
  const [deleteTarget, setDeleteTarget] = useState(null); const [statusTarget, setStatusTarget] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: '' }))
    try { setState({ loading: false, error: '', ...await api(`/vehicles/${id}`) }) }
    catch (error) { setState({ loading: false, error: friendlyError(error, 'vehicle'), vehicle: null, modifications: [] }) }
  }, [id])
  // The request resets the visible loading state when the selected vehicle changes.
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => { load() }, [load])
  const stats = useMemo(() => {
    const mods = state.modifications
    return { total: mods.length, planned: mods.filter((m) => m.status === 'PLANNED').length, purchased: mods.filter((m) => m.status === 'PURCHASED').length, installed: mods.filter((m) => m.status === 'INSTALLED').length, current: mods.filter((m) => m.status !== 'PLANNED').reduce((sum, m) => sum + m.price, 0), projected: mods.reduce((sum, m) => sum + m.price, 0) }
  }, [state.modifications])
  const categoryOptions = [...new Set(state.modifications.map((m) => m.category))]
  const deferredQuery = useDeferredValue(query)
  const filtered = useMemo(() => state.modifications.filter((m) => (status === 'ALL' || m.status === status) && (category === 'ALL' || m.category === category) && `${m.name} ${m.brand} ${m.category}`.toLowerCase().includes(deferredQuery.toLowerCase())).sort((a, b) => sort === 'PRICE_HIGH' ? b.price - a.price : sort === 'PRICE_LOW' ? a.price - b.price : sort === 'NAME' ? a.name.localeCompare(b.name) : 0), [state.modifications, status, category, deferredQuery, sort])
  const filtersActive = status !== 'ALL' || category !== 'ALL' || query || sort !== 'RECENT'
  async function removeVehicle() {
    try { await api(`/vehicles/${id}`, { method: 'DELETE' }); signalDataChanged(); navigate('/', { state: { notice: 'Vehicle and its modification history deleted.' } }) } catch (error) { setState((current) => ({ ...current, error: friendlyError(error, 'vehicle') })) } finally { setDeleteTarget(null) }
  }
  async function removeModification(modification) {
    try { await api(`/modifications/${modification.id}`, { method: 'DELETE' }); signalDataChanged(); setFeedback(`${modification.name} deleted from the build sheet.`); setDeleteTarget(null); await load() } catch (error) { setState((current) => ({ ...current, error: friendlyError(error, 'modification') })); setDeleteTarget(null) }
  }
  async function updateStatus(modification, nextStatus, installDate = modification.installDate, installImageUrl = modification.installImageUrl) {
    try {
      await api(`/modifications/${modification.id}`, { method: 'PUT', body: JSON.stringify({ ...modification, status: nextStatus, purchaseDate: nextStatus === 'PURCHASED' && !modification.purchaseDate ? today() : modification.purchaseDate, installDate, installImageUrl }) })
      signalDataChanged(); setFeedback(`${modification.name} marked ${nextStatus.toLowerCase()}.`); setStatusTarget(null); await load()
    } catch (error) { setState((current) => ({ ...current, error: friendlyError(error, 'modification') })); setStatusTarget(null) }
  }
  if (state.loading) return <PageState title="Loading vehicle…">Gathering build details and modifications.</PageState>
  if (!state.vehicle) return <PageState type="error" title="Vehicle unavailable" action={<Link className="button button--primary" to="/">Return to garage</Link>}>{state.error}</PageState>
  const vehicle = state.vehicle
  return <><Link className="back-link" to="/">← Back to My Garage</Link>{state.error && <p className="form-error" role="alert">{state.error}</p>}
    <section className="vehicle-summary"><VehicleImage vehicle={vehicle} /><div className="vehicle-details"><h1>{vehicle.year} {vehicle.make} {vehicle.model}</h1><p className="vehicle-nickname vehicle-nickname--large">{vehicle.nickname || 'My build'}</p><p className="vehicle-spec">{[vehicle.variant, vehicle.engine, vehicle.transmission, vehicle.color].filter(Boolean).join(' · ') || 'Add specifications when you are ready.'}</p><div className="action-row"><Link className="button button--secondary" to={`/vehicles/${id}/edit`}>Edit Vehicle</Link></div></div></section>
    <section aria-labelledby="stats-title"><div className="overview-heading"><div><h2 id="stats-title" className="section-title">Build overview</h2><p>{stats.total ? `${stats.installed} of ${stats.total} modifications are installed.` : 'Your build sheet is ready for its first modification.'}</p></div><strong>{money.format(stats.current)} <span>paid so far</span></strong></div><div className="progress-card"><div className="progress-label"><strong>Installed progress</strong><span>{stats.total ? Math.round((stats.installed / stats.total) * 100) : 0}% complete</span></div><progress value={stats.installed} max={stats.total || 1}>{stats.installed} of {stats.total}</progress></div><div className="stats-grid"><Stat label="Installed" value={stats.installed} featured /><Stat label="Purchased" value={stats.purchased} /><Stat label="Planned" value={stats.planned} /><Stat label="Total mods" value={stats.total} /><Stat label="All parts cost" value={money.format(stats.projected)} /></div></section>
    <CompletionPanel vehicle={vehicle} stats={stats} onChange={load} />
    <section className="modifications-section" aria-labelledby="mods-title"><div className="section-heading-row"><div><h2 id="mods-title">Modifications</h2><p className="section-description">Find a part, update its status, or plan the next upgrade.</p></div><Link className="button button--primary desktop-add-mod" to={`/vehicles/${id}/modifications/new`}>Add Modification</Link></div>{feedback && <p className="inline-notice" role="status">{feedback}</p>}<div className="filters"><Field id="mod-search" label="Search"><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Part, brand, or category" /></Field><button className="button button--secondary filters-toggle" type="button" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((open) => !open)}>{filtersOpen ? 'Hide filters' : 'More filters'}</button><div className={`filters-extra${filtersOpen ? ' filters-extra--open' : ''}`}><Field id="mod-status" label="Status"><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="ALL">All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></Field><Field id="mod-category" label="Category"><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="ALL">All categories</option>{categoryOptions.map((item) => <option key={item}>{item}</option>)}</select></Field><Field id="mod-sort" label="Sort"><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="RECENT">Recently added</option><option value="NAME">Name</option><option value="PRICE_HIGH">Price: high to low</option><option value="PRICE_LOW">Price: low to high</option></select></Field></div><div className="filter-summary"><span>{filtered.length} of {state.modifications.length} modifications</span>{filtersActive && <button type="button" onClick={() => { setStatus('ALL'); setCategory('ALL'); setQuery(''); setSort('RECENT') }}>Clear filters</button>}</div></div>
      {state.modifications.length === 0 && <PageState title="Plan your first modification" action={<Link className="button button--primary" to={`/vehicles/${id}/modifications/new`}>Add first modification</Link>}>Add the first part or upgrade planned for this vehicle.</PageState>}{state.modifications.length > 0 && filtered.length === 0 && <PageState title="No matching modifications" action={<Button variant="secondary" onClick={() => { setStatus('ALL'); setCategory('ALL'); setQuery(''); setSort('RECENT') }}>Clear filters</Button>}>Try another search or reset the filters.</PageState>}<div className="modification-list">{filtered.map((modification) => <ModificationCard key={modification.id} modification={modification} onDelete={() => setDeleteTarget(modification)} onStatus={(next) => next === 'INSTALLED' ? setStatusTarget(modification) : updateStatus(modification, next)} />)}</div>
    </section>
    <details className="danger-zone"><summary>Vehicle settings</summary><div><div><strong>Delete this vehicle</strong><p>This permanently removes the vehicle and every modification in its build sheet.</p></div><Button variant="danger" onClick={() => setDeleteTarget(vehicle)}>Delete Vehicle</Button></div></details>
    {deleteTarget && <Dialog title={deleteTarget.id === vehicle.id ? `Delete ${vehicle.nickname || `${vehicle.make} ${vehicle.model}`}?` : `Delete ${deleteTarget.name}?`} onClose={() => setDeleteTarget(null)} actions={[<Button key="cancel" variant="secondary" type="button" onClick={() => setDeleteTarget(null)}>Keep it</Button>, <Button key="delete" variant="danger" type="button" onClick={() => deleteTarget.id === vehicle.id ? removeVehicle() : removeModification(deleteTarget)}>Delete permanently</Button>]}><p>{deleteTarget.id === vehicle.id ? 'The vehicle and every modification in its build sheet will be permanently removed. This cannot be undone.' : 'This modification will be permanently removed from the build sheet.'}</p></Dialog>}
    <div className="mobile-action-bar"><Link className="button button--primary" to={`/vehicles/${id}/modifications/new`}>Add Modification</Link></div>
    {statusTarget && <InstallDialog modification={statusTarget} onClose={() => setStatusTarget(null)} onConfirm={(date, imageUrl) => updateStatus(statusTarget, 'INSTALLED', date, imageUrl)} />}
  </>
}

function CompletionPanel({ vehicle, stats, onChange }) {
  const [photo, setPhoto] = useState(vehicle.finalImageUrl || '')
  const [state, setState] = useState({ saving: false, error: '' })
  const allInstalled = stats.total > 0 && stats.installed === stats.total
  const eligible = allInstalled && Boolean(photo)
  async function savePhoto(url) {
    setPhoto(url); setState({ saving: true, error: '' })
    try { await api(`/vehicles/${vehicle.id}`, { method: 'PUT', body: JSON.stringify({ ...vehicle, finalImageUrl: url }) }); signalDataChanged(); setState({ saving: false, error: '' }); await onChange() }
    catch (error) { setState({ saving: false, error: friendlyError(error, 'final build photo') }); throw error }
  }
  async function togglePublish() {
    setState({ saving: true, error: '' })
    try { await api(`/vehicles/${vehicle.id}/showcase`, { method: 'PATCH', body: JSON.stringify({ published: !vehicle.showcasePublished }) }); signalDataChanged(); setState({ saving: false, error: '' }); await onChange() }
    catch (error) { setState({ saving: false, error: friendlyError(error, 'showcase') }) }
  }
  return <section className={`completion-panel${eligible ? ' completion-panel--ready' : ''}`} aria-labelledby="completion-title"><div className="completion-panel__copy"><h2 id="completion-title">Completed build archive</h2><p>{vehicle.showcasePublished ? 'This vehicle is published in Completed Builds.' : allInstalled ? 'Every tracked part is installed. Add the final portrait, then publish when you are ready.' : `Install ${stats.total - stats.installed} remaining ${stats.total - stats.installed === 1 ? 'part' : 'parts'} before publishing.`}</p><ul><li className={allInstalled ? 'is-complete' : ''}>Every tracked modification installed</li><li className={photo ? 'is-complete' : ''}>Final build photo added</li><li className={vehicle.showcasePublished ? 'is-complete' : ''}>Published by you</li></ul></div><PhotoUpload id="final-build-photo" label="Final build portrait" value={photo} onChange={savePhoto} required /><div className="completion-panel__actions"><Button onClick={togglePublish} disabled={state.saving || (!eligible && !vehicle.showcasePublished)} variant={vehicle.showcasePublished ? 'secondary' : 'primary'}>{state.saving ? 'Saving…' : vehicle.showcasePublished ? 'Remove from Showcase' : 'Publish to Showcase'}</Button>{vehicle.showcasePublished && <Link className="button button--secondary" to="/showcase">Open Showcase</Link>}</div>{state.error && <p className="form-error" role="alert">{state.error}</p>}</section>
}

function InstallDialog({ modification, onClose, onConfirm }) {
  const [date, setDate] = useState(modification.installDate || today())
  const [imageUrl, setImageUrl] = useState(modification.installImageUrl || '')
  return <Dialog title={`Mark ${modification.name} installed?`} onClose={onClose} actions={[<Button key="cancel" variant="secondary" type="button" onClick={onClose}>Cancel</Button>, <Button key="confirm" type="button" onClick={() => onConfirm(date, imageUrl)} disabled={!date}>Mark Installed</Button>]}><p>Record the installation date and optionally keep a photo of the fitted part.</p><Field id="quick-install-date" label="Installation date *"><input type="date" max={today()} value={date} onChange={(event) => setDate(event.target.value)} /></Field><PhotoUpload id="quick-install-photo" label="Installed-part photo" value={imageUrl} onChange={setImageUrl} /></Dialog>
}

function Stat({ label, value, featured = false }) { return <article className={`stat-card${featured ? ' stat-card--featured' : ''}`}><span>{label}</span><strong>{value}</strong></article> }
function ModificationCard({ modification, onDelete, onStatus }) {
  const next = modification.status === 'PLANNED' ? 'PURCHASED' : modification.status === 'PURCHASED' ? 'INSTALLED' : null
  return <article className="modification-card">{modification.installImageUrl && <img className="modification-photo" src={assetUrl(modification.installImageUrl)} alt={`${modification.name} installed`} loading="lazy" />}<div className="mod-main"><div><span className={`status-badge status-badge--${modification.status.toLowerCase()}`}>{modification.status}</span><h3>{modification.name}</h3><p>{[modification.brand, modification.category].filter(Boolean).join(' · ')}</p></div><strong className="mod-price">{money.format(modification.price)}</strong></div>{modification.notes && <p className="mod-notes">{modification.notes}</p>}<div className="action-row">{next && <Button variant={next === 'PURCHASED' ? 'purchased' : 'installed'} className="button--small" onClick={() => onStatus(next)}>Mark {next === 'PURCHASED' ? 'Purchased' : 'Installed'}</Button>}<Link className="button button--secondary button--small" to={`/modifications/${modification.id}/edit`}>Edit</Link><Button variant="ghost-danger" className="button--small" onClick={onDelete}>Delete</Button></div></article>
}

function ModificationFormPage() {
  const { id, modificationId } = useParams(); const navigate = useNavigate(); const editing = Boolean(modificationId)
  const [vehicleId, setVehicleId] = useState(id || ''); const [vehicle, setVehicle] = useState(null)
  const [form, setForm] = useState(() => { if (editing) return modificationInitial; try { return JSON.parse(localStorage.getItem(`buildspec:mod-draft:${id}`)) || modificationInitial } catch { return modificationInitial } })
  const [errors, setErrors] = useState({})
  const errorSummaryRef = useRef(null)
  const [state, setState] = useState({ loading: true, saving: false, saved: false, error: '' })
  const saveTimerRef = useRef(null)
  useEffect(() => () => window.clearTimeout(saveTimerRef.current), [])
  useEffect(() => {
    async function load() {
      try { let targetVehicleId = id; if (editing) { const modification = await api(`/modifications/${modificationId}`); targetVehicleId = modification.vehicleId; setForm(modification); setVehicleId(targetVehicleId) } const data = await api(`/vehicles/${targetVehicleId}`); setVehicle(data.vehicle); setState({ loading: false, saving: false, error: '' }) }
      catch (error) { setState({ loading: false, saving: false, error: friendlyError(error, 'modification') }) }
    }
    load()
  }, [editing, id, modificationId])
  useEffect(() => { if (!editing && id) localStorage.setItem(`buildspec:mod-draft:${id}`, JSON.stringify(form)) }, [editing, form, id])
  function update(event) { setForm({ ...form, [event.target.name]: event.target.value }); setErrors({ ...errors, [event.target.name]: '' }) }
  function validate() {
    const next = {}
    if (!form.name.trim()) next.name = 'Enter the part or modification name.'
    if (form.price === '' || Number(form.price) < 0) next.price = 'Enter a price of zero or greater.'
    if (form.status === 'INSTALLED' && !form.installDate) next.installDate = 'Enter the date this modification was installed.'
    if (form.installDate && form.installDate > today()) next.installDate = 'Installation date cannot be in the future.'
    setErrors(next); return Object.keys(next).length === 0
  }
  async function submit(event) {
    event.preventDefault(); if (!validate()) { window.requestAnimationFrame(() => { errorSummaryRef.current?.focus(); errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }); return }
    setState((current) => ({ ...current, saving: true, saved: false, error: '' }))
    try {
      await api(editing ? `/modifications/${modificationId}` : '/modifications', { method: editing ? 'PUT' : 'POST', body: JSON.stringify({ ...form, vehicleId }) })
      signalDataChanged()
      localStorage.removeItem(`buildspec:mod-draft:${vehicleId}`)
      setState((current) => ({ ...current, saving: false, saved: true, error: '' }))
      saveTimerRef.current = window.setTimeout(() => navigate(`/vehicles/${vehicleId}`, { state: { notice: editing ? 'Modification updated.' : 'Modification added to the build sheet.' } }), 180)
    } catch (error) { setState((current) => ({ ...current, saving: false, saved: false, error: friendlyError(error, 'modification') })) }
  }
  if (state.loading) return <PageState title="Loading modification…">Preparing the modification form.</PageState>
  if (!vehicle) return <PageState type="error" title="Modification unavailable" action={<Link className="button button--primary" to="/">Return to garage</Link>}>{state.error}</PageState>
  return <><Link className="back-link" to={`/vehicles/${vehicleId}`}>← Back to Vehicle Dashboard</Link><div className="page-intro"><h1>{editing ? 'Edit Modification' : 'Add Modification'}</h1><p className="page-description">For {vehicle.year} {vehicle.make} {vehicle.model}. Record the part first, then add purchase and installation details when they matter.</p></div><form className="form-card" onSubmit={submit} noValidate><ErrorSummary errors={errors} summaryRef={errorSummaryRef} />
    <fieldset className="form-section"><legend>Part details</legend><div className="form-grid"><Field id="mod-name" label="Modification name *" error={errors.name}><input name="name" value={form.name} onChange={update} maxLength="100" placeholder="Cat-back exhaust" /></Field><Field id="mod-brand" label="Brand"><input name="brand" value={form.brand} onChange={update} maxLength="80" /></Field><Field id="mod-category-field" label="Category *"><select name="category" value={form.category} onChange={update}>{categories.map((item) => <option key={item}>{item}</option>)}</select></Field><Field id="mod-price-field" label="Price (PHP) *" error={errors.price}><input name="price" type="number" min="0" step="0.01" value={form.price} onChange={update} inputMode="decimal" /></Field></div></fieldset>
    <fieldset className="form-section"><legend>Build progress</legend><div className="form-grid"><Field id="mod-status-field" label="Status *"><select name="status" value={form.status} onChange={update}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></Field><Field id="mod-purchase-date" label="Purchase date"><input name="purchaseDate" type="date" max={today()} value={form.purchaseDate} onChange={update} /></Field>{form.status === 'INSTALLED' && <Field id="mod-install-date" label="Install date *" error={errors.installDate}><input name="installDate" type="date" max={today()} value={form.installDate} onChange={update} /></Field>}<Field id="mod-installer" label="Installer or shop"><input name="installer" value={form.installer} onChange={update} maxLength="100" /></Field></div>{form.status === 'INSTALLED' && <PhotoUpload id="mod-install-photo" label="Installed-part photo" value={form.installImageUrl} onChange={(installImageUrl) => setForm((current) => ({ ...current, installImageUrl }))} />}</fieldset>
    <details className="form-disclosure" open={Boolean(form.notes)}><summary><span>Notes</span><small>Optional fitment, part number, or installation details</small></summary><Field id="mod-notes-field" label="Build notes" hint={`${form.notes.length}/500 characters`}><textarea name="notes" rows="4" value={form.notes} onChange={update} maxLength="500" /></Field></details>
    {state.error && <p className="form-error" role="alert">{state.error}</p>} {!editing && <p className="draft-note">Draft saved on this device while you type.</p>}<div className="form-actions"><Button variant="secondary" type="button" disabled={state.saved} onClick={() => navigate(`/vehicles/${vehicleId}`)}>Cancel</Button><Button className={state.saved ? 'button--success' : ''} disabled={state.saving || state.saved}>{state.saving ? 'Saving modification…' : state.saved ? 'Modification saved' : 'Save Modification'}</Button></div></form></>
}

export default AppLayout
