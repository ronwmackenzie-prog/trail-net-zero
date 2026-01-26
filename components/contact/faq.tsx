"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
  {
    question: "Who is Trail Net Zero for?",
    answer: "Trail Net Zero is designed for industry practitioners: trail race directors, apparel and footwear manufacturers, sports nutrition brands, sustainability consultants, LCA specialists, and land managers. It's intentionally not aimed at casual runners or the general public.",
  },
  {
    question: "What does membership include?",
    answer: "Membership provides access to our Slack workspace (Trail Bites, Threads, and Treads), which includes organized channels for core topics, working groups, case studies, and direct connection with fellow practitioners. You also get participation in community governance and verified contributor recognition.",
  },
  {
    question: "How much does membership cost?",
    answer: "Membership is $15 per month, billed monthly through our secure Stripe integration. You can cancel anytime.",
  },
  {
    question: "Is there a free trial?",
    answer: "We don't offer a free trial, but you can cancel your membership at any time with no penalties. We want members who are committed to contributing to the community's mission.",
  },
  {
    question: "How is the community moderated?",
    answer: "We have clear community guidelines, a transparent moderation process, and published escalation procedures. Our focus is on maintaining evidence-based, professional discourse while preventing greenwashing and unsubstantiated claims.",
  },
  {
    question: "Can I join as an individual or just as a company?",
    answer: "Both individuals and companies can join. Membership is tied to individuals, though many companies sponsor membership for their sustainability team members.",
  },
]

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--section-light-blue)' }}>
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-foreground/70">
            Common questions about Trail Net Zero membership and community.
          </p>
        </div>

        <div className="mt-10 space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="rounded-xl border border-border bg-white"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between p-5 text-left"
              >
                <span className="font-medium text-foreground">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-foreground/60 transition-transform",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              {openIndex === index && (
                <div className="border-t border-border px-5 pb-5 pt-4">
                  <p className="text-foreground/70">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
