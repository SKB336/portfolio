"use client";

import { useState, useEffect } from "react";
import { FaFilePdf, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "motion/react";
import { FileUser } from "lucide-react";
import { ChevronLeft } from "lucide-react";

export default function FloatingResume() {
  const [open, setOpen] = useState(false);

  const [isVisible, setIsVisible] = useState(false);

  const gradientClass =
    "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);  // Show button after scrolling 300px
      } else {
        setIsVisible(false); // Hide button when at top
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Floating Icon */}
      {/* <button
        onClick={() => setOpen(true)}
        className="fixed right-6 top-1/2 -translate-y-1/2 z-50 
                   bg-black text-white p-4 rounded-full shadow-lg
                   hover:scale-105 transition"
        aria-label="Open resume"
      >
        <FaFilePdf size={20} />
      </button> */}

      <AnimatePresence>
  {isVisible && (
    <motion.button
      onClick={() => setOpen(true)}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-50 
                 bg-black text-white py-6 px-3 rounded-l-lg shadow-lg
                 hover:px-4 transition-all flex items-center gap-0 border border-r-0 dark:border-white/[0.2] dark:bg-black-100 "
      aria-label="Open resume"
      initial={{ opacity: 0, x: 100 }}       // Start off-screen right
      animate={{ opacity: 1, x: 0 }}         // Slide in to position
      exit={{ opacity: 0, x: 100 }}          // Slide out when hidden
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ x: 0 }}                  // Optional: can add hover tweaks
    >
      {/* <ChevronLeft size={16} />
      <ChevronLeft size={16} className="-ml-2" /> */}
      <FaFilePdf size={20} />
    </motion.button>
  )}
</AnimatePresence>


      {/* <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed right-6 top-1/2 -translate-y-1/2 z-50"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#3F36B3]"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />

            <motion.button
              onClick={() => setOpen(true)}
              className="relative p-4 rounded-full text-white flex items-center justify-center
                   bg-gradient-to-br from-[#3F36B3] to-[#353370]
                   border-2 border-[#3F36B3]
                   shadow-[0_0_20px_rgba(63,54,179,0.4)]"
              aria-label="Open resume"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{
                scale: 1.1,
                boxShadow: "0 0 40px rgba(63,54,179,0.6)",
                transition: { duration: 0.3 },
              }}
              whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
            >
              <FileUser size={24} className="relative z-10" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence> */}


      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setOpen(false)}
      />

      {/* Slide-in Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] md:w-[520px] 
                    bg-black-100 z-50 transform transition-transform duration-300
                    ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-medium">My Resume</h3>
          <button onClick={() => setOpen(false)} aria-label="Close resume">
            <FaTimes className="text-white" />
          </button>
        </div>

        {/* PDF Viewer */}
        <iframe
          src="/resume.pdf#toolbar=0&navpanes=0&scrollbar=0"
          className="w-full h-[calc(100%-56px)]"
        />
      </aside>
    </>
  );
}
