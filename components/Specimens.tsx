"use client";

import { useEffect, useRef, useState } from "react";
import type { Stamp } from "@/lib/receipts";
import { AUTOPSY, CITEBOT, VOICE, type Specimen } from "@/lib/specimens";

const STEP_MS = 420;

/** Shows the finished result first; "Run again" replays it one check at a time. */
function useReplay(total: number) {
  const [shown, setShown] = useState(total);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);
  const replay = () => {
    if (timer.current) clearInterval(timer.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(total);
      return;
    }
    setShown(0);
    timer.current = setInterval(() => {
      setShown((n) => {
        if (n + 1 >= total && timer.current) clearInterval(timer.current);
        return Math.min(n + 1, total);
      });
    }, STEP_MS);
  };
  return { shown, replay, running: shown < total };
}

function Marked({ text, marks, tone }: { text: string; marks: readonly string[]; tone: "fault" | "ink" }) {
  const pattern = new RegExp(`(${marks.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
  return (
    <>
      {text.split(pattern).map((part, index) =>
        marks.includes(part) ? (
          <mark key={index} className={`mark mark-${tone}`}>
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

function Head({ tool, href }: { tool: string; href: string }) {
  return (
    <div className="pair specimen-head">
      <a href={href} className="link">
        {tool}
      </a>
      <span className="quiet">recorded</span>
    </div>
  );
}

/** The last weekly check, from its receipt. Shows nothing without a receipt. */
function StampLine({ stamp }: { stamp: Stamp | null }) {
  if (!stamp) return null;
  return (
    <a href={stamp.href} className={`link stamp${stamp.fault ? " fault" : ""}`}>
      Weekly check: {stamp.label.replace(/^checked /, "")} →
    </a>
  );
}

function Replay({ onClick, running, label }: { onClick: () => void; running: boolean; label: string }) {
  return (
    <button type="button" className="replay meta" onClick={onClick} disabled={running} aria-label={`Run the ${label} check again`}>
      {running ? "Checking…" : "Run again"}
    </button>
  );
}

function ClaimSpecimen({ specimen, stamp }: { specimen: Specimen; stamp: Stamp | null }) {
  const { shown, replay, running } = useReplay(specimen.checks.length);
  const failed = specimen.checks.some((check) => check.verdict === "fail");
  return (
    <figure className="panel mono specimen" id={`specimen-${specimen.id}`} aria-label={`${specimen.tool}, a recorded run`}>
      <Head tool={specimen.tool} href={specimen.href} />
      <hr className="hr" />
      <dl>
      <div className="kv">
        <dt>question</dt>
        <dd>{specimen.question}</dd>
      </div>
      <div className="kv">
        <dt>{specimen.source.label}</dt>
        <dd>
          <Marked text={specimen.source.text} marks={specimen.source.marks} tone={failed ? "fault" : "ink"} />
        </dd>
      </div>
      <div className="kv">
        <dt>{specimen.answer.label}</dt>
        <dd>{specimen.answer.text}</dd>
      </div>
      </dl>
      <hr className="hr hr-ink" />
      <ol className="verdicts" aria-live="polite">
        {specimen.checks.map((check, index) => {
          const done = index < shown;
          return (
            <li key={check.label} className="pair">
              <span>{check.label}</span>
              <span className={done && check.verdict === "fail" ? "fault" : done ? undefined : "quiet"}>
                {done ? `${check.verdict}${check.note ? ` · ${check.note}` : ""}` : "…"}
              </span>
            </li>
          );
        })}
      </ol>
      <figcaption className="specimen-foot">
        <span className="quiet">{specimen.recorded}</span>
        <StampLine stamp={stamp} />
        <Replay onClick={replay} running={running} label={specimen.tool} />
      </figcaption>
    </figure>
  );
}

function VoiceSpecimen({ stamp }: { stamp: Stamp | null }) {
  const { shown, replay, running } = useReplay(VOICE.readings.length);
  const at = (value: number) => `${(Math.min(value, VOICE.max) / VOICE.max) * 100}%`;
  return (
    <figure className="panel mono specimen" id="specimen-voice" aria-label={`${VOICE.tool}, a recorded run`}>
      <Head tool={VOICE.tool} href={VOICE.href} />
      <hr className="hr" />
      <dl>
      <div className="kv">
        <dt>question</dt>
        <dd>Do these drafts still sound like the house voice?</dd>
      </div>
      <div className="kv">
        <dt>measure</dt>
        <dd>Burrows’ Delta on the 150 most frequent words. Lower is closer.</dd>
      </div>
      </dl>
      <div className="scale" role="img" aria-label="Pages in the house voice score 0.64, close. AI drafts score 1.33, off-voice.">
        <div className="scale-zones" aria-hidden="true">
          <span style={{ width: at(VOICE.cuts.close) }}>close</span>
          <span style={{ width: `calc(${at(VOICE.cuts.off)} - ${at(VOICE.cuts.close)})` }}>drifting</span>
          <span style={{ flex: 1 }}>off-voice</span>
        </div>
        {VOICE.readings.map((reading, index) => (
          <div
            key={reading.label}
            className={`scale-mark${reading.verdict === "fail" ? " fault" : ""}`}
            style={{ left: index < shown ? at(reading.value) : "0%", opacity: index < shown ? 1 : 0.25 }}
            aria-hidden="true"
          />
        ))}
      </div>
      <hr className="hr hr-ink" />
      <ol className="verdicts" aria-live="polite">
        {VOICE.readings.map((reading, index) => {
          const done = index < shown;
          return (
            <li key={reading.label} className="pair">
              <span>{reading.label}</span>
              <span className={done && reading.verdict === "fail" ? "fault" : done ? undefined : "quiet"}>
                {done ? `${reading.value.toFixed(2)} · ${reading.verdict === "fail" ? "off-voice" : "close"}` : "…"}
              </span>
            </li>
          );
        })}
      </ol>
      <figcaption className="specimen-foot">
        <span className="quiet">{VOICE.recorded}</span>
        <StampLine stamp={stamp} />
        <Replay onClick={replay} running={running} label={VOICE.tool} />
      </figcaption>
    </figure>
  );
}

/** The three answer checks, each showing a real recorded run. */
export function Specimens({ stamps }: { stamps: Record<"autopsy" | "citebot" | "voice", Stamp | null> }) {
  return (
    <div className="specimens">
      <ClaimSpecimen specimen={AUTOPSY} stamp={stamps.autopsy} />
      <ClaimSpecimen specimen={CITEBOT} stamp={stamps.citebot} />
      <VoiceSpecimen stamp={stamps.voice} />
    </div>
  );
}
