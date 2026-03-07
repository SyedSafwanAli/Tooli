/**
 * Tool Guides — SEO-optimised how-to articles linked to each tool.
 *
 * Content model:
 *   id          — unique key
 *   slug        — URL segment e.g. "how-to-compress-images-for-the-web"
 *   title       — <h1> + <title>
 *   description — <meta description>
 *   relatedTool — { id, path, title } — links back to the tool
 *   category    — matches TOOLS category for colour theming
 *   readTime    — minutes estimate
 *   publishedAt — ISO date string
 *   keywords    — string[]
 *   content     — Section[]
 *
 * Section types: 'p' | 'h2' | 'h3' | 'ul' | 'ol' | 'callout' | 'steps' | 'faq' | 'cta'
 */

export const GUIDES = [
  {
    id: 'compress-images-web',
    slug: 'how-to-compress-images-for-the-web',
    title: 'How to Compress Images for the Web',
    description: 'Learn how to reduce image file sizes without losing visible quality. Improve page load speed, Core Web Vitals scores, and reduce bandwidth costs.',
    relatedTool: { id: 'compress-image', path: '/tools/compress-image', title: 'Image Compressor' },
    category: 'Images',
    readTime: 6,
    publishedAt: '2024-03-01',
    keywords: ['compress images', 'reduce image size', 'image optimization', 'web performance', 'jpg compression'],
    content: [
      { type: 'p', text: 'Large images are the single biggest cause of slow web pages. A page that takes 4 seconds to load loses 25% of its visitors before they even see your content. Compressing images is the fastest win available — and it costs nothing.' },
      { type: 'h2', text: 'Why Image Compression Matters' },
      { type: 'p', text: "Google's Core Web Vitals score — which affects your search rankings — depends heavily on Largest Contentful Paint (LCP). LCP measures how quickly the biggest visible element loads, which is almost always an image. Compressing your images can cut LCP by 40–70% on image-heavy pages." },
      { type: 'ul', items: [
        'Faster page load times improve bounce rate and conversions',
        'Lower bandwidth costs for your hosting plan',
        'Better Lighthouse and PageSpeed Insights scores',
        'Improved ranking signals via Core Web Vitals',
        'Faster email delivery when images are attached',
      ]},
      { type: 'h2', text: 'Lossy vs Lossless Compression' },
      { type: 'p', text: 'There are two types of compression. Lossless compression reduces file size without discarding any pixel data — the image looks identical but the file is smaller. Lossy compression removes pixel data that the human eye cannot easily detect, achieving far greater reductions at the cost of a tiny quality drop.' },
      { type: 'callout', variant: 'tip', text: 'For photos and complex images, lossy compression at 75–85% quality typically reduces file size by 50–80% with no perceptible quality loss. For diagrams, screenshots, and logos with flat colours, use lossless PNG compression instead.' },
      { type: 'h2', text: 'Choosing the Right Format' },
      { type: 'ul', items: [
        'JPEG — Best for photographs. Lossy. Widely supported.',
        'PNG — Best for screenshots and logos. Lossless. Larger than JPEG for photos.',
        'WebP — Modern format. 25–35% smaller than JPEG at equivalent quality. Supported by all modern browsers.',
        'AVIF — Newest format. 50% smaller than JPEG. Excellent for modern sites targeting Chrome and Safari 16+.',
      ]},
      { type: 'h2', text: 'Step-by-Step: Compress an Image' },
      { type: 'steps', items: [
        'Open the Image Compressor tool.',
        'Drag your image onto the upload area or click to browse.',
        'Set the Quality slider — start at 80% and lower until you see a visible difference.',
        'Optionally select WebP as the output format for maximum savings.',
        'Click "Compress Image" and download the result.',
        'Compare the before and after file sizes in the preview panel.',
      ]},
      { type: 'h2', text: 'Frequently Asked Questions' },
      { type: 'faq', items: [
        { q: 'What quality setting should I use?', a: 'For most web images, 75–85% is ideal. Hero images and portfolio photos can go up to 90%. Background textures and thumbnails can often go as low as 60–70%.' },
        { q: 'Will the compression reduce visible quality?', a: 'At 70–85%, quality loss is imperceptible to most users. Use the before/after preview in the tool to compare — if you cannot see a difference, the compression is safe to publish.' },
        { q: 'Is my image stored on the server?', a: 'No. The image is processed on the server and the temporary file is deleted immediately after you download the result. Nothing is retained.' },
        { q: 'What is the maximum file size?', a: 'The maximum upload size is 10 MB per image. For larger images, consider pre-resizing before compressing.' },
      ]},
    ],
  },

  {
    id: 'json-formatting-guide',
    slug: 'how-to-format-and-validate-json',
    title: 'How to Format and Validate JSON',
    description: 'Learn how to format minified JSON into readable code, validate JSON syntax, and understand common JSON errors and how to fix them.',
    relatedTool: { id: 'json-formatter', path: '/tools/json-formatter', title: 'JSON Formatter' },
    category: 'Developer',
    readTime: 5,
    publishedAt: '2024-03-05',
    keywords: ['json format', 'json validate', 'json beautify', 'json syntax', 'parse json'],
    content: [
      { type: 'p', text: 'JSON (JavaScript Object Notation) is the universal language of APIs and configuration files. But raw JSON from an API response or a minified config file is a single unbroken line of text — impossible to read or debug. Formatting it is the first step to understanding it.' },
      { type: 'h2', text: 'What is JSON Formatting?' },
      { type: 'p', text: 'Formatting (or "pretty-printing") takes minified JSON and adds indentation and line breaks to make the structure visually clear. The data is identical — only the whitespace changes. Most developers use 2-space or 4-space indentation.' },
      { type: 'callout', variant: 'tip', text: 'The Tooli JSON Formatter automatically validates your JSON as you type. If there is a syntax error, it shows the exact line and character position where the problem occurs.' },
      { type: 'h2', text: 'Common JSON Syntax Errors' },
      { type: 'ul', items: [
        'Trailing commas — JSON does not allow a comma after the last item in an array or object',
        'Single quotes — JSON requires double quotes for all strings and keys',
        'Unquoted keys — { name: "value" } is JavaScript object syntax, not JSON',
        'Comments — JSON has no comment syntax; // and /* */ are invalid',
        'Undefined and NaN — these are JavaScript values and are not valid JSON',
      ]},
      { type: 'h2', text: 'Formatting vs Minifying' },
      { type: 'p', text: 'Minifying removes all whitespace to reduce file size — important for JSON files served over HTTP (e.g. API responses, manifest files). Formatting does the opposite — it adds whitespace for human readability. Both operations produce semantically identical JSON.' },
      { type: 'h2', text: 'Step-by-Step: Format and Validate JSON' },
      { type: 'steps', items: [
        'Open the JSON Formatter tool.',
        'Paste your raw or minified JSON into the input field.',
        'If there are syntax errors, they will be highlighted immediately with the line number.',
        'Fix any errors in the input field.',
        'Switch to the "Formatted" tab to see the pretty-printed output.',
        'Use "Copy" to copy the result, or "Minify" to get a compact version.',
      ]},
      { type: 'h2', text: 'Frequently Asked Questions' },
      { type: 'faq', items: [
        { q: 'Does formatting change the data?', a: 'No. Formatting only changes whitespace (indentation and line breaks). The actual data — keys, values, arrays, objects — is unchanged.' },
        { q: 'What is the difference between JSON and JavaScript objects?', a: 'JSON is a text format — it is always a string. JavaScript objects are in-memory data structures. JSON requires double-quoted keys and has no support for functions, undefined, or comments. JavaScript objects do not have these restrictions.' },
        { q: 'How do I fix "Unexpected token" errors?', a: 'Unexpected token errors are usually caused by trailing commas, single quotes, or unquoted keys. Look at the character position in the error message and check the few characters before and after that position.' },
      ]},
    ],
  },

  {
    id: 'regex-guide',
    slug: 'beginners-guide-to-regular-expressions',
    title: "Beginner's Guide to Regular Expressions",
    description: 'Learn the fundamentals of regular expressions (regex). Understand character classes, quantifiers, anchors, capture groups, and how to test patterns online.',
    relatedTool: { id: 'regex-tester', path: '/tools/regex-tester', title: 'Regex Tester' },
    category: 'Developer',
    readTime: 8,
    publishedAt: '2024-03-10',
    keywords: ['regex tutorial', 'regular expressions', 'regex guide', 'regex cheatsheet', 'regex patterns'],
    content: [
      { type: 'p', text: 'Regular expressions (regex) are patterns used to match character combinations in strings. They are supported in every major programming language and are invaluable for form validation, text parsing, log analysis, and search-and-replace operations.' },
      { type: 'h2', text: 'The Basics: Literal Characters' },
      { type: 'p', text: 'The simplest regex is a literal string. The pattern hello matches the exact sequence of characters "hello". Regex matching is case-sensitive by default — use the i flag to make it case-insensitive.' },
      { type: 'h2', text: 'Character Classes' },
      { type: 'ul', items: [
        '[abc] — matches a, b, or c',
        '[a-z] — matches any lowercase letter',
        '[A-Z0-9] — matches any uppercase letter or digit',
        '[^abc] — matches any character that is NOT a, b, or c',
        '\\d — shorthand for [0-9] (any digit)',
        '\\w — shorthand for [a-zA-Z0-9_] (word character)',
        '\\s — matches any whitespace (space, tab, newline)',
      ]},
      { type: 'h2', text: 'Quantifiers' },
      { type: 'ul', items: [
        '* — zero or more (greedy)',
        '+ — one or more (greedy)',
        '? — zero or one (optional)',
        '{3} — exactly 3 times',
        '{2,5} — between 2 and 5 times',
        '{3,} — 3 or more times',
      ]},
      { type: 'callout', variant: 'tip', text: 'Add ? after a quantifier to make it lazy: .*? matches as few characters as possible. This prevents the common bug where .* matches more than you intended.' },
      { type: 'h2', text: 'Anchors' },
      { type: 'ul', items: [
        '^ — matches the start of the string (or line with the m flag)',
        '$ — matches the end of the string (or line with the m flag)',
        '\\b — word boundary (between \\w and \\W)',
      ]},
      { type: 'h2', text: 'Capture Groups' },
      { type: 'p', text: 'Parentheses create a capture group. The matched text inside each group is extracted separately from the full match. For example, (\\d{4})-(\\d{2})-(\\d{2}) applied to "2024-03-15" captures year "2024", month "03", and day "15" as separate groups.' },
      { type: 'h2', text: 'Common Patterns' },
      { type: 'ul', items: [
        'Email: [a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}',
        'URL: https?://[^\\s]+',
        'Date (YYYY-MM-DD): \\d{4}-\\d{2}-\\d{2}',
        'Phone (US): \\(?\\d{3}\\)?[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{4}',
        'Hex colour: #[0-9a-fA-F]{3,6}',
      ]},
      { type: 'h2', text: 'Frequently Asked Questions' },
      { type: 'faq', items: [
        { q: 'What regex flavour does JavaScript use?', a: 'JavaScript uses the ECMAScript RegExp engine. It supports all standard constructs but lacks some advanced features found in PCRE (like variable-length lookbehinds in older engines). Named capture groups (?<name>...) were added in ES2018.' },
        { q: 'What is the difference between greedy and lazy matching?', a: 'Greedy quantifiers (*, +, {n,m}) match as much as possible. Lazy quantifiers (*?, +?, {n,m}?) match as little as possible. For example, <.+> matches the entire string "<b>text</b>", while <.+?> matches just "<b>".' },
        { q: 'How do I escape special characters?', a: 'The characters . * + ? ^ $ { } [ ] | ( ) \\ have special meaning in regex. To match them literally, prefix with a backslash: \\. matches a literal dot, \\$ matches a literal dollar sign.' },
      ]},
    ],
  },

  {
    id: 'url-slug-seo',
    slug: 'url-slugs-and-seo-best-practices',
    title: 'URL Slugs and SEO Best Practices',
    description: 'Learn what URL slugs are, why they matter for SEO, and how to create clean, keyword-optimised slugs that improve search rankings and click-through rates.',
    relatedTool: { id: 'slug-generator', path: '/tools/slug-generator', title: 'Slug Generator' },
    category: 'Text',
    readTime: 5,
    publishedAt: '2024-03-12',
    keywords: ['url slug', 'seo url', 'permalink', 'url structure', 'seo best practices'],
    content: [
      { type: 'p', text: 'A URL slug is the human-readable part of a URL that identifies a specific page. In the URL https://example.com/blog/best-image-compressor, the slug is "best-image-compressor". It is the part you write — or generate — when creating a new page, article, or product.' },
      { type: 'h2', text: 'Why Slugs Matter for SEO' },
      { type: 'p', text: "Google reads URL slugs to understand what a page is about before it even crawls the content. A descriptive slug like /free-online-json-formatter tells Google and users exactly what the page contains. A generic slug like /page?id=487 provides no information at all." },
      { type: 'ul', items: [
        'Keyword-rich slugs improve relevance signals for search engines',
        'Clean, readable URLs improve click-through rate in search results',
        'Short slugs are easier to share and remember',
        'Consistent slug format helps search engines understand your site structure',
      ]},
      { type: 'h2', text: 'Slug Best Practices' },
      { type: 'ul', items: [
        'Use hyphens to separate words — search engines treat hyphens as word separators',
        'Use only lowercase letters — avoid uppercase to prevent duplicate URL issues',
        'Remove stop words (the, a, an, and, of) if they add no meaning',
        'Keep slugs under 60 characters where possible',
        'Replace accented characters with ASCII equivalents (café → cafe)',
        'Never use underscores in web URLs (Google treats _ as a word joiner, not separator)',
        'Avoid special characters — they require percent-encoding and look ugly in links',
      ]},
      { type: 'callout', variant: 'tip', text: 'Once a slug is live and indexed, avoid changing it. If you must rename a URL, set up a 301 permanent redirect from the old slug to the new one to preserve search ranking.' },
      { type: 'h2', text: 'Hyphens vs Underscores' },
      { type: 'p', text: 'Google officially recommends hyphens for web URLs. The reason: search engines treat hyphens as word boundaries. "best-image-compressor" is read as three separate words. "best_image_compressor" is treated as one compound token by some crawlers, which can reduce keyword matching.' },
      { type: 'h2', text: 'Frequently Asked Questions' },
      { type: 'faq', items: [
        { q: 'Should I include keywords in my URL slug?', a: 'Yes — include 1–3 primary keywords that describe the page content. Avoid keyword stuffing. /best-free-online-image-compressor-tool-download is too long; /image-compressor is better.' },
        { q: 'Does URL length affect SEO?', a: 'Not directly, but shorter URLs are easier to share and read. Google does not penalise longer URLs, but usability studies show users prefer shorter ones in search results.' },
        { q: 'Should I include the year in blog slugs?', a: 'Avoid years unless the content is time-specific. A slug like /how-to-compress-images stays evergreen, while /how-to-compress-images-2024 becomes outdated and requires a redirect next year.' },
      ]},
    ],
  },

  {
    id: 'password-security',
    slug: 'how-to-create-strong-passwords',
    title: 'How to Create Strong Passwords',
    description: 'Learn what makes a password strong, how password cracking works, and how to generate and manage secure passwords for every account.',
    relatedTool: { id: 'password-generator', path: '/tools/password-generator', title: 'Password Generator' },
    category: 'Security',
    readTime: 6,
    publishedAt: '2024-03-15',
    keywords: ['strong password', 'password security', 'password generator', 'password tips', 'account security'],
    content: [
      { type: 'p', text: "81% of data breaches are caused by weak or reused passwords. Creating a unique, strong password for every account is the single most effective step you can take to protect your online identity — and it costs nothing." },
      { type: 'h2', text: 'What Makes a Password Strong?' },
      { type: 'ul', items: [
        'Length — each additional character exponentially increases cracking difficulty',
        'Randomness — avoid dictionary words, names, and keyboard patterns (qwerty, 123456)',
        'Character diversity — mix uppercase, lowercase, numbers, and symbols',
        'Uniqueness — never reuse a password across multiple accounts',
      ]},
      { type: 'callout', variant: 'warning', text: 'A 6-character lowercase password can be cracked in under a second. A 16-character random password using all character types would take billions of years with current hardware.' },
      { type: 'h2', text: 'Password Length vs Complexity' },
      { type: 'p', text: "Length matters more than complexity. A 20-character password of random lowercase letters is far harder to crack than an 8-character password with symbols. The NIST (National Institute of Standards and Technology) recommends a minimum length of 15 characters for user-created passwords." },
      { type: 'h2', text: 'How Password Cracking Works' },
      { type: 'ul', items: [
        'Dictionary attacks — try common words and known leaked passwords',
        'Brute force — try every combination of characters (slow but exhaustive)',
        'Credential stuffing — use leaked username/password pairs from other breaches',
        'Rainbow tables — pre-computed hash lookups (defeated by password salting)',
      ]},
      { type: 'h2', text: 'Best Practices for Password Management' },
      { type: 'ul', items: [
        'Use a password manager (1Password, Bitwarden, KeePass) to generate and store unique passwords',
        'Enable two-factor authentication (2FA) on every account that supports it',
        'Never share passwords — not even with technical support staff',
        'Change passwords immediately if you suspect a breach',
        'Check haveibeenpwned.com to see if your email has appeared in known breaches',
      ]},
      { type: 'h2', text: 'Frequently Asked Questions' },
      { type: 'faq', items: [
        { q: 'How long should a password be?', a: 'At least 16 characters for standard accounts. For financial or medical accounts, use 20+ characters. If the service supports passphrases, a random 5-word phrase is both long and memorable.' },
        { q: 'Is it safe to use an online password generator?', a: 'Yes, as long as the generator runs in your browser (client-side) and never sends the generated password to a server. The Tooli Password Generator uses the Web Crypto API — all generation happens in your browser, nothing is transmitted.' },
        { q: 'Should I change my passwords regularly?', a: "NIST updated its guidance in 2017 to say you should NOT change passwords on a regular schedule unless there is a known breach. Forced periodic changes encourage weaker passwords. Change passwords when compromised, not on a timer." },
      ]},
    ],
  },
];

// Sorted by publishedAt descending for the guides listing page
export const GUIDES_SORTED = [...GUIDES].sort(
  (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt),
);
