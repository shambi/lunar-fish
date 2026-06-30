import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Tracks which of several items inside a scrollable container is closest
 * to the vertical center of that container's visible area, using
 * IntersectionObserver (no scroll event listeners).
 *
 * itemsRef.current must be an array of element refs (index-aligned),
 * populated via callback refs on each item.
 *
 * Returns the index of the "active" item, or -1 if none are tracked yet.
 */
export function useScrollSpotlight(
  containerRef: RefObject<HTMLElement>,
  itemsRef: RefObject<(HTMLElement | null)[]>,
  itemCount: number,
  isActive: boolean
): number {
  const [activeIndex, setActiveIndex] = useState(-1);
  const distancesRef = useRef<number[]>([]);

  useEffect(() => {
    if (!isActive) {
      setActiveIndex(-1);
      return;
    }
    if (itemCount === 0) return;

    let observer: IntersectionObserver | null = null;
    let rafId = 0;
    let cancelled = false;
    let attempts = 0;

    // Radix Dialog's Presence can mount children a tick after `isActive`
    // flips true (it measures before animating in), so refs may not be
    // attached yet on the first effect run. Poll a few frames until they are.
    const trySetup = () => {
      if (cancelled) return;
      const container = containerRef.current;
      const items = (itemsRef.current ?? []).filter((el): el is HTMLElement => !!el);

      console.log('[useScrollSpotlight] trySetup attempt', attempts, '— container:', container, 'items found:', items.length, '/', itemCount);

      if (!container || items.length < itemCount) {
        attempts += 1;
        if (attempts < 30) {
          rafId = requestAnimationFrame(trySetup);
        } else {
          console.warn('[useScrollSpotlight] gave up waiting for refs after 30 frames');
        }
        return;
      }

      distancesRef.current = new Array(items.length).fill(Infinity);

      const recomputeActive = () => {
        let bestIdx = -1;
        let bestDist = Infinity;
        distancesRef.current.forEach((dist, i) => {
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
          }
        });
        setActiveIndex(bestIdx);
      };

      observer = new IntersectionObserver(
        (entries) => {
          console.log('[useScrollSpotlight] observer entries:', entries.map(e => ({
            idx: items.indexOf(e.target as HTMLElement),
            isIntersecting: e.isIntersecting,
            ratio: e.intersectionRatio.toFixed(2),
          })));

          const containerRect = container.getBoundingClientRect();
          const containerCenter = containerRect.top + containerRect.height / 2;

          entries.forEach((entry) => {
            const idx = items.indexOf(entry.target as HTMLElement);
            if (idx === -1) return;
            if (!entry.isIntersecting) {
              distancesRef.current[idx] = Infinity;
              return;
            }
            const rect = entry.boundingClientRect;
            const itemCenter = rect.top + rect.height / 2;
            distancesRef.current[idx] = Math.abs(itemCenter - containerCenter);
          });

          recomputeActive();
        },
        { root: container, threshold: [0, 0.25, 0.5, 0.75, 1] }
      );

      items.forEach((item) => observer!.observe(item));
    };

    trySetup();

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      observer?.disconnect();
    };
  }, [containerRef, itemsRef, itemCount, isActive]);

  useEffect(() => {
    console.log('[useScrollSpotlight] activeIndex changed:', activeIndex);
  }, [activeIndex]);

  return activeIndex;
}
