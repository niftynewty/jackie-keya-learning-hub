import { motion } from "motion/react";

export function PageIntro({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-semibold uppercase tracking-[.2em] text-primary"
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mt-5 max-w-4xl font-display text-5xl leading-[1.03] md:text-7xl"
        >
          {title}
        </motion.h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">{copy}</p>
      </div>
    </section>
  );
}
