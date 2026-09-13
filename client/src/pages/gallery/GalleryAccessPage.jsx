import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { galleryService } from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlineCamera, HiOutlineLockClosed, HiOutlineSparkles } from 'react-icons/hi';

const GalleryAccessPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [gallery, setGallery] = useState(null);
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGallery();
  }, [slug]);

  const loadGallery = async () => {
    try {
      const { data } = await galleryService.getPublic(slug);
      setGallery(data.data.gallery);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Gallery not found or has been unpublished');
      } else if (err.response?.status === 410) {
        setError('This gallery has expired');
      } else {
        setError('Failed to load gallery');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newPin = [...pin];
      digits.forEach((d, i) => {
        if (index + i < 6) newPin[index + i] = d;
      });
      setPin(newPin);
      const nextIndex = Math.min(index + digits.length, 5);
      document.getElementById(`pin-${nextIndex}`)?.focus();
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-advance to next input
    if (value && index < 5) {
      document.getElementById(`pin-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      document.getElementById(`pin-${index - 1}`)?.focus();
    }
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const handleVerify = async () => {
    const fullPin = pin.join('');
    if (fullPin.length < 4) {
      toast.error('Please enter the 6-digit gallery PIN');
      return;
    }

    setVerifying(true);
    try {
      const { data } = await galleryService.verifyPin(slug, fullPin);
      // Store gallery access token
      sessionStorage.setItem(`gallery_token_${slug}`, data.data.galleryToken);
      toast.success('PIN verified! Unlocking gallery...');
      navigate(`/gallery/${slug}/view`);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Incorrect PIN. Please check and try again.');
        setPin(['', '', '', '', '', '']);
        document.getElementById('pin-0')?.focus();
      } else {
        toast.error('Verification failed. Please try again.');
      }
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', background: 'var(--surface-base)' }}>
        <div className="spinner" />
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Connecting to secure gallery...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--surface-base)' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: '28rem', width: '100%', padding: '2.5rem' }}>
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: 'var(--radius-xl)',
              background: 'hsla(350, 89%, 60%, 0.10)',
              color: 'var(--color-error-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <HiOutlineCamera size={28} />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{error}</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            The gallery link might be incorrect, private, or has not been published by the lead photographer yet.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn-secondary"
            style={{ width: '100%', padding: '0.625rem' }}
          >
            Go to Platform Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        position: 'relative',
        overflow: 'hidden',
        background: `
          radial-gradient(ellipse at 50% 15%, hsla(239, 84%, 67%, 0.14) 0%, transparent 55%),
          linear-gradient(180deg, var(--surface-1) 0%, var(--surface-base) 100%)
        `,
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '350px',
          borderRadius: '50%',
          background: 'hsla(239, 84%, 67%, 0.06)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          animation: 'float-slow 18s ease-in-out infinite',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '28rem', textAlign: 'center', margin: '2rem 0' }}
      >
        {/* Brand Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
          style={{
            width: '4rem',
            height: '4rem',
            borderRadius: 'var(--radius-xl)',
            margin: '0 auto 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            background: 'var(--gradient-primary)',
            boxShadow: '0 0 40px hsla(239, 84%, 67%, 0.30), inset 0 1px 0 hsla(0, 0%, 100%, 0.12)',
          }}
        >
          <HiOutlineCamera className="text-white" size={28} />
        </motion.div>

        {/* Gallery Title & Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.625rem',
              fontWeight: 700,
              color: 'var(--color-primary-light)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '0.25rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: 'hsla(239, 84%, 67%, 0.08)',
              border: '1px solid hsla(239, 84%, 67%, 0.15)',
              marginBottom: '0.75rem',
            }}
          >
            <HiOutlineSparkles size={12} /> Protected Client Gallery
          </span>
          <h1 style={{ fontSize: 'clamp(1.375rem, 4vw, 1.75rem)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginTop: '0.75rem' }}>
            {gallery?.title}
          </h1>
          {gallery?.description && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: '0.625rem', maxWidth: '24rem', margin: '0.625rem auto 0', lineHeight: 1.6 }}>
              {gallery.description}
            </p>
          )}
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.625rem' }}>
            ✨ {gallery?.photoCount || 0} Curated Photographs Available
          </p>
        </div>

        {/* PIN Entry Card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="card p-4 sm:p-8"
          style={{
            boxShadow: 'var(--shadow-xl), 0 0 60px -12px hsla(239, 84%, 67%, 0.10)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <HiOutlineLockClosed style={{ color: 'var(--color-primary-light)' }} size={17} />
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Enter 6-Digit Access PIN
            </p>
          </div>

          <div className="flex justify-center gap-1.5 sm:gap-2 mb-6 max-w-full overflow-x-auto">
            {pin.map((digit, index) => (
              <input
                key={index}
                id={`pin-${index}`}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                maxLength={6}
                className="w-9 sm:w-11 h-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-extrabold rounded-lg outline-none transition-all duration-200"
                style={{
                  background: 'var(--surface-1)',
                  border: digit ? '2px solid var(--color-primary)' : '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  boxShadow: digit ? '0 0 16px hsla(239, 84%, 67%, 0.15)' : 'none',
                }}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={verifying || pin.join('').length < 4}
            className="btn-primary"
            id="gallery-unlock"
            style={{ width: '100%', padding: '0.8rem', fontSize: '0.9rem', fontWeight: 700 }}
          >
            {verifying ? (
              <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            ) : (
              <>
                <HiOutlineLockClosed size={17} />
                Unlock & View Gallery
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setPin(['4', '8', '2', '9', '1', '7'])}
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-primary-light)',
              fontWeight: 600,
              marginTop: '1rem',
              display: 'block',
              margin: '1rem auto 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              transition: 'color 0.15s ease',
            }}
          >
            Quick Test: Fill Demo PIN (482917)
          </button>
        </motion.div>

        {/* Footer */}
        <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
          Powered by <span style={{ fontWeight: 700 }}>TrizenAI</span> · Private & Secure Photo Delivery
        </p>
      </motion.div>
    </div>
  );
};

export default GalleryAccessPage;
