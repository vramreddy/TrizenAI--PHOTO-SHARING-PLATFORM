import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService, photoService, galleryService } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft,
  HiOutlinePhotograph,
  HiOutlineUserGroup,
  HiOutlineEye,
  HiOutlineLink,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineClipboard,
  HiOutlineLockClosed,
  HiOutlineExternalLink,
  HiOutlineRefresh,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
  HiOutlineSparkles,
} from 'react-icons/hi';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [photosPagination, setPhotosPagination] = useState({});
  const [activeTab, setActiveTab] = useState('photos');
  const [loading, setLoading] = useState(true);
  const [photoFilter, setPhotoFilter] = useState('all');

  // Team member form
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberForm, setMemberForm] = useState({ email: '', name: '', password: '' });

  // Gallery form
  const [galleryForm, setGalleryForm] = useState({ title: '', description: '', pin: '' });
  const [galleryLoading, setGalleryLoading] = useState(false);

  // Selection
  const [selectedPhotoIds, setSelectedPhotoIds] = useState(new Set());
  const [selectMode, setSelectMode] = useState(false);

  const loadEvent = useCallback(async () => {
    try {
      const { data } = await eventService.getOne(id);
      setEvent(data.data.event);
      if (data.data.event.gallery) {
        setGalleryForm({
          title: data.data.event.gallery.title || '',
          description: data.data.event.gallery.description || '',
          pin: '',
        });
      }
    } catch (error) {
      toast.error('Failed to load event');
      navigate('/events');
    }
  }, [id, navigate]);

  const loadPhotos = useCallback(async (page = 1) => {
    try {
      const params = { page, limit: 40 };
      if (photoFilter === 'selected') params.selected = 'true';
      if (photoFilter === 'unselected') params.selected = 'false';

      const { data } = await photoService.getAll(id, params);
      if (page === 1) {
        setPhotos(data.data.photos);
      } else {
        setPhotos((prev) => [...prev, ...data.data.photos]);
      }
      setPhotosPagination(data.data.pagination);
    } catch (error) {
      console.error('Failed to load photos:', error);
    }
  }, [id, photoFilter]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadEvent();
      await loadPhotos();
      setLoading(false);
    };
    init();
  }, [loadEvent, loadPhotos]);

  // Photo Selection
  const togglePhotoSelection = (photoId) => {
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) next.delete(photoId);
      else next.add(photoId);
      return next;
    });
  };

  const selectAllPhotos = () => {
    setSelectedPhotoIds(new Set(photos.map((p) => p._id)));
  };

  const deselectAllPhotos = () => {
    setSelectedPhotoIds(new Set());
  };

  const handleMarkSelected = async (selected) => {
    if (selectedPhotoIds.size === 0) {
      toast.error('No photos selected');
      return;
    }
    try {
      await photoService.select(id, [...selectedPhotoIds], selected);
      toast.success(`${selectedPhotoIds.size} photos ${selected ? 'marked for publishing' : 'unmarked'}`);
      setSelectedPhotoIds(new Set());
      setSelectMode(false);
      await loadPhotos();
      await loadEvent();
    } catch (error) {
      toast.error('Failed to update selection');
    }
  };

  const handleToggleSingleSelect = async (photo) => {
    try {
      await photoService.select(id, [photo._id], !photo.selected);
      toast.success(photo.selected ? 'Photo unselected' : 'Photo selected for gallery');
      await loadPhotos();
      await loadEvent();
    } catch (error) {
      toast.error('Failed to update photo');
    }
  };

  // Team Management
  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await eventService.addMember(id, memberForm);
      toast.success('Team member added to event!');
      setMemberForm({ email: '', name: '', password: '' });
      setShowAddMember(false);
      await loadEvent();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this photographer from the event?')) return;
    try {
      await eventService.removeMember(id, userId);
      toast.success('Member removed');
      await loadEvent();
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  // Gallery Management
  const handleSaveGallery = async (e) => {
    e.preventDefault();
    if (!galleryForm.title) {
      toast.error('Gallery title is required');
      return;
    }
    if (!event?.gallery && !galleryForm.pin) {
      toast.error('Gallery PIN is required');
      return;
    }

    setGalleryLoading(true);
    try {
      const payload = {
        title: galleryForm.title,
        description: galleryForm.description,
      };
      if (galleryForm.pin) payload.pin = galleryForm.pin;

      await galleryService.create(id, payload);
      toast.success('Gallery settings updated successfully!');
      setGalleryForm((prev) => ({ ...prev, pin: '' }));
      await loadEvent();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save gallery');
    } finally {
      setGalleryLoading(false);
    }
  };

  const handlePublish = async (published) => {
    setGalleryLoading(true);
    try {
      await galleryService.publish(id, published);
      toast.success(published ? 'Gallery is now Live and published!' : 'Gallery has been unpublished');
      await loadEvent();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update publishing status');
    } finally {
      setGalleryLoading(false);
    }
  };

  const generateRandomPin = () => {
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    setGalleryForm((prev) => ({ ...prev, pin: randomPin }));
    toast.success(`Generated PIN: ${randomPin}`);
  };

  const copyGalleryLink = () => {
    if (!event?.gallery?.slug) return;
    const url = `${window.location.origin}/gallery/${event.gallery.slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Public Gallery Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '20rem', gap: '0.75rem' }}>
        <div className="spinner" />
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Loading event details...</p>
      </div>
    );
  }

  if (!event) return null;

  const tabs = [
    { key: 'photos', label: 'Photographs', icon: HiOutlinePhotograph, count: event.totalPhotos },
    { key: 'team', label: 'Photographers', icon: HiOutlineUserGroup, count: event.teamMembers?.length },
    { key: 'gallery', label: 'Gallery & PIN', icon: HiOutlineEye },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Back Link & Header */}
      <div>
        <button
          onClick={() => navigate('/events')}
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
            marginBottom: '1rem',
            transition: 'color 0.15s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <HiOutlineArrowLeft size={16} /> Back to Events
        </button>

        <div
          className="glass"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '1.5rem',
            borderRadius: 'var(--radius-2xl)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {event.name}
              </h1>
              <span className={`badge ${event.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                <span className="pulse-dot" style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', background: 'currentColor' }} />
                {event.status}
              </span>
              {event.gallery?.published && (
                <span className="badge badge-primary">
                  <HiOutlineEye size={12} /> Live Gallery
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: '36rem', lineHeight: 1.5 }}>
              {event.description || 'No description provided.'}
            </p>
          </div>

          <div
            style={{
              textAlign: 'right',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-lg)',
              background: 'hsla(0, 0%, 100%, 0.02)',
              border: '1px solid var(--border-subtle)',
              flexShrink: 0,
            }}
          >
            <p style={{ fontSize: '0.5625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Curation Progress
            </p>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.125rem' }}>
              <span style={{ color: 'var(--color-success-light)' }}>{event.selectedPhotos || 0}</span> / {event.totalPhotos || 0} Selected
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation — scrollable on mobile */}
      <div
        style={{
          display: 'flex',
          gap: '0.375rem',
          padding: '0.375rem',
          borderRadius: 'var(--radius-2xl)',
          background: 'var(--surface-2)',
          border: '1px solid var(--border-subtle)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              borderRadius: 'var(--radius-xl)',
              fontSize: '0.8125rem',
              fontWeight: activeTab === tab.key ? 700 : 500,
              flex: 1,
              minWidth: 'max-content',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.25s ease',
              color: activeTab === tab.key ? 'white' : 'var(--text-muted)',
              background: activeTab === tab.key ? 'var(--gradient-primary)' : 'transparent',
              boxShadow: activeTab === tab.key ? '0 4px 16px -2px hsla(239, 84%, 67%, 0.35)' : 'none',
            }}
          >
            <tab.icon size={17} />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  padding: '0.0625rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  background: activeTab === tab.key ? 'hsla(0, 0%, 0%, 0.25)' : 'hsla(0, 0%, 100%, 0.05)',
                  fontWeight: 800,
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══ TAB 1: Photographs Curation ═══ */}
      {activeTab === 'photos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Photos Toolbar — wraps properly on mobile */}
          <div
            className="glass-subtle"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-xl)',
            }}
          >
            {/* Filter Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '0.25rem' }}>Filter:</span>
              {['all', 'selected', 'unselected'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setPhotoFilter(filter)}
                  style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid',
                    transition: 'all 0.2s ease',
                    background: photoFilter === filter ? 'hsla(239, 84%, 67%, 0.12)' : 'hsla(0, 0%, 100%, 0.03)',
                    color: photoFilter === filter ? 'var(--color-primary-light)' : 'var(--text-muted)',
                    borderColor: photoFilter === filter ? 'hsla(239, 84%, 67%, 0.30)' : 'var(--border-subtle)',
                  }}
                >
                  {filter === 'all' && 'All Photos'}
                  {filter === 'selected' && `Selected (${event.selectedPhotos || 0})`}
                  {filter === 'unselected' && `Unselected (${(event.totalPhotos || 0) - (event.selectedPhotos || 0)})`}
                </button>
              ))}
            </div>

            {/* Batch Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
              {selectMode ? (
                <>
                  <button onClick={selectAllPhotos} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}>
                    Select All
                  </button>
                  <button onClick={deselectAllPhotos} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}>
                    Clear
                  </button>
                  <button onClick={() => handleMarkSelected(true)} className="btn-success" style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}>
                    <HiOutlineCheck size={14} /> Publish ({selectedPhotoIds.size})
                  </button>
                  <button onClick={() => handleMarkSelected(false)} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem', color: 'var(--color-error-light)' }}>
                    <HiOutlineX size={14} /> Unmark
                  </button>
                  <button
                    onClick={() => { setSelectMode(false); setSelectedPhotoIds(new Set()); }}
                    className="btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}
                  >
                    Done
                  </button>
                </>
              ) : (
                <button onClick={() => setSelectMode(true)} className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.875rem' }}>
                  <HiOutlineCheck size={14} /> Batch Selection
                </button>
              )}
            </div>
          </div>

          {/* Photo Grid */}
          {photos.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                  marginBottom: '0.75rem',
                }}
              >
                <HiOutlinePhotograph size={28} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>No Photos in this Category</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: '22rem' }}>
                Assigned team photographers can upload images from their workspace dashboard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" style={{ gap: '0.75rem' }}>
              {photos.map((photo) => {
                const isSelectedForBatch = selectedPhotoIds.has(photo._id);

                return (
                  <motion.div
                    key={photo._id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group"
                    style={{
                      position: 'relative',
                      borderRadius: 'var(--radius-xl)',
                      overflow: 'hidden',
                      aspectRatio: '1',
                      cursor: 'pointer',
                      border: selectMode
                        ? isSelectedForBatch
                          ? '2px solid var(--color-primary)'
                          : '2px solid var(--border-default)'
                        : photo.selected
                        ? '2px solid var(--color-success)'
                        : '2px solid var(--border-subtle)',
                      boxShadow: isSelectedForBatch ? 'var(--shadow-glow-sm)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => {
                      if (selectMode) togglePhotoSelection(photo._id);
                      else handleToggleSingleSelect(photo);
                    }}
                  >
                    <img
                      src={photo.thumbnailUrl || photo.storageUrl}
                      alt={photo.originalName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                      className="group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div
                      className="group-hover:opacity-90"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, hsla(0,0%,0%,0.75) 0%, hsla(0,0%,0%,0.05) 40%, hsla(0,0%,0%,0.20) 100%)',
                        opacity: 0.5,
                        transition: 'opacity 0.3s ease',
                      }}
                    />

                    {/* Top Badges */}
                    <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', right: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {photo.selected ? (
                        <span
                          style={{
                            fontSize: '0.5625rem',
                            fontWeight: 700,
                            padding: '0.125rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'hsla(160, 84%, 39%, 0.90)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <HiOutlineCheck size={11} /> Selected
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.5625rem',
                            fontWeight: 600,
                            padding: '0.125rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'hsla(0, 0%, 0%, 0.55)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          Draft
                        </span>
                      )}

                      {selectMode && (
                        <div
                          style={{
                            width: '1.375rem',
                            height: '1.375rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isSelectedForBatch ? 'var(--color-primary)' : 'hsla(0, 0%, 0%, 0.45)',
                            border: isSelectedForBatch ? 'none' : '1.5px solid hsla(0, 0%, 100%, 0.35)',
                            color: 'white',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {isSelectedForBatch && <HiOutlineCheck size={13} />}
                        </div>
                      )}
                    </div>

                    {/* Bottom Metadata */}
                    <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }}>
                      <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                        {photo.originalName}
                      </p>
                      <p style={{ fontSize: '0.625rem', color: 'hsla(0, 0%, 100%, 0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        By: {photo.uploadedBy?.name || 'Team Member'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB 2: Photographers Team Management ═══ */}
      {activeTab === 'team' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Assigned Photographers</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>Team members with permissions to upload photos to this event</p>
            </div>
            <button onClick={() => setShowAddMember(!showAddMember)} className="btn-primary" style={{ fontSize: '0.8125rem' }}>
              <HiOutlinePlus size={16} /> Add Photographer
            </button>
          </div>

          {/* Add Member Drawer */}
          <AnimatePresence>
            {showAddMember && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="card" style={{ borderColor: 'hsla(239, 84%, 67%, 0.20)', background: 'hsla(239, 50%, 12%, 0.4)', padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Add Photographer to Event</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Enter user details. If the photographer does not have an account, one will be created automatically.
                  </p>

                  <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '0.75rem' }}>
                    <div>
                      <label className="input-label">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={memberForm.email}
                        onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                        className="input"
                        placeholder="photographer@example.com"
                      />
                    </div>
                    <div>
                      <label className="input-label">Photographer Name</label>
                      <input
                        type="text"
                        value={memberForm.name}
                        onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                        className="input"
                        placeholder="e.g. Rahul Sharma"
                      />
                    </div>
                    <div>
                      <label className="input-label">Password (For new users)</label>
                      <input
                        type="password"
                        value={memberForm.password}
                        onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })}
                        className="input"
                        placeholder="Minimum 6 characters"
                      />
                    </div>

                    <div className="md:col-span-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button type="button" onClick={() => setShowAddMember(false)} className="btn-secondary" style={{ fontSize: '0.8125rem' }}>
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary" style={{ fontSize: '0.8125rem' }}>
                        Confirm & Assign
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Team Members List */}
          {(!event.teamMembers || event.teamMembers.length === 0) ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <HiOutlineUserGroup style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} size={36} />
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>No Team Members Assigned</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem', maxWidth: '22rem' }}>
                Add photographers so they can log into their workspace and upload event photos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '0.75rem' }}>
              {event.teamMembers.map((member) => (
                <div key={member._id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.125rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <div
                      style={{
                        width: '2.25rem',
                        height: '2.25rem',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--gradient-primary)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        flexShrink: 0,
                      }}
                    >
                      {member.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    title="Remove photographer from event"
                    style={{
                      color: 'var(--text-muted)',
                      padding: '0.375rem',
                      borderRadius: 'var(--radius-md)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.color = 'var(--color-error-light)';
                      e.currentTarget.style.background = 'hsla(350, 89%, 60%, 0.08)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.background = 'none';
                    }}
                  >
                    <HiOutlineTrash size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB 3: Customer Gallery & PIN ═══ */}
      {activeTab === 'gallery' && (
        <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '1.25rem' }}>
          {/* Gallery Configuration Card */}
          <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'hsla(239, 84%, 67%, 0.12)',
                    color: 'var(--color-primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HiOutlineLockClosed size={16} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Customer Gallery Settings</h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Configure title, description, and client access PIN</p>
                </div>
              </div>

              <form onSubmit={handleSaveGallery} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="input-label">Gallery Title *</label>
                  <input
                    type="text"
                    required
                    value={galleryForm.title}
                    onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                    className="input"
                    placeholder="e.g. Arjun & Priya Wedding Gallery"
                  />
                </div>

                <div>
                  <label className="input-label">Customer Welcome Description</label>
                  <textarea
                    rows={3}
                    value={galleryForm.description}
                    onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                    className="input"
                    style={{ resize: 'none' }}
                    placeholder="Welcome to our wedding gallery! Enter your PIN to view and download all cherished moments."
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <label className="input-label" style={{ marginBottom: 0 }}>
                      {event.gallery ? 'Update Gallery Access PIN (Leave blank to keep unchanged)' : 'Set 6-Digit Access PIN *'}
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPin}
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-primary-light)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <HiOutlineRefresh size={14} /> Generate Random PIN
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={galleryForm.pin}
                    onChange={(e) => setGalleryForm({ ...galleryForm, pin: e.target.value.replace(/\D/g, '') })}
                    className="input"
                    style={{ fontSize: '1rem', letterSpacing: '0.25em', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                    placeholder={event.gallery ? '••••••' : '482917'}
                  />
                </div>

                <div style={{ paddingTop: '0.375rem' }}>
                  <button
                    type="submit"
                    disabled={galleryLoading}
                    className="btn-primary"
                    style={{ padding: '0.625rem 1.25rem' }}
                  >
                    {galleryLoading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Save Gallery Settings'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Publishing & Shareable Link Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              className="card"
              style={{
                padding: '1.25rem',
                background: 'linear-gradient(160deg, hsla(239, 50%, 12%, 0.6) 0%, var(--surface-2) 100%)',
                borderColor: 'hsla(239, 84%, 67%, 0.15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Publishing Status</span>
                <span className={`badge ${event.gallery?.published ? 'badge-success' : 'badge-warning'}`}>
                  <span className="pulse-dot" style={{ width: '0.375rem', height: '0.375rem', borderRadius: '50%', background: 'currentColor' }} />
                  {event.gallery?.published ? 'Published' : 'Draft'}
                </span>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
                {event.gallery?.published
                  ? 'The gallery is live! Customers with the shareable link and PIN can view all selected photos.'
                  : 'Publish the gallery to make selected photos accessible to customers via their unique PIN.'}
              </p>

              {event.gallery ? (
                <button
                  onClick={() => handlePublish(!event.gallery.published)}
                  disabled={galleryLoading}
                  className={event.gallery.published ? '' : 'btn-success'}
                  style={{
                    width: '100%',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    padding: '0.625rem',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    ...(event.gallery.published
                      ? {
                          background: 'hsla(350, 89%, 60%, 0.10)',
                          color: 'var(--color-error-light)',
                          border: '1px solid hsla(350, 89%, 60%, 0.20)',
                        }
                      : {}),
                  }}
                >
                  {event.gallery.published ? (
                    <>
                      <HiOutlineX size={16} /> Unpublish Gallery
                    </>
                  ) : (
                    <>
                      <HiOutlineCheckCircle size={16} /> Publish to Customers
                    </>
                  )}
                </button>
              ) : (
                <div
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--color-gold)',
                    background: 'hsla(38, 92%, 60%, 0.08)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsla(38, 92%, 60%, 0.15)',
                  }}
                >
                  Save gallery settings on the left to create and publish this gallery.
                </div>
              )}
            </div>

            {event.gallery && (
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  <HiOutlineLink size={16} style={{ color: 'var(--color-primary-light)' }} />
                  <span>Shareable Customer URL</span>
                </div>

                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--surface-1)',
                    border: '1px solid var(--border-subtle)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: 'var(--color-primary-light)',
                    wordBreak: 'break-all',
                    userSelect: 'all',
                  }}
                >
                  {window.location.origin}/gallery/{event.gallery.slug}
                </div>

                <div className="grid grid-cols-2" style={{ gap: '0.5rem', paddingTop: '0.75rem' }}>
                  <button
                    onClick={copyGalleryLink}
                    className="btn-secondary"
                    style={{ justifyContent: 'center', fontSize: '0.75rem', padding: '0.5rem', gap: '0.375rem' }}
                  >
                    <HiOutlineClipboard size={14} /> Copy Link
                  </button>
                  <a
                    href={`/gallery/${event.gallery.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ justifyContent: 'center', fontSize: '0.75rem', padding: '0.5rem', gap: '0.375rem', textDecoration: 'none' }}
                  >
                    <HiOutlineExternalLink size={14} /> Open Link
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailPage;
