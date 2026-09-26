import type { DemoDecision, DecisionKind, Stakes, Soundness, ResultRating } from "./types"

/* Compact spec rows. The builder below turns these into full DemoDecision
   records with dates spread across the last 8 months. The set is tuned to
   produce these patterns:
   - Timing calls: average confidence >= 4, most turn out worse.
   - People and hiring calls: mostly as expected or better.
   - Support is affected in about half of all calls; Priya is told in only a few.
   - "Do nothing" is never an option.
   - Gut and final match about 70% of the time; when Sam changed their mind,
     results were better more often than not. */

interface Spec {
  n: number
  kind: DecisionKind
  stakes: Stakes
  title: string
  options: string[]
  gutOpt: string
  gutConf: number
  worry: string
  finalOpt: string
  finalConf: number
  why: string
  gaveUp: string
  audiences: string[]
  tripwire: string
  support: boolean
  whatHappened: string
  sound: Soundness
  result: ResultRating
  lesson: string
}

const S: Spec[] = [
  {
    n: 1, kind: "strategy", stakes: "two-way", title: "Rebuild booking search or patch the old one",
    options: ["Patch the current search", "Rebuild search from scratch"],
    gutOpt: "Patch the current search", gutConf: 3, worry: "We keep patching forever",
    finalOpt: "Rebuild search from scratch", finalConf: 3, why: "The patches were stacking up and nobody understood the code anymore",
    gaveUp: "Two clean sprints", audiences: ["Maya Chen", "Marco Diaz"], tripwire: "If the rebuild runs past three sprints, stop and ship the patch",
    support: true, whatHappened: "Rebuild took two sprints and search complaints dropped by half", sound: "yes", result: "better", lesson: "When the code scares the team, that is the signal to rebuild.",
  },
  {
    n: 2, kind: "scope", stakes: "two-way", title: "Ship reminders with SMS or email only",
    options: ["Email only for launch", "Email and SMS together"],
    gutOpt: "Email and SMS together", gutConf: 3, worry: "SMS costs blow up",
    finalOpt: "Email only for launch", finalConf: 4, why: "Email covered 80 percent of the value and we could add SMS later",
    gaveUp: "A splashier launch", audiences: ["Dana Brooks", "Marco Diaz"], tripwire: "If open rates fall below 40 percent, add SMS",
    support: false, whatHappened: "Email reminders cut no-shows and SMS shipped a month later", sound: "yes", result: "better", lesson: "Shipping the 80 percent first bought us real data.",
  },
  {
    n: 3, kind: "timing", stakes: "one-way", title: "Commit a March date for the calendar rewrite",
    options: ["Commit the March date", "Hold the date until the spike is done"],
    gutOpt: "Commit the March date", gutConf: 4, worry: "Marco's estimate is soft",
    finalOpt: "Commit the March date", finalConf: 4, why: "Sales needed something to tell the pipeline",
    gaveUp: "Slack in the schedule", audiences: ["Maya Chen", "Dana Brooks"], tripwire: "If the spike runs long, move the date before sales quotes it",
    support: true, whatHappened: "The rewrite moved two weeks and sales had to walk back a date", sound: "partly", result: "worse", lesson: "A soft estimate is not a date.",
  },
  {
    n: 4, kind: "vendor", stakes: "two-way", title: "Pick the SMS provider for reminders",
    options: ["Twilio", "MessageBird"],
    gutOpt: "Twilio", gutConf: 4, worry: "Twilio pricing at scale",
    finalOpt: "Twilio", finalConf: 4, why: "The team already knew the API and docs were solid",
    gaveUp: "A slightly cheaper rate", audiences: ["Marco Diaz"], tripwire: "If monthly SMS spend passes 2k, revisit MessageBird",
    support: false, whatHappened: "Integration took two days and delivery was reliable", sound: "yes", result: "as-expected", lesson: "Familiar tools ship faster than cheap ones.",
  },
  {
    n: 5, kind: "hiring", stakes: "one-way", title: "Backfill the open PM role now or wait",
    options: ["Hire the internal transfer", "Keep looking for a stronger external"],
    gutOpt: "Hire the internal transfer", gutConf: 4, worry: "They may be too junior for the roadmap",
    finalOpt: "Hire the internal transfer", finalConf: 4, why: "They knew the product and the team trusted them",
    gaveUp: "A more senior outside hire", audiences: ["Maya Chen"], tripwire: "If they struggle with the roadmap by month two, pair them with a senior PM",
    support: false, whatHappened: "They ramped fast and owned reminders end to end", sound: "yes", result: "as-expected", lesson: "Product knowledge beats a bigger resume for owned areas.",
  },
  {
    n: 6, kind: "scope", stakes: "two-way", title: "Cut recurring bookings from the Q2 release",
    options: ["Keep recurring bookings in", "Cut recurring bookings to next quarter"],
    gutOpt: "Keep recurring bookings in", gutConf: 3, worry: "Sales promised it",
    finalOpt: "Cut recurring bookings to next quarter", finalConf: 3, why: "It was half-built and would have delayed everything else",
    gaveUp: "A promise sales made", audiences: ["Dana Brooks", "Jordan Lee"], tripwire: "If two enterprise deals need it, pull it back in",
    support: true, whatHappened: "The rest of the release shipped on time and recurring landed in Q3", sound: "yes", result: "better", lesson: "Cutting the half-built thing protected the whole release.",
  },
  {
    n: 7, kind: "people", stakes: "two-way", title: "Tell a strong engineer their pet project is dead",
    options: ["End the project and reassign them", "Give it one more sprint"],
    gutOpt: "End the project and reassign them", gutConf: 4, worry: "They quit",
    finalOpt: "End the project and reassign them", finalConf: 4, why: "It had no path to customers and they deserved the truth",
    gaveUp: "A comfortable conversation", audiences: ["Marco Diaz", "Priya Shah"], tripwire: "If they disengage, set up a real growth plan",
    support: false, whatHappened: "They were frustrated for a week, then took on onboarding and did well", sound: "yes", result: "as-expected", lesson: "Say the hard thing early and give them somewhere to land.",
  },
  {
    n: 8, kind: "timing", stakes: "one-way", title: "Agree to a partner's launch date",
    options: ["Agree to the partner date", "Ask for two more weeks"],
    gutOpt: "Agree to the partner date", gutConf: 4, worry: "We under-scoped the integration",
    finalOpt: "Agree to the partner date", finalConf: 4, why: "The partner had a marketing push booked",
    gaveUp: "A safe buffer", audiences: ["Maya Chen", "Dana Brooks"], tripwire: "If the integration spec grows, renegotiate the date",
    support: true, whatHappened: "The date moved and the support backlog doubled during the scramble", sound: "no", result: "worse", lesson: "Someone else's marketing date is not your engineering date.",
  },
  {
    n: 9, kind: "strategy", stakes: "two-way", title: "Chase enterprise or double down on SMB",
    options: ["Stay focused on SMB", "Start building for enterprise"],
    gutOpt: "Stay focused on SMB", gutConf: 3, worry: "We miss the bigger deals",
    finalOpt: "Start building for enterprise", finalConf: 3, why: "Three SMB features already unlocked enterprise with small additions",
    gaveUp: "A simpler roadmap", audiences: ["Maya Chen"], tripwire: "If enterprise work stalls SMB velocity, pull back",
    support: false, whatHappened: "Two enterprise pilots signed without hurting SMB pace", sound: "yes", result: "better", lesson: "The bridge to enterprise was shorter than it looked.",
  },
  {
    n: 10, kind: "people", stakes: "two-way", title: "Split the booking team into two pods",
    options: ["Keep one team", "Split into two focused pods"],
    gutOpt: "Split into two focused pods", gutConf: 4, worry: "We lose shared context",
    finalOpt: "Split into two focused pods", finalConf: 4, why: "One team was spread across too many surfaces",
    gaveUp: "Easy cross-coverage", audiences: ["Marco Diaz", "Jordan Lee"], tripwire: "If the pods drift apart, add a weekly sync",
    support: false, whatHappened: "Both pods moved faster and ownership got clearer", sound: "yes", result: "better", lesson: "Focus beat flexibility for a team that was stretched.",
  },
  {
    n: 11, kind: "scope", stakes: "two-way", title: "Add a booking buffer setting or keep it fixed",
    options: ["Keep the fixed buffer", "Add a configurable buffer"],
    gutOpt: "Add a configurable buffer", gutConf: 3, worry: "Settings sprawl",
    finalOpt: "Add a configurable buffer", finalConf: 3, why: "Field techs kept asking and it was a small change",
    gaveUp: "A simpler settings page", audiences: ["Jordan Lee"], tripwire: "If fewer than 10 percent use it, hide it behind advanced settings",
    support: true, whatHappened: "About a quarter of pros set it and support tickets on double-booking dropped", sound: "yes", result: "as-expected", lesson: "A small setting can remove a whole class of tickets.",
  },
  {
    n: 12, kind: "vendor", stakes: "two-way", title: "Pick the analytics tool",
    options: ["Amplitude", "Mixpanel"],
    gutOpt: "Amplitude", gutConf: 4, worry: "Migration effort",
    finalOpt: "Amplitude", finalConf: 4, why: "The team preferred the query model and pricing fit our volume",
    gaveUp: "A tool two people already knew", audiences: ["Maya Chen", "Marco Diaz"], tripwire: "If dashboards go unused for a month, revisit",
    support: false, whatHappened: "Adoption was high and the funnels shaped the roadmap", sound: "yes", result: "better", lesson: "Pick the tool the team will actually open.",
  },
  {
    n: 13, kind: "hiring", stakes: "one-way", title: "Hire a contractor or a full-time engineer",
    options: ["Bring on a contractor", "Hire full-time"],
    gutOpt: "Hire full-time", gutConf: 4, worry: "Slower to fill",
    finalOpt: "Hire full-time", finalConf: 4, why: "The work was core and would outlast a contract",
    gaveUp: "Speed", audiences: ["Maya Chen", "Marco Diaz"], tripwire: "If the search runs past six weeks, bridge with a contractor",
    support: false, whatHappened: "The hire filled in five weeks and owned the payments surface", sound: "yes", result: "better", lesson: "Core work deserves a full-time owner.",
  },
  {
    n: 14, kind: "timing", stakes: "one-way", title: "Ship the redesign before or after the busy season",
    options: ["Ship before the busy season", "Wait until after"],
    gutOpt: "Wait until after", gutConf: 4, worry: "Momentum stalls",
    finalOpt: "Wait until after", finalConf: 4, why: "A redesign during peak bookings was too risky",
    gaveUp: "Early wins", audiences: ["Maya Chen", "Dana Brooks"], tripwire: "If a competitor ships first, reassess",
    support: true, whatHappened: "Shipped right after peak with no booking disruption", sound: "yes", result: "as-expected", lesson: "Protect the busy season, even when waiting feels slow.",
  },
  {
    n: 15, kind: "strategy", stakes: "two-way", title: "Open the API to partners now or later",
    options: ["Keep the API internal for now", "Open a partner API"],
    gutOpt: "Keep the API internal for now", gutConf: 3, worry: "Support load from partners",
    finalOpt: "Open a partner API", finalConf: 3, why: "Two partners were ready to build and it opened a channel",
    gaveUp: "A quiet quarter", audiences: ["Maya Chen", "Marco Diaz"], tripwire: "If partner tickets swamp the team, gate access",
    support: true, whatHappened: "Two integrations shipped and drove referral bookings", sound: "yes", result: "better", lesson: "A gated API opened a channel without drowning us.",
  },
  {
    n: 16, kind: "scope", stakes: "two-way", title: "Include refunds in the payments fix or defer",
    options: ["Fix charges only", "Fix charges and refunds together"],
    gutOpt: "Fix charges and refunds together", gutConf: 4, worry: "Scope creep on a hot fix",
    finalOpt: "Fix charges only", finalConf: 4, why: "Double charges were the fire; refunds could follow",
    gaveUp: "A complete fix in one pass", audiences: ["Marco Diaz", "Priya Shah"], tripwire: "If refund complaints spike, fast-follow",
    support: true, whatHappened: "Charges fix shipped fast and refunds followed two weeks later", sound: "yes", result: "as-expected", lesson: "On a hot fix, put out the fire first.",
  },
  {
    n: 17, kind: "people", stakes: "two-way", title: "Move Jordan's team onto the booking redesign",
    options: ["Keep Jordan's team where they are", "Move them onto the redesign"],
    gutOpt: "Move them onto the redesign", gutConf: 4, worry: "Jordan feels blindsided",
    finalOpt: "Move them onto the redesign", finalConf: 4, why: "The redesign needed design muscle and they were the best fit",
    gaveUp: "The project they were on", audiences: ["Jordan Lee", "Maya Chen"], tripwire: "If morale dips, revisit the staffing",
    support: false, whatHappened: "The redesign got sharper and Jordan was fine once told early", sound: "yes", result: "as-expected", lesson: "Give Jordan the heads-up before the move, not after.",
  },
  {
    n: 18, kind: "strategy", stakes: "two-way", title: "Build a mobile app or improve the mobile web",
    options: ["Improve mobile web", "Build a native app"],
    gutOpt: "Build a native app", gutConf: 2, worry: "We stretch the team thin",
    finalOpt: "Improve mobile web", finalConf: 3, why: "Most bookings were one-off and did not need an install",
    gaveUp: "A shiny app store presence", audiences: ["Maya Chen"], tripwire: "If repeat mobile use grows, revisit native",
    support: false, whatHappened: "Mobile web conversion improved and no app was needed yet", sound: "yes", result: "as-expected", lesson: "Match the platform to how people actually book.",
  },
  {
    n: 19, kind: "timing", stakes: "one-way", title: "Promise a Q3 date for multi-user accounts",
    options: ["Promise the Q3 date", "Give a quarter range instead"],
    gutOpt: "Promise the Q3 date", gutConf: 5, worry: "Auth work is unscoped",
    finalOpt: "Promise the Q3 date", finalConf: 5, why: "A big account was waiting on it",
    gaveUp: "Room to be wrong", audiences: ["Maya Chen", "Dana Brooks"], tripwire: "If auth scoping grows, widen the date to a range",
    support: false, whatHappened: "Auth was bigger than expected and the date moved a month", sound: "no", result: "worse", lesson: "High confidence on unscoped auth work is a warning sign.",
  },
  {
    n: 20, kind: "vendor", stakes: "two-way", title: "Switch email providers or stay",
    options: ["Stay on the current provider", "Move to a new provider"],
    gutOpt: "Stay on the current provider", gutConf: 3, worry: "Migration breaks deliverability",
    finalOpt: "Move to a new provider", finalConf: 3, why: "Deliverability had been dropping and support was slow",
    gaveUp: "A stable status quo", audiences: ["Marco Diaz"], tripwire: "If bounce rates rise after the move, roll back",
    support: false, whatHappened: "Deliverability recovered within a week of the switch", sound: "yes", result: "better", lesson: "A provider that ignores you is already a risk.",
  },
  {
    n: 21, kind: "timing", stakes: "one-way", title: "Promise the Q2 roadmap date to the board deck",
    options: ["Put the date in the deck", "Show a range in the deck"],
    gutOpt: "Put the date in the deck", gutConf: 5, worry: "The deck becomes a commitment",
    finalOpt: "Put the date in the deck", finalConf: 5, why: "The board wanted specifics and I felt good about the plan",
    gaveUp: "Flexibility", audiences: ["Maya Chen"], tripwire: "If any milestone moves, update the board before the date passes",
    support: false, whatHappened: "The date moved three weeks and it was awkward at the next board meeting", sound: "no", result: "worse", lesson: "A date in a board deck is a promise, not a plan.",
  },
  {
    n: 22, kind: "hiring", stakes: "one-way", title: "Promote from within or hire a design manager",
    options: ["Promote a senior designer", "Hire a design manager"],
    gutOpt: "Promote a senior designer", gutConf: 4, worry: "They miss the management skills",
    finalOpt: "Promote a senior designer", finalConf: 4, why: "They already led the team informally and wanted it",
    gaveUp: "Outside management experience", audiences: ["Jordan Lee", "Maya Chen"], tripwire: "If they struggle with people work, get them a coach",
    support: false, whatHappened: "They grew into the role with some coaching", sound: "yes", result: "as-expected", lesson: "Promote the person the team already follows.",
  },
  {
    n: 23, kind: "strategy", stakes: "two-way", title: "Add a free tier or stay paid only",
    options: ["Stay paid only", "Add a limited free tier"],
    gutOpt: "Add a limited free tier", gutConf: 3, worry: "Free users never convert",
    finalOpt: "Add a limited free tier", finalConf: 3, why: "Solo pros needed a way in before paying",
    gaveUp: "Simple pricing", audiences: ["Maya Chen", "Dana Brooks"], tripwire: "If conversion stays under 5 percent, rethink the tier",
    support: true, whatHappened: "Free-to-paid conversion landed around 8 percent", sound: "yes", result: "as-expected", lesson: "A narrow free tier can be a real front door.",
  },
  {
    n: 24, kind: "timing", stakes: "one-way", title: "Delay the pricing change past renewal season",
    options: ["Ship pricing now", "Wait until after renewals"],
    gutOpt: "Wait until after renewals", gutConf: 4, worry: "We leave money on the table",
    finalOpt: "Wait until after renewals", finalConf: 4, why: "A price change mid-renewal would spook accounts",
    gaveUp: "Faster revenue", audiences: ["Maya Chen", "Dana Brooks"], tripwire: "If churn signals appear, hold longer",
    support: true, whatHappened: "Renewals closed clean and pricing shipped after with low churn", sound: "yes", result: "better", lesson: "Putting a price change around renewals paid off.",
  },
  {
    n: 25, kind: "scope", stakes: "two-way", title: "Cut the calendar sync feature from the spring release",
    options: ["Keep calendar sync in spring", "Cut it to a later release"],
    gutOpt: "Keep calendar sync in spring", gutConf: 3, worry: "Power users are waiting",
    finalOpt: "Cut it to a later release", finalConf: 3, why: "It was dragging the release and only a slice of users needed it",
    gaveUp: "A feature power users wanted", audiences: ["Jordan Lee", "Dana Brooks"], tripwire: "If churn ties to sync, pull it forward",
    support: false, whatHappened: "The release shipped clean and sync landed later with a better design", sound: "yes", result: "better", lesson: "Cutting the slow feature made the whole release better.",
  },
  {
    n: 26, kind: "people", stakes: "two-way", title: "Give hard feedback to a well-liked lead",
    options: ["Have the direct conversation", "Let it ride another cycle"],
    gutOpt: "Let it ride another cycle", gutConf: 3, worry: "It sours the relationship",
    finalOpt: "Have the direct conversation", finalConf: 4, why: "Their planning was off and the team felt it",
    gaveUp: "An easy few weeks", audiences: ["Maya Chen"], tripwire: "If planning does not improve in a cycle, escalate",
    support: false, whatHappened: "The conversation was hard but planning tightened up after", sound: "yes", result: "as-expected", lesson: "The liked lead still needs the honest note.",
  },
  {
    n: 27, kind: "vendor", stakes: "two-way", title: "Build scheduling logic in-house or buy it",
    options: ["Build it in-house", "License a scheduling engine"],
    gutOpt: "Build it in-house", gutConf: 4, worry: "We reinvent a hard wheel",
    finalOpt: "Build it in-house", finalConf: 4, why: "Scheduling was our core and off-the-shelf did not fit home services",
    gaveUp: "A faster start", audiences: ["Marco Diaz", "Maya Chen"], tripwire: "If the build stalls two sprints, reassess buying",
    support: false, whatHappened: "The in-house engine fit the domain and became a differentiator", sound: "yes", result: "as-expected", lesson: "Build the thing that is actually your product.",
  },
  {
    n: 28, kind: "scope", stakes: "two-way", title: "Ship the dashboard with two charts or five",
    options: ["Ship all five charts", "Ship two and iterate"],
    gutOpt: "Ship all five charts", gutConf: 3, worry: "Two feels thin",
    finalOpt: "Ship two and iterate", finalConf: 4, why: "Two answered the top questions and we could learn from use",
    gaveUp: "A fuller first version", audiences: ["Jordan Lee", "Maya Chen"], tripwire: "If users ask for the other charts, add them",
    support: true, whatHappened: "The two charts covered most needs and the next two were data-driven", sound: "yes", result: "better", lesson: "Ship the charts people ask for, not the ones you imagine.",
  },
  {
    n: 29, kind: "timing", stakes: "one-way", title: "Commit a date for Acme's audit logs",
    options: ["Commit a firm date to Acme", "Give Acme a target month"],
    gutOpt: "Commit a firm date to Acme", gutConf: 5, worry: "The build touches payments",
    finalOpt: "Commit a firm date to Acme", finalConf: 5, why: "Acme was about to sign and wanted certainty",
    gaveUp: "A safety margin", audiences: ["Dana Brooks", "Maya Chen"], tripwire: "If the build touches payments, add buffer before quoting",
    support: false, whatHappened: "The date moved twice and Acme escalated to their exec sponsor", sound: "no", result: "worse", lesson: "Add Marco's worst case before giving a customer a date.",
  },
  {
    n: 30, kind: "vendor", stakes: "two-way", title: "Move logging to a managed service",
    options: ["Keep self-hosted logging", "Move to a managed logging service"],
    gutOpt: "Keep self-hosted logging", gutConf: 3, worry: "Cost and lock-in",
    finalOpt: "Move to a managed logging service", finalConf: 4, why: "The team was spending days on log infra instead of product",
    gaveUp: "Full control of the stack", audiences: ["Marco Diaz"], tripwire: "If costs pass budget, cap retention",
    support: false, whatHappened: "The team got days back and incident response got faster", sound: "yes", result: "better", lesson: "Stop hosting the thing that is not your product.",
  },
  {
    n: 31, kind: "timing", stakes: "one-way", title: "Set a launch date before the security review",
    options: ["Set the date now", "Wait for the security review"],
    gutOpt: "Set the date now", gutConf: 4, worry: "The review finds something",
    finalOpt: "Set the date now", finalConf: 4, why: "Marketing wanted a date to build around",
    gaveUp: "A clean sign-off first", audiences: ["Maya Chen", "Marco Diaz"], tripwire: "If the review flags anything, move the date",
    support: true, whatHappened: "The review flagged an issue and the date moved a week late", sound: "partly", result: "worse", lesson: "Do not date around a review you have not finished.",
  },
  {
    n: 32, kind: "people", stakes: "two-way", title: "Rotate an engineer off a project they love",
    options: ["Rotate them to the new area", "Leave them where they are"],
    gutOpt: "Rotate them to the new area", gutConf: 4, worry: "They lose motivation",
    finalOpt: "Rotate them to the new area", finalConf: 4, why: "They were the right person for a stalled area and it was a growth move",
    gaveUp: "Their comfort", audiences: ["Marco Diaz", "Priya Shah"], tripwire: "If they disengage, revisit in a month",
    support: false, whatHappened: "They unstuck the new area and were glad for the change", sound: "yes", result: "better", lesson: "A rotation can be a gift if you frame it as growth.",
  },
  {
    n: 33, kind: "hiring", stakes: "one-way", title: "Hire a senior designer now or wait for Q1 budget",
    options: ["Hire now against this year's budget", "Wait for the Q1 budget"],
    gutOpt: "Hire now against this year's budget", gutConf: 3, worry: "Budget pushback",
    finalOpt: "Hire now against this year's budget", finalConf: 3, why: "The candidate was rare and the redesign needed them",
    gaveUp: "A cleaner budget line", audiences: ["Maya Chen", "Jordan Lee"], tripwire: "If budget gets challenged, justify with the redesign scope",
    support: false, whatHappened: "The hire landed and lifted the redesign more than expected", sound: "yes", result: "better", lesson: "For a rare candidate, hire ahead of the budget calendar.",
  },
  {
    n: 34, kind: "scope", stakes: "two-way", title: "Add role-based permissions now or after launch",
    options: ["Build permissions before launch", "Launch flat, add roles later"],
    gutOpt: "Launch flat, add roles later", gutConf: 3, worry: "Enterprise needs roles day one",
    finalOpt: "Build permissions before launch", finalConf: 3, why: "Two deals said roles were a hard requirement",
    gaveUp: "An earlier launch", audiences: ["Marco Diaz", "Dana Brooks"], tripwire: "If roles delay launch past a month, ship flat first",
    support: true, whatHappened: "Roles took longer than planned and pushed launch by three weeks", sound: "partly", result: "worse", lesson: "Verify a hard requirement is really hard before it moves the date.",
  },
  {
    n: 35, kind: "timing", stakes: "one-way", title: "Delay launch a week to fix the onboarding bug",
    options: ["Launch on time with the bug", "Delay a week and fix it"],
    gutOpt: "Delay a week and fix it", gutConf: 4, worry: "We lose the launch window",
    finalOpt: "Delay a week and fix it", finalConf: 4, why: "The bug hit new users on their first booking",
    gaveUp: "The original launch day", audiences: ["Maya Chen", "Dana Brooks", "Priya Shah"], tripwire: "If the fix runs past a week, launch with a known-issue note",
    support: true, whatHappened: "Fixed in a week and launched clean with no onboarding tickets", sound: "yes", result: "as-expected", lesson: "A week to protect the first impression is worth it.",
  },
  {
    n: 36, kind: "people", stakes: "two-way", title: "Let a struggling hire go or extend their ramp",
    options: ["Extend the ramp with a plan", "Part ways now"],
    gutOpt: "Extend the ramp with a plan", gutConf: 3, worry: "We are just delaying it",
    finalOpt: "Extend the ramp with a plan", finalConf: 3, why: "They showed signs of getting it and deserved a fair shot",
    gaveUp: "A faster reset", audiences: ["Maya Chen", "Marco Diaz"], tripwire: "If no progress in a month, part ways",
    support: false, whatHappened: "The ramp did not take and we parted ways a month later anyway", sound: "partly", result: "worse", lesson: "When the gut says delaying, trust it sooner.",
  },
  {
    n: 37, kind: "timing", stakes: "one-way", title: "Commit a demo date to a prospect before the build",
    options: ["Commit the demo date", "Offer a demo window"],
    gutOpt: "Commit the demo date", gutConf: 5, worry: "The feature is barely started",
    finalOpt: "Commit the demo date", finalConf: 5, why: "The prospect was hot and wanted to see it live",
    gaveUp: "A realistic buffer", audiences: ["Dana Brooks"], tripwire: "If the build is not demo-ready three days out, reschedule early",
    support: true, whatHappened: "The demo was rough because the feature was not ready and the deal cooled", sound: "no", result: "worse", lesson: "Do not demo-date a feature that is barely started.",
  },
  {
    n: 38, kind: "strategy", stakes: "one-way", title: "Sunset the old notification system over 90 days",
    options: ["Sunset over 90 days", "Keep both systems running"],
    gutOpt: "Sunset over 90 days", gutConf: 3, worry: "Some accounts miss the change",
    finalOpt: "Sunset over 90 days", finalConf: 3, why: "Two systems were doubling the maintenance load",
    gaveUp: "A slow, safe migration", audiences: ["Marco Diaz", "Maya Chen"], tripwire: "If migration lags at day 60, extend the window",
    support: true, whatHappened: "Support ticket volume spiked from confused accounts and Priya was not told in time", sound: "partly", result: "as-expected", lesson: "Tell Priya before a sunset, not after the tickets land.",
  },
  {
    n: 39, kind: "scope", stakes: "two-way", title: "Include the mobile view in the redesign or defer",
    options: ["Redesign desktop only first", "Redesign desktop and mobile together"],
    gutOpt: "Redesign desktop only first", gutConf: 3, worry: "Mobile falls behind again",
    finalOpt: "Redesign desktop and mobile together", finalConf: 4, why: "Half of bookings were mobile and a split experience would confuse pros",
    gaveUp: "A faster desktop ship", audiences: ["Jordan Lee", "Maya Chen"], tripwire: "If mobile drags the timeline, ship desktop and fast-follow",
    support: true, whatHappened: "Both shipped together and the experience felt consistent", sound: "yes", result: "better", lesson: "When half your traffic is mobile, do not defer it.",
  },
  {
    n: 40, kind: "strategy", stakes: "two-way", title: "Pause the referral program test",
    options: ["Keep the referral test running", "Pause and rework it"],
    gutOpt: "Pause and rework it", gutConf: 2, worry: "We lose the little momentum it had",
    finalOpt: "Pause and rework it", finalConf: 2, why: "The rewards were confusing and signups were flat",
    gaveUp: "A live experiment", audiences: ["Dana Brooks", "Priya Shah"], tripwire: "If the reworked version tests flat too, drop referrals",
    support: true, whatHappened: "Pausing freed the team and the reworked version tested better later", sound: "yes", result: "as-expected", lesson: "A confusing incentive is worth pausing to fix.",
  },
]

const MS_DAY = 24 * 60 * 60 * 1000
const BASE = new Date("2026-09-18T00:00:00Z").getTime()

function dateFor(n: number): string {
  return new Date(BASE - (40 - n) * 6 * MS_DAY).toISOString().slice(0, 10)
}

function revisitFor(n: number): string {
  return new Date(BASE - (40 - n) * 6 * MS_DAY + 21 * MS_DAY).toISOString().slice(0, 10)
}

export const DEMO_DECISIONS: DemoDecision[] = S.map((s) => ({
  number: s.n,
  date: dateFor(s.n),
  title: s.title,
  kind: s.kind,
  stakes: s.stakes,
  options: s.options,
  gut: { option: s.gutOpt, confidence: s.gutConf, worry: s.worry },
  final: { option: s.finalOpt, confidence: s.finalConf, why: s.why, gaveUp: s.gaveUp },
  audiencesTold: s.audiences,
  tripwire: s.tripwire,
  revisitDate: revisitFor(s.n),
  supportAffected: s.support,
  outcome: { whatHappened: s.whatHappened, reasoningSound: s.sound, result: s.result, lesson: s.lesson },
})).sort((a, b) => b.number - a.number)
