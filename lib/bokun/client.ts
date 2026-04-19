import crypto from 'node:crypto'

const BOKUN_HOST = process.env.BOKUN_API_HOST ?? 'https://api.bokun.is'

function bokunDate(now: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return (
    `${now.getUTCFullYear()}-${p(now.getUTCMonth() + 1)}-${p(now.getUTCDate())} ` +
    `${p(now.getUTCHours())}:${p(now.getUTCMinutes())}:${p(now.getUTCSeconds())}`
  )
}

function signRequest(
  method: string,
  path: string,
  date: string,
  accessKey: string,
  secretKey: string,
): string {
  const stringToSign = `${date}${accessKey}${method}${path}`
  return crypto.createHmac('sha1', secretKey).update(stringToSign).digest('base64')
}

export class BokunConfigError extends Error {
  constructor(msg: string) {
    super(msg)
    this.name = 'BokunConfigError'
  }
}

export async function bokunFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const accessKey = process.env.BOKUN_ACCESS_KEY
  const secretKey = process.env.BOKUN_SECRET_KEY
  if (!accessKey || !secretKey) {
    throw new BokunConfigError(
      'BOKUN_ACCESS_KEY / BOKUN_SECRET_KEY not set in environment',
    )
  }
  if (!path.startsWith('/')) {
    throw new BokunConfigError(`bokunFetch path must start with "/": got "${path}"`)
  }

  const method = (init.method ?? 'GET').toUpperCase()
  const date = bokunDate()
  const signature = signRequest(method, path, date, accessKey, secretKey)

  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
    'X-Bokun-AccessKey': accessKey,
    'X-Bokun-Date': date,
    'X-Bokun-Signature': signature,
    'Content-Type': 'application/json',
  }

  return fetch(`${BOKUN_HOST}${path}`, { ...init, headers })
}

// Test-only export: keeps the public surface minimal while letting unit tests
// verify the signing spec against an openssl-computed reference vector.
export const __test = { bokunDate, signRequest }
