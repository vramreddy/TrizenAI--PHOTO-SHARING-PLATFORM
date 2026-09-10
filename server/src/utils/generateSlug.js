/**
 * Generate a URL-safe slug from a string
 * @param {string} text - The text to slugify
 * @returns {string} URL-friendly slug with random suffix
 */
const generateSlug = (text) => {
  const base = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')    // Remove non-word chars
    .replace(/[\s_]+/g, '-')     // Replace spaces/underscores with hyphens
    .replace(/-+/g, '-')         // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '');    // Trim hyphens from start/end

  // Add random suffix for uniqueness
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
};

module.exports = generateSlug;
