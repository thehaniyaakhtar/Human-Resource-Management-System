import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, AlertCircle, ArrowRight, Loader, ShieldCheck } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import InputField from '../components/InputField'
import { changePassword } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function ChangePassword() {
  const navigate = useNavigate()
  const { user, login, token } = useAuth()
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_new_password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const validate = () => {
    const e = {}
    if (!form.current_password) e.current_password = 'Enter your temporary password'
    if (!form.new_password) e.new_password = 'New password is required'
    else if (form.new_password.length < 8) e.new_password = 'At least 8 characters'
    if (!form.confirm_new_password) e.confirm_new_password = 'Please confirm new password'
    else if (form.new_password !== form.confirm_new_password) e.confirm_new_password = 'Passwords do not match'
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
      await changePassword(form)
      login({ ...user, must_change_password: false }, token)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Failed to change password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.45 }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', background: 'rgba(113,75,103,0.08)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <ShieldCheck size={24} color="var(--purple)" />
          </div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '26px', fontWeight: '800', color: 'var(--text)', letterSpacing: '-0.025em', marginBottom: '8px' }}>
            Set your password
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Your account was created with a temporary password. Set a new one to continue.
          </p>
        </div>

        <div style={{ background: 'rgba(113,75,103,0.05)', border: '1px solid rgba(113,75,103,0.12)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', marginBottom: '24px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: '500' }}>Signed in as</p>
          <p style={{ fontSize: '14px', color: 'var(--purple)', fontWeight: '600', fontFamily: 'monospace' }}>{user?.employee_id}</p>
        </div>

        <AnimatePresence>
          {apiError && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', background: 'var(--error-light)', border: '1px solid rgba(217,64,64,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
              <AlertCircle size={16} color="var(--error)" style={{ marginTop: '1px', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--error)' }}>{apiError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <InputField label="Temporary password" type="password" value={form.current_password} onChange={set('current_password')} placeholder="Enter the system-generated password" error={errors.current_password} icon={Lock} autoComplete="current-password" />
          <InputField label="New password" type="password" value={form.new_password} onChange={set('new_password')} placeholder="Min 8 characters" error={errors.new_password} icon={Lock} autoComplete="new-password" />
          <InputField label="Confirm new password" type="password" value={form.confirm_new_password} onChange={set('confirm_new_password')} placeholder="Repeat new password" error={errors.confirm_new_password} icon={Lock} autoComplete="new-password" />

          <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.98 }}
            style={{ width: '100%', padding: '13px', background: loading ? 'var(--purple-light)' : 'linear-gradient(135deg, var(--purple-deep), var(--purple))', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: loading ? 'none' : '0 4px 16px rgba(113,75,103,0.35)', transition: 'background 0.2s', marginTop: '4px' }}>
            {loading ? (
              <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}><Loader size={15} /></motion.div>Saving…</>
            ) : (<>Set Password & Continue<ArrowRight size={15} /></>)}
          </motion.button>
        </form>
      </motion.div>
    </AuthLayout>
  )
}
