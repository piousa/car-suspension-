/* ═══════════════════════════════════════════════════════════════
   WHAT IS INSIDE A SHOCK ABSORBER? — CUTAWAY VISUALIZER
   Hydraulic Resistance, Orifice Dynamics & Thermal Dissipation
   ═══════════════════════════════════════════════════════════════ */

const ShockCutaway = {
  canvas: null,
  ctx: null,
  pistonStroke: 0,
  velocity: 0,
  heatLevel: 0,
  cutawayActive: true,
  particles: [],

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Generate hydraulic fluid particles for flow visualization
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: (Math.random() - 0.5) * 60,
        y: Math.random() * 220 + 120,
        vy: 0,
        size: Math.random() * 2 + 1.5,
        color: '#60a5fa'
      });
    }

    this.resize();
    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    if (!this.canvas) return;
    const w = this.canvas.clientWidth || 400;
    const h = this.canvas.clientHeight || 440;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.scale(dpr, dpr);
  },

  update(suspensionVel) {
    this.velocity = suspensionVel || 0;
    // Map velocity to stroke and fluid movement
    this.pistonStroke = (typeof SIM !== 'undefined' ? SIM.x : 0) * 80;

    // Heat accumulation proportional to damping dissipation: P = c * v^2
    const dissipationPower = (typeof SIM !== 'undefined' ? SIM.c : 32) * Math.pow(this.velocity, 2);
    this.heatLevel = Math.min(100, Math.max(15, this.heatLevel * 0.98 + dissipationPower * 0.4));

    // Update hydraulic fluid particles flowing through valve orifices
    this.particles.forEach(p => {
      // Flow in opposite direction to piston movement
      const flowDir = -this.velocity * 12;
      p.y += flowDir + (Math.random() - 0.5) * 1.5;

      // Wrap particles inside fluid chamber [140, 360]
      if (p.y < 140) p.y = 350;
      if (p.y > 360) p.y = 150;
    });

    this.render();
  },

  render() {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const W = this.canvas.clientWidth;
    const H = this.canvas.clientHeight;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;
    const baseY = 80;

    // ── TECHNICAL BACKGROUND GRID ──
    ctx.fillStyle = '#0f1016';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    // Dimensions
    const cylW = 100;
    const cylH = 260;
    const cylTop = baseY + 60;
    const cylBot = cylTop + cylH;

    // Piston position with suspension travel
    const nominalPistonY = cylTop + cylH * 0.48;
    const currentPistonY = Math.max(cylTop + 40, Math.min(cylBot - 40, nominalPistonY + this.pistonStroke));

    // ── 1. LOWER MOUNTING EYELET ──
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cylBot + 35, 26, 0, Math.PI * 2);
    ctx.fillStyle = '#374151';
    ctx.fill();
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Eyelet Bushing hole
    ctx.beginPath();
    ctx.arc(cx, cylBot + 35, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#111827';
    ctx.fill();
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // ── 2. OUTER DAMPER TUBE / CYLINDER ──
    const cylGrad = ctx.createLinearGradient(cx - cylW / 2, 0, cx + cylW / 2, 0);
    if (this.cutawayActive) {
      cylGrad.addColorStop(0, 'rgba(37, 99, 235, 0.7)');
      cylGrad.addColorStop(0.15, 'rgba(30, 58, 138, 0.35)');
      cylGrad.addColorStop(0.85, 'rgba(30, 58, 138, 0.35)');
      cylGrad.addColorStop(1, 'rgba(37, 99, 235, 0.7)');
    } else {
      cylGrad.addColorStop(0, '#1e3a8a');
      cylGrad.addColorStop(0.5, '#3b82f6');
      cylGrad.addColorStop(1, '#1e3a8a');
    }

    ctx.fillStyle = cylGrad;
    ctx.fillRect(cx - cylW / 2, cylTop, cylW, cylH);
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - cylW / 2, cylTop, cylW, cylH);

    // ── 3. HYDRAULIC FLUID CHAMBERS (CUTAWAY VIEW) ──
    if (this.cutawayActive) {
      // Fluid Chamber Upper (Rebound chamber)
      const fluidUpperGrad = ctx.createLinearGradient(0, cylTop, 0, currentPistonY);
      fluidUpperGrad.addColorStop(0, 'rgba(96, 165, 250, 0.3)');
      fluidUpperGrad.addColorStop(1, 'rgba(59, 130, 246, 0.45)');
      ctx.fillStyle = fluidUpperGrad;
      ctx.fillRect(cx - cylW / 2 + 4, cylTop + 4, cylW - 8, currentPistonY - (cylTop + 4));

      // Fluid Chamber Lower (Compression chamber)
      const fluidLowerGrad = ctx.createLinearGradient(0, currentPistonY + 24, 0, cylBot);
      fluidLowerGrad.addColorStop(0, 'rgba(59, 130, 246, 0.45)');
      fluidLowerGrad.addColorStop(1, 'rgba(96, 165, 250, 0.3)');
      ctx.fillStyle = fluidLowerGrad;
      ctx.fillRect(cx - cylW / 2 + 4, currentPistonY + 24, cylW - 8, cylBot - (currentPistonY + 24) - 4);

      // Hydraulic Fluid Flow Particles
      this.particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(cx + p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = Math.abs(this.velocity) > 0.3 ? '#93c5fd' : '#60a5fa';
        ctx.fill();
      });

      // Flow Orifice Jets (dynamic spray arrows through valves)
      if (Math.abs(this.velocity) > 0.08) {
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        const arrowDir = this.velocity > 0 ? -1 : 1;
        [-20, 20].forEach(ox => {
          ctx.beginPath();
          ctx.moveTo(cx + ox, currentPistonY + 12);
          ctx.lineTo(cx + ox, currentPistonY + 12 + arrowDir * 28);
          ctx.stroke();
        });
        ctx.restore();
      }
    }

    // ── 4. CHROME PISTON ROD ──
    const rodW = 20;
    const rodTop = currentPistonY - 140;
    const rodGrad = ctx.createLinearGradient(cx - rodW / 2, 0, cx + rodW / 2, 0);
    rodGrad.addColorStop(0, '#9ca3af');
    rodGrad.addColorStop(0.5, '#f3f4f6');
    rodGrad.addColorStop(1, '#9ca3af');
    ctx.fillStyle = rodGrad;
    ctx.fillRect(cx - rodW / 2, rodTop, rodW, currentPistonY - rodTop);
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - rodW / 2, rodTop, rodW, currentPistonY - rodTop);

    // ── 5. UPPER MOUNTING EYELET ──
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, rodTop - 15, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#374151';
    ctx.fill();
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, rodTop - 15, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#111827';
    ctx.fill();
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // ── 6. PISTON HEAD WITH ORIFICE VALVES ──
    const headH = 24;
    const headGrad = ctx.createLinearGradient(cx - cylW / 2 + 6, 0, cx + cylW / 2 - 6, 0);
    headGrad.addColorStop(0, '#dc2626');
    headGrad.addColorStop(0.5, '#f87171');
    headGrad.addColorStop(1, '#dc2626');
    ctx.fillStyle = headGrad;
    ctx.fillRect(cx - cylW / 2 + 5, currentPistonY, cylW - 10, headH);
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - cylW / 2 + 5, currentPistonY, cylW - 10, headH);

    // Valve Orifices (Tunnels for fluid)
    [-20, 20].forEach(ox => {
      ctx.fillStyle = '#111827';
      ctx.fillRect(cx + ox - 5, currentPistonY, 10, headH);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx + ox - 5, currentPistonY, 10, headH);
    });

    // Piston seal rings
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(cx - cylW / 2 + 5, currentPistonY + 3, 4, 6);
    ctx.fillRect(cx + cylW / 2 - 9, currentPistonY + 3, 4, 6);

    // ── 7. ANNOTATIONS & GAUGES ──
    ctx.font = '600 10px JetBrains Mono, monospace';

    // Piston Rod Label
    ctx.fillStyle = '#e5e7eb';
    ctx.fillText('CHROME ROD', cx + rodW / 2 + 10, rodTop + 40);

    // Valve Orifices Label
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('VALVE ORIFICES', cx + cylW / 2 + 10, currentPistonY + 14);
    ctx.beginPath();
    ctx.strokeStyle = '#38bdf8';
    ctx.moveTo(cx + 25, currentPistonY + 12);
    ctx.lineTo(cx + cylW / 2 + 8, currentPistonY + 12);
    ctx.stroke();

    // Damping Energy Dissipation (Thermal Heat Meter)
    const meterX = 20;
    const meterY = H - 65;
    const meterW = 100;
    const meterH = 10;
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(meterX, meterY, meterW, meterH);

    const heatGrad = ctx.createLinearGradient(meterX, 0, meterX + meterW, 0);
    heatGrad.addColorStop(0, '#3b82f6');
    heatGrad.addColorStop(0.5, '#f59e0b');
    heatGrad.addColorStop(1, '#ef4444');
    ctx.fillStyle = heatGrad;
    ctx.fillRect(meterX, meterY, (this.heatLevel / 100) * meterW, meterH);
    ctx.strokeStyle = '#374151';
    ctx.strokeRect(meterX, meterY, meterW, meterH);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillText('HEAT DISSIPATION: ' + Math.round(this.heatLevel) + '°C', meterX, meterY - 6);

    // Mechanical Work -> Heat Formula
    ctx.fillStyle = '#fb923c';
    ctx.fillText('Fd = c · x\'(t)', W - 110, H - 40);
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('Power = c·(x\')²', W - 110, H - 24);
  }
};

window.ShockCutaway = ShockCutaway;
