import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlineCalendar, HiOutlineArrowLeft, HiOutlineSparkles, HiOutlineDocumentText } from 'react-icons/hi';

const CreateEventPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Event name is required');
      return;
    }
    setLoading(true);
    try {
      const { data } = await eventService.create({ name: name.trim(), description: description.trim() });
      toast.success('Event created successfully! Redirecting to event workspace...');
      navigate(`/events/${data.data.event._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <HiOutlineArrowLeft size={16} /> Back to Events
      </button>

      <div className="max-w-2xl">
        <div className="p-6 rounded-2xl glass border border-white/10 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 tracking-wider uppercase mb-1">
            <HiOutlineSparkles size={14} /> New Project Setup
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Photography Event</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure the event workspace to coordinate photographer uploads and client delivery.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="card space-y-4 p-6 border-white/10">
            <div>
              <label className="input-label">Event Name *</label>
              <div className="relative">
                <input
                  id="event-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input text-sm"
                  placeholder="e.g. Arjun & Priya Wedding Celebration"
                  maxLength={200}
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">A clear, recognizable title for your client and team.</p>
            </div>

            <div>
              <label className="input-label">Event Description & Location</label>
              <textarea
                id="event-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input text-sm resize-none"
                rows={4}
                placeholder="e.g. Grand wedding celebration at Udaipur Palace. Full day coverage from ceremony to reception."
                maxLength={1000}
              />
              <p className="text-[11px] text-slate-500 mt-1.5">Optional context displayed on customer gallery cards.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn-primary text-xs py-3 px-6"
              id="create-event-submit"
            >
              {loading ? (
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              ) : (
                <>
                  <HiOutlineCalendar size={16} /> Create Event Workspace
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary text-xs py-3 px-5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateEventPage;
