export default function SelectField({ label, value, onChange, options, error, placeholder = 'Select…' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)', letterSpacing: '0.01em' }}>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '12px 14px',
          border: `1.5px solid ${error ? 'var(--error)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)',
          fontSize: '14px',
          color: value ? 'var(--text)' : 'var(--text-subtle)',
          background: 'var(--surface)',
          outline: 'none',
          cursor: 'pointer',
          boxShadow: error ? '0 0 0 3px var(--error-light)' : 'none',
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && (
        <span style={{ fontSize: '12px', color: 'var(--error)' }}>{error}</span>
      )}
    </div>
  )
}
