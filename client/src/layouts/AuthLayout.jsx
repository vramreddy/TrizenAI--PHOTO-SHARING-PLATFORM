import { Outlet } from 'react-router-dom';
import { HiOutlineCamera } from 'react-icons/hi';

const AuthLayout = () => {
  return (
    <div
      className="min-h-screen py-10 px-4 flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse at 30% 10%, hsla(239, 84%, 67%, 0.12) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, hsla(263, 70%, 58%, 0.08) 0%, transparent 50%),
          linear-gradient(180deg, hsl(222, 47%, 7%) 0%, hsl(222, 47%, 5%) 100%)
        `,
      }}
    >
      {/* Floating bokeh orbs — CSS only, no JS overhead */}
      <div
        className="fixed top-[-10%] left-[15%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsla(239, 84%, 67%, 0.06) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'float-slow 18s ease-in-out infinite',
        }}
      />
      <div
        className="fixed bottom-[-5%] right-[10%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsla(263, 70%, 58%, 0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float-slower 22s ease-in-out infinite',
        }}
      />

      {/* Subtle dot grid pattern overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle, hsla(0, 0%, 100%, 0.8) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Logo Lockup */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div
            style={{
              width: '4.5rem',
              height: '4.5rem',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              position: 'relative',
              background: 'var(--gradient-primary)',
              boxShadow: '0 0 40px -4px hsla(239, 84%, 67%, 0.35), inset 0 1px 0 hsla(0, 0%, 100%, 0.15)',
            }}
          >
            {/* Subtle inner shine */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 'var(--radius-xl)',
                background: 'linear-gradient(180deg, hsla(0, 0%, 100%, 0.15) 0%, transparent 50%)',
                pointerEvents: 'none',
              }}
            />
            <HiOutlineCamera className="text-white" size={34} style={{ display: 'block', flexShrink: 0 }} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            TrizenAI
          </h1>
          <p className="text-sm mt-1.5 font-medium" style={{ color: 'var(--text-tertiary)' }}>
            Professional Photo Sharing Platform
          </p>
        </div>

        <Outlet />

        {/* Footer */}
        <p className="text-center mt-10 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
          © 2026 TrizenAI · Secure · Private · Professional
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
