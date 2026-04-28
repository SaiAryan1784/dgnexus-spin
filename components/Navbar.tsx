"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";

export default function Navbar() {
  const { scrollY } = useScroll();

  const bgOpacity = useTransform(scrollY, [0, 80], [0, 0.97]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const blur = useTransform(scrollY, [0, 80], [0, 12]);

  const backgroundColor = useMotionTemplate`rgba(248,249,251,${bgOpacity})`;
  const borderColor = useMotionTemplate`rgba(226,232,240,${borderOpacity})`;
  const backdropFilter = useMotionTemplate`blur(${blur}px)`;

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-40 border-b"
      style={{
        backgroundColor,
        borderColor,
        backdropFilter,
        WebkitBackdropFilter: backdropFilter,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 lg:h-24 flex items-center justify-center">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src="/gdg-logo.png"
            width={320}
            height={80}
            alt="Google Developer Groups Noida"
            priority
            className="h-10 md:h-12 lg:h-16 w-auto"
          />
        </motion.div>
      </div>
    </motion.nav>
  );
}
