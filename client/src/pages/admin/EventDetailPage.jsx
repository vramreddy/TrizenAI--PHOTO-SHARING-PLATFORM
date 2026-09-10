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
      <div className="flex flex-col justify-center items-center h-80 gap-3">
        <div className="spinner" />
        <p className="text-xs text-slate-400 font-medium">Loading event details...</p>
      </div>
    );
  }

  if (!event) return null;

  const tabs = [
    { key: 'photos', label: 'Photographs', icon: HiOutlinePhotograph, count: event.totalPhotos },
    { key: 'team', label: 'Photographers', icon: HiOutlineUserGroup, count: event.teamMembers?.length },
    { key: 'gallery', label: 'Customer Gallery & PIN', icon: HiOutlineEye },
  ];

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div>
        <button
          onClick={() => navigate('/events')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white mb-4 transition-colors p-1"
        >
          <HiOutlineArrowLeft size={16} /> Back to Events
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass border border-white/10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{event.name}</h1>
              <span
                className={`badge ${event.status === 'active' ? 'badge-success' : 'badge-warning'}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {event.status}
              </span>
              {event.gallery?.published && (
                <span className="badge badge-primary">
                  <HiOutlineEye size={12} /> Live Gallery
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {event.description || 'No description provided.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Curation Progress</p>
              <p className="text-sm font-bold text-white">
                <span className="text-emerald-400">{event.selectedPhotos || 0}</span> / {event.totalPhotos || 0} Selected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-900/60 border border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs md:text-sm font-bold transition-all flex-1 ${
              activeTab === tab.key
                ? 'text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
            style={
              activeTab === tab.key
                ? {
                    background: 'var(--gradient-primary)',
                    boxShadow: '0 4px 20px -2px rgba(99, 102, 241, 0.4)',
                  }
                : {}
            }
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-black/30 font-extrabold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══ TAB 1: Photographs Curation ═══ */}
      {activeTab === 'photos' && (
        <div className="space-y-4">
          {/* Photos Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl glass-subtle border border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 mr-1">Filter:</span>
              {['all', 'selected', 'unselected'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setPhotoFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    photoFilter === filter
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white bg-white/5 border border-white/5'
                  }`}
                >
                  {filter === 'all' && 'All Photos'}
                  {filter === 'selected' && `Selected (${event.selectedPhotos || 0})`}
                  {filter === 'unselected' && `Unselected (${(event.totalPhotos || 0) - (event.selectedPhotos || 0)})`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {selectMode ? (
                <>
                  <button onClick={selectAllPhotos} className="btn-secondary text-xs py-1.5 px-3">Select All</button>
                  <button onClick={deselectAllPhotos} className="btn-secondary text-xs py-1.5 px-3">Clear</button>
                  <button onClick={() => handleMarkSelected(true)} className="btn-success text-xs py-1.5 px-3">
                    <HiOutlineCheck size={14} /> Publish ({selectedPhotoIds.size})
                  </button>
                  <button onClick={() => handleMarkSelected(false)} className="btn-secondary text-xs py-1.5 px-3 text-rose-300">
                    <HiOutlineX size={14} /> Unmark
                  </button>
                  <button onClick={() => { setSelectMode(false); setSelectedPhotoIds(new Set()); }} className="btn-secondary text-xs py-1.5 px-3">Done</button>
                </>
              ) : (
                <button onClick={() => setSelectMode(true)} className="btn-primary text-xs py-1.5 px-3.5">
                  <HiOutlineCheck size={14} /> Batch Selection Mode
                </button>
              )}
            </div>
          </div>

          {/* Photo Grid */}
          {photos.length === 0 ? (
            <div className="card text-center py-16 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                <HiOutlinePhotograph size={32} />
              </div>
              <h3 className="text-base font-bold text-white mb-1">No Photos in this Category</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Assigned team photographers can upload images from their workspace dashboard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
              {photos.map((photo) => {
                const isSelectedForBatch = selectedPhotoIds.has(photo._id);

                return (
                  <motion.div
                    key={photo._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`group relative rounded-2xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                      selectMode
                        ? isSelectedForBatch
                          ? 'border-indigo-500 shadow-lg shadow-indigo-500/20'
                          : 'border-white/10 hover:border-white/30'
                        : photo.selected
                        ? 'border-emerald-500/80 shadow-md shadow-emerald-500/10'
                        : 'border-white/5 hover:border-white/20'
                    }`}
                    onClick={() => {
                      if (selectMode) togglePhotoSelection(photo._id);
                      else handleToggleSingleSelect(photo);
                    }}
                  >
                    <img
                      src={photo.thumbnailUrl || photo.storageUrl}
                      alt={photo.originalName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30 opacity-60 group-hover:opacity-90 transition-opacity" />

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                      {photo.selected ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/90 text-white shadow flex items-center gap-1">
                          <HiOutlineCheck size={12} /> Selected
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-black/60 text-slate-300">
                          Draft
                        </span>
                      )}

                      {selectMode && (
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                            isSelectedForBatch ? 'bg-indigo-500 text-white' : 'bg-black/50 border border-white/40'
                          }`}
                        >
                          {isSelectedForBatch && <HiOutlineCheck size={14} />}
                        </div>
                      )}
                    </div>

                    {/* Bottom Metadata */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-[11px] font-semibold text-white truncate drop-shadow">
                        {photo.originalName}
                      </p>
                      <p className="text-[10px] text-slate-300 truncate">
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Assigned Photographers</h2>
              <p className="text-xs text-slate-400">Team members with permissions to upload photos to this event</p>
            </div>
            <button onClick={() => setShowAddMember(!showAddMember)} className="btn-primary text-xs py-2">
              <HiOutlinePlus size={16} /> Add Photographer
            </button>
          </div>

          {/* Add Member Drawer / Inline Card */}
          <AnimatePresence>
            {showAddMember && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="card border-indigo-500/30 bg-indigo-950/20 p-5">
                  <h3 className="text-sm font-bold text-white mb-1">Add Photographer to Event</h3>
                  <p className="text-xs text-slate-400 mb-4">Enter user details. If the photographer does not have an account, one will be created automatically.</p>

                  <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

                    <div className="md:col-span-3 flex items-center justify-end gap-2 mt-2">
                      <button type="button" onClick={() => setShowAddMember(false)} className="btn-secondary text-xs">
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary text-xs">
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
            <div className="card text-center py-12 flex flex-col items-center">
              <HiOutlineUserGroup className="text-slate-500 mb-3" size={40} />
              <h4 className="text-sm font-bold text-white">No Team Members Assigned</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Add photographers so they can log into their workspace and upload event photos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.teamMembers.map((member) => (
                <div key={member._id} className="card flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ background: 'var(--gradient-primary)' }}
                    >
                      {member.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{member.name}</p>
                      <p className="text-xs text-slate-400 truncate">{member.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Remove photographer from event"
                  >
                    <HiOutlineTrash size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB 3: Customer Gallery & PIN ═══ */}
      {activeTab === 'gallery' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gallery Configuration Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <HiOutlineLockClosed size={18} />
                </span>
                <div>
                  <h2 className="text-base font-bold text-white">Customer Gallery Settings</h2>
                  <p className="text-xs text-slate-400">Configure title, description, and client access PIN</p>
                </div>
              </div>

              <form onSubmit={handleSaveGallery} className="space-y-4 mt-5">
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
                    className="input resize-none"
                    placeholder="Welcome to our wedding gallery! Enter your PIN to view and download all cherished moments."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="input-label mb-0">
                      {event.gallery ? 'Update Gallery Access PIN (Leave blank to keep unchanged)' : 'Set 6-Digit Access PIN *'}
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPin}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      <HiOutlineRefresh size={14} /> Generate Random PIN
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={galleryForm.pin}
                    onChange={(e) => setGalleryForm({ ...galleryForm, pin: e.target.value.replace(/\D/g, '') })}
                    className="input text-base tracking-widest font-mono font-bold"
                    placeholder={event.gallery ? '••••••' : '482917'}
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={galleryLoading}
                    className="btn-primary text-xs py-2.5 px-5"
                  >
                    {galleryLoading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Save Gallery Settings'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Publishing & Shareable Link Status Sidebar */}
          <div className="space-y-4">
            <div className="card bg-gradient-to-br from-indigo-950/40 to-slate-900 border-indigo-500/20 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-300">Publishing Status</span>
                <span
                  className={`badge ${
                    event.gallery?.published ? 'badge-success' : 'badge-warning'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {event.gallery?.published ? 'Published & Live' : 'Unpublished (Draft)'}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                {event.gallery?.published
                  ? 'The gallery is live! Customers with the shareable link and PIN can view all selected photos.'
                  : 'Publish the gallery to make selected photos accessible to customers via their unique PIN.'}
              </p>

              {event.gallery ? (
                <button
                  onClick={() => handlePublish(!event.gallery.published)}
                  disabled={galleryLoading}
                  className={`w-full text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    event.gallery.published
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                      : 'btn-success'
                  }`}
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
                <p className="text-xs text-amber-400/80 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                  Save gallery settings on the left to create and publish this gallery.
                </p>
              )}
            </div>

            {event.gallery && (
              <div className="card p-5 space-y-3 border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <HiOutlineLink size={16} className="text-indigo-400" />
                  <span>Shareable Customer URL</span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-indigo-300 break-all select-all">
                  {window.location.origin}/gallery/{event.gallery.slug}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={copyGalleryLink}
                    className="btn-secondary text-xs py-2 px-3 justify-center gap-1.5"
                  >
                    <HiOutlineClipboard size={15} /> Copy Link
                  </button>
                  <a
                    href={`/gallery/${event.gallery.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs py-2 px-3 justify-center gap-1.5"
                  >
                    <HiOutlineExternalLink size={15} /> Open Link
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
