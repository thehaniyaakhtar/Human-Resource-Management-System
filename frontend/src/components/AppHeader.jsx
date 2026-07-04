import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LogOut, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AppHeader({ title, backTo, backLabel = 'Back' }) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/signin')
  }

  return (
    <header style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 32px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {backTo && (
          <motion.button
            type="button"
            onClick={() => navigate(backTo)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 12px',
              background: 'transparent',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--text-muted)',
              fontWeight: '500',
            }}
          >
            <ArrowLeft size={14} />
            {backLabel}
          </motion.button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '30px', height: '30px',
            background: 'linear-gradient(135deg, var(--purple-deep), var(--purple))',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            </svg>
          </div>
          {title && (
            <span style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: '700', fontSize: '16px', color: 'var(--text)' }}>
              {title}
            </span>
          )}
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleLogout}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 14px',
          background: 'transparent',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
          fontSize: '13px',
          color: 'var(--text-muted)',
          fontWeight: '500',
        }}
      >
        <LogOut size={14} />
        Sign out
      </motion.button>
    </header>
  )
}
