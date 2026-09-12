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
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '20rem', gap: '0.75rem' }}>
        <div className="spinner" />
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Loading assigned events...</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div
        className="glass"
        style={{
          padding: '1.5rem',
          borderRadius: 'var(--radius-2xl)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
          <HiOutlineSparkles size={14} style={{ color: 'var(--color-primary-light)' }} />
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary-light)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Photographer Workspace
          </span>
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Assigned Events
        </h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
          Select an event below to upload high-resolution photographs directly to the curation pool.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
              marginBottom: '1rem',
            }}
          >
            <HiOutlineCalendar size={28} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>No Events Assigned</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: '22rem' }}>
            You have not been assigned to any events yet. Your lead photographer or admin will add you.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '1rem' }}>
          {events.map((event, index) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="card group"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.625rem' }}>
                    <div
                      className="group-hover:scale-105"
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: 'var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        background: 'var(--gradient-primary)',
                        boxShadow: 'var(--shadow-glow-sm)',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <HiOutlineCalendar className="text-white" size={18} />
                    </div>
                    <span className={`badge ${event.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      <span className="pulse-dot" style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', background: 'currentColor' }} />
                      {event.status}
                    </span>
                  </div>

                  <h3
                    className="group-hover:text-indigo-300"
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      transition: 'color 0.2s ease',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {event.name}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {event.description || 'No description provided.'}
                  </p>
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 500 }}>
                      <HiOutlinePhotograph size={15} style={{ color: 'var(--color-primary-light)' }} />
                      <strong style={{ color: 'var(--text-secondary)' }}>{event.totalPhotos || 0}</strong> total photos
                    </span>
                    {event.galleryPublished && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-success-light)', fontWeight: 600 }}>
                        <HiOutlineCheckCircle size={14} />
                        Live
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/team/events/${event._id}/upload`}
                    className="btn-primary"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem', padding: '0.625rem', fontWeight: 700, gap: '0.5rem', textDecoration: 'none' }}
                  >
                    <HiOutlineUpload size={16} /> Open Upload Workspace
                    <HiOutlineArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default TeamDashboardPage;
