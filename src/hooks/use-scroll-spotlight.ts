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
  itemCount: number
): number {
  const [activeIndex, setActiveIndex] = useState(-1);
  const distancesRef = useRef<number[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || itemCount === 0) return;

    const items = (itemsRef.current ?? []).filter((el): el is HTMLElement => !!el);
    if (items.length === 0) return;

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

    const observer = new IntersectionObserver(
      (entries) => {
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

    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [containerRef, itemsRef, itemCount]);

  return activeIndex;
}
