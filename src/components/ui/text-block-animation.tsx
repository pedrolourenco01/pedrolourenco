"use client"

import gsap from "gsap"
import { SplitText } from "gsap/SplitText"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { useRef, type ReactNode } from "react"
import { cn } from "@/lib/utils";

// Ensure plugins are registered safely
if (typeof window !== "undefined") {
    gsap.registerPlugin(SplitText, ScrollTrigger);
}

export interface TextBlockAnimationProps {
    children: ReactNode;
    animateOnScroll?: boolean;
    delay?: number;
    blockColor?: string;
    stagger?: number;
    duration?: number;
    className?: string;
}

export default function TextBlockAnimation({
    children,
    animateOnScroll = true,
    delay = 0,
    blockColor = "#000",
    stagger = 0.1, // Reduced for smoother flow
    duration = 0.6, // Slightly faster for snappiness
    className,
}: TextBlockAnimationProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useGSAP(() => {
        if (!containerRef.current) return;

        // 1. Setup SplitText
        const split = new SplitText(containerRef.current, {
            type: "lines",
            linesClass: "block-line-parent", // Generic class for styling if needed
        });

        // 2. Wrap lines and inject the block revealer manually
        // We do this to avoid layout thrashing by doing it in one pass
        const lines = split.lines;
        const blocks: HTMLDivElement[] = [];

        lines.forEach((line) => {
            // Force line to hug text width
            line.style.display = "inline-block";
            line.style.width = "fit-content";
            line.style.maxWidth = "100%";
            line.style.verticalAlign = "top";

            // Create the wrapper that hugs the exact text boundary
            const wrapper = document.createElement("div");
            wrapper.style.position = "relative";
            wrapper.style.display = "block";
            wrapper.style.width = "fit-content";
            wrapper.style.maxWidth = "100%";
            wrapper.style.overflow = "hidden"; // Ensures text doesn't show outside
            
            // Create the Revealer Block
            const block = document.createElement("div");
            block.style.position = "absolute";
            block.style.top = "0";
            block.style.left = "0";
            block.style.width = "100%";
            block.style.height = "100%";
            block.style.backgroundColor = blockColor;
            block.style.zIndex = "2";
            block.style.transform = "scaleX(0)";
            block.style.transformOrigin = "left center";
            
            // Insert wrapper and move line inside
            if (line.parentNode) {
                line.parentNode.insertBefore(wrapper, line);
                wrapper.appendChild(line);
                wrapper.appendChild(block);
            }
            
            // Set initial state of line to invisible
            gsap.set(line, { opacity: 0 });
            
            blocks.push(block);
        });

        // 3. Create the Master Timeline
        const tl = gsap.timeline({
            scrollTrigger: animateOnScroll ? {
                trigger: containerRef.current,
                start: "top 85%", // Triggers when top of element hits 85% viewport height
                toggleActions: "play none none reverse", // Replays if you scroll back up
            } : null,
            delay: delay
        });

        // 4. Build the Animation Sequence per line
        // Text remains 100% invisible until block fully covers it, and is revealed only as the block pulls away!
        blocks.forEach((block, index) => {
            const line = lines[index];
            const lineTl = gsap.timeline();

            // Step A: Scale Block 0 -> 1 (Left to Right), text is 100% invisible
            lineTl.to(block, {
                scaleX: 1,
                duration: duration,
                ease: "expo.inOut",
                transformOrigin: "left center",
            })
            // Step B: The exact moment block is 100% covering text (scaleX: 1), make line opaque behind it
            .set(line, {
                opacity: 1,
            })
            // Step C: Scale Block 1 -> 0 (Left to Right, shrinking toward right), revealing the text
            .to(block, {
                scaleX: 0,
                duration: duration,
                ease: "expo.inOut",
                transformOrigin: "right center",
            });

            tl.add(lineTl, index * stagger);
        });

    }, { 
        scope: containerRef, 
        dependencies: [animateOnScroll, delay, blockColor, stagger, duration] 
    });
    
    return (
        <div ref={containerRef} className={cn("relative", className)} style={{ position: "relative" }}>
            {children}
        </div>
    );
}
