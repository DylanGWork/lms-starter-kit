'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'

type Template = {
  id: string
  title: string
  description: string
  category: 'discovery' | 'objection' | 'proposal' | 'followup'
  content: string
}

const TEMPLATES: Template[] = [
  {
    id: 'discovery-checklist',
    title: 'Discovery Conversation Checklist',
    description: 'Use this in your first meeting to uncover the right pain points and qualify the opportunity.',
    category: 'discovery',
    content: `DISCOVERY CONVERSATION CHECKLIST
PestSense Sales — First Meeting Guide
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEFORE THE MEETING
□ Research their industry (food / healthcare / retail / warehouse)
□ Check if they're HACCP or similar compliance-certified
□ Note any recent pest or food safety incidents in their industry
□ Confirm who you're meeting (operations manager? procurement? owner?)

OPENING — SET THE AGENDA
"I'd like to understand your current pest control setup and where you see gaps — then I can show you how digital monitoring solves those problems specifically. Does that work for you?"

DISCOVERY QUESTIONS — PICK 4–6 MOST RELEVANT

□ COMPLIANCE
"What do your auditors ask to see about your pest management program?"
"Are your current reports good enough for auditors — can you show trends over time?"

□ PEST IMPACT
"What would happen to your business if pests got out of control here?"
"Have you had any pest incidents or near-misses in the past 2 years?"

□ CURRENT SERVICE
"How satisfied are you with the frequency of your current service?"
"What do you know about what happens between visits?"
"Do you get any notification if there's activity between scheduled services?"

□ SITE ACCESS
"Do you have any areas that are hard to access or too sensitive for regular chemical treatment?"
"Are there restricted zones (e.g. production floors, cold rooms) that limit visit frequency?"

□ CONTRACT STATUS
"When does your current pest control contract renew?"
"Are you tied to a minimum term or can you move when ready?"

□ MULTI-SITE
"How do you currently get visibility across all your sites from one place?"
"Is reporting consistent across locations?"

QUALIFICATION SUMMARY
After discovery, score: Strong / Good / Possible / Poor Fit
(Use the Customer Fit Calculator in the Sales Hub)

GREEN FLAGS = prioritise:
✓ HACCP or food safety compliance required
✓ Audit documentation pain
✓ Recent incident or near-miss
✓ Multiple sites / hard-to-access areas
✓ Contract renewing within 6 months
✓ Unhappy with current reporting

RED FLAGS = deprioritise:
✗ Price-only decision-making
✗ No compliance requirements
✗ Single small low-risk site
✗ Not open to minimum term commitment

CLOSE THE DISCOVERY
"Based on what you've told me, I'd like to put together a proposal showing how PestSense would work for [specific site/issue they mentioned]. Can we schedule 30 minutes to walk through that together?"`,
  },
  {
    id: 'objection-sheet',
    title: 'Objection Handling Quick-Reference',
    description: 'Fast responses to the 8 most common objections. Keep this handy for calls and meetings.',
    category: 'objection',
    content: `OBJECTION HANDLING QUICK-REFERENCE
PestSense Sales
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. "IT'S TOO EXPENSIVE"
→ "Compared to what? If we're comparing to traditional service, digital does significantly more — 24/7 monitoring, automated reports, and customer portal access aren't included in a basic visit contract."
→ "Let me ask — what would a pest incident cost your business? Not the monitoring fee — what would one real incident actually cost you?"
→ Run the A/B Business Model Calculator and Risk Impact Tool together.

2. "WE'RE HAPPY WITH OUR CURRENT PROVIDER"
→ "That's great. What does your current service do for you when a problem appears between visits? Do you get alerted, or do you find out at the next scheduled service?"
→ "Do you currently have any visibility into what's happening at your site between visits?"
→ Offer a demo of the OneCloud portal — no commitment required.

3. "THE DEVICES WILL DISRUPT OUR OPERATIONS"
→ "Installation can be scheduled outside core hours. The gateway needs one power point and one network cable — that's the most involved part. Device installation is quick: insert batteries, scan QR, mount."
→ "Our devices use standard alkaline batteries — no fire risk. This was the deciding factor for one of the largest digital rollouts in Australia where a competitor's lithium-battery solution was blocked."

4. "WHAT IF THE TECHNOLOGY DOESN'T WORK?"
→ "The platform is purpose-built for pest control — not adapted from something else. Battery life is ~2 years, with remote monitoring so you get a low-battery alert before any device goes offline."
→ "I can connect you with a similar business that's been running PestSense for 2+ years if you'd like to hear directly from them."

5. "WE DON'T HAVE THE BUDGET"
→ "The bundled model has no upfront equipment cost — it's a predictable monthly fee. For 20 devices, that's around $300/month. Does that change the conversation?"
→ "We could also start with one high-priority site and expand once you've seen the value."

6. "WE'RE LOCKED INTO A CONTRACT"
→ "Understood. When does that contract renew? [Note date.] I'd like to make sure you have everything you need to evaluate digital pest control when that time comes. Can I stay in touch?"

7. "WE ALREADY DO REGULAR INSPECTIONS"
→ "Regular visits are still part of digital pest control — but they're data-triggered rather than scheduled. Your technician knows exactly which station to go to and arrives prepared. No time wasted on untouched stations."
→ "Think of it like this: with traditional service, you find out what happened at the last visit. With digital, you know the moment it happens."

8. "CAN YOU JUST DO A TRADITIONAL QUOTE TOO?"
→ "Absolutely — I'll include both so you can compare them side by side. But I want to make sure you're comparing apples to apples: the digital quote includes things your traditional quote doesn't — 24/7 monitoring, portal access, and audit-ready reporting. Once you see the full picture, the decision usually becomes clear."`,
  },
  {
    id: 'proposal-wording',
    title: 'Proposal Wording Templates',
    description: 'Ready-to-use copy blocks for each section of a PestSense proposal document.',
    category: 'proposal',
    content: `PROPOSAL WORDING TEMPLATES
PestSense Sales
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPENING PARAGRAPH (Customise per customer)
"Thank you for the opportunity to present this proposal for [Customer Name]. Based on our initial conversation, we understand that [specific pain point — e.g. 'ensuring audit-ready compliance documentation across your three food production sites'] is a priority for your business. PestSense offers a complete digital monitoring solution that addresses this directly — giving you continuous protection, faster incident response, and the compliance visibility your auditors expect."

━━━━━━━━━━━━━━━━━━━━━━━━━

VALUE SECTION — 4 OUTCOMES (Adapt as needed)

REDUCED INFESTATION RISK AND PROPERTY DAMAGE
Our PestSense Predictor smart stations monitor your site 24/7, detecting rodent activity the moment it occurs — not weeks later at a scheduled visit. Early detection means faster, targeted action, dramatically reducing the risk of costly infestations, stock damage, or operational disruption.

ENHANCED TRANSPARENCY AND COMPLIANCE
Every station check-in, alert, and service visit is logged automatically in the OneCloud platform. Auditors receive professional, timestamped reports with photo evidence — generated automatically at the completion of each visit. Your compliance records are always current, always available.

PEACE OF MIND — CONTINUOUS, PROACTIVE MONITORING
The OneCloud platform gives you real-time visibility into your site status, including live device maps, activity heatmaps, and trend analysis. You know what's happening at your site at any time — without waiting for the next visit.

INCREASED EFFICIENCY AND TARGETED ACTION
Our data-driven approach means technicians skip untouched stations and go directly to active areas — arriving prepared with the right tools and control methods. Less time wasted, more time proofing and protecting your site.

━━━━━━━━━━━━━━━━━━━━━━━━━

INSTALLATION COMMITMENT BLOCKS (Customise bracketed sections)

SEAMLESS INSTALLATION AND INTEGRATION
Non-disruptive, rapid deployment of all digital sensors. Full system commissioning, quality checks, and integration with the central platform. [PCO CUSTOMISE: e.g., "Installation will be completed over two shifts outside of core operational hours to ensure zero impact on production."]

SITE AUDIT AND DIGITAL BLUEPRINT
Comprehensive, risk-based survey identifying structural vulnerabilities and high-risk zones. Development of a detailed sensor placement plan and site commissioning strategy. [PCO CUSTOMISE: e.g., "This includes mapping up to 30 devices across critical entry points and warehousing zones."]

PREDICTIVE MANAGEMENT AND OPTIMISATION
Continuous, 24/7 monitoring with guaranteed [PCO CUSTOMISE: e.g., "2-hour response SLA"] to alerts. Deep root-cause analysis of any activity trends, followed by physical and strategic recommendations.

━━━━━━━━━━━━━━━━━━━━━━━━━

CLOSING PARAGRAPH
"This proposal is a preliminary estimate subject to a formal site survey. All pricing requires PestSense review and approval before final submission. We look forward to working with [Customer Name] to deliver a safer, smarter pest management program. To proceed or ask questions, please contact [Your Name] at [Your Contact Details]."

━━━━━━━━━━━━━━━━━━━━━━━━━

TERMS BOILERPLATE
• All pricing is AUD excluding GST
• Preliminary estimate — subject to site survey and PestSense approval
• No CPI increase during contract term; changes apply at renewal
• Early termination fees apply
• Lead times subject to stock levels
• Freight/shipping is an additional cost
• Batteries: not included (upfront offer) / included (bundled offer)`,
  },
  {
    id: 'followup-email',
    title: 'Post-Meeting Follow-Up Email Templates',
    description: 'Email templates for three common post-meeting scenarios.',
    category: 'followup',
    content: `POST-MEETING FOLLOW-UP EMAIL TEMPLATES
PestSense Sales
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TEMPLATE 1: Strong interest — moving to proposal
Subject: PestSense Digital Pest Control — Next Steps for [Company]

Hi [Name],

Thanks for the time today — it was great to hear about [specific point from the conversation, e.g. "your upcoming HACCP audit requirements"].

Based on what we discussed, I'll be putting together a preliminary pricing estimate for [X devices across Y sites]. I'll have that with you by [date].

In the meantime, I thought you might find this useful: [attach the Benefits of Digital Pest Control deck or a relevant case study].

Any questions before then, just reach out.

[Your Name]

━━━━━━━━━━━━━━━━━━━━━━━━━

TEMPLATE 2: Good meeting — leaving a demo access / follow-up
Subject: Your PestSense Demo Access

Hi [Name],

Enjoyed our conversation today. As promised, here's a link to see a demo of the OneCloud customer portal in action: [OneCloud demo link].

The key things to notice:
• The real-time site map showing station status
• The activity trend graph (the kind of thing auditors love)
• The one-click visit report export

Happy to walk you through a live demo on screen when you're ready — just let me know a time.

[Your Name]

━━━━━━━━━━━━━━━━━━━━━━━━━

TEMPLATE 3: Contract not renewing yet — long-term nurture
Subject: Keeping You in the Loop — Digital Pest Control Update

Hi [Name],

Good to connect again. I know your current contract doesn't renew until [date] — I just wanted to make sure you have the information you need when that time comes.

I've attached a couple of things that might be useful in the meantime:
• [Case study relevant to their industry]
• The PestSense benefits overview

No pressure — but when [date] gets closer, I'd love to put together a comparison for you so you can make a fully informed decision.

Have a great [day/week].

[Your Name]`,
  },
  {
    id: 'qualifying-scorecard',
    title: 'Opportunity Qualifying Scorecard',
    description: 'A quick paper-based scoring tool to assess any opportunity in under 2 minutes.',
    category: 'discovery',
    content: `OPPORTUNITY QUALIFYING SCORECARD
PestSense Sales — Quick Assessment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Customer: ____________________  Date: __________

Score each factor from 0–3 (0 = No, 1 = Weak, 2 = Yes, 3 = Strong)

INDUSTRY FIT
□ Food manufacturing / distribution / HACCP site      0  1  2  3
□ Healthcare / aged care / schools / hospitality       0  1  2  3
□ Multi-site operator or large estate                  0  1  2  3
□ Hard-to-access or restricted areas present           0  1  2  3

COMPLIANCE PULL
□ Mandatory regulatory / audit requirements            0  1  2  3
□ Current reporting is painful or inadequate           0  1  2  3
□ Recent audit failure or near-miss                    0  1  2  3

COMMERCIAL READINESS
□ Contract renewing within 6 months                    0  1  2  3
□ Unhappy with current provider                        0  1  2  3
□ Open to minimum 12-month commitment                  0  1  2  3

FINANCIAL FIT
□ Open to premium service pricing                      0  1  2  3
□ High consequence if pest incident occurs             0  1  2  3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOTAL SCORE: _______ / 36

SCORING GUIDE:
28–36:  Strong Fit — Prioritise immediately
20–27:  Good Fit — Continue qualifying actively
12–19:  Possible Fit — Nurture and revisit in 3 months
0–11:   Poor Fit — Note for future; don't over-invest now

KEY NOTES FROM CONVERSATION:
___________________________________________
___________________________________________
___________________________________________

NEXT ACTION:
□ Submit proposal within _____ days
□ Schedule demo call — date: _____________
□ Nurture — next touch: _________________
□ Decline / offer traditional service quote`,
  },
]

const CATEGORY_LABELS: Record<string, string> = {
  discovery: 'Discovery',
  objection: 'Objections',
  proposal: 'Proposals',
  followup: 'Follow-up',
}

const CATEGORY_COLORS: Record<string, string> = {
  discovery: '#61ce70',
  objection: '#d97706',
  proposal: '#002400',
  followup: '#018902',
}

export default function TemplatesPage() {
  const [open, setOpen] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const filtered = filter === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.category === filter)

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <nav className="flex items-center gap-2 text-sm text-gray-400 font-jakarta mb-6">
        <Link href="/sales" className="hover:text-gray-600">Sales Hub</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700">Templates &amp; Playbooks</span>
      </nav>

      <div className="mb-6">
        <h1 className="font-geologica font-black text-2xl text-gray-900 mb-2">Templates &amp; Playbooks</h1>
        <p className="text-gray-500 font-jakarta text-sm">Ready-to-use sales tools. Click to expand, then copy to your clipboard.</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['all', 'discovery', 'objection', 'proposal', 'followup'].map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-jakarta font-semibold transition-all border ${filter === cat ? 'text-white border-transparent' : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'}`}
            style={filter === cat ? { backgroundColor: cat === 'all' ? '#0d0d0d' : CATEGORY_COLORS[cat] } : {}}>
            {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(template => (
          <div key={template.id} className="card border border-gray-100">
            <button
              onClick={() => setOpen(open === template.id ? null : template.id)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="inline-block px-2 py-0.5 rounded-full text-white text-xs font-jakarta font-semibold flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: CATEGORY_COLORS[template.category] }}>
                  {CATEGORY_LABELS[template.category]}
                </span>
                <div className="min-w-0">
                  <div className="font-jakarta font-semibold text-gray-900">{template.title}</div>
                  <div className="text-sm text-gray-500 font-jakarta mt-0.5">{template.description}</div>
                </div>
              </div>
              {open === template.id
                ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 ml-3" />
                : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-3" />}
            </button>

            {open === template.id && (
              <div className="border-t border-gray-100">
                <div className="flex justify-end px-5 pt-3">
                  <button
                    onClick={() => handleCopy(template.id, template.content)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-jakarta transition-all"
                    style={{
                      borderColor: copied === template.id ? '#61ce70' : '#e5e7eb',
                      color: copied === template.id ? '#006300' : '#6b7280',
                    }}>
                    {copied === template.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied === template.id ? 'Copied!' : 'Copy to clipboard'}
                  </button>
                </div>
                <pre className="px-5 py-4 text-xs font-mono text-gray-600 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {template.content}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 card p-4 bg-green-50 border-green-100">
        <p className="text-xs font-jakarta text-green-800">
          <strong>Remember:</strong> All proposals and pricing must be submitted to <strong>sales@pestsense.com</strong> for review and approval before presenting to a customer.
        </p>
      </div>
    </div>
  )
}
