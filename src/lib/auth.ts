export const SESSION_COOKIE = "rlist_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

const encoder = new TextEncoder();

export function verifyPassword(password: string, expected: string | undefined): boolean {
  if (!expected) return false;
  return equalBytes(encoder.encode(password), encoder.encode(expected));
}

export function verifyToken(token: string | undefined, expected: string | undefined): boolean {
  if (!token || !expected) return false;
  return equalBytes(encoder.encode(token), encoder.encode(expected));
}

function equalBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) diff |= a[index] ^ b[index];
  return diff === 0;
}
