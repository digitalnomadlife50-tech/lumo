"use client"

import { useState } from "react"
import type { MonthlyBrief } from "@/lib/demo/types"

export function MonthlyBriefCard({ brief }: { brief: MonthlyBrief }) {
  const [remind, setRemind] = useState(true)
  return (
    <div className="lm-brief">
      <div className="lm-brief-head">
        <div className="lm-label">Monthly brief</div>
        <h3 className="lm-brief-title">Your {brief.month} brief</h3>
      </div>
      <div className="lm-brief-grid">
        <div className="lm-brief-item">
          <div className="lm-label">Where your instinct is strong</div>
          <p>{brief.strongAt}</p>
        </div>
        <div className="lm-brief-item">
          <div className="lm-label">Where it runs off</div>
          <p>{brief.runsOff}</p>
        </div>
        <div className="lm-brief-item is-plan">
          <div className="lm-label">One thing to try</div>
          <p className="lm-brief-plan">{brief.ifThen}</p>
          <label className="lm-brief-remind">
            <input type="checkbox" checked={remind} onChange={(e) => setRemind(e.target.checked)} />
            <span>Remind me the next time this comes up</span>
          </label>
        </div>
        <div className="lm-brief-item">
          <div className="lm-label">Something you might not have noticed</div>
          <p>{brief.didntNotice}</p>
        </div>
      </div>
    </div>
  )
}
