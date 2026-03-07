import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import ResultActions from '../../components/common/ResultActions';
import Alert from '../../components/common/Alert';
import { CsvToJsonIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli CSV to JSON Converter transforms comma-separated values into a JSON array entirely in your browser. It handles quoted fields, embedded commas, and supports both header-row mode (keys from the first row) and auto-indexed mode (col1, col2...). No file upload — just paste and convert.',
  howTo: [
    'Paste your CSV data into the input field, or click "Load Sample" for a working example.',
    'Toggle "First row as headers" on to use your CSV header row as JSON keys.',
    'The JSON output updates automatically as you type.',
    'Click "Copy JSON" to copy the result or "Download JSON" to save a .json file.',
  ],
  features: [
    'RFC 4180 compliant — handles quoted fields and embedded commas',
    'Header row toggle — use first row as keys or auto-generate col1, col2...',
    'Real-time conversion with row and column stats',
    'Copy to clipboard or download as .json file',
    'Runs entirely in the browser — no upload needed',
    'Handles Windows (CRLF) and Unix (LF) line endings',
  ],
  faq: [
    { q: 'Does it handle commas inside fields?', a: 'Yes. RFC 4180 compliant: fields wrapped in double quotes can contain commas and the parser handles them correctly without splitting the field.' },
    { q: 'What if my CSV has no headers?', a: 'Turn off the "First row as headers" toggle. Columns will be automatically named col1, col2, col3, etc.' },
    { q: 'Can it handle large CSV files?', a: 'The converter works with any size that fits in your browser text area (tens of thousands of rows). For extremely large files, consider splitting them first.' },
  ],
};

const SAMPLE = `name,age,city,email
Alice,28,London,alice@example.com
Bob,34,New York,bob@example.com
Charlie,22,Tokyo,charlie@example.com`;

// RFC 4180 CSV parser (handles quoted fields, embedded commas, CRLF/LF)
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const n = text.length;

  for (let i = 0; i <= n; i++) {
    const ch = i < n ? text[i] : '\n'; // sentinel

    if (inQuotes) {
      if (ch === '"' && i + 1 < n && text[i + 1] === '"') {
        field += '"'; i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(field); field = '';
      } else if (ch === '\n') {
        row.push(field); field = '';
        if (row.length > 1 || row[0] !== '') rows.push(row);
        row = [];
      } else if (ch === '\r') {
        // skip — next char will be \n
      } else {
        field += ch;
      }
    }
  }
  return rows;
}

export default function CsvToJson() {
  const [csv, setCsv] = useState('');
  const [hasHeaders, setHasHeaders] = useState(true);
  const [copied, setCopied] = useState(false);

  useSEO({
    title: 'CSV to JSON Converter',
    description: 'Convert CSV to JSON online for free. Paste your CSV data and get a clean JSON array instantly. Handles headers, quoted fields, and embedded commas.',
    keywords: ['csv to json', 'csv converter', 'parse csv', 'csv to json array', 'csv parser online'],
    jsonLd: [
      buildToolSchema({ name: 'CSV to JSON Converter', description: 'Convert CSV data to JSON array online', url: '/tools/csv-to-json' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/csv-to-json',
  });

  const { json, rows, cols, error } = useMemo(() => {
    if (!csv.trim()) return { json: '', rows: 0, cols: 0, error: null };
    try {
      const parsed = parseCSV(csv.trim());
      if (parsed.length === 0) return { json: '[]', rows: 0, cols: 0, error: null };

      const headers = hasHeaders ? parsed[0] : null;
      const dataRows = hasHeaders ? parsed.slice(1) : parsed;
      const numCols = parsed[0].length;

      const result = dataRows.map(row => {
        const obj = {};
        for (let i = 0; i < numCols; i++) {
          const key = headers ? (headers[i] || `col${i + 1}`) : `col${i + 1}`;
          obj[key] = row[i] ?? '';
        }
        return obj;
      });

      return {
        json: JSON.stringify(result, null, 2),
        rows: dataRows.length,
        cols: numCols,
        error: null,
      };
    } catch (e) {
      return { json: '', rows: 0, cols: 0, error: e.message };
    }
  }, [csv, hasHeaders]);

  const handleCopy = async () => {
    if (!json) return;
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!json) return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout
      title="CSV to JSON Converter"
      description="Convert CSV data to a JSON array instantly. Handles headers, quoted fields, and embedded commas."
      icon={<CsvToJsonIcon className="w-6 h-6" />}
      category="Developer"
      seoContent={seoContent}
    >
      <div className="card space-y-4">
        {/* Options row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <div
              onClick={() => setHasHeaders(h => !h)}
              className={`relative w-10 h-6 rounded-full transition-colors ${hasHeaders ? 'bg-purple-600' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${hasHeaders ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">First row as headers</span>
          </label>
          <button
            onClick={() => setCsv(SAMPLE)}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600 font-medium transition-colors"
          >
            Load Sample
          </button>
        </div>

        {/* Input */}
        <div>
          <label className="label">CSV Input</label>
          <textarea
            className="input resize-none font-mono text-sm"
            rows={7}
            value={csv}
            onChange={e => setCsv(e.target.value)}
            placeholder="Paste your CSV data here…"
          />
        </div>
      </div>

      {error && <Alert type="error" message={`Parse error: ${error}`} />}

      {json && !error && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900 text-sm">JSON Output</h3>
              <span className="text-xs text-gray-400">{rows} rows · {cols} columns</span>
            </div>
            <ResultActions
              onDownload={handleDownload}
              downloadLabel="Download .json"
              copyText={json}
            />
          </div>
          <pre className="text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl p-4 overflow-auto max-h-80 text-gray-700 leading-relaxed">
            {json}
          </pre>
        </div>
      )}

      {!csv && (
        <p className="text-xs text-gray-400 text-center py-2">Paste CSV data above to see the JSON output.</p>
      )}
    </ToolLayout>
  );
}
