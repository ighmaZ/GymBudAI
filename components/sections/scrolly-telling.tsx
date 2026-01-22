"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Play } from "lucide-react";
import { SITE_CONFIG } from "@/constants";
import { fadeInUp, fadeInRight, transitions } from "@/lib/animations";

const FRAME_COUNT = 180; // 200 - 41 + 1
const START_FRAME = 20;
const END_FRAME = 200;

export function ScrollyTelling() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Framer Motion scroll hook
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Map scroll progress (0 to 1) to frame index (0 to FRAME_COUNT - 1)
  const frameIndexInput = useTransform(
    scrollYProgress,
    [0, 1],
    [0, FRAME_COUNT - 1]
  );
  
  // Text 1: Top-Left (0% -> 25%)
  const text1Opacity = useTransform(scrollYProgress, [0, 0.2, 0.25], [1, 1, 0]);
  const text1Y = useTransform(scrollYProgress, [0, 0.25], [0, -50]);
  const text1PointerEvents = useTransform(scrollYProgress, (v) => v > 0.25 ? "none" : "auto");

  // Text 2: Middle-Right (30% -> 55%)
  const text2Opacity = useTransform(scrollYProgress, [0.3, 0.35, 0.5, 0.55], [0, 1, 1, 0]);
  const text2Y = useTransform(scrollYProgress, [0.3, 0.35], [50, 0]);
  const text2PointerEvents = useTransform(scrollYProgress, (v) => (v > 0.3 && v < 0.55) ? "auto" : "none");

  // Text 3: Centered (60% -> End)
  // Stops fading out at the end, stays visible
  const text3Opacity = useTransform(scrollYProgress, [0.6, 0.65], [0, 1]);
  const text3Y = useTransform(scrollYProgress, [0.6, 0.65], [50, 0]);
  const text3PointerEvents = useTransform(scrollYProgress, (v) => (v > 0.6) ? "auto" : "none");

  // Preload images on mount
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = START_FRAME; i <= END_FRAME; i++) {
        const img = new Image();
        // Adjust path logic if necessary, ensuring leading zeros
        const frameNumber = i.toString().padStart(3, "0");
        img.src = `/sequence/ezgif-frame-${frameNumber}.jpg`;
        img.onload = () => {
          loadedCount++;
          if (loadedCount === FRAME_COUNT) {
            setIsLoaded(true);
          }
        };
        loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  // Render a specific frame index
  const renderFrame = (index: number) => {
    if (!isLoaded || !canvasRef.current || images.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Ensure index is within bounds
    const safeIndex = Math.min(Math.max(Math.floor(index), 0), FRAME_COUNT - 1);
    const img = images[safeIndex];

    if (!img) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgWidth = img.width;
    const imgHeight = img.height;

    const ratio = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
    const centerShift_x = (canvasWidth - imgWidth * ratio) / 2;
    const centerShift_y = (canvasHeight - imgHeight * ratio) / 2;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(
      img,
      0,
      0,
      imgWidth,
      imgHeight,
      centerShift_x,
      centerShift_y,
      imgWidth * ratio,
      imgHeight * ratio
    );
  };

  // Draw to canvas on scroll
  useEffect(() => {
    const unsubscribe = frameIndexInput.on("change", (latest) => {
      renderFrame(latest);
    });
    return () => unsubscribe();
  }, [frameIndexInput, isLoaded, images]);

  // Initial draw when loaded
  useEffect(() => {
    if (isLoaded) {
      renderFrame(0);
    }
  }, [isLoaded, images]);

  // Handle canvas resizing
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        // Re-render current frame (or first frame if at top)
        if (isLoaded) {
             // We can use the current scroll progress to determine frame
             renderFrame(frameIndexInput.get());
        }
      }
    };
    
    handleResize(); // Initial size
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [images, isLoaded, frameIndexInput]);


  return (
    <div ref={containerRef} className="relative h-[400vh] bg-black">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 block h-full w-full object-cover z-0"
            />
            {/* Dark overlay for text readability if needed */}
             <div className="absolute inset-0 bg-black/30 pointer-events-none z-0" />

             {/* Text Overlay */}
             <div className="absolute inset-0 z-10 pointer-events-none">
                
                {/* Text Group 1: Top-Left */}
                <motion.div 
                    style={{ opacity: text1Opacity, y: text1Y, pointerEvents: text1PointerEvents }}
                    className="absolute top-0 left-0 w-full h-full flex flex-col justify-start items-start pt-32 pl-6 md:pl-20 max-w-4xl"
                >
                    <motion.p
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ ...transitions.default, delay: 0.3 }}
                        className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-6 text-gray-300"
                    >
                        {SITE_CONFIG.tagline}
                    </motion.p>
                    <motion.h1
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ ...transitions.slow, delay: 0.4 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold font-oswald uppercase leading-[0.9] tracking-tight mb-8 text-white text-left"
                    >
                        {SITE_CONFIG.heroTitle[0]} <br /> {SITE_CONFIG.heroTitle[1]}
                    </motion.h1>
                    
                    <motion.div
                        variants={fadeInUp}
                        initial="hidden"
                        animate="visible"
                        transition={{ ...transitions.default, delay: 0.6 }}
                        className="mt-8"
                    >
                    </motion.div>
                </motion.div>

                {/* Text Group 2: Middle-Right */}
                <motion.div 
                    style={{ opacity: text2Opacity, y: text2Y, pointerEvents: text2PointerEvents }}
                    className="absolute inset-y-0 right-0 flex flex-col justify-center items-end pr-6 md:pr-20 max-w-4xl text-right"
                >
                     <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold font-oswald uppercase leading-[0.9] tracking-tight text-white mb-6">
                        TRANSFORM <br /> YOURSELF <br /> WITH AI
                     </h2>
                </motion.div>

                {/* Text Group 3: Centered */}
                <motion.div 
                    style={{ opacity: text3Opacity, y: text3Y, pointerEvents: text3PointerEvents }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto"
                >
                     <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold font-oswald uppercase leading-[0.9] tracking-tight text-white mb-6">
                        UNLOCK YOUR <br /> TRUE POTENTIAL
                     </h2>
                </motion.div>

             </div>
        </div>
    </div>
  );
}


