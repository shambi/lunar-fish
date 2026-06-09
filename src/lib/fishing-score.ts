export interface FishingScoreParams {
  moonScore: number;
  moonIllumination: number;
  temperature: number;
  windSpeed: number;
  weatherCode: number;
  pressureTrend: 'rising' | 'stable' | 'falling';
  pressureChangeRate: number;
  altitude: number;
  month: number;
  hour: number;
}

export interface FishingScoreResult {
  score: number;
  label: string;
  color: string;
  isOverride: boolean;
  overrideReason?: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getLabelAndColor(score: number): { label: string; color: string } {
  if (score >= 5) return { label: 'Отлично', color: '#C8E63C' };
  if (score >= 4) return { label: 'Добро', color: '#2eb5b7' };
  if (score >= 3) return { label: 'Средно', color: '#2eb5b7' };
  if (score >= 2) return { label: 'Слабо', color: '#5cd8da' };
  return { label: 'Лошо', color: '#EF5350' };
}

export function calculateFishingScore(params: FishingScoreParams): FishingScoreResult {
  let score = params.moonScore;
  let isOverride = false;
  let overrideReason: string | undefined;

  if (params.windSpeed > 50) {
    isOverride = true;
    overrideReason = 'Бурен вятър — опасни условия за риболов. Риболов не се препоръчва.';
  } else if (params.pressureChangeRate < -5) {
    isOverride = true;
    overrideReason = 'Рязък спад на налягането — рибата е притисната. Много трудна хапка.';
  } else if (params.weatherCode >= 95) {
    isOverride = true;
    overrideReason = 'Гръмотевична буря — не излизайте на вода!';
  }

  if (params.pressureTrend === 'rising' && params.pressureChangeRate < 3) score += 0.5;
  if (params.weatherCode <= 2) score += 0.5;
  if (params.windSpeed < 15) score += 0.3;

  if (params.pressureTrend === 'falling' && params.pressureChangeRate > 2) score -= 0.5;
  if (params.windSpeed > 25) score -= 0.5;
  if (params.windSpeed > 40) score -= 1.0;
  if (params.temperature < 4) score -= 0.5;
  if (params.temperature > 28) score -= 0.3;

  if (params.month >= 9 && params.month <= 10) score += 0.3;
  if (params.month >= 6 && params.month <= 8 && params.hour >= 10 && params.hour <= 16) score -= 0.3;

  // Mild altitude factor: keeps elevation useful without dominating the score.
  if (params.altitude >= 1200) score -= 0.3;
  else if (params.altitude >= 700) score -= 0.2;
  else if (params.altitude <= 250) score += 0.1;

  score = clamp(score, 0, 5);
  score = Math.round(score * 2) / 2;

  if (isOverride) {
    score = Math.min(score, 1);
  }

  const { label, color } = getLabelAndColor(score);
  return { score, label, color, isOverride, overrideReason };
}
