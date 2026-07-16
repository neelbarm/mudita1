// The single easing language of the site. See docs/03-motion-storyboard.md.
export const EASE = [0.22, 1, 0.36, 1] as const;

export const riseIn = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE, delay },
  }),
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.7, ease: EASE, delay },
  }),
};

export const VIEWPORT = { once: true, amount: 0.4 } as const;
export const VIEWPORT_EARLY = { once: true, amount: 0.2 } as const;
