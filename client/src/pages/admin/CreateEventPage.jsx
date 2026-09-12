import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineCalendar,
  HiOutlineArrowLeft,
  HiOutlineSparkles,
  HiOutlineLocationMarker,
  HiOutlineShieldCheck,
  HiOutlineMail,
  HiOutlineTag,
} from 'react-icons/hi';

const categories = [
  'Wedding & Reception',
  'Corporate Summit',
  'Concert & Festival',
  'Fashion & Editorial',
  'Private VIP Event',
  'Sports & Athletics',
];

const CreateEventPage = () => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Wedding & Reception');
  const [venue, setVenue] = useState('');
  const [clientEmail, setClientEmail] = useState('');
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
      const fullDesc = `${category ? `[${category}] ` : ''}${venue ? `Venue: ${venue}. ` : ''}${description}`.trim();
      const { data } = await eventService.create({ name: name.trim(), description: fullDesc });
      toast.success('Event workspace created! Redirecting to studio console...');
      navigate(`/events/${data.data.event._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '48rem', margin: '0 auto' }}
    >
      <button
        onClick={() => navigate(-1)}
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
          alignSelf: 'flex-start',
          transition: 'color 0.15s ease',
        }}
        onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <HiOutlineArrowLeft size={16} /> Back to Events
      </button>

      {/* Header */}
      <div
        className="glass"
        style={{
          padding: '1.75rem',
          borderRadius: 'var(--radius-2xl)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
          <HiOutlineSparkles size={14} style={{ color: 'var(--color-primary-light)' }} />
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Production Project Ingestion
          </span>
        </div>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
          Create Photography Shoot
        </h1>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
          Configure project metadata, photographer team assignment, and automated client PIN distribution.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Basic Shoot Details */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HiOutlineTag size={17} style={{ color: 'var(--color-primary-light)' }} /> Shoot Details
          </h2>

          <div>
            <label className="input-label">Project / Event Name *</label>
            <input
              id="event-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g. Royal Udaipur Wedding · Day 1 Ingestion"
              maxLength={200}
            />
          </div>

          <div>
            <label className="input-label">Event Category</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '0.45rem 0.875rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: category === cat ? 'var(--gradient-primary)' : 'hsla(0, 0%, 100%, 0.04)',
                    color: category === cat ? 'white' : 'var(--text-tertiary)',
                    border: category === cat ? '1px solid transparent' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Venue / Location</label>
              <div className="input-icon-wrapper">
                <HiOutlineLocationMarker className="input-icon" size={16} />
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="input"
                  placeholder="e.g. The Oberoi Udaivilas, Udaipur"
                />
              </div>
            </div>

            <div>
              <label className="input-label">Client Contact Email</label>
              <div className="input-icon-wrapper">
                <HiOutlineMail className="input-icon" size={16} />
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="input"
                  placeholder="e.g. client@vipweddings.com"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="input-label">Description & Production Brief</label>
            <textarea
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              style={{ resize: 'none', minHeight: '5.5rem' }}
              rows={3}
              placeholder="e.g. 4-photographer synchronized coverage. Ingest RAW files into Wedding-Ceremony and Sunset-Cocktails albums."
              maxLength={1000}
            />
          </div>
        </div>

        {/* Security & Access Notice */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            background: 'hsla(239, 84%, 67%, 0.04)',
            border: '1px solid hsla(239, 84%, 67%, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
          }}
        >
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: 'var(--radius-lg)',
              background: 'hsla(239, 84%, 67%, 0.15)',
              color: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <HiOutlineShieldCheck size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Automatic PIN Protection</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
              A 6-digit access code and private client link will be initialized inside your studio console.
            </p>
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="btn-primary"
            id="create-event-submit"
            style={{ padding: '0.75rem 1.75rem' }}
          >
            {loading ? (
              <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            ) : (
              <>
                <HiOutlineCalendar size={17} /> Initialize Event Workspace
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
            style={{ padding: '0.75rem 1.25rem' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateEventPage;
