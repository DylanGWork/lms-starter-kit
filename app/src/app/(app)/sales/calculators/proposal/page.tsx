'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Copy, Check } from 'lucide-react'

const TIERS = [
  { value: 'tier1', label: 'Tier 1 (100 devices)', devicePrice: 189, connFee: 7.00, bundledMonthly: 14.50 },
  { value: 'tier2', label: 'Tier 2 (500+ devices)', devicePrice: 179, connFee: 6.25, bundledMonthly: 13.50 },
  { value: 'tier3', label: 'Tier 3 (1,000+ devices)', devicePrice: 159, connFee: 5.50, bundledMonthly: 12.50 },
  { value: 'tier4', label: 'Tier 4 (5,000+ devices)', devicePrice: 149, connFee: 4.75, bundledMonthly: 11.50 },
]

type Inputs = {
  customerName: string
  siteAddress: string
  siteCount: number
  predictorXCount: number
  predictorICount: number
  predictorTagCount: number
  gatewayCount: number
  tier: string
  margin: number
  offerType: 'upfront' | 'bundled'
  contractTerm: number
  responseSlaDays: number
}

const DEFAULTS: Inputs = {
  customerName: '',
  siteAddress: '',
  siteCount: 1,
  predictorXCount: 4,
  predictorICount: 0,
  predictorTagCount: 0,
  gatewayCount: 1,
  tier: 'tier3',
  margin: 20,
  offerType: 'upfront',
  contractTerm: 36,
  responseSlaDays: 2,
}

function fmt(n: number) {
  return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmt0(n: number) {
  return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function ProposalGenerator() {
  const [inp, setInp] = useState<Inputs>(DEFAULTS)
  const [copied, setCopied] = useState(false)
  const set = (k: keyof Inputs, v: string | number) => setInp(i => ({ ...i, [k]: v }))

  const tier = TIERS.find(t => t.value === inp.tier) || TIERS[2]
  const m = 1 + inp.margin / 100

  const totalDevices = inp.predictorXCount + inp.predictorICount + inp.predictorTagCount

  // Customer prices
  const gatewayUnitCust = 450 * m
  const deviceXIUnitCust = tier.devicePrice * m
  const connFeeUnitCust = tier.connFee * m
  const bundledUnitCust = tier.bundledMonthly * m
  const batteryPerDevice = 0.70 * 4 * m // 4 batteries per device

  // Upfront totals
  const gatewayTotal = inp.gatewayCount * gatewayUnitCust
  const deviceTotal = (inp.predictorXCount + inp.predictorICount) * deviceXIUnitCust
  const tagTotal = inp.predictorTagCount * deviceXIUnitCust
  const batteryTotal = totalDevices * batteryPerDevice
  const upfrontTotal = gatewayTotal + deviceTotal + tagTotal
  const monthlyConnTotal = totalDevices * connFeeUnitCust
  const annualConnTotal = monthlyConnTotal * 12
  const connContractTotal = annualConnTotal * (inp.contractTerm / 12)

  // Bundled totals
  const bundledMonthlyTotal = totalDevices * bundledUnitCust
  const bundledContractTotal = bundledMonthlyTotal * inp.contractTerm

  const today = new Date().toLocaleDateString('en-AU', { day: '2-digit', month: 'long', year: 'numeric' })

  const proposalText = `
PESTSENSE DIGITAL PEST CONTROL
Preliminary Pricing Estimate
Generated: ${today}
Valid: 30 days (subject to PestSense approval before submission)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CUSTOMER: ${inp.customerName || '[Customer Name]'}
SITE ADDRESS: ${inp.siteAddress || '[Site Address]'}
SITES: ${inp.siteCount}
PRICING TIER: ${tier.label}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DEVICE SUMMARY
${inp.predictorXCount > 0 ? `Predictor X (External)    ${inp.predictorXCount} units` : ''}
${inp.predictorICount > 0 ? `Predictor I (Internal)    ${inp.predictorICount} units` : ''}
${inp.predictorTagCount > 0 ? `Predictor TAG             ${inp.predictorTagCount} units` : ''}
Gateways                  ${inp.gatewayCount} units
Total Devices:            ${totalDevices}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${inp.offerType === 'upfront' ? `UPFRONT OFFER — ${inp.contractTerm}-MONTH TERM

  Initial Purchase (AUD, ex-GST)
  ────────────────────────────────
  Gateways (${inp.gatewayCount} × ${fmt(gatewayUnitCust)})        ${fmt(gatewayTotal)}
  Predictor X/I Devices (${inp.predictorXCount + inp.predictorICount} × ${fmt(deviceXIUnitCust)})  ${fmt(deviceTotal)}${inp.predictorTagCount > 0 ? `
  Predictor TAG (${inp.predictorTagCount} × ${fmt(deviceXIUnitCust)})         ${fmt(tagTotal)}` : ''}
  ────────────────────────────────
  INITIAL COST                    ${fmt0(upfrontTotal)}

  Monthly Ongoing (AUD, ex-GST)
  ────────────────────────────────
  Connection fee (${totalDevices} × ${fmt(connFeeUnitCust)}/device)  ${fmt(monthlyConnTotal)}/month
  Annual connection total          ${fmt0(annualConnTotal)}/year
  Contract total (connection only) ${fmt0(connContractTotal)}

  NOTE: Batteries not included. Allow ${fmt(batteryTotal)} per battery change cycle (est. every 2 years).` :
`BUNDLED MONTHLY OFFER — ${inp.contractTerm}-MONTH TERM

  Monthly Fee (AUD, ex-GST)
  ────────────────────────────────
  Bundled rental (${totalDevices} × ${fmt(bundledUnitCust)}/device)  ${fmt(bundledMonthlyTotal)}/month
  Contract total                   ${fmt0(bundledContractTotal)}

  Includes: equipment rental, connection, batteries supplied
  Min term: 36 months. Equipment remains PestSense property until term end.`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR DIGITAL PLAN

1. Site Audit and Digital Blueprint
   Comprehensive risk-based survey identifying structural vulnerabilities
   and high-risk zones. Detailed sensor placement plan and commissioning
   strategy.

2. Seamless Installation and Integration
   Non-disruptive deployment of all sensors. Full system commissioning,
   quality checks, and integration with the OneCloud platform.
   Response SLA: ${inp.responseSlaDays} hours to alerts.

3. Predictive Management and Optimisation
   Continuous 24/7 monitoring. Deep root-cause analysis of activity
   trends, followed by physical and strategic recommendations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT'S INCLUDED

  ✓ Continuous 24/7 monitoring via OneCloud platform
  ✓ Instant activity and offline alerts
  ✓ Customer portal access — real-time site visibility
  ✓ Automated site visit reports (branded PDF, photo evidence)
  ✓ Audit-ready compliance reporting
  ✓ Data-triggered service visits

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GENERAL TERMS
• All pricing AUD excluding GST
• Preliminary estimate — subject to site survey
• No CPI increase during contract term
• Early termination fees apply
• Freight/shipping additional
• This quote requires PestSense approval before submission to customer
  Submit to: sales@pestsense.com
`.trim()

  const handleCopy = () => {
    navigator.clipboard.writeText(proposalText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-gray-400 font-jakarta mb-6">
        <Link href="/sales" className="hover:text-gray-600">Sales Hub</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700">Proposal Summary Generator</span>
      </nav>

      <div className="mb-6">
        <h1 className="font-geologica font-black text-2xl text-gray-900 mb-2">Proposal Summary Generator</h1>
        <p className="text-gray-500 font-jakarta text-sm">Enter site and device details to generate a pricing summary. <strong>Always submit to sales@pestsense.com for approval before presenting to a customer.</strong></p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-jakarta font-semibold text-gray-800 mb-4">Customer &amp; Site</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-jakarta text-gray-500 mb-1 block">Customer name</label>
                <input type="text" value={inp.customerName} placeholder="e.g. Acme Food Co"
                  onChange={e => set('customerName', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-jakarta focus:outline-none focus:border-green-400" />
              </div>
              <div>
                <label className="text-xs font-jakarta text-gray-500 mb-1 block">Site address</label>
                <input type="text" value={inp.siteAddress} placeholder="e.g. 110 Northlink Pl, Virginia QLD"
                  onChange={e => set('siteAddress', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-jakarta focus:outline-none focus:border-green-400" />
              </div>
              <div>
                <label className="text-xs font-jakarta text-gray-500 mb-1 block">Number of sites</label>
                <input type="number" min={1} value={inp.siteCount}
                  onChange={e => set('siteCount', Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-jakarta focus:outline-none focus:border-green-400" />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-jakarta font-semibold text-gray-800 mb-4">Devices</h2>
            <div className="space-y-3">
              {[
                { key: 'predictorXCount', label: 'Predictor X (External)', hint: 'Boxes of 4' },
                { key: 'predictorICount', label: 'Predictor I (Internal)', hint: 'Boxes of 4' },
                { key: 'predictorTagCount', label: 'Predictor TAG', hint: 'Boxes of 8' },
                { key: 'gatewayCount', label: 'Gateways', hint: '1 per site typically' },
              ].map(({ key, label, hint }) => (
                <div key={key}>
                  <label className="text-xs font-jakarta text-gray-500 mb-1 block">{label} <span className="text-gray-400">({hint})</span></label>
                  <input type="number" min={0} step={key === 'predictorTagCount' ? 8 : key === 'gatewayCount' ? 1 : 4}
                    value={inp[key as keyof Inputs] as number}
                    onChange={e => set(key as keyof Inputs, Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-jakarta focus:outline-none focus:border-green-400" />
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-jakarta font-semibold text-gray-800 mb-4">Pricing Options</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-jakarta text-gray-500 mb-1 block">Pricing tier</label>
                <select value={inp.tier} onChange={e => set('tier', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-jakarta focus:outline-none focus:border-green-400">
                  {TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-jakarta text-gray-500 mb-1 block">Your margin (%)</label>
                <input type="number" min={0} max={100} value={inp.margin}
                  onChange={e => set('margin', Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-jakarta focus:outline-none focus:border-green-400" />
              </div>
              <div>
                <label className="text-xs font-jakarta text-gray-500 mb-1 block">Offer type</label>
                <select value={inp.offerType} onChange={e => set('offerType', e.target.value as 'upfront' | 'bundled')}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-jakarta focus:outline-none focus:border-green-400">
                  <option value="upfront">Upfront + Monthly Connection</option>
                  <option value="bundled">Bundled Monthly Rental</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-jakarta text-gray-500 mb-1 block">Contract term (months)</label>
                <select value={inp.contractTerm} onChange={e => set('contractTerm', Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-jakarta focus:outline-none focus:border-green-400">
                  {[12, 18, 24, 36, 48, 60].map(t => <option key={t} value={t}>{t} months ({(t / 12).toFixed(1)} years)</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-jakarta text-gray-500 mb-1 block">Alert response SLA (hours)</label>
                <input type="number" min={1} max={48} value={inp.responseSlaDays}
                  onChange={e => set('responseSlaDays', Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-jakarta focus:outline-none focus:border-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="space-y-4">
          {/* Quick summary */}
          <div className="card p-5" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
            <h3 className="font-jakarta font-semibold mb-3" style={{ color: '#002400' }}>Quick Summary</h3>
            <div className="space-y-2 text-sm font-jakarta" style={{ color: '#006300' }}>
              <div className="flex justify-between"><span>Total devices</span><span className="font-semibold">{totalDevices}</span></div>
              <div className="flex justify-between"><span>Gateways</span><span className="font-semibold">{inp.gatewayCount}</span></div>
              {inp.offerType === 'upfront' ? (
                <>
                  <div className="flex justify-between border-t border-green-100 pt-2"><span>Initial purchase</span><span className="font-bold" style={{ color: '#002400' }}>{fmt0(upfrontTotal)}</span></div>
                  <div className="flex justify-between"><span>Monthly connection</span><span className="font-bold" style={{ color: '#002400' }}>{fmt(monthlyConnTotal)}/mo</span></div>
                </>
              ) : (
                <div className="flex justify-between border-t border-green-100 pt-2"><span>Monthly bundled</span><span className="font-bold" style={{ color: '#002400' }}>{fmt(bundledMonthlyTotal)}/mo</span></div>
              )}
              <div className="flex justify-between border-t border-green-100 pt-2"><span>Contract term</span><span className="font-semibold">{inp.contractTerm} months</span></div>
            </div>
            <div className="mt-3 p-2 rounded-lg bg-yellow-50 border border-yellow-100">
              <p className="text-xs font-jakarta text-yellow-800">⚠️ Submit to sales@pestsense.com before presenting to customer</p>
            </div>
          </div>

          {/* Text proposal */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-jakarta font-semibold text-gray-800 text-sm">Proposal Text</h3>
              <button onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-jakarta transition-all"
                style={{ borderColor: copied ? '#61ce70' : '#e5e7eb', color: copied ? '#006300' : '#6b7280' }}>
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="text-xs font-mono text-gray-600 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-3">
              {proposalText}
            </pre>
          </div>

          <Link href="/sales/templates"
            className="block w-full py-2.5 px-4 rounded-xl border border-gray-200 font-jakarta font-semibold text-gray-700 hover:bg-gray-50 transition-all text-sm text-center">
            View Templates &amp; Playbooks →
          </Link>
        </div>
      </div>
    </div>
  )
}
