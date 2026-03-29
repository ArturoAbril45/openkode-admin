const AVATAR_COLORS = [
  "#6c63ff", "#3ecf8e", "#f59e0b", "#ef4444", "#2563eb",
  "#10b981", "#8b5cf6", "#ec4899", "#0891b2", "#d97706",
];

export function avatarColor(nombre: string): string {
  let h = 0;
  for (let i = 0; i < nombre.length; i++) h = nombre.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
