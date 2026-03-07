"use client";

import { useEffect, useRef } from "react";

export function MouseEffect() {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Override cursors only on non-touch devices
        if (window.matchMedia("(pointer: coarse)").matches) return;

        const styleElement = document.createElement('style');
        styleElement.innerHTML = `
      * { cursor: none !important; }
    `;
        document.head.appendChild(styleElement);

        let mouseX = -100;
        let mouseY = -100;
        let ringX = -100;
        let ringY = -100;
        let isHovering = false;

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            const target = e.target as HTMLElement;
            if (
                target.tagName.toLowerCase() === 'a' ||
                target.tagName.toLowerCase() === 'button' ||
                target.closest('a') ||
                target.closest('button') ||
                target.onclick != null ||
                target.getAttribute('role') === 'button'
            ) {
                isHovering = true;
            } else {
                isHovering = false;
            }

            if (dotRef.current) {
                dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(${isHovering ? 0 : 1})`;
            }
        };

        window.addEventListener("mousemove", handleMouseMove);

        let animationFrameId: number;

        const render = () => {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;

            if (ringRef.current) {
                ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${isHovering ? 1.5 : 1})`;
                if (isHovering) {
                    ringRef.current.style.borderColor = 'rgba(56, 189, 248, 0.8)';
                    ringRef.current.style.backgroundColor = 'rgba(56, 189, 248, 0.15)';
                } else {
                    ringRef.current.style.borderColor = 'rgba(37, 99, 235, 0.5)';
                    ringRef.current.style.backgroundColor = 'transparent';
                }
            }

            if (glowRef.current) {
                // Multiplier to create a slight parallax or smooth drag
                glowRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);
            if (document.head.contains(styleElement)) {
                document.head.removeChild(styleElement);
            }
        };
    }, []);

    return (
        <>
            <div
                ref={glowRef}
                className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full blur-[80px] pointer-events-none z-[1] hidden md:block"
                style={{
                    willChange: "transform",
                    background: "radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(37,99,235,0.05) 50%, rgba(0,0,0,0) 70%)"
                }}
            />
            <div
                ref={ringRef}
                className="fixed top-0 left-0 w-8 h-8 border-[1.5px] rounded-full pointer-events-none z-[9999] transition-colors duration-200 hidden md:block backdrop-invert-[0.1]"
                style={{ willChange: "transform" }}
            />
            <div
                ref={dotRef}
                className="fixed top-0 left-0 w-2 h-2 bg-blue-600 rounded-full pointer-events-none z-[10000] hidden md:block shadow-[0_0_10px_rgba(37,99,235,0.8)]"
                style={{ willChange: "transform", transition: "transform 0.15s ease-out" }}
            />
        </>
    );
}
