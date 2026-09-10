import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { galleryService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlinePhotograph,
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineDownload,
  HiOutlineShare,
  HiOutlineSparkles,
  HiOutlineLockClosed,
} from 'react-icons/hi';

const GalleryViewPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [gallery, setGallery] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const galleryToken = sessionStorage.getItem(`gallery_token_${slug}`);

  useEffect(() => {
    if (!galleryToken) {
      navigate(`/gallery/${slug}`);
      return;
    }
    loadGallery();
    loadPhotos(1);
  }, [slug]);

  const loadGallery = async () => {
    try {
      const { data } = await galleryService.getPublic(slug);
      setGallery(data.data.gallery);
    } catch {
      toast.error('Failed to load gallery metadata');
    }
  };

  const loadPhotos = async (p) => {
    try {
      if (p > 1) setLoadingMore(true);
      const { data } = await galleryService.getPhotos(slug, galleryToken, { page: p, limit: 30 });
      if (p === 1) {
        setPhotos(data.data.photos);
      } else {
        setPhotos((prev) => [...prev, ...data.data.photos]);
      }
      setHasMore(data.data.pagination.page < data.data.pagination.pages);
      setPage(p);
    } catch (err) {
      if (err.response?.status === 401) {
        sessionStorage.removeItem(`gallery_token_${slug}`);
        toast.error('Session expired. Please enter PIN again.');
        navigate(`/gallery/${slug}`);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 500
      ) {
        if (hasMore && !loadingMore) {
          loadPhotos(page + 1);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, page]);

  // Lightbox keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (lightboxIndex < 0) return;
      if (e.key === 'Escape') setLightboxIndex(-1);
      if (e.key === 'ArrowRight' && lightboxIndex < photos.length - 1) setLightboxIndex((i) => i + 1);
      if (e.key === 'ArrowLeft' && lightboxIndex > 0) setLightboxIndex((i) => i - 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, photos.length]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/gallery/${slug}`);
    toast.success('Gallery link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: '#0B0F19' }}>
        <div className="spinner" />
        <p className="text-xs text-slate-400 font-medium">Loading high-resolution gallery...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0B0F19' }}>
      {/* Sticky Gallery Header */}
      <header className="glass-header sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <HiOutlinePhotograph className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-white tracking-tight line-clamp-1">
                {gallery?.title}
              </h1>
              <p className="text-xs text-slate-400">
                {photos.length} Published Photos • PIN Protected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleShare}
              className="btn-secondary text-xs py-2 px-3 gap-1.5"
              title="Share Gallery Link"
            >
              <HiOutlineShare size={15} />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Welcome Banner */}
      {gallery?.description && (
        <div className="max-w-7xl mx-auto w-full px-6 pt-8 pb-4">
          <div className="p-6 rounded-2xl glass-subtle border border-white/5 relative overflow-hidden text-center">
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-96 h-20 bg-indigo-500/10 rounded-full blur-2xl" />
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 inline-flex items-center gap-1.5 mb-2">
              <HiOutlineSparkles size={13} /> Official Client Album
            </span>
            <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {gallery.description}
            </p>
          </div>
        </div>
      )}

      {/* Masonry Photo Grid */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {photos.length === 0 ? (
          <div className="card text-center py-20 flex flex-col items-center">
            <HiOutlinePhotograph className="text-slate-500 mb-3" size={48} />
            <h3 className="text-base font-bold text-white mb-1">No Photos Published Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              The photography team is curating the photos for this gallery. Check back shortly!
            </p>
          </div>
        ) : (
          <div className="masonry-grid">
            {photos.map((photo, index) => (
              <motion.div
                key={photo._id}
                className="masonry-grid-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.8), duration: 0.4 }}
              >
                <div
                  className="relative group rounded-2xl overflow-hidden cursor-pointer shadow-md bg-slate-900/60 border border-white/5 transition-all hover:border-indigo-500/40 hover:shadow-2xl"
                  onClick={() => setLightboxIndex(index)}
                >
                  <img
                    src={photo.thumbnailUrl || photo.storageUrl}
                    alt={photo.originalName || `Photo ${index + 1}`}
                    className="w-full block object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Gradient Hover Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <div className="flex items-center justify-between text-white">
                      <span className="text-xs font-semibold drop-shadow truncate pr-2">
                        {photo.originalName || `Photo ${index + 1}`}
                      </span>

                      <a
                        href={photo.storageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-colors shrink-0"
                        onClick={(e) => e.stopPropagation()}
                        title="Download High-Res"
                      >
                        <HiOutlineDownload size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex justify-center py-8">
            <div className="spinner" />
          </div>
        )}

        {!hasMore && photos.length > 0 && (
          <div className="text-center py-10">
            <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
              ✨ All Photographs Loaded
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="glass-header py-6 text-center mt-auto border-t border-white/5">
        <p className="text-xs text-slate-500">
          Powered by <span className="gradient-text font-bold">SnapShare</span> • Private & Secure Photo Platform
        </p>
      </footer>

      {/* ═══ Lightbox Modal ═══ */}
      <AnimatePresence>
        {lightboxIndex >= 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(5, 8, 15, 0.95)', backdropFilter: 'blur(20px)' }}
            onClick={() => setLightboxIndex(-1)}
          >
            {/* Close Button */}
            <button
              className="absolute top-5 right-5 z-10 w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              onClick={() => setLightboxIndex(-1)}
            >
              <HiOutlineX size={22} />
            </button>

            {/* Navigation Left */}
            {lightboxIndex > 0 && (
              <button
                className="absolute left-5 z-10 w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) => i - 1);
                }}
              >
                <HiOutlineChevronLeft size={26} />
              </button>
            )}

            {/* Navigation Right */}
            {lightboxIndex < photos.length - 1 && (
              <button
                className="absolute right-5 z-10 w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((i) => i + 1);
                }}
              >
                <HiOutlineChevronRight size={26} />
              </button>
            )}

            {/* Active Image */}
            <motion.div
              key={photos[lightboxIndex]?._id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="max-w-[90vw] max-h-[85vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={photos[lightboxIndex]?.storageUrl}
                alt=""
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              />

              {/* Bottom Lightbox Controls */}
              <div className="flex items-center gap-4 mt-4 px-5 py-2.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
                <span className="text-xs font-semibold text-slate-300">
                  {lightboxIndex + 1} of {photos.length}
                </span>

                <div className="w-px h-4 bg-white/20" />

                <a
                  href={photos[lightboxIndex]?.storageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
                >
                  <HiOutlineDownload size={15} /> Download Full Resolution
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryViewPage;
