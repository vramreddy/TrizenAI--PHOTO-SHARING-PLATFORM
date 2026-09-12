import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { galleryService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineCamera,
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineDownload,
  HiOutlineShare,
  HiOutlineSparkles,
  HiOutlineHeart,
  HiHeart,
  HiOutlinePlay,
  HiOutlinePause,
  HiOutlineViewGrid,
  HiOutlinePhotograph,
  HiOutlineShieldCheck,
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

  // Favorites & Filters
  const [favorites, setFavorites] = useState(new Set());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [gridColumns, setGridColumns] = useState(4); // 3 | 4

  // Lightbox & Slideshow state
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState(false);

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

  // Toggle Favorite
  const toggleFavorite = (e, photoId) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
        toast('Removed from favorites', { icon: '🤍' });
      } else {
        next.add(photoId);
        toast.success('Added to your favorite selection!');
      }
      return next;
    });
  };

  // Slideshow timer
  useEffect(() => {
    let interval;
    if (isPlayingSlideshow && lightboxIndex >= 0) {
      interval = setInterval(() => {
        setLightboxIndex((prev) => (prev < displayedPhotos.length - 1 ? prev + 1 : 0));
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isPlayingSlideshow, lightboxIndex, photos.length]);

  // Lightbox keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (lightboxIndex < 0) return;
      if (e.key === 'Escape') {
        setLightboxIndex(-1);
        setIsPlayingSlideshow(false);
      }
      if (e.key === 'ArrowRight') {
        setLightboxIndex((i) => (i < displayedPhotos.length - 1 ? i + 1 : i));
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((i) => (i > 0 ? i - 1 : i));
      }
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlayingSlideshow((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, photos.length]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex >= 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxIndex]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/gallery/${slug}`);
    toast.success('Private gallery link copied to clipboard!');
  };

  const handleDownloadPhoto = (e, photo) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = photo.originalUrl || photo.url;
    link.download = photo.filename || `TrizenAI-${slug}-photo.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloading high-resolution photo...');
  };

  const displayedPhotos = showOnlyFavorites
    ? photos.filter((p) => favorites.has(p._id))
    : photos;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', background: 'var(--surface-base)' }}>
        <div className="spinner" />
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Unlocking high-resolution portfolio...</p>
      </div>
    );
  }

  const currentPhoto = lightboxIndex >= 0 ? displayedPhotos[lightboxIndex] : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-base)', color: 'var(--text-primary)' }}>
      {/* ─── Client Gallery Header ──────────────────────────── */}
      <header
        className="glass-header sticky top-0 z-30"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <HiOutlineCamera size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              {gallery?.title || 'Client Photo Gallery'}
            </h1>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              TrizenAI Verified High-Resolution Client Portal
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {/* Favorites Filter */}
          <button
            onClick={() => setShowOnlyFavorites((prev) => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.45rem 0.875rem',
              borderRadius: 'var(--radius-lg)',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: showOnlyFavorites ? 'hsla(350, 89%, 60%, 0.15)' : 'hsla(0, 0%, 100%, 0.04)',
              color: showOnlyFavorites ? 'var(--color-error-light)' : 'var(--text-secondary)',
              border: showOnlyFavorites ? '1px solid hsla(350, 89%, 60%, 0.3)' : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {favorites.size > 0 ? <HiHeart size={14} style={{ color: '#F43F5E' }} /> : <HiOutlineHeart size={14} />}
            <span>Favorites ({favorites.size})</span>
          </button>

          {/* Slideshow Button */}
          {displayedPhotos.length > 0 && (
            <button
              onClick={() => {
                setLightboxIndex(0);
                setIsPlayingSlideshow(true);
              }}
              className="hidden sm:inline-flex"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.45rem 0.875rem',
                borderRadius: 'var(--radius-lg)',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: 'hsla(239, 84%, 67%, 0.1)',
                color: 'var(--color-primary-light)',
                border: '1px solid hsla(239, 84%, 67%, 0.25)',
                cursor: 'pointer',
              }}
            >
              <HiOutlinePlay size={14} /> Slideshow
            </button>
          )}

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="btn-secondary"
            style={{ padding: '0.45rem 0.875rem', fontSize: '0.75rem', fontWeight: 600 }}
          >
            <HiOutlineShare size={14} /> Share
          </button>
        </div>
      </header>

      {/* ─── Hero Portfolio Cover ────────────────────────────── */}
      <div style={{ maxWidth: '88rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div
          className="glass"
          style={{
            padding: '2.5rem 2rem',
            borderRadius: 'var(--radius-2xl)',
            marginBottom: '2rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
            style={{ background: 'radial-gradient(circle, hsla(239, 84%, 67%, 0.1) 0%, transparent 70%)', filter: 'blur(50px)' }}
          />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-success">
                  <HiOutlineShieldCheck size={13} /> Verified Client Portal
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {photos.length} Curated High-Resolution Photographs
                </span>
              </div>
              <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                {gallery?.title || 'Event Gallery'}
              </h1>
              {gallery?.description && (
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '42rem', lineHeight: 1.6 }}>
                  {gallery.description}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Layout View</p>
                <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem' }}>
                  <button
                    onClick={() => setGridColumns(3)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      background: gridColumns === 3 ? 'var(--gradient-primary)' : 'hsla(0,0,0,0.3)',
                      color: 'white',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    3 Col
                  </button>
                  <button
                    onClick={() => setGridColumns(4)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-sm)',
                      background: gridColumns === 4 ? 'var(--gradient-primary)' : 'hsla(0,0,0,0.3)',
                      color: 'white',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    4 Col
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Photos Masonry Grid ───────────────────────────── */}
        {displayedPhotos.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
            <HiOutlinePhotograph size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {showOnlyFavorites ? 'No Favorite Photos Yet' : 'No Photographs Ingested'}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
              {showOnlyFavorites ? 'Click the heart icon on any photo to save it to your favorites.' : 'Photos are currently being processed by the studio team.'}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
              gap: '1rem',
            }}
          >
            {displayedPhotos.map((photo, index) => {
              const isFav = favorites.has(photo._id);
              return (
                <motion.div
                  key={photo._id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (index % 12) * 0.04, duration: 0.35 }}
                  className="group"
                  style={{
                    position: 'relative',
                    borderRadius: 'var(--radius-xl)',
                    overflow: 'hidden',
                    background: 'var(--surface-2)',
                    aspectRatio: '4 / 3',
                    cursor: 'pointer',
                  }}
                  onClick={() => setLightboxIndex(index)}
                >
                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt={photo.filename || `Photo ${index + 1}`}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className="group-hover:scale-105"
                  />

                  {/* Gradient Overlay on Hover */}
                  <div
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, hsla(0,0,0,0.4) 0%, transparent 40%, hsla(0,0,0,0.85) 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '0.875rem',
                    }}
                  >
                    {/* Top actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.375rem' }}>
                      <button
                        onClick={(e) => toggleFavorite(e, photo._id)}
                        style={{
                          width: '2rem',
                          height: '2rem',
                          borderRadius: '50%',
                          background: 'hsla(0,0,0,0.5)',
                          backdropFilter: 'blur(8px)',
                          border: 'none',
                          color: isFav ? '#F43F5E' : 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        {isFav ? <HiHeart size={16} /> : <HiOutlineHeart size={16} />}
                      </button>

                      <button
                        onClick={(e) => handleDownloadPhoto(e, photo)}
                        style={{
                          width: '2rem',
                          height: '2rem',
                          borderRadius: '50%',
                          background: 'hsla(0,0,0,0.5)',
                          backdropFilter: 'blur(8px)',
                          border: 'none',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <HiOutlineDownload size={15} />
                      </button>
                    </div>

                    {/* Bottom Metadata */}
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {photo.filename || `IMG_${index + 1}.JPG`}
                      </p>
                      <span style={{ fontSize: '0.625rem', color: 'hsla(0,0,0,0.7)', background: 'white', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 700, marginTop: '0.25rem', display: 'inline-block' }}>
                        HIGH-RES
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Fullscreen Lightbox Modal ──────────────────────── */}
      <AnimatePresence>
        {lightboxIndex >= 0 && currentPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col justify-between"
            style={{ background: 'hsla(0, 0%, 0%, 0.96)', backdropFilter: 'blur(16px)' }}
          >
            {/* Top Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'white' }}>
                  {lightboxIndex + 1} / {displayedPhotos.length}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {currentPhoto.filename || `Photo ${lightboxIndex + 1}`}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  onClick={() => setIsPlayingSlideshow((prev) => !prev)}
                  style={{
                    padding: '0.45rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    background: isPlayingSlideshow ? 'var(--color-primary)' : 'hsla(0,0,0,0.5)',
                    color: 'white',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  {isPlayingSlideshow ? <HiOutlinePause size={14} /> : <HiOutlinePlay size={14} />}
                  {isPlayingSlideshow ? 'Pause' : 'Play Slideshow'}
                </button>

                <button
                  onClick={(e) => toggleFavorite(e, currentPhoto._id)}
                  style={{
                    width: '2.25rem',
                    height: '2.25rem',
                    borderRadius: '50%',
                    background: 'hsla(0,0,0,0.5)',
                    border: '1px solid var(--border-subtle)',
                    color: favorites.has(currentPhoto._id) ? '#F43F5E' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {favorites.has(currentPhoto._id) ? <HiHeart size={18} /> : <HiOutlineHeart size={18} />}
                </button>

                <button
                  onClick={(e) => handleDownloadPhoto(e, currentPhoto)}
                  style={{
                    width: '2.25rem',
                    height: '2.25rem',
                    borderRadius: '50%',
                    background: 'hsla(0,0,0,0.5)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <HiOutlineDownload size={18} />
                </button>

                <button
                  onClick={() => {
                    setLightboxIndex(-1);
                    setIsPlayingSlideshow(false);
                  }}
                  style={{
                    width: '2.25rem',
                    height: '2.25rem',
                    borderRadius: '50%',
                    background: 'hsla(0,0,0,0.5)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <HiOutlineX size={20} />
                </button>
              </div>
            </div>

            {/* Central Photo View */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '1rem' }}>
              {/* Previous */}
              {lightboxIndex > 0 && (
                <button
                  onClick={() => setLightboxIndex((i) => i - 1)}
                  style={{
                    position: 'absolute',
                    left: '1.5rem',
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '50%',
                    background: 'hsla(0,0,0,0.6)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                  }}
                >
                  <HiOutlineChevronLeft size={24} />
                </button>
              )}

              <img
                src={currentPhoto.originalUrl || currentPhoto.url}
                alt="Fullscreen View"
                style={{
                  maxHeight: '80vh',
                  maxWidth: '90vw',
                  objectFit: 'contain',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                }}
              />

              {/* Next */}
              {lightboxIndex < displayedPhotos.length - 1 && (
                <button
                  onClick={() => setLightboxIndex((i) => i + 1)}
                  style={{
                    position: 'absolute',
                    right: '1.5rem',
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '50%',
                    background: 'hsla(0,0,0,0.6)',
                    border: '1px solid var(--border-subtle)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                  }}
                >
                  <HiOutlineChevronRight size={24} />
                </button>
              )}
            </div>

            {/* Bottom Camera EXIF info */}
            <div style={{ padding: '0.875rem 1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Sony A7IV · FE 50mm F1.4 GM · 1/500s · ISO 100 · Uncompressed RAW
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryViewPage;
