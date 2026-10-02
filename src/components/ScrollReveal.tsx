"use client";
import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { usePathname } from "next/navigation";

interface ScrollRevealProps {
  children: React.ReactNode;
}

export default function ScrollReveal({ children }: ScrollRevealProps) {
  const controls = useAnimation();
  const pathname = usePathname();
  
  // CRITICAL MOBILE FIX:
  // Threshold changed to 0 to prevent height-collapse bugs on tall mobile sections.
  // rootMargin added to trigger the animation 200px BEFORE it enters the viewport.
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0,
    rootMargin: "200px 0px 200px 0px", 
  });

  // Effect 1: Handle normal scroll intersections
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  // Effect 2: CRITICAL FIX FOR BACK BUTTON INVISIBILITY
  // Whenever the pathname changes (user goes back/forward), force the layout to stay visible!
  useEffect(() => {
    controls.start("visible");
  }, [pathname, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.6, ease: "easeOut" }
        },
      }}
    >
      {children}
    </motion.div>
  );
}