import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../../services/api';
import { motion } from 'framer-motion';
import {
  HiOutlineCalendar,
  HiOutlinePhotograph,
  HiOutlineUserGroup,
  HiOutlineEye,
  HiOutlinePlus,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
} from 'react-icons/hi';

const EventsPage = () => {
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
        <p className="text-xs text-slate-400 font-medium">Loading events list...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass border border-white/10">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">All Photography Events</h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize event teams, track photo curation, and manage customer galleries
          </p>
        </div>
        <Link to="/events/create" className="btn-primary shrink-0 self-start sm:self-center">
          <HiOutlinePlus size={18} /> New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="card text-center py-20 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
            <HiOutlineCalendar size={32} />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Events Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            Create your first event to start assigning team members and uploading photos.
          </p>
          <Link to="/events/create" className="btn-primary">
            <HiOutlinePlus size={18} /> Create Event
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {events.map((event, index) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={`/events/${event._id}`} className="block">
                <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:border-indigo-500/40 cursor-pointer group">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform"
                      style={{ background: 'var(--gradient-primary)' }}
                    >
                      <HiOutlineCalendar className="text-white text-xl" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                          {event.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1 font-medium">
                          <HiOutlinePhotograph size={14} className="text-indigo-400" />
                          <strong className="text-slate-200">{event.totalPhotos || 0}</strong> photos
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <HiOutlineUserGroup size={14} className="text-amber-400" />
                          <strong className="text-slate-200">{event.teamMembers?.length || 0}</strong> photographers
                        </span>
                        <span>{new Date(event.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {event.galleryPublished ? (
                      <span className="badge badge-success">
                        <HiOutlineCheckCircle size={13} /> Live Gallery
                      </span>
                    ) : (
                      <span className="badge badge-warning">
                        Draft Gallery
                      </span>
                    )}
                    <div className="w-8 h-8 rounded-xl bg-white/5 group-hover:bg-indigo-500/20 text-slate-400 group-hover:text-indigo-300 flex items-center justify-center transition-colors">
                      <HiOutlineArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default EventsPage;
