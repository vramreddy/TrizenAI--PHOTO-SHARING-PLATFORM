import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../../services/api';
import { motion } from 'framer-motion';
import {
  HiOutlineCalendar,
  HiOutlinePhotograph,
  HiOutlineUpload,
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
} from 'react-icons/hi';

const TeamDashboardPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data } = await eventService.getAll();
      setEvents(data.data.events);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 gap-3">
        <div className="spinner" />
        <p className="text-xs text-slate-400 font-medium">Loading assigned events...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="p-6 rounded-2xl glass border border-white/10">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 tracking-wider uppercase mb-1">
          <HiOutlineSparkles size={14} /> Photographer Workspace
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Assigned Events</h1>
        <p className="text-xs text-slate-400 mt-1">
          Select an event below to upload high-resolution photographs directly to the curation pool.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="card text-center py-20 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
            <HiOutlineCalendar size={32} />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Events Assigned</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            You have not been assigned to any events yet. Your lead photographer or admin will add you.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event, index) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="card flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform"
                    style={{ background: 'var(--gradient-primary)' }}
                  >
                    <HiOutlineCalendar className="text-white text-lg" />
                  </div>
                  <span
                    className={`badge ${
                      event.status === 'active' ? 'badge-success' : 'badge-warning'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {event.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-1">
                  {event.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {event.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <HiOutlinePhotograph size={15} className="text-indigo-400" />
                    <strong className="text-slate-200">{event.totalPhotos || 0}</strong> total event photos
                  </span>
                  {event.galleryPublished && (
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <HiOutlineCheckCircle size={14} /> Live
                    </span>
                  )}
                </div>

                <Link
                  to={`/team/events/${event._id}/upload`}
                  className="btn-primary w-full text-xs py-2.5 justify-center font-bold shadow-md gap-2"
                >
                  <HiOutlineUpload size={16} /> Open Upload Workspace
                  <HiOutlineArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default TeamDashboardPage;
