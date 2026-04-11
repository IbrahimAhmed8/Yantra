import { cookies, headers } from 'next/headers';

export async function getRequestBaseUrl() {
  const headerStore = await headers();
  const forwardedHost = headerStore.get('x-forwarded-host');
  const host = forwardedHost ?? headerStore.get('host');

  if (!host) {
    throw new Error('Unable to determine the current request host.');
  }

  const forwardedProto = headerStore.get('x-forwarded-proto');
  const protocol = forwardedProto ?? (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');

  return `${protocol}://${host}`;
}

export async function getRequestCookieHeader() {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');
}
