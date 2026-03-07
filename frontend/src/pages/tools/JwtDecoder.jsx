import { useState } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import Alert from '../../components/common/Alert';
import { JwtDecoderIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: [
    'The Tooli JWT Decoder parses JSON Web Tokens and presents the header, payload, and signature as readable JSON. It detects the signing algorithm, highlights the expiration status, and converts the iat, exp, and nbf timestamp claims to human-readable dates.',
    'This tool only decodes — it does not verify the signature. Signature verification requires the secret key or public certificate used to sign the token. Never trust decoded JWT claims in a security context without server-side signature verification.',
  ],
  howTo: [
    'Paste your JWT token into the input field.',
    'Click "Decode JWT" to parse it.',
    'View the decoded header (algorithm + type) and payload (claims) as formatted JSON.',
    'Check the expiration indicator — red means the token is expired, green means it is still valid.',
  ],
  features: [
    'Decodes all three JWT parts: header, payload, signature',
    'Pretty-prints header and payload as formatted JSON',
    'Expiration status indicator (valid / expired)',
    'Converts exp, iat, nbf claims to human-readable dates',
    'Shows signing algorithm from header',
    'Works with RS256, HS256, ES256, and all other JWT algorithms',
    'Zero data sent to any server',
  ],
  faq: [
    { q: 'What is a JWT?', a: 'A JSON Web Token (JWT) is a compact, URL-safe representation of claims transferred between two parties. It has three Base64URL-encoded parts separated by dots: header (algorithm and type), payload (claims), and signature.' },
    { q: 'Does this tool verify the JWT signature?', a: 'No. Verifying the signature requires the secret key (for HMAC algorithms like HS256) or the public key (for RSA/ECDSA algorithms like RS256). This tool only decodes the Base64URL payload for inspection. Always verify signatures on your server.' },
    { q: 'Why is my token showing as expired?', a: 'JWTs contain an "exp" claim with a Unix timestamp. If the current system time is past that timestamp, the token is expired. Expired tokens should be rejected by your API server.' },
    { q: 'What are the common JWT claims?', a: '"sub" (subject — who the token is about), "iss" (issuer), "aud" (audience), "exp" (expiration), "iat" (issued at), "nbf" (not before), and "jti" (JWT ID). These are standardised by RFC 7519. Applications can also add custom claims.' },
  ],
};

function b64urlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (padded.length % 4)) % 4;
  return atob(padded + '='.repeat(pad));
}

function decodeJwt(token) {
  const parts = token.trim().split('.');
  if (parts.length !== 3) throw new Error('Token must have exactly 3 parts separated by dots (header.payload.signature).');
  let header, payload;
  try { header = JSON.parse(b64urlDecode(parts[0])); } catch { throw new Error('Could not decode header — it may not be valid Base64URL JSON.'); }
  try { payload = JSON.parse(b64urlDecode(parts[1])); } catch { throw new Error('Could not decode payload — it may not be valid Base64URL JSON.'); }
  return { header, payload, signature: parts[2] };
}

function formatClaim(key, value) {
  const tsKeys = ['exp', 'iat', 'nbf'];
  if (tsKeys.includes(key) && typeof value === 'number') {
    return `${value}  (${new Date(value * 1000).toLocaleString()})`;
  }
  return String(value);
}

export default function JwtDecoder() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copiedSection, setCopiedSection] = useState(null);

  useSEO({
    title: 'JWT Decoder',
    description: 'Decode JSON Web Tokens (JWT) online. Inspect header and payload, check expiration status, and view all claims. Free, secure, browser-based.',
    keywords: ['jwt decoder', 'jwt parser', 'decode jwt', 'json web token', 'jwt debugger', 'jwt inspector'],
    jsonLd: [
      buildToolSchema({ name: 'JWT Decoder', description: 'Decode and inspect JSON Web Tokens online', url: '/tools/jwt-decoder' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/jwt-decoder',
  });

  const decode = () => {
    setError('');
    setResult(null);
    if (!input.trim()) return;
    try {
      setResult(decodeJwt(input));
    } catch (e) {
      setError(e.message || 'Invalid JWT token.');
    }
  };

  const copySection = async (key, value) => {
    await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 1500);
  };

  const nowSec = Math.floor(Date.now() / 1000);
  const isExpired = result?.payload?.exp !== undefined && result.payload.exp < nowSec;
  const expDate = result?.payload?.exp ? new Date(result.payload.exp * 1000).toLocaleString() : null;
  const iatDate = result?.payload?.iat ? new Date(result.payload.iat * 1000).toLocaleString() : null;

  const PART_COLORS = {
    header:    { dot: 'bg-red-400',    label: 'Header', border: 'border-red-100',    bg: 'bg-red-50' },
    payload:   { dot: 'bg-purple-400', label: 'Payload', border: 'border-purple-100', bg: 'bg-purple-50' },
    signature: { dot: 'bg-blue-400',   label: 'Signature', border: 'border-blue-100', bg: 'bg-blue-50' },
  };

  return (
    <ToolLayout
      title="JWT Decoder"
      description="Decode JSON Web Tokens and inspect their header, payload, and expiration status."
      icon={<JwtDecoderIcon className="w-6 h-6" />}
      category="Developer"
      seoContent={seoContent}
    >
      <Alert
        type="warning"
        message="Security note: This tool only decodes — it does not verify the JWT signature. Never trust decoded claims without proper server-side signature verification."
      />

      <div className="card space-y-4">
        <div>
          <label className="label">JWT Token</label>
          <textarea
            className="input resize-none font-mono text-xs leading-relaxed"
            rows={5}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
          />
        </div>
        <button
          onClick={decode}
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
        >
          Decode JWT
        </button>
      </div>

      {error && <Alert type="error" message={error} />}

      {result && (
        <div className="space-y-4">
          {/* Expiration status */}
          {expDate && (
            <div className={`card border-2 ${isExpired ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
              <div className="flex items-center gap-2">
                <span className={`text-lg ${isExpired ? '' : ''}`}>{isExpired ? '✗' : '✓'}</span>
                <div>
                  <p className={`font-bold text-sm ${isExpired ? 'text-red-700' : 'text-green-700'}`}>
                    {isExpired ? 'Token Expired' : 'Token Valid'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Expires: {expDate}{iatDate && ` · Issued: ${iatDate}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header + Payload */}
          {['header', 'payload'].map(key => {
            const config = PART_COLORS[key];
            return (
              <div key={key} className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${config.dot}`} />
                    {config.label}
                    {key === 'header' && result.header.alg && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">
                        {result.header.alg}
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => copySection(key, result[key])}
                    className="text-xs text-gray-400 hover:text-purple-600 transition-colors"
                  >
                    {copiedSection === key ? '✓ Copied' : 'Copy JSON'}
                  </button>
                </div>
                <pre className="text-xs font-mono bg-gray-50 rounded-xl p-4 overflow-x-auto text-gray-800 leading-relaxed">
                  {JSON.stringify(result[key], null, 2)}
                </pre>
                {/* Human-readable claim table for payload */}
                {key === 'payload' && Object.entries(result.payload).some(([k]) => ['exp','iat','nbf'].includes(k)) && (
                  <div className="mt-3 space-y-1">
                    {Object.entries(result.payload)
                      .filter(([k]) => ['exp','iat','nbf'].includes(k))
                      .map(([k, v]) => (
                        <p key={k} className="text-xs text-gray-500">
                          <code className="font-mono text-purple-600">{k}</code>: {formatClaim(k, v)}
                        </p>
                      ))
                    }
                  </div>
                )}
              </div>
            );
          })}

          {/* Signature */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-blue-400" />
              Signature
            </h3>
            <code className="text-xs font-mono text-gray-400 break-all">{result.signature}</code>
            <p className="text-xs text-gray-400 mt-2">
              Signature verification requires the secret key or public certificate — not possible in the browser.
            </p>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
