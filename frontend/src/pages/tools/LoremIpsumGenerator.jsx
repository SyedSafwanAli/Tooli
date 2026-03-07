import { useState } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { LoremIpsumIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const PARAGRAPHS = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt.',
  'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt.',
  'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.',
  'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet.',
  'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti.',
  'Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Et harum quidem rerum facilis est et expedita distinctio nam libero tempore soluta nobis eligendi optio cumque.',
  'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus ut aut reiciendis voluptatibus maiores alias consequatur.',
];

const ALL_WORDS = PARAGRAPHS.join(' ').split(/\s+/);
const ALL_SENTENCES = PARAGRAPHS.flatMap(p =>
  p.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean)
);

function generate(type, count) {
  if (type === 'paragraphs') {
    return Array.from({ length: count }, (_, i) => PARAGRAPHS[i % PARAGRAPHS.length]).join('\n\n');
  }
  if (type === 'sentences') {
    return Array.from({ length: count }, (_, i) => ALL_SENTENCES[i % ALL_SENTENCES.length]).join(' ');
  }
  // words
  return Array.from({ length: count }, (_, i) => ALL_WORDS[i % ALL_WORDS.length]).join(' ');
}

const LIMITS = {
  paragraphs: { min: 1, max: 20, default: 3 },
  sentences:  { min: 1, max: 50, default: 10 },
  words:      { min: 10, max: 500, default: 100 },
};

const seoContent = {
  about: [
    'The Tooli Lorem Ipsum Generator produces classic placeholder text in three formats: full paragraphs, individual sentences, or raw word counts. Use it to populate wireframes, test typography, and demonstrate page layouts before real content is ready.',
    'The text is derived from Cicero\'s "de Finibus Bonorum et Malorum" (45 BC) — the same passage that has been used as standard filler since the 1500s when an unknown printer scrambled it to make a type specimen book.',
  ],
  howTo: [
    'Select a type: Paragraphs, Sentences, or Words.',
    'Enter the count using the number field (or use the preset buttons).',
    'Click "Generate" to produce the placeholder text.',
    'Click "Copy All" to copy the entire output to your clipboard.',
  ],
  features: [
    '1–20 paragraphs, 1–50 sentences, or 10–500 words',
    'Classic Lorem Ipsum base text (Cicero, 45 BC)',
    'Generates proper paragraph blocks with line breaks',
    'One-click copy to clipboard',
    'Character count shown in output',
    'Runs entirely in your browser — no server calls',
  ],
  faq: [
    { q: 'What is Lorem Ipsum?', a: 'Lorem Ipsum is placeholder text derived from "de Finibus Bonorum et Malorum" by Cicero (45 BC). It has been used since the 1500s when an unknown printer scrambled it to make a type specimen book. It is the industry standard for mock content.' },
    { q: 'Why use Lorem Ipsum instead of real text?', a: 'Placeholder text prevents reviewers from focusing on content rather than design. Since Lorem Ipsum resembles Latin, it is clearly fake, helping stakeholders evaluate typography and layout without reading the copy.' },
    { q: 'Is Lorem Ipsum copyrighted?', a: 'No. The original text by Cicero is over 2,000 years old and is in the public domain. The Lorem Ipsum scrambling is a derivative work also in the public domain.' },
  ],
};

export default function LoremIpsumGenerator() {
  const [type, setType] = useState('paragraphs');
  const [count, setCount] = useState(LIMITS.paragraphs.default);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  useSEO({
    title: 'Lorem Ipsum Generator',
    description: 'Generate Lorem Ipsum placeholder text — paragraphs, sentences, or words. Free, instant, classic Cicero text.',
    keywords: ['lorem ipsum generator', 'placeholder text', 'dummy text', 'filler text', 'blind text', 'lorem ipsum'],
    jsonLd: [
      buildToolSchema({ name: 'Lorem Ipsum Generator', description: 'Generate Lorem Ipsum placeholder text online', url: '/tools/lorem-ipsum' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/lorem-ipsum',
  });

  const lim = LIMITS[type];

  const handleTypeChange = (t) => {
    setType(t);
    setCount(LIMITS[t].default);
    setOutput('');
  };

  const handleGenerate = () => {
    const clamped = Math.min(lim.max, Math.max(lim.min, count));
    setOutput(generate(type, clamped));
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="Lorem Ipsum Generator"
      description="Generate Lorem Ipsum placeholder text for your wireframes, designs, and prototypes."
      icon={<LoremIpsumIcon className="w-6 h-6" />}
      category="Text"
      seoContent={seoContent}
    >
      <div className="card space-y-5">
        {/* Type toggle */}
        <div>
          <label className="label">Type</label>
          <div className="flex gap-2">
            {Object.keys(LIMITS).map(t => (
              <button
                key={t}
                onClick={() => handleTypeChange(t)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold capitalize transition-colors ${
                  type === t
                    ? 'border-green-600 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-600 hover:border-green-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Count + presets */}
        <div>
          <label className="label">
            Count <span className="text-gray-400 font-normal">({lim.min}–{lim.max})</span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              className="input w-28"
              value={count}
              min={lim.min}
              max={lim.max}
              onChange={e => setCount(+e.target.value)}
            />
            <div className="flex gap-2">
              {[lim.min, lim.default, Math.floor(lim.max / 2), lim.max].filter((v, i, a) => a.indexOf(v) === i).map(v => (
                <button
                  key={v}
                  onClick={() => setCount(v)}
                  className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                    count === v ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-green-300'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
        >
          Generate Lorem Ipsum
        </button>
      </div>

      {output && (
        <div className="card space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">{output.length.toLocaleString()} characters</span>
            <button onClick={copy} className="text-sm font-semibold text-green-600 hover:text-green-800">
              {copied ? '✓ Copied' : 'Copy All'}
            </button>
          </div>
          <textarea
            readOnly
            className="input resize-none text-sm text-gray-700 leading-relaxed bg-gray-50"
            rows={14}
            value={output}
          />
        </div>
      )}
    </ToolLayout>
  );
}
