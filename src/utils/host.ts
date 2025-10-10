// utils/host.ts (optional helper)
export function normalizeHost(input: string): { host: string; bare: string; sub: string } {
  if (!input) throw new Error('findSiteConfigByDomain: domain is required');

  // accept full URLs or raw hosts
  let host = input.trim().toLowerCase();
  try {
    // If it's a URL, pull out the hostname
    if (host.includes('://')) {
      host = new URL(host).hostname;
    }
  } catch {
    // non-URL input, continue
  }

  // drop port and trailing dot
  host = host.split(':')[0].replace(/\.$/, '');

  const bare = host.replace(/^www\./, '');
  const sub = bare.split('.')[0] ?? bare; // first label

  return { host, bare, sub };
}
