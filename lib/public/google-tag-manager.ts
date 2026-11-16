export function googleTagManagerId(value: unknown) {
  if (typeof value !== "string") return null;
  const id = value.trim().toUpperCase();
  return /^GTM-[A-Z0-9]{1,24}$/.test(id) ? id : null;
}
