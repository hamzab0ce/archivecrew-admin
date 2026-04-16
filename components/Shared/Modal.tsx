"use client";
import { AnimatePresence } from "motion/react";

export default function Modal({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence>
      <div
        className={`fixed z-50 flex overflow-y-scroll backdrop-blur items-start justify-center h-full w-full bg-black/20 outline-none focus:outline-none`}
      >
        <div className="relative my-6 mx-auto">{children}</div>
      </div>
    </AnimatePresence>
  );
}
