import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../../services/api';
import { motion } from 'framer-motion';
import {
  HiOutlineCalendar,
  HiOutlinePhotograph,
  HiOutlineEye,
  HiOutlineUserGroup,
  HiOutlinePlus,
  HiOutlineArrowRight,
  HiOutlineSparkles,
  HiOutlineCheckCircle,
} from 'react-icons/hi';

const StatsCard = ({ icon: Icon, label, value, subtext, color, gradient, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="stat-card relative overflow-hidden group"
  >
    <div
      className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 group-hover:opacity-25 transition-opacity"
      style={{ background: color }}
    />
    <div className="flex items-center justify-between mb-4">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
        style={{ background: gradient, boxShadow: `0 4px 15px -3px ${color}40` }}
      >
        <Icon size={24} className="text-white" />
      </div>
      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full text-slate-400 bg-white/5 border border-white/5">
        Live Metric
      </span>
    </div>
    <div>
      <h3 className="text-3xl font-extrabold text-white tracking-tight">{value}</h3>
      <p className="text-xs font-semibold text-slate-300 mt-1">{label}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">{subtext}</p>
    </div>
  </motion.div>
);

const DashboardPage = () => {
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

  const totalPhotos = events.reduce((sum, e) => sum + (e.totalPhotos || 0), 0);
  const totalMembers = events.reduce((sum, e) => sum + (e.teamMembers?.length || 0), 0);
  const publishedGalleries = events.filter((e) => e.galleryPublished).length;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-80 gap-3">
        <div className="spinner" />
        <p className="text-xs text-slate-400 font-medium">Loading platform analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl relative overflow-hidden glass border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase flex items-center gap-1">
              <HiOutlineSparkles size={14} /> Production Overview
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Event Management Console
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Coordinate photography teams, curate uploads, and publish secure PIN-protected client galleries.
          </p>
        </div>

        <Link to="/events/create" className="btn-primary shrink-0 self-start md:self-center">
          <HiOutlinePlus size={18} />
          Create New Event
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={HiOutlineCalendar}
          label="Total Events"
          value={events.length}
          subtext="Active photography projects"
          color="#6366F1"
          gradient="linear-gradient(135deg, #6366F1 0%, #4338CA 100%)"
          delay={0}
        />
        <StatsCard
          icon={HiOutlinePhotograph}
          label="Uploaded Photos"
          value={totalPhotos.toLocaleString()}
          subtext="Processed & optimized"
          color="#10B981"
          gradient="linear-gradient(135deg, #10B981 0%, #047857 100%)"
          delay={0.1}
        />
        <StatsCard
          icon={HiOutlineUserGroup}
          label="Team Collaborators"
          value={totalMembers}
          subtext="Assigned photographers"
          color="#F59E0B"
          gradient="linear-gradient(135deg, #F59E0B 0%, #B45309 100%)"
          delay={0.2}
        />
        <StatsCard
          icon={HiOutlineEye}
          label="Published Galleries"
          value={publishedGalleries}
          subtext="Protected customer links"
          color="#EC4899"
          gradient="linear-gradient(135deg, #EC4899 0%, #BE185D 100%)"
          delay={0.3}
        />
      </div>

      {/* Recent Events Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Active Events</h2>
            <p className="text-xs text-slate-400">Manage uploads and gallery publishing</p>
          </div>
          <Link to="/events" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View All ({events.length}) <HiOutlineArrowRight size={14} />
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="card text-center py-16 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <HiOutlineCalendar size={32} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Events Found</h3>
            <p className="text-sm text-slate-400 max-w-sm mb-6">
              Create your first photography event to assign team members and start collecting photos.
            </p>
            <Link to="/events/create" className="btn-primary">
              <HiOutlinePlus size={18} />
              Create First Event
            </Link>
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
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {event.name}
                    </h3>
                    <span
                      className={`badge shrink-0 ${
                        event.status === 'active' ? 'badge-success' : 'badge-warning'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {event.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {event.description || 'No description provided for this event.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                    <span className="flex items-center gap-1.5 font-medium">
                      <HiOutlinePhotograph size={16} className="text-indigo-400" />
                      <strong className="text-slate-200">{event.totalPhotos || 0}</strong> photos
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <HiOutlineUserGroup size={16} className="text-amber-400" />
                      <strong className="text-slate-200">{event.teamMembers?.length || 0}</strong> members
                    </span>
                    {event.galleryPublished && (
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <HiOutlineCheckCircle size={15} />
                        Live
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/events/${event._id}`}
                    className="btn-secondary w-full text-xs py-2 justify-center group-hover:border-indigo-500/40 group-hover:bg-indigo-500/10 transition-all font-semibold"
                  >
                    Manage Event & Gallery
                    <HiOutlineArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
