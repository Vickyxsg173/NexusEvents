import React, { useEffect, useRef } from 'react';

const ParticleMesh = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    const mouse = { x: -1000, y: -1000, radius: 150 };

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        
        // Vortex center far bottom-left to create sweeping concentric arcs
        const cx = -window.innerWidth * 0.5;
        const cy = window.innerHeight * 1.5;
        
        // Calculate tangent angle to form sweeping curves
        this.baseAngle = Math.atan2(y - cy, x - cx) + Math.PI / 2;
        this.angle = this.baseAngle;

        // Gradient coloring from bottom-left to top-right
        const distFromBL = Math.sqrt(Math.pow(x - 0, 2) + Math.pow(y - window.innerHeight, 2));
        const maxDist = Math.sqrt(Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2));
        const percent = distFromBL / maxDist;

        // Google Antigravity-esque colors: Blue -> Purple -> Pink -> Orange
        if (percent < 0.25) this.color = '#3b82f6';      // Blue
        else if (percent < 0.50) this.color = '#8b5cf6'; // Purple
        else if (percent < 0.75) this.color = '#ec4899'; // Pink
        else this.color = '#f97316';                     // Orange
        
        this.size = Math.random() * 1.5 + 1; // Stroke width
        this.length = Math.random() * 6 + 4; // Dash length
      }

      draw() {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
          this.x + Math.cos(this.angle) * this.length, 
          this.y + Math.sin(this.angle) * this.length
        );
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      update() {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        let maxDistance = mouse.radius; // The repulsion radius
        let drawRadius = 350; // The visibility radius (medium area around cursor)

        // If outside visibility radius, just snap back and do not draw
        if (distance > drawRadius) {
          if (this.x !== this.baseX) this.x += (this.baseX - this.x) * 0.05;
          if (this.y !== this.baseY) this.y += (this.baseY - this.y) * 0.05;
          this.angle = this.baseAngle;
          return;
        }

        if (distance < maxDistance) {
          // Push away from mouse
          let force = (maxDistance - distance) / maxDistance;
          let directionX = dx / distance;
          let directionY = dy / distance;
          
          this.x -= directionX * force * 5;
          this.y -= directionY * force * 5;
          
          // Bend the angle tangentially to the mouse repulsion
          const angleToMouse = Math.atan2(dy, dx);
          this.angle = angleToMouse + Math.PI / 2; 
        } else {
          // Smoothly return to base position
          if (this.x !== this.baseX) {
            this.x += (this.baseX - this.x) * 0.05;
          }
          if (this.y !== this.baseY) {
            this.y += (this.baseY - this.y) * 0.05;
          }
          // Return to base angle
          this.angle = this.baseAngle;
        }

        // Calculate opacity based on distance to mouse
        let alpha = 1 - (distance / drawRadius);
        ctx.globalAlpha = Math.pow(alpha, 1.2); // Smooth non-linear fade
        
        this.draw();
        
        // Reset alpha
        ctx.globalAlpha = 1.0;
      }
    }

    const initParticles = () => {
      particles = [];
      const spacing = 35; // Density of the mesh
      for (let x = -50; x < window.innerWidth + 50; x += spacing) {
        for (let y = -50; y < window.innerHeight + 50; y += spacing) {
          // Randomly skip particles to create an organic, scattered look
          if (Math.random() > 0.65) continue;

          // Add slight randomness to position so it's not a rigid grid
          const px = x + (Math.random() - 0.5) * 20;
          const py = y + (Math.random() - 0.5) * 20;
          particles.push(new Particle(px, py));
        }
      }
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'transparent' }}
    />
  );
};

export default ParticleMesh;
