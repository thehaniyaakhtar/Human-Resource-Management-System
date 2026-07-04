import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, User, Mail, Phone, Lock, AlertCircle, ArrowRight, Loader, Upload } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import InputField from '../components/InputField'
import { hrSignUp } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function SignUp() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const fileRef = useRef(null)
  const [form, setForm] = useState({ company_name: '', name: '', email: '', phone: '', password: '', confirm_password: '' })
  const [logoPreview, setLogoPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleLogo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setLogoPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const validate = () => {
    const e = {}
    if (!form.company_name.trim()) e.company_name = 'Company name is required'
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'At least 8 characters'
    if (!form.confirm_password) e.confirm_password = 'Please confirm password'
    else if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setApiError('')
    setLoading(true)
    try {
      const payload = { ...form }
      if (logoPreview) payload.company_logo = logoPreview
      const res = await hrSignUp(payload)
      login(res.data.user, res.data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const checks = [
    { label: '8+ chars', ok: form.password.length >= 8 },
    { label: 'Uppercase', ok: /[A-Z]/.test(form.password) },
    { label: 'Number', ok: /\d/.test(form.password) },
    { label: 'Symbol', ok: /[^a-zA-Z0-9]/.test(form.password) },
  ]
  const score = checks.filter(c => c.ok).length

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.45 }}>
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(113,75,103,0.08)', border: '1px solid rgba(113,75,103,0.15)', borderRadius: '99px', padding: '4px 10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--purple)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>HR / Admin</span>
          </div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '26px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.025em', marginBottom: '8px' }}>
            Set up your workspace
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>You'll be able to add employees after setup</p>
        </div>

        <AnimatePresence>
          {apiError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', background: 'var(--error-light)', border: '1px solid rgba(217,64,64,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: '18px' }}>
              <AlertCircle size={16} color="var(--error)" style={{ marginTop: '1px', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--error)' }}>{apiError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <InputField label="Company name" value={form.company_name} onChange={set('company_name')} placeholder="Odoo India" error={errors.company_name} icon={Building2} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)' }}>Logo</label>
              <motion.button type="button" onClick={() => fileRef.current?.click()} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-sm)', border: `1.5px dashed ${logoPreview ? 'var(--accent)' : 'var(--border)'}`, background: logoPreview ? 'var(--accent-light)' : 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {logoPreview ? <img src={logoPreview} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Upload size={16} color="var(--text-subtle)" />}
              </motion.button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} style={{ display: 'none' }} />
            </div>
          </div>

          <InputField label="Your full name" value={form.name} onChange={set('name')} placeholder="Jane Smith" error={errors.name} icon={User} />
          <InputField label="Work email" type="email" value={form.email} onChange={set('email')} placeholder="jane@company.com" error={errors.email} icon={Mail} autoComplete="email" />
          <InputField label="Phone number" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" error={errors.phone} icon={Phone} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <InputField label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Min 8 chars" error={errors.password} icon={Lock} autoComplete="new-password" />
            <InputField label="Confirm" type="password" value={form.confirm_password} onChange={set('confirm_password')} placeholder="Repeat" error={errors.confirm_password} icon={Lock} autoComplete="new-password" />
          </div>

          {form.password && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[0,1,2,3].map(i => (
                  <motion.div key={i} animate={{ backgroundColor: i < score ? (score <= 1 ? '#D94040' : score <= 2 ? '#E08B36' : score <= 3 ? '#D4B800' : '#2E9E6B') : 'var(--border)' }} transition={{ duration: 0.25 }} style={{ flex: 1, height: '3px', borderRadius: '99px' }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {checks.map(({ label, ok }) => (
                  <span key={label} style={{ fontSize: '11px', color: ok ? 'var(--success)' : 'var(--text-subtle)', transition: 'color 0.2s' }}>
                    {ok ? '✓' : '·'} {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.98 }}
            style={{ width: '100%', padding: '13px', background: loading ? 'var(--purple-light)' : 'linear-gradient(135deg, var(--purple-deep), var(--purple))', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: loading ? 'none' : '0 4px 16px rgba(113,75,103,0.35)', transition: 'background 0.2s', marginTop: '4px' }}>
            {loading ? (
              <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}><Loader size={15} /></motion.div>Creating account…</>
            ) : (<>Create HR Account<ArrowRight size={15} /></>)}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/signin" style={{ color: 'var(--purple)', fontWeight: '600', textDecoration: 'none' }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}>Sign in</Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}
