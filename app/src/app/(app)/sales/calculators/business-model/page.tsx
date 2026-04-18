'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Info } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Inputs = {
  // Site
  traditionalStationCount: number
  digitalDeviceCount: number        // editable — defaults to 1:4 of traditional
  gatewayCount: number

  // Traditional costs
  stationUnitCost: number           // hardware cost per traditional station
  baitCostPerStationPerVisit: number
  visitCostPerVisit: number
  visitsPerYear: number
  reactiveCallouts: number

  // Digital costs
  digitalDeviceUnitCost: number     // customer-facing price
  monthlyConnFeePerDevice: number
  digitalVisitsPerYear: number

  // Contract
  contractYears: number
  margin: number
}

const DEFAULTS: Inputs = {
  traditionalStationCount: 40,
  digitalDeviceCount: 10,           // 1:4 default
  gatewayCount: 1,

  stationUnitCost: 20,              // ~$17-$25 per Protecta-style station
  baitCostPerStationPerVisit: 2,    // $1-$3/station/visit for rodenticide refill
  visitCostPerVisit: 165,
  visitsPerYear: 12,
  reactiveCallouts: 3,

  digitalDeviceUnitCost: 190.80,    // Tier 3 + 20% margin
  monthlyConnFeePerDevice: 6.60,    // Tier 3 + 20% margin
  digitalVisitsPerYear: 6,

  contractYears: 3,
  margin: 20,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
function fmtD(n: number) {
  return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function Tip({ text }: { text: string }) {
  return (
    <span className="group relative inline-block ml-1">
      <Info className="w-3.5 h-3.5 text-gray-400 cursor-help inline" />
      <span className="hidden group-hover:block absolute z-10 left-0 top-5 w-64 text-xs font-jakarta bg-gray-800 text-white rounded-lg p-2 shadow-lg leading-relaxed">
        {text}
      </span>
    </span>
  )
}

// ─── Number Input ─────────────────────────────────────────────────────────────

function NumInput({ label, tip, value, min, max, step, prefix, onChange }: {
  label: string; tip?: string; value: number; min?: number; max?: number
  step?: number; prefix?: string; onChange: (v: number) => void
}) {
  return (
    <div>
      <label className="text-xs font-jakarta text-gray-500 mb-1 flex items-center">
        {label}{tip && <Tip text={tip} />}
      </label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-jakarta">{prefix}</span>}
        <input
          type="number" min={min} max={max} step={step ?? 1} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className={`w-full border border-gray-200 rounded-lg py-2 text-sm font-jakarta focus:outline-none focus:border-green-400 ${prefix ? 'pl-7 pr-3' : 'px-3'}`}
        />
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BusinessModelCalculator() {
  const [inp, setInp] = useState<Inputs>(DEFAULTS)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const set = (k: keyof Inputs, v: number) => setInp(i => ({ ...i, [k]: v }))

  // Auto-suggest digital count when traditional changes (1:4 ratio)
  const suggestedDigital = Math.max(4, Math.round(inp.traditionalStationCount / 4 / 4) * 4)
  const ratio = inp.traditionalStationCount > 0
    ? `1:${Math.round(inp.traditionalStationCount / inp.digitalDeviceCount)}`
    : '—'

  // ── Traditional costs ──────────────────────────────────────────
  const tradHardware = inp.traditionalStationCount * inp.stationUnitCost
  const tradBaitPerYear = inp.traditionalStationCount * inp.baitCostPerStationPerVisit * inp.visitsPerYear
  const tradServicePerYear = (inp.visitsPerYear + inp.reactiveCallouts) * inp.visitCostPerVisit
  const tradAnnualRunning = tradBaitPerYear + tradServicePerYear
  const tradTotal = tradHardware + tradAnnualRunning * inp.contractYears

  // ── Digital costs ──────────────────────────────────────────────
  const gatewayUnitCust = 450 * (1 + inp.margin / 100)
  const gatewayHardware = inp.gatewayCount * gatewayUnitCust
  const deviceHardware = inp.digitalDeviceCount * inp.digitalDeviceUnitCost
  const digitalHardware = gatewayHardware + deviceHardware
  const digitalConnPerYear = inp.digitalDeviceCount * inp.monthlyConnFeePerDevice * 12
  const digitalServicePerYear = inp.digitalVisitsPerYear * inp.visitCostPerVisit
  const digitalAnnualRunning = digitalConnPerYear + digitalServicePerYear
  const digitalTotal = digitalHardware + digitalAnnualRunning * inp.contractYears

  // ── Comparison ────────────────────────────────────────────────
  const saving = tradTotal - digitalTotal
  const savingPct = tradTotal > 0 ? Math.round((saving / tradTotal) * 100) : 0
  const breakEvenYrs = saving > 0 && (tradAnnualRunning - digitalAnnualRunning) > 0
    ? (digitalHardware - tradHardware) / (tradAnnualRunning - digitalAnnualRunning)
    : null

  // Yearly running comparison (no hardware amortisation — just for chart)
  const tradY1 = tradHardware + tradAnnualRunning
  const digY1 = digitalHardware + digitalAnnualRunning

  const maxBar = Math.max(tradTotal, digitalTotal)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-gray-400 font-jakarta mb-6">
        <Link href="/sales" className="hover:text-gray-600">Sales Hub</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700">Business Model A/B Calculator</span>
      </nav>

      <div className="mb-6">
        <h1 className="font-geologica font-black text-2xl text-gray-900 mb-2">Business Model A/B Calculator</h1>
        <p className="text-gray-500 font-jakarta text-sm">
          A true cost comparison including station hardware, bait consumables, and visit costs.
          Digital typically needs <strong>1 smart device per 4 traditional stations</strong> — the savings add up faster than you'd expect.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* ── Inputs ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Station counts */}
          <div className="card p-5">
            <h2 className="font-jakarta font-semibold text-gray-800 mb-4">Station Configuration</h2>
            <div className="space-y-3">
              <NumInput
                label="Traditional stations currently on site"
                tip="The total number of passive/traditional rodent bait stations deployed at this customer's site. Typical commercial sites run 20–60 stations."
                value={inp.traditionalStationCount} min={4} step={4}
                onChange={v => {
                  set('traditionalStationCount', v)
                  // Auto-update digital count to maintain ~1:4 ratio
                  setInp(i => ({ ...i, traditionalStationCount: v, digitalDeviceCount: Math.max(4, Math.round(v / 4 / 4) * 4) }))
                }}
              />

              <div>
                <label className="text-xs font-jakarta text-gray-500 mb-1 flex items-center">
                  PestSense smart devices
                  <Tip text="PestSense replaces traditional stations at roughly 1 smart device per 4 traditional stations. Each smart device monitors 24/7 — the equivalent of checking 4 traditional stations continuously." />
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number" min={4} step={4} value={inp.digitalDeviceCount}
                    onChange={e => set('digitalDeviceCount', Number(e.target.value))}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-jakarta focus:outline-none focus:border-green-400"
                  />
                  <span className="text-xs font-jakarta text-gray-500 whitespace-nowrap">ratio {ratio}</span>
                </div>
                {inp.digitalDeviceCount !== suggestedDigital && (
                  <button
                    onClick={() => set('digitalDeviceCount', suggestedDigital)}
                    className="mt-1 text-xs font-jakarta text-green-700 hover:text-green-900"
                  >
                    ↩ Reset to 1:4 ({suggestedDigital} devices)
                  </button>
                )}
              </div>

              <NumInput
                label="Gateways"
                tip="1 gateway for small–medium sites. 2 for large sites (200m+ span). Each gateway supports 400+ devices."
                value={inp.gatewayCount} min={1} max={10}
                onChange={v => set('gatewayCount', v)}
              />
            </div>
          </div>

          {/* Traditional costs */}
          <div className="card p-5">
            <h2 className="font-jakarta font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center font-bold">A</span>
              Traditional Costs
            </h2>
            <p className="text-xs text-gray-400 font-jakarta mb-3">Hardware + bait + service visits</p>
            <div className="space-y-3">
              <NumInput
                label="Station hardware cost (per unit)"
                tip="The purchase price per traditional tamper-resistant bait station. Protecta Shield runs ~$17–$25/unit in bulk. Budget $20–$30 installed."
                value={inp.stationUnitCost} min={0} step={1} prefix="$"
                onChange={v => set('stationUnitCost', v)}
              />
              <NumInput
                label="Bait refill cost (per station per visit)"
                tip="Cost of rodenticide bait per station per service. Typically $1–$3 per station. A 5kg tub of Racumin at $329 covers ~165 station refills."
                value={inp.baitCostPerStationPerVisit} min={0} step={0.50} prefix="$"
                onChange={v => set('baitCostPerStationPerVisit', v)}
              />
              <NumInput
                label="Routine visits per year"
                tip="Monthly = 12, bi-monthly = 6, quarterly = 4. High-compliance food sites typically require monthly minimum."
                value={inp.visitsPerYear} min={1} max={52}
                onChange={v => set('visitsPerYear', v)}
              />
              <NumInput
                label="Reactive/emergency callouts per year"
                tip="Average 2–4 reactive callouts per year for active rodent sites. Each charged at standard or +20–40% surcharge rate."
                value={inp.reactiveCallouts} min={0} max={24}
                onChange={v => set('reactiveCallouts', v)}
              />
              <NumInput
                label="Cost per visit / callout"
                tip="Typical commercial rate $150–$220 per visit in Australia. Large sites command $250–$400+."
                value={inp.visitCostPerVisit} min={0} step={5} prefix="$"
                onChange={v => set('visitCostPerVisit', v)}
              />
            </div>
          </div>

          {/* Digital costs */}
          <div className="card p-5">
            <h2 className="font-jakarta font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ backgroundColor: '#61ce70' }}>B</span>
              PestSense Digital Costs
            </h2>
            <p className="text-xs text-gray-400 font-jakarta mb-3">Hardware + connection + data-triggered visits</p>
            <div className="space-y-3">
              <NumInput
                label="Device price to customer (per unit)"
                tip="Tier 3 PCO cost $159 + 20% margin = $190.80. Adjust for your tier and margin."
                value={inp.digitalDeviceUnitCost} min={0} step={1} prefix="$"
                onChange={v => set('digitalDeviceUnitCost', v)}
              />
              <NumInput
                label="Monthly connection fee (per device)"
                tip="Tier 3 connection fee $5.50 + 20% margin = $6.60/device/month."
                value={inp.monthlyConnFeePerDevice} min={0} step={0.10} prefix="$"
                onChange={v => set('monthlyConnFeePerDevice', v)}
              />
              <NumInput
                label="Data-triggered visits per year"
                tip="With 24/7 monitoring, visits are driven by real activity — not a calendar. Typical reduction from 12 routine to 4–8 targeted visits per year."
                value={inp.digitalVisitsPerYear} min={0} max={52}
                onChange={v => set('digitalVisitsPerYear', v)}
              />
              <div className="flex items-center gap-2">
                <select
                  value={inp.contractYears}
                  onChange={e => set('contractYears', Number(e.target.value))}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-jakarta focus:outline-none focus:border-green-400"
                >
                  {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>{y}-year comparison</option>)}
                </select>
              </div>

              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs font-jakarta text-gray-400 hover:text-gray-600"
              >
                {showAdvanced ? '▲ Hide' : '▼ Show'} margin setting
              </button>
              {showAdvanced && (
                <NumInput
                  label="Your margin on devices (%)"
                  tip="Used to calculate gateway customer price (450 × margin). Device and connection prices above are already customer-facing."
                  value={inp.margin} min={0} max={100}
                  onChange={v => set('margin', v)}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── Results ── */}
        <div className="lg:col-span-3 space-y-4">

          {/* Visual bar comparison */}
          <div className="card p-5">
            <h2 className="font-jakarta font-semibold text-gray-800 mb-4">
              {inp.contractYears}-Year Total Cost of Ownership
            </h2>

            {/* Model A bar */}
            <div className="mb-5">
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="font-jakarta font-semibold text-gray-700 flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-gray-300 text-gray-700 text-xs flex items-center justify-center font-bold">A</span>
                  Traditional — {inp.traditionalStationCount} stations
                </span>
                <span className="font-jakarta font-bold text-gray-900">{fmt(tradTotal)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden">
                <div className="h-8 rounded-full transition-all flex items-center" style={{ width: `${Math.max(5, (tradTotal / maxBar) * 100)}%`, backgroundColor: '#6b7280' }}>
                </div>
              </div>
              <div className="flex gap-3 mt-1.5 text-xs font-jakarta text-gray-400 flex-wrap">
                <span>Hardware: {fmt(tradHardware)}</span>
                <span>Bait: {fmt(tradBaitPerYear * inp.contractYears)}</span>
                <span>Service: {fmt(tradServicePerYear * inp.contractYears)}</span>
              </div>
            </div>

            {/* Model B bar */}
            <div className="mb-5">
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="font-jakarta font-semibold flex items-center gap-2 text-sm" style={{ color: '#002400' }}>
                  <span className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ backgroundColor: '#61ce70' }}>B</span>
                  PestSense Digital — {inp.digitalDeviceCount} devices ({ratio})
                </span>
                <span className="font-jakarta font-bold" style={{ color: '#002400' }}>{fmt(digitalTotal)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-8 overflow-hidden">
                <div className="h-8 rounded-full transition-all" style={{ width: `${Math.max(5, (digitalTotal / maxBar) * 100)}%`, background: 'linear-gradient(90deg, #002400 0%, #006300 100%)' }}>
                </div>
              </div>
              <div className="flex gap-3 mt-1.5 text-xs font-jakarta flex-wrap" style={{ color: '#006300' }}>
                <span>Hardware: {fmt(digitalHardware)}</span>
                <span>Connection: {fmt(digitalConnPerYear * inp.contractYears)}</span>
                <span>Service: {fmt(digitalServicePerYear * inp.contractYears)}</span>
                <span className="text-gray-400">Bait: $0 (monitoring uses non-toxic)</span>
              </div>
            </div>

            {/* Result callout */}
            <div className={`rounded-xl p-4 ${saving >= 0 ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}`}>
              {saving >= 0 ? (
                <div>
                  <div className="font-jakarta font-bold text-lg text-green-800">
                    💰 Digital saves {fmt(saving)} over {inp.contractYears} year{inp.contractYears > 1 ? 's' : ''} ({savingPct}% less)
                  </div>
                  {breakEvenYrs !== null && breakEvenYrs > 0 && breakEvenYrs < inp.contractYears && (
                    <p className="text-xs font-jakarta text-green-700 mt-1">
                      Break-even on hardware premium at ~{breakEvenYrs < 1 ? `${Math.round(breakEvenYrs * 12)} months` : `${breakEvenYrs.toFixed(1)} years`}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="font-jakarta font-bold text-lg text-amber-800">
                    Digital costs {fmt(-saving)} more over {inp.contractYears} year{inp.contractYears > 1 ? 's' : ''}
                  </div>
                  <p className="text-xs font-jakarta text-amber-700 mt-1">
                    Adjust visit frequency or contract term — the longer the term, the stronger digital's advantage.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Year-by-year breakdown */}
          <div className="card p-5">
            <h3 className="font-jakarta font-semibold text-gray-800 mb-3">Annual Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-jakarta">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-1.5 text-gray-500 font-medium text-xs">Year</th>
                    <th className="text-right py-1.5 text-gray-500 font-medium text-xs">Traditional</th>
                    <th className="text-right py-1.5 text-gray-500 font-medium text-xs">Digital</th>
                    <th className="text-right py-1.5 text-gray-500 font-medium text-xs">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: inp.contractYears }, (_, i) => {
                    const tY = i === 0 ? tradHardware + tradAnnualRunning : tradAnnualRunning
                    const dY = i === 0 ? digitalHardware + digitalAnnualRunning : digitalAnnualRunning
                    const diff = tY - dY
                    return (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="py-2 text-gray-600">Year {i + 1}</td>
                        <td className="py-2 text-right text-gray-700">{fmt(tY)}</td>
                        <td className="py-2 text-right font-semibold" style={{ color: '#006300' }}>{fmt(dY)}</td>
                        <td className={`py-2 text-right font-semibold ${diff >= 0 ? 'text-green-700' : 'text-red-500'}`}>
                          {diff >= 0 ? `+${fmt(diff)}` : fmt(diff)}
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="bg-gray-50 font-bold">
                    <td className="py-2 px-1 rounded-l text-gray-800">Total</td>
                    <td className="py-2 text-right text-gray-800">{fmt(tradTotal)}</td>
                    <td className="py-2 text-right" style={{ color: '#002400' }}>{fmt(digitalTotal)}</td>
                    <td className={`py-2 text-right rounded-r ${saving >= 0 ? 'text-green-700' : 'text-red-500'}`}>
                      {saving >= 0 ? `+${fmt(saving)}` : fmt(saving)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* What's not in the numbers */}
          <div className="card p-4 bg-green-50 border-green-100">
            <p className="text-xs font-jakarta text-green-800 font-semibold mb-1">What's not in the digital column (additional value):</p>
            <ul className="text-xs font-jakarta text-green-700 space-y-0.5">
              <li>✓ 24/7 monitoring vs monthly snapshots</li>
              <li>✓ Customer portal access — real-time site visibility</li>
              <li>✓ Automated audit-ready compliance reports</li>
              <li>✓ ~60% reduction in rodenticide use (sustainability)</li>
              <li>✓ Faster incident detection and response</li>
            </ul>
          </div>

          {/* Industry context note */}
          <div className="card p-4 bg-gray-50 border-gray-100">
            <p className="text-xs font-jakarta text-gray-500 font-semibold mb-1">Industry context</p>
            <ul className="text-xs font-jakarta text-gray-500 space-y-0.5">
              <li>• Commercial bait station hardware: $15–$35/unit (Protecta Shield ~$17.40/unit in bulk)</li>
              <li>• Rodenticide bait: $1–$3/station/visit (Racumin 5kg = $329, ~165 refills)</li>
              <li>• Typical AU commercial visit: $150–$220 (large sites $250–$400+)</li>
              <li>• 100,000 sqft warehouse benchmark: $250–$350/month with 40+ traditional stations</li>
              <li>• Rentokil PestConnect: resolves infestations 2× faster, 60% less rodenticide</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Link href="/sales/calculators/risk-impact"
              className="flex-1 py-2 px-3 rounded-xl border border-gray-200 font-jakarta font-semibold text-gray-700 hover:bg-gray-50 transition-all text-sm text-center">
              Risk Impact Tool →
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
