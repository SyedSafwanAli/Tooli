import { useState } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import Alert from '../../components/common/Alert';
import { JsonToCsvIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli JSON to CSV Converter transforms a JSON array of objects into a properly formatted CSV file ready for import into Excel, Google Sheets, or any spreadsheet application. It automatically detects all column headers across all objects, properly escapes values containing commas or quotes, and lets you download the result as a .csv file.',
  howTo: [
    'Paste a JSON array of objects into the input box (e.g. [{"name":"Alice","age":30}]).',
    'Click "Convert to CSV" to generate the output.',
    'Review the CSV preview in the output area.',
    'Click "Download CSV" to save the file to your computer.',
  ],
  features: [
    'Automatically extracts column headers from all JSON keys',
    'Handles arrays with inconsistent keys across objects',
    'Properly quotes values containing commas, quotes, or newlines',
    'Stringifies nested objects and arrays into cells',
    'Shows row and column count after conversion',
    'One-click CSV download',
    'Runs entirely in your browser — no server upload required',
  ],
  faq: [
    { q: 'What JSON format is supported?', a: 'The input must be a JSON array of objects: [{"key":"value"}, ...]. Each object becomes a row. Keys from all objects are merged to create the column headers — missing values are left empty.' },
    { q: 'What happens with nested objects or arrays?', a: 'Nested objects and arrays are JSON-stringified and placed in the cell as a string. For example, {"tags":["a","b"]} becomes the cell value ["a","b"]. Flatten your JSON first if you need nested keys as separate columns.' },
    { q: 'Can I open the CSV in Excel?', a: 'Yes. The downloaded file uses UTF-8 encoding and standard CSV formatting (RFC 4180). Excel, Google Sheets, LibreOffice Calc, and most other spreadsheet applications can open it directly.' },
    { q: 'How are commas and quotes in values handled?', a: 'Values containing commas, double quotes, or newlines are wrapped in double quotes, and any internal double quotes are escaped by doubling them — following the RFC 4180 CSV standard.' },
  ],
};

function jsonToCsv(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Input must be a non-empty JSON array.');
  }
  if (data.some(item => typeof item !== 'object' || item === null || Array.isArray(item))) {
    throw new Error('Each item in the array must be a plain object (not null or an array).');
  }
  const headers = [...new Set(data.flatMap(row => Object.keys(row)))];
  const escape = val => {
    if (val === null || val === undefined) return '';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const rows = data.map(row => headers.map(h => escape(row[h])).join(','));
  return { csv: [headers.join(','), ...rows].join('\n'), rows: data.length, cols: headers.length };
}

const SAMPLE = JSON.stringify([
  { name: 'Alice', age: 30, city: 'London', role: 'Engineer' },
  { name: 'Bob', age: 25, city: 'Paris', role: 'Designer' },
  { name: 'Carol', age: 35, city: 'Berlin', role: 'Manager' },
], null, 2);

export default function JsonToCsv() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useSEO({
    title: 'JSON to CSV Converter',
    description: 'Convert JSON array to CSV online. Export JSON data to spreadsheet-ready CSV. Free, instant, browser-based JSON CSV converter.',
    keywords: ['json to csv', 'convert json to csv', 'json csv converter', 'export json', 'json to spreadsheet', 'json to excel'],
    jsonLd: [
      buildToolSchema({ name: 'JSON to CSV Converter', description: 'Convert JSON arrays to CSV format online for free', url: '/tools/json-to-csv' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/json-to-csv',
  });

  const convert = () => {
    setError('');
    setOutput('');
    setStats(null);
    try {
      const data = JSON.parse(input);
      const { csv, rows, cols } = jsonToCsv(data);
      setOutput(csv);
      setStats({ rows, cols });
    } catch (e) {
      setError(e.message || 'Invalid JSON input.');
    }
  };

  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout
      title="JSON to CSV Converter"
      description="Convert a JSON array of objects to a properly formatted CSV file — ready for Excel and Google Sheets."
      icon={<JsonToCsvIcon className="w-6 h-6" />}
      category="Developer"
      seoContent={seoContent}
    >
      <div className="card space-y-4">
        <div className="flex justify-between items-center">
          <label className="label mb-0">JSON Input (array of objects)</label>
          <button
            onClick={() => setInput(SAMPLE)}
            className="text-xs text-purple-600 hover:text-purple-800 font-medium"
          >
            Load sample
          </button>
        </div>
        <textarea
          className="input resize-none font-mono text-sm"
          rows={10}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder='[{"name":"Alice","age":30},{"name":"Bob","age":25}]'
        />
        <button
          onClick={convert}
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
        >
          Convert to CSV
        </button>
      </div>

      {error && <Alert type="error" message={error} />}

      {output && (
        <div className="card space-y-4">
          {stats && (
            <div className="flex gap-4 text-sm">
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold text-xs">
                {stats.rows} row{stats.rows !== 1 ? 's' : ''}
              </span>
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold text-xs">
                {stats.cols} column{stats.cols !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          <textarea
            readOnly
            className="input resize-none font-mono text-xs bg-gray-50"
            rows={10}
            value={output}
          />
          <button
            onClick={download}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
          >
            Download CSV File
          </button>
        </div>
      )}
    </ToolLayout>
  );
}
