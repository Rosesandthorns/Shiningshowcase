
"use client"
import { useState, useEffect, RefObject } from 'react';

export function useOnScreen(ref: RefObject<HTMLElement>): boolean {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
            setIntersecting(true);
            // Optional: unobserve after it's visible so it doesn't turn off
            // observer.unobserve(entry.target); 
        }
      },
      {
        rootMargin: '100px', // Pre-load content 100px before it enters the viewport
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref]);

  return isIntersecting;
}
