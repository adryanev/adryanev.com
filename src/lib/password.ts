// PBKDF2-SHA256 through WebCrypto: the only password KDF Workers run natively.
// 25,000 iterations cost ~5 ms of CPU, inside the Workers Free 10 ms per-request
// limit; the admin password must therefore be long and random. The iteration
// count is stored in each hash, so it can rise (Workers cap it at 100,000).
const ALGORITHM = 'pbkdf2-sha256'
const ITERATIONS = 25_000
const SALT_BYTES = 16
const HASH_BITS = 256

const encoder = new TextEncoder()

async function derive(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
): Promise<Uint8Array<ArrayBuffer>> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    key,
    HASH_BITS,
  )
  return new Uint8Array(bits)
}

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0))
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let difference = 0
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i]
  return difference === 0
}

// Stored as `pbkdf2-sha256$<iterations>$<salt>$<hash>` so the cost can rise later
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const hash = await derive(password, salt, ITERATIONS)
  return [ALGORITHM, ITERATIONS, toBase64(salt), toBase64(hash)].join('$')
}

export async function verifyPassword(
  storedHash: string,
  password: string,
): Promise<boolean> {
  const [algorithm, iterations, salt, hash] = storedHash.split('$')
  if (algorithm !== ALGORITHM || !iterations || !salt || !hash) return false

  const expected = fromBase64(hash)
  const actual = await derive(password, fromBase64(salt), Number(iterations))
  return constantTimeEqual(actual, expected)
}
