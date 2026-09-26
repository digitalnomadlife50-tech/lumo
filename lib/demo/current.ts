import type { CurrentDecision } from "./types"

export const CURRENT_DECISION: CurrentDecision = {
  number: 41,
  question: "Ship the new booking flow on October 14, or hold three weeks for Brightline?",
  kind: "timing",
  sources: [
    {
      id: "slack",
      label: "Slack #booking-launch",
      lines: [
        "Dana: Brightline wants the multi-location view before they sign. They're talking about a three-year deal.",
        "Marco: Multi-location is three weeks, minimum. Can't do it alongside the payments fix.",
      ],
    },
    {
      id: "linear",
      label: "Linear REL-412",
      lines: ["Payments fix. Double charges on rescheduled bookings. 40 customers affected."],
    },
    {
      id: "docs",
      label: 'Google Doc "Q4 plan"',
      lines: ["New booking flow ships October 14."],
    },
    {
      id: "calendar",
      label: "Google Calendar",
      lines: ["Launch review with Maya, Friday 10am."],
    },
  ],
  options: [
    { letter: "A", label: "Ship on the 14th, multi-location later", summary: "Hit the Q4 date with the payments fix. Multi-location comes after.", source: "user" },
    { letter: "B", label: "Hold three weeks and ship everything together", summary: "Delay the launch so Brightline gets multi-location at the same time.", source: "user" },
    { letter: "C", label: "Ship on the 14th and give Brightline a committed date for multi-location", summary: "Launch on time, and put a real date in writing for the feature Brightline wants.", source: "lumo" },
  ],
  gut: { option: "A", confidence: 4, worry: "Brightline walks" },
  findings: {
    research: "In last week's call notes, Brightline's ops director said the date is flexible if they get it in writing.",
    outsideView: "Your last six decisions about dates and deadlines: four turned out worse than expected. Marco's payments estimates have run long three times.",
    premortem: "It's November. Brightline signed with someone else. \"Later\" sounded like \"never\" because nobody gave them a date.",
    playItForward: [
      { option: "A", beats: ["Oct 14: ships. Payments fix goes out.", "Oct 20: Brightline asks when. Dana has no answer.", "Nov: deal stalls."] },
      { option: "B", beats: ["Oct 14: no launch. Payments bug stays live for 40 customers.", "Nov 4: everything ships together.", "Nov: support digs out of three more weeks of double-charge tickets."] },
      { option: "C", beats: ["Oct 14: ships with the payments fix.", "Oct 15: Dana sends Brightline a written date for multi-location.", "Nov 4: multi-location ships on the date. Brightline signs."] },
    ],
  },
  gap: "Your gut got the ship date right. You missed that Brightline cares more about a date than the feature.",
  resurfaced: {
    decisionNumber: 29,
    title: "Commit a date for Acme's audit logs",
    outcome: "The date moved twice and Acme escalated.",
    lesson: "Add Marco's worst case before giving a customer a date.",
    ifThen: "When I give a customer a date, I add the engineering lead's worst case first.",
  },
  final: {
    option: "C",
    confidence: 3,
    why: "Brightline needs a date more than the feature, and the payments fix can't wait three weeks.",
    gaveUp: "Closing Brightline this quarter",
  },
  tripwire: "If Marco's estimate goes past four weeks, revisit",
  revisitDate: "2026-10-28",
  drafts: [
    {
      audience: "Maya Chen",
      channel: "dm",
      body: "Quick heads-up before Friday's review. I'm shipping the booking flow on the 14th with the payments fix, not holding for Brightline. Marco can't do multi-location alongside the payments work, and the double-charge bug is hitting 40 customers now. Dana will give Brightline a written date for multi-location on Nov 4. Risk: if Marco's estimate grows, that date moves, so I'm revisiting on the 28th.",
      pushback: { objection: "We can't move another date. This is the third one this quarter.", response: "That's why I'm giving a range internally and only committing Nov 4 to Brightline after Marco confirms. If his estimate grows past four weeks, you'll hear it from me on the 28th, not after." },
    },
    {
      audience: "Marco Diaz",
      channel: "slack",
      body: "Going with: ship the 14th with the payments fix, multi-location right after. I need a real worst-case on multi-location by Friday so Dana can give Brightline a date we can actually hit. If it's more than four weeks, tell me now and I will set the date from that.",
      pushback: { objection: "I can't promise a multi-location date until I dig into the location model.", response: "Understood. Give me your worst case, not your best. I'd rather quote long and hit it than quote tight and miss." },
    },
    {
      audience: "Dana Brooks",
      channel: "slack",
      body: "Plan for Brightline: we ship the 14th, and you give them a written date for multi-location, Nov 4. Their ops director already said the date is flexible if it is in writing. Please don't send the date until Marco confirms his estimate Friday. I'll get it to you same day.",
      pushback: { objection: "Brightline is ready now. Waiting on a date could lose the deal.", response: "The date is what keeps them. Their own ops lead said so. What loses the deal is silence in three weeks, which is what happens if we ship and say nothing." },
    },
    {
      audience: "Priya Shah",
      channel: "slack",
      body: "Booking flow ships the 14th with the payments fix for the double-charge bug, REL-412, 40 customers affected. You'll likely see a bump in booking-flow questions that week. Multi-location comes Nov 4. Flagging early so support isn't the last to know.",
      pushback: { objection: "We're still cleaning up tickets from the last launch.", response: "Fair. The payments fix should cut the double-charge tickets you're seeing now. I'll send you the known-issues list two days before the 14th so your team has answers ready." },
    },
    {
      audience: "Brightline",
      channel: "email",
      body: "Thanks for the patience on multi-location. Here's where things land. On October 14 we're shipping an updated booking flow with a payments fix. Multi-location, the view your team asked for, ships November 4. That date is on our roadmap and I will keep you posted as it gets close. Happy to walk your ops team through it before then.",
      pushback: { objection: "Can you commit to that November date?", response: "Yes. It's on our plan and I'll flag it early if anything changes. You'll have the multi-location view for your team by November 4." },
    },
  ],
}
