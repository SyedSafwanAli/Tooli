import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import LoadingSpinner from '../components/common/LoadingSpinner';

function wrap(Component) {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner text="Loading..." /></div>}>
      <Component />
    </Suspense>
  );
}

// Pages
const Home        = lazy(() => import('../pages/Home'));
const NotFound    = lazy(() => import('../pages/NotFound'));
const ComingSoon  = lazy(() => import('../pages/ComingSoon'));
const Guides      = lazy(() => import('../pages/Guides'));
const GuideDetail = lazy(() => import('../pages/GuideDetail'));

// Admin
const AdminLogin     = lazy(() => import('../pages/admin/Login'));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminAnalytics = lazy(() => import('../pages/admin/Analytics'));
const AdminRevenue   = lazy(() => import('../pages/admin/Revenue'));

// ── Image Tools ──────────────────────────────────────────────────────────────
const ImageCompressor = lazy(() => import('../pages/tools/ImageCompressor'));
const ImageResizer    = lazy(() => import('../pages/tools/ImageResizer'));
const ImageConverter  = lazy(() => import('../pages/tools/ImageConverter'));

// ── PDF Tools ────────────────────────────────────────────────────────────────
const PdfMerger   = lazy(() => import('../pages/tools/PdfMerger'));
const PdfSplitter = lazy(() => import('../pages/tools/PdfSplitter'));
const ImageToPdf  = lazy(() => import('../pages/tools/ImageToPdf'));

// ── Text Tools ───────────────────────────────────────────────────────────────
const WordCounter        = lazy(() => import('../pages/tools/WordCounter'));
const SlugGenerator      = lazy(() => import('../pages/tools/SlugGenerator'));
const TextCaseConverter  = lazy(() => import('../pages/tools/TextCaseConverter'));
const LoremIpsumGenerator = lazy(() => import('../pages/tools/LoremIpsumGenerator'));

// ── Developer Tools ──────────────────────────────────────────────────────────
const JsonFormatter      = lazy(() => import('../pages/tools/JsonFormatter'));
const Base64Tool         = lazy(() => import('../pages/tools/Base64Tool'));
const UrlEncoder         = lazy(() => import('../pages/tools/UrlEncoder'));
const ColorConverter     = lazy(() => import('../pages/tools/ColorConverter'));
const UuidGenerator      = lazy(() => import('../pages/tools/UuidGenerator'));
const TimestampConverter = lazy(() => import('../pages/tools/TimestampConverter'));
const HtmlEntityEncoder  = lazy(() => import('../pages/tools/HtmlEntityEncoder'));
const UrlParser          = lazy(() => import('../pages/tools/UrlParser'));
const JwtDecoder         = lazy(() => import('../pages/tools/JwtDecoder'));
const RegexTester        = lazy(() => import('../pages/tools/RegexTester'));
const JsonToCsv          = lazy(() => import('../pages/tools/JsonToCsv'));

// ── Developer Tools (Batch 1) ─────────────────────────────────────────────────
const CsvToJson         = lazy(() => import('../pages/tools/CsvToJson'));
const BinaryConverter   = lazy(() => import('../pages/tools/BinaryConverter'));
const RomanNumeral      = lazy(() => import('../pages/tools/RomanNumeral'));

// ── Text Tools (Batch 1) ──────────────────────────────────────────────────────
const DuplicateLineRemover = lazy(() => import('../pages/tools/DuplicateLineRemover'));
const HtmlToText           = lazy(() => import('../pages/tools/HtmlToText'));

// ── Utility / Security / Developer Tools (Batch 2) ───────────────────────────
const RandomNumber          = lazy(() => import('../pages/tools/RandomNumber'));
const AspectRatio           = lazy(() => import('../pages/tools/AspectRatio'));
const CountdownTimer        = lazy(() => import('../pages/tools/CountdownTimer'));
const PasswordStrengthChecker = lazy(() => import('../pages/tools/PasswordStrengthChecker'));
const UuidValidator         = lazy(() => import('../pages/tools/UuidValidator'));

// ── Security Tools ───────────────────────────────────────────────────────────
const PasswordGenerator = lazy(() => import('../pages/tools/PasswordGenerator'));
const HashGenerator     = lazy(() => import('../pages/tools/HashGenerator'));

// ── Utility Tools ────────────────────────────────────────────────────────────
const QrGenerator           = lazy(() => import('../pages/tools/QrGenerator'));
const UnitConverter         = lazy(() => import('../pages/tools/UnitConverter'));
const ColorPaletteGenerator = lazy(() => import('../pages/tools/ColorPaletteGenerator'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: wrap(Home) },

      // ── Image Tools (3 built + 3 coming soon) ────────────────────────────
      { path: 'tools/compress-image', element: wrap(ImageCompressor) },
      { path: 'tools/resize-image',   element: wrap(ImageResizer) },
      { path: 'tools/convert-image',  element: wrap(ImageConverter) },
      // coming soon: base64-image, image-crop, svg-optimizer

      // ── PDF Tools (3 built + 2 coming soon) ──────────────────────────────
      { path: 'tools/merge-pdfs',   element: wrap(PdfMerger) },
      { path: 'tools/split-pdf',    element: wrap(PdfSplitter) },
      { path: 'tools/image-to-pdf', element: wrap(ImageToPdf) },
      // coming soon: pdf-page-counter, pdf-metadata

      // ── Text Tools (4 built + 5 coming soon) ─────────────────────────────
      { path: 'tools/word-counter',       element: wrap(WordCounter) },
      { path: 'tools/slug-generator',     element: wrap(SlugGenerator) },
      { path: 'tools/text-case-converter', element: wrap(TextCaseConverter) },
      { path: 'tools/lorem-ipsum',             element: wrap(LoremIpsumGenerator) },
      { path: 'tools/duplicate-line-remover',  element: wrap(DuplicateLineRemover) },
      { path: 'tools/html-to-text',             element: wrap(HtmlToText) },
      // coming soon: text-diff, markdown-to-html, email-extractor

      // ── Developer Tools (11 built + 5 coming soon) ───────────────────────
      { path: 'tools/json-formatter',      element: wrap(JsonFormatter) },
      { path: 'tools/base64',              element: wrap(Base64Tool) },
      { path: 'tools/url-encoder',         element: wrap(UrlEncoder) },
      { path: 'tools/color-converter',     element: wrap(ColorConverter) },
      { path: 'tools/uuid-generator',      element: wrap(UuidGenerator) },
      { path: 'tools/timestamp-converter', element: wrap(TimestampConverter) },
      { path: 'tools/html-entity-encoder', element: wrap(HtmlEntityEncoder) },
      { path: 'tools/url-parser',          element: wrap(UrlParser) },
      { path: 'tools/jwt-decoder',         element: wrap(JwtDecoder) },
      { path: 'tools/regex-tester',        element: wrap(RegexTester) },
      { path: 'tools/json-to-csv',          element: wrap(JsonToCsv) },
      { path: 'tools/csv-to-json',          element: wrap(CsvToJson) },
      { path: 'tools/binary-converter',     element: wrap(BinaryConverter) },
      { path: 'tools/roman-numeral',        element: wrap(RomanNumeral) },
      // coming soon: js-minifier, cron-generator

      // ── Security Tools (4 built + 1 coming soon) ─────────────────────────
      { path: 'tools/password-generator', element: wrap(PasswordGenerator) },
      { path: 'tools/hash-generator',     element: wrap(HashGenerator) },
      { path: 'tools/password-strength',  element: wrap(PasswordStrengthChecker) },
      { path: 'tools/uuid-validator',     element: wrap(UuidValidator) },
      // coming soon: hash-compare

      // ── SEO Tools (all 5 coming soon) ────────────────────────────────────
      // coming soon: meta-tag-generator, og-generator, robots-generator, keyword-density, sitemap-generator

      // ── Calculator Tools (all 5 coming soon) ─────────────────────────────
      // coming soon: age-calculator, bmi-calculator, percentage-calculator, emi-calculator, tip-calculator

      // ── Utility Tools (2 built + 7 coming soon) ──────────────────────────
      { path: 'tools/qr-generator',     element: wrap(QrGenerator) },
      { path: 'tools/unit-converter',   element: wrap(UnitConverter) },
      { path: 'tools/color-palette',    element: wrap(ColorPaletteGenerator) },
      { path: 'tools/random-number',    element: wrap(RandomNumber) },
      { path: 'tools/aspect-ratio',     element: wrap(AspectRatio) },
      { path: 'tools/countdown-timer',  element: wrap(CountdownTimer) },
      // coming soon: timezone-converter, random-name, user-agent-parser

      // ── Guides ────────────────────────────────────────────────────────────
      { path: 'guides',       element: wrap(Guides) },
      { path: 'guides/:slug', element: wrap(GuideDetail) },

      // ── Coming Soon catch-all for any /tools/* not yet built ─────────────
      // Must come AFTER all specific tool routes so they take precedence.
      { path: 'tools/:toolId', element: wrap(ComingSoon) },

      // ── Admin ─────────────────────────────────────────────────────────────
      { path: 'admin/login',     element: wrap(AdminLogin) },
      { path: 'admin/dashboard', element: wrap(AdminDashboard) },
      { path: 'admin/analytics', element: wrap(AdminAnalytics) },
      { path: 'admin/revenue',   element: wrap(AdminRevenue) },
      { path: 'admin', element: <Navigate to="/admin/dashboard" replace /> },

      { path: '*', element: wrap(NotFound) },
    ],
  },
]);
