import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroLoaderProps {
  onComplete: () => void;
}

const IntroLoader = ({ onComplete }: IntroLoaderProps) => {
  const [visible, setVisible] = useState(true);

  const finish = () => {
    setVisible(false);
    setTimeout(onComplete, 600);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <video
            autoPlay
            muted
            playsInline
            className="h-auto w-full max-h-[100svh] object-contain md:h-full md:w-auto md:max-w-full"
            onEnded={finish}
            onError={finish}
          >
            <source src="/intro.mp4" type="video/mp4" />
          </video>
          <button
            onClick={finish}
            className="absolute bottom-6 right-6 rounded-full bg-background/70 px-4 py-2 text-xs font-body text-foreground backdrop-blur hover:bg-background"
          >
            Skip
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroLoader;
