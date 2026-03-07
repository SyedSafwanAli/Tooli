# Tooli — Production-Ready MERN Tools Website

> 60 free online tools · 8 categories · No database required · Admin dashboard · Revenue tracking · Analytics · SEO-optimised

---

## Quick Start

```bash
# 1. Install all dependencies (root + backend + frontend)
npm run install:all

# 2. Start both servers simultaneously
npm run dev
```

| Service  | URL                               |
|----------|-----------------------------------|
| Frontend | http://localhost:5173             |
| Backend  | http://localhost:5000             |
| API Root | http://localhost:5000/api         |
| Admin    | http://localhost:5173/admin/login |

**Default admin credentials:** `admin` / `admin123`

---

## Project Structure

```
tooli/
├── package.json                        ← Root workspace (concurrently scripts)
├── .gitignore
│
├── backend/
│   ├── .env                            ← Environment variables (copy from .env.example)
│   ├── .env.example                    ← Template for environment variables
│   ├── server.js                       ← Entry point — starts Express server
│   ├── package.json
│   ├── uploads/                        ← Temp uploaded files (auto-cleaned after processing)
│   ├── data/                           ← JSON persistence (auto-created on first run)
│   │   ├── analytics.json              ← Page views + tool usage counts
│   │   ├── revenue.json                ← Revenue entries + categories
│   │   └── admin.json                  ← Admin credentials (hashed password)
│   │
│   └── src/
│       ├── app.js                      ← Express app (cors, helmet, middleware, routes)
│       ├── config/
│       │   └── index.js                ← All env-driven config in one place
│       │
│       ├── repositories/               ← DATA ACCESS LAYER (DB-agnostic)
│       │   ├── adapters/
│       │   │   └── jsonFileAdapter.js  ← ⭐ Swap this for mongoAdapter.js to add MongoDB
│       │   ├── analyticsRepository.js  ← Analytics CRUD
│       │   ├── revenueRepository.js    ← Revenue CRUD
│       │   └── adminRepository.js      ← Admin user CRUD
│       │
│       ├── services/                   ← BUSINESS LOGIC
│       │   ├── authService.js          ← JWT login, password change
│       │   ├── analyticsService.js     ← Analytics queries
│       │   ├── revenueService.js       ← Revenue operations + validation
│       │   └── tools/
│       │       ├── imageService.js     ← Sharp: compress, resize, convert
│       │       └── pdfService.js       ← pdf-lib: merge, split, image-to-pdf
│       │
│       ├── controllers/                ← THIN ROUTE HANDLERS
│       │   ├── admin/
│       │   │   ├── authController.js
│       │   │   ├── analyticsController.js
│       │   │   └── revenueController.js
│       │   └── tools/
│       │       ├── imageController.js
│       │       └── pdfController.js
│       │
│       ├── middleware/
│       │   ├── auth.js                 ← JWT Bearer token verification
│       │   ├── analytics.js            ← Auto-records every API request (non-blocking)
│       │   ├── errorHandler.js         ← Global error formatter
│       │   ├── rateLimiter.js          ← express-rate-limit (tools: 30/min, auth: 5/min)
│       │   └── upload.js               ← Multer config (image, PDF, multi-file filters)
│       │
│       ├── routes/
│       │   ├── index.js                ← Mounts /tools, /admin, /track
│       │   ├── tools.js                ← Tool endpoints
│       │   └── admin.js                ← Admin endpoints (most behind JWT)
│       │
│       └── utils/
│           └── responseHelper.js       ← Standard { success, data, message } shape
│
└── frontend/
    ├── index.html                      ← SEO meta tags, Google Fonts
    ├── package.json
    ├── vite.config.js                  ← Vite + React plugin + /api proxy to :5000
    ├── tailwind.config.js              ← Custom colors, animations
    ├── postcss.config.js
    ├── public/
    │   ├── favicon.svg
    │   ├── robots.txt              ← Blocks /admin/ and /api/ from crawlers
    │   └── sitemap.xml             ← 77 URLs with priorities + changefreq
    │
    └── src/
        ├── main.jsx                    ← ReactDOM.createRoot + RouterProvider
        ├── App.jsx                     ← AuthProvider + Layout switcher (public vs admin)
        ├── index.css                   ← Tailwind + custom component classes
        │
        ├── router/
        │   └── index.jsx               ← All routes with React.lazy + Suspense
        │
        ├── context/
        │   └── AuthContext.jsx         ← isAuthenticated, login(), logout() — JWT in localStorage
        │
        ├── hooks/
        │   └── useLocalStorage.js      ← Typed localStorage hook
        │
        ├── constants/
        │   ├── tools.js                ← Master list of 60 tools (id, title, path, category, keywords)
        │   └── guides.js               ← 5 guide articles with typed content sections (p/h2/ul/steps/faq/callout)
        │
        ├── services/
        │   ├── api.js                  ← Axios instance (auto-attaches JWT, 401 redirect)
        │   ├── toolsApi.js             ← Tool API calls + downloadBlob + getFileSizes helpers
        │   └── adminApi.js             ← Admin API calls (analytics, revenue, auth)
        │
        ├── utils/
        │   ├── formatters.js           ← formatBytes, formatCurrency, formatDate, savings%
        │   └── useSEO.js               ← Hook: <title>, meta, OG tags, JSON-LD injection + cleanup
        │
        ├── components/
        │   ├── common/
        │   │   ├── Icons.jsx            ← 41 inline SVG tool icons + common UI icons + ICON_MAP
        │   │   ├── Button.jsx           ← Variants: primary, secondary, danger, ghost, outline
        │   │   ├── FileUpload.jsx        ← Drag-and-drop zone with animation, file list, remove buttons
        │   │   ├── LoadingSpinner.jsx    ← sm/md/lg sizes with optional text
        │   │   ├── Alert.jsx             ← success/error/warning/info with dismiss
        │   │   ├── ToolCard.jsx          ← Homepage card: SVG icon, category badge, type badge
        │   │   ├── ToolLayout.jsx        ← Tool page wrapper: breadcrumb JSON-LD, icon header, related tools, SEO section
        │   │   ├── ImageResultPreview.jsx ← Before/After image comparison (Side by Side / Before / After tabs)
        │   │   └── ResultActions.jsx     ← Universal Download / Copy / Share action bar
        │   │
        │   └── layout/
        │       ├── Header.jsx           ← Sticky header + live search + category nav + mobile menu
        │       ├── Footer.jsx           ← Rich SEO content: 4 paragraphs + per-category tool listings
        │       └── AdminLayout.jsx      ← Sidebar (Dashboard / Analytics / Revenue) + logout
        │
        └── pages/
            ├── Home.jsx                 ← Gradient hero + search + category tabs + grid + benefits + SEO
            ├── NotFound.jsx             ← 404 page
            │
            ├── admin/
            │   ├── Login.jsx            ← JWT login form
            │   ├── Dashboard.jsx        ← KPI cards + top pages + tool usage bars
            │   ├── Analytics.jsx        ← Line chart (visits/day) + bar chart (tool usage) + table
            │   └── Revenue.jsx          ← CRUD form + line chart (monthly) + pie chart (by category)
            │
            ├── Guides.jsx               ← /guides listing with category filter
            ├── GuideDetail.jsx          ← /guides/:slug article renderer
            └── tools/                   ← 36 built tool pages (+ ComingSoon.jsx catch-all)
                ├── ImageCompressor.jsx, ImageResizer.jsx, ImageConverter.jsx
                ├── PdfMerger.jsx, PdfSplitter.jsx, ImageToPdf.jsx
                ├── WordCounter.jsx, SlugGenerator.jsx, TextCaseConverter.jsx
                ├── LoremIpsumGenerator.jsx, DuplicateLineRemover.jsx, HtmlToText.jsx
                ├── JsonFormatter.jsx, Base64Tool.jsx, UrlEncoder.jsx
                ├── ColorConverter.jsx, UuidGenerator.jsx, TimestampConverter.jsx
                ├── HtmlEntityEncoder.jsx, UrlParser.jsx, JwtDecoder.jsx
                ├── RegexTester.jsx, JsonToCsv.jsx, CsvToJson.jsx
                ├── BinaryConverter.jsx, RomanNumeral.jsx
                ├── PasswordGenerator.jsx, HashGenerator.jsx
                ├── PasswordStrengthChecker.jsx, UuidValidator.jsx
                ├── QrGenerator.jsx, UnitConverter.jsx, ColorPaletteGenerator.jsx
                ├── RandomNumber.jsx, AspectRatio.jsx, CountdownTimer.jsx
                └── ComingSoon.jsx       ← Catch-all for unbuilt tools
```

---

## 60 Tools — All Categories

> **Status key:**
> - ✅ **Built** — full UI, SEO content, JSON-LD schemas, working in production
> - 🚧 **Coming Soon** — listed in `TOOLS`, routed to `ComingSoon.jsx`, indexed in sitemap

**36 built · 24 coming soon**

### Backend-Powered Tools (Node.js + Sharp / pdf-lib)

All 6 backend tools are fully built.

| # | Status | Tool | Route | Tech | What it does |
|---|--------|------|-------|------|--------------|
| 1 | ✅ | **Image Compressor** | `POST /api/tools/compress-image` | Sharp | Reduce file size with quality slider (1–100). Before/after preview. Format selectable (JPEG/PNG/WebP/AVIF). |
| 2 | ✅ | **Image Resizer** | `POST /api/tools/resize-image` | Sharp | Resize to exact px. Proportional scaling. Fit modes: cover, contain, fill, inside, outside. |
| 3 | ✅ | **Image Converter** | `POST /api/tools/convert-image` | Sharp | Convert between JPEG, PNG, WebP, AVIF, TIFF. Quality control for lossy formats. |
| 4 | ✅ | **PDF Merger** | `POST /api/tools/merge-pdfs` | pdf-lib | Merge up to 10 PDFs into one. Drag to reorder pages before merging. |
| 5 | ✅ | **PDF Splitter** | `POST /api/tools/split-pdf` | pdf-lib + archiver | Split into individual pages or page range. Single page → PDF. Multiple → ZIP. |
| 6 | ✅ | **Image to PDF** | `POST /api/tools/image-to-pdf` | pdf-lib + Sharp | Convert 1–10 images into a multi-page PDF. Auto-fits to A4. |

### Frontend-Only Tools (zero backend calls, fully in browser)

#### Images (0 of 3 built)
| Status | Tool | What it does |
|--------|------|--------------|
| 🚧 | Base64 Image Encoder | Convert images to/from Base64 data URIs for embedding in HTML/CSS |
| 🚧 | Image Crop Tool | Crop images to any size or aspect ratio in-browser |
| 🚧 | SVG Optimizer | Clean and minify SVG markup |

#### PDF (0 of 2 built)
| Status | Tool | What it does |
|--------|------|--------------|
| 🚧 | PDF Page Counter | Count PDF pages without uploading |
| 🚧 | PDF Metadata Viewer | View title, author, creation date and other PDF properties |

#### Text (6 of 9 built)
| Status | Tool | What it does |
|--------|------|--------------|
| ✅ | **Word Counter** | Words, chars, sentences, paragraphs, read time, top keywords |
| ✅ | **Slug Generator** | Convert text to URL-friendly slug. Normalises accents. Hyphen or underscore separator. |
| ✅ | **Text Case Converter** | 10 formats: UPPER, lower, Title, Sentence, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case |
| ✅ | **Lorem Ipsum Generator** | 1–20 paragraphs, 1–50 sentences, or 10–500 words of classic Cicero filler text |
| 🚧 | Text Diff Checker | Compare two texts and highlight line-by-line differences |
| ✅ | **Duplicate Line Remover** | Remove duplicate lines — case-sensitive/insensitive, sort, trim |
| 🚧 | Markdown to HTML | Convert Markdown to HTML with live preview |
| ✅ | **HTML to Plain Text** | Strip HTML tags, decode entities, optional line break preservation |
| 🚧 | Email Extractor | Extract all email addresses from text or HTML |

#### Developer (14 of 16 built)
| Status | Tool | What it does |
|--------|------|--------------|
| ✅ | **JSON Formatter** | Beautify, minify, and validate JSON with syntax highlighting |
| ✅ | **Base64 Encoder/Decoder** | Encode/decode text to/from Base64. UTF-8 safe. |
| ✅ | **URL Encoder/Decoder** | Encode/decode URL and query string parameters |
| ✅ | **Color Converter** | HEX ↔ RGB ↔ HSL with live colour picker |
| ✅ | **UUID Generator** | RFC 4122 v4 UUIDs via Web Crypto API. Bulk (1–50). Standard/UPPER/no-dash/braced formats. |
| ✅ | **Timestamp Converter** | Unix ↔ date (local, ISO, UTC). Live current timestamp. Seconds and milliseconds. |
| ✅ | **HTML Entity Encoder/Decoder** | Encode &, <, >, ", '. Decode all named and numeric entities. Quick-reference table. |
| ✅ | **URL Parser** | Split URL into protocol, host, port, path, query params (table), hash |
| ✅ | **JWT Decoder** | Decode header + payload, show expiration status, convert timestamp claims to dates |
| ✅ | **Regex Tester** | Real-time match highlighting, g/i/m/s flags, named groups, built-in examples |
| ✅ | **JSON to CSV Converter** | Convert JSON array → CSV with auto-detected headers. One-click download. |
| ✅ | **CSV to JSON Converter** | RFC 4180 CSV parser, header toggle, copy/download JSON |
| ✅ | **Number Base Converter** | Binary ↔ Octal ↔ Decimal ↔ Hex — type in any field |
| ✅ | **Roman Numeral Converter** | Decimal → Roman and Roman → Decimal, validates 1–3999 |
| 🚧 | JS / CSS Minifier | Minify JavaScript or CSS code |
| 🚧 | Cron Expression Generator | Visual cron builder with plain-English description |

#### SEO (0 of 5 built)
| Status | Tool | What it does |
|--------|------|--------------|
| 🚧 | Meta Tag Generator | Generate `<title>`, `<meta description>`, OG and Twitter card tags |
| 🚧 | Open Graph Generator | Build Open Graph meta tags for social media sharing |
| 🚧 | Robots.txt Generator | Build a custom robots.txt with allow/disallow rules |
| 🚧 | Keyword Density Checker | Analyse keyword frequency and density |
| 🚧 | Sitemap Generator | Build XML sitemap from a list of URLs |

#### Security (4 of 5 built)
| Status | Tool | What it does |
|--------|------|--------------|
| ✅ | **Password Generator** | Length 4–128, character type toggles, bulk generation, strength meter |
| ✅ | **Hash Generator** | SHA-256/SHA-512 via Web Crypto API. No data leaves device. |
| ✅ | **Password Strength Checker** | Score, crack time estimate, NIST criteria checklist, common pattern detection |
| 🚧 | Hash Compare Tool | Side-by-side hash comparison for integrity verification |
| ✅ | **UUID Validator** | Validate UUID format, detect v1–v5 version and variant. Bulk mode. Generate v4. |

#### Calculator (0 of 5 built)
| Status | Tool | What it does |
|--------|------|--------------|
| 🚧 | Age Calculator | Exact age in years, months, days from any date of birth |
| 🚧 | BMI Calculator | Body Mass Index with metric and imperial units |
| 🚧 | Percentage Calculator | Calculate percentages, change, and X as % of Y |
| 🚧 | EMI / Loan Calculator | Monthly payments, total interest, amortisation schedule |
| 🚧 | Tip Calculator | Tip amount + bill split for any group size |

#### Utility (6 of 9 built)
| Status | Tool | What it does |
|--------|------|--------------|
| ✅ | **QR Code Generator** | Live preview, custom size/colours, error correction. Download PNG. |
| ✅ | **Unit Converter** | Length, Weight, Temperature, Area, Data, Speed |
| ✅ | **Color Palette Generator** | 6 palette types, HSL colour math, CSS export, PNG download via Canvas |
| 🚧 | Timezone Converter | Convert time between world timezones |
| ✅ | **Random Number Generator** | Cryptographically secure, unique mode, bulk up to 10,000, 4 separator options |
| 🚧 | Random Name Generator | Random names for testing, games, or fiction |
| 🚧 | User Agent Parser | Detect browser, OS, and device from user agent strings |
| ✅ | **Aspect Ratio Calculator** | Calculate & scale aspect ratios, 8 presets, visual preview box |
| ✅ | **Countdown Timer** | Countdown to any date/time, quick presets, progress bar, browser alert |

### Coming Soon — Build Priority

The 24 unbuilt tools are grouped below by estimated build complexity (all frontend-only):

| Priority | Tools |
|----------|-------|
| **Quick wins** (< 1 hour each) | ~~CSV to JSON~~, ~~Number Base Converter~~, ~~Roman Numeral Converter~~, ~~Duplicate Line Remover~~, ~~HTML to Plain Text~~, ~~Random Number Generator~~, ~~Aspect Ratio Calculator~~, ~~Countdown Timer~~, ~~Password Strength Checker~~, ~~UUID Validator~~, Age Calculator, Percentage Calculator, Tip Calculator |
| **Medium** (1–3 hours each) | Text Diff Checker, Markdown to HTML, Email Extractor, JS/CSS Minifier, Hash Compare Tool, BMI Calculator, EMI/Loan Calculator, Timezone Converter, Random Name Generator, User Agent Parser, Base64 Image Encoder |
| **Larger scope** (3+ hours each) | Image Crop Tool, SVG Optimizer, PDF Page Counter, PDF Metadata Viewer, Meta Tag Generator, Open Graph Generator, Robots.txt Generator, Keyword Density Checker, Sitemap Generator, Cron Expression Generator |

---

## Frontend — Phase 2 Enhancements

### Homepage (`Home.jsx`)
- Gradient hero (`blue → indigo → purple`) with animated "live" badge, H1, subtitle
- Quick-link CTA pills to the most popular tools
- Category filter tabs with emoji icons and tool count badges
- Search result count indicator
- Benefits row: Lightning Fast / 100% Private / Zero Signup / Always Free
- Stats bar (15 tools, 0 signup, 100% browser privacy)
- SEO content section with feature breakdown by category

### Tool Pages
Every tool page now includes:
- **SVG icon** from `Icons.jsx` displayed in the `ToolLayout` header and breadcrumb
- **`category` prop** — drives breadcrumb link and icon background colour
- **`seoContent` prop** — renders below the tool UI:
  - About section (1–2 paragraphs)
  - Numbered how-to steps
  - Features checklist (2-column grid)
  - FAQ accordion
  - CTA banner linking back to the homepage
- **JSON-LD structured data** — `WebApplication` + `FAQPage` schemas injected via `useSEO` and cleaned up on unmount

### `Icons.jsx`
Heroicons-style inline SVGs (`viewBox="0 0 24 24"`, `strokeWidth="1.5"`, `fill="none"`) for 36 tools (Phase 2 + Phase 4 + Phase 5):

**Phase 2 originals (15):** `CompressImageIcon`, `ResizeImageIcon`, `ConvertImageIcon`, `MergePdfIcon`, `SplitPdfIcon`, `ImageToPdfIcon`, `WordCounterIcon`, `JsonFormatterIcon`, `Base64Icon`, `UrlEncoderIcon`, `PasswordGeneratorIcon`, `ColorConverterIcon`, `HashGeneratorIcon`, `QrGeneratorIcon`, `UnitConverterIcon`

**Phase 4 additions (10):** `SlugGeneratorIcon`, `TextCaseConverterIcon`, `LoremIpsumIcon`, `UuidGeneratorIcon`, `TimestampConverterIcon`, `HtmlEntityEncoderIcon`, `UrlParserIcon`, `JwtDecoderIcon`, `JsonToCsvIcon`, `RegexTesterIcon`

**Phase 5 Batch 1 additions (6):** `ColorPaletteIcon`, `CsvToJsonIcon`, `BinaryConverterIcon`, `RomanNumeralIcon`, `DuplicateLineRemoverIcon`, `HtmlToTextIcon`

**Phase 5 Batch 2 additions (5):** `RandomNumberIcon`, `AspectRatioIcon`, `CountdownTimerIcon`, `PasswordStrengthIcon`, `UuidValidatorIcon`

**Common UI (10):** `UploadIcon`, `SearchIcon`, `DownloadIcon`, `CopyIcon`, `CheckIcon`, `SparklesIcon`, `ArrowRightIcon`, `ShieldCheckIcon`, `ZapIcon`, `GlobeIcon`

`ICON_MAP` maps `tool.id` → SVG component. Tools without an entry fall back to the `tool.icon` emoji (handled by `ToolCard` and `RelatedToolCard`).

### `useSEO` hook
```js
useSEO({ title, description, keywords, jsonLd, canonical })
```
- Sets `document.title`, `<meta name="description">`, OG tags, Twitter tags, `<link rel="canonical">`
- Injects `<script type="application/ld+json">` for each schema in `jsonLd` array
- Cleans up all injected elements on unmount (no stale tags when navigating)
- Helper exports:
  - `buildToolSchema({ name, description, url, category })` — `WebApplication` schema
  - `buildFAQSchema(faqs)` — `FAQPage` schema from `[{ q, a }]` array
  - `buildBreadcrumbSchema(items)` — `BreadcrumbList` schema from `[{ name, url }]` array

### `ToolLayout` `seoContent` API
```jsx
<ToolLayout
  title="Image Compressor"
  description="..."
  icon={<CompressImageIcon className="w-6 h-6" />}
  category="Images"
  seoContent={{
    about: 'string or string[]',
    howTo: ['Step 1', 'Step 2', ...],
    features: ['Feature 1', 'Feature 2', ...],
    faq: [{ q: 'Question?', a: 'Answer.' }],
  }}
>
  {/* tool UI */}
</ToolLayout>
```

`ToolLayout` auto-detects the current tool via `useLocation().pathname` and:
- Injects a `BreadcrumbList` JSON-LD schema via `<script dangerouslySetInnerHTML>`
- Renders a clickable breadcrumb nav (`Home → Category → Tool`)
- Renders a **Related Tools** section (up to 6 tools — same category prioritised)
- Renders the full `seoContent` block below related tools

### `FileUpload` component
- Animated drag-over ring (`border-blue-500 bg-blue-50 scale-[1.01] shadow-lg`)
- Selected file list with filename, size (`formatBytes`), and individual remove buttons
- Accessible: `role="button"`, `tabIndex`, `onKeyDown`, `aria-label`

---

## SEO Optimization — Phase 3

### Canonical URLs
All 15 tool pages pass `canonical: '/tools/{slug}'` to `useSEO()`. The hook creates or updates `<link rel="canonical" href="https://tooli.app/tools/{slug}">` and removes it on unmount.

### BreadcrumbList JSON-LD
`ToolLayout` injects a `BreadcrumbList` schema directly via `<script dangerouslySetInnerHTML>` for each tool:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://tooli.app/" },
    { "@type": "ListItem", "position": 2, "name": "Images", "item": "https://tooli.app/?category=Images" },
    { "@type": "ListItem", "position": 3, "name": "Image Compressor", "item": "https://tooli.app/tools/compress-image" }
  ]
}
```

### Related Tools (Internal Linking)
`ToolLayout` uses `useLocation().pathname` to identify the current tool, then auto-selects up to 6 related tools — same category first, then other categories. Each related tool card shows its SVG icon, title, description, and a link.

### Rich SEO Footer
`Footer.jsx` now contains two blocks:
1. **SEO content block** (top, `border-b`) — H2 heading, 4 descriptive paragraphs in a 2-column grid, 3-column category breakdown with one-liner descriptions and links to every tool
2. **Standard links block** — brand tagline + category columns + copyright + sitemap/admin links

### Static SEO Files (`frontend/public/`)

**`robots.txt`**
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://tooli.app/sitemap.xml
```

**`sitemap.xml`** — 77 URLs total (1 homepage + 60 tools + 1 guides index + 5 guide articles + 10 sitemap entries for misc pages):
| Priority | URLs |
|----------|------|
| `1.0` weekly | Homepage `/` |
| `0.9` monthly | Image tools (3 backend) + PDF tools (3 backend) |
| `0.8` monthly | Built text/developer/security/utility tools |
| `0.7` monthly | Coming-soon tools (still indexed for future content) |

---

## Platform Expansion — Phase 4

### Scale: 15 → 60 Tools

Phase 4 expands the platform to 60 tools across 8 categories. The architecture required zero changes — the TOOLS constant, router, and ToolLayout all scale automatically.

### 2 New Categories Added

| Category | Color | Tools |
|----------|-------|-------|
| **SEO** | Teal | Meta Tag Generator, Open Graph Generator, Robots.txt Generator, Keyword Density, Sitemap Generator |
| **Calculator** | Orange | Age Calculator, BMI Calculator, Percentage Calculator, EMI/Loan Calculator, Tip Calculator |

### `ComingSoon.jsx` Pattern

Tools listed in `TOOLS` but not yet built route to `ComingSoon.jsx` via the catch-all route `tools/:toolId`. The page:
- Automatically reads the tool's title, description, and category from `TOOLS`
- Shows the tool's SVG icon or emoji
- Lists up to 4 related tools in the same category that are already built
- Zero per-tool configuration required — just add to `TOOLS` and router

### Router Catch-All

```js
// In router/index.jsx — placed AFTER all specific tool routes:
{ path: 'tools/:toolId', element: wrap(ComingSoon) },
```

Specific routes take precedence over the catch-all, so built tools always render their full page. Unbuilt tools gracefully degrade to ComingSoon.

### 10 New Fully-Built Tool Pages

| Tool | Category | Key Features |
|------|----------|--------------|
| **Slug Generator** | Text | Real-time, accent normalisation, hyphen/underscore |
| **Text Case Converter** | Text | 10 formats: camelCase, PascalCase, snake_case, kebab-case, etc. |
| **Lorem Ipsum Generator** | Text | Paragraphs / sentences / words, classic Cicero text |
| **UUID Generator** | Developer | RFC 4122 v4 via Web Crypto, bulk 1–50, 4 formats |
| **Timestamp Converter** | Developer | Live clock, timestamp↔date, seconds/milliseconds |
| **HTML Entity Encoder** | Developer | Encode/decode, browser-native decode, quick-reference table |
| **URL Parser** | Developer | Native URL API, component table, query params table |
| **JWT Decoder** | Developer | Header + payload JSON, expiration status, timestamp claims |
| **JSON to CSV** | Developer | Auto-headers, RFC 4180 escaping, one-click download |
| **Regex Tester** | Developer | Real-time highlighting, g/i/m/s flags, named groups, examples |

### How to Add a New Tool

1. **Add to `TOOLS`** in `frontend/src/constants/tools.js`:
   ```js
   {
     id: 'my-tool',          // unique slug
     title: 'My Tool',
     description: 'One-line description.',
     icon: '🔧',             // emoji fallback
     category: 'Developer',  // existing or new category
     path: '/tools/my-tool',
     type: 'frontend',
     keywords: ['keyword1', 'keyword2'],
   }
   ```
2. **Add route** in `frontend/src/router/index.jsx`:
   ```js
   const MyTool = lazy(() => import('../pages/tools/MyTool'));
   { path: 'tools/my-tool', element: wrap(MyTool) },
   ```
   > Until the page is built, the catch-all `tools/:toolId` route shows `ComingSoon.jsx` automatically — no action needed.

3. **Create the page** in `frontend/src/pages/tools/MyTool.jsx` using any existing tool as a template.
4. **Add SVG icon** to `Icons.jsx` and `ICON_MAP` (optional — emoji fallback always works).
5. **Add to `sitemap.xml`** in `frontend/public/sitemap.xml`.

### New Category Colors

| Category | Badge | Icon background |
|----------|-------|----------------|
| SEO | `bg-teal-100 text-teal-700` | `bg-teal-50 text-teal-600` |
| Calculator | `bg-orange-100 text-orange-700` | `bg-orange-50 text-orange-600` |

Add to `CATEGORY_STYLES` in `ToolCard.jsx` and `ICON_COLORS` / `CATEGORY_CARD_COLORS` in `ToolLayout.jsx`.

---

## Phase 5 Enhancements

### New Shared Components

| Component | File | Purpose |
|-----------|------|---------|
| `ImageResultPreview` | `components/common/ImageResultPreview.jsx` | Before/After image comparison for image tools. Three view modes: Side by Side, Before, After. Shows file size and savings %. |
| `ResultActions` | `components/common/ResultActions.jsx` | Universal Download / Copy / Share (Web Share API) action bar. Used by any tool that produces a copyable or downloadable result. |

#### `ImageResultPreview` usage
```jsx
<ImageResultPreview
  originalFile={file}           // File object from upload
  resultBlob={result.blob.data} // Blob from API response
  originalSize={result.originalSize}
  resultSize={result.compressedSize}
  savedPct={saved}              // e.g. "62"
/>
```

#### `ResultActions` usage
```jsx
<ResultActions
  onDownload={() => downloadBlob(result.blob, result.filename)}
  downloadLabel="Download Compressed Image"
  copyText={optionalStringToCopy}
  shareData={{ title: '...', text: '...', url: 'https://tooli.app/tools/...' }}
/>
```
`copyText` is optional — Copy button only renders when provided.
`shareData` is optional — Share button only renders on devices that support the Web Share API.

---

### Color Palette Generator (`/tools/color-palette`) ✅

Fully-built Utility tool with zero external dependencies.

| Feature | Detail |
|---------|--------|
| Palette types | Complementary (2), Analogous (5), Triadic (3), Tetradic (4), Split-Complementary (3), Monochromatic (5) |
| Colour math | Pure HSL — `hexToHsl`, `hslToHex` functions, no library |
| Per-swatch info | HEX + HSL displayed; click to copy HEX |
| CSS export | Copies `:root { --color-1: ...; }` custom properties |
| PNG download | Canvas API draws palette strip, triggers download |
| Icon | `ColorPaletteIcon` added to `Icons.jsx` and `ICON_MAP` |

---

### Tool Guides System (`/guides`, `/guides/:slug`) ✅

SEO-optimised article pages linked to each tool.

#### Routes
```
/guides              → Guides list with category filter
/guides/:slug        → Individual guide article
```

#### Content model (`frontend/src/constants/guides.js`)
```js
{
  id: 'compress-images-web',
  slug: 'how-to-compress-images-for-the-web',
  title: 'How to Compress Images for the Web',
  description: '...',
  relatedTool: { id: 'compress-image', path: '/tools/compress-image', title: 'Image Compressor' },
  category: 'Images',
  readTime: 6,
  publishedAt: '2024-03-01',
  keywords: ['compress images', ...],
  content: [
    { type: 'p',       text: '...' },
    { type: 'h2',      text: '...' },
    { type: 'ul',      items: ['...'] },
    { type: 'steps',   items: ['...'] },
    { type: 'callout', variant: 'tip' | 'warning' | 'info', text: '...' },
    { type: 'faq',     items: [{ q: '...', a: '...' }] },
  ],
}
```

#### SEO features
- `useSEO()` with title, description, keywords, canonical per guide
- `FAQPage` JSON-LD schema from `faq` content section
- Breadcrumb: Home › Guides › Article Title
- Related tool CTA banner at top and bottom of each article

#### 5 guides shipped
| Slug | Related Tool |
|------|-------------|
| `how-to-compress-images-for-the-web` | Image Compressor |
| `how-to-format-and-validate-json` | JSON Formatter |
| `beginners-guide-to-regular-expressions` | Regex Tester |
| `url-slugs-and-seo-best-practices` | Slug Generator |
| `how-to-create-strong-passwords` | Password Generator |

#### How to add a new guide
1. Add an entry to `GUIDES` array in `frontend/src/constants/guides.js`
2. Add the URL to `frontend/public/sitemap.xml`
3. No router change needed — `guides/:slug` already handles any slug

---

### Phase 5 Batch 1 — 5 New Frontend Tools ✅

All 5 tools follow the `ToolLayout + seoContent + useSEO + ResultActions` pattern.

| Tool | Route | Key Logic | Icon |
|------|-------|-----------|------|
| **CSV to JSON** | `/tools/csv-to-json` | RFC 4180 character-by-character parser; handles quoted fields, embedded commas, CRLF/LF; `hasHeaders` toggle | `CsvToJsonIcon` |
| **Number Base Converter** | `/tools/binary-converter` | 4 linked inputs (Binary/Octal/Decimal/Hex); validates per-base charset; quick values row | `BinaryConverterIcon` |
| **Roman Numeral Converter** | `/tools/roman-numeral` | `toRoman` + `fromRoman` with round-trip validation; mode toggle; 1–3999 range | `RomanNumeralIcon` |
| **Duplicate Line Remover** | `/tools/duplicate-line-remover` | `Set`-based O(n) dedup; case-sensitive/insensitive, sort, trim options; shows removed count | `DuplicateLineRemoverIcon` |
| **HTML to Plain Text** | `/tools/html-to-text` | `DOMParser.parseFromString` (sandboxed — scripts never execute); `createTreeWalker` for block-tag newlines | `HtmlToTextIcon` |

---

### Phase 5 Batch 2 — 5 New Frontend Tools ✅

| Tool | Route | Key Logic | Icon |
|------|-------|-----------|------|
| **Random Number Generator** | `/tools/random-number` | `secureRandInt` with rejection sampling (no modulo bias); Fisher-Yates partial shuffle for unique mode; up to 10,000 numbers; 4 separator options | `RandomNumberIcon` |
| **Aspect Ratio Calculator** | `/tools/aspect-ratio` | Euclidean GCD → simplified ratio; bidirectional scale (target W→H or H→W); 8 presets; visual 200px preview box | `AspectRatioIcon` |
| **Countdown Timer** | `/tools/countdown-timer` | Clock-based ticks (`Date.now()` diff — stays accurate in background tabs); 6 quick presets; progress bar; browser alert on zero | `CountdownTimerIcon` |
| **Password Strength Checker** | `/tools/password-strength` | 0–100 score (length/charset/uniqueness); crack time at 10B guesses/sec; keyboard walk + common pattern detection; 7-item criteria checklist | `PasswordStrengthIcon` |
| **UUID Validator** | `/tools/uuid-validator` | RFC 4122 regex; v1–v5 version detection from nibble[14]; variant detection from nibble[19]; single + bulk mode; generate v4 via `crypto.randomUUID()` | `UuidValidatorIcon` |

---

### AI Stock Image Platform & Blog — Architecture (Not Yet Built)

#### AI Stock (`/stock`) — External dependencies required
| Decision | Options |
|----------|---------|
| Image source | Unsplash API (50 req/hr free) · Pexels API (200 req/hr free) · Static curated set |
| Download gate | AdSense Rewarded Ad · 3-second countdown · Email capture |
| Storage | None needed for API-sourced · CDN/S3 for AI-generated |

Planned files when approved:
```
frontend/src/pages/Stock.jsx          — gallery grid with search + categories
frontend/src/pages/StockDetail.jsx    — full preview + download gate
frontend/src/services/stockApi.js     — Unsplash/Pexels API calls
```

#### Blog (`/blog`) — Shares Guide infrastructure
```
frontend/src/constants/blog.js        — same content model as guides.js
frontend/src/pages/Blog.jsx           — blog listing (reuses Guides.jsx pattern)
frontend/src/pages/BlogPost.jsx       — article (reuses GuideDetail.jsx renderer)
```
No new components needed — `GuideSection` renderer is generic enough to power both.

---

## API Reference

### Public Endpoints

```
GET    /health                      → Server health check
POST   /api/track                   → Page view beacon (frontend calls this on mount)
```

### Tool Endpoints (Rate limited: 30 req/min per IP)

```
POST   /api/tools/compress-image    body: multipart (image file, quality, format)
POST   /api/tools/resize-image      body: multipart (image file, width, height, fit, format)
POST   /api/tools/convert-image     body: multipart (image file, format, quality)
POST   /api/tools/merge-pdfs        body: multipart (pdfs[] — up to 10 files)
POST   /api/tools/split-pdf         body: multipart (pdf file, pages?)
POST   /api/tools/image-to-pdf      body: multipart (images[] — up to 10 files)
```

All file tool endpoints respond with the processed file as a binary blob (`Content-Disposition: attachment`).
Custom headers carry metadata: `X-Original-Size`, `X-Compressed-Size`, `X-Width`, `X-Height`, `X-Page-Count`.

### Admin Endpoints (Rate limited: auth 5/min, others standard)

```
POST   /api/admin/login              body: { username, password } → { token, username }
GET    /api/admin/me                 [JWT] → { username }
PUT    /api/admin/password           [JWT] body: { currentPassword, newPassword }

GET    /api/admin/analytics/summary  [JWT] ?days=30 → visit stats + chart data
GET    /api/admin/analytics          [JWT] → raw page views (last 1000)
DELETE /api/admin/analytics          [JWT] → clears all analytics data

GET    /api/admin/revenue            [JWT] → all revenue entries
POST   /api/admin/revenue            [JWT] body: { amount, description, category, date }
PUT    /api/admin/revenue/:id        [JWT] body: same as POST
DELETE /api/admin/revenue/:id        [JWT]
GET    /api/admin/revenue/summary    [JWT] ?year&month → totals + by-month + by-category
GET    /api/admin/revenue/categories [JWT] → unique category list
```

**All responses follow:**
```json
{ "success": true, "data": { ... }, "message": "OK" }
{ "success": false, "message": "Error description" }
```

---

## Environment Variables (`backend/.env`)

```env
NODE_ENV=development
PORT=5000

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Admin credentials (bootstrapped on first run)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# CORS allowed origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Max upload file size in bytes (default 10 MB)
MAX_FILE_SIZE=10485760
```

---

## Admin Dashboard

### Login
- URL: `/admin/login`
- Default: `admin` / `admin123`
- JWT token stored in `localStorage` as `tooli_token`
- Auto-redirects to `/admin/dashboard` on success

### Dashboard (`/admin/dashboard`)
- **4 KPI cards:** Page Views (30d), Total Revenue, Tool Uses, Active Days
- **Top Pages table** — most visited routes
- **Most Used Tools** — horizontal progress bars
- **Monthly Revenue** summary row

### Analytics (`/admin/analytics`)
- Day range selector: 7 / 30 / 90 days
- **Line chart** — page views per day (Recharts)
- **Horizontal bar chart** — tool usage counts
- **Top Pages table** — path + view count
- Clear all data button (with confirmation)

### Revenue (`/admin/revenue`)
- **Add/Edit form** — amount, description, category (dropdown), date
- **Line chart** — monthly revenue trend
- **Pie chart** — revenue by category
- **Full entries table** — with inline Edit and Delete
- Summary KPIs: Total Revenue, Entry Count, Latest Month

---

## Data Storage (No Database)

### `backend/data/analytics.json`
```json
{
  "pageViews": [
    {
      "id": "uuid",
      "path": "/api/tools/compress-image",
      "method": "POST",
      "ip": "::1",
      "userAgent": "Mozilla/5.0...",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "duration": 245
    }
  ],
  "toolUsage": {
    "compress-image": 42,
    "merge-pdfs": 18
  },
  "dailySummary": []
}
```

### `backend/data/revenue.json`
```json
{
  "entries": [
    {
      "id": "uuid",
      "amount": 150.00,
      "description": "Google AdSense — March",
      "category": "Ads",
      "date": "2024-03-01",
      "createdAt": "2024-03-01T00:00:00.000Z"
    }
  ],
  "categories": ["Ads", "Subscriptions", "Donations"]
}
```

### `backend/data/admin.json`
```json
{
  "username": "admin",
  "passwordHash": "$2b$12$..."
}
```

> **Performance:** Analytics writes are buffered in-memory and flushed to disk every 5 seconds (never blocks request handling). The last 10,000 page views are kept.

---

## Architecture — How to Add MongoDB Later

The **repository pattern** means you only need to replace one file:

```
backend/src/repositories/adapters/
  ├── jsonFileAdapter.js    ← current (swap this out)
  └── mongoAdapter.js       ← create this new file
```

Each adapter must export the same interface:
```js
module.exports = { readJSON, writeJSON, initDataFiles }
```

Then update `backend/src/config/index.js` to select the adapter based on `NODE_ENV` or a flag. **Zero changes needed** in repositories, services, controllers, or routes.

---

## Security

| Feature | Implementation |
|---------|---------------|
| JWT Auth | `jsonwebtoken` — all admin routes protected |
| Password hashing | `bcryptjs` — bcrypt with 12 salt rounds |
| Rate limiting | `express-rate-limit` — tools: 30/min, auth: 5/min, tracking: 20/10s |
| CORS | Whitelist-only (configured in `.env`) |
| Security headers | `helmet` — XSS, CSP, HSTS, etc. |
| File type validation | Multer `fileFilter` — MIME type + extension check |
| Error sanitization | Stack traces hidden in production |
| Temp file cleanup | `finally` blocks delete uploaded files after processing |
| Nodemon ignore | `uploads/*` and `data/*` excluded to prevent ECONNRESET on file writes |

---

## SEO

- Dynamic `<title>`, `<meta description>`, OG tags, Twitter card tags, and `<link rel="canonical">` per page via `useSEO()` hook
- **JSON-LD structured data** — `WebApplication` + `FAQPage` + `BreadcrumbList` schemas on every tool page
- SEO content sections on all 36 built tool pages: about / how-to steps / features / FAQ
- Related Tools section (up to 6) auto-generated in `ToolLayout` — same category prioritised for better internal linking
- Rich SEO footer — 4 descriptive paragraphs + per-category tool listings with tech details
- `frontend/public/robots.txt` — blocks `/admin/` and `/api/` from all crawlers; includes sitemap URL
- `frontend/public/sitemap.xml` — all 77 URLs with `priority` and `changefreq` (homepage 1.0, backend tools 0.9, built tools 0.8, guides/coming-soon 0.7)
- Semantic HTML (`<header>`, `<main>`, `<footer>`, `<nav>`, `<h1>`–`<h3>`)
- Tool keyword arrays for internal search matching
- Open Graph meta tags in `index.html`
- Google Fonts preloaded with `rel="preconnect"`
- React Router with clean URLs (no hash routing)
- Lazy-loaded pages with `React.lazy` + `Suspense`

---

## Scripts

```bash
# From project root (tooli/)
npm run install:all     # Install deps for root + backend + frontend
npm run dev             # Start backend (:5000) + frontend (:5173) concurrently
npm run dev:backend     # Backend only (nodemon)
npm run dev:frontend    # Frontend only (Vite HMR)
npm run build           # Build frontend for production (dist/)
npm start               # Start backend in production mode

# From backend/
npm run dev             # nodemon server.js
npm start               # node server.js

# From frontend/
npm run dev             # Vite dev server
npm run build           # Production build
npm run preview         # Preview production build locally
```

---

## Dependencies

### Backend
```
express            ^4.19.2   — HTTP framework
cors               ^2.8.5    — Cross-origin resource sharing
helmet             ^7.1.0    — Security headers
morgan             ^1.10.0   — HTTP request logger
dotenv             ^16.4.5   — Environment variables
jsonwebtoken       ^9.0.2    — JWT sign + verify
bcryptjs           ^2.4.3    — Password hashing
multer             ^1.4.5    — Multipart file upload
sharp              ^0.33.4   — Image processing (compress/resize/convert)
pdf-lib            ^1.17.1   — PDF manipulation (merge/split/create)
archiver           ^7.0.1    — Create ZIP archives (for PDF split multi-page)
express-rate-limit ^7.3.1    — Request rate limiting
uuid               ^10.0.0   — Unique IDs for analytics entries
nodemon            ^3.1.4    — Dev: auto-restart on file changes
```

### Frontend
```
react              ^18.3.1   — UI library
react-dom          ^18.3.1   — DOM renderer
react-router-dom   ^6.24.0   — Client-side routing
axios              ^1.7.2    — HTTP client with interceptors
recharts           ^2.12.7   — Charts (LineChart, BarChart, PieChart)
qrcode             ^1.5.4    — QR code generation (canvas-based)
vite               ^5.3.4    — Build tool + dev server
tailwindcss        ^3.4.6    — Utility-first CSS
@vitejs/plugin-react ^4.3.1  — React JSX transform for Vite
autoprefixer       ^10.4.19  — CSS vendor prefixes
postcss            ^8.4.39   — CSS processing
```

---

## Key Design Decisions

1. **Repository Pattern** — All data access isolated behind repository interfaces. Services never touch the filesystem or any DB directly. Swap `jsonFileAdapter.js` for a MongoDB adapter with zero changes elsewhere.

2. **Buffered Analytics Writes** — High-frequency page view events are accumulated in a `writeBuffer[]` array and flushed to disk every 5 seconds — preventing I/O bottlenecks on busy endpoints.

3. **In-Memory Cache** — `jsonFileAdapter` caches parsed JSON in a `Map`. Cache is invalidated on every write. Drastically reduces disk reads on hot data.

4. **Vite Proxy** — Frontend `vite.config.js` proxies `/api/*` → `localhost:5000`. No CORS issues in development. Zero config change needed for production.

5. **Lazy Loading** — All page components loaded with `React.lazy()`. Initial bundle is minimal; each page loads on first visit only.

6. **File Cleanup** — All uploaded files are deleted in `finally` blocks after processing. No disk accumulation regardless of success or error.

7. **Frontend-Only Tools** — 30 of 36 built tools run entirely in the browser. Faster, more private, work offline after initial page load.

8. **Web Crypto API** — Password Generator uses `crypto.getRandomValues` (CSPRNG) and Hash Generator uses `crypto.subtle.digest`. No external crypto library needed.

9. **Nodemon Ignore Config** — `uploads/*` and `data/*` are excluded from nodemon's watch list, preventing server restarts (and ECONNRESET errors) triggered by file uploads or analytics flushes.

10. **JSON-LD SEO** — Every tool page injects `WebApplication` and `FAQPage` structured data via `useSEO`. Scripts are cleaned up on unmount to prevent stale schemas accumulating during client-side navigation.

11. **BreadcrumbList via `dangerouslySetInnerHTML`** — Injecting the breadcrumb schema directly in JSX instead of a second `useEffect` avoids timing conflicts with the `useSEO` hook's own JSON-LD injection and ensures the schema is always present on first render.

12. **Auto-detected Related Tools** — `ToolLayout` reads the current URL from `useLocation()` to find the active tool in the `TOOLS` constant — no `toolId` prop required on individual tool pages. Same-category tools are prioritised to strengthen topical relevance signals.

13. **Static `robots.txt` + `sitemap.xml`** — Served as static assets from `frontend/public/`. No backend route needed since all tool URLs are known at build time. Both files are immediately accessible at the domain root in production.
