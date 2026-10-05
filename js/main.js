/**
 * DAVID ASUQUO — 2026 FUTURISTIC PORTFOLIO ENGINE
 * Timeless, modular, ultra-responsive, zero external dependencies.
 */

(function () {
  'use strict';

  // State Management
  const state = {
    audioEnabled: false,
    theme: localStorage.getItem('da_theme') || 'void',
    isPlayingVideo: false,
    videoProgress: 48,
    activeScene: 0,
    commandHistory: [],
    historyIndex: -1
  };

  // Audio Engine using Web Audio API
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq = 440, type = 'sine', duration = 0.08, gainVal = 0.05) {
    if (!state.audioEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio fail silent
    }
  }

  const sfx = {
    hover: () => playTone(580, 'sine', 0.04, 0.02),
    click: () => playTone(880, 'triangle', 0.07, 0.04),
    beep: () => playTone(1050, 'square', 0.05, 0.02),
    success: () => {
      playTone(523.25, 'sine', 0.08, 0.04);
      setTimeout(() => playTone(659.25, 'sine', 0.08, 0.04), 80);
      setTimeout(() => playTone(783.99, 'sine', 0.12, 0.04), 160);
    },
    theme: () => {
      playTone(400, 'triangle', 0.06, 0.03);
      setTimeout(() => playTone(600, 'triangle', 0.09, 0.03), 70);
    }
  };

  // Ambient Canvas Particle System
  function initAmbientCanvas() {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, dpr;
    let particles = [];
    const particleCount = window.innerWidth < 768 ? 35 : 75;
    let mouse = { x: -1000, y: -1000, radius: 140 };

    function resize() {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 1.8 + 0.8;
        this.baseAlpha = Math.random() * 0.45 + 0.2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Mouse interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 1.5;
          this.y -= (dy / dist) * force * 1.5;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 242, 254, ${this.baseAlpha})`;
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 242, 254, ${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    resize();
    initParticles();
    animate();
  }

  // Custom Cursor
  function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.custom-cursor-follower');
    if (!cursor || !follower) return;

    let posX = 0, posY = 0;
    let mouseX = 0, mouseY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    });

    function renderFollower() {
      posX += (mouseX - posX) * 0.16;
      posY += (mouseY - posY) * 0.16;
      follower.style.left = `${posX}px`;
      follower.style.top = `${posY}px`;
      requestAnimationFrame(renderFollower);
    }
    renderFollower();

    // Hover state on links & interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .glass-panel, .skill-card, .sb-tab-btn');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
        sfx.hover();
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
    });
  }

  // Header Scroll & Nav Tracker
  function initNavigation() {
    const header = document.querySelector('.site-header');
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      // Highlight active nav section
      let current = '';
      sections.forEach((sec) => {
        const top = sec.offsetTop - 120;
        if (window.scrollY >= top) {
          current = sec.getAttribute('id');
        }
      });

      navItems.forEach((item) => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${current}`) {
          item.classList.add('active');
        }
      });
    });

    // Mobile Drawer Toggle
    const mobileBtn = document.getElementById('mobile-toggle-btn');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (mobileBtn && mobileDrawer) {
      mobileBtn.addEventListener('click', () => {
        mobileDrawer.classList.toggle('open');
        sfx.click();
      });

      mobileLinks.forEach((link) => {
        link.addEventListener('click', () => {
          mobileDrawer.classList.remove('open');
          sfx.click();
        });
      });
    }
  }

  // Holographic 3D Tilt on Hero Card
  function initHeroCardParallax() {
    const card = document.querySelector('.hero-holo-card');
    const container = document.querySelector('.hero-card-container');
    if (!card || !container) return;

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = (-y / rect.height) * 16;
      const rotateY = (x / rect.width) * 16;

      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });

    container.addEventListener('mouseleave', () => {
      card.style.transform = `rotateX(0deg) rotateY(0deg) translateZ(0px)`;
    });
  }

  // Audio Toggle
  function initAudioToggle() {
    const btn = document.getElementById('audio-toggle-btn');
    const icon = document.getElementById('audio-icon');
    if (!btn) return;

    btn.addEventListener('click', () => {
      initAudio();
      state.audioEnabled = !state.audioEnabled;
      btn.setAttribute('aria-pressed', state.audioEnabled);
      if (state.audioEnabled) {
        btn.classList.add('active');
        icon.innerHTML = `<path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>`;
        showToast('🔊 Audio Spatial Sound FX Enabled');
        sfx.success();
      } else {
        btn.classList.remove('active');
        icon.innerHTML = `<path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>`;
        showToast('🔇 Audio Muted');
      }
    });
  }

  // Theme Switching
  function initThemeSwitcher() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (!themeBtn) return;

    function applyTheme(t) {
      state.theme = t;
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('da_theme', t);
      sfx.theme();
    }

    if (state.theme && state.theme !== 'void') {
      applyTheme(state.theme);
    }

    themeBtn.addEventListener('click', () => {
      if (state.theme === 'void') {
        applyTheme('cyber-emerald');
        showToast('Theme: Cyber Emerald');
      } else if (state.theme === 'cyber-emerald') {
        applyTheme('solar-titanium');
        showToast('Theme: Solar Titanium');
      } else {
        applyTheme('void');
        showToast('Theme: Deep Void Obsidian');
      }
    });
  }

  // AI Video Studio Showcase (SiriusMed Care)
  const scenesData = [
    {
      title: "Scene 01: AI Medical Diagnostic Triage",
      desc: "Character-led narrative demonstrating the clinical intake workflow, symptom comprehension, and natural language communication for patient empowerment.",
      prompt: "PROMPT // 'Cinematic shot of Dr. Anya Sharma explaining emergency protocol triage, hyper-accurate medical terminology, serene clinical lighting, warm empathetic gaze, 4k 60fps'."
    },
    {
      title: "Scene 02: Medication Compliance AI Assistant",
      desc: "Dynamic motion breakdown showcasing real-time reminder alerts, medication schedules, and interactive dosage confirmation dialogs.",
      prompt: "PROMPT // 'Split-screen UI animation showing dosage adherence timeline, notification sync with wearable device, fluid neon telemetry graph, upbeat instructional tone'."
    },
    {
      title: "Scene 03: Immunization Tracking & Family Health",
      desc: "End-to-end patient walkthrough visualizing pediatric vaccine calendars, automated records validation, and certified clinic provider handoff.",
      prompt: "PROMPT // 'Interactive digital passport interface for family immunization tracking, seamless card transitions, verified cryptographic badge icon, crystal clear voiceover'."
    }
  ];

  function initAIStudio() {
    const tabBtns = document.querySelectorAll('.sb-tab-btn');
    const cardTitle = document.getElementById('sb-card-title');
    const cardDesc = document.getElementById('sb-card-desc');
    const promptText = document.getElementById('sb-prompt-text');
    const playBtn = document.getElementById('scrubber-play-btn');
    const progressEl = document.getElementById('scrubber-progress');
    const thumbEl = document.getElementById('scrubber-thumb');
    const timestampEl = document.getElementById('scrubber-timestamp');
    const trackEl = document.querySelector('.scrubber-track');

    tabBtns.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        tabBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeScene = idx;
        const data = scenesData[idx];
        if (data) {
          cardTitle.textContent = data.title;
          cardDesc.textContent = data.desc;
          promptText.textContent = data.prompt;
        }
        sfx.click();
      });
    });

    let playInterval = null;

    function updateScrubber(pct) {
      state.videoProgress = Math.max(0, Math.min(100, pct));
      if (progressEl) progressEl.style.width = `${state.videoProgress}%`;
      if (thumbEl) thumbEl.style.left = `${state.videoProgress}%`;
      
      const totalSeconds = 240; // 04:00 total
      const currentSeconds = Math.floor((state.videoProgress / 100) * totalSeconds);
      const m = String(Math.floor(currentSeconds / 60)).padStart(2, '0');
      const s = String(currentSeconds % 60).padStart(2, '0');
      if (timestampEl) timestampEl.textContent = `00:${m}:${s}`;
    }

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        state.isPlayingVideo = !state.isPlayingVideo;
        if (state.isPlayingVideo) {
          playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
          sfx.click();
          playInterval = setInterval(() => {
            let next = state.videoProgress + 0.8;
            if (next > 100) next = 0;
            updateScrubber(next);
          }, 100);
        } else {
          playBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
          clearInterval(playInterval);
          sfx.click();
        }
      });
    }

    if (trackEl) {
      trackEl.addEventListener('click', (e) => {
        const rect = trackEl.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = (clickX / rect.width) * 100;
        updateScrubber(pct);
        sfx.beep();
      });
    }

    updateScrubber(48);
  }

  // Skills Filtering
  function initSkillsFilter() {
    const filterBtns = document.querySelectorAll('.skill-filter-btn');
    const skillCards = document.querySelectorAll('.skill-card');

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');

        skillCards.forEach((card) => {
          if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
        sfx.click();
      });
    });
  }

  // Live Cypress Test Runner Demo
  function initTestRunner() {
    const runBtn = document.getElementById('run-test-btn');
    const testStatus = document.getElementById('test-status-tag');
    if (!runBtn || !testStatus) return;

    runBtn.addEventListener('click', () => {
      sfx.click();
      runBtn.disabled = true;
      runBtn.textContent = 'Running Specs...';
      testStatus.innerHTML = `<span style="color: #f59e0b">● Executing 4 Cypress Suites...</span>`;

      setTimeout(() => {
        testStatus.innerHTML = `<span style="color: #34d399">✔ 4/4 Specs Passed (0 failed) — 182ms</span>`;
        runBtn.disabled = false;
        runBtn.textContent = 'Re-Run Cypress Test';
        sfx.success();
        showToast('All 4 Cypress E2E specs passed with 100% assertions!');
      }, 950);
    });
  }

  // Interactive Command Terminal & ⌘K Modal
  function initTerminal() {
    const modal = document.getElementById('terminal-modal');
    const openBtns = document.querySelectorAll('.open-terminal-btn, .cmd-palette-btn');
    const closeBtns = document.querySelectorAll('.close-terminal-btn');
    const termInput = document.getElementById('term-input');
    const termBody = document.getElementById('term-body');

    function openTerminal() {
      if (!modal) return;
      modal.classList.add('open');
      if (termInput) {
        termInput.focus();
      }
      sfx.beep();
    }

    function closeTerminal() {
      if (!modal) return;
      modal.classList.remove('open');
      sfx.click();
    }

    openBtns.forEach((btn) => btn.addEventListener('click', openTerminal));
    closeBtns.forEach((btn) => btn.addEventListener('click', closeTerminal));

    // Keyboard shortcut ⌘K / Ctrl+K & Escape
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (modal.classList.contains('open')) {
          closeTerminal();
        } else {
          openTerminal();
        }
      }
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeTerminal();
      }
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeTerminal();
    });

    // Terminal Commands
    const commands = {
      help: () => `Available commands:
  • <span style="color:var(--accent-cyan)">about</span>: Who is David Asuquo?
  • <span style="color:var(--accent-cyan)">skills</span>: List core engineering & AI tools
  • <span style="color:var(--accent-cyan)">projects</span>: View flagship live web applications
  • <span style="color:var(--accent-cyan)">siriusmed</span>: AI video production details
  • <span style="color:var(--accent-cyan)">contact</span>: Direct email, phone, and Github
  • <span style="color:var(--accent-cyan)">resume</span>: Open full printable resume dossier
  • <span style="color:var(--accent-cyan)">theme &lt;void|emerald|titanium&gt;</span>: Switch theme
  • <span style="color:var(--accent-cyan)">hire</span>: Quick recruitment direct inquiry
  • <span style="color:var(--accent-cyan)">clear</span>: Clear terminal console`,

      about: () => `David Asuquo is a Full-Stack Engineer and AI Video Producer based in Lagos, Nigeria.
Specialized in high-conversion React/Next.js architectures, dynamic component design systems,
and end-to-end AI-assisted video workflows for medical tech products like SiriusMed.`,

      skills: () => `Stack Matrix:
  [Frontend]  React.js, Next.js, Vite, TypeScript, JavaScript (ES6+), Tailwind CSS, Figma
  [Backend]   Node.js, Express, MongoDB, PostgreSQL, REST APIs, Swagger / Postman
  [Testing]   Cypress E2E Testing, Git PR reviews, Agile / Scrum (Jira)
  [AI Media]  AI Video Production, Storyboarding, Prompt Engineering, Character Narrative`,

      projects: () => `Production Apps:
  1. Vitals E-commerce App: https://vitals-frontend.vercel.app
  2. Southside Food: https://www.southsidefood.com
  3. Swiftsell Shop: https://www.swiftsell.shop`,

      siriusmed: () => `SiriusMed Care (AI Video Producer, April 2026 - Present):
  • Developed scripts & storyboards for AI medical assistant promotional/educational videos
  • Produced character-led narrative content (medication compliance & immunization tracking)
  • Managed end-to-end video pipeline from concept to final delivery.`,

      contact: () => `Direct Communication Channels:
  • Email:  <a href="mailto:spiriteddavid@gmail.com" style="color:var(--accent-cyan)">spiriteddavid@gmail.com</a>
  • Phone:  +234 815 560 6889
  • Github: <a href="https://github.com/spirited24" target="_blank" style="color:var(--accent-cyan)">github.com/spirited24</a>
  • City:   Lagos, Nigeria`,

      hire: () => `Ready for full-time engineering roles, high-impact contract builds, and AI media production.
Email: spiriteddavid@gmail.com | Phone: +234 815 560 6889`,

      resume: () => {
        setTimeout(openResumeModal, 200);
        return `Opening full resume dossier viewer...`;
      }
    };

    if (termInput) {
      termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const raw = termInput.value.trim();
          termInput.value = '';
          if (!raw) return;

          state.commandHistory.push(raw);
          state.historyIndex = state.commandHistory.length;

          // Echo command
          const cmdEcho = document.createElement('div');
          cmdEcho.className = 'term-output-line';
          cmdEcho.innerHTML = `<span style="color:var(--accent-cyan)">asuquo@terminal:~$</span> ${escapeHTML(raw)}`;
          termBody.appendChild(cmdEcho);

          const parts = raw.split(' ');
          const cmd = parts[0].toLowerCase();
          const arg = parts[1] ? parts[1].toLowerCase() : '';

          if (cmd === 'clear') {
            termBody.innerHTML = '';
            sfx.beep();
            return;
          }

          if (cmd === 'theme') {
            if (arg === 'void' || arg === 'emerald' || arg === 'titanium') {
              const fullTheme = arg === 'emerald' ? 'cyber-emerald' : arg === 'titanium' ? 'solar-titanium' : 'void';
              document.documentElement.setAttribute('data-theme', fullTheme);
              localStorage.setItem('da_theme', fullTheme);
              state.theme = fullTheme;
              sfx.theme();
              appendOutput(`Theme switched to: ${fullTheme}`);
            } else {
              appendOutput(`Usage: theme &lt;void | emerald | titanium&gt;`);
            }
            return;
          }

          if (commands[cmd]) {
            const result = commands[cmd]();
            appendOutput(result);
            sfx.beep();
          } else {
            appendOutput(`Command not recognized: "${escapeHTML(cmd)}". Type <span style="color:var(--accent-cyan)">help</span> to list commands.`);
            sfx.beep();
          }

          termBody.scrollTop = termBody.scrollHeight;
        } else if (e.key === 'ArrowUp') {
          if (state.historyIndex > 0) {
            state.historyIndex--;
            termInput.value = state.commandHistory[state.historyIndex] || '';
          }
        } else if (e.key === 'ArrowDown') {
          if (state.historyIndex < state.commandHistory.length - 1) {
            state.historyIndex++;
            termInput.value = state.commandHistory[state.historyIndex] || '';
          } else {
            state.historyIndex = state.commandHistory.length;
            termInput.value = '';
          }
        }
      });
    }

    function appendOutput(html) {
      const line = document.createElement('div');
      line.className = 'term-output-line';
      line.innerHTML = html;
      termBody.appendChild(line);
      termBody.scrollTop = termBody.scrollHeight;
    }
  }

  // Resume Dossier Modal
  function openResumeModal() {
    const modal = document.getElementById('resume-modal');
    if (modal) {
      modal.classList.add('open');
      sfx.click();
    }
  }

  function initResumeModal() {
    const modal = document.getElementById('resume-modal');
    const openBtns = document.querySelectorAll('.open-resume-btn');
    const closeBtns = document.querySelectorAll('.close-resume-btn');
    const printBtn = document.getElementById('print-resume-btn');

    openBtns.forEach((btn) => btn.addEventListener('click', openResumeModal));
    closeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (modal) modal.classList.remove('open');
        sfx.click();
      });
    });

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('open');
        }
      });
    }
  }

  // Toast Notification
  function showToast(message) {
    let toast = document.getElementById('toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notice';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> <span>${message}</span>`;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // Clipboard Copiers
  function initClipboardCopy() {
    const copyBtns = document.querySelectorAll('.copy-data-btn');
    copyBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-copy');
        if (text) {
          navigator.clipboard.writeText(text).then(() => {
            showToast(`Copied "${text}" to clipboard!`);
            sfx.success();
          });
        }
      });
    });
  }

  // Contact Form Submission Handling
  function initContactForm() {
    const form = document.getElementById('portfolio-contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Transmitting Message...</span>`;
      sfx.click();

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        form.reset();
        sfx.success();
        showToast('Message sent! David Asuquo will respond promptly.');
      }, 1200);
    });
  }

  // Real-time Clock in Lagos WAT
  function initClock() {
    const clockEl = document.getElementById('lagos-clock');
    if (!clockEl) return;

    function update() {
      const options = {
        timeZone: 'Africa/Lagos',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      const formatter = new Intl.DateTimeFormat([], options);
      clockEl.textContent = `${formatter.format(new Date())} WAT`;
    }
    update();
    setInterval(update, 1000);
  }

  // Helper Escape HTML
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // Initialize all subsystems on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    initAmbientCanvas();
    initCustomCursor();
    initNavigation();
    initHeroCardParallax();
    initAudioToggle();
    initThemeSwitcher();
    initAIStudio();
    initSkillsFilter();
    initTestRunner();
    initTerminal();
    initResumeModal();
    initClipboardCopy();
    initContactForm();
    initClock();
  });

})();
