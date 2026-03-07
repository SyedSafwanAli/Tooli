/**
 * Tool SVG icons + common UI icons.
 * Style: Heroicons-compatible — stroke-based, strokeWidth=1.5, rounded caps/joins.
 * Usage: <CompressImageIcon className="w-8 h-8 text-blue-600" />
 */

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.5',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  'aria-hidden': 'true',
};

// ─── Tool Icons ──────────────────────────────────────────────────────────────

export const CompressImageIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Large photo frame */}
    <rect x="1.5" y="1.5" width="13" height="10" rx="1.5" />
    <circle cx="5" cy="5" r="1" fill="currentColor" stroke="none" />
    <path d="M1.5 8l3-3 3 3 2-2 3 3" />
    {/* Compress arrow */}
    <path d="M10.5 11.5l2.5 2.5" />
    {/* Smaller result frame */}
    <rect x="11" y="13" width="9.5" height="7.5" rx="1.5" strokeOpacity="0.6" />
    <circle cx="13.5" cy="15.5" r="0.8" fill="currentColor" stroke="none" opacity="0.6" />
    <path d="M11 19l2.5-2.5 2 2 1.5-1.5 3 3" strokeOpacity="0.6" />
  </svg>
);

export const ResizeImageIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Image frame */}
    <rect x="3" y="3" width="18" height="14" rx="2" />
    <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
    <path d="M3 12l4-4 4 4 3-3 5 5" />
    {/* Corner resize handles */}
    <path d="M20 17v3h-3" />
    <path d="M20 17l-3 3" strokeOpacity="0.5" />
    <path d="M4 17v3h3" />
    <path d="M4 17l3 3" strokeOpacity="0.5" />
  </svg>
);

export const ConvertImageIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Left: JPG frame */}
    <rect x="1" y="5" width="9" height="7" rx="1.5" />
    <path d="M1 9l2.5-2.5 2 2 2-2 1.5 1.5" />
    {/* Right: PNG frame */}
    <rect x="14" y="5" width="9" height="7" rx="1.5" />
    <path d="M14 9.5l2-2 2 2 2-2 1.5 2" />
    {/* Circular arrows */}
    <path d="M11 8.5c0-1 .4-2 1-2.5" />
    <path d="M13 6l-1-1.5" />
    <path d="M13 11.5c0 1-.4 2-1 2.5" />
    <path d="M11 14l1 1.5" />
  </svg>
);

export const MergePdfIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Doc 1 */}
    <rect x="1" y="2" width="7.5" height="10" rx="1" />
    <path d="M3 5.5h3.5M3 8h5" />
    {/* Doc 2 (offset) */}
    <rect x="2.5" y="4" width="7.5" height="10" rx="1" strokeOpacity="0.45" />
    {/* Arrow → */}
    <path d="M12.5 9h3M15 7l2 2-2 2" />
    {/* Merged doc */}
    <rect x="17" y="3" width="6" height="11" rx="1" />
    <path d="M19 6h2.5M19 8.5h2.5M19 11h2.5" />
  </svg>
);

export const SplitPdfIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Source doc */}
    <rect x="8.5" y="1.5" width="7" height="10" rx="1" />
    <path d="M10.5 4.5h3M10.5 7h4M10.5 9.5h2.5" />
    {/* Scissors */}
    <circle cx="4" cy="14" r="2" />
    <circle cx="4" cy="19" r="2" />
    <path d="M5.7 13.3l10-5" />
    <path d="M5.7 19.7l10-5" />
    {/* Result doc 1 */}
    <rect x="17" y="3" width="6" height="8" rx="1" />
    {/* Result doc 2 */}
    <rect x="17" y="13" width="6" height="8" rx="1" />
  </svg>
);

export const ImageToPdfIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Photo frame */}
    <rect x="1" y="2" width="13" height="10" rx="2" />
    <circle cx="4.5" cy="5.5" r="1.2" fill="currentColor" stroke="none" />
    <path d="M1 9l4-4 3 3 2-2 3 3" />
    {/* PDF document underneath/right */}
    <rect x="11" y="10" width="11" height="12" rx="1.5" />
    <path d="M13.5 14h6M13.5 17h6M13.5 20h3.5" />
    {/* PDF label */}
    <text x="13" y="13.5" fontSize="3.5" fill="currentColor" stroke="none" fontWeight="bold" fontFamily="sans-serif">PDF</text>
  </svg>
);

export const WordCounterIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Document */}
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    {/* Text lines */}
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="15" x2="16" y2="15" />
    <line x1="8" y1="18" x2="12" y2="18" />
    {/* Count badge */}
    <circle cx="18" cy="19" r="4" fill="#2563eb" stroke="none" />
    <text x="18" y="20.5" textAnchor="middle" fontSize="4" fill="white" stroke="none" fontWeight="bold" fontFamily="sans-serif">123</text>
  </svg>
);

export const JsonFormatterIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Left brace */}
    <path d="M7 4C5.5 4 4.5 5 4.5 6v3c0 1.5-1 2-1 2s1 .5 1 2v3c0 1 1 2 2.5 2" />
    {/* Right brace */}
    <path d="M17 4c1.5 0 2.5 1 2.5 2v3c0 1.5 1 2 1 2s-1 .5-1 2v3c0 1-1 2-2.5 2" />
    {/* Indented content lines */}
    <line x1="9" y1="9" x2="13" y2="9" strokeOpacity="0.7" />
    <line x1="9" y1="12" x2="15" y2="12" strokeOpacity="0.7" />
    <line x1="9" y1="15" x2="11.5" y2="15" strokeOpacity="0.7" />
  </svg>
);

export const Base64Icon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Lock body */}
    <rect x="5" y="11" width="14" height="10" rx="2" />
    {/* Lock shackle */}
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    {/* Binary dots / keyhole */}
    <circle cx="12" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
    <line x1="12" y1="17" x2="12" y2="19.5" />
    {/* Binary decoration */}
    <text x="1.5" y="8" fontSize="4.5" fill="currentColor" stroke="none" opacity="0.5" fontFamily="monospace">01</text>
    <text x="17" y="8" fontSize="4.5" fill="currentColor" stroke="none" opacity="0.5" fontFamily="monospace">10</text>
  </svg>
);

export const UrlEncoderIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Chain link 1 */}
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    {/* Chain link 2 */}
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export const PasswordGeneratorIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Shield */}
    <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7L12 2z" />
    {/* Keyhole circle */}
    <circle cx="12" cy="10.5" r="2" />
    {/* Keyhole stem */}
    <line x1="12" y1="12.5" x2="12" y2="15.5" />
    {/* Stars / security indicators */}
    <circle cx="9" cy="15" r="0.5" fill="currentColor" stroke="none" opacity="0.5" />
    <circle cx="12" cy="16.5" r="0.5" fill="currentColor" stroke="none" opacity="0.5" />
    <circle cx="15" cy="15" r="0.5" fill="currentColor" stroke="none" opacity="0.5" />
  </svg>
);

export const ColorConverterIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Palette outline */}
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
    {/* Dividing lines to create color sections */}
    <line x1="12" y1="2" x2="12" y2="12" strokeOpacity="0.4" />
    <line x1="12" y1="12" x2="21.65" y2="14.5" strokeOpacity="0.4" />
    <line x1="12" y1="12" x2="6.34" y2="21" strokeOpacity="0.4" />
    {/* Color dots */}
    <circle cx="12" cy="6" r="1.5" fill="currentColor" stroke="none" opacity="0.8" />
    <circle cx="18" cy="15" r="1.5" fill="currentColor" stroke="none" opacity="0.5" />
    <circle cx="7" cy="17" r="1.5" fill="currentColor" stroke="none" opacity="0.3" />
    {/* Center white hole (palette thumb hole) */}
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const HashGeneratorIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Hash # symbol */}
    {/* Vertical bars */}
    <line x1="9" y1="3" x2="7" y2="21" />
    <line x1="17" y1="3" x2="15" y2="21" />
    {/* Horizontal bars */}
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="3" y1="15" x2="19" y2="15" />
  </svg>
);

export const QrGeneratorIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Top-left position marker */}
    <rect x="2" y="2" width="8" height="8" rx="1" />
    <rect x="4" y="4" width="4" height="4" fill="currentColor" stroke="none" />
    {/* Top-right position marker */}
    <rect x="14" y="2" width="8" height="8" rx="1" />
    <rect x="16" y="4" width="4" height="4" fill="currentColor" stroke="none" />
    {/* Bottom-left position marker */}
    <rect x="2" y="14" width="8" height="8" rx="1" />
    <rect x="4" y="16" width="4" height="4" fill="currentColor" stroke="none" />
    {/* Data cells (bottom-right area) */}
    <rect x="14" y="14" width="3" height="3" fill="currentColor" stroke="none" opacity="0.7" />
    <rect x="19" y="14" width="3" height="3" fill="currentColor" stroke="none" opacity="0.7" />
    <rect x="14" y="19" width="3" height="3" fill="currentColor" stroke="none" opacity="0.7" />
    <rect x="19" y="19" width="3" height="3" fill="currentColor" stroke="none" opacity="0.7" />
  </svg>
);

export const UnitConverterIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Ruler base */}
    <rect x="1" y="9" width="22" height="6" rx="1" />
    {/* Tick marks */}
    <line x1="6" y1="9" x2="6" y2="12" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="18" y1="9" x2="18" y2="12" />
    <line x1="3.5" y1="9" x2="3.5" y2="11" />
    <line x1="9" y1="9" x2="9" y2="11" />
    <line x1="15" y1="9" x2="15" y2="11" />
    <line x1="21" y1="9" x2="21" y2="11" />
    {/* Bidirectional arrow above */}
    <path d="M5 6H19" />
    <path d="M5 6l2-1.5M5 6l2 1.5" />
    <path d="M19 6l-2-1.5M19 6l-2 1.5" />
  </svg>
);

// ─── Common UI Icons ─────────────────────────────────────────────────────────

export const SearchIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...base}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const DownloadIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...base}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const CopyIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...base}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const CheckIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...base}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const UploadIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

export const SparklesIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...base}>
    <path d="M12 2l2 5h5l-4 3 1.5 5L12 12l-4.5 3L9 10 5 7h5z" />
  </svg>
);

export const ArrowRightIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...base}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const ShieldCheckIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...base}>
    <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7L12 2z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

export const ZapIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...base}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export const GlobeIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} {...base}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

// ─── New Tool Icons (Phase 4) ─────────────────────────────────────────────────

export const SlugGeneratorIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* URL-style path with hyphen */}
    <path d="M3 12h18" strokeOpacity="0.25" />
    <path d="M7 19L9 5" />
    <path d="M15 19L17 5" />
    <path d="M10 12h4" />
    <path d="M3 7h5M16 7h5" strokeOpacity="0.4" />
    <path d="M3 17h5M16 17h5" strokeOpacity="0.4" />
  </svg>
);

export const TextCaseConverterIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Large "A" */}
    <path d="M3 18L7.5 6l4.5 12" />
    <path d="M4.8 14h5.4" />
    {/* Small "a" */}
    <path d="M15 11c0-1.7 1-2.5 2.5-2.5S20 9.3 20 11v5" />
    <path d="M15 15.5c0 1.3 1 2 2 2 1.7 0 3-1 3-2.5" />
    {/* Transform arrow */}
    <path d="M13 9.5l-1.5 1.5M13 9.5l-1.5-1.5" strokeOpacity="0.5" />
  </svg>
);

export const LoremIpsumIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Document */}
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    {/* Wavy text lines suggesting latin */}
    <path d="M8 13c.8-.8 1.2 0 2-.8s1.2.8 2 0 1.2-.8 2 0" />
    <line x1="8" y1="16" x2="16" y2="16" strokeOpacity="0.5" />
    <line x1="8" y1="19" x2="13" y2="19" strokeOpacity="0.35" />
  </svg>
);

export const UuidGeneratorIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* UUID segments */}
    <rect x="1" y="9.5" width="4.5" height="5" rx="1" />
    <rect x="7" y="9.5" width="3" height="5" rx="1" />
    <rect x="11.5" y="9.5" width="3" height="5" rx="1" />
    <rect x="16" y="9.5" width="3" height="5" rx="1" />
    <rect x="20.5" y="9.5" width="2.5" height="5" rx="1" />
    {/* Dashes */}
    <line x1="5.8" y1="12" x2="6.7" y2="12" />
    <line x1="10.3" y1="12" x2="11.2" y2="12" />
    <line x1="14.8" y1="12" x2="15.7" y2="12" />
    <line x1="19.3" y1="12" x2="20.2" y2="12" />
    {/* Refresh indicator */}
    <path d="M9 5.5c1.5-2 5-2 6.5 0" />
    <path d="M15.5 5.5l.5-2M15.5 5.5l-2 .3" />
  </svg>
);

export const TimestampConverterIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Clock face */}
    <circle cx="8" cy="15" r="6" />
    <path d="M8 11.5v3.5l2.5 1.5" />
    {/* Calendar */}
    <rect x="13" y="2" width="9" height="8.5" rx="1.5" />
    <line x1="13" y1="5" x2="22" y2="5" />
    <line x1="15.5" y1="2" x2="15.5" y2="4.5" />
    <line x1="19" y1="2" x2="19" y2="4.5" />
    <line x1="15" y1="7.5" x2="15.8" y2="7.5" />
    <line x1="17.5" y1="7.5" x2="18.3" y2="7.5" />
    <line x1="20" y1="7.5" x2="20.8" y2="7.5" />
  </svg>
);

export const HtmlEntityEncoderIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* < bracket */}
    <polyline points="7 8 3 12 7 16" />
    {/* > bracket */}
    <polyline points="17 8 21 12 17 16" />
    {/* & in center */}
    <path d="M12 8.5c-1.2 0-2 .8-2 1.7 0 .7.4 1.2 1.2 1.8l1.3 1.2c.8.8.8 1.7 0 2.5-.5.5-1.2.8-2.5.8" />
    <line x1="10.5" y1="16.5" x2="14" y2="13" strokeOpacity="0.45" />
  </svg>
);

export const UrlParserIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Browser address bar */}
    <rect x="1" y="3" width="22" height="5.5" rx="2" />
    <circle cx="4" cy="5.75" r="1" fill="currentColor" stroke="none" />
    <line x1="6.5" y1="5.75" x2="20" y2="5.75" strokeOpacity="0.35" />
    {/* Magnifier */}
    <circle cx="10" cy="16.5" r="5" />
    <line x1="13.5" y1="20" x2="16.5" y2="23" />
    {/* Key/value dots in lens */}
    <line x1="7.5" y1="16.5" x2="12.5" y2="16.5" strokeOpacity="0.5" />
  </svg>
);

export const JwtDecoderIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Three JWT parts — red, purple, blue */}
    <rect x="1" y="8.5" width="5.5" height="7" rx="1.5" />
    <rect x="9" y="8.5" width="6" height="7" rx="1.5" />
    <rect x="17.5" y="8.5" width="5.5" height="7" rx="1.5" />
    {/* Dots between parts */}
    <circle cx="7.5" cy="12" r="0.75" fill="currentColor" stroke="none" />
    <circle cx="16.5" cy="12" r="0.75" fill="currentColor" stroke="none" />
    {/* Key crown on top */}
    <circle cx="12" cy="4.5" r="2" />
    <line x1="12" y1="6.5" x2="12" y2="8.5" />
    <line x1="10.5" y1="7.5" x2="10.5" y2="8.5" />
    <line x1="13.5" y1="7.5" x2="13.5" y2="8.5" />
  </svg>
);

export const JsonToCsvIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* JSON brace */}
    <path d="M5 4C3.5 4 3 5 3 5.8v2.7c0 1.2-.8 1.5-.8 1.5s.8.3.8 1.5v2.7C3 15 3.5 16 5 16" />
    {/* Arrow → */}
    <line x1="7.5" y1="10" x2="11.5" y2="10" />
    <polyline points="9.5 8 11.5 10 9.5 12" />
    {/* CSV table */}
    <rect x="13" y="4" width="9.5" height="14" rx="1" />
    <line x1="13" y1="8" x2="22.5" y2="8" />
    <line x1="13" y1="12" x2="22.5" y2="12" />
    <line x1="13" y1="16" x2="22.5" y2="16" />
    <line x1="17" y1="4" x2="17" y2="18" />
  </svg>
);

export const RegexTesterIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* /pattern/ slashes */}
    <line x1="4" y1="20" x2="8" y2="4" />
    <line x1="16" y1="20" x2="20" y2="4" />
    {/* Dot-star pattern inside */}
    <circle cx="12" cy="10" r="1.5" fill="currentColor" stroke="none" />
    <path d="M10.5 14c0-1 .7-1.7 1.5-1.7s1.5.7 1.5 1.7v1" strokeOpacity="0.6" />
    {/* Match underline */}
    <path d="M8 22h8" />
  </svg>
);

export const ColorPaletteIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Colour wheel segments */}
    <circle cx="12" cy="12" r="9" />
    {/* Pie slices via arcs — simplified as filled circles at 60deg intervals */}
    <circle cx="12" cy="4.5" r="2" fill="currentColor" stroke="none" opacity="0.9" />
    <circle cx="18.7" cy="8.2" r="2" fill="currentColor" stroke="none" opacity="0.75" />
    <circle cx="18.7" cy="15.8" r="2" fill="currentColor" stroke="none" opacity="0.6" />
    <circle cx="12" cy="19.5" r="2" fill="currentColor" stroke="none" opacity="0.45" />
    <circle cx="5.3" cy="15.8" r="2" fill="currentColor" stroke="none" opacity="0.3" />
    <circle cx="5.3" cy="8.2" r="2" fill="currentColor" stroke="none" opacity="0.15" />
    {/* Centre hole */}
    <circle cx="12" cy="12" r="3.5" fill="white" stroke="currentColor" strokeOpacity="0.3" />
  </svg>
);

// ─── Phase 5 Batch 1 Icons ───────────────────────────────────────────────────

export const CsvToJsonIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* CSV table */}
    <rect x="1.5" y="4" width="9" height="14" rx="1" />
    <line x1="1.5" y1="8" x2="10.5" y2="8" />
    <line x1="1.5" y1="12" x2="10.5" y2="12" />
    <line x1="1.5" y1="16" x2="10.5" y2="16" />
    <line x1="5.5" y1="4" x2="5.5" y2="18" />
    {/* Arrow */}
    <path d="M12 12h2" />
    <path d="M14 12l-1.5-1.5M14 12l-1.5 1.5" />
    {/* JSON brace */}
    <path d="M16.5 6c-1 0-1.5.5-1.5 1.5V11c0 .8-.5 1-1 1 .5 0 1 .2 1 1v3.5c0 1 .5 1.5 1.5 1.5" />
    <path d="M19.5 6c1 0 1.5.5 1.5 1.5V11c0 .8.5 1 1 1-.5 0-1 .2-1 1v3.5c0 1-.5 1.5-1.5 1.5" />
  </svg>
);

export const BinaryConverterIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Binary column */}
    <text x="2" y="9"  fontSize="5" fontFamily="monospace" fill="currentColor" stroke="none">1</text>
    <text x="2" y="14" fontSize="5" fontFamily="monospace" fill="currentColor" stroke="none">0</text>
    <text x="2" y="19" fontSize="5" fontFamily="monospace" fill="currentColor" stroke="none">1</text>
    {/* Hex column */}
    <text x="7.5" y="9"  fontSize="5" fontFamily="monospace" fill="currentColor" stroke="none" opacity="0.7">F</text>
    <text x="7.5" y="14" fontSize="5" fontFamily="monospace" fill="currentColor" stroke="none" opacity="0.7">A</text>
    <text x="7.5" y="19" fontSize="5" fontFamily="monospace" fill="currentColor" stroke="none" opacity="0.7">3</text>
    {/* Arrow */}
    <path d="M15 12h5" />
    <path d="M17.5 9.5l2.5 2.5-2.5 2.5" />
    {/* Base indicator */}
    <text x="13" y="19" fontSize="4" fontFamily="monospace" fill="currentColor" stroke="none" opacity="0.5">16</text>
  </svg>
);

export const RomanNumeralIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* XIV style display */}
    <text x="2.5" y="15" fontSize="9" fontFamily="serif" fill="currentColor" stroke="none" fontWeight="bold">XIV</text>
    {/* Underline */}
    <line x1="2.5" y1="17" x2="22" y2="17" strokeOpacity="0.4" />
    {/* = 14 below */}
    <text x="8" y="22" fontSize="5" fontFamily="monospace" fill="currentColor" stroke="none" opacity="0.6">= 14</text>
  </svg>
);

export const DuplicateLineRemoverIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Lines */}
    <line x1="3" y1="6" x2="15" y2="6" />
    <line x1="3" y1="10" x2="15" y2="10" />
    {/* Duplicate line with strikethrough */}
    <line x1="3" y1="14" x2="15" y2="14" strokeOpacity="0.35" />
    <line x1="2" y1="13" x2="16" y2="15" strokeOpacity="0.7" />
    <line x1="3" y1="18" x2="12" y2="18" />
    {/* X badge */}
    <circle cx="19" cy="14" r="3.5" fill="currentColor" stroke="none" opacity="0.15" />
    <path d="M17.5 12.5l3 3M20.5 12.5l-3 3" strokeOpacity="0.7" strokeWidth="1.2" />
  </svg>
);

export const HtmlToTextIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* HTML tag */}
    <polyline points="4 8 1 12 4 16" />
    <polyline points="10 8 13 12 10 16" />
    <line x1="6" y1="6" x2="8" y2="18" strokeOpacity="0.5" />
    {/* Arrow */}
    <path d="M15 12h3" />
    <path d="M16.5 10.5l2 1.5-2 1.5" />
    {/* Plain text lines */}
    <line x1="19" y1="9" x2="23" y2="9" />
    <line x1="19" y1="12" x2="23" y2="12" />
    <line x1="19" y1="15" x2="21.5" y2="15" />
  </svg>
);

// ─── Phase 5 Batch 2 Icons ───────────────────────────────────────────────────

export const RandomNumberIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Dice face */}
    <rect x="2" y="2" width="15" height="15" rx="2.5" />
    {/* 3 dots diagonal */}
    <circle cx="5.5" cy="5.5" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="9"   cy="9.5" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="13"  cy="13" r="1.2" fill="currentColor" stroke="none" />
    {/* Random squiggle top-right */}
    <path d="M18 5c1 0 2 .5 2 1.5S19 8 19 9s1 1.5 2 1.5" strokeOpacity="0.6" />
  </svg>
);

export const AspectRatioIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Outer frame */}
    <rect x="2" y="4" width="20" height="16" rx="2" />
    {/* 16:9 inner dashed region */}
    <rect x="5" y="7" width="14" height="10" rx="1" strokeDasharray="2.5 1.5" strokeOpacity="0.5" />
    {/* Corner resize arrows */}
    <path d="M5 7l2 0M5 7l0 2" strokeOpacity="0.8" />
    <path d="M19 17l-2 0M19 17l0-2" strokeOpacity="0.8" />
  </svg>
);

export const CountdownTimerIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Clock face */}
    <circle cx="12" cy="13" r="8.5" />
    {/* Hands — pointing to ~11:55 (countdown near zero) */}
    <line x1="12" y1="13" x2="12" y2="7" />
    <line x1="12" y1="13" x2="16" y2="13" />
    {/* Crown / top tick */}
    <path d="M9.5 2.5h5" />
    <line x1="12" y1="2.5" x2="12" y2="4.5" />
  </svg>
);

export const PasswordStrengthIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* Lock body */}
    <rect x="5" y="11" width="14" height="10" rx="2" />
    {/* Lock shackle */}
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    {/* Strength bars inside */}
    <line x1="9"  y1="18.5" x2="9"  y2="17"   strokeWidth="2" strokeOpacity="0.5" />
    <line x1="12" y1="18.5" x2="12" y2="16"   strokeWidth="2" strokeOpacity="0.7" />
    <line x1="15" y1="18.5" x2="15" y2="14.5" strokeWidth="2" />
  </svg>
);

export const UuidValidatorIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} {...base}>
    {/* UUID segments — 8-4-4-4-12 represented as 5 blocks */}
    <rect x="1"  y="9" width="5"   height="6" rx="1" />
    <rect x="7.5" y="9" width="3.5" height="6" rx="1" />
    <rect x="12.5" y="9" width="3.5" height="6" rx="1" />
    <rect x="17.5" y="9" width="5" height="6" rx="1" />
    {/* Checkmark badge */}
    <circle cx="18.5" cy="6" r="3.5" fill="currentColor" stroke="none" opacity="0.15" />
    <path d="M16.5 6l1.5 1.5 2.5-2.5" strokeOpacity="0.9" />
  </svg>
);

// ─── Icon map ─────────────────────────────────────────────────────────────────
// Maps tool.id → SVG icon component.
// Tools not listed here fall back to tool.icon emoji (handled in ToolCard).
export const ICON_MAP = {
  // Original 15
  'compress-image': CompressImageIcon,
  'resize-image': ResizeImageIcon,
  'convert-image': ConvertImageIcon,
  'merge-pdfs': MergePdfIcon,
  'split-pdf': SplitPdfIcon,
  'image-to-pdf': ImageToPdfIcon,
  'word-counter': WordCounterIcon,
  'json-formatter': JsonFormatterIcon,
  'base64': Base64Icon,
  'url-encoder': UrlEncoderIcon,
  'password-generator': PasswordGeneratorIcon,
  'color-converter': ColorConverterIcon,
  'hash-generator': HashGeneratorIcon,
  'qr-generator': QrGeneratorIcon,
  'unit-converter': UnitConverterIcon,
  // Phase 4 — 10 new built tools
  'slug-generator': SlugGeneratorIcon,
  'text-case-converter': TextCaseConverterIcon,
  'lorem-ipsum': LoremIpsumIcon,
  'uuid-generator': UuidGeneratorIcon,
  'timestamp-converter': TimestampConverterIcon,
  'html-entity-encoder': HtmlEntityEncoderIcon,
  'url-parser': UrlParserIcon,
  'jwt-decoder': JwtDecoderIcon,
  'json-to-csv': JsonToCsvIcon,
  'regex-tester': RegexTesterIcon,
  // Phase 5 — Color Palette + Batch 1
  'color-palette':          ColorPaletteIcon,
  'csv-to-json':            CsvToJsonIcon,
  'binary-converter':       BinaryConverterIcon,
  'roman-numeral':          RomanNumeralIcon,
  'duplicate-line-remover': DuplicateLineRemoverIcon,
  'html-to-text':           HtmlToTextIcon,
  // Phase 5 — Batch 2
  'random-number':          RandomNumberIcon,
  'aspect-ratio':           AspectRatioIcon,
  'countdown-timer':        CountdownTimerIcon,
  'password-strength':      PasswordStrengthIcon,
  'uuid-validator':         UuidValidatorIcon,
};
