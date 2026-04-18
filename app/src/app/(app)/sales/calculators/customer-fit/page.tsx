'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const INDUSTRIES = [
  { value: 'food-manufacturing', label: 'Food Manufacturing / Processing', score: 10 },
  { value: 'food-distribution', label: 'Food Distribution / Supermarket', score: 10 },
  { value: 'hospitality', label: 'Hotel / Restaurant / Hospitality', score: 8 },
  { value: 'healthcare', label: 'Hospital / Aged Care / Healthcare', score: 9 },
  { value: 'retail', label: 'Retail Chain / Multi-site Retail', score: 7 },
  { value: 'warehouse', label: 'Warehouse / Logistics / Data Centre', score: 8 },
  { value: 'education', label: 'School / Education Facility', score: 6 },
  { value: 'office', label: 'Corporate Office', score: 5 },
  { value: 'other', label: 'Other / General Commercial', score: 3 },
]

type Answers = {
  industry: string
  siteCount: string
  compliance: string
  auditFrequency: string
  currentPain: string
  hardToAccess: string
  contractTiming: string
  pestIncidentRisk: string
}

const INITIAL: Answers = {
  industry: '',
  siteCount: '',
  compliance: '',
  auditFrequency: '',
  currentPain: '',
  hardToAccess: '',
  contractTiming: '',
  pestIncidentRisk: '',
}

function calcScore(a: Answers): { score: number; max: number } {
  let score = 0
  const max = 100
  const ind = INDUSTRIES.find(i => i.value === a.industry)
  score += ind ? ind.score : 0
  score += a.siteCount === '1' ? 5 : a.siteCount === '2-5' ? 10 : a.siteCount === '6-20' ? 15 : a.siteCount === '20+' ? 20 : 0
  score += a.compliance === 'mandatory' ? 20 : a.compliance === 'best-practice' ? 10 : a.compliance === 'none' ? 0 : 0
  score += a.auditFrequency === 'frequent' ? 15 : a.auditFrequency === 'annual' ? 8 : a.auditFrequency === 'never' ? 0 : 0
  score += a.currentPain === 'very' ? 15 : a.currentPain === 'somewhat' ? 8 : a.currentPain === 'happy' ? 0 : 0
  score += a.hardToAccess === 'yes' ? 10 : 0
  score += a.contractTiming === 'renewing-soon' ? 10 : a.contractTiming === 'month-to-month' ? 8 : a.contractTiming === 'locked-in' ? 0 : 0
  score += a.pestIncidentRisk === 'high' ? 10 : a.pestIncidentRisk === 'medium' ? 5 : 0
  return { score: Math.min(score, max), max }
}

function getResult(score: number) {
  if (score >= 70) return { label: 'Strong Fit', color: '#61ce70', bg: '#f0fdf4', icon: <CheckCircle className="w-6 h-6" style={{ color: '#61ce70' }} />, message: 'This prospect has strong indicators for digital pest control. Prioritise this opportunity and engage with a full discovery conversation.' }
  if (score >= 45) return { label: 'Good Fit', color: '#018902', bg: '#f0fdf4', icon: <CheckCircle className="w-6 h-6" style={{ color: '#018902' }} />, message: 'This prospect has several good indicators. Continue qualifying — focus on compliance requirements and risk exposure to build the case.' }
  if (score >= 25) return { label: 'Possible Fit', color: '#d97706', bg: '#fffbeb', icon: <AlertCircle className="w-6 h-6" style={{ color: '#d97706' }} />, message: 'Some indicators present but needs deeper qualification. Explore whether compliance pain or a recent incident could shift the conversation.' }
  return { label: 'Poor Fit', color: '#dc2626', bg: '#fef2f2', icon: <XCircle className="w-6 h-6" style={{ color: '#dc2626' }} />, message: "Limited indicators for digital pest control right now. Consider a traditional service quote — and stay in touch for when their situation changes." }
}

export default function CustomerFitCalculator() {
  const [answers, setAnswers] = useState<Answers>(INITIAL)
  const [submitted, setSubmitted] = useState(false)

  const set = (k: keyof Answers, v: string) => setAnswers(a => ({ ...a, [k]: v }))
  const complete = Object.values(answers).every(v => v !== '')
  const { score, max } = calcScore(answers)
  const result = getResult(score)

  const pct = Math.round((score / max) * 100)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-gray-400 font-jakarta mb-6">
        <Link href="/sales" className="hover:text-gray-600">Sales Hub</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700">Customer Fit Calculator</span>
      </nav>

      <div className="mb-6">
        <h1 className="font-geologica font-black text-2xl text-gray-900 mb-2">Customer Fit Calculator</h1>
        <p className="text-gray-500 font-jakarta text-sm">Score a prospect to see how well they fit digital pest control before investing significant sales time.</p>
      </div>

      {!submitted ? (
        <div className="space-y-5">
          {/* Industry */}
          <div className="card p-5">
            <label className="block font-jakarta font-semibold text-gray-800 mb-3">What industry is this prospect in?</label>
            <div className="grid sm:grid-cols-2 gap-2">
              {INDUSTRIES.map(ind => (
                <button key={ind.value} onClick={() => set('industry', ind.value)}
                  className={`text-left px-3 py-2 rounded-lg border text-sm font-jakarta transition-all ${answers.industry === ind.value ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 hover:border-green-300 text-gray-700'}`}>
                  {ind.label}
                </button>
              ))}
            </div>
          </div>

          {/* Site count */}
          <div className="card p-5">
            <label className="block font-jakarta font-semibold text-gray-800 mb-3">How many sites does this customer operate?</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[['1', '1 site'], ['2-5', '2–5 sites'], ['6-20', '6–20 sites'], ['20+', '20+ sites']].map(([v, l]) => (
                <button key={v} onClick={() => set('siteCount', v)}
                  className={`px-3 py-2 rounded-lg border text-sm font-jakarta transition-all ${answers.siteCount === v ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 hover:border-green-300 text-gray-700'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Compliance */}
          <div className="card p-5">
            <label className="block font-jakarta font-semibold text-gray-800 mb-3">What are their pest control compliance requirements?</label>
            <div className="space-y-2">
              {[['mandatory', 'Mandatory regulatory / audit requirements (HACCP, food safety, etc.)'], ['best-practice', 'Strong best-practice commitment but not mandatory'], ['none', 'No specific compliance requirements']].map(([v, l]) => (
                <button key={v} onClick={() => set('compliance', v)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-jakarta transition-all ${answers.compliance === v ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 hover:border-green-300 text-gray-700'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Audit frequency */}
          <div className="card p-5">
            <label className="block font-jakarta font-semibold text-gray-800 mb-3">How often are they audited on pest control?</label>
            <div className="space-y-2">
              {[['frequent', 'Frequently (quarterly or more)'], ['annual', 'Annually'], ['never', 'Never or rarely audited']].map(([v, l]) => (
                <button key={v} onClick={() => set('auditFrequency', v)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-jakarta transition-all ${answers.auditFrequency === v ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 hover:border-green-300 text-gray-700'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Current pain */}
          <div className="card p-5">
            <label className="block font-jakarta font-semibold text-gray-800 mb-3">How satisfied are they with their current pest control?</label>
            <div className="space-y-2">
              {[['very', 'Very unhappy — active pain points or recent incident'], ['somewhat', 'Somewhat satisfied but open to improvement'], ['happy', 'Very happy with current provider']].map(([v, l]) => (
                <button key={v} onClick={() => set('currentPain', v)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-jakarta transition-all ${answers.currentPain === v ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 hover:border-green-300 text-gray-700'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Hard to access */}
          <div className="card p-5">
            <label className="block font-jakarta font-semibold text-gray-800 mb-3">Do they have hard-to-access or restricted areas that are difficult to service?</label>
            <div className="grid grid-cols-2 gap-2">
              {[['yes', 'Yes'], ['no', 'No']].map(([v, l]) => (
                <button key={v} onClick={() => set('hardToAccess', v)}
                  className={`px-3 py-2 rounded-lg border text-sm font-jakarta transition-all ${answers.hardToAccess === v ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 hover:border-green-300 text-gray-700'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Contract timing */}
          <div className="card p-5">
            <label className="block font-jakarta font-semibold text-gray-800 mb-3">Where are they in their pest control contract cycle?</label>
            <div className="space-y-2">
              {[['renewing-soon', 'Contract renewing within 3–6 months'], ['month-to-month', 'Month-to-month or no fixed contract'], ['locked-in', 'Locked into a long-term contract (12+ months remaining)']].map(([v, l]) => (
                <button key={v} onClick={() => set('contractTiming', v)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-jakarta transition-all ${answers.contractTiming === v ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 hover:border-green-300 text-gray-700'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Pest risk */}
          <div className="card p-5">
            <label className="block font-jakarta font-semibold text-gray-800 mb-3">What is the business impact if pests get out of control at this site?</label>
            <div className="space-y-2">
              {[['high', 'High — site closure, product recall, or audit failure possible'], ['medium', 'Medium — operational disruption and reputational risk'], ['low', 'Low — inconvenience but no major business consequences']].map(([v, l]) => (
                <button key={v} onClick={() => set('pestIncidentRisk', v)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-jakarta transition-all ${answers.pestIncidentRisk === v ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 hover:border-green-300 text-gray-700'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => complete && setSubmitted(true)}
            disabled={!complete}
            className="w-full py-3 px-6 rounded-xl font-jakarta font-semibold text-white transition-all"
            style={{ backgroundColor: complete ? '#002400' : '#d1d5db', cursor: complete ? 'pointer' : 'not-allowed' }}
          >
            Calculate Fit Score
          </button>
          {!complete && (
            <p className="text-center text-sm text-gray-400 font-jakarta">Please answer all questions to see your result</p>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Score result */}
          <div className="card p-6" style={{ backgroundColor: result.bg, borderColor: result.color }}>
            <div className="flex items-center gap-3 mb-4">
              {result.icon}
              <div>
                <div className="font-geologica font-black text-2xl" style={{ color: result.color }}>{result.label}</div>
                <div className="font-jakarta text-sm text-gray-600">Fit Score: {score}/{max} ({pct}%)</div>
              </div>
            </div>
            {/* Score bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div className="h-3 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: result.color }} />
            </div>
            <p className="font-jakarta text-gray-700 text-sm">{result.message}</p>
          </div>

          {/* Score breakdown */}
          <div className="card p-5">
            <h3 className="font-jakarta font-semibold text-gray-800 mb-3">Score Breakdown</h3>
            <div className="space-y-2 text-sm font-jakarta">
              {[
                ['Industry type', INDUSTRIES.find(i => i.value === answers.industry)?.score ?? 0],
                ['Number of sites', { '1': 5, '2-5': 10, '6-20': 15, '20+': 20 }[answers.siteCount] ?? 0],
                ['Compliance requirements', { mandatory: 20, 'best-practice': 10, none: 0 }[answers.compliance] ?? 0],
                ['Audit frequency', { frequent: 15, annual: 8, never: 0 }[answers.auditFrequency] ?? 0],
                ['Current provider pain', { very: 15, somewhat: 8, happy: 0 }[answers.currentPain] ?? 0],
                ['Hard-to-access areas', answers.hardToAccess === 'yes' ? 10 : 0],
                ['Contract timing', { 'renewing-soon': 10, 'month-to-month': 8, 'locked-in': 0 }[answers.contractTiming] ?? 0],
                ['Pest incident risk', { high: 10, medium: 5, low: 0 }[answers.pestIncidentRisk] ?? 0],
              ].map(([label, pts]) => (
                <div key={label as string} className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-gray-600">{label as string}</span>
                  <span className="font-semibold" style={{ color: (pts as number) > 0 ? '#018902' : '#9ca3af' }}>
                    +{pts as number} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setAnswers(INITIAL); setSubmitted(false) }}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 font-jakarta font-semibold text-gray-700 hover:bg-gray-50 transition-all text-sm">
              Start Over
            </button>
            <Link href="/sales/calculators/business-model"
              className="flex-1 py-3 px-4 rounded-xl font-jakarta font-semibold text-white text-center text-sm transition-all"
              style={{ backgroundColor: '#002400' }}>
              Run A/B Calculator →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
