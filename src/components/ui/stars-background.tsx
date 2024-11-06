"use client";
import { cn } from "@/lib/utils";
import React, {
  useState,
  useEffect,
  useRef,
  RefObject,
  useCallback,
} from "react";

interface StarProps {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number | null;
}

interface StarBackgroundProps {
  starDensity?: number;
  allStarsTwinkle?: boolean;
  twinkleProbability?: number;
  minTwinkleSpeed?: number;
  maxTwinkleSpeed?: number;
  className?: string;
  colorVariable?: string;
}

export const StarsBackground: React.FC<StarBackgroundProps> = ({
  starDensity = 0.00015,
  allStarsTwinkle = true,
  twinkleProbability = 0.7,
  minTwinkleSpeed = 0.5,
  maxTwinkleSpeed = 1,
  className,
  colorVariable = "base-content",
}) => {
  const [stars, setStars] = useState<StarProps[]>([]);
  const canvasRef: RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);

  // Function to convert HSL to RGB
  const hslToRgb = useCallback((h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [255 * f(0), 255 * f(8), 255 * f(4)];
  }, []);

  // Updated getColor function
  const getColor = useCallback(() => {
    try {
      // Create a temporary element
      const temp = document.createElement('div');
      // Apply the CSS variable as a background color
      temp.style.color = `hsl(var(--${colorVariable}))`;
      // Add it to the document to get computed style
      document.body.appendChild(temp);
      // Get the computed style
      const computedColor = window.getComputedStyle(temp).color;
      // Remove the temporary element
      document.body.removeChild(temp);
      
      // Extract RGB values from the computed style
      const rgb = computedColor.match(/\d+/g);
      if (rgb && rgb.length >= 3) {
        return [Number(rgb[0]), Number(rgb[1]), Number(rgb[2])];
      }

      console.log('Computed color:', computedColor);
      return [255, 255, 255]; // Fallback
    } catch (error) {
      console.error('Error getting color:', error);
      return [255, 255, 255]; // Fallback
    }
  }, [colorVariable]);

  // Rest of the component remains the same...

  const generateStars = useCallback(
    (width: number, height: number): StarProps[] => {
      const area = width * height;
      const numStars = Math.floor(area * starDensity);
      return Array.from({ length: numStars }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1 + 0.5,
        opacity: Math.random() * 0.5 + 0.5,
        twinkleSpeed: allStarsTwinkle || Math.random() < twinkleProbability
          ? minTwinkleSpeed + Math.random() * (maxTwinkleSpeed - minTwinkleSpeed)
          : null,
      }));
    },
    [starDensity, allStarsTwinkle, twinkleProbability, minTwinkleSpeed, maxTwinkleSpeed]
  );

  useEffect(() => {
    const updateStars = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
        setStars(generateStars(width, height));
      }
    };

    updateStars();

    const resizeObserver = new ResizeObserver(updateStars);
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      if (canvasRef.current) {
        resizeObserver.unobserve(canvasRef.current);
      }
    };
  }, [generateStars]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const [r, g, b] = getColor();
      
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${star.opacity})`;
        ctx.fill();

        if (star.twinkleSpeed !== null) {
          star.opacity =
            0.5 +
            Math.abs(Math.sin((Date.now() * 0.001) / star.twinkleSpeed) * 0.5);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const observer = new MutationObserver(() => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      render();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class']
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, [stars, getColor]);

  return (
    <div className="fixed inset-0 w-full h-full bg-base-300">
      <canvas
        ref={canvasRef}
        className={cn("absolute inset-0 w-full h-full", className)}
      />
    </div>
  );
};