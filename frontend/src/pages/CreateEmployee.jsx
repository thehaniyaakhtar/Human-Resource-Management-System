import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, AlertCircle, ArrowRight, Loader,
  Hash, KeyRound, Copy, Check, UserPlus, MapPin, Calendar,
  Briefcase, DollarSign, FileText, Camera, Upload, Trash2, ChevronLeft,
} from 'lucide-react'
import AppHeader from '../components/AppHeader'
import InputField from '../components/InputField'
import SelectField from '../components/SelectField'
import { createEmployee } from '../api/employees'
import { useAuth } from '../context/AuthContext'

const STEPS = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'job', label: 'Job', icon: Briefcase },
  { id: 'salary', label: 'Salary', icon: DollarSign },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'photo', label: 'Photo', icon: Camera },
]

const INITIAL_FORM = {
  name: '', email: '', phone: '',
  date_of_birth: '', gender: '',
  address: '', city: '', state: '', postal_code: '',
  emergency_contact_name: '', emergency_contact_phone: '',
  department: '', designation: '', employment_type: '',
  join_date: '', work_location: '', reporting_manager: '',
  basic_salary: '', hra: '', allowances: '', deductions: '',
  documents: [],
  profile_picture: null,
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* noop */ }
  }
  return (
    <motion.button type="button" onClick={handleCopy} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', background: copied ? 'var(--success)' : 'rgba(113,75,103,0.08)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: copied ? 'white' : 'var(--purple)', flexShrink: 0 }}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied' : 'Copy'}
    </motion.button>
  )
}

function CredentialRow({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
      <div style={{ width: '36px', height: '36px', background: 'rgba(113,75,103,0.08)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={16} color="var(--purple)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '11px', color: 'var(--text-subtle)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '600', fontFamily: 'monospace', wordBreak: 'break-all' }}>{value}</div>
      </div>
      <CopyButton value={value} label={label} />
    </div>
  )
}

function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '28px', overflowX: 'auto', paddingBottom: '4px' }}>
      {STEPS.map((step, i) => {
        const Icon = step.icon
        const active = i === current
        const done = i < current
        return (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px',
              borderRadius: '99px',
              background: active ? 'rgba(113,75,103,0.12)' : done ? 'rgba(46,158,107,0.1)' : 'transparent',
              border: `1.5px solid ${active ? 'var(--purple)' : done ? 'var(--success)' : 'var(--border)'}`,
            }}>
              {done ? <Check size={13} color="var(--success)" /> : <Icon size={13} color={active ? 'var(--purple)' : 'var(--text-subtle)'} />}
              <span style={{ fontSize: '12px', fontWeight: '600', color: active ? 'var(--purple)' : done ? 'var(--success)' : 'var(--text-subtle)' }}>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && <div style={{ width: '16px', height: '1.5px', background: done ? 'var(--success)' : 'var(--border)' }} />}
          </div>
        )
      })}
    </div>
  )
}

export default function CreateEmployee() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const docRef = useRef(null)
  const photoRef = useRef(null)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState(null)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const validateStep = () => {
    const e = {}
    if (step === 0) {
      if (!form.name.trim()) e.name = 'Full name is required'
      if (!form.email) e.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
      if (!form.phone.trim()) e.phone = 'Phone number is required'
    }
    if (step === 1) {
      if (!form.department.trim()) e.department = 'Department is required'
      if (!form.designation.trim()) e.designation = 'Designation is required'
      if (!form.join_date) e.join_date = 'Join date is required'
    }
    return e
  }

  const buildPayload = () => {
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      date_of_birth: form.date_of_birth || null,
      gender: form.gender || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      postal_code: form.postal_code || null,
      emergency_contact_name: form.emergency_contact_name || null,
      emergency_contact_phone: form.emergency_contact_phone || null,
      department: form.department || null,
      designation: form.designation || null,
      employment_type: form.employment_type || null,
      join_date: form.join_date || null,
      work_location: form.work_location || null,
      reporting_manager: form.reporting_manager || null,
      profile_picture: form.profile_picture || null,
    }
    const hasSalary = form.basic_salary || form.hra || form.allowances || form.deductions
    if (hasSalary) {
      payload.salary = {
        basic_salary: parseFloat(form.basic_salary) || 0,
        hra: parseFloat(form.hra) || 0,
        allowances: parseFloat(form.allowances) || 0,
        deductions: parseFloat(form.deductions) || 0,
      }
    }
    if (form.documents.length) payload.documents = form.documents
    return payload
  }

  const handleNext = async () => {
    const errs = validateStep()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    if (step < STEPS.length - 1) {
      setStep(step + 1)
      return
    }
    setApiError('')
    setLoading(true)
    try {
      const res = await createEmployee(buildPayload())
      setCreated(res.data)
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Failed to create employee.')
    } finally {
      setLoading(false)
    }
  }

  const handleDocs = async (e) => {
    const files = Array.from(e.target.files || [])
    const newDocs = await Promise.all(files.map(async (file) => ({
      name: file.name,
      doc_type: file.type || 'application/octet-stream',
      data: await readFileAsDataURL(file),
    })))
    setForm({ ...form, documents: [...form.documents, ...newDocs] })
    e.target.value = ''
  }

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const data = await readFileAsDataURL(file)
    setForm({ ...form, profile_picture: data })
  }

  const netSalary = () => {
    const basic = parseFloat(form.basic_salary) || 0
    const hra = parseFloat(form.hra) || 0
    const allowances = parseFloat(form.allowances) || 0
    const deductions = parseFloat(form.deductions) || 0
    return (basic + hra + allowances - deductions).toLocaleString('en-IN', { minimumFractionDigits: 2 })
  }

  const resetForm = () => {
    setForm(INITIAL_FORM)
    setStep(0)
    setErrors({})
    setApiError('')
    setCreated(null)
  }

  const copyAllCredentials = async () => {
    const text = [`Employee: ${created.name}`, `Employee ID (Login): ${created.employee_id}`, `Temporary Password: ${created.temp_password}`].join('\n')
    try { await navigator.clipboard.writeText(text) } catch { /* noop */ }
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <InputField label="Full name" value={form.name} onChange={set('name')} placeholder="John Doe" error={errors.name} icon={User} />
            <InputField label="Work email" type="email" value={form.email} onChange={set('email')} placeholder="john@company.com" error={errors.email} icon={Mail} />
            <InputField label="Phone number" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" error={errors.phone} icon={Phone} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <InputField label="Date of birth" type="date" value={form.date_of_birth} onChange={set('date_of_birth')} icon={Calendar} />
              <SelectField label="Gender" value={form.gender} onChange={set('gender')} options={[
                { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' }, { value: 'prefer_not_to_say', label: 'Prefer not to say' },
              ]} />
            </div>
            <InputField label="Address" value={form.address} onChange={set('address')} placeholder="Street address" icon={MapPin} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <InputField label="City" value={form.city} onChange={set('city')} placeholder="City" />
              <InputField label="State" value={form.state} onChange={set('state')} placeholder="State" />
              <InputField label="Postal code" value={form.postal_code} onChange={set('postal_code')} placeholder="PIN" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <InputField label="Emergency contact name" value={form.emergency_contact_name} onChange={set('emergency_contact_name')} placeholder="Contact name" icon={User} />
              <InputField label="Emergency contact phone" value={form.emergency_contact_phone} onChange={set('emergency_contact_phone')} placeholder="+91 …" icon={Phone} />
            </div>
          </div>
        )
      case 1:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <InputField label="Department" value={form.department} onChange={set('department')} placeholder="Engineering" error={errors.department} icon={Briefcase} />
              <InputField label="Designation" value={form.designation} onChange={set('designation')} placeholder="Software Engineer" error={errors.designation} />
            </div>
            <SelectField label="Employment type" value={form.employment_type} onChange={set('employment_type')} options={[
              { value: 'full-time', label: 'Full-time' }, { value: 'part-time', label: 'Part-time' },
              { value: 'contract', label: 'Contract' }, { value: 'intern', label: 'Intern' },
            ]} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <InputField label="Join date" type="date" value={form.join_date} onChange={set('join_date')} error={errors.join_date} icon={Calendar} />
              <InputField label="Work location" value={form.work_location} onChange={set('work_location')} placeholder="Office / Remote" icon={MapPin} />
            </div>
            <InputField label="Reporting manager" value={form.reporting_manager} onChange={set('reporting_manager')} placeholder="Manager name" icon={User} />
          </div>
        )
      case 2:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Define the employee's compensation components.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <InputField label="Basic salary (₹)" type="number" value={form.basic_salary} onChange={set('basic_salary')} placeholder="50000" icon={DollarSign} />
              <InputField label="HRA (₹)" type="number" value={form.hra} onChange={set('hra')} placeholder="20000" />
              <InputField label="Allowances (₹)" type="number" value={form.allowances} onChange={set('allowances')} placeholder="5000" />
              <InputField label="Deductions (₹)" type="number" value={form.deductions} onChange={set('deductions')} placeholder="3000" />
            </div>
            {(form.basic_salary || form.hra || form.allowances) && (
              <div style={{ padding: '14px 16px', background: 'rgba(46,158,107,0.08)', border: '1px solid rgba(46,158,107,0.2)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-subtle)', marginBottom: '4px' }}>Estimated net salary</div>
                <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--success)' }}>₹ {netSalary()}</div>
              </div>
            )}
          </div>
        )
      case 3:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Upload ID proofs, offer letters, or other onboarding documents.</p>
            <motion.button type="button" onClick={() => docRef.current?.click()} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '32px', border: '2px dashed var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>
              <Upload size={20} color="var(--purple)" />
              Click to upload documents
            </motion.button>
            <input ref={docRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleDocs} style={{ display: 'none' }} />
            {form.documents.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {form.documents.map((doc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                    <FileText size={16} color="var(--purple)" />
                    <span style={{ flex: 1, fontSize: '13px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
                    <button type="button" onClick={() => setForm({ ...form, documents: form.documents.filter((_, j) => j !== i) })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', display: 'flex', padding: '4px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      case 4:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>Add a profile photo for the employee directory.</p>
            <motion.button type="button" onClick={() => photoRef.current?.click()} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ width: '140px', height: '140px', borderRadius: '50%', border: `3px dashed ${form.profile_picture ? 'var(--accent)' : 'var(--border)'}`, background: form.profile_picture ? 'transparent' : 'var(--surface)', cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
              {form.profile_picture ? (
                <img src={form.profile_picture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <>
                  <Camera size={28} color="var(--text-subtle)" />
                  <span style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>Upload photo</span>
                </>
              )}
            </motion.button>
            <input ref={photoRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
            {form.profile_picture && (
              <button type="button" onClick={() => setForm({ ...form, profile_picture: null })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--error)' }}>
                Remove photo
              </button>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <AppHeader title="Add Employee" backTo="/employees" backLabel="Employees" />

      <main style={{ flex: 1, padding: '40px 32px', display: 'flex', justifyContent: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '560px' }}>
          {created ? (
            <div>
              <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, var(--success), #3CB371)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <Check size={28} color="white" />
              </div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '26px', fontWeight: '800', marginBottom: '8px' }}>Employee created</h1>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Share these credentials with <strong>{created.name}</strong>. The temporary password is shown only once.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <CredentialRow icon={User} label="Name" value={created.name} />
                <CredentialRow icon={Hash} label="Employee ID (Login)" value={created.employee_id} />
                <CredentialRow icon={KeyRound} label="Temporary Password" value={created.temp_password} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', background: 'rgba(224,139,54,0.1)', border: '1px solid rgba(224,139,54,0.25)', borderRadius: 'var(--radius-sm)', marginBottom: '24px' }}>
                <AlertCircle size={16} color="#E08B36" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#B87333' }}>The employee must sign in with their Employee ID and change this password on first login.</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <motion.button type="button" onClick={copyAllCredentials} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, var(--purple-deep), var(--purple))', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Copy size={15} /> Copy all credentials
                </motion.button>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <motion.button type="button" onClick={resetForm} whileHover={{ scale: 1.01 }} style={{ padding: '12px', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <UserPlus size={15} /> Add another
                  </motion.button>
                  <motion.button type="button" onClick={() => navigate('/employees')} whileHover={{ scale: 1.01 }} style={{ padding: '12px', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    View all employees
                  </motion.button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(113,75,103,0.08)', border: '1px solid rgba(113,75,103,0.15)', borderRadius: '99px', padding: '4px 10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--purple)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{user?.company_name}</span>
              </div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans'", fontSize: '26px', fontWeight: '800', marginBottom: '6px' }}>Onboard a new employee</h1>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>Step {step + 1} of {STEPS.length} — {STEPS[step].label} details</p>

              <StepIndicator current={step} />

              <AnimatePresence>
                {apiError && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px', background: 'var(--error-light)', border: '1px solid rgba(217,64,64,0.2)', borderRadius: 'var(--radius-sm)', marginBottom: '18px' }}>
                    <AlertCircle size={16} color="var(--error)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: 'var(--error)' }}>{apiError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                {renderStep()}
              </motion.div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                {step > 0 && (
                  <motion.button type="button" onClick={() => setStep(step - 1)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    style={{ padding: '13px 18px', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                    <ChevronLeft size={16} /> Back
                  </motion.button>
                )}
                <motion.button type="button" onClick={handleNext} disabled={loading} whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.98 }}
                  style={{ flex: 1, padding: '13px', background: loading ? 'var(--purple-light)' : 'linear-gradient(135deg, var(--purple-deep), var(--purple))', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: loading ? 'none' : '0 4px 16px rgba(113,75,103,0.35)' }}>
                  {loading ? (
                    <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}><Loader size={15} /></motion.div> Creating…</>
                  ) : step < STEPS.length - 1 ? (
                    <>Continue <ArrowRight size={15} /></>
                  ) : (
                    <>Create employee <ArrowRight size={15} /></>
                  )}
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
