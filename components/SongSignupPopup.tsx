"use client";

/*
  Rock Your People — "בחרו שיר, עלו לבמה" popup.

  Scrolling past ~35% of the page reveals a small closed teaser pill
  ("מופע בפאב רעים 26.8"), once per browser session. Tapping the pill
  opens the full song sign-up dialog designed for this flow.
*/

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SONG_SIGNUP_SHEET_URL } from "@/lib/constants";

const YELLOW = "#ffe34d";
const BLACK = "#1e1c1c";
const TEASER_TITLE = "מופע בפאב רעים 26.8";

type LineupItem = { title: string; artist: string; taken: number };

// Edit the lineup here. `taken` = how many places are already booked.
const LINEUP: LineupItem[] = [
  { title: "אני אוהב אותך", artist: "מיכה שיטרית", taken: 0 },
  { title: "יש לי חברה", artist: "טיפקס", taken: 0 },
  { title: "Twist and Shout", artist: "The Beatles", taken: 0 },
  { title: "אחכה לך בשדות", artist: "משינה", taken: 0 },
  { title: "עצוב בלעדייך", artist: "אביב גפן", taken: 0 },
  { title: "ג׳סיקה", artist: "אתניקס", taken: 0 },
  { title: "יעקב", artist: "ללדין", taken: 0 },
  { title: "טיפ טיפה", artist: "אהוד בנאי", taken: 0 },
];

const CSS = `
.ryp-in{border:0;border-bottom:1px solid rgba(255,255,255,.35);background:transparent;width:100%;
  font:inherit;font-size:17px;padding:8px 0 9px;color:#fff;border-radius:0;outline:none}
.ryp-in::placeholder{color:rgba(255,255,255,.4)}
.ryp-in:focus{border-bottom-color:${YELLOW};box-shadow:0 1px 0 0 ${YELLOW}}
.ryp-row:hover .ryp-title{color:#ffee9a}
.ryp-song:hover:not(:disabled){background:rgba(255,255,255,.06)}
.ryp-song:disabled{opacity:.45;cursor:not-allowed}
.ryp-cta:hover:not(:disabled){background:#ffd400}
.ryp-cta:disabled{opacity:.45;cursor:not-allowed}
.ryp-x:hover{color:${YELLOW}}
.ryp-teaser:hover{transform:translateY(-2px)}
:where(.ryp-scope) *:focus-visible{outline:2px solid ${YELLOW};outline-offset:2px}
@keyframes ryp-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes ryp-fade{from{opacity:0}to{opacity:1}}
@keyframes ryp-open{from{opacity:0;max-height:0}to{opacity:1;max-height:340px}}
`;

type Pick = { name: string; phone: string; note: string };
type Picks = Record<number, Pick>;

type Phase = "hidden" | "teaser" | "open";

type SongSignupPopupProps = {
  slotLimit?: number;
  askNote?: boolean;
  autoOpenAtScroll?: number; // viewport heights scrolled before the teaser appears; 0 disables it
  open?: boolean;
  onClose?: () => void;
};

export function SongSignupPopup({
  slotLimit = 3,
  askNote = true,
  autoOpenAtScroll = 1,
  open: controlledOpen,
  onClose,
}: SongSignupPopupProps) {
  const isControlled = controlledOpen !== undefined;
  const [selfPhase, setSelfPhase] = useState<Phase>("hidden");
  const phase: Phase = isControlled
    ? controlledOpen
      ? "open"
      : "hidden"
    : selfPhase;

  const [expanded, setExpanded] = useState<number | null>(null);
  const [picks, setPicks] = useState<Picks>({});
  const [tried, setTried] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // reveal the teaser pill after scroll past autoOpenAtScroll, every page load
  useEffect(() => {
    if (isControlled || !autoOpenAtScroll) return;
    const onScroll = () => {
      if (window.scrollY >= autoOpenAtScroll * window.innerHeight) {
        setSelfPhase("teaser");
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isControlled, autoOpenAtScroll]);

  const close = useCallback(() => {
    setExpanded(null);
    setPicks({});
    setTried(false);
    setSubmitted(false);
    if (isControlled) onClose?.();
    else setSelfPhase("teaser");
  }, [isControlled, onClose]);

  // lock body scroll + esc to close, only while the full dialog is open
  useEffect(() => {
    if (phase !== "open") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [phase, close]);

  function dismissTeaser() {
    if (isControlled) return;
    setSelfPhase("hidden");
  }

  function openFull() {
    if (isControlled) return;
    setSelfPhase("open");
  }

  function toggle(i: number) {
    setExpanded((v) => (v === i ? null : i));
    setPicks((p) => (p[i] ? p : { ...p, [i]: { name: "", phone: "", note: "" } }));
  }

  function setField(i: number, key: keyof Pick, val: string) {
    setPicks((p) => ({
      ...p,
      [i]: { ...(p[i] || { name: "", phone: "", note: "" }), [key]: val },
    }));
  }

  const valid = useMemo(
    () =>
      Object.keys(picks)
        .filter((k) => picks[Number(k)].name.trim())
        .map(Number),
    [picks],
  );

  function submit() {
    if (!valid.length) return setTried(true);

    // one row per chosen song; fire-and-forget, no-cors (Apps Script gives an opaque response)
    for (const i of valid) {
      const p = picks[i];
      fetch(SONG_SIGNUP_SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          song: LINEUP[i].title,
          artist: LINEUP[i].artist,
          name: p.name.trim(),
          phone: p.phone.trim(),
          note: p.note.trim(),
        }),
      }).catch(() => {});
    }

    setSubmitted(true);
  }

  if (phase === "hidden") return null;

  if (phase === "teaser") {
    return (
      <div className="ryp-scope" dir="rtl">
        <style>{CSS}</style>
        <div
          style={{
            position: "fixed",
            insetInlineEnd: 16,
            bottom: "calc(16px + env(safe-area-inset-bottom))",
            zIndex: 9998,
            display: "flex",
            alignItems: "center",
            gap: 2,
            fontFamily: '"Frank Ruhl Libre", Georgia, serif',
            animation: "ryp-rise .4s cubic-bezier(.2,.8,.25,1) both",
          }}
        >
          <button
            type="button"
            className="ryp-teaser"
            onClick={openFull}
            style={{
              border: `1.5px solid ${YELLOW}`,
              background: BLACK,
              color: YELLOW,
              font: "inherit",
              fontWeight: 700,
              fontSize: 15,
              lineHeight: 1.3,
              padding: "12px 16px",
              minHeight: 48,
              cursor: "pointer",
              borderRadius: "2px 0 0 2px",
              boxShadow: "0 8px 24px rgba(0,0,0,.35)",
              transition: "transform .15s ease",
            }}
          >
            {TEASER_TITLE}
          </button>
          <button
            type="button"
            className="ryp-x"
            onClick={dismissTeaser}
            aria-label="סגירה"
            style={{
              alignSelf: "stretch",
              border: `1.5px solid ${YELLOW}`,
              borderInlineStart: 0,
              background: BLACK,
              color: "#fff",
              font: "inherit",
              fontSize: 18,
              lineHeight: 1,
              cursor: "pointer",
              padding: "0 10px",
              borderRadius: "0 2px 2px 0",
              boxShadow: "0 8px 24px rgba(0,0,0,.35)",
            }}
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  const n = valid.length;
  const countLabel =
    n === 0 ? "עוד לא נבחר שיר" : n === 1 ? "שיר אחד נבחר" : `${n} שירים נבחרו`;

  return (
    <div
      className="ryp-scope"
      dir="rtl"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        overflowY: "auto",
        background: "rgba(30,28,28,.72)",
        animation: "ryp-fade .3s ease both",
        fontFamily: '"Frank Ruhl Libre", Georgia, serif',
      }}
    >
      <style>{CSS}</style>

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="בחירת שיר להשתתפות על הבמה"
        style={{
          position: "relative",
          width: "min(480px,100%)",
          minHeight: "100vh",
          background: BLACK,
          color: "#fff",
          boxShadow: "0 12px 32px rgba(0,0,0,.45)",
          display: "flex",
          flexDirection: "column",
          animation: "ryp-rise .42s cubic-bezier(.2,.8,.25,1) both",
        }}
      >
        {/* head */}
        <div
          style={{
            padding: "22px 22px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            borderBottom: "1px solid rgba(255,255,255,.14)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 14,
            }}
          >
            <div style={{ fontSize: 11, letterSpacing: ".2em", opacity: 0.65 }}>
              YOUR PEOPLE ON STAGE
            </div>
            <button
              type="button"
              className="ryp-x"
              onClick={close}
              aria-label="סגירה"
              style={{
                border: 0,
                background: "transparent",
                font: "inherit",
                fontSize: 24,
                lineHeight: 1,
                color: "#fff",
                cursor: "pointer",
                padding: "0 2px",
                margin: "-2px 0 0",
              }}
            >
              ×
            </button>
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: 34,
              lineHeight: 1.08,
              fontWeight: 700,
              letterSpacing: "-.01em",
              color: YELLOW,
            }}
          >
            בחרו שיר.
            <br />
            עלו איתנו לבמה.
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: 16, lineHeight: 1.55, textWrap: "pretty" }}>
            במופע הקרוב ברעים נבצע גם את השירים האלה, מוזמנים להצטרף אלינו! בחרו את השיר שאתם רוצים
            לשיר איתנו — אפשר יותר מאחד — והשאירו פרטים.
          </p>
        </div>

        {!submitted ? (
          <>
            <div style={{ flex: 1 }}>
              {LINEUP.map((s, i) => {
                const taken = Math.min(s.taken, slotLimit);
                const left = Math.max(slotLimit - taken, 0);
                const full = left === 0;
                const p = picks[i];
                const selected = !!p && !!p.name.trim();
                const isOpen = expanded === i;
                return (
                  <div
                    key={i}
                    className="ryp-row"
                    style={{ borderBottom: "1px solid rgba(255,255,255,.14)" }}
                  >
                    <button
                      type="button"
                      className="ryp-song"
                      onClick={() => toggle(i)}
                      disabled={full}
                      aria-expanded={isOpen}
                      style={{
                        width: "100%",
                        textAlign: "right",
                        background: "transparent",
                        border: 0,
                        font: "inherit",
                        color: "inherit",
                        cursor: "pointer",
                        padding: "16px 22px",
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          flex: "none",
                          width: 20,
                          height: 20,
                          fontSize: 13,
                          lineHeight: "18px",
                          textAlign: "center",
                          border: `1.5px solid ${selected ? YELLOW : "rgba(255,255,255,.45)"}`,
                          background: selected ? YELLOW : "transparent",
                          color: BLACK,
                        }}
                      >
                        {selected ? "✓" : ""}
                      </span>

                      <span
                        style={{
                          flex: 1,
                          minWidth: 0,
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        <span
                          className="ryp-title"
                          style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.2, color: YELLOW }}
                        >
                          {s.title}
                        </span>
                        <span style={{ fontSize: 15, opacity: 0.7 }}>{s.artist}</span>
                      </span>

                      <span
                        style={{
                          flex: "none",
                          whiteSpace: "nowrap",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            color: full ? "rgba(255,255,255,.45)" : "rgba(255,255,255,.7)",
                          }}
                        >
                          {full ? "מלא" : `${left} מקומות`}
                        </span>
                        <span aria-hidden style={{ display: "flex", gap: 3 }}>
                          {Array.from({ length: slotLimit }, (_, k) => (
                            <span
                              key={k}
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: k < taken ? "rgba(255,255,255,.3)" : YELLOW,
                              }}
                            />
                          ))}
                        </span>
                      </span>
                    </button>

                    {isOpen && (
                      <div
                        style={{
                          overflow: "hidden",
                          animation: "ryp-open .3s ease both",
                          background: "rgba(255,255,255,.05)",
                          borderTop: "1px solid rgba(255,255,255,.14)",
                        }}
                      >
                        <div
                          style={{
                            padding: "18px 22px 22px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 18,
                          }}
                        >
                          <Field id={`ryp-n${i}`} label={<>שם מלא <span style={{ color: YELLOW }}>*</span></>}>
                            <input
                              id={`ryp-n${i}`}
                              className="ryp-in"
                              type="text"
                              required
                              value={p?.name || ""}
                              onChange={(e) => setField(i, "name", e.target.value)}
                            />
                            {tried && !p?.name.trim() && (
                              <span style={{ fontSize: 13, color: YELLOW }}>
                                צריך שם מלא כדי לשריין מקום
                              </span>
                            )}
                          </Field>
                          <Field id={`ryp-p${i}`} label={<>טלפון <Opt /></>}>
                            <input
                              id={`ryp-p${i}`}
                              className="ryp-in"
                              type="tel"
                              dir="ltr"
                              style={{ textAlign: "right" }}
                              value={p?.phone || ""}
                              onChange={(e) => setField(i, "phone", e.target.value)}
                              placeholder="050-0000000"
                            />
                          </Field>
                          {askNote && (
                            <Field id={`ryp-m${i}`} label={<>הודעה ללהקה <Opt /></>}>
                              <input
                                id={`ryp-m${i}`}
                                className="ryp-in"
                                type="text"
                                value={p?.note || ""}
                                onChange={(e) => setField(i, "note", e.target.value)}
                                placeholder="שרתי את זה פעם בקריוקי…"
                              />
                            </Field>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div
              style={{
                position: "sticky",
                bottom: 0,
                background: BLACK,
                borderTop: "1px solid rgba(255,255,255,.14)",
                padding: "14px 22px calc(16px + env(safe-area-inset-bottom))",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 15 }}>{countLabel}</span>
                {!!Object.keys(picks).length && (
                  <button
                    type="button"
                    onClick={() => {
                      setPicks({});
                      setExpanded(null);
                      setTried(false);
                    }}
                    style={{
                      border: 0,
                      background: "transparent",
                      font: "inherit",
                      fontSize: 14,
                      color: "#fff",
                      textDecoration: "underline",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    ניקוי הבחירה
                  </button>
                )}
              </div>
              <button
                type="button"
                className="ryp-cta"
                onClick={submit}
                disabled={!n}
                style={{
                  width: "100%",
                  border: 0,
                  background: YELLOW,
                  color: BLACK,
                  font: "inherit",
                  fontWeight: 700,
                  fontSize: 18,
                  padding: 15,
                  minHeight: 52,
                  cursor: "pointer",
                  borderRadius: 2,
                }}
              >
                שריינו לי מקום על הבמה
              </button>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 18,
              padding: "40px 22px",
              animation: "ryp-fade .35s ease both",
            }}
          >
            <div style={{ fontSize: 11, letterSpacing: ".2em", opacity: 0.65 }}>SEE YOU ON STAGE</div>
            <h3 style={{ margin: 0, fontSize: 32, lineHeight: 1.1, fontWeight: 700, color: YELLOW }}>
              שמור לכם מקום.
            </h3>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6 }}>
              {n === 1
                ? `${picks[valid[0]].name.trim().split(" ")[0]}, רשמנו אתכם לשיר:`
                : "רשמנו אתכם לשירים הבאים:"}
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                borderTop: "1px solid rgba(255,255,255,.14)",
                paddingTop: 18,
              }}
            >
              {valid.map((i) => (
                <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span style={{ fontSize: 19, fontWeight: 700, color: YELLOW }}>{LINEUP[i].title}</span>
                  <span style={{ fontSize: 15, opacity: 0.7 }}>{LINEUP[i].artist}</span>
                </div>
              ))}
            </div>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, opacity: 0.7 }}>
              נרשמתם בהצלחה — נפגש על הבמה!
            </p>
            <button
              type="button"
              onClick={close}
              style={{
                alignSelf: "flex-start",
                font: "inherit",
                fontSize: 16,
                minHeight: 48,
                padding: "0 20px",
                background: "transparent",
                color: "#fff",
                border: "1px solid rgba(255,255,255,.45)",
                borderRadius: 2,
                cursor: "pointer",
              }}
            >
              סגירה
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label htmlFor={id} style={{ fontSize: 13, color: "#fff", opacity: 0.75 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const Opt = () => <span style={{ color: "#fff", opacity: 0.55 }}>(לא חובה)</span>;
