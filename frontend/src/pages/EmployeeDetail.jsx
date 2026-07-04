import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User, Briefcase, DollarSign, FileText, Loader, AlertCircle,
} from 'lucide-react'
import AppHeader from '../components/AppHeader'
import { getEmployee } from '../api/employees'

function Avatar({ name, src, size = 80 }) {
  const initials = name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?'
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, var(--purple-deep), var(--purple-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.3, fontWeight: '700', color: 'white' }}>
      {initials}
    </div>
  )
}

function Section({ title, icon: Icon, children }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <div style={{ width: '32px', height: '32px', background: 'rgba(113,75,103,0.08)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} color="var(--purple)" />
        </div>
        <h2 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)' }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Field({ label, value }) {
  if (!value) return null
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '11px', color: 'var(--text-subtle)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{label}</div>
      <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '500' }}>{value}</div>
    </div>
  )
}

function FieldGrid({ fields }) {
  const visible = fields.filter((f) => f.value)
  if (!visible.length) return <p style={{ fontSize: '13px', color: 'var(--text-subtle)' }}>No information provided.</p>
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px 24px' }}>
      {visible.map((f) => <Field key={f.label} label={f.label} value={f.value} />)}
    </div>
  )
}

export default function EmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getEmployee(id)
      .then((res) => setEmployee(res.data))
      .catch(() => setError('Employee not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <AppHeader title="Employee" backTo="/employees" backLabel="Employees" />
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
            <Loader size={28} color="var(--purple)" />
          </motion.div>
        </div>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <AppHeader title="Employee" backTo="/employees" backLabel="Employees" />
        <div style={{ textAlign: 'center', padding: '80px 32px' }}>
          <AlertCircle size={32} color="var(--error)" style={{ marginBottom: '12px' }} />
          <p style={{ color: 'var(--error)', fontSize: '14px' }}>{error}</p>
          <button type="button" onClick={() => navigate('/employees')} style={{ marginTop: '16px', padding: '10px 18px', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '14px' }}>
            Back to list
          </button>
        </div>
      </div>
    )
  }

  const salary = employee.salary

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader title={employee.name} backTo="/employees" backLabel="Employees" />

      <main style={{ flex: 1, padding: '32px', maxWidth: '720px', width: '100%', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
          <Avatar name={employee.name} src={employee.profile_picture} />
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>{employee.name}</h1>
            <div style={{ fontSize: '13px', color: 'var(--text-subtle)', fontFamily: 'monospace', marginBottom: '6px' }}>{employee.employee_id}</div>
            {employee.designation && <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{employee.designation}{employee.department ? ` · ${employee.department}` : ''}</div>}
          </div>
        </div>

        <Section title="Personal details" icon={User}>
          <FieldGrid fields={[
            { label: 'Email', value: employee.email },
            { label: 'Phone', value: employee.phone },
            { label: 'Date of birth', value: employee.date_of_birth },
            { label: 'Gender', value: employee.gender?.replace('_', ' ') },
            { label: 'Address', value: [employee.address, employee.city, employee.state, employee.postal_code].filter(Boolean).join(', ') },
            { label: 'Emergency contact', value: employee.emergency_contact_name ? `${employee.emergency_contact_name} (${employee.emergency_contact_phone || '—'})` : null },
          ]} />
        </Section>

        <Section title="Job details" icon={Briefcase}>
          <FieldGrid fields={[
            { label: 'Department', value: employee.department },
            { label: 'Designation', value: employee.designation },
            { label: 'Employment type', value: employee.employment_type?.replace('-', ' ') },
            { label: 'Join date', value: employee.join_date },
            { label: 'Work location', value: employee.work_location },
            { label: 'Reporting manager', value: employee.reporting_manager },
          ]} />
        </Section>

        {salary && (
          <Section title="Salary structure" icon={DollarSign}>
            <FieldGrid fields={[
              { label: 'Basic salary', value: salary.basic_salary != null ? `₹ ${Number(salary.basic_salary).toLocaleString('en-IN')}` : null },
              { label: 'HRA', value: salary.hra != null ? `₹ ${Number(salary.hra).toLocaleString('en-IN')}` : null },
              { label: 'Allowances', value: salary.allowances != null ? `₹ ${Number(salary.allowances).toLocaleString('en-IN')}` : null },
              { label: 'Deductions', value: salary.deductions != null ? `₹ ${Number(salary.deductions).toLocaleString('en-IN')}` : null },
              { label: 'Net salary', value: salary.net_salary != null ? `₹ ${Number(salary.net_salary).toLocaleString('en-IN')}` : null },
            ]} />
          </Section>
        )}

        <Section title="Documents" icon={FileText}>
          {(employee.documents || []).length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-subtle)' }}>No documents uploaded.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {employee.documents.map((doc) => (
                <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
                  <FileText size={15} color="var(--purple)" />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>{doc.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>{doc.doc_type}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </main>
    </div>
  )
}
