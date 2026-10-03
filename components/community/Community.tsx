import { useState } from "react";

/* ---------- 1. Replace these with your real WhatsApp group invite links ---------- */
const WHATSAPP_EXPECTANT = "https://https://chat.whatsapp.com/EpCcr513PXN1kveWWGhq48";
const WHATSAPP_POSTPARTUM = "https://chat.whatsapp.com/EMvQs7dan4VIQbMsL6KV4w";

/* ---------- 2. Content ---------- */
interface Option {
  id: "expectant" | "postpartum";
  title: string;
  subtitle: string;
  message: string;
  tips: string[];
  invite: string;
  buttonLabel: string;
  link: string;
  accent: string; // main colour for this option
  tint: string; // soft background for this option
}

const OPTIONS: Option[] = [
  {
    id: "expectant",
    title: "Expectant mother",
    subtitle: "Looking after yourself while you carry your baby",
    message:
      "Pregnancy asks a lot of your body. Small, steady habits make the biggest difference.",
    tips: [
      "Attend your antenatal check-ups and ask every question you have.",
      "Eat a variety of whole foods, drink plenty of water, and take the supplements your clinic recommends.",
      "Rest when you can, and keep up gentle movement like short walks.",
      "Know the warning signs (heavy bleeding, severe headaches, reduced baby movement) and go to the clinic quickly if you notice them.",
    ],
    invite:
      "Want to learn more or hear from other mothers on the same journey? Join our Expectant Mothers WhatsApp group below.",
    buttonLabel: "Join the Expectant Mothers group",
    link: WHATSAPP_EXPECTANT,
    accent: "#1F6F66",
    tint: "#E3F1EE",
  },
  {
    id: "postpartum",
    title: "Postpartum mother",
    subtitle: "Healing and caring for yourself after birth",
    message:
      "Your recovery matters as much as your baby's care. Be patient with your body and your feelings.",
    tips: [
      "Rest whenever your baby sleeps, and accept help with meals and chores.",
      "Eat nourishing food, drink water, and attend your postnatal check-up.",
      "Mood changes are common. If sadness or worry lasts more than two weeks, talk to someone you trust or a health worker.",
      "Seek care quickly for fever, heavy bleeding, severe pain, or wounds that look infected.",
    ],
    invite:
      "Want support, advice, or just a friendly space to share? Join our Postpartum Mothers WhatsApp group below.",
    buttonLabel: "Join the Postpartum Mothers group",
    link: WHATSAPP_POSTPARTUM,
    accent: "#9C3D72",
    tint: "#F7E6EF",
  },
];

/* ---------- 3. Page ---------- */
export default function MaternalCarePage() {
  const [openId, setOpenId] = useState<Option["id"] | null>(null);

  const toggle = (id: Option["id"]) =>
    setOpenId((current) => (current === id ? null : id));

  return (
    <main className="mc-page">
      <style>{css}</style>

      <header className="mc-hero">
        <h1>Mothers caring for mothers</h1>
        <p>
          A community for every stage of motherhood. Choose where you are right
          now and find support made for you.
        </p>
      </header>

      <section className="mc-list" aria-label="Choose your stage">
        {OPTIONS.map((opt) => {
          const isOpen = openId === opt.id;
          return (
            <div
              key={opt.id}
              className="mc-item"
              style={
                {
                  "--accent": opt.accent,
                  "--tint": opt.tint,
                } as React.CSSProperties
              }
            >
              <button
                className="mc-trigger"
                aria-expanded={isOpen}
                aria-controls={`panel-${opt.id}`}
                id={`trigger-${opt.id}`}
                onClick={() => toggle(opt.id)}
              >
                <span>
                  <span className="mc-title">{opt.title}</span>
                  <span className="mc-subtitle">{opt.subtitle}</span>
                </span>
                <span className={`mc-chevron ${isOpen ? "open" : ""}`} aria-hidden="true">
                  ▾
                </span>
              </button>

              <div
                id={`panel-${opt.id}`}
                role="region"
                aria-labelledby={`trigger-${opt.id}`}
                className={`mc-panel ${isOpen ? "open" : ""}`}
              >
                <div className="mc-panel-inner">
                  <p className="mc-message">{opt.message}</p>
                  <ul>
                    {opt.tips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                  <p className="mc-invite">{opt.invite}</p>
                  <a
                    className="mc-join"
                    href={opt.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {opt.buttonLabel}
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <footer className="mc-footer">
        This community shares general support and is not a substitute for
        medical advice. In an emergency, go to your nearest health facility.
      </footer>
    </main>
  );
}

/* ---------- 4. Styles (colour tokens at the top) ---------- */
const css = `
:root {
  --bg: #F5F0F6;
  --ink: #2B1A2E;
  --muted: #6A5A6D;
  --card: #FFFFFF;
  --whatsapp: #0E7C66;
}
.mc-page {
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  font-family: "Georgia", "Times New Roman", serif;
  padding: 48px 20px 40px;
  box-sizing: border-box;
}
.mc-hero { max-width: 640px; margin: 0 auto 32px; text-align: left; }
.mc-hero h1 { font-size: clamp(2rem, 6vw, 3rem); line-height: 1.1; margin: 0 0 12px; }
.mc-hero p { font-size: 1.1rem; line-height: 1.6; color: var(--muted); margin: 0; }

.mc-list { max-width: 640px; margin: 0 auto; display: grid; gap: 16px; }
.mc-item {
  background: var(--card);
  border-radius: 14px;
  border-left: 8px solid var(--accent);
  box-shadow: 0 1px 3px rgba(43, 26, 46, 0.12);
  overflow: hidden;
}
.mc-trigger {
  width: 100%;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 20px 22px;
  background: transparent; border: 0; cursor: pointer; text-align: left;
  font: inherit; color: inherit;
}
.mc-trigger:hover { background: var(--tint); }
.mc-trigger:focus-visible { outline: 3px solid var(--accent); outline-offset: -3px; }
.mc-title { display: block; font-size: 1.35rem; font-weight: 700; color: var(--accent); }
.mc-subtitle { display: block; margin-top: 4px; font-family: system-ui, sans-serif; font-size: 0.95rem; color: var(--muted); }
.mc-chevron { font-size: 1.4rem; color: var(--accent); transition: transform 0.25s ease; }
.mc-chevron.open { transform: rotate(180deg); }

.mc-panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.3s ease; }
.mc-panel.open { grid-template-rows: 1fr; }
.mc-panel-inner { overflow: hidden; min-height: 0; padding: 0 22px; background: var(--tint); }
.mc-panel.open .mc-panel-inner { padding: 20px 22px 24px; }

.mc-message { font-size: 1.1rem; line-height: 1.6; margin: 0 0 12px; font-style: italic; }
.mc-panel ul { margin: 0 0 18px; padding-left: 20px; font-family: system-ui, sans-serif; line-height: 1.6; }
.mc-panel li { margin-bottom: 6px; }
.mc-invite { font-weight: 700; line-height: 1.5; margin: 0 0 14px; }
.mc-join {
  display: inline-block;
  background: var(--whatsapp); color: #fff;
  font-family: system-ui, sans-serif; font-weight: 600;
  padding: 12px 20px; border-radius: 999px; text-decoration: none;
}
.mc-join:hover { filter: brightness(1.1); }
.mc-join:focus-visible { outline: 3px solid var(--ink); outline-offset: 3px; }

.mc-footer { max-width: 640px; margin: 36px auto 0; font-family: system-ui, sans-serif; font-size: 0.85rem; color: var(--muted); line-height: 1.5; }

@media (prefers-reduced-motion: reduce) {
  .mc-panel, .mc-chevron { transition: none; }
}
`;