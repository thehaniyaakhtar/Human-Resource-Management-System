import { motion } from 'framer-motion'

export default function AuthLayout({ children, side }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: 'var(--bg)',
    }}>
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: 'linear-gradient(145deg, var(--purple-deep) 0%, var(--purple) 50%, var(--purple-light) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '64px 56px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(0,160,157,0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(155,107,154,0.2) 0%, transparent 50%)`,
          pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ position: 'relative', zIndex: 1, width: '100%' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '64px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '10px',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" opacity="0.9" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              </svg>
            </div>
            <span style={{ color: 'white', fontFamily: "'Plus Jakarta Sans'", fontWeight: '700', fontSize: '18px', letterSpacing: '-0.01em' }}>
              HRMS
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Plus Jakarta Sans'",
            fontSize: '38px',
            fontWeight: '800',
            color: 'white',
            lineHeight: '1.15',
            letterSpacing: '-0.03em',
            marginBottom: '16px',
          }}>
            Every workday,<br />
            <span style={{ opacity: 0.75 }}>perfectly aligned.</span>
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.65)',
            fontSize: '15px',
            lineHeight: '1.65',
            maxWidth: '340px',
            marginBottom: '48px',
          }}>
            Streamline HR operations — onboarding, attendance, leaves, and payroll in one unified platform.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: '⚡', text: 'Auto-generated Employee IDs' },
              { icon: '📅', text: 'Smart attendance & leave tracking' },
              { icon: '🔒', text: 'Role-based access control' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px', height: '32px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '15px',
                }}>
                  {icon}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.06 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{
            position: 'absolute',
            right: '-60px', bottom: '-60px',
            width: '320px', height: '320px',
            borderRadius: '50%',
            border: '60px solid white',
            pointerEvents: 'none',
          }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.04 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{
            position: 'absolute',
            right: '60px', bottom: '60px',
            width: '180px', height: '180px',
            borderRadius: '50%',
            border: '40px solid white',
            pointerEvents: 'none',
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 56px',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {children}
        </div>
      </motion.div>
    </div>
  )
}
