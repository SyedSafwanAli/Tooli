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
const AdminLogin        = lazy(() => import('../pages/admin/Login'));
const AdminDashboard    = lazy(() => import('../pages/admin/Dashboard'));
const AdminAnalytics    = lazy(() => import('../pages/admin/Analytics'));
const AdminRevenue      = lazy(() => import('../pages/admin/Revenue'));
const AdminToolsManager = lazy(() => import('../pages/admin/ToolsManager'));
const AdminSystemHealth = lazy(() => import('../pages/admin/SystemHealth'));
const AdminFileLogs     = lazy(() => import('../pages/admin/FileLogs'));
const AdminSeoManager   = lazy(() => import('../pages/admin/SeoManager'));
const AdminAIInsights   = lazy(() => import('../pages/admin/AIInsights'));
const AdminBlogManager  = lazy(() => import('../pages/admin/BlogManager'));
const AdminGuidesManager = lazy(() => import('../pages/admin/GuidesManager'));
const AdminUserActivity  = lazy(() => import('../pages/admin/UserActivity'));

// Blog
const Blog     = lazy(() => import('../pages/Blog'));
const BlogPost = lazy(() => import('../pages/BlogPost'));

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

// ── Calculator Tools ─────────────────────────────────────────────────────────
const AgeCalculator        = lazy(() => import('../pages/tools/AgeCalculator'));
const PercentageCalculator = lazy(() => import('../pages/tools/PercentageCalculator'));
const TipCalculator        = lazy(() => import('../pages/tools/TipCalculator'));
const BmiCalculator        = lazy(() => import('../pages/tools/BmiCalculator'));

// ── Security Tools (Batch 3) ──────────────────────────────────────────────────
const HashCompare    = lazy(() => import('../pages/tools/HashCompare'));

// ── Text Tools (Batch 3) ──────────────────────────────────────────────────────
const EmailExtractor = lazy(() => import('../pages/tools/EmailExtractor'));

// ── Image Tools (Batch 3) ─────────────────────────────────────────────────────
const Base64Image    = lazy(() => import('../pages/tools/Base64Image'));

// ── SEO Tools (Batch 4) ───────────────────────────────────────────────────────
const MetaTagGenerator = lazy(() => import('../pages/tools/MetaTagGenerator'));
const OgGenerator      = lazy(() => import('../pages/tools/OgGenerator'));
const RobotsGenerator  = lazy(() => import('../pages/tools/RobotsGenerator'));
const KeywordDensity   = lazy(() => import('../pages/tools/KeywordDensity'));
const SitemapGenerator = lazy(() => import('../pages/tools/SitemapGenerator'));

// ── Batch 5 — Image Tools ─────────────────────────────────────────────────────
const ImageCropTool  = lazy(() => import('../pages/tools/ImageCropTool'));
const SvgOptimizer   = lazy(() => import('../pages/tools/SvgOptimizer'));

// ── Batch 5 — PDF Tools ───────────────────────────────────────────────────────
const PdfPageCounter       = lazy(() => import('../pages/tools/PdfPageCounter'));
const PdfMetadata          = lazy(() => import('../pages/tools/PdfMetadata'));
const MarkdownPDFConverter = lazy(() => import('../pages/tools/MarkdownPDFConverter'));

// ── Batch 5 — Text Tools ──────────────────────────────────────────────────────
const TextDiff        = lazy(() => import('../pages/tools/TextDiff'));
const MarkdownToHtml  = lazy(() => import('../pages/tools/MarkdownToHtml'));

// ── Batch 5 — Developer Tools ─────────────────────────────────────────────────
const JsMinifier      = lazy(() => import('../pages/tools/JsMinifier'));
const CronGenerator   = lazy(() => import('../pages/tools/CronGenerator'));

// ── Batch 5 — Calculator Tools ────────────────────────────────────────────────
const EmiCalculator   = lazy(() => import('../pages/tools/EmiCalculator'));

// ── Batch 5 — Utility Tools ───────────────────────────────────────────────────
const TimezoneConverter = lazy(() => import('../pages/tools/TimezoneConverter'));
const RandomName        = lazy(() => import('../pages/tools/RandomName'));
const UserAgentParser   = lazy(() => import('../pages/tools/UserAgentParser'));

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
      { path: 'tools/base64-image',   element: wrap(Base64Image) },
      { path: 'tools/image-crop',     element: wrap(ImageCropTool) },
      { path: 'tools/svg-optimizer',  element: wrap(SvgOptimizer) },

      // ── PDF Tools (3 built + 2 coming soon) ──────────────────────────────
      { path: 'tools/merge-pdfs',   element: wrap(PdfMerger) },
      { path: 'tools/split-pdf',    element: wrap(PdfSplitter) },
      { path: 'tools/image-to-pdf',    element: wrap(ImageToPdf) },
      { path: 'tools/pdf-page-counter', element: wrap(PdfPageCounter) },
      { path: 'tools/pdf-metadata',     element: wrap(PdfMetadata) },
      { path: 'tools/markdown-pdf',     element: wrap(MarkdownPDFConverter) },

      // ── Text Tools (4 built + 5 coming soon) ─────────────────────────────
      { path: 'tools/word-counter',       element: wrap(WordCounter) },
      { path: 'tools/slug-generator',     element: wrap(SlugGenerator) },
      { path: 'tools/text-case-converter', element: wrap(TextCaseConverter) },
      { path: 'tools/lorem-ipsum',             element: wrap(LoremIpsumGenerator) },
      { path: 'tools/duplicate-line-remover',  element: wrap(DuplicateLineRemover) },
      { path: 'tools/html-to-text',            element: wrap(HtmlToText) },
      { path: 'tools/email-extractor',         element: wrap(EmailExtractor) },
      { path: 'tools/text-diff',               element: wrap(TextDiff) },
      { path: 'tools/markdown-to-html',        element: wrap(MarkdownToHtml) },

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
      { path: 'tools/js-minifier',          element: wrap(JsMinifier) },
      { path: 'tools/cron-generator',       element: wrap(CronGenerator) },

      // ── Security Tools (5 built) ──────────────────────────────────────────
      { path: 'tools/password-generator', element: wrap(PasswordGenerator) },
      { path: 'tools/hash-generator',     element: wrap(HashGenerator) },
      { path: 'tools/password-strength',  element: wrap(PasswordStrengthChecker) },
      { path: 'tools/uuid-validator',     element: wrap(UuidValidator) },
      { path: 'tools/hash-compare',       element: wrap(HashCompare) },

      // ── SEO Tools (5 built) ──────────────────────────────────────────────
      { path: 'tools/meta-tag-generator', element: wrap(MetaTagGenerator) },
      { path: 'tools/og-generator',       element: wrap(OgGenerator) },
      { path: 'tools/robots-generator',   element: wrap(RobotsGenerator) },
      { path: 'tools/keyword-density',    element: wrap(KeywordDensity) },
      { path: 'tools/sitemap-generator',  element: wrap(SitemapGenerator) },

      // ── Calculator Tools (4 built + 1 coming soon) ───────────────────────
      { path: 'tools/age-calculator',        element: wrap(AgeCalculator) },
      { path: 'tools/percentage-calculator', element: wrap(PercentageCalculator) },
      { path: 'tools/tip-calculator',        element: wrap(TipCalculator) },
      { path: 'tools/bmi-calculator',        element: wrap(BmiCalculator) },
      { path: 'tools/emi-calculator',        element: wrap(EmiCalculator) },

      // ── Utility Tools (2 built + 7 coming soon) ──────────────────────────
      { path: 'tools/qr-generator',     element: wrap(QrGenerator) },
      { path: 'tools/unit-converter',   element: wrap(UnitConverter) },
      { path: 'tools/color-palette',    element: wrap(ColorPaletteGenerator) },
      { path: 'tools/random-number',    element: wrap(RandomNumber) },
      { path: 'tools/aspect-ratio',     element: wrap(AspectRatio) },
      { path: 'tools/countdown-timer',    element: wrap(CountdownTimer) },
      { path: 'tools/timezone-converter', element: wrap(TimezoneConverter) },
      { path: 'tools/random-name',        element: wrap(RandomName) },
      { path: 'tools/user-agent-parser',  element: wrap(UserAgentParser) },

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
      { path: 'admin/tools',       element: wrap(AdminToolsManager) },
      { path: 'admin/system',      element: wrap(AdminSystemHealth) },
      { path: 'admin/logs',        element: wrap(AdminFileLogs) },
      { path: 'admin/seo',         element: wrap(AdminSeoManager) },
      { path: 'admin/ai-insights', element: wrap(AdminAIInsights) },
      { path: 'admin/blog',        element: wrap(AdminBlogManager) },
      { path: 'admin/guides',      element: wrap(AdminGuidesManager) },
      { path: 'admin/users',       element: wrap(AdminUserActivity) },
      { path: 'admin', element: <Navigate to="/admin/dashboard" replace /> },

      // ── Blog (public) ──────────────────────────────────────────────────────
      { path: 'blog',       element: wrap(Blog) },
      { path: 'blog/:slug', element: wrap(BlogPost) },

      { path: '*', element: wrap(NotFound) },
    ],
  },
]);
