import { Link } from 'react-router-dom';
import { TOOLS, CATEGORIES } from '../../constants/tools';

const CAT_ICONS = {
  Images: '🖼', PDF: '📄', Text: '📝', Developer: '⚡',
  Security: '🔒', SEO: '🔍', Calculator: '🧮', Utility: '🔧',
};

const SEO_SECTIONS = [
  {
    heading: 'Image & PDF Tools',
    body: 'Tooli\'s image tools use Sharp — a high-performance Node.js library — for professional-grade compression, resizing, and format conversion. Convert between JPG, PNG, WebP, AVIF, and GIF. Our PDF tools (powered by pdf-lib) let you merge up to 10 PDFs, split a document by page range, convert images to PDF, and now convert Markdown to styled PDFs using Puppeteer. All uploaded files are deleted immediately after processing.',
  },
  {
    heading: 'Developer & Text Tools',
    body: 'Developers spend too much time switching between tabs. Tooli consolidates 16 developer utilities — JSON formatter, Base64 encoder, JWT decoder, UUID generator, regex tester, binary converter, cron expression builder, and more. Text tools cover word counting, slug generation, case conversion, duplicate removal, HTML extraction, and Markdown editing. Everything runs in the browser for instant results with zero latency.',
  },
  {
    heading: 'Security & SEO Tools',
    body: 'The Password Generator uses crypto.getRandomValues() — the browser\'s CSPRNG. Hash Generator uses SubtleCrypto for SHA-256 and SHA-512. Password strength checker estimates crack time at 10 billion guesses/second. SEO tools include meta tag generator, Open Graph builder, robots.txt generator, keyword density checker, and XML sitemap generator — everything an SEO professional needs without any paid tool.',
  },
  {
    heading: 'Privacy-First, Zero Registration',
    body: 'Over 40 of Tooli\'s 61 tools run entirely in your browser — your data never leaves your device. Calculator tools (BMI, EMI, age, tip, percentage) and utility tools (QR code, unit converter, color palette, timezone, countdown timer) process everything locally. Even the Markdown ↔ PDF conversion is handled server-side with no permanent storage. All tools work on any modern browser without plugins or downloads.',
  },
];

export default function Footer() {
  const byCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = TOOLS.filter(t => t.category === cat);
    return acc;
  }, {});

  const cats = Object.entries(byCategory);
  const col1 = cats.slice(0, 2); // Images, PDF
  const col2 = cats.slice(2, 4); // Text, Developer
  const col3 = cats.slice(4, 6); // Security, SEO
  const col4 = cats.slice(6);    // Calculator, Utility

  return (
    <footer className="bg-gray-950 text-gray-400 mt-20">

      {/* ─── SEO content block ─────────────────────────────────────────────── */}
      <div className="border-b border-gray-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-xl bg-[#2563EB] flex items-center justify-center">
              <span className="text-white font-black text-sm">T</span>
            </div>
            <h2 className="text-white font-bold text-lg">About Tooli's 61 Free Online Tools</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-8 mb-12">
            {SEO_SECTIONS.map(({ heading, body }) => (
              <div key={heading}>
                <h3 className="text-gray-200 font-semibold text-sm mb-2">{heading}</h3>
                <p className="text-gray-600 text-xs leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          {/* Category quick-links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[col1, col2, col3, col4].map((group, gi) => (
              <div key={gi} className="space-y-8">
                {group.map(([cat, tools]) => (
                  <div key={cat}>
                    <h3 className="flex items-center gap-1.5 text-gray-300 font-semibold text-xs uppercase tracking-widest mb-3">
                      <span>{CAT_ICONS[cat]}</span>
                      <Link to={`/?category=${cat}`} className="hover:text-white transition-colors">{cat}</Link>
                    </h3>
                    <ul className="space-y-1.5">
                      {tools.map(t => (
                        <li key={t.id}>
                          <Link to={t.path} className="text-xs text-gray-500 hover:text-blue-400 transition-colors leading-relaxed">
                            {t.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Bottom bar ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <span className="text-white font-black text-xs">T</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Tooli</p>
              <p className="text-gray-600 text-xs">61 free tools · 8 categories · no registration</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-5 text-xs text-gray-600">
            <Link to="/guides" className="hover:text-gray-300 transition-colors">Guides</Link>
            <Link to="/blog" className="hover:text-gray-300 transition-colors">Blog</Link>
            <a href="/sitemap.xml" className="hover:text-gray-300 transition-colors">Sitemap</a>
            <Link to="/admin/login" className="hover:text-gray-300 transition-colors">Admin</Link>
            <span className="text-gray-700">© {new Date().getFullYear()} Tooli</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
