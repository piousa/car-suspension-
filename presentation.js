/* ═══════════════════════════════════════════════════════════════
   CLASSROOM PRESENTATION MODE — 14 SLIDES
   Full-Screen High-Impact Engineering Mathematics Deck
   ═══════════════════════════════════════════════════════════════ */

const PresentationMode = {
  active: false,
  currentSlide: 0,
  slides: [
    {
      num: '01 / 14',
      title: 'WHY DOES A CAR<br><span>STOP BOUNCING?</span>',
      content: 'A spring stores kinetic energy. A damper removes it.<br><strong>One second-order differential equation determines vehicle ride and stability.</strong>',
      badge: 'ENGINEERING MATHEMATICS · AUTOMOTIVE DYNAMICS',
      formula: 'm\\ddot{x} + c\\dot{x} + kx = F(t)'
    },
    {
      num: '02 / 14',
      title: 'THE PHYSICAL<br><span>SUSPENSION HARDWARE</span>',
      content: 'Every automobile wheel is supported by a combined spring and hydraulic shock absorber assembly, reacting to surface profile disturbances while isolating vehicle occupants.',
      badge: 'MECHANICAL ARCHITECTURE',
      formula: 'F_{total} = F_s + F_d = kx + c\\dot{x}'
    },
    {
      num: '03 / 14',
      title: 'THE 10-STEP<br><span>MECHANICAL RELATIONSHIP</span>',
      content: 'Road bump $\\rightarrow$ Tire deflection $\\rightarrow$ Hub rises $\\rightarrow$ Control arm pivots $\\rightarrow$ Spring compresses $\\rightarrow$ Piston pushes hydraulic fluid $\\rightarrow$ Viscous shear converts kinetic motion into thermal energy.',
      badge: 'PHYSICAL KINEMATICS',
      formula: 'Kinetic\\;Energy \\xrightarrow{Damper} Heat\\;Dissipation'
    },
    {
      num: '04 / 14',
      title: 'THE QUARTER-CAR<br><span>MATHEMATICAL MODEL</span>',
      content: 'We model one quarter of the vehicle as an equivalent sprung mass $m$ supported by linear spring stiffness $k$ and viscous damping coefficient $c$.',
      badge: 'LUMPED PARAMETER SYSTEM',
      formula: 'm = 2\\text{ kg},\\quad k = 128\\text{ N/m},\\quad c_{crit} = 32\\text{ N}\\cdot\\text{s/m}'
    },
    {
      num: '05 / 14',
      title: 'GOVERNING SECOND-ORDER<br><span>DIFFERENTIAL EQUATION</span>',
      content: 'Applying Newton\'s Second Law $(\\sum F = m a)$ to the vertical displacement coordinate $x(t)$ produces a linear second-order ordinary differential equation with constant coefficients.',
      badge: 'NEWTONIAN FORMULATION',
      formula: 'm\\frac{d^2x}{dt^2} + c\\frac{dx}{dt} + kx = F(t)'
    },
    {
      num: '06 / 14',
      title: 'THE AUXILIARY<br><span>CHARACTERISTIC ROOTS</span>',
      content: 'Assuming an exponential trial solution $x(t) = e^{rt}$, we obtain the quadratic characteristic equation whose roots dictate the qualitative motion of the vehicle.',
      badge: 'ANALYTICAL SOLUTION',
      formula: 'mr^2 + cr + k = 0 \\implies r = \\frac{-c \\pm \\sqrt{c^2 - 4mk}}{2m}'
    },
    {
      num: '07 / 14',
      title: 'THE THREE REGIMES<br><span>OF DAMPING DYNAMICS</span>',
      content: '<strong>Underdamped ($D < 0$):</strong> Oscillatory bounce with exponential decay.<br><strong>Critically Damped ($D = 0$):</strong> Single fastest return without oscillation.<br><strong>Overdamped ($D > 0$):</strong> Sluggish, non-oscillatory asymptotic return.',
      badge: 'DISCRIMINANT DISSECTION',
      formula: 'D = c^2 - 4mk'
    },
    {
      num: '08 / 14',
      title: 'CRITICAL DAMPING:<br><span>THE GOLD STANDARD</span>',
      content: 'When $c = c_{crit} = 2\\sqrt{mk}$, repeated real roots yield $x(t) = (C_1 + C_2 t)e^{-\\omega_n t}$. This returns the car to equilibrium in the minimal mathematical settling time.',
      badge: 'OPTIMAL DESIGN POINT',
      formula: 'c_{crit} = 2\\sqrt{2 \\times 128} = 32\\text{ N}\\cdot\\text{s/m}'
    },
    {
      num: '09 / 14',
      title: 'RUNGE-KUTTA 4<br><span>NUMERICAL INTEGRATION</span>',
      content: 'Real road profiles cannot always be solved analytically. We convert the 2nd-order ODE into a system of two 1st-order equations and integrate with 4th-order accuracy.',
      badge: 'COMPUTATIONAL ALGORITHM',
      formula: '\\begin{bmatrix} \\dot{x}_1 \\\\ \\dot{x}_2 \\end{bmatrix} = \\begin{bmatrix} x_2 \\\\ \\frac{F(t) - cx_2 - kx_1}{m} \\end{bmatrix}'
    },
    {
      num: '10 / 14',
      title: 'PERIODIC ROAD<br><span>SURFACE EXCITATION</span>',
      content: 'Driving over a corrugated or washboard gravel road introduces harmonic base excitation $F(t) = F_0\\cos(\\omega t)$. The total solution is transient homogeneous plus steady-state particular response.',
      badge: 'FORCED OSCILLATIONS',
      formula: 'x(t) = x_h(t) + x_p(t) = x_{transient} + X_{ss}\\cos(\\omega t - \\phi)'
    },
    {
      num: '11 / 14',
      title: 'RESONANCE:<br><span>AVOIDING CATASTROPHIC BOUNCE</span>',
      content: 'When road excitation frequency approaches the natural frequency $\\omega \\rightarrow \\omega_n = \\sqrt{k/m}$, steady-state amplitude reaches its extreme peak, restrained only by shock absorber damping.',
      badge: 'FREQUENCY RESPONSE',
      formula: 'X_{ss} = \\frac{F_0}{\\sqrt{(k - m\\omega^2)^2 + (c\\omega)^2}}'
    },
    {
      num: '12 / 14',
      title: 'PRACTICAL AUTOMOTIVE<br><span>ENGINEERING TRADE-OFFS</span>',
      content: 'Passenger comfort requires lower spring stiffness ($\\,k\\,$), while handling stability requires firm damping ($\\,c\\,$). Modern vehicles utilize adaptive magnetorheological or semi-active electronic valves.',
      badge: 'VEHICLE DYNAMICS',
      formula: '\\zeta = \\frac{c}{2\\sqrt{mk}} \\approx 0.25 - 0.40\\text{ (Passenger Car Normal)}'
    },
    {
      num: '13 / 14',
      title: 'ENGINEERING<br><span>LIMITATIONS</span>',
      content: 'The quarter-car model ignores unsprung tire compliance, asymmetric valving (rebound is typically $3\\times$ stiffer than compression), suspension camber kinematics, pitch, and chassis roll.',
      badge: 'ACADEMIC RIGOR',
      formula: '2\\text{-DOF Model: } [m_s,\\, m_u,\\, k_s,\\, c_s,\\, k_t]'
    },
    {
      num: '14 / 14',
      title: 'CONCLUSION:<br><span>THE EQUATION EXPLAINS THE RIDE</span>',
      content: 'From physical coiled steel and hydraulic fluid friction to second-order differential equations — mathematics empowers engineers to optimize safety and comfort before manufacturing hardware.',
      badge: 'PROJECT SUMMARY',
      formula: 'mx\'\' + cx\' + kx = F(t) \\quad \\blacksquare'
    }
  ],

  init() {
    // Keyboard Listener
    window.addEventListener('keydown', (e) => {
      if (!this.active) {
        if (e.key === 'p' || e.key === 'P') {
          this.open();
        }
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        this.next();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        this.prev();
      } else if (e.key === 'Escape') {
        this.close();
      } else if (e.key === ' ') {
        e.preventDefault();
        if (typeof togglePlay === 'function') togglePlay();
      } else if (e.key === 'r' || e.key === 'R') {
        if (typeof restartSim === 'function') restartSim();
      } else if (e.key === 's' || e.key === 'S') {
        this.close();
        document.getElementById('lab')?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'm' || e.key === 'M') {
        this.close();
        document.getElementById('math')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  },

  open() {
    this.active = true;
    this.currentSlide = 0;
    const modal = document.getElementById('presentation-modal');
    if (modal) modal.classList.add('active');
    this.renderSlide();
  },

  close() {
    this.active = false;
    const modal = document.getElementById('presentation-modal');
    if (modal) modal.classList.remove('active');
  },

  next() {
    if (this.currentSlide < this.slides.length - 1) {
      this.currentSlide++;
      this.renderSlide();
    }
  },

  prev() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.renderSlide();
    }
  },

  renderSlide() {
    const s = this.slides[this.currentSlide];
    const numEl = document.getElementById('pres-num');
    const badgeEl = document.getElementById('pres-badge');
    const titleEl = document.getElementById('pres-title');
    const contentEl = document.getElementById('pres-content');
    const formulaEl = document.getElementById('pres-formula');

    if (numEl) numEl.textContent = s.num;
    if (badgeEl) badgeEl.textContent = s.badge;
    if (titleEl) titleEl.innerHTML = s.title;
    if (contentEl) contentEl.innerHTML = s.content;

    if (formulaEl) {
      if (typeof katex !== 'undefined') {
        try {
          katex.render(s.formula, formulaEl, { displayMode: true, throwOnError: false });
        } catch (e) {
          formulaEl.textContent = s.formula;
        }
      } else {
        formulaEl.textContent = s.formula;
      }
    }
  }
};

window.PresentationMode = PresentationMode;
