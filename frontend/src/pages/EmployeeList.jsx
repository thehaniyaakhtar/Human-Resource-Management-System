import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, UserPlus, Users, Loader } from 'lucide-react'
import AppHeader from '../components/AppHeader'
import { listEmployees } from '../api/employees'

function EmployeeAvatar({ name, src, size = 48 }) {
  const initials = name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?'
  if (src) {
    return (
      <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, var(--purple-deep), var(--purple-light))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32, fontWeight: '700', color: 'white',
    }}>
      {initials}
    </div>
  )
}

export default function EmployeeList() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchEmployees = useCallback(async (q) => {
    setLoading(true)
    setError('')
    try {
      const res = await listEmployees(q)
      setEmployees(res.data.employees)
    } catch {
      setError('Failed to load employees.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchEmployees(search), 300)
    return () => clearTimeout(timer)
  }, [search, fetchEmployees])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader title="Employees" backTo="/dashboard" backLabel="Dashboard" />

      <main style={{ flex: 1, padding: '32px', maxWidth: '960px', width: '100%', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>Team directory</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              {loading ? 'Loading…' : `${employees.length} employee${employees.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <motion.button
            type="button"
            onClick={() => navigate('/employees/new')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px',
              background: 'linear-gradient(135deg, var(--purple-deep), var(--purple))',
              color: 'white', border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px', fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(113,75,103,0.35)',
            }}
          >
            <UserPlus size={16} />
            Add Employee
          </motion.button>
        </div>

        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, ID, department…"
            style={{
              width: '100%', padding: '12px 14px 12px 40px',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px', color: 'var(--text)',
              background: 'var(--surface)', outline: 'none',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--purple)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
          />
        </div>

        {error && (
          <div style={{ padding: '14px', background: 'var(--error-light)', border: '1px solid rgba(217,64,64,0.2)', borderRadius: 'var(--radius-sm)', color: 'var(--error)', fontSize: '14px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
              <Loader size={28} color="var(--purple)" />
            </motion.div>
          </div>
        ) : employees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 32px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <div style={{ width: '56px', height: '56px', background: 'rgba(113,75,103,0.08)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Users size={24} color="var(--purple)" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>
              {search ? 'No employees found' : 'No employees yet'}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              {search ? 'Try a different search term.' : 'Add your first team member to get started.'}
            </p>
            {!search && (
              <motion.button type="button" onClick={() => navigate('/employees/new')} whileHover={{ scale: 1.02 }}
                style={{ padding: '10px 18px', background: 'linear-gradient(135deg, var(--purple-deep), var(--purple))', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                Add Employee
              </motion.button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {employees.map((emp, i) => (
              <motion.div
                key={emp.employee_id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
                onClick={() => navigate(`/employees/${emp.employee_id}`)}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '18px',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'box-shadow 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                  <EmployeeAvatar name={emp.name} src={emp.profile_picture} size={52} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-subtle)', fontFamily: 'monospace' }}>{emp.employee_id}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {emp.designation && (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{emp.designation}</div>
                  )}
                  {emp.department && (
                    <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>{emp.department}</div>
                  )}
                </div>
                {emp.employment_type && (
                  <div style={{ marginTop: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--purple)', background: 'rgba(113,75,103,0.08)', padding: '3px 8px', borderRadius: '99px', textTransform: 'capitalize' }}>
                      {emp.employment_type.replace('-', ' ')}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
