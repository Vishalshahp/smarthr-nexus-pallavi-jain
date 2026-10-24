import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-surface-950 flex-center flex-col gap-4">
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [1, 0.7, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        className="w-14 h-14 rounded-2xl bg-primary-600 flex-center shadow-glow-primary"
      >
        <Zap className="w-7 h-7 text-white" />
      </motion.div>
      <div className="text-center">
        <p className="font-display font-bold text-white text-lg">SmartHR Nexus</p>
        <p className="text-slate-500 text-sm mt-1">Loading your workspace...</p>
      </div>
      <div className="flex gap-1.5 mt-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-primary-500 rounded-full"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>
    </div>
  );
}
