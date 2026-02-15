"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    baseX: number;
    baseY: number;
    density: number;
    update(): void;
    draw(): void;
}

const AntigravityBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let particlesArray: Particle[] = [];
        let animationFrameId: number;

        // Mouse position
        const mouse = {
            x: -1000, // Start off-screen
            y: -1000,
            radius: 150, // Interaction radius
        };

        const colors = [
            "#4285F4", // Google Blue
            "#EA4335", // Google Red
            "#FBBC05", // Google Yellow
            "#34A853", // Google Green
            "#FF6D01", // Orange (Antigravity accent)
            "#46BDC6", // Teal (Antigravity accent)
        ];

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };

        const handleMouseMove = (event: MouseEvent) => {
            mouse.x = event.x;
            mouse.y = event.y;
        };

        const handleTouchMove = (event: TouchEvent) => {
            if (event.touches.length > 0) {
                mouse.x = event.touches[0].clientX;
                mouse.y = event.touches[0].clientY;
            }
        };

        class ParticleClass implements Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            color: string;
            baseX: number;
            baseY: number;
            density: number;

            constructor(x: number, y: number) {
                this.x = x;
                this.y = y;
                this.baseX = x;
                this.baseY = y;
                this.vx = (Math.random() - 0.5) * 0.5; // Slow random movement
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 3 + 1; // Random size 1-4px
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.density = Math.random() * 30 + 1; // How heavy/light the particle feels
            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            update() {
                // Simple Physics: Mouse repulsion (Antigravity)
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Force Direction
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;

                // Force Magnitude (The closer, the stronger)
                const maxDistance = mouse.radius;
                const force = (maxDistance - distance) / maxDistance;

                // DirectionX & Y (Repulsion)
                // If within radius, move AWAY
                if (distance < mouse.radius) {
                    const directionX = forceDirectionX * force * this.density * 2; // Speed multiplier
                    const directionY = forceDirectionY * force * this.density * 2;
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    // Return to base position (Elasticity)
                    if (this.x !== this.baseX) {
                        const dx = this.x - this.baseX;
                        this.x -= dx / 20; // Ease back speed
                    }
                    if (this.y !== this.baseY) {
                        const dy = this.y - this.baseY;
                        this.y -= dy / 20;
                    }
                }

                // Add subtle drift/float when idle
                // this.x += this.vx;
                // this.y += this.vy;

                this.draw();
            }
        }

        const init = () => {
            particlesArray = [];
            // Create a grid of particles or scatter them
            // Creating a scattered look for more "organic" feel
            const numberOfParticles = (canvas.width * canvas.height) / 7000; // Adjust density
            for (let i = 0; i < numberOfParticles; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                particlesArray.push(new ParticleClass(x, y));
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        // Initialize
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
        animate();

        // Event Listeners
        window.addEventListener("resize", handleResize);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("touchmove", handleTouchMove);

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchmove", handleTouchMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none"
            style={{
                opacity: 0.3,
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: -9999,
                pointerEvents: 'none'
            }}
        />
    );
};

export default AntigravityBackground;
