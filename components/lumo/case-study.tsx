"use client";

import { useId, useState } from "react";
import { Wordmark, LanguageSwitcher } from "./ui";
import { useDict, useLocaleHref } from "@/lib/i18n";

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="cs-section">
      <div className="cs-section-head">
        <span className="cs-num">{number}</span>
        <h2 className="cs-h2">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return <h3 className="cs-kicker">{children}</h3>;
}

function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={className ? `cs-p ${className}` : "cs-p"}>{children}</p>;
}

function Pull({ children }: { children: React.ReactNode }) {
  return <p className="cs-pull">{children}</p>;
}

function Table({
  head,
  rows,
}: {
  head: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="cs-table-wrap">
      <table className="cs-table">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type CodeNote = {
  line: number;
  title: string;
  body: string;
  footer: string;
};

function Code({
  label,
  children,
  notes = [],
}: {
  label: string;
  children: string;
  notes?: CodeNote[];
}) {
  const codeId = useId();
  const noteId = `cs-code-note-${codeId}`;
  const [activeLine, setActiveLine] = useState<number | null>(notes[0]?.line ?? null);
  const [isNoteOpen, setIsNoteOpen] = useState(notes.length > 0);
  const activeNote = notes.find((note) => note.line === activeLine);
  const showNote = Boolean(isNoteOpen && activeNote);
  const lines = children.split("\n");

  return (
    <figure className={`cs-code${notes.length > 0 ? " cs-code-annotated" : ""}`}>
      <figcaption className="cs-code-label">
        <span className="cs-code-file">
          <span className="cs-code-badge">Code</span>
          {label}
        </span>
        {notes.length > 0 && (
          <span className="cs-code-hint">
            Select <span className="cs-code-info-icon" aria-hidden="true">i</span> for plain English
          </span>
        )}
      </figcaption>
      {notes.length === 0 ? (
        <pre className="cs-code-pre">{children}</pre>
      ) : (
        <div className={`cs-code-stage${showNote ? " has-note" : ""}`}>
          <div className="cs-code-main">
            <div className="cs-code-pre">
              {lines.map((line, index) => {
                const lineNumber = index + 1;
                const note = notes.find((item) => item.line === lineNumber);
                const isActive = showNote && activeLine === lineNumber;

                return (
                  <div
                    className={`cs-code-line-row${isActive ? " is-highlighted" : ""}`}
                    key={lineNumber}
                  >
                    <span className="cs-code-line-number" aria-hidden="true">
                      {String(lineNumber).padStart(2, "0")}
                    </span>
                    <code className="cs-code-line">{line || " "}</code>
                    {note ? (
                      <button
                        type="button"
                        className={`cs-code-marker${isActive ? " is-active" : ""}`}
                        aria-label={`Explain line ${lineNumber}: ${note.title}`}
                        aria-expanded={isActive}
                        aria-controls={noteId}
                        onClick={() => {
                          if (isActive) {
                            setIsNoteOpen(false);
                          } else {
                            setActiveLine(lineNumber);
                            setIsNoteOpen(true);
                          }
                        }}
                      >
                        i
                      </button>
                    ) : (
                      <span className="cs-code-marker-spacer" aria-hidden="true" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {showNote && activeNote && (
            <aside className="cs-code-popover" id={noteId} aria-live="polite">
              <div className="cs-code-popover-top">
                <span className="cs-code-popover-kicker">
                  Plain English · {notes.findIndex((note) => note.line === activeNote.line) + 1} of {notes.length}
                </span>
                <button
                  type="button"
                  className="cs-code-popover-close"
                  aria-label="Close plain-English explanation"
                  onClick={() => setIsNoteOpen(false)}
                >
                  ×
                </button>
              </div>
              <h3 className="cs-code-popover-title">{activeNote.title}</h3>
              <p className="cs-code-popover-copy">{activeNote.body}</p>
              <div className="cs-code-popover-footer">
                <span className="cs-code-popover-dot" aria-hidden="true" />
                <span>{activeNote.footer}</span>
              </div>
            </aside>
          )}
        </div>
      )}
    </figure>
  );
}

function Why({ children }: { children: React.ReactNode }) {
  return (
    <div className="cs-why">
      <div className="cs-why-label">Why it matters</div>
      <P>{children}</P>
    </div>
  );
}

export default function CaseStudy() {
  const d = useDict();
  const lh = useLocaleHref();

  return (
    <div className="lm-page">
      <div className="lm-wrap">
        <nav className="lm-nav">
          <Wordmark />
          <div className="lm-nav-links">
            <a className="lm-navlink" href={lh("/")}>
              {d.nav.howItWorks}
            </a>
            <a className="lm-navlink" href={lh("/app")}>
              {d.common.tryDemo}
            </a>
            <LanguageSwitcher />
            <a className="lm-btn" href={lh("/app")} style={{ padding: "11px 22px" }}>
              {d.common.tryDemo}
            </a>
          </div>
        </nav>
      </div>

      <div className="cs-hero">
        {/* Cover */}
        <header className="lm-wrap cs-cover">
          <div className="cs-cover-kicker">Case study</div>
          <h1 className="cs-cover-title">Lumo</h1>
          <p className="cs-cover-tagline">A feedback loop for product judgment.</p>
          <p className="cs-cover-sub">
            Make hard product decisions clearer, and keep a record of how they turned out.
          </p>
          <div className="cs-meta">
            <div className="cs-meta-item">
              <div className="cs-meta-label">Role</div>
              <div className="cs-meta-value">Solo build: product, design, and engineering</div>
            </div>
            <div className="cs-meta-item">
              <div className="cs-meta-label">Built with</div>
              <div className="cs-meta-value">Next.js 16, React 19, TypeScript, Claude API</div>
            </div>
            <div className="cs-meta-item">
              <div className="cs-meta-label">Status</div>
              <div className="cs-meta-value">
                Live at{" "}
                <a href="https://www.trylumo.co" target="_blank" rel="noreferrer">
                  www.trylumo.co
                </a>
                . Case study updated November 2026.
              </div>
            </div>
          </div>
        </header>

        {/* Short version + at a glance */}
        <div className="lm-wrap cs-intro">
          <div className="cs-short">
            <Kicker>The short version</Kicker>
            <P>
              I started thinking about Lumo after watching the reasoning behind product decisions
              slowly disappear. AI could already help with the options, the analysis, and the
              documents around a decision. What it couldn&apos;t tell me was why we&apos;d chosen one
              direction over another, or what we&apos;d believed at the time. Months later, when the
              results came in, that context was usually gone. The document still looked thoughtful,
              but it was hard to know how much of the thinking had been ours and how much had simply
              sounded right.
            </P>
            <P>
              I wanted to keep that early thinking somewhere I could find it again. That&apos;s why
              Lumo starts by asking for your instinct and how confident you feel, before the model
              gets involved. It reads the situation back in your own words, points out something you
              might have missed, and helps you look at the options. It leaves the decision with you.
              Once you&apos;ve made it, Lumo drafts the updates for the people who need them. The
              record is part of that work, so you don&apos;t have to keep a separate journal. When
              you come back to a decision later, you can see what you expected and compare it with
              what happened.
            </P>
            <P>
              I built Lumo end to end and ran a small closed beta with about 15 product managers at
              early-stage startups. The first thing they found useful was getting that context back.
              During chaotic weeks, they could recover details in Lumo that their AI search tools
              had missed. That made me think Lumo should live inside the tools product managers
              already use. I don&apos;t want it to become another place they have to remember to
              visit.
            </P>
          </div>
          <aside className="cs-glance">
            <Kicker>At a glance</Kicker>
            <div className="cs-glance-grid">
              <div className="cs-glance-item">
                <div className="cs-glance-value">~15</div>
                <div className="cs-glance-label">product managers in a closed beta</div>
              </div>
              <div className="cs-glance-item">
                <div className="cs-glance-value">3</div>
                <div className="cs-glance-label">industries: health, sports, edtech</div>
              </div>
              <div className="cs-glance-item">
                <div className="cs-glance-value">6</div>
                <div className="cs-glance-label">steps, and the instinct and the choice stay yours</div>
              </div>
              <div className="cs-glance-item">
                <div className="cs-glance-value">0</div>
                <div className="cs-glance-label">sign-ups needed to try it</div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="lm-wrap cs-body">
        {/* 01 */}
        <Section number="01" title="Why this needs to exist">
          <P>
            At my day job, I watched one decision, delaying a release past an election code
            freeze, get explained four different ways to four audiences. Two months later, nobody
            could say why we&apos;d made it. The reasoning had disappeared, and with it any way to
            learn whether the call had been right. That experience stayed with me. We had done the
            work of explaining the decision, but we had lost the part that could help us make a
            better one next time.
          </P>
          <Kicker>The work got cheaper. The judgment still needed practice.</Kicker>
          <P>
            AI can now produce the options, the analysis, the spec, and the stakeholder update in
            minutes. That is useful, but it does not make the decision for you. You still have to
            choose, and you still have to live with the choice. If anything, the human part becomes
            more visible once the surrounding work is easy to produce.
          </P>
          <Pull>More options are not the same as better judgment.</Pull>
          <Kicker>Product judgment gets almost no feedback</Kicker>
          <P>
            Daniel Kahneman and Gary Klein come from opposing schools of thought on intuition, but
            they agree on when you can trust it. The situation needs some structure, and the person
            needs feedback on their judgments. Klein is blunt about business. &ldquo;Most corporate
            decisions aren&apos;t going to meet the test of high validity.&rdquo; Product calls
            often fail both tests. The outcome shows up months later, mixed in with other causes,
            and nobody links it back to what was believed at the time.
          </P>
          <P>
            That means years of experience do not automatically turn into better judgment. Without
            a record, it is easy to remember yourself as a good decision maker without knowing
            whether your calls held up. Kahneman warns that people &ldquo;will feel confident
            regardless of how well grounded it is in reality.&rdquo; That is a shaky foundation for
            long-term strategy.
          </P>
          <Kicker>AI makes this worse in two ways that are easy to miss</Kicker>
          <div className="cs-two">
            <div className="cs-two-item">
              <div className="cs-two-title">It makes it easier to stop thinking.</div>
              <P>
                In a 2025 Microsoft Research survey of 319 knowledge workers, higher confidence in
                generative AI was associated with less critical thinking. I saw the same thing in
                my own first version of Lumo. When it recommended a decision, I stopped reasoning
                and started reacting.
              </P>
            </div>
            <div className="cs-two-item">
              <div className="cs-two-title">It makes every rationale look good.</div>
              <P>
                Kahneman traces overconfidence to how coherent a story feels, not whether it is
                true. A model can write a persuasive case for whichever option you already lean
                toward. Once that is possible, a written rationale stops being reliable evidence of
                what anyone actually thought.
              </P>
            </div>
          </div>
          <Kicker>Why I wanted to build it now</Kicker>
          <P>
            The cost of producing product work keeps falling. That makes judgment more valuable,
            but it also makes it easier to hand off the thinking. At the same time, models have
            become reliable enough at structured output for one person to build a tool like this. I
            wanted to see whether the record could become part of the work instead of another habit
            people had to maintain.
          </P>
          <Kicker>What I wanted Lumo to do</Kicker>
          <P>
            I wanted Lumo to be a feedback loop for product judgment. It records what you believed
            before the model responds, keeps the choice with you, and holds onto the record so you
            can compare it with what happened. The hope is that experience turns into better
            judgment, not just more confidence.
          </P>
          <P className="cs-sources">
            The research behind this section includes Daniel Kahneman and Gary Klein,
            &ldquo;Strategic decisions: When can you trust your gut?&rdquo;, McKinsey Quarterly,
            March 2010, and Hao-Ping Lee et al., &ldquo;The Impact of Generative AI on Critical
            Thinking,&rdquo; CHI 2025.
          </P>
        </Section>

        {/* 02 */}
        <Section number="02" title="Why today&apos;s tools don&apos;t fix it">
          <P>
            The tools I already used each solved a different part of the problem. Chat assistants
            helped in the moment but never saw what I believed before they answered. Decision
            journals kept the history but made me do all the work. Docs and Slack held pieces of
            both, but the reasoning still disappeared into threads.
          </P>
          <Table
            head={["Tool", "Good at", "Where it falls short"]}
            rows={[
              [
                "Chat assistant",
                "Thinking through one decision quickly",
                "Even with memory turned on, it never captures your instinct before it answers, and it never connects the outcome back to the call.",
              ],
              [
                "Decision journal",
                "Keeping an honest history",
                "You do all the work by hand, so it's the first habit to go in a busy week.",
              ],
              [
                "Docs and Slack",
                "Sharing with the team",
                "The reasoning gets lost in threads, and nobody links the outcome back to the call.",
              ],
              [
                "Frameworks like RICE",
                "Scoring options consistently",
                "They score the options. They say nothing about the judgment of the person choosing.",
              ],
            ]}
          />
          <Kicker>The record has to come from the work</Kicker>
          <P>
            Decision journals failed for me because they were homework. I did not want Lumo to be
            another place to write after the decision was over. The record comes from work a PM
            already has to do, getting to a decision and telling people about it. The update gives
            you a reason to open Lumo. The record builds while you do that.
          </P>
        </Section>

        {/* 03 */}
        <Section number="03" title="What the beta showed">
          <P>
            I ran a small closed beta with about 15 product managers at early-stage startups in
            health, sports, and edtech. They used Lumo on real decisions from their own work. I
            wanted to learn three things.
          </P>
          <ul className="cs-list">
            <li>
              Did people change their first instinct after seeing the options, or did they just
              confirm what they already believed?
            </li>
            <li>
              Did the confidence rating make people stop and think, or did they treat it as a box
              to tick?
            </li>
            <li>
              Where did the model offer options that sounded reasonable but turned out shallow or
              framed wrong?
            </li>
          </ul>
          <P>
            The feedback kept coming back to memory. During chaotic stretches, people used the
            record to reconstruct what had happened and why. Even with AI retrieval tools, details
            still went missing. Having the context in one place filled that gap.
          </P>
          <P>
            The model showed a consistent pattern too. It was good at widening the set of options
            and writing clear messages. It was less reliable at spotting the downside nobody had
            mentioned, or the political constraint a person already felt but had not put into
            words. When Lumo helped most, it was usually because it made someone write the
            trade-off down, not because it had a better idea. That is why I added the &ldquo;I
            noticed&rdquo; line and the &ldquo;What&apos;s making this hard&rdquo; field.
          </P>
          <Kicker>The same record becomes useful over time</Kicker>
          <P>
            This week, the update gives a PM a reason to open Lumo. In the weeks after, the record
            becomes a memory of what happened and why, which is what the beta valued. Over months,
            that same record could make calibration possible. The first two are working today. The
            third is still the bet.
          </P>
          <P className="cs-note">
            This was a small, informal beta, not a controlled study. I read it as direction, not
            proof.
          </P>
        </Section>

        {/* 04 */}
        <Section number="04" title="The product manager I had in mind">
          <P>
            I built Lumo for a working product manager who keeps facing calls with real trade-offs.
            They are deciding what to build first, which date to promise, and what to cut. They are
            short on time, answer to leadership, and end up rewriting the same decision for every
            group that needs to hear about it.
          </P>
          <P>
            I know that job because it is my day job. I am a product manager for fundraising at a
            national digital advocacy platform with 8M+ members, where many calls have to fit
            around release freezes during elections. Before product, my doctoral coursework was in
            behavioral science and organizational change. I studied how people make decisions and
            how organizations act on them. I have also founded three companies.
          </P>
          <Kicker>A decision Lumo is built for</Kicker>
          <P>
            Imagine your largest customer wants single sign-on (SSO) by the end of Q3. Engineering
            says Q4 at the earliest. Sales has already hinted yes. Your VP wants an answer by
            Friday, and whatever you decide, several groups will need to hear it differently. I
            made this scenario up to show how Lumo works. It is not a recorded session, and I use
            it throughout this document.
          </P>
        </Section>

        {/* 05 */}
        <Section number="05" title="How the design follows from the problem">
          <P>
            Before writing any code, I wrote down a few rules. Each one came from a problem I had
            seen in my own work or in the tools around it.
          </P>
          <Table
            head={["The problem", "The rule", "What Lumo does"]}
            rows={[
              [
                "Once a model has spoken, you can't recover what you believed before it.",
                "Get the instinct down first.",
                "Step 1 saves your instinct and confidence before any analysis, the way a researcher registers a prediction before running the study.",
              ],
              [
                "People think less when they trust the AI more.",
                "You decide, not the model.",
                "Lumo never recommends. It can structure the decision, test it, and draft the follow-up. The choice is always yours.",
              ],
              [
                "Confidence means little until it's checked against results.",
                "Make confidence explicit.",
                "Every decision carries a confidence rating, so it can be compared with the outcome later.",
              ],
              [
                "Judgment is uneven. You can be good at hiring calls and bad at dates.",
                "Compare like with like.",
                "Every decision is tagged as timing, scope, hiring, people, vendor, or strategy, so patterns can show up by kind of call.",
              ],
              [
                "If a model paraphrases you, you end up reasoning about its version of your problem.",
                "Never fake it.",
                "Every part of the framing is tied to a direct quote from your own words. Anything that's a sample says so.",
              ],
              [
                "Records that take extra work don't get kept.",
                "Make it easy to start.",
                "No account, nothing to install, nothing for IT to approve. The record comes out of the update you already have to send.",
              ],
              [
                "A pattern you see after the fact doesn't change anything.",
                "Catch the next mistake.",
                "I plan to bring the pattern up right before your next similar call. See section 09.",
              ],
              [
                "A tool that hides its failures can't be trusted with decisions.",
                "Be honest when things break.",
                "If the model or a service fails, Lumo says so plainly and never fills the gap with a made-up result.",
              ],
            ]}
          />
        </Section>

        {/* 06 */}
        <Section number="06" title="What exists today">
          <P>
            The product today is one path with six steps. The model helps with four of them. The
            first and fifth belong to you, because your instinct and your choice are the parts I do
            not want to automate.
          </P>
          <div className="cs-steps">
            {[
              ["1", "What's happening", "in your own words", "HUMAN"],
              ["2", "What I'm reading", "Lumo reads it back, with sources", "MODEL"],
              ["3", "Your options", "yours, plus ones Lumo adds", "MODEL"],
              ["4", "Side by side", "cost, risk, who it hurts, reversibility", "MODEL"],
              ["5", "Your choice", "commit, with the trade-off and your confidence", "HUMAN"],
              ["6", "Tell people", "a draft for each audience", "MODEL"],
            ].map(([n, title, sub, who]) => (
              <div key={n} className={`cs-step ${who === "HUMAN" ? "is-human" : "is-model"}`}>
                <div className="cs-step-num">{n}</div>
                <div className="cs-step-body">
                  <div className="cs-step-title">{title}</div>
                  <div className="cs-step-sub">{sub}</div>
                </div>
                <div className={`cs-step-who ${who === "HUMAN" ? "is-human" : "is-model"}`}>
                  {who}
                </div>
              </div>
            ))}
          </div>
          <Kicker>Walking through the SSO example</Kicker>
          <Table
            head={["Step", "What the PM does", "What Lumo gives back"]}
            rows={[
              [
                "1 · What's happening",
                "Writes out the situation and a gut call, such as \"Promise Q3, we can make it work.\" Can also note what's making it hard, like a stakeholder who pushed back last time.",
                "Nothing yet. Lumo saves the instinct and the confidence level before it analyzes anything.",
              ],
              [
                "2 · What I'm reading",
                "Reads Lumo's framing, corrects it, and clicks \"Show source\" to see where each point came from.",
                "The real question, what matters, who's affected, and how urgent it is, each tied to a direct quote from what the PM wrote. Plus one \"I noticed\" line about something the PM may have missed.",
              ],
              [
                "3 · Your options",
                "Adds an option of their own.",
                "Two or three more options, marked \"Added by Lumo,\" such as a phased SSO beta in Q3 with the full rollout in Q4.",
              ],
              [
                "4 · Side by side",
                "Compares the options.",
                "For each option, the cost, the risk, who it hurts, and whether it can be undone. The answer can be yes, partly, or no.",
              ],
              [
                "5 · Your choice",
                "Chooses the phased beta, writes down the trade-off, and rates confidence 3 out of 5. Commits by pressing and holding.",
                "Nothing. This step belongs to the PM.",
              ],
              [
                "6 · Tell people",
                "Edits the drafts, asks for a shorter or more direct version, adds an audience, and sends.",
                "A draft for the VP every time, plus one for each other group the decision affects. Each comes in the right channel, with the pushback that group is likely to raise and a suggested reply.",
              ],
            ]}
          />
          <P>
            At the end, Lumo tags each decision by type and saves it in your browser. You do not
            need an account.
          </P>
          <Kicker>A few other choices I made</Kicker>
          <div className="cs-three">
            <div className="cs-three-item">
              <div className="cs-three-title">Committing takes intent.</div>
              <P>
                You choose by pressing and holding, so it never happens by accident. Keyboard and
                assistive-technology users get an instant option instead.
              </P>
            </div>
            <div className="cs-three-item">
              <div className="cs-three-title">One decision, many audiences.</div>
              <P>
                There&apos;s always a draft for the VP, plus one for each other group the decision
                touches, and you can add your own. Each comes in the right channel, whether email,
                Slack, or a DM.
              </P>
            </div>
            <div className="cs-three-item">
              <div className="cs-three-title">Edit without starting over.</div>
              <P>
                You can ask for any draft to be shorter or more direct, and undo back to the last
                version, without redoing the decision.
              </P>
            </div>
          </div>
          <div className="cs-three">
            <div className="cs-three-item">
              <div className="cs-three-title">A quieter interface.</div>
              <P>
                I kept the tone calm and the motion minimal. There is one serif signature line,
                used sparingly, and no exclamation points. People open Lumo when they are under
                pressure. The interface should not add to that pressure.
              </P>
            </div>
            <div className="cs-three-item">
              <div className="cs-three-title">The guides around the product.</div>
              <P>
                I wrote four practical guides in English and Spanish. They cover what to do when a
                launch is slipping, how to cut scope, how to write an update for a VP, and whether
                to hire now or wait.
              </P>
            </div>
            <div className="cs-three-item">
              <div className="cs-three-title">Two languages from the start.</div>
              <P>
                Lumo works in English and Spanish, and the model answers in the visitor&apos;s
                language with its own writing rules.
              </P>
            </div>
          </div>
        </Section>

        {/* 07 */}
        <Section number="07" title="How it got here">
          <P>
            I started building in July 2026. Most of what makes Lumo work today came from being
            wrong in testing. The beliefs below changed when real decisions went through the
            product.
          </P>
          <Table
            head={["What I believed", "What happened", "What I changed"]}
            rows={[
              [
                "The most useful feature would be a recommendation.",
                "Within a couple of weeks I hated it. As soon as the model told me what it would do, I stopped thinking and started reacting.",
                "I took the recommendation out completely. The model helps structure the decision, and the PM makes it.",
              ],
              [
                "Good options from the model would be enough.",
                "In testing, the model was good at widening the options. It was weak at naming the political constraint a person already feels but hasn't said out loud.",
                "I added an optional \"What's making this hard\" field and an \"I noticed\" line in step 2. The field shapes that line and the tone of the drafts, but Lumo never quotes it back.",
              ],
              [
                "A schema would keep the model true to what people wrote.",
                "When the model played the situation back, it invented or paraphrased the user's words.",
                "Now every part of the framing points to a direct quote from the user's own text, behind \"Show source.\" The prompt forbids made-up or paraphrased quotes.",
              ],
              [
                "A schema would guarantee usable output.",
                "Schemas cut down on bad output, but they don't eliminate it. Broken screens still slipped through now and then.",
                "I added a second, separate shape check on the server and one retry. If both attempts fail, the user gets a plain error and can try again.",
              ],
              [
                "Saving decisions would be enough to learn from them.",
                "You can't find patterns in decisions you can't compare.",
                "Every decision now gets a type, such as timing, scope, hiring, people, vendor, or strategy. That gives pattern detection something to group by.",
              ],
              [
                "If it worked in preview, it would work live.",
                "Three bugs showed up only on the live site (appendix C).",
                "I test the deployed product now, not the preview, and the app shows whether the AI is up.",
              ],
            ]}
          />
          <Pull>The most important decision I made was taking a capability away.</Pull>
          <Kicker>The trade-off I accepted</Kicker>
          <P>
            Taking out the recommendation made Lumo less impressive in a quick demo. A tool that
            hands you an answer looks smarter in the first thirty seconds. I chose the version that
            is more useful on your fifth decision, even if it is less impressive on your first.
          </P>
        </Section>

        {/* 08 */}
        <Section number="08" title="Why I built it in this order">
          <P>
            I shipped audience drafts before outcome check-ins because people do not record
            outcomes in a tool they never open. The update gives a PM a reason to use Lumo this
            week. The record builds up while they do that, and the beta showed that it is useful as
            memory long before it is useful for calibration. Outcome check-ins come next, once
            there is a reason to come back.
          </P>
        </Section>

        {/* 09 */}
        <Section number="09" title="Where it&apos;s going">
          <P>
            Today Lumo is an app you open. I want it to become a decision layer inside the tools
            product managers already use. Through plugins and connectors, it could capture your
            instinct and your call in a chat, a doc, or a ticket, then pull the outcome back from
            the same tools. That would make the record less dependent on someone remembering to
            write it down, which is what calibration needs.
          </P>
          <P>
            The record also matters to the business. It becomes more useful the longer you keep
            it, so the value grows with each decision instead of resetting with each session.
          </P>
          <Pull>
            You have been this sure about a date ten times. Seven of them slipped.
          </Pull>
          <P>
            That line comes from the demo on trylumo.co, which runs on a labeled sample record of
            40 decisions for a made-up product manager. It shows the direction I want to explore,
            not results from real users. The point is not to give you a better answer in the
            moment. It is to give you a clearer picture of your own judgment over time.
          </P>
          <Table
            head={["#", "Next step", "What it adds"]}
            rows={[
              ["1", "Outcome check-ins", "At a set date, ask how the decision actually turned out. Was it as expected, better, or worse? Add a one-line lesson. Calibration depends on this data."],
              ["2", "Learning from your own history", "Group your past decisions by type, show where your instinct runs better or worse than you expected, let you set a rule, and bring that rule up the next time a similar call comes along."],
              ["3", "Connectors into the PM's AI stack", "Plugins and connectors that bring in context from the tools PMs already use, including screenshots, voice notes, video clips, and forwarded messages, and pull outcomes back automatically."],
              ["4", "Research across that context", "Show where your instinct and the evidence disagree. The call still stays with you."],
              ["5", "A headless decision layer", "Capture, record, and calibration running underneath other tools, so a decision is recorded the same way wherever it's made."],
              ["6", "Better handling of weak options", "Make it quick to flag and dismiss a shallow suggestion, and learn from what gets dismissed."],
              ["7", "Accounts, then Slack and email", "Keep your record across devices, and send drafts straight to where people already work."],
            ]}
          />
        </Section>

        {/* 10 */}
        <Section number="10" title="How I&apos;ll know if it works, and what doesn&apos;t work yet">
          <P>
            I will know Lumo is working if the calls you rate 4 or 5 out of 5 turn out well more
            often than the ones you rate 1 or 2. Over time, the gap between how sure you felt and
            how things actually went should shrink. That is what better judgment looks like when
            you can measure it.
          </P>
          <P>
            There are earlier signs I can watch for too. People change their first instinct after
            seeing the options instead of just confirming it. They come back to the record when
            things get chaotic, which the beta already showed. They return to record how a decision
            turned out. The &ldquo;I noticed&rdquo; line changes how they frame the problem.
          </P>
          <P>
            Right now, Lumo cannot measure calibration because it does not yet ask how decisions
            turned out. That is why outcome check-ins are first on the roadmap.
          </P>
          <Kicker>What still does not work well</Kicker>
          <P>
            The model sometimes offers options that look reasonable until you look closer. It can
            miss the stakeholder who will block the decision, the promise someone made quietly, or
            the constraint that only lives in people&apos;s heads. The &ldquo;I noticed&rdquo; line
            helps, but it does not solve that problem. Confidence ratings are easy to rush too.
          </P>
          <P>
            For now, everything is stored in the browser, so your record lives on one device.
            Pattern detection over the long run is still a demonstration, not something proven on
            months of real decisions.
          </P>
        </Section>

        {/* 11 */}
        <Section number="11" title="What this project shows about how I work">
          <P>
            Building Lumo changed how I think about product work. These are the lessons I would
            carry into the next project.
          </P>
          <div className="cs-principles">
            <div className="cs-principle">
              <div className="cs-principle-title">I start from the problem, not the model.</div>
              <P>
                The most important design choice was taking a capability away. Lumo is defined by
                what the AI isn&apos;t allowed to do.
              </P>
            </div>
            <div className="cs-principle">
              <div className="cs-principle-title">I change the product when an assumption breaks.</div>
              <P>
                The recommendation, the source quotes, and the &ldquo;I noticed&rdquo; line all
                came from something that didn&apos;t work the first time.
              </P>
            </div>
            <div className="cs-principle">
              <div className="cs-principle-title">I treat AI output as untrusted input.</div>
              <P>
                Schemas, validation, retries, and honest error messages are product features to
                me, not cleanup work.
              </P>
            </div>
            <div className="cs-principle">
              <div className="cs-principle-title">I&apos;m honest about limits.</div>
              <P>
                I can tell you where Lumo works, where it doesn&apos;t yet, and what it would take
                to prove the rest.
              </P>
            </div>
          </div>
          <Pull>
            I built Lumo to help people learn from their decisions, not just get an answer and move
            on.
          </Pull>
          <p className="cs-signoff">
            Terrance Range ·{" "}
            <a href="https://www.trylumo.co" target="_blank" rel="noreferrer">
              www.trylumo.co
            </a>
          </p>
        </Section>

        {/* Appendix A */}
        <Section number="A" title="How it works">
          <P>
            The stack is fairly ordinary. Most of the effort went into making the AI predictable.
            The model can only answer through a fixed schema, and the server checks every response
            before anyone sees it.
          </P>
          <Kicker>Every AI request follows the same path</Kicker>
          <div className="cs-path">
            {["Browser", "Rate limit", "Validate input", "Forced tool call", "Check shape", "Retry once", "Clean output"].map(
              (step, i, arr) => (
                <span
                  key={step}
                  className={`cs-path-step ${step === "Forced tool call" || step === "Check shape" ? "is-key" : ""}`}
                >
                  {step}
                  {i < arr.length - 1 && <span className="cs-path-arrow">›</span>}
                </span>
              )
            )}
          </div>
          <P>
            Most of the reliability comes from the two highlighted steps. If both attempts fail,
            the user sees a plain error and can try again.
          </P>
          <Kicker>Stack</Kicker>
          <Table
            head={["Layer", "Choice", "Why"]}
            rows={[
              ["App", "Next.js 16, React 19, TypeScript", "Pages load fast and search engines can read them. AI responses are typed and checked at runtime."],
              ["AI", "Claude API with forced tool calls", "The model returns structured data, never free text the interface has to guess at. The model choice lives in one place."],
              ["Guardrails", "Server-side validation and one retry", "Bad output gets rejected instead of shown."],
              ["Storage", "Browser only, no sign-up", "Nothing to sign up for, and decisions stay on the user's device."],
              ["Safety", "Upstash Redis rate limiting", "20 requests per hour per route keeps a free public tool affordable to run."],
              ["Hardening", "Security headers", "HSTS, nosniff, a referrer policy, same-origin framing, and a permissions policy."],
              ["Reach", "English and Spanish on Vercel", "Each language has its own routes, and the model answers in the visitor's language with its own writing rules."],
            ]}
          />
          <Kicker>Three API routes, each locked to a schema</Kicker>
          <div className="cs-three">
            <div className="cs-three-item">
              <div className="cs-three-title cs-mono">/api/analyze</div>
              <P>
                Reads the situation back with source quotes and an &ldquo;I noticed&rdquo; line,
                then generates options with cost, risk, and reversibility.
              </P>
            </div>
            <div className="cs-three-item">
              <div className="cs-three-title cs-mono">/api/decide</div>
              <P>
                Turns a committed decision into a summary and a draft for each audience.
              </P>
            </div>
            <div className="cs-three-item">
              <div className="cs-three-title cs-mono">/api/rewrite</div>
              <P>
                Rewrites one draft, shorter or more direct, without redoing the whole decision.
              </P>
            </div>
          </div>
        </Section>

        {/* Appendix B */}
        <Section number="B" title="A closer look at the code">
          <P>
            Here are three excerpts from the code. Two come from the route that drafts audience
            messages, and one comes from the rate limiter. I trimmed them for length but did not
            change the logic.
          </P>
          <Code
            label="app/api/decide/route.ts (schema, abridged)"
            notes={[
              {
                line: 1,
                title: "Set the rules first",
                body: "This is a form the AI has to fill in. I tell it exactly what a useful answer looks like instead of letting it answer however it likes.",
                footer: "The screen knows what to expect.",
              },
              {
                line: 8,
                title: "Every message has a destination",
                body: "Each draft needs a person and a channel. The AI can choose the words, but it cannot forget who the message is for or where it should go.",
                footer: "A useful draft is addressed to someone.",
              },
              {
                line: 13,
                title: "Reject surprises",
                body: "Unexpected fields are not allowed. If the response does not match the agreement, the server can catch it before it becomes a confusing screen.",
                footer: "The guardrails are part of the design.",
              },
            ]}
          >{`const decideTool: Anthropic.Tool = {
  name: "provide_audience_drafts",
  input_schema: { type: "object", properties: {
    claritySummary: { type: "string" },
    drafts: { type: "array", minItems: 2, maxItems: 8, items: {
      properties: {
        // "vp" is required so leadership is never left out
        audienceId: { type: "string" },
        channel: { type: "string", enum: ["email", "slack", "dm"] },
        subject: { type: "string" }, body: { type: "string" },
        pushback: { type: "array", maxItems: 2 /* objection + reply */ },
      },
      additionalProperties: false,
    } },
  } },
}`}</Code>
          <Why>
            The model can&apos;t answer in free text. Every field the screen shows is declared
            ahead of time, so an empty or broken draft is an error the server can catch, not a
            confusing screen for the user.
          </Why>
          <Code
            label="app/api/decide/route.ts (retry loop, abridged)"
            notes={[
              {
                line: 1,
                title: "Try once, then try again",
                body: "The route gives the model two chances to return a usable answer. It stops as soon as one passes the checks.",
                footer: "A temporary AI hiccup does not have to become a broken screen.",
              },
              {
                line: 6,
                title: "Plain text is not enough",
                body: "This tells the model to use the structured form from the previous excerpt. The screen receives fields it can read, not a paragraph it has to interpret.",
                footer: "The answer arrives in a shape the product can use.",
              },
              {
                line: 12,
                title: "Check the answer on the server",
                body: "Even after the model fills in the form, the server checks it again. If the answer is incomplete, Lumo records the problem and retries instead of showing a broken draft.",
                footer: "Check the answer before it reaches the screen.",
              },
            ]}
          >{`for (let attempt = 1; attempt <= 2 && !result; attempt++) {
  const response = await anthropic.messages.create({
    model: ANTHROPIC_MODEL,
    tools: [decideTool],
    // Force the structured tool; plain text is not an option
    tool_choice: { type: "tool", name: decideTool.name },
    // ...system prompt, user prompt, max_tokens
  })
  const toolResult = response.content.find(isDecideToolUse)
  if (!toolResult) { record("no tool output"); continue }
  // Schema is a request; this check is the guarantee
  if (!isDecideResult(toolResult.input, "vp")) { record("bad shape"); continue }
  result = toolResult.input
}
if (!result && lastFailure)
  return getDiagnosticsResponse(requestStartedAt, attempts, lastFailure)`}</Code>
          <Why>
            Schemas cut down on bad output but don&apos;t eliminate it. A second, independent check
            on the server and one retry turned occasional broken screens into rare errors that say
            clearly what went wrong.
          </Why>
          <Code
            label="lib/rate-limit.ts (abridged)"
            notes={[
              {
                line: 3,
                title: "Set a sensible ceiling",
                body: "Each visitor can make up to 20 decide requests in an hour. This keeps a free public tool from becoming an unexpected AI bill.",
                footer: "A cost limit protects the experiment.",
              },
              {
                line: 7,
                title: "Ask whether this request can continue",
                body: "The limiter returns a yes or no answer and, when needed, a time to try again. The route can explain the pause instead of failing mysteriously.",
                footer: "A pause is clearer than a mysterious error.",
              },
              {
                line: 13,
                title: "Keep the product available",
                body: "If the rate-limit service itself is unavailable, Lumo logs the problem and lets the request through. A safety feature should not take the whole product down.",
                footer: "The limiter protects the product. It is not the product.",
              },
            ]}
          >{`decide: new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  prefix: "lumo:ratelimit:decide",
}),
try {
  const { success, reset } = await limiters[route].limit(ip)
  if (success) return { allowed: true }
  return { allowed: false, retryAfter: secondsUntil(reset) }
} catch (error) {
  // A limiter outage must never take the product down with it
  console.error(\`[rate-limit] Redis check failed for "\${route}"\`, error)
  return { allowed: true }
}`}</Code>
          <Why>
            A free public AI tool needs a cost ceiling, but the limiter protects the product. It
            isn&apos;t the product. So I made it fail open. If Redis is down or not set up, the
            request goes through and the failure gets logged.
          </Why>
        </Section>

        {/* Appendix C */}
        <Section number="C" title="What broke in production">
          <div className="cs-bugs">
            <div className="cs-bug">
              <div className="cs-bug-title">The flow reset itself mid-step.</div>
              <P>
                An unstable React key made the current step reload on every update, which wiped
                out what the user had typed. I fixed the key, then ran all six steps again in a
                real browser.
              </P>
            </div>
            <div className="cs-bug">
              <div className="cs-bug-title">The AI worked in preview, not live.</div>
              <P>
                Production needed the model configured explicitly. I moved that setting into one
                place and added a visible AI status and logging.
              </P>
            </div>
            <div className="cs-bug">
              <div className="cs-bug-title">The sitemap returned a 404.</div>
              <P>
                Vercel sent the bare domain to www, and my own code sent it back. I made www the
                one official address.
              </P>
            </div>
          </div>
          <Kicker>What I took from it</Kicker>
          <P>
            I now test what is actually deployed, not just the preview. I make failures visible. I
            also treat domains and redirects as product work, because a search engine cannot read a
            sitemap that returns a 404.
          </P>
        </Section>
      </div>

      <footer className="lm-footer">
        <div className="lm-wrap lm-footer-inner">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Wordmark />
            <div style={{ fontSize: 15, color: "#C9C3B8" }}>A feedback loop for product judgment.</div>
          </div>
          <div style={{ fontSize: 14, color: "var(--lm-text-3)", lineHeight: 1.8 }}>
            <a href={lh("/")} style={{ color: "var(--lm-text-3)" }}>
              {d.nav.howItWorks}
            </a>
            <br />
            <a href={lh("/privacy")} style={{ color: "var(--lm-text-3)" }}>
              {d.common.privacy}
            </a>
            <br />
            <a href={lh("/terms")} style={{ color: "var(--lm-text-3)" }}>
              {d.common.terms}
            </a>
            <br />
            <a href="https://terrance.company" style={{ color: "var(--lm-text-3)" }}>
              Built by Terrance Range
            </a>
            <br />
            <a href="https://linkedin.com/in/terrancerange" style={{ color: "var(--lm-text-3)" }}>
              LinkedIn
            </a>
            <br />
            2026
          </div>
        </div>
      </footer>
    </div>
  );
}
