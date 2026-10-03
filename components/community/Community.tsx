'use client'

import { useState } from "react";
import { Users, Heart, ChevronDown, ArrowUpRight, Info } from "lucide-react";

/* ---------- 1. Replace these with your real WhatsApp group invite links ---------- */
const WHATSAPP_EXPECTANT = "https://chat.whatsapp.com/EpCcr513PXN1kveWWGhq48";
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
  },
];

/* ---------- 3. Page ---------- */
export default function MaternalCarePage() {
  const [openId, setOpenId] = useState<Option["id"] | null>(null);

  const toggle = (id: Option["id"]) =>
    setOpenId((current) => (current === id ? null : id));

  return (
    <div className="mc-page">

      <header className="mc-hero">
        <span className="mc-eyebrow"><Users size={16} aria-hidden="true" /> Your community</span>
        <h1>Mothers caring for mothers</h1>
        <p>
          A community for every stage of motherhood. Choose where you are right
          now and find support made for you.
        </p>
      </header>

      <p className="mc-section-label">Find support for your stage</p>
      <section className="mc-list" aria-label="Choose your stage">
        {OPTIONS.map((opt) => {
          const isOpen = openId === opt.id;
          return (
            <div
              key={opt.id}
              className={`mc-item ${isOpen ? "mc-item-open" : ""}`}
            >
              <button
                type="button"
                className="mc-trigger"
                aria-expanded={isOpen}
                aria-controls={`panel-${opt.id}`}
                id={`trigger-${opt.id}`}
                onClick={() => toggle(opt.id)}
              >
                <span className="mc-stage-icon"><Heart size={22} aria-hidden="true" /></span>
                <span className="mc-trigger-copy">
                  <span className="mc-title">{opt.title}</span>
                  <span className="mc-subtitle">{opt.subtitle}</span>
                </span>
                <ChevronDown size={20} className={`mc-chevron ${isOpen ? "open" : ""}`} aria-hidden="true" />
              </button>

              <div
                id={`panel-${opt.id}`}
                hidden={!isOpen}
                role="region"
                aria-labelledby={`trigger-${opt.id}`}
                className={`mc-panel ${isOpen ? "open" : ""}`}
              >
                <div className="mc-panel-inner">
                  <p className="mc-message">{opt.message}</p>
                  <h2 className="mc-tips-heading">Caring for yourself</h2>
                  <ul>
                    {opt.tips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                  <div className="mc-group">
                  <p className="mc-invite">{opt.invite}</p>
                  <a
                    className="mc-join"
                    href={opt.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {opt.buttonLabel}<ArrowUpRight size={18} aria-hidden="true" />
                  </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <footer className="mc-footer">
        <Info size={16} aria-hidden="true" />
        <p>This community shares general support and is not a substitute for
        medical advice. In an emergency, go to your nearest health facility.</p>
      </footer>
    </div>
  );
}

