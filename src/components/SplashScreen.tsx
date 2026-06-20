import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import adamLogo from "@/assets/adam-logo-new-white.png";

const STORAGE_KEY = "adam_splash_seen";

const SplashScreen = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    setVisible(true);
    const t = setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setVisible(false);
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-[hsl(30_15%_8%)]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
            <img
              src={adamLogo}
              alt="ADAM Fabrics"
              className="h-28 w-auto object-contain md:h-36"
            />
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.6, ease: "easeInOut", delay: 0.3 }}
              className="mt-6 h-px w-44 origin-center bg-gradient-to-r from-transparent via-[hsl(30_25%_65%)] to-transparent"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-4 font-body text-sm tracking-[0.3em] text-[hsl(30_25%_70%)]"
            >
              ADAM FABRICS
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;