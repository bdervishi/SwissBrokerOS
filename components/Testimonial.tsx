import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Testimonial as TestimonialType } from "../types";
import { MOCK_TESTIMONIALS } from "../constants";

function usePreloadImages(images: string[]) {
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);
}

function SplitText({ text }: { text: string }) {
  const words = text.split(" ");

  return (
    <span className="inline">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.4,
            delay: i * 0.03,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export function Testimonial() {
  // Load from localStorage if admin edited, otherwise fallback to constants
  const [data, setData] = useState<TestimonialType[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('app_testimonials');
    if (saved) {
      setData(JSON.parse(saved));
    } else {
      setData(MOCK_TESTIMONIALS);
    }
  }, []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  usePreloadImages(data.map((t) => t.avatar));

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  const handleNext = () => {
    if (data.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % data.length);
  };

  if (data.length === 0) return null;
  const currentTestimonial = data[activeIndex];

  return (
    <section className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-white/5 transition-colors duration-500 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center">
        <h2 className="text-center text-sm font-black uppercase tracking-[0.3em] text-brand-600 mb-12">
            Feedback unserer Makler
        </h2>
        
        <div
          ref={containerRef}
          className="relative w-full max-w-2xl mx-auto py-12 px-8 cursor-pointer"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleNext}
        >
          {/* Custom magnetic cursor */}
          <motion.div
            className="pointer-events-none absolute z-50 mix-blend-difference hidden md:block"
            style={{
              x: cursorX,
              y: mouseY, // Fixed: mouseY used directly for smoother feel in this context
              translateX: "-50%",
              translateY: "-50%",
            }}
          >
            <motion.div
              className="rounded-full bg-white flex items-center justify-center"
              animate={{
                width: isHovered ? 80 : 0,
                height: isHovered ? 80 : 0,
                opacity: isHovered ? 1 : 0,
              }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
            >
              <motion.span
                className="text-slate-950 text-[10px] font-bold tracking-wider uppercase"
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ delay: 0.1 }}
              >
                Nächste
              </motion.span>
            </motion.div>
          </motion.div>

          {/* Floating index indicator */}
          <motion.div
            className="absolute top-0 right-8 flex items-baseline gap-1 font-mono text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.span
              className="text-2xl font-light text-slate-900 dark:text-white"
              key={activeIndex}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {String(activeIndex + 1).padStart(2, "0")}
            </motion.span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-400">{String(data.length).padStart(2, "0")}</span>
          </motion.div>

          {/* Stacked avatar previews */}
          <motion.div
            className="absolute top-0 left-8 flex -space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.6 }}
          >
            {data.map((t, i) => (
              <motion.div
                key={i}
                className={`w-6 h-6 rounded-full border-2 border-white dark:border-slate-950 overflow-hidden transition-all duration-300 ${
                  i === activeIndex ? "ring-1 ring-brand-500 ring-offset-1 ring-offset-white dark:ring-offset-slate-950" : "grayscale opacity-50"
                }`}
                whileHover={{ scale: 1.1, opacity: 1 }}
              >
                <img src={t.avatar || "/placeholder.svg"} alt={t.author} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </motion.div>

          {/* Main content */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={activeIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="text-xl md:text-3xl font-light leading-relaxed tracking-tight text-slate-900 dark:text-white min-h-[140px]"
              >
                <SplitText text={currentTestimonial.quote} />
              </motion.blockquote>
            </AnimatePresence>

            {/* Author */}
            <motion.div className="mt-12 relative" layout>
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12">
                  <motion.div
                    className="absolute -inset-1.5 rounded-full border border-brand-500/40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  {data.map((t, i) => (
                    <motion.img
                      key={t.id}
                      src={t.avatar}
                      alt={t.author}
                      className="absolute inset-0 w-12 h-12 rounded-full object-cover grayscale hover:grayscale-0 transition-[filter] duration-500"
                      animate={{
                        opacity: i === activeIndex ? 1 : 0,
                        zIndex: i === activeIndex ? 1 : 0,
                      }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    />
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    className="relative pl-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 w-px bg-brand-500"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                      style={{ originY: 0 }}
                    />
                    <span className="block text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                      {currentTestimonial.author}
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono uppercase tracking-widest">
                      {currentTestimonial.role} — {currentTestimonial.company}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Progress bar */}
            <div className="mt-16 h-px bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-brand-500"
                initial={{ width: "0%" }}
                animate={{ width: `${((activeIndex + 1) / data.length) * 100}%` }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>

          <motion.div
            className="absolute -bottom-10 left-8 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.4 : 0.2 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Beliebige Stelle klicken</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}