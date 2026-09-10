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
      <div className="flex flex-col justify-center items-center h-80 gap-3">
        <div className="spinner" />
        <p className="text-xs text-slate-400 font-medium">Loading event upload console...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <button
        onClick={() => navigate('/team')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <HiOutlineArrowLeft size={16} /> Back to Assigned Events
      </button>

      <div className="p-6 rounded-2xl glass border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 tracking-wider uppercase mb-1">
            <HiOutlineSparkles size={14} /> Batch Upload Workspace
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{event?.name}</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {event?.description || 'Upload event photographs directly into the curation pool for admin review.'}
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-right shrink-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Uploads</p>
          <p className="text-sm font-bold text-white">
            <span className="text-indigo-400">{myPhotos.length}</span> Photos
          </p>
        </div>
      </div>

      {/* Upload Drag & Drop Area */}
      <div className="card p-6 border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <HiOutlineCloudUpload size={20} className="text-indigo-400" /> Upload Photographs
          </h2>
          <span className="text-xs text-slate-400">JPEG, PNG, WebP • Max 10MB each</span>
        </div>

        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
              : 'border-white/15 hover:border-indigo-400 hover:bg-white/[0.02]'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <HiOutlineUpload size={32} />
          </div>
          <p className="text-sm font-bold text-white mb-1">
            {isDragActive ? 'Drop your photographs here...' : 'Drag & drop photos here, or browse files'}
          </p>
          <p className="text-xs text-slate-400">
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
              className="space-y-4 pt-2"
            >
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
                <span className="text-xs font-bold text-indigo-300">
                  {files.length} Photo(s) Staged for Upload
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      files.forEach((f) => URL.revokeObjectURL(f.preview));
                      setFiles([]);
                    }}
                    className="btn-secondary text-xs py-1.5 px-3"
                    disabled={uploading}
                  >
                    Clear All
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="btn-primary text-xs py-1.5 px-4 font-bold"
                  >
                    {uploading ? `Uploading (${uploadProgress}%)` : `Upload ${files.length} Photos`}
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {uploading && (
                <div className="h-2 rounded-full overflow-hidden bg-slate-800">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'var(--gradient-primary)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              )}

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {files.map((f) => (
                  <motion.div
                    key={f.id}
                    layout
                    className="relative group rounded-xl overflow-hidden aspect-square border border-white/10"
                  >
                    <img src={f.preview} alt="" className="w-full h-full object-cover" />
                    {!uploading && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(f.id);
                        }}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 hover:bg-rose-500 text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Remove photo"
                      >
                        <HiOutlineX size={14} />
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <HiOutlinePhotograph size={18} className="text-indigo-400" /> Event Uploads ({myPhotos.length})
            </h2>
            <p className="text-xs text-slate-400">All photographs uploaded to this event</p>
          </div>
        </div>

        {myPhotos.length === 0 ? (
          <div className="card text-center py-12 flex flex-col items-center">
            <HiOutlinePhotograph className="text-slate-500 mb-2" size={36} />
            <p className="text-xs text-slate-400">No photos uploaded to this event yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
            {myPhotos.map((photo) => (
              <div
                key={photo._id}
                className="relative group rounded-2xl overflow-hidden aspect-square border border-white/10 bg-slate-900/60 shadow-md"
              >
                <img
                  src={photo.thumbnailUrl || photo.storageUrl}
                  alt={photo.originalName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {photo.selected && (
                  <div className="absolute top-2 right-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500 text-white shadow-md flex items-center gap-1">
                      <HiOutlineCheck size={12} /> Curated
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                  <p className="text-[11px] font-semibold text-white truncate drop-shadow">{photo.originalName}</p>
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
