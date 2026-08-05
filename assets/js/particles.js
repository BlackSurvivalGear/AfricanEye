/**
 * AfricanEye - Interactive Canvas Particle System
 * Creates high-performance floating premium dust particles across the landing page.
 */

export class ParticleSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.maxParticles = 65; // High performance premium subtle limit
        this.goldAccent = 'rgba(212, 175, 55, '; // Gold color base
        this.successAccent = 'rgba(0, 200, 150, '; // Subtle success color base

        this.resize();
        this.init();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    init() {
        this.particles = [];
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            radius: Math.random() * 1.5 + 0.5, // Tiny premium particles
            vx: (Math.random() - 0.5) * 0.15, // Ultra slow movement
            vy: (Math.random() - 0.5) * 0.15,
            opacity: Math.random() * 0.25 + 0.05,
            colorType: Math.random() > 0.85 ? this.successAccent : this.goldAccent,
            pulseSpeed: Math.random() * 0.005 + 0.002,
            pulseDir: Math.random() > 0.5 ? 1 : -1
        };
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.particles.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `${p.colorType}${p.opacity})`;
            this.ctx.fill();
        });
    }

    update() {
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            // Opacity pulsing
            p.opacity += p.pulseSpeed * p.pulseDir;
            if (p.opacity > 0.35 || p.opacity < 0.05) {
                p.pulseDir *= -1;
            }

            // Boundary wrapping
            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;
            if (p.y < 0) p.y = this.height;
            if (p.y > this.height) p.y = 0;
        });
    }

    animate() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}
