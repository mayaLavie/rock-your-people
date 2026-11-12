"use client";

/*
  Rock Your People — "בחרו שיר, עלו לבמה" popup.

  Shortly after the page loads, a small floating teaser pill appears just above
  the Rock Your People logo (top-right on mid-size desktops with no side logo). Tapping
  the pill opens the full song sign-up dialog designed for this flow.
*/

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { SONG_SIGNUP_SHEET_URL } from "@/lib/constants";

const YELLOW = "#ffe34d";
const BLACK = "#1e1c1c";
const HEART_RED = "#ff2d55";
const LIKED_SONGS_STORAGE_KEY = "ryp-song-likes";
const TEASER_TITLE = "לחצו, ובחרו שיר שתרצו לשיר איתנו על הבמה, במופע במושב פארן, 27.11";

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
  { title: "סוף עונת התפוזים", artist: "תמוז", taken: 0 },
  { title: "Great Balls of Fire", artist: "Jerry Lee Lewis", taken: 0 },
  { title: "Crazy Little Thing Called Love", artist: "Queen", taken: 0 },
  { title: "I Feel Good", artist: "James Brown", taken: 0 },
  { title: "אהבה בת 20", artist: "יוסי בנאי", taken: 0 },
  { title: "Could You Be Loved", artist: "Bob Marley", taken: 0 },
  { title: "או לה פופה", artist: "נועה קירל", taken: 0 },
  { title: "הכל מבינה", artist: "פורטרט", taken: 0 },
  { title: "מישהו שומע אותי", artist: "איפה הילד", taken: 0 },
  { title: "With A Little Help From My Friends", artist: "Joe Cocker", taken: 0 },
  { title: "הקולות של פיראוס", artist: "חיים משה", taken: 0 },
  { title: "מה קרה לך", artist: "שוטי הנבואה", taken: 0 },
  { title: "שיר ישן", artist: "אתניקס", taken: 0 },
  { title: "עוד ארון אחד", artist: "היהודים", taken: 0 },
  { title: "חלליות", artist: "ברי סחרוף", taken: 0 },
  { title: "איזה יום היה לי סמואל", artist: "השמחות", taken: 0 },
  { title: "היו לי פעם חברים", artist: "השמחות", taken: 0 },
  { title: "ריקדי", artist: "ישי לוי", taken: 0 },
  { title: "רונה", artist: "סמיר שוקרי", taken: 0 },
  { title: "תתקעו בחצוצרה", artist: "שב״ק ס׳", taken: 0 },
  { title: "Valerie", artist: "Amy Winehouse", taken: 0 },
  { title: "בואי הביתה", artist: "ברי סחרוף", taken: 0 },
  { title: "עוד יהיה לי", artist: "מרגלית צנעני", taken: 0 },
  { title: "איש וכינור", artist: "להקת שפתיים", taken: 0 },
  { title: "Everybody", artist: "Backstreet Boys", taken: 0 },
  { title: "שכשנבוא", artist: "אריק איינשטיין ומיקי גבריאלוב", taken: 0 },
  { title: "להתראות נעורים שלום אהבה", artist: "משינה", taken: 0 },
  { title: "זן נדיר", artist: "קורין אלאל", taken: 0 },
  { title: "יושב על הגדר", artist: "אריק איינשטיין", taken: 0 },
  { title: "אחלום לנצח", artist: "מופע הארנבות של ד״ר קספר", taken: 0 },
  { title: "אמריקה", artist: "פורטיסחרוף", taken: 0 },
  { title: "Three Little Birds", artist: "Bob Marley", taken: 0 },
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
.ryp-heart:hover{background:rgba(255,255,255,.06)}
@keyframes ryp-pop{0%{transform:scale(1)}40%{transform:scale(1.3)}100%{transform:scale(1)}}
.ryp-cta:disabled{opacity:.45;cursor:not-allowed}
.ryp-x:hover{color:${YELLOW}}
.ryp-teaser:hover{filter:brightness(1.08)}
:where(.ryp-scope) *:focus-visible{outline:2px solid ${YELLOW};outline-offset:2px}
@keyframes ryp-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@keyframes ryp-fade{from{opacity:0}to{opacity:1}}
@keyframes ryp-open{from{opacity:0;max-height:0}to{opacity:1;max-height:340px}}
@keyframes ryp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}

/* teaser pill: centered on mobile, top-right on desktop, gently floating */
.ryp-teaser-wrap{
  position:fixed;
  left:16px;
  right:16px;
  width:fit-content;
  max-width:calc(100vw - 32px);
  margin-inline:auto;
  top:calc(var(--site-header-height, 60px) + 12px + env(safe-area-inset-top));
  z-index:9998;
  animation:
    ryp-rise .4s cubic-bezier(.2,.8,.25,1) both,
    ryp-float 1.4s ease-in-out .4s infinite;
}
@media (min-width:1024px){
  .ryp-teaser-wrap{
    left:auto;
    right:16px;
    margin-inline:0;
    max-width:none;
    top:calc(var(--desktop-site-header-height, 72px) + 12px + env(safe-area-inset-top));
  }
}
@media (prefers-reduced-motion: reduce){
  .ryp-teaser-wrap{animation:ryp-rise .4s cubic-bezier(.2,.8,.25,1) both}
}
`;

type Pick = { name: string; phone: string; note: string };

/** Picks key for the free-text "song not on the list" row */
const CUSTOM_SONG = -1;
const CUSTOM_SONG_ARTIST = "שיר מחוץ לרשימה";
const CUSTOM_ROW_OPEN_MS = 320; // matches the ryp-open animation (.3s)

function readLikedSongs(): Set<string> {
  try {
    const raw = localStorage.getItem(LIKED_SONGS_STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeLikedSongs(liked: Set<string>) {
  try {
    localStorage.setItem(LIKED_SONGS_STORAGE_KEY, JSON.stringify([...liked]));
  } catch {}
}

const TEASER_LOGO_GAP_PX = 12;
const TEASER_DESKTOP_MAX_WIDTH_PX = 300;

/** Fixed-position style that sits the teaser just above the visible hero logo. */
function getTeaserPlacement(wrap: HTMLElement): CSSProperties | null {
  const logo = Array.from(
    document.querySelectorAll<HTMLElement>("[data-hero-logo]"),
  ).find((el) => el.getBoundingClientRect().width > 0);
  if (!logo) return null;

  const rect = logo.getBoundingClientRect();
  const isDesktop = window.matchMedia("(min-width:1024px)").matches;
  // keep the desktop pill about as narrow as the side column so it doesn't cover the page
  const maxWidth = isDesktop ? TEASER_DESKTOP_MAX_WIDTH_PX : undefined;
  if (maxWidth) wrap.style.maxWidth = `${maxWidth}px`;
  // mobile logo scrolls with the page, so place against its spot on the first screen;
  // the desktop side logo is sticky, so its viewport position is what counts
  const logoTop = isDesktop ? rect.top : rect.top + window.scrollY;
  const top = Math.max(
    TEASER_LOGO_GAP_PX,
    logoTop - wrap.offsetHeight - TEASER_LOGO_GAP_PX,
  );

  if (!isDesktop) return { top };

  const width = wrap.offsetWidth;
  const left = Math.max(16, rect.left + rect.width / 2 - width / 2);
  return { top, left, right: "auto", marginInline: 0, maxWidth };
}
type Picks = Record<number, Pick>;

type Phase = "hidden" | "teaser" | "open";

type SongSignupPopupProps = {
  slotLimit?: number;
  askNote?: boolean;
  autoOpenDelayMs?: number; // ms after the page mounts before the teaser appears; 0 disables it
  open?: boolean;
  onClose?: () => void;
};

export function SongSignupPopup({
  slotLimit = 3,
  askNote = true,
  autoOpenDelayMs = 600,
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
  const [customSong, setCustomSong] = useState("");
  const customRowRef = useRef<HTMLDivElement>(null);

  // the free-text row is last in the list, so bring its fields into view when it opens
  useEffect(() => {
    if (expanded !== CUSTOM_SONG) return;
    const row = customRowRef.current;
    const scroller = row?.closest<HTMLElement>(".ryp-scope");
    if (!row || !scroller) return;
    // wait for the fields' open animation, otherwise there is no room to scroll into yet
    const timer = window.setTimeout(() => {
      const top =
        scroller.scrollTop +
        row.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top;
      scroller.scrollTo({ top, behavior: "smooth" });
    }, CUSTOM_ROW_OPEN_MS);
    return () => window.clearTimeout(timer);
  }, [expanded]);
  const panelRef = useRef<HTMLDivElement>(null);
  const teaserRef = useRef<HTMLDivElement>(null);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  // localStorage is missing during server render; readLikedSongs falls back to an empty set
  const [likedSongs, setLikedSongs] = useState<Set<string>>(readLikedSongs);

  // load everyone's heart counts when the dialog opens
  useEffect(() => {
    if (phase !== "open") return;
    let cancelled = false;
    fetch(SONG_SIGNUP_SHEET_URL)
      .then((res) => res.json())
      .then((data: { likes?: Record<string, number> }) => {
        if (!cancelled && data.likes) setLikeCounts(data.likes);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [phase]);

  function toggleLike(song: LineupItem) {
    const liked = !likedSongs.has(song.title);
    const next = new Set(likedSongs);
    if (liked) next.add(song.title);
    else next.delete(song.title);
    setLikedSongs(next);
    writeLikedSongs(next);
    setLikeCounts((counts) => ({
      ...counts,
      [song.title]: Math.max(0, (counts[song.title] ?? 0) + (liked ? 1 : -1)),
    }));

    // sent on its own, separate from the sign-up form
    fetch(SONG_SIGNUP_SHEET_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        type: "like",
        action: liked ? "like" : "unlike",
        song: song.title,
        artist: song.artist,
      }),
    }).catch(() => {});
  }
  const [teaserPlacement, setTeaserPlacement] = useState<CSSProperties | null>(null);

  useLayoutEffect(() => {
    if (phase !== "teaser") return;
    const place = () => {
      if (teaserRef.current) setTeaserPlacement(getTeaserPlacement(teaserRef.current));
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [phase]);

  // reveal the teaser pill shortly after the page loads, so it's visible on the first screen
  useEffect(() => {
    if (isControlled || !autoOpenDelayMs) return;
    const timer = window.setTimeout(() => setSelfPhase("teaser"), autoOpenDelayMs);
    return () => window.clearTimeout(timer);
  }, [isControlled, autoOpenDelayMs]);

  const close = useCallback(() => {
    setExpanded(null);
    setPicks({});
    setTried(false);
    setSubmitted(false);
    setCustomSong("");
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

  function songFor(i: number): { title: string; artist: string } {
    return i === CUSTOM_SONG
      ? { title: customSong.trim(), artist: CUSTOM_SONG_ARTIST }
      : LINEUP[i];
  }

  const valid = useMemo(
    () =>
      Object.keys(picks)
        .filter((k) => {
          const i = Number(k);
          const p = picks[i];
          if (i === CUSTOM_SONG && !customSong.trim()) return false;
          return p.name.trim() && p.phone.trim();
        })
        .map(Number),
    [picks, customSong],
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
          song: songFor(i).title,
          artist: songFor(i).artist,
          name: p.name.trim(),
          phone: p.phone.trim(),
          note: p.note.trim(),
        }),
      }).catch(() => {});
    }

    setSubmitted(true);
  }

  // name / phone / note fields shown when a song row is opened
  function renderSignupFields(i: number, extraField?: ReactNode) {
    const p = picks[i];
    return (
      <div
        style={{
          padding: "18px 22px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {extraField}
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
        <Field
          id={`ryp-p${i}`}
          label={
            <>
              טלפון <span style={{ color: YELLOW }}>*</span>{" "}
              <span style={{ color: "#fff", opacity: 0.55 }}>
                (שנהיה בקשר לפני שעולים לבמה)
              </span>
            </>
          }
        >
          <input
            id={`ryp-p${i}`}
            className="ryp-in"
            type="tel"
            required
            dir="ltr"
            style={{ textAlign: "right" }}
            value={p?.phone || ""}
            onChange={(e) => setField(i, "phone", e.target.value)}
          />
          {tried && !p?.phone.trim() && (
            <span style={{ fontSize: 13, color: YELLOW }}>
              צריך מספר טלפון כדי לשריין מקום
            </span>
          )}
        </Field>
        {askNote && i !== CUSTOM_SONG && (
          <Field id={`ryp-m${i}`} label={<>הודעה ללהקה <Opt /></>}>
            <input
              id={`ryp-m${i}`}
              className="ryp-in"
              type="text"
              value={p?.note || ""}
              onChange={(e) => setField(i, "note", e.target.value)}
            />
          </Field>
        )}
      </div>
    );
  }

  if (phase === "hidden") return null;

  if (phase === "teaser") {
    return (
      <div className="ryp-scope" dir="rtl">
        <style>{CSS}</style>
        <div
          ref={teaserRef}
          className="ryp-teaser-wrap"
          style={{
            ...teaserPlacement,
            display: "flex",
            alignItems: "center",
            gap: 2,
            fontFamily: '"Frank Ruhl Libre", Georgia, serif',
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
              borderRadius: "5px",
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
              border: 0,
              background: "transparent",
              color: "#fff",
              font: "inherit",
              fontSize: 22,
              lineHeight: 1,
              cursor: "pointer",
              padding: "0 8px",
              boxShadow: "none",
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
    n === 0 ? "טרם נבחר שיר" : n === 1 ? "שיר אחד נבחר" : `${n} שירים נבחרו`;

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
            סמנו ❤️ ליד השירים שתרצו שננגן.
            <br />
            רוצים לשיר איתנו? בחרו שיר והשאירו פרטים
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
                const selected = !!p && !!p.name.trim() && !!p.phone.trim();
                const isOpen = expanded === i;
                const liked = likedSongs.has(s.title);
                const likeCount = likeCounts[s.title] ?? 0;
                return (
                  <div
                    key={i}
                    className="ryp-row"
                    style={{ borderBottom: "1px solid rgba(255,255,255,.14)" }}
                  >
                    <div style={{ display: "flex", alignItems: "stretch" }}>
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
                      </button>
                      <button
                        type="button"
                        className="ryp-heart"
                        onClick={() => toggleLike(s)}
                        aria-pressed={liked}
                        aria-label={liked ? `ביטול לייק לשיר ${s.title}` : `לייק לשיר ${s.title}`}
                        style={{
                          flex: "none",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 2,
                          minWidth: 58,
                          padding: "0 14px",
                          background: "transparent",
                          border: 0,
                          font: "inherit",
                          color: liked ? HEART_RED : "rgba(255,255,255,.6)",
                          cursor: "pointer",
                        }}
                      >
                        <svg
                          key={liked ? "on" : "off"}
                          aria-hidden
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill={liked ? HEART_RED : "none"}
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinejoin="round"
                          style={liked ? { animation: "ryp-pop .3s ease" } : undefined}
                        >
                          <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.8 1.2 5.3 3.1 1.5-1.9 3.2-3.1 5.3-3.1 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" />
                        </svg>
                        <span style={{ fontSize: 13, lineHeight: 1, minHeight: 13 }}>
                          {likeCount > 0 ? likeCount : ""}
                        </span>
                      </button>
                    </div>

                    {isOpen && (
                      <div
                        style={{
                          overflow: "hidden",
                          animation: "ryp-open .3s ease both",
                          background: "rgba(255,255,255,.05)",
                          borderTop: "1px solid rgba(255,255,255,.14)",
                        }}
                      >
                        {renderSignupFields(i)}
                      </div>
                    )}
                  </div>
                );
              })}
              {(() => {
                const p = picks[CUSTOM_SONG];
                const selected =
                  !!p && !!p.name.trim() && !!p.phone.trim() && !!customSong.trim();
                const isOpen = expanded === CUSTOM_SONG;
                return (
                  <div
                    ref={customRowRef}
                    className="ryp-row"
                    style={{ borderBottom: "1px solid rgba(255,255,255,.14)" }}
                  >
                    <button
                      type="button"
                      className="ryp-song"
                      onClick={() => toggle(CUSTOM_SONG)}
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
                          {selected ? customSong.trim() : "רוצים לבצע איתנו שיר שלא ברשימה? מוזמנים להציע"}
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
                        {renderSignupFields(
                          CUSTOM_SONG,
                          <Field
                            id="ryp-custom-song"
                            label={<>שם השיר והאמן <span style={{ color: YELLOW }}>*</span></>}
                          >
                            <input
                              id="ryp-custom-song"
                              className="ryp-in"
                              type="text"
                              required
                              value={customSong}
                              onChange={(e) => setCustomSong(e.target.value)}
                            />
                            {tried && !customSong.trim() && (
                              <span style={{ fontSize: 13, color: YELLOW }}>
                                כתבו איזה שיר תרצו לבצע
                              </span>
                            )}
                          </Field>,
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
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
                  borderRadius: 5,
                }}
              >
                שלח
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
                  <span style={{ fontSize: 19, fontWeight: 700, color: YELLOW }}>{songFor(i).title}</span>
                  <span style={{ fontSize: 15, opacity: 0.7 }}>{songFor(i).artist}</span>
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
                borderRadius: 5,
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
