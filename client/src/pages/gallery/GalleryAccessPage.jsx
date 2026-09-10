import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { galleryService } from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlinePhotograph, HiOutlineLockClosed, HiOutlineSparkles } from 'react-icons/hi';

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
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: '#0B0F19' }}>
        <div className="spinner" />
        <p className="text-xs text-slate-400 font-medium">Connecting to secure gallery...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0B0F19' }}>
        <div className="card text-center max-w-md w-full p-8 border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <HiOutlinePhotograph size={32} />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">{error}</h1>
          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            The gallery link might be incorrect, private, or has not been published by the lead photographer yet.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn-secondary text-xs w-full py-2.5"
          >
            Go to Platform Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-x-hidden overflow-y-auto"
      style={{
        background: 'radial-gradient(ellipse at 50% 15%, rgba(99,102,241,0.18) 0%, #0B0F19 75%)',
      }}
    >
      {/* Ambient background glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl opacity-20 pointer-events-none bg-indigo-500" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md text-center my-8"
      >
        {/* Brand Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
          className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center relative shadow-2xl"
          style={{
            background: 'var(--gradient-primary)',
            boxShadow: '0 0 40px rgba(99,102,241,0.4)',
          }}
        >
          <HiOutlinePhotograph className="text-white text-3xl" />
        </motion.div>

        {/* Gallery Title & Header */}
        <div className="mb-6">
          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 inline-flex items-center gap-1.5 mb-3">
            <HiOutlineSparkles size={13} /> Protected Client Gallery
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {gallery?.title}
          </h1>
          {gallery?.description && (
            <p className="text-xs text-slate-300 mt-2 max-w-sm mx-auto leading-relaxed">
              {gallery.description}
            </p>
          )}
          <p className="text-[11px] font-semibold text-slate-400 mt-2">
            ✨ {gallery?.photoCount || 0} Curated Photographs Available
          </p>
        </div>

        {/* PIN Entry Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-8 border-white/10 shadow-2xl bg-slate-900/90"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <HiOutlineLockClosed className="text-indigo-400" size={18} />
            <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Enter 6-Digit Access PIN
            </p>
          </div>

          <div className="flex justify-center gap-2.5 sm:gap-3 mb-6">
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
                className="w-11 sm:w-12 h-14 text-center text-xl font-mono font-extrabold rounded-xl outline-none transition-all"
                style={{
                  background: 'rgba(11,15,25,0.9)',
                  border: digit ? '2px solid var(--color-primary-light)' : '1px solid rgba(255,255,255,0.12)',
                  color: '#FFFFFF',
                  boxShadow: digit ? '0 0 20px rgba(99,102,241,0.25)' : 'none',
                }}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={verifying || pin.join('').length < 4}
            className="btn-primary w-full py-3 text-sm font-bold shadow-lg"
            id="gallery-unlock"
          >
            {verifying ? (
              <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
            ) : (
              <>
                <HiOutlineLockClosed size={18} />
                Unlock & View Gallery
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setPin(['4', '8', '2', '9', '1', '7'])}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold mt-4 block mx-auto underline transition-colors cursor-pointer"
          >
            Quick Test: Fill Demo PIN (482917)
          </button>
        </motion.div>

        {/* Footer */}
        <p className="text-[11px] text-slate-400 mt-6">
          Powered by <span className="font-bold text-slate-400">SnapShare</span> • Private & Secure Photo Delivery
        </p>
      </motion.div>
    </div>
  );
};

export default GalleryAccessPage;
