import { useEffect } from 'react';

const SITE_URL = 'https://tooli.app';

/**
 * useSEO — sets document.title, meta tags, Open Graph, canonical URL,
 * and JSON-LD structured data. Cleans up injected tags on unmount.
 */
export function useSEO({ title, description, keywords, jsonLd, canonical } = {}) {
  useEffect(() => {
    const prevTitle = document.title;

    if (title) document.title = `${title} — Tooli | Free Online Tools`;

    const setMeta = (attr, name, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
      setMeta('name', 'twitter:description', description);
    }
    if (keywords) setMeta('name', 'keywords', Array.isArray(keywords) ? keywords.join(', ') : keywords);
    if (title) {
      const full = `${title} — Tooli | Free Online Tools`;
      setMeta('property', 'og:title', full);
      setMeta('name', 'twitter:title', full);
    }
    setMeta('property', 'og:url', window.location.href);
    setMeta('name', 'twitter:card', 'summary');

    // Canonical URL
    const canonicalHref = canonical
      ? `${SITE_URL}${canonical}`
      : `${SITE_URL}${window.location.pathname}`;

    let canonicalEl = document.querySelector('link[rel="canonical"]');
    const canonicalCreated = !canonicalEl;
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    const prevCanonical = canonicalEl.getAttribute('href');
    canonicalEl.setAttribute('href', canonicalHref);

    // Inject JSON-LD scripts
    const injected = [];
    if (jsonLd) {
      const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      schemas.forEach((schema, i) => {
        const id = `jsonld-tooli-${i}`;
        document.getElementById(id)?.remove();
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = id;
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
        injected.push(id);
      });
    }

    return () => {
      document.title = prevTitle;
      injected.forEach(id => document.getElementById(id)?.remove());
      if (canonicalCreated) {
        canonicalEl.remove();
      } else {
        canonicalEl.setAttribute('href', prevCanonical || '');
      }
    };
  }, [title, description, keywords, canonical, JSON.stringify(jsonLd)]);
}

/** Build a WebApplication JSON-LD schema for a tool page. */
export function buildToolSchema({ name, description, url, category = 'UtilitiesApplication' }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url: url ? `${SITE_URL}${url}` : SITE_URL,
    applicationCategory: category,
    operatingSystem: 'Web',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    provider: { '@type': 'Organization', name: 'Tooli', url: SITE_URL },
  };
}

/** Build a FAQPage JSON-LD schema from [{q, a}] pairs. */
export function buildFAQSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

/** Build a BreadcrumbList JSON-LD schema. */
export function buildBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(({ name, url }, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: `${SITE_URL}${url}`,
    })),
  };
}
