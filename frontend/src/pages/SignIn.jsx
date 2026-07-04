import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, AlertCircle, ArrowRight, Loader } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import InputField from '../components/InputField'
import { signIn } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function SignIn() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
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
      const res = await signIn(form.email, form.password)
      login(res.data.user, res.data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.45 }}
      >
        <div style={{ marginBottom: '36px' }}>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans'",
            fontSize: '26px',
            fontWeight: '800',
            color: 'var(--text)',
            letterSpacing: '-0.025em',
            marginBottom: '8px',
          }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Sign in to your HRMS account
          </p>
        </div>

        <AnimatePresence>
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '12px 14px',
                background: 'var(--error-light)',
                border: '1px solid rgba(217,64,64,0.2)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '20px',
              }}
            >
              <AlertCircle size={16} color="var(--error)" style={{ marginTop: '1px', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--error)', lineHeight: '1.5' }}>{apiError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <InputField
            label="Email address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@company.com"
            error={errors.email}
            icon={Mail}
            autoComplete="email"
          />
          <InputField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Enter your password"
            error={errors.password}
            icon={Lock}
            autoComplete="current-password"
          />

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            style={{
              width: '100%',
              padding: '13px',
              background: loading
                ? 'var(--purple-light)'
                : 'linear-gradient(135deg, var(--purple-deep), var(--purple))',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              letterSpacing: '0.01em',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(113,75,103,0.35)',
              transition: 'background 0.2s, box-shadow 0.2s',
              marginTop: '4px',
            }}
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                >
                  <Loader size={15} />
                </motion.div>
                Signing in…
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={15} />
              </>
            )}
          </motion.button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '28px',
          fontSize: '14px',
          color: 'var(--text-muted)',
        }}>
          No account?{' '}
          <Link to="/signup" style={{
            color: 'var(--purple)',
            fontWeight: '600',
            textDecoration: 'none',
          }}
            onMouseEnter={(e) => { e.target.style.textDecoration = 'underline' }}
            onMouseLeave={(e) => { e.target.style.textDecoration = 'none' }}
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}
