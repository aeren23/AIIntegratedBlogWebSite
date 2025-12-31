import { useEffect } from 'react';

type PageMeta = {
  title: string;
  description?: string;
};

const ensureMetaTag = (name: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  return tag;
};

const normalizeDescription = (value?: string) => {
  if (!value) {
    return '';
  }
  return value.replace(/\s+/g, ' ').trim().slice(0, 160);
};

const usePageMeta = ({ title, description }: PageMeta) => {
  useEffect(() => {
    document.title = title;
    if (description !== undefined) {
      const tag = ensureMetaTag('description');
      tag.setAttribute('content', normalizeDescription(description));
    }
  }, [description, title]);
};

export default usePageMeta;
