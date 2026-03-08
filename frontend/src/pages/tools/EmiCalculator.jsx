import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import ResultActions from '../../components/common/ResultActions';
import { EmiCalculatorIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli EMI / Loan Calculator computes your Equated Monthly Installment (EMI), total interest payable, and total repayment amount for any loan. It also generates a full amortization schedule showing the principal and interest breakdown for each month.',
  howTo: [
    'Enter the loan principal amount.',
    'Set the annual interest rate (%).',
    'Choose the loan tenure in months or years.',
    'Your EMI, total interest, and full repayment are shown instantly.',
  ],
  features: [
    'EMI calculation using standard compound interest formula',
    'Total interest and total repayment amount',
    'Supports tenure in months or years',
    'Full month-by-month amortization schedule',
    'Interest vs principal pie breakdown',
    '100% client-side — no data sent to server',
  ],
  faq: [
    { q: 'What is EMI?', a: 'EMI (Equated Monthly Installment) is the fixed monthly payment made to repay a loan. Each EMI covers both interest and a portion of the principal.' },
    { q: 'How is EMI calculated?', a: 'EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ − 1), where P = principal, r = monthly interest rate (annual rate ÷ 1200), and n = tenure in months.' },
    { q: 'What happens if I increase the tenure?', a: 'A longer tenure reduces the monthly EMI but increases the total interest paid over the life of the loan.' },
  ],
};

function calcEmi(principal, annualRate, months) {
  if (!principal || !annualRate || !months) return null;
  const r = annualRate / 1200; // monthly rate
  if (r === 0) {
    const emi = principal / months;
    return { emi, totalPayment: principal, totalInterest: 0 };
  }
  const factor = Math.pow(1 + r, months);
  const emi = principal * r * factor / (factor - 1);
  const totalPayment = emi * months;
  const totalInterest = totalPayment - principal;
  return { emi, totalPayment, totalInterest };
}

function buildSchedule(principal, annualRate, months, emi) {
  const r = annualRate / 1200;
  const rows = [];
  let balance = principal;
  for (let m = 1; m <= months; m++) {
    const interest  = balance * r;
    const principalPmt = emi - interest;
    balance -= principalPmt;
    rows.push({
      month: m,
      emi: emi,
      principal: principalPmt,
      interest: interest,
      balance: Math.max(0, balance),
    });
  }
  return rows;
}

const fmt = n => n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export default function EmiCalculator() {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate]           = useState('');
  const [tenure, setTenure]       = useState('');
  const [tenureUnit, setTenureUnit] = useState('years');
  const [showSchedule, setShowSchedule] = useState(false);

  useSEO({
    title: 'EMI / Loan Calculator',
    description: 'Calculate your monthly EMI, total interest, and full loan repayment. Includes amortization schedule. Free, browser-based EMI calculator.',
    keywords: ['emi calculator', 'loan calculator', 'monthly payment calculator', 'amortization calculator', 'home loan emi'],
    jsonLd: [
      buildToolSchema({ name: 'EMI / Loan Calculator', description: 'Calculate EMI, total interest, and amortization schedule for any loan', url: '/tools/emi-calculator' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/emi-calculator',
  });

  const months = tenureUnit === 'years' ? parseFloat(tenure) * 12 : parseFloat(tenure);

  const result = useMemo(() => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const n = months;
    if (!p || !r || !n || p <= 0 || r <= 0 || n <= 0) return null;
    return calcEmi(p, r, Math.round(n));
  }, [principal, rate, months]);

  const schedule = useMemo(() => {
    if (!result) return [];
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const n = Math.round(months);
    return buildSchedule(p, r, n, result.emi);
  }, [result, principal, rate, months]);

  const copyText = result
    ? `EMI: $${fmt(result.emi)}\nTotal Interest: $${fmt(result.totalInterest)}\nTotal Payment: $${fmt(result.totalPayment)}`
    : '';

  const pPct = result ? Math.round((parseFloat(principal) / result.totalPayment) * 100) : 0;
  const iPct = 100 - pPct;

  return (
    <ToolLayout
      title="EMI / Loan Calculator"
      description="Calculate your monthly EMI, total interest payable, and full amortization schedule."
      icon={<EmiCalculatorIcon className="w-6 h-6" />}
      category="Calculator"
      seoContent={seoContent}
    >
      <div className="card space-y-5">
        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Loan Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input type="number" min="0" className="input pl-7" placeholder="e.g. 100000"
                value={principal} onChange={e => setPrincipal(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Annual Interest Rate</label>
            <div className="relative">
              <input type="number" min="0" step="0.01" className="input pr-7" placeholder="e.g. 7.5"
                value={rate} onChange={e => setRate(e.target.value)} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
          </div>
          <div>
            <label className="label">Tenure</label>
            <div className="flex gap-2">
              <input type="number" min="1" className="input flex-1" placeholder="e.g. 5"
                value={tenure} onChange={e => setTenure(e.target.value)} />
              <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
                {['years','months'].map(u => (
                  <button key={u} onClick={() => setTenureUnit(u)}
                    className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${tenureUnit === u ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>
                    {u.charAt(0).toUpperCase() + u.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {result ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-blue-700">${fmt(result.emi)}</div>
                <div className="text-xs text-blue-400 mt-1">Monthly EMI</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-amber-700">${fmt(result.totalInterest)}</div>
                <div className="text-xs text-amber-400 mt-1">Total Interest</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <div className="text-xl font-bold text-green-700">${fmt(result.totalPayment)}</div>
                <div className="text-xs text-green-400 mt-1">Total Payment</div>
              </div>
            </div>

            {/* Visual breakdown bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Principal {pPct}%</span>
                <span>Interest {iPct}%</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden flex">
                <div className="bg-blue-500 h-full transition-all" style={{ width: `${pPct}%` }} />
                <div className="bg-amber-400 h-full flex-1" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ResultActions copyText={copyText} />
              <button
                onClick={() => setShowSchedule(v => !v)}
                className="text-xs text-blue-600 hover:underline"
              >
                {showSchedule ? 'Hide' : 'Show'} amortization schedule ({Math.round(months)} months)
              </button>
            </div>

            {/* Amortization table */}
            {showSchedule && (
              <div className="overflow-auto rounded-xl border border-gray-100 max-h-72">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {['Month','EMI','Principal','Interest','Balance'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-gray-500 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {schedule.map(row => (
                      <tr key={row.month} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-1.5 tabular-nums text-gray-400">{row.month}</td>
                        <td className="px-3 py-1.5 tabular-nums">${fmt(row.emi)}</td>
                        <td className="px-3 py-1.5 tabular-nums text-blue-600">${fmt(row.principal)}</td>
                        <td className="px-3 py-1.5 tabular-nums text-amber-600">${fmt(row.interest)}</td>
                        <td className="px-3 py-1.5 tabular-nums text-gray-600">${fmt(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-gray-400 text-center py-2">Enter loan amount, rate, and tenure to calculate EMI.</p>
        )}
      </div>
    </ToolLayout>
  );
}
