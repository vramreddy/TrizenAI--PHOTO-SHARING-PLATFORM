import { Outlet } from 'react-router-dom';
import { HiOutlinePhotograph } from 'react-icons/hi';

const AuthLayout = () => {
  return (
    <div
      className="min-h-screen py-10 px-4 flex flex-col items-center justify-center relative overflow-x-hidden overflow-y-auto"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(79,70,229,0.15) 0%, #0F172A 60%)',
      }}
    >
      {/* Background decoration */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-glow)' }}
          >
            <HiOutlinePhotograph className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">SnapShare</h1>
          <p className="text-sm" style={{ color: '#94A3B8' }}>
            Collaborative Event Photo Sharing
          </p>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
