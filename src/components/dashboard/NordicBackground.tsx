// @/components/dashboard/NordicBackground.tsx
import { motion } from "framer-motion";

export const NordicBackground = () => (
  <>
    <div className="absolute inset-0 bg-gradient-to-b from-background to-base-200">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
            x: [0, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <div className={`absolute inset-0 bg-[radial-gradient(circle_at_${10 + i * 20}%_${-20 + i * 10}%,hsl(var(--info)),transparent_${10 + i * 10}%)]`} />
        </motion.div>
      ))}
    </div>
    
    <div className="absolute inset-0">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-info/30 rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, 20],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
    
    <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--base-300))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--base-300))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />
  </>
);

export default NordicBackground;