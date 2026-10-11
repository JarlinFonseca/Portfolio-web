/** "jarlin@gmail.com" → "ja****@gmail.com" (para mensajes y logs sin exponer el correo completo). */
export function maskEmail(email: string): string {
  const [user = '', domain] = email.split('@');
  if (!domain) return email;
  const visible = user.slice(0, Math.min(2, user.length));
  return `${visible}${'*'.repeat(Math.max(user.length - visible.length, 1))}@${domain}`;
}
