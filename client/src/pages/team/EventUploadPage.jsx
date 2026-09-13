import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { eventService, photoService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft,
  HiOutlineUpload,
  HiOutlinePhotograph,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineCloudUpload,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
} from 'react-icons/hi';

const EventUploadPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [myPhotos, setMyPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload state
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    try {
      const [eventRes, photosRes] = await Promise.all([
        eventService.getOne(eventId),
        photoService.getAll(eventId, { limit: 100 }),
      ]);
      setEvent(eventRes.data.data.event);
      setMyPhotos(photosRes.data.data.photos);
    } catch (error) {
      toast.error('Failed to load event data');
      navigate('/team');
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).slice(2),
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = (id) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 30,
    onDropRejected: (rejections) => {
      rejections.forEach((r) => {
        r.errors.forEach((e) => toast.error(e.message));
      });
    },
  });

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select photos to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append('photos', f.file));

      await photoService.upload(eventId, formData, (progress) => {
        setUploadProgress(progress);
      });

      toast.success(`${files.length} photo(s) uploaded successfully!`);

      // Cleanup previews
      files.forEach((f) => URL.revokeObjectURL(f.preview));
      setFiles([]);
      setUploadProgress(0);

      // Reload photos
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed. Please check network/files.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '20rem', gap: '0.75rem' }}>
        <div className="spinner" />
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Loading event upload console...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      <button
        onClick={() => navigate('/team')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0.25rem',
          transition: 'color 0.15s ease',
        }}
        onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <HiOutlineArrowLeft size={16} /> Back to Assigned Events
      </button>

      {/* Event Header */}
      <div
        className="glass p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          borderRadius: 'var(--radius-2xl)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
            <HiOutlineSparkles size={14} style={{ color: 'var(--color-primary-light)' }} />
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary-light)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Batch Upload Workspace
            </span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {event?.name}
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.375rem', maxWidth: '36rem', lineHeight: 1.5 }}>
            {event?.description || 'Upload event photographs directly into the curation pool for admin review.'}
          </p>
        </div>

        <div
          className="self-start sm:self-auto"
          style={{
            textAlign: 'right',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-lg)',
            background: 'hsla(0, 0%, 100%, 0.02)',
            border: '1px solid var(--border-subtle)',
            flexShrink: 0,
          }}
        >
          <p style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Uploads</p>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.125rem' }}>
            <span style={{ color: 'var(--color-primary-light)' }}>{myPhotos.length}</span> Photos
          </p>
        </div>
      </div>

      {/* Upload Drag & Drop Area */}
      <div className="card p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HiOutlineCloudUpload size={20} style={{ color: 'var(--color-primary-light)' }} /> Upload Photographs
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JPEG, PNG, WebP • Max 10MB each</span>
        </div>

        <div
          {...getRootProps()}
          className="p-6 sm:p-10 text-center cursor-pointer transition-all duration-200"
          style={{
            position: 'relative',
            border: '2px dashed',
            borderColor: isDragActive ? 'var(--color-primary)' : 'var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            background: isDragActive ? 'hsla(239, 84%, 67%, 0.06)' : 'transparent',
            transform: isDragActive ? 'scale(0.995)' : 'scale(1)',
          }}
        >
          <input {...getInputProps()} />
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: 'var(--radius-xl)',
              background: 'hsla(239, 84%, 67%, 0.10)',
              color: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem',
            }}
          >
            <HiOutlineUpload size={28} />
          </div>
          <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
            {isDragActive ? 'Drop your photographs here...' : 'Drag & drop photos here, or browse files'}
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Select multiple images at once to upload batch shots directly.
          </p>
        </div>

        {/* Selected Files Preview Grid */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', paddingTop: '0.5rem', overflow: 'hidden' }}
            >
              {/* Status bar */}
              <div
                className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  background: 'hsla(239, 50%, 12%, 0.4)',
                  border: '1px solid hsla(239, 84%, 67%, 0.15)',
                }}
              >
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-primary-light)' }}>
                  {files.length} Photo(s) Staged for Upload
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <button
                    onClick={() => {
                      files.forEach((f) => URL.revokeObjectURL(f.preview));
                      setFiles([]);
                    }}
                    className="btn-secondary flex-1 sm:flex-none justify-center"
                    style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}
                    disabled={uploading}
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="btn-primary flex-1 sm:flex-none justify-center"
                    style={{ fontSize: '0.75rem', padding: '0.375rem 1rem', fontWeight: 700 }}
                  >
                    {uploading ? `Uploading (${uploadProgress}%)` : `Upload ${files.length} Photos`}
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {uploading && (
                <div style={{ height: '0.375rem', borderRadius: 'var(--radius-full)', overflow: 'hidden', background: 'var(--surface-3)' }}>
                  <motion.div
                    style={{ height: '100%', borderRadius: 'var(--radius-full)', background: 'var(--gradient-primary)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              )}

              {/* Thumbnails */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8" style={{ gap: '0.625rem' }}>
                {files.map((f) => (
                  <motion.div
                    key={f.id}
                    layout
                    style={{
                      position: 'relative',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      aspectRatio: '1',
                      border: '1px solid var(--border-default)',
                    }}
                    className="group"
                  >
                    <img src={f.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {!uploading && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(f.id);
                        }}
                        title="Remove photo"
                        style={{
                          position: 'absolute',
                          top: '0.25rem',
                          right: '0.25rem',
                          width: '1.375rem',
                          height: '1.375rem',
                          borderRadius: '50%',
                          background: 'hsla(0, 0%, 0%, 0.65)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                          opacity: 0,
                        }}
                        className="group-hover:opacity-100"
                        onMouseOver={(e) => (e.currentTarget.style.background = 'var(--color-error)')}
                        onMouseOut={(e) => (e.currentTarget.style.background = 'hsla(0, 0%, 0%, 0.65)')}
                      >
                        <HiOutlineX size={12} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Existing Uploaded Photos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HiOutlinePhotograph size={18} style={{ color: 'var(--color-primary-light)' }} /> Event Uploads ({myPhotos.length})
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>All photographs uploaded to this event</p>
        </div>

        {myPhotos.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <HiOutlinePhotograph style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} size={32} />
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No photos uploaded to this event yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" style={{ gap: '0.75rem' }}>
            {myPhotos.map((photo) => (
              <div
                key={photo._id}
                className="group"
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  aspectRatio: '1',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--surface-2)',
                }}
              >
                <img
                  src={photo.thumbnailUrl || photo.storageUrl}
                  alt={photo.originalName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  className="group-hover:scale-105"
                  loading="lazy"
                />

                {photo.selected && (
                  <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.5625rem',
                        fontWeight: 700,
                        padding: '0.125rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-success)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <HiOutlineCheck size={11} /> Curated
                    </span>
                  </div>
                )}

                <div
                  className="group-hover:opacity-100"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, hsla(0,0%,0%,0.75) 0%, transparent 50%)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '0.625rem',
                  }}
                >
                  <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                    {photo.originalName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EventUploadPage;
