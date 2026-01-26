import { Mail, MessageSquare, Clock, HelpCircle } from "lucide-react"
import Link from "next/link"

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    description: "For general inquiries and support",
    action: "hello@trailnetzero.com",
    href: "mailto:hello@trailnetzero.com",
  },
  {
    icon: MessageSquare,
    title: "Slack Help Desk",
    description: "For existing members needing support",
    action: "Available to members",
    href: "/#join",
  },
]

const topics = [
  "Membership questions",
  "Partnership opportunities",
  "Press and media inquiries",
  "Technical support",
  "Community guidelines",
  "Billing and payments",
]

export function ContactInfo() {
  return (
    <div className="space-y-8">
      {/* Contact Methods */}
      <div className="space-y-4">
        {contactMethods.map((method) => (
          <Link
            key={method.title}
            href={method.href}
            className="group flex items-start gap-4 rounded-xl border border-border bg-white p-5 transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <method.icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{method.title}</h3>
              <p className="mt-1 text-sm text-foreground/70">{method.description}</p>
              <p className="mt-2 text-sm font-medium text-primary">{method.action}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Response Time */}
      <div className="rounded-xl border border-border bg-white p-5">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Response Time</h3>
        </div>
        <p className="mt-2 text-sm text-foreground/70">
          We typically respond within 1-2 business days. For urgent membership issues, 
          existing members can use the Slack help desk for faster support.
        </p>
      </div>

      {/* Topics We Can Help With */}
      <div className="rounded-xl border border-border bg-white p-5">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Topics We Can Help With</h3>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-2">
          {topics.map((topic) => (
            <li key={topic} className="flex items-center gap-2 text-sm text-foreground/70">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {topic}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
