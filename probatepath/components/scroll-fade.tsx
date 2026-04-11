'use client';

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const elements = {
  div: motion.div,
  section: motion.section,
  li: motion.li,
  article: motion.article,
};

type ScrollFadeProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  as?: keyof typeof elements;
  delay?: number;
  once?: boolean;
};

export function ScrollFade({ children, className, as = "div", delay = 0, ...rest }: ScrollFadeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const Component = elements[as] ?? elements.div;
  const forwarded = rest as Record<string, unknown>;

  // Before hydration (SSR, crawlers, or slow JS): render the plain element
  // fully visible. This guarantees content is never stuck at opacity:0 just
  // because the IntersectionObserver hasn't fired yet. Animations only kick
  // in once JS is live on the client.
  if (!mounted) {
    const PlainComponent = as === "section" ? "section" : as === "li" ? "li" : as === "article" ? "article" : "div";
    return (
      <PlainComponent className={cn(className)} {...(forwarded as HTMLAttributes<HTMLElement>)}>
        {children}
      </PlainComponent>
    );
  }

  return (
    <Component
      className={cn(className)}
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.5, delay }}
      {...forwarded}
    >
      {children}
    </Component>
  );
}
