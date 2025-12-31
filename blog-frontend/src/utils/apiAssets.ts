const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const API_ORIGIN = (() => {
  if (!API_BASE_URL) {
    return '';
  }
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return API_BASE_URL.replace(/\/api\/?$/, '');
  }
})();

const isUploadPath = (value: string) =>
  value.startsWith('/uploads/') || value.startsWith('uploads/');

const isExternal = (value: string) =>
  value.startsWith('http://') ||
  value.startsWith('https://') ||
  value.startsWith('data:') ||
  value.startsWith('blob:');

export const resolveApiAssetUrl = (url?: string | null) => {
  if (!url) {
    return null;
  }
  if (isExternal(url) || !API_ORIGIN || !isUploadPath(url)) {
    return url;
  }
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${API_ORIGIN}${normalized}`;
};

export const stripApiOrigin = (url: string) => {
  if (!API_ORIGIN) {
    return url;
  }
  if (!url.startsWith(API_ORIGIN)) {
    return url;
  }
  return url.slice(API_ORIGIN.length) || '/';
};

const updateHtmlImages = (html: string, transform: (src: string) => string) => {
  if (!html) {
    return html;
  }
  if (typeof window === 'undefined' || !window.DOMParser) {
    return html;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  doc.querySelectorAll('img').forEach((image) => {
    const src = image.getAttribute('src');
    if (!src) {
      return;
    }
    const next = transform(src);
    if (next && next !== src) {
      image.setAttribute('src', next);
    }
  });
  return doc.body.innerHTML;
};

export const hydrateArticleHtml = (html: string) => {
  return updateHtmlImages(html, (src) => {
    if (isExternal(src) || !isUploadPath(src)) {
      return src;
    }
    const normalized = src.startsWith('/') ? src : `/${src}`;
    return API_ORIGIN ? `${API_ORIGIN}${normalized}` : normalized;
  });
};

export const normalizeArticleHtmlForSave = (html: string) => {
  return updateHtmlImages(html, (src) => {
    const withoutOrigin = src.startsWith(API_ORIGIN) ? stripApiOrigin(src) : src;
    if (!isUploadPath(withoutOrigin)) {
      return src;
    }
    if (isExternal(withoutOrigin)) {
      return withoutOrigin;
    }
    return withoutOrigin.startsWith('/') ? withoutOrigin : `/${withoutOrigin}`;
  });
};
