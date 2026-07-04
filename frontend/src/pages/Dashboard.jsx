import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Building2, Hash, UserPlus, Users } from 'lucide-react'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/signin')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
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
          <span style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: '700', fontSize: '16px', color: 'var(--text)', letterSpacing: '-0.01em' }}>
            HRMS
          </span>
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
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--error)'
            e.currentTarget.style.color = 'var(--error)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          <LogOut size={14} />
          Sign out
        </motion.button>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 32px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ textAlign: 'center', maxWidth: '480px' }}
        >
          <div style={{
            width: '72px', height: '72px',
            background: 'linear-gradient(135deg, var(--purple-deep), var(--purple))',
            borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 32px rgba(113,75,103,0.3)',
          }}>
            <User size={32} color="white" />
          </div>

          <h1 style={{
            fontFamily: "'Plus Jakarta Sans'",
            fontSize: '28px', fontWeight: '800',
            color: 'var(--text)', letterSpacing: '-0.025em',
            marginBottom: '8px',
          }}>
            Welcome, {user?.name?.split(' ')[0]}!
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '32px' }}>
            You're signed in successfully.
          </p>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px',
            textAlign: 'left',
          }}>
            {[
              { icon: Hash, label: 'Employee ID', value: user?.employee_id },
              { icon: Building2, label: 'Company', value: user?.company_name },
              { icon: User, label: 'Role', value: user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) },
            ].map(({ icon: Icon, label, value }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '16px',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
              >
                <div style={{
                  width: '32px', height: '32px',
                  background: 'rgba(113,75,103,0.08)',
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '10px',
                }}>
                  <Icon size={15} color="var(--purple)" />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-subtle)', fontWeight: '500', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {label}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '600', wordBreak: 'break-all' }}>
                  {value || '—'}
                </div>
              </motion.div>
            ))}
          </div>

          {user?.role === 'hr' && (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '28px', flexWrap: 'wrap' }}>
              <motion.button
                type="button"
                onClick={() => navigate('/employees')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 20px',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                <Users size={16} />
                View Employees
              </motion.button>
              <motion.button
                type="button"
                onClick={() => navigate('/employees/new')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, var(--purple-deep), var(--purple))',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(113,75,103,0.35)',
                }}
              >
                <UserPlus size={16} />
                Add Employee
              </motion.button>
            </div>
          )}

          <p style={{ marginTop: '32px', fontSize: '13px', color: 'var(--text-subtle)' }}>
            Dashboard modules (Attendance, Leave, Payroll) coming next.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
