'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const BUSINESS_TYPES = [
  { value: 'food-manufacturing', label: 'Food Manufacturing / Processing', closureDays: 3, penaltyMultiplier: 0.02, incidentChance: 0.25 },
  { value: 'food-distribution', label: 'Food Distribution / Supermarket', closureDays: 2, penaltyMultiplier: 0.015, incidentChance: 0.20 },
  { value: 'hospitality', label: 'Hotel / Restaurant', closureDays: 1, penaltyMultiplier: 0.01, incidentChance: 0.15 },
  { value: 'healthcare', label: 'Hospital / Aged Care', closureDays: 2, penaltyMultiplier: 0.02, incidentChance: 0.10 },
  { value: 'retail', label: 'Retail / Multi-site Retail', closureDays: 1, penaltyMultiplier: 0.005, incidentChance: 0.15 },
  { value: 'warehouse', label: 'Warehouse / Logistics', closureDays: 1, penaltyMultiplier: 0.01, incidentChance: 0.20 },
  { value: 'other', label: 'Other Commercial', closureDays: 1, penaltyMultiplier: 0.005, incidentChance: 0.10 },
]

type Inputs = {
  businessType: string
  annualRevenue: number
  stockValue: number
  customIncidentChance: boolean
  incidentChancePct: number
  deviceCount: number
  offerType: 'upfront' | 'bundled'
}

const DEFAULTS: Inputs = {
  businessType: 'food-manufacturing',
  annualRevenue: 5000000,
  stockValue: 200000,
  customIncidentChance: false,
  incidentChancePct: 25,
  deviceCount: 20,
  offerType: 'bundled',
}

function fmt(n: number) {
  return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function RiskImpactTool() {
  const [inp, setInp] = useState<Inputs>(DEFAULTS)
  const set = (k: keyof Inputs, v: number | string | boolean) => setInp(i => ({ ...i, [k]: v }))

  const biz = BUSINESS_TYPES.find(b => b.value === inp.businessType) || BUSINESS_TYPES[0]
  const dailyRevenue = inp.annualRevenue / 365
  const closureLoss = dailyRevenue * biz.closureDays
  const remediation = 5000 + inp.stockValue * 0.15
  const penalty = inp.annualRevenue * biz.penaltyMultiplier
  const reputationLoss = dailyRevenue * 10 // estimated 10-day equivalent revenue impact
  const totalIncidentCost = closureLoss + remediation + penalty + reputationLoss

  const incidentChance = inp.customIncidentChance ? inp.incidentChancePct / 100 : biz.incidentChance
  const expectedRisk3yr = totalIncidentCost * incidentChance
  const expectedRiskAnnual = expectedRisk3yr / 3

  // PestSense cost estimate
  const gatewayAnnual = (450 * 1.2) / 3
  let digitalAnnual = 0
  if (inp.offerType === 'bundled') {
    digitalAnnual = inp.deviceCount * 15 * 12
  } else {
    digitalAnnual = (inp.deviceCount * 190.80) / 3 + inp.deviceCount * 6.60 * 12
  }
  digitalAnnual += gatewayAnnual + 6 * 165 // 6 triggered visits
  const digital3yr = digitalAnnual * 3

  const riskReduction = expectedRisk3yr * 0.9 // digital reduces incident risk by ~90%
  const netBenefit = riskReduction - digital3yr

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-gray-400 font-jakarta mb-6">
        <Link href="/sales" className="hover:text-gray-600">Sales Hub</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700">Stock-Loss / Risk Impact Tool</span>
      </nav>

      <div className="mb-6">
        <h1 className="font-geologica font-black text-2xl text-gray-900 mb-2">Stock-Loss / Risk Impact Tool</h1>
        <p className="text-gray-500 font-jakarta text-sm">Quantify the expected financial cost of a pest incident for this customer. Compare risk exposure to the cost of digital monitoring.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-jakarta font-semibold text-gray-800 mb-4">Customer Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-jakarta text-gray-500 mb-1 block">Business type</label>
                <select value={inp.businessType} onChange={e => set('businessType', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-jakarta focus:outline-none focus:border-green-400">
                  {BUSINESS_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-jakarta text-gray-500 mb-1 block">Annual revenue (AUD)</label>
                <input type="number" min={0} step={100000} value={inp.annualRevenue}
                  onChange={e => set('annualRevenue', Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-jakarta focus:outline-none focus:border-green-400" />
              </div>
              <div>
                <label className="text-xs font-jakarta text-gray-500 mb-1 block">Value of on-site stock/assets at risk (AUD)</label>
                <input type="number" min={0} step={10000} value={inp.stockValue}
                  onChange={e => set('stockValue', Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-jakarta focus:outline-none focus:border-green-400" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="customChance" checked={inp.customIncidentChance}
                  onChange={e => set('customIncidentChance', e.target.checked)}
                  className="rounded border-gray-300" />
                <label htmlFor="customChance" className="text-xs font-jakarta text-gray-600">Use custom incident probability</label>
              </div>
              {inp.customIncidentChance && (
                <div>
                  <label className="text-xs font-jakarta text-gray-500 mb-1 block">Probability of a pest incident in next 3 years (%)</label>
                  <input type="number" min={1} max={100} value={inp.incidentChancePct}
                    onChange={e => set('incidentChancePct', Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-jakarta focus:outline-none focus:border-green-400" />
                  <p className="text-xs text-gray-400 mt-1 font-jakarta">Default for {biz.label}: {Math.round(biz.incidentChance * 100)}%</p>
                </div>
              )}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-jakarta font-semibold text-gray-800 mb-4">PestSense Solution</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-jakarta text-gray-500 mb-1 block">Number of PestSense devices</label>
                <input type="number" min={4} step={4} value={inp.deviceCount}
                  onChange={e => set('deviceCount', Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-jakarta focus:outline-none focus:border-green-400" />
              </div>
              <div>
                <label className="text-xs font-jakarta text-gray-500 mb-1 block">Offer type</label>
                <select value={inp.offerType} onChange={e => set('offerType', e.target.value as 'upfront' | 'bundled')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-jakarta focus:outline-none focus:border-green-400">
                  <option value="bundled">Bundled Monthly</option>
                  <option value="upfront">Upfront + Connection</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-jakarta font-semibold text-gray-800 mb-4">Risk Analysis</h2>

            <div className="space-y-2 text-sm font-jakarta mb-4">
              <h3 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">If a pest incident occurs</h3>
              <div className="space-y-1.5">
                {[
                  [`Site closure (${biz.closureDays} day${biz.closureDays > 1 ? 's' : ''} typical)`, closureLoss],
                  ['Remediation / emergency treatment', remediation],
                  ['Regulatory penalty estimate', penalty],
                  ['Reputational / revenue impact', reputationLoss],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-600">{label as string}</span>
                    <span className="font-semibold text-red-600">{fmt(val as number)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-1 font-semibold">
                  <span className="text-gray-800">Total incident cost</span>
                  <span className="text-red-700 text-base">{fmt(totalIncidentCost)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-red-50 border border-red-100 mb-4">
              <div className="text-xs font-jakarta text-red-700 mb-1">
                Incident probability over 3 years: <strong>{Math.round(incidentChance * 100)}%</strong>
              </div>
              <div className="font-jakarta font-bold text-lg text-red-800">
                Expected risk cost: {fmt(expectedRisk3yr)}
              </div>
              <div className="text-xs font-jakarta text-red-600 mt-0.5">
                ({fmt(expectedRiskAnnual)} per year on average)
              </div>
            </div>

            <div className="p-4 rounded-xl mb-4" style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div className="text-xs font-jakarta text-green-700 mb-1">PestSense 3-year investment</div>
              <div className="font-jakarta font-bold text-lg" style={{ color: '#002400' }}>{fmt(digital3yr)}</div>
              <div className="text-xs font-jakarta text-green-600 mt-0.5">
                ~{fmt(digitalAnnual)}/year including monitoring + visits
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between items-center">
                <span className="font-jakarta font-semibold text-gray-700">
                  {netBenefit >= 0 ? '✅ Net risk-adjusted benefit' : '⚠️ Risk-adjusted shortfall'}
                </span>
                <span className={`font-jakarta font-bold text-lg ${netBenefit >= 0 ? 'text-green-700' : 'text-orange-600'}`}>
                  {netBenefit >= 0 ? fmt(netBenefit) : fmt(-netBenefit)}
                </span>
              </div>
              <p className="text-xs font-jakarta text-gray-400 mt-1">
                Expected risk savings (90% incident reduction) minus PestSense investment over 3 years
              </p>
            </div>
          </div>

          <div className="card p-4 bg-blue-50 border-blue-100">
            <p className="text-xs font-jakarta text-blue-800">
              <strong>Methodology note:</strong> Incident costs and probabilities are estimates based on industry benchmarks. Actual costs may vary. Use this tool to frame the risk conversation — not as a formal financial projection.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/sales/calculators/business-model"
              className="flex-1 py-2 px-3 rounded-xl border border-gray-200 font-jakarta font-semibold text-gray-700 hover:bg-gray-50 transition-all text-sm text-center">
              ← A/B Calculator
            </Link>
            <Link href="/sales/calculators/proposal"
              className="flex-1 py-2 px-3 rounded-xl font-jakarta font-semibold text-white text-center text-sm transition-all"
              style={{ backgroundColor: '#002400' }}>
              Generate Proposal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
