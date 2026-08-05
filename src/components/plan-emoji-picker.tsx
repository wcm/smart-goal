"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const planEmojis = [
  "🎯", "🚀", "✨", "💡", "🔥", "🌱", "🏆", "⭐",
  "📚", "✍️", "💼", "💰", "📈", "🧠", "🎨", "💻",
  "🏃", "💪", "🧘", "🥗", "❤️", "🏡", "✈️", "🌍",
  "💌", "🎵", "📸", "🛠️", "🗓️", "✅", "🎓", "🤝",
  "🌟", "🎉", "🧩", "🔍", "📣", "📝", "📊", "⏰",
  "⚡", "🧗", "🚴", "🏊", "🥇", "⚽", "🎾", "🏀",
  "🌿", "🍎", "💧", "😴", "☀️", "🌙", "🫶", "😊",
  "🏠", "🔑", "🧳", "🗺️", "🚗", "⛰️", "🏖️", "🎒",
];

const emojiPalettes = [
  { surface: "#f0edff", glow: "#7559ef" },
  { surface: "#eaf5ff", glow: "#489ee8" },
  { surface: "#ecf8f0", glow: "#49ad74" },
  { surface: "#fff0ec", glow: "#ef765f" },
  { surface: "#fff6dc", glow: "#dda428" },
  { surface: "#e9f9fa", glow: "#31a6b1" },
  { surface: "#fff0f5", glow: "#df668e" },
  { surface: "#f7f1e8", glow: "#ae8755" },
];

type EmojiStyle = CSSProperties & {
  "--emoji-surface": string;
  "--emoji-glow": string;
};

export function getPlanEmojiStyle(emoji: string): EmojiStyle {
  const knownIndex = planEmojis.indexOf(emoji);
  const hash = Array.from(emoji).reduce((total, character) => total + (character.codePointAt(0) ?? 0), 0);
  const paletteIndex = knownIndex >= 0 ? Math.floor(knownIndex / 8) : hash;
  const palette = emojiPalettes[paletteIndex % emojiPalettes.length];
  return {
    "--emoji-surface": palette.surface,
    "--emoji-glow": palette.glow,
  };
}

export function PlanEmojiPicker({
  value,
  onChange,
  size = "sm",
}: {
  value?: string;
  onChange: (emoji: string) => void;
  size?: "sm" | "lg";
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const emoji = value || "🎯";
  const choices = planEmojis.includes(emoji) ? planEmojis : [emoji, ...planEmojis];

  useEffect(() => {
    if (!open) return;
    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className={`plan-emoji-picker emoji-${size}`} ref={rootRef} style={getPlanEmojiStyle(emoji)}>
      <button
        type="button"
        className="plan-emoji-trigger"
        aria-label={`Change plan emoji, currently ${emoji}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="plan-emoji-glow" aria-hidden="true">{emoji}</span>
        <span className="plan-emoji-main" aria-hidden="true">{emoji}</span>
      </button>
      {open && (
        <div className="plan-emoji-popover" role="dialog" aria-label="Choose a plan emoji">
          <div className="plan-emoji-grid">
            {choices.map((option) => (
              <button
                type="button"
                key={option}
                className={option === emoji ? "selected" : ""}
                aria-label={`Use ${option}`}
                aria-pressed={option === emoji}
                style={getPlanEmojiStyle(option)}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
              >
                <span aria-hidden="true">{option}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
