// TEMP DEBUG ENDPOINT — remove after regional filtering investigation
// Raw passthrough of the same CAP feed fetchMeteoAlarmLevel() uses (src/lib/weather-service.ts),
// with no parsing/severity extraction, so the raw XML can be inspected directly.
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  try {
    const response = await fetch('https://feeds.meteoalarm.org/feeds/meteoalarm-legacy-atom-bulgaria');
    const xml = await response.text();
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(xml);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch MeteoAlarm feed', details: String(err) });
  }
}
