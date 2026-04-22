import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getFishModalData, FISH_DATABASE } from '@/lib/fish-guide';

describe('Altitude-Based Ban Periods', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Helper to set current date in tests
  const setTestDate = (month: number, day: number) => {
    const d = new Date();
    d.setMonth(month - 1); // JS months are 0-indexed
    d.setDate(day);
    d.setHours(12, 0, 0, 0);
    vi.setSystemTime(d);
  };

  it('should show altitude-specific ban for low elevation (< 500m)', () => {
    const carp = FISH_DATABASE.find(f => f.name === 'Шаран');
    expect(carp).toBeDefined();
    if (!carp) return;

    // April 20 - within low altitude ban period (15.04 - 31.05)
    setTestDate(4, 20);

    const modalData = getFishModalData(carp, 15, 2, 'both', 300); // 300m = low altitude

    expect(modalData.ecoWarning).toContain('⛔ Забранен'); // Should show ban
    expect(modalData.ecoWarning).toContain('15.04 – 31.05'); // Low altitude period
    expect(modalData.ecoWarning).toContain('300м'); // Show altitude
  });

  it('should show altitude-specific ban for mid elevation (500-1500m)', () => {
    const carp = FISH_DATABASE.find(f => f.name === 'Шаран');
    expect(carp).toBeDefined();
    if (!carp) return;

    // May 10 - within mid altitude ban period (01.05 - 15.06)
    setTestDate(5, 10);

    const modalData = getFishModalData(carp, 15, 2, 'both', 800); // 800m = mid altitude

    expect(modalData.ecoWarning).toContain('⛔ Забранен'); // Should show ban
    expect(modalData.ecoWarning).toContain('01.05 – 15.06'); // Mid altitude period
    expect(modalData.ecoWarning).toContain('800м'); // Show altitude
  });

  it('should show allowed period when outside ban dates', () => {
    const carp = FISH_DATABASE.find(f => f.name === 'Шаран');
    expect(carp).toBeDefined();
    if (!carp) return;

    // June 20 - outside ban periods
    setTestDate(6, 20);

    const modalData = getFishModalData(carp, 15, 2, 'both', 500); // 500m boundary

    expect(modalData.ecoWarning).toContain('✅ Разрешен период');
    expect(modalData.ecoWarning).toContain('500м н.в.'); // Show current altitude
  });

  it('should fall back to old logic for fish without altitude bans', () => {
    const commonTrout = FISH_DATABASE.find(f => f.name === 'Пъстърва');
    expect(commonTrout).toBeDefined();
    if (!commonTrout) return;

    // October 15 - within spawn months [10,11,12,1]
    setTestDate(10, 15);

    // Should show ban regardless of altitude (has ecoRed but no altitudeBans field)
    const modalData = getFishModalData(commonTrout, 10, 2, 'river', 1800); // High altitude

    expect(modalData.ecoWarning).toContain('⛔ Забранен'); // Should show ban
    expect(modalData.ecoWarning).toContain('01.10 – 31.01'); // Standard period
  });

  it('should handle missing altitude gracefully', () => {
    const carp = FISH_DATABASE.find(f => f.name === 'Шаран');
    expect(carp).toBeDefined();
    if (!carp) return;

    // April 20 - ban period, but no altitude provided
    setTestDate(4, 20);

    const modalData = getFishModalData(carp, 15, 2, 'both', undefined);

    // Should fall back to spawn months logic
    expect(modalData.ecoWarning).toContain('⛔ Забранен');
  });

  it('all spring-summer fish should have altitudeBans defined', () => {
    const springFish = [
      'Шаран', 'Амур', 'Толстолоб', 'Сом', 'Щука',
      'Каракуда', 'Уклей', 'Лин', 'Костур', 'Платика',
      'Бабушка', 'Червеноперка', 'Мряна', 'Бибан', 'Сулка'
    ];

    springFish.forEach(fishName => {
      const fish = FISH_DATABASE.find(f => f.name === fishName);
      expect(fish, `Fish ${fishName} not found in database`).toBeDefined();

      if (fish && fish.spawnMonths.length > 0) {
        expect(
          fish.altitudeBans || fish.ecoRed || fish.ecoGreen,
          `Fish ${fishName} has spawn months but no ban configuration`
        ).toBeDefined();
      }
    });
  });

  it('Шаран should have correct altitude ban boundaries', () => {
    const carp = FISH_DATABASE.find(f => f.name === 'Шаран');
    expect(carp?.altitudeBans?.low?.maxAlt).toBe(500);
    expect(carp?.altitudeBans?.mid?.minAlt).toBe(500);
    expect(carp?.altitudeBans?.mid?.maxAlt).toBe(1500);
  });
});
