"use client"

import { useState } from "react"
import type { MonthlyBrief } from "@/lib/demo/types"
import { useDict } from "@/lib/i18n"
import { fill } from "@/lib/i18n/get-dictionary"

export function MonthlyBriefCard({ brief }: { brief: MonthlyBrief }) {
  const t = useDict().brief
  const [remind, setRemind] = useState(false)
  return (
    <div className="lm-brief">
      <div className="lm-brief-head">
        <h3 className="lm-brief-title">
          {fill(t.title, { month: brief.month })}
        </h3>
        <p className="lm-brief-stamp">{t.stamp}</p>
      </div>
      <div className="lm-brief-grid">
        <div className="lm-brief-item">
          <div className="lm-label">{t.strong}</div>
          <p>{brief.strongAt}</p>
        </div>
        <div className="lm-brief-item">
          <div className="lm-label">{t.off}</div>
          <p>{brief.runsOff}</p>
        </div>
        <div className="lm-brief-item is-plan">
          <div className="lm-label">{t.oneThing}</div>
          <p className="lm-brief-plan">{brief.ifThen}</p>
          <button
            type="button"
            className={`lm-brief-remind ${remind ? "is-set" : ""}`}
            onClick={() => setRemind((r) => !r)}
            aria-pressed={remind}
          >
            {remind ? t.remindSet : t.remindMe}
          </button>
        </div>
        <div className="lm-brief-item">
          <div className="lm-label">{t.didntNotice}</div>
          <p>{brief.didntNotice}</p>
        </div>
      </div>
    </div>
  )
}
