'use client';

import { motion } from "framer-motion";
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

export function ScrollFade({ children, className, as = "div", delay = 0, once = true, ...rest }: ScrollFadeProps) {
  const Component = elements[as] ?? elements.div;
  const forwarded = rest as Record<string, unknown>;
  return (
    <Component
      className={cn(className)}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      transition={{ duration: 0.5, delay }}
      viewport={{ once, amount: 0.3 }}
      {...forwarded}
    >
      {children}
    </Component>
  );
}
