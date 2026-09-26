"use client"

import { useState } from "react"
import type { MonthlyBrief } from "@/lib/demo/types"

export function MonthlyBriefCard({ brief }: { brief: MonthlyBrief }) {
  const [remind, setRemind] = useState(false)
  return (
    <div className="lm-brief">
      <div className="lm-brief-head">
        <h3 className="lm-brief-title">
          Your {brief.month} summary
        </h3>
        <p className="lm-brief-stamp">Delivered Sunday, 8:00 am</p>
      </div>
      <div className="lm-brief-grid">
        <div className="lm-brief-item">
          <div className="lm-label">Where your instinct is strong</div>
          <p>{brief.strongAt}</p>
        </div>
        <div className="lm-brief-item">
          <div className="lm-label">Where your instinct is off</div>
          <p>{brief.runsOff}</p>
        </div>
        <div className="lm-brief-item is-plan">
          <div className="lm-label">One thing to try</div>
          <p className="lm-brief-plan">{brief.ifThen}</p>
          <button
            type="button"
            className={`lm-brief-remind ${remind ? "is-set" : ""}`}
            onClick={() => setRemind((r) => !r)}
            aria-pressed={remind}
          >
            {remind ? "Reminder set" : "Remind me before my next decision about a date"}
          </button>
        </div>
        <div className="lm-brief-item">
          <div className="lm-label">Something you might not have noticed</div>
          <p>{brief.didntNotice}</p>
        </div>
      </div>
    </div>
  )
}
