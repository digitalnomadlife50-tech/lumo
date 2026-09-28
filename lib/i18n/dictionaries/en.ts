/**
 * English is the source of truth for the dictionary shape. `Dictionary` is
 * derived from this object, so the Spanish dictionary must mirror it exactly
 * (same keys, same nesting) or the build fails. Keep both in sync here.
 */
export const en = {
  metadata: {
    title: "Lumo | A decision tool for product managers",
    description:
      "Make hard product decisions faster, and learn from every one. Write down your first instinct, see the evidence, send the right update, and learn from how it turned out.",
    ogAlt: "Lumo: make hard product decisions faster, and learn from every one.",
  },

  common: {
    wordmarkAria: "Lumo home",
    tryDemo: "Try the demo",
    backToSite: "Back to site",
    confidence: "Confidence",
    gaveUp: "Gave up",
    of5: "of 5",
    stepOf: "Step {current} of {total}",
    noStepOf: "No.{number} / step {step} of {total}",
    progressAria: "Progress",
    stepLabel: "Step {number}. {name}",
    enter: "Enter",
  },

  status: {
    connected: "Connected",
    notConnected: "Not connected",
    checking: "Checking",
  },

  steps: [
    "What's happening",
    "What I'm reading",
    "Your options",
    "Side by side",
    "Your choice",
    "Tell people",
  ] as string[],

  nav: {
    howItWorks: "How it works",
    overTime: "Over time",
    whyLumo: "Why Lumo",
    about: "About",
  },

  landing: {
    heroLabel: "A decision tool for product managers",
    heroTitleA: "Make hard product decisions faster, and ",
    heroTitleB: "learn from every one.",
    heroLede:
      "Write down your first instinct. Lumo does the research, shows where your instinct and the evidence disagree, and drafts an update for each person or team who needs to know. Over time, you see where your instincts are right and where they're off.",
    watchItWork: "Watch it work",
    heroCaption: "Free demo. No sign-up. Your decisions stay in your browser.",
    howItWorksSr: "How it works",

    problemLabel: "The problem",
    problemTitle: "AI gave you more options. It didn't give you more judgment.",
    problemBody1:
      "You get more drafts, more analysis, and more ideas than ever. You still have the same hours to decide what's right.",
    problemBody2: "And the more you hand off, the less you practice the part that's still yours.",
    problemImgAlt: "A tall stack of drafts beside one small blank index card",

    captureTitle: "Works right away. No IT approval needed.",
    captureBody: "There is nothing to install and no account to set up. Start with whatever you already have.",
    inputs: ["Paste", "Screenshot", "Voice", "Video clip", "Forward"] as string[],

    whyLabel: "Why Lumo",
    whyTitle: "Why not ChatGPT, or a decision journal?",
    whyBody:
      "A chat will help with one decision, but it starts from nothing every time. It doesn't record your first instinct before you know the answer, and it doesn't know how your past decisions turned out. A decision journal keeps the history, but you do all the work. Lumo does the research on the decision in front of you and remembers how it turned out.",

    aboutLabel: "Why I built this",
    aboutBody:
      "I'm a product leader and three-time founder. I kept watching product manager friends make a hard decision, then spend days explaining it to every team that needed to hear it. AI made the drafts faster. It didn't make the decisions better, and it never remembered how last quarter's decisions turned out. Lumo is my attempt at that part. It's a working prototype, built end to end.",
    aboutName: "Terrance Range",
    aboutImgAlt: "Terrance Range",

    ctaTitle: "Bring a decision you're stuck on.",
    ctaCardLabel: "The call",
    ctaCardOption: "Ship SSO before the onboarding fix",
    ctaCardGaveUp: "The onboarding fix",
    ctaCardStamp: "No. 12 · Oct 2026",

    footerTagline: "Make hard product decisions faster, and learn from every one.",
    footerBuiltBy: "Built by Terrance Range",
  },

  overTime: {
    typed: "Yes, March 14 works",
    label: "Weeks later",
    title: "It shows up when you are about to do it again.",
    body: "A record you have to go and read is a record you forget. This one interrupts the next decision.",
    decisionEyebrow: "DECISION No.41",
    decisionQ: "Do we promise Northwind the API by March 14?",
    beenHere: "You have been here before",
    tenTimes: "Ten times you have been this sure about a date.",
    sevenSlipped: "Seven of them slipped.",
    yourRule: "Your rule: add Marco's worst case before you give a date.",
    askFirst: "Ask Marco first",
    commitAnyway: "Commit anyway",
    noteEither: "Either way, Lumo records what you choose.",
    noteAsk: "Recorded. Lumo will raise Marco's worst case before you commit, then ask how the date landed.",
    noteCommit: "Recorded. Lumo flagged the date risk and will ask how March 14 landed.",
    replay: "Replay",
    stripAria:
      "The 40 decisions in this record: 16 turned out better than expected, 15 as expected, and 9 worse.",
    recordLinkPre: "40 decisions in this record. Lumo read every one — that's how it spotted the date pattern.",
    recordLinkCta: "See the whole map",
    learnLabel: "How it learns",
    learnTitle: "A pattern is only useful if it changes the next decision.",
    steps: [
      {
        eyebrow: "The pattern",
        headline: "Dates and deadlines are where your instinct is off.",
        support: "Seven of the ten date decisions you were most sure about turned out worse than you expected.",
        alt: "A cloud with three rain strokes",
      },
      {
        eyebrow: "Why it happens",
        headline: "You are most confident right before a date slips.",
        support: "Your confidence peaks when the schedule is already under pressure. That is when it is least reliable.",
        alt: "A calendar page with one date circled",
      },
      {
        eyebrow: "The rule you set",
        headline: "Before you give a customer a date, add your engineering lead's worst case.",
        support: "Saved. Lumo raises this the next time a date comes up.",
        alt: "An index card with a checked box",
      },
      {
        eyebrow: "Since then",
        headline: "Three of your last four date decisions landed.",
        support: "One still slipped. The record keeps counting either way.",
        alt: "Four cards, three checked and one crossed",
      },
    ] as Array<{ eyebrow: string; headline: string; support: string; alt: string }>,
  },

  liveDemo: {
    sampleData: "Sample data",
    decisionNo: "Decision No.{number}",
    whoLine: "Jordan Ellis is a sample product manager. This is Jordan's 41st decision in Lumo.",
    play: "Play",
    pause: "Pause",
    prevChapter: "Previous chapter",
    nextChapter: "Next chapter",
    chaptersAria: "Chapters",
    chapterOf: "Chapter {current} of {total}: {label}",
    mapLabel: "Saved for review",
    mapLead: "This decision joins 40 others. The map is where the patterns show.",
    phases: [
      { name: "Before you decide", desc: "Write down your first instinct before you see anything." },
      { name: "While you decide", desc: "The research, the risks, and how each option plays out." },
      { name: "After you decide", desc: "One decision, a tailored update for each person or team." },
      {
        name: "Weeks later",
        desc: "Was the thinking sound, and did it work out? Lumo tracks both, because a good decision can still turn out badly.",
      },
    ] as Array<{ name: string; desc: string }>,
    chapters: [
      "The situation",
      "Your first instinct",
      "The research",
      "Your instinct vs. the evidence",
      "How each option plays out",
      "A lesson from a past decision",
      "Your decision",
      "Updates for each team",
      "Saved for review",
    ] as string[],
    scenes: {
      situation: "What's happening",
      instinct: "Your first instinct",
      instinctLead: "Lumo asks first, so your instinct is written down before it shows you anything.",
      research: "The research",
      gap: "Your instinct vs. the evidence",
      forward: "How each option plays out",
      memory: "A lesson from a past decision",
      decision: "Your decision",
      updates: "One decision, {count} updates",
    },
    card: {
      leaningToward: "Leaning toward",
      whatsNagging: "What's nagging",
      stamp: "Tuesday, 9:40 pm",
    },
    research: {
      wentAndLooked: "Went and looked",
      outsideView: "The outside view",
      premortem: "Ran it forward and it failed",
    },
    forward: {
      path: "Path {option}",
      chosen: ", chosen",
    },
    decisionMeta: {
      givingUp: "Giving up",
      revisit: "Revisit",
    },
    customerRole: "Customer",
    roles: {
      maya: "VP of Product",
      marco: "Engineering lead",
      dana: "Sales lead",
      priya: "Support lead",
    },
  },

  judgmentMap: {
    label: "The map",
    headlineSingle: "Your decisions, grouped by type.",
    headline: "{strongest} went well. {weakest} {verb} where you keep getting it wrong.",
    headlineVerb: { plural: "are", singular: "is" },
    intro:
      "Your {count} decisions, grouped by type. The further a bar runs right, the more often that kind of decision turned out worse than you thought it would.",
    legend: "Left means better than you thought. Right means worse.",
    colType: "Type",
    colBetter: "Better than you thought",
    colWorse: "Worse",
    colOutcome: "What happened",
    rowLabels: {
      hiring: "Hiring",
      vendor: "Vendors",
      scope: "Scope cuts",
      people: "Team calls",
      strategy: "Strategy",
      timing: "Dates you promise",
    },
    outcomes: {
      none: "None went worse",
      ranLate: "{worse} of {n} ran late",
      wentWorse: "{worse} of {n} went worse",
    },
    actions: {
      timing: {
        eyebrow: "What to do about dates",
        rule: "Ask Marco for his worst case before you give anyone a date.",
        trigger: "Next time you put a date into Lumo, it stops you and asks whether you did.",
      },
      hiring: {
        eyebrow: "What to do about hiring",
        rule: "Have the person they will work with interview them first.",
        trigger: "Lumo raises this the next time you open a role.",
      },
      vendor: {
        eyebrow: "What to do about vendors",
        rule: "Get the exit terms in writing before you sign.",
        trigger: "Lumo raises this the next time you add a vendor.",
      },
      scope: {
        eyebrow: "What to do about scope cuts",
        rule: "Name what you are not shipping before you cut it.",
        trigger: "Lumo raises this the next time you cut scope.",
      },
      people: {
        eyebrow: "What to do about team calls",
        rule: "Ask the person affected before you decide for them.",
        trigger: "Lumo raises this the next time you make a team call.",
      },
      strategy: {
        eyebrow: "What to do about strategy",
        rule: "Write down what would change your mind before you commit.",
        trigger: "Lumo raises this the next time you commit to a strategy.",
      },
    },
  },

  demoHome: {
    navHome: "Home",
    bringOwn: "Bring your own decision",
    demoMode: "Demo mode",
    heroTitle: "You're looking at {name}'s Lumo.",
    heroLede:
      "{role} at {company}, {months} months and 40 decisions in. This is what Lumo looks like once it knows you. Nothing here calls an API. It already happened.",
    onYourMind: "On your mind right now",
    noticedLead:
      "Your first instinct says {option}, confidence {confidence}. Here's what you might not have noticed: {gap}",
    watchHow: "Watch how it played out",
    recentLabel: "Recent calls",
    recentTitle: "The last few, and how they landed.",
    walkthroughLabel: "The open decision, start to finish",
    walkthroughTitle: "No.{number}, played out.",
    ctaTitle: "This is what 40 decisions later looks like.",
    receipts: {
      pattern: {
        lead: "One pattern found.",
        body: "{worse} of the {total} calls went worse than expected. {dates} of them were dates.",
      },
      rule: {
        lead: "One rule that stuck.",
        body: "When you give a customer a date, add your engineering lead's worst case first.",
      },
      nothing: {
        lead: "Nothing dropped.",
        body: "All {total} revisited and rated, including the ones that stung.",
      },
    },
    ctaPivot: "Yours starts with one.",
    bringReal: "Bring a real decision",
    whereStarted: "Where {name} started",
    results: {
      better: "Better than expected",
      worse: "Worse than expected",
      asExpected: "As expected",
    },
    stampResults: {
      better: "Turned out better",
      worse: "Turned out worse",
      asExpected: "Went as expected",
    },
  },

  brief: {
    title: "Your {month} summary",
    stamp: "Delivered Sunday, 8:00 am",
    strong: "Where your instinct is strong",
    off: "Where your instinct is off",
    oneThing: "One thing to try",
    remindSet: "Reminder set",
    remindMe: "Remind me before my next decision about a date",
    didntNotice: "Something you might not have noticed",
  },
};

export type Dictionary = typeof en;
