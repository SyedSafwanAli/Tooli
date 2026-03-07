import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import Alert from '../../components/common/Alert';
import { RegexTesterIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Regex Tester lets you write and test JavaScript regular expressions against sample text in real time. It highlights all matches inline, lists each match with its character position and captured groups, and provides clear error messages for invalid patterns — all without leaving your browser.',
  howTo: [
    'Enter your regular expression pattern in the Pattern field (without the surrounding slashes).',
    'Select the flags you need: g (find all matches), i (ignore case), m (multiline), s (dotAll).',
    'Paste or type your test string in the large text area below.',
    'All matches are highlighted instantly — yellow for matches, with group details listed below.',
  ],
  features: [
    'Real-time matching as you type',
    'Inline match highlighting with yellow background',
    'Supports g, i, m, s flags',
    'Shows match count, position (index), and matched text',
    'Displays numbered capture groups for each match',
    'Named capture group support ((?<name>...))',
    'Clear error messages for invalid patterns',
    'JavaScript (ECMAScript) regex engine',
  ],
  faq: [
    { q: 'What regex flavour is used?', a: 'This tester uses JavaScript\'s built-in ECMAScript RegExp engine. It supports all standard constructs: character classes ([a-z]), quantifiers (*, +, ?, {n,m}), groups ((?:...), (?=...), (?<!...)), and backreferences (\\1).' },
    { q: 'What does the "g" flag do?', a: 'The "g" (global) flag makes the engine find all matches in the test string rather than stopping after the first. For most use cases — especially when you want to count or highlight all occurrences — you should enable the global flag.' },
    { q: 'Can I test named capture groups?', a: 'Yes. JavaScript supports named capture groups with the (?<name>...) syntax. Matched named groups appear in the results below each match.' },
    { q: 'Why are my matches not highlighted?', a: 'Make sure the global flag (g) is enabled if you expect multiple matches, and that your pattern does not contain syntax errors (shown in the error banner). Also check that your test string is not empty.' },
  ],
};

const FLAGS = [
  { id: 'g', label: 'g', title: 'Global — find all matches' },
  { id: 'i', label: 'i', title: 'Case-insensitive' },
  { id: 'm', label: 'm', title: 'Multiline — ^ and $ match line boundaries' },
  { id: 's', label: 's', title: 'Dotall — . matches newlines' },
];

const EXAMPLES = [
  { label: 'Email', pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}', flags: new Set(['g', 'i']), test: 'Contact us at hello@example.com or support@tooli.app for help.' },
  { label: 'URL', pattern: 'https?://[^\\s]+', flags: new Set(['g', 'i']), test: 'Visit https://tooli.app and http://example.com for more info.' },
  { label: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: new Set(['g']), test: 'Server IPs: 192.168.1.1, 10.0.0.1, and 255.255.255.0' },
  { label: 'Date', pattern: '\\d{4}[-/]\\d{2}[-/]\\d{2}', flags: new Set(['g']), test: 'Created on 2024-01-15 and updated 2024-03-22' },
];

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState(new Set(['g']));
  const [testString, setTestString] = useState('');

  useSEO({
    title: 'Regex Tester',
    description: 'Test regular expressions online with real-time match highlighting. JavaScript regex tester with group inspection, flags, and named capture groups.',
    keywords: ['regex tester', 'regular expression tester', 'regex checker', 'regexp online', 'regex debugger', 'javascript regex'],
    jsonLd: [
      buildToolSchema({ name: 'Regex Tester', description: 'Test regular expressions online with real-time matching and highlighting', url: '/tools/regex-tester' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/regex-tester',
  });

  const toggleFlag = f => {
    setFlags(prev => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });
  };

  const loadExample = ex => {
    setPattern(ex.pattern);
    setFlags(new Set(ex.flags));
    setTestString(ex.test);
  };

  const { matches, error, highlighted } = useMemo(() => {
    if (!pattern || !testString) return { matches: [], error: null, highlighted: '' };
    try {
      const flagStr = [...flags].join('');
      // Always use global for finding all matches in the list
      const globalFlags = flagStr.includes('g') ? flagStr : flagStr + 'g';
      const re = new RegExp(pattern, globalFlags);
      const matchList = [];
      let m;
      while ((m = re.exec(testString)) !== null) {
        matchList.push({
          index: m.index,
          value: m[0],
          groups: m.slice(1),
          namedGroups: m.groups || {},
        });
        if (m[0].length === 0) re.lastIndex++; // prevent infinite loop on zero-width match
      }
      // Build highlighted HTML
      let html = '';
      let last = 0;
      const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      for (const match of matchList) {
        html += esc(testString.slice(last, match.index));
        html += `<mark class="bg-yellow-200 rounded-sm">${esc(match.value)}</mark>`;
        last = match.index + match.value.length;
      }
      html += esc(testString.slice(last));
      return { matches: matchList, error: null, highlighted: html };
    } catch (e) {
      return { matches: [], error: e.message, highlighted: '' };
    }
  }, [pattern, flags, testString]);

  return (
    <ToolLayout
      title="Regex Tester"
      description="Test regular expressions with real-time highlighting, match positions, and capture group inspection."
      icon={<RegexTesterIcon className="w-6 h-6" />}
      category="Developer"
      seoContent={seoContent}
    >
      {/* Examples */}
      <div className="card py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 mr-1">Examples:</span>
          {EXAMPLES.map(ex => (
            <button
              key={ex.label}
              onClick={() => loadExample(ex)}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-700 rounded-lg font-medium transition-colors"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card space-y-5">
        {/* Pattern */}
        <div>
          <label className="label">Pattern</label>
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-200 transition-all">
            <span className="text-gray-400 font-mono text-lg select-none">/</span>
            <input
              type="text"
              className="flex-1 bg-transparent outline-none font-mono text-sm text-gray-800 placeholder-gray-300"
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder="e.g. \b[A-Z]\w+"
            />
            <span className="text-gray-400 font-mono text-lg select-none">/</span>
            <span className="text-purple-600 font-mono text-sm font-bold ml-1">{[...flags].join('')}</span>
          </div>
        </div>

        {/* Flags */}
        <div>
          <label className="label">Flags</label>
          <div className="flex gap-2 flex-wrap">
            {FLAGS.map(({ id, label, title }) => (
              <button
                key={id}
                onClick={() => toggleFlag(id)}
                title={title}
                className={`px-3 py-1.5 rounded-lg border text-sm font-mono font-bold transition-colors ${
                  flags.has(id)
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-gray-200 text-gray-400 hover:border-purple-300'
                }`}
              >
                {label}
                <span className="text-xs font-sans font-normal ml-1.5 opacity-60">{title.split(' — ')[0].split(' (')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Test string */}
        <div>
          <label className="label">Test String</label>
          <textarea
            className="input resize-none font-mono text-sm"
            rows={6}
            value={testString}
            onChange={e => setTestString(e.target.value)}
            placeholder="Paste your test string here…"
          />
        </div>
      </div>

      {error && <Alert type="error" message={`Pattern error: ${error}`} />}

      {!error && pattern && testString && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">
              {matches.length === 0
                ? 'No matches found'
                : `${matches.length} match${matches.length !== 1 ? 'es' : ''} found`
              }
            </h3>
          </div>

          {matches.length > 0 && (
            <>
              {/* Highlighted */}
              <div
                className="font-mono text-sm bg-gray-50 border border-gray-200 rounded-xl p-4 whitespace-pre-wrap leading-relaxed break-all"
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
              {/* Match list */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {matches.map((m, i) => (
                  <div key={i} className="text-xs bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 flex items-start gap-2">
                    <span className="text-yellow-600 font-bold shrink-0">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-500">pos {m.index}: </span>
                      <code className="font-mono text-gray-800 font-semibold">"{m.value}"</code>
                      {m.groups.filter(Boolean).length > 0 && (
                        <span className="text-purple-600 ml-2">
                          groups: [{m.groups.map(g => `"${g ?? 'undefined'}"`).join(', ')}]
                        </span>
                      )}
                      {Object.keys(m.namedGroups).length > 0 && (
                        <span className="text-blue-600 ml-2">
                          {Object.entries(m.namedGroups).map(([k, v]) => `${k}="${v}"`).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
