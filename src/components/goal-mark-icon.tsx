export function GoalMarkIcon({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 .4A11.6 11.6 0 0 1 23.032 8.415L18.087 10.022A6.4 6.4 0 0 0 12 5.6Z" fill="#ef5c8a" />
      <path d="M12 .4A11.6 11.6 0 0 1 23.032 8.415L18.087 10.022A6.4 6.4 0 0 0 12 5.6Z" fill="#f4b642" transform="rotate(72 12 12)" />
      <path d="M12 .4A11.6 11.6 0 0 1 23.032 8.415L18.087 10.022A6.4 6.4 0 0 0 12 5.6Z" fill="#79cf56" transform="rotate(144 12 12)" />
      <path d="M12 .4A11.6 11.6 0 0 1 23.032 8.415L18.087 10.022A6.4 6.4 0 0 0 12 5.6Z" fill="#4d9beb" transform="rotate(216 12 12)" />
      <path d="M12 .4A11.6 11.6 0 0 1 23.032 8.415L18.087 10.022A6.4 6.4 0 0 0 12 5.6Z" fill="#7a63e8" transform="rotate(288 12 12)" />
      <circle cx="12" cy="12" r="2.3" fill="#e34f45" />
    </svg>
  );
}
