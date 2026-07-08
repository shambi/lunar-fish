// Shared meteoAlarm event/label logic — consolidates what used to be three
// separate, independently-broken mappings (Index.tsx's tooltip eventMap,
// fish-advice.ts's METEO_EVENT_LABELS). CAP `event` text is free-form
// (e.g. "Severe high-temperature warning"), not a fixed enum, so matching is
// done via case-insensitive keyword, not exact equality.
//
// Severity→level mapping (extreme→red, severe→orange, moderate/minor→yellow)
// stays where it already lives (weather-service.ts) — this module only owns
// the event-text→label/message side.

export type MeteoAlertLevel = 'yellow' | 'orange' | 'red';

type MeteoEventType =
  | 'heat'
  | 'storm'
  | 'rain'
  | 'wind'
  | 'snow'
  | 'fog'
  | 'ice'
  | 'flood'
  | 'forestFire';

const EVENT_LABELS: Record<MeteoEventType, string> = {
  heat: 'жега',
  storm: 'гръмотевична буря',
  rain: 'обилни валежи',
  wind: 'силен вятър',
  snow: 'снеговалеж',
  fog: 'гъста мъгла',
  ice: 'заледяване',
  flood: 'наводнение',
  forestFire: 'горски пожари',
};

const LEVEL_LABELS: Record<MeteoAlertLevel, string> = {
  yellow: 'Жълт',
  orange: 'Оранжев',
  red: 'Червен',
};

function detectEventType(event: string): MeteoEventType | null {
  const e = event.toLowerCase();
  if (e.includes('temperature') || e.includes('heat')) return 'heat';
  if (e.includes('thunder') || e.includes('storm')) return 'storm';
  if (e.includes('rain')) return 'rain';
  if (e.includes('wind')) return 'wind';
  if (e.includes('snow')) return 'snow';
  if (e.includes('fog')) return 'fog';
  if (e.includes('ice')) return 'ice';
  if (e.includes('flood')) return 'flood';
  if (e.includes('forest') || e.includes('fire')) return 'forestFire';
  return null;
}

// Label only — used by the main-screen alert badge tooltip.
export function getMeteoAlertLabel(event: string): string {
  const type = detectEventType(event);
  return type ? EVENT_LABELS[type] : event.toLowerCase();
}

// Full tactical message — heat/storm get dedicated per-level safety advice;
// the other 7 types (and any unrecognized event text) get a short generic
// "{Level} код за {label}." line with no extra advice yet.
export function getMeteoAlertMessage(event: string, level: MeteoAlertLevel): string {
  const type = detectEventType(event);

  if (type === 'heat') {
    return level === 'red'
      ? `Червен код за екстремна жега — днес не е ден за риболов, рискът от топлинен удар е сериозен.`
      : level === 'orange'
      ? `Оранжев код за опасна жега — ограничи риболова до ранните сутрешни/вечерни часове, носи достатъчно вода.`
      : `Жълт код за горещо време — стой на сянка през най-топлите часове, хидратирай се редовно.`;
  }

  if (type === 'storm') {
    return level === 'red'
      ? `Червен код за силна буря — не излизай на открито, риболовът е животозастрашаващ при това време.`
      : level === 'orange'
      ? `Оранжев код за буря — прибирай такъмите и се отдалечи от брега незабавно; мокрият бряг привлича мълнии.`
      : `Жълт код за гръмотевици — ако въдицата ти е карбонова, прибери я; карбонът провежда електричество и привлича мълния.`;
  }

  const label = type ? EVENT_LABELS[type] : event.toLowerCase();
  return `${LEVEL_LABELS[level]} код за ${label}.`;
}
