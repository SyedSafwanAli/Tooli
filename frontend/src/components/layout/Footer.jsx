import { Link } from 'react-router-dom';
import { TOOLS, CATEGORIES } from '../../constants/tools';

const CATEGORY_DESCRIPTIONS = {
  Images: 'Compress, resize, and convert images between JPG, PNG, WebP, and AVIF — all processed server-side with Sharp for professional quality.',
  PDF: 'Merge multiple PDFs into one, split a PDF into individual pages, or convert images to PDF. Built on pdf-lib.',
  Text: 'Count words and characters in real time. Perfect for writers, students, and content creators.',
  Developer: 'Format and validate JSON, encode/decode Base64 and URLs, convert colour values between HEX, RGB, and HSL.',
  Security: 'Generate cryptographically secure passwords and compute SHA-256/512 hashes using the browser\'s Web Crypto API.',
  Utility: 'Generate QR codes and convert between length, weight, temperature, area, data, and speed units.',
};

const SEO_SECTIONS = [
  {
    heading: 'Free Image Tools Online',
    body: 'Tooli\'s image tools are powered by Sharp, a high-performance Node.js image processing library. Whether you need to compress a JPG before uploading it to your website, resize a product photo to exact pixel dimensions, or convert a PNG to WebP for better web performance, Tooli handles it in seconds. All uploads are processed on a secure server and deleted immediately after download — your images are never stored.',
  },
  {
    heading: 'Free PDF Tools — Merge, Split, Convert',
    body: 'Working with PDF documents is a daily task for students, office workers, and developers alike. Tooli\'s PDF tools use pdf-lib to merge up to 10 PDFs into a single document, extract specific pages from a large file, or convert a batch of photos into a professionally formatted PDF. No Adobe Acrobat subscription required. No watermarks added.',
  },
  {
    heading: 'Developer Tools — JSON, Base64, URL, Hash',
    body: 'Developers spend countless hours copying data between tools in different tabs. Tooli consolidates the most-used developer utilities into one fast, no-signup interface. Beautify and validate JSON with descriptive error messages, encode or decode Base64 strings with full UTF-8 support, percent-encode URLs for safe transmission in query strings, and generate SHA-256 or SHA-512 hashes using the browser\'s native SubtleCrypto API.',
  },
  {
    heading: 'Privacy-First Browser Tools',
    body: 'Nine of Tooli\'s 15 tools run entirely in your browser using JavaScript. The Password Generator uses crypto.getRandomValues() — the browser\'s cryptographically secure pseudorandom number generator. The Hash Generator uses SubtleCrypto, a W3C standard API. The Word Counter, JSON Formatter, Base64 Tool, URL Encoder, Color Converter, QR Code Generator, and Unit Converter all process your data locally. Nothing you type is ever sent to our servers.',
  },
];

export default function Footer() {
  const byCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = TOOLS.filter(t => t.category === cat);
    return acc;
  }, {});

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">

      {/* ─── SEO Content Block ─── */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="text-white font-bold text-lg mb-8">About Tooli's Free Online Tools</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {SEO_SECTIONS.map(({ heading, body }) => (
              <div key={heading}>
                <h3 className="text-gray-200 font-semibold text-sm mb-2">{heading}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          {/* Category quick-links with descriptions */}
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map(cat => (
              <div key={cat}>
                <h3 className="text-gray-200 font-semibold text-sm mb-1">
                  <Link to={`/?category=${cat}`} className="hover:text-white transition-colors">
                    {cat} Tools
                  </Link>
                </h3>
                <p className="text-gray-600 text-xs leading-relaxed mb-2">{CATEGORY_DESCRIPTIONS[cat]}</p>
                <ul className="space-y-1">
                  {byCategory[cat]?.map(t => (
                    <li key={t.id}>
                      <Link to={t.path} className="text-xs text-gray-500 hover:text-blue-400 transition-colors">
                        → {t.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Standard Footer Links ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white mb-3">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">T</span>
              Tooli
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 mb-4">
              Free online tools for images, PDFs, text, and developers. No signup. No watermarks. No limits.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <span>15 free tools</span>
              <span>·</span>
              <span>0 signups required</span>
              <span>·</span>
              <span>100% private</span>
            </div>
          </div>

          {/* First 3 categories */}
          {Object.entries(byCategory).slice(0, 3).map(([cat, tools]) => (
            <div key={cat}>
              <h4 className="font-semibold text-white mb-3 text-sm">{cat}</h4>
              <ul className="space-y-2">
                {tools.map(t => (
                  <li key={t.id}>
                    <Link to={t.path} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {t.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Remaining categories */}
        {Object.entries(byCategory).length > 3 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 pt-6 border-t border-gray-800">
            {Object.entries(byCategory).slice(3).map(([cat, tools]) => (
              <div key={cat}>
                <h4 className="font-semibold text-white mb-2 text-sm">{cat}</h4>
                <ul className="space-y-1.5">
                  {tools.map(t => (
                    <li key={t.id}>
                      <Link to={t.path} className="text-sm text-gray-400 hover:text-white transition-colors">
                        {t.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Tooli. All rights reserved. Free online tools — no registration required.</p>
          <div className="flex items-center gap-4">
            <a href="/sitemap.xml" className="hover:text-gray-300 transition-colors text-xs">Sitemap</a>
            <Link to="/admin/login" className="hover:text-gray-300 transition-colors text-xs">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
