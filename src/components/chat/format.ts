export const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", day: "numeric", month: "short" });
}

export function lastSeenLabel(iso: string | null) {
  if (!iso) return "hasn't visited yet";
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 20) return "here now";
  if (s < 60) return "seen just now";
  if (s < 3600) return `seen ${Math.round(s / 60)} min ago`;
  if (s < 86400) return `seen ${Math.round(s / 3600)} h ago`;
  return `seen ${dayLabel(iso).toLowerCase()}`;
}
