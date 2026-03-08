import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import ResultActions from '../../components/common/ResultActions';
import { EmailExtractorIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Email Extractor scans any block of text or HTML and pulls out all valid email addresses. Results are deduplicated and sorted. Useful for extracting contacts from web pages, CSV files, or long documents. All processing runs in your browser — no text is sent to a server.',
  howTo: [
    'Paste any text, HTML, or document content into the input area.',
    'Email addresses are extracted and deduplicated instantly.',
    'Use the copy button to copy all found emails to your clipboard.',
    'Click Clear to reset and start a new extraction.',
  ],
  features: [
    'Extracts all RFC 5322-compatible email addresses',
    'Automatic deduplication — each address listed once',
    'Results sorted alphabetically',
    'Count badge showing total emails found',
    'Copy all extracted emails with one click',
    '100% client-side — text never leaves your browser',
  ],
  faq: [
    { q: 'What text formats can I paste?', a: 'Any plain text, HTML source, CSV, or document content. The extractor searches for email patterns regardless of surrounding markup.' },
    { q: 'Are duplicate emails removed?', a: 'Yes. The tool deduplicates results so each unique email address appears exactly once in the output.' },
    { q: 'Does it find emails inside HTML attributes?', a: 'Yes. The regex scans the full raw text including HTML attribute values, so emails in mailto: links and data attributes are found.' },
  ],
};

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const SAMPLE = `Hello John,

Please reach out to alice@example.com or bob.smith@company.org for support.
You can also contact ADMIN@WEBSITE.COM or info+newsletter@domain.co.uk.

Regards,
carol@test.net`;

export default function EmailExtractor() {
  const [input, setInput] = useState('');

  useSEO({
    title: 'Email Extractor',
    description: 'Extract all email addresses from any text or HTML. Instant deduplication and copy. Free, browser-based email extractor.',
    keywords: ['email extractor', 'extract emails from text', 'email address finder', 'pull emails from text', 'email scraper'],
    jsonLd: [
      buildToolSchema({ name: 'Email Extractor', description: 'Extract and deduplicate email addresses from any text or HTML', url: '/tools/email-extractor' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/email-extractor',
  });

  const emails = useMemo(() => {
    if (!input.trim()) return [];
    const matches = input.match(EMAIL_REGEX) || [];
    const unique = [...new Set(matches.map(e => e.toLowerCase()))];
    return unique.sort();
  }, [input]);

  const copyText = emails.join('\n');

  return (
    <ToolLayout
      title="Email Extractor"
      description="Extract and deduplicate all email addresses from any block of text or HTML instantly."
      icon={<EmailExtractorIcon className="w-6 h-6" />}
      category="Text"
      seoContent={seoContent}
    >
      <div className="card space-y-4">
        {/* Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label">Paste Text or HTML</label>
            <div className="flex gap-3">
              <button
                onClick={() => setInput(SAMPLE)}
                className="text-xs text-blue-600 hover:underline"
              >
                Load sample
              </button>
              {input && (
                <button
                  onClick={() => setInput('')}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <textarea
            className="input text-sm resize-none"
            rows={7}
            placeholder="Paste text, HTML, CSV, or any content here…"
            value={input}
            onChange={e => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Results */}
        {input.trim() && (
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${emails.length > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                  {emails.length} email{emails.length !== 1 ? 's' : ''} found
                </span>
              </div>
              {emails.length > 0 && (
                <ResultActions copyText={copyText} />
              )}
            </div>

            {emails.length > 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                  {emails.map((email, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 hover:bg-white transition-colors group">
                      <span className="text-sm font-mono text-gray-700">{email}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(email)}
                        className="text-xs text-gray-300 group-hover:text-blue-500 transition-colors ml-2"
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-600 text-center">
                No email addresses found in the pasted text.
              </div>
            )}
          </div>
        )}

        {!input.trim() && (
          <p className="text-xs text-gray-400 text-center py-2">Paste text above to extract email addresses.</p>
        )}
      </div>
    </ToolLayout>
  );
}
