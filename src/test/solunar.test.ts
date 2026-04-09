import { describe, it, expect } from "vitest";
import { getMoonTimes, getSolunarPeaks } from "../lib/moon-times";

describe("Solunar Logic Verification", () => {
  it("should calculate correct peaks for Sofia on Summer Solstice 2024", () => {
    // Sofia, 42.698334, 23.319941, 2024-06-21
    const testDate = new Date(2024, 5, 21); // June is 5
    const lat = 42.698334;
    const lon = 23.319941;

    const moonTimes = getMoonTimes(testDate, lat, lon);
    console.log('Test Moon Times:', moonTimes);

    expect(moonTimes.moonrise).not.toBeNull();
    expect(moonTimes.moonrise).toMatch(/^\d{2}:\d{2}$/);
    
    const peaks = getSolunarPeaks(moonTimes);
    console.log('Test Peaks:', peaks);

    const majorPeaks = peaks.filter(p => p.type === 'major');
    const minorPeaks = peaks.filter(p => p.type === 'minor');

    expect(majorPeaks.length).toBe(2);
    expect(minorPeaks.length).toBe(4);
  });

  it("should handle missing moonrise by estimating minor peak", () => {
    const moonTimes = {
      moonrise: null,
      moonset: "20:00",
      transit: "12:00",
      antitransit: "00:00"
    };

    const peaks = getSolunarPeaks(moonTimes);
    const risePeak = peaks.find(p => p.label.includes("Изгрев"));
    
    expect(risePeak).toBeDefined();
    expect(risePeak?.label).toContain("(est.)");
  });
});
