import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  try {
    const response = await fetch('https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-bulgaria');
    const xml = await response.text();
    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch {
    res.status(500).json({ error: 'Failed to fetch MeteoAlarm' });
  }
}
