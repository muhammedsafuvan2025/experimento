/* vibes.js — FULLY ALIVE version */
'use strict';

// ═══════════════════════════════════════════════════════════════
//  GLOBAL AMBIENT CANVAS — runs behind everything, always
// ═══════════════════════════════════════════════════════════════
const ambientCanvas = document.getElementById('vAmbientCanvas');
const ambientCtx = ambientCanvas ? ambientCanvas.getContext('2d') : null;

let AW = 0, AH = 0;
function resizeAmbient() {
    if (!ambientCanvas) return;
    AW = ambientCanvas.width  = window.innerWidth;
    AH = ambientCanvas.height = window.innerHeight;
}
resizeAmbient();
window.addEventListener('resize', resizeAmbient);

// Particles that float across the entire page
const PARTICLES = Array.from({ length: 90 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.22,
    vy: -0.05 - Math.random() * 0.18,
    r:  0.6 + Math.random() * 1.6,
    a:  0.08 + Math.random() * 0.45,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.008 + Math.random() * 0.025,
    color: ['#5de4c7','#a78bfa','#f093b0','#60a5fa','#fbbf24'][Math.floor(Math.random()*5)],
    size: Math.random(),
}));

// Mouse spotlight state
let MX = -999, MY = -999;
document.addEventListener('mousemove', e => { MX = e.clientX; MY = e.clientY; });

// Scroll
let SCROLL_Y = 0;
window.addEventListener('scroll', () => { SCROLL_Y = window.scrollY; }, { passive: true });

function drawAmbient() {
    if (!ambientCtx) { requestAnimationFrame(drawAmbient); return; }
    ambientCtx.clearRect(0, 0, AW, AH);

    // Cursor spotlight
    if (MX > 0) {
        const spot = ambientCtx.createRadialGradient(MX, MY, 0, MX, MY, 380);
        spot.addColorStop(0,   'rgba(93,228,199,0.042)');
        spot.addColorStop(0.4, 'rgba(167,139,250,0.018)');
        spot.addColorStop(1,   'transparent');
        ambientCtx.fillStyle = spot;
        ambientCtx.fillRect(0, 0, AW, AH);
    }

    // Floating particles
    PARTICLES.forEach(p => {
        p.x  += p.vx;
        p.y  += p.vy;
        p.pulse += p.pulseSpeed;
        if (p.y < -10) { p.y = AH + 10; p.x = Math.random() * AW; }
        if (p.x < -10) p.x = AW + 10;
        if (p.x > AW + 10) p.x = -10;

        const alpha = p.a * (0.6 + 0.4 * Math.sin(p.pulse));
        ambientCtx.globalAlpha = alpha;
        ambientCtx.fillStyle = p.color;
        ambientCtx.beginPath();
        ambientCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ambientCtx.fill();

        // glow on bigger particles
        if (p.size > 0.75) {
            const g = ambientCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
            g.addColorStop(0, p.color + '44');
            g.addColorStop(1, 'transparent');
            ambientCtx.globalAlpha = alpha * 0.5;
            ambientCtx.fillStyle = g;
            ambientCtx.beginPath();
            ambientCtx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
            ambientCtx.fill();
        }
    });

    // Soft connection lines between close particles
    ambientCtx.lineWidth = 0.4;
    for (let i = 0; i < PARTICLES.length; i++) {
        for (let j = i + 1; j < PARTICLES.length; j++) {
            const dx = PARTICLES[i].x - PARTICLES[j].x;
            const dy = PARTICLES[i].y - PARTICLES[j].y;
            const d  = Math.sqrt(dx*dx + dy*dy);
            if (d < 100) {
                ambientCtx.globalAlpha = (1 - d/100) * 0.055;
                ambientCtx.strokeStyle = '#a78bfa';
                ambientCtx.beginPath();
                ambientCtx.moveTo(PARTICLES[i].x, PARTICLES[i].y);
                ambientCtx.lineTo(PARTICLES[j].x, PARTICLES[j].y);
                ambientCtx.stroke();
            }
        }
    }

    ambientCtx.globalAlpha = 1;
    requestAnimationFrame(drawAmbient);
}
requestAnimationFrame(drawAmbient);

// ═══════════════════════════════════════════════════════════════
//  HERO CANVAS — star field + shooting stars
// ═══════════════════════════════════════════════════════════════
(function() {
    const canvas = document.getElementById('v-hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;

    function resize() {
        W = canvas.width  = canvas.offsetWidth;
        H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 220 }, () => ({
        x: Math.random(), y: Math.random(),
        r: Math.random() * 1.5,
        a: 0.15 + Math.random() * 0.85,
        twinkle: Math.random() * Math.PI * 2,
        ts: 0.008 + Math.random() * 0.028,
        speed: 0.08 + Math.random() * 0.5,
        col: ['#fff','#cde8ff','#ffd6f0','#d0f4ff','#fff8dc'][Math.floor(Math.random()*5)],
    }));

    // Shooting star state
    const shoots = [];
    let shootTimer = 0;

    let t = 0, lmx = W/2, lmy = H/2, tmx = W/2, tmy = H/2;
    canvas.parentElement.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect();
        tmx = e.clientX - r.left; tmy = e.clientY - r.top;
    });

    function draw() {
        ctx.clearRect(0, 0, W, H);
        t += 0.016;
        lmx += (tmx - lmx) * 0.05;
        lmy += (tmy - lmy) * 0.05;

        // Stars with parallax
        stars.forEach(s => {
            s.twinkle += s.ts;
            const bright = s.a * (0.55 + 0.45 * Math.sin(s.twinkle));
            const px = (lmx - W/2) * s.speed * 0.004;
            const py = (lmy - H/2) * s.speed * 0.004;
            const sx = s.x * W + px, sy = s.y * H + py;

            ctx.globalAlpha = bright;
            ctx.fillStyle = s.col;
            ctx.beginPath();
            ctx.arc(sx, sy, s.r, 0, Math.PI*2);
            ctx.fill();
        });

        // Shoot stars
        shootTimer += 0.016;
        if (shootTimer > 5 + Math.random() * 4) {
            shootTimer = 0;
            shoots.push({
                x: Math.random() * W * 0.6 + W * 0.1,
                y: Math.random() * H * 0.4,
                vx: 6 + Math.random() * 5,
                vy: 2 + Math.random() * 3,
                len: 90 + Math.random() * 80,
                life: 1,
            });
        }
        shoots.forEach((s, i) => {
            s.x += s.vx; s.y += s.vy; s.life -= 0.04;
            if (s.life <= 0) { shoots.splice(i, 1); return; }
            const trail = ctx.createLinearGradient(s.x - s.vx*s.len/s.vx, s.y - s.vy*s.len/s.vx, s.x, s.y);
            trail.addColorStop(0, 'rgba(255,255,255,0)');
            trail.addColorStop(1, `rgba(255,255,255,${s.life * 0.8})`);
            ctx.globalAlpha = s.life;
            ctx.strokeStyle = trail;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(s.x - s.vx * 14, s.y - s.vy * 14);
            ctx.lineTo(s.x, s.y);
            ctx.stroke();
        });

        ctx.globalAlpha = 1;
        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
})();

// ═══════════════════════════════════════════════════════════════
//  CUSTOM CURSOR
// ═══════════════════════════════════════════════════════════════
(function() {
    const dot  = document.getElementById('vCursorDot');
    const ring = document.getElementById('vCursorRing');
    if (!dot || !ring) return;

    let rx = 0, ry = 0;
    function tick() {
        rx += (MX - rx) * 0.13; ry += (MY - ry) * 0.13;
        dot.style.left  = MX + 'px'; dot.style.top  = MY + 'px';
        ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    document.querySelectorAll('a,button,.v-film-card,.v-series-card,.v-rabbit,.v-player,.v-mood,.v-ht,.v-shot-preview,.v-director,.v-pill,.v-goat-card,.v-utd-hero').forEach(el => {
        el.addEventListener('mouseenter', () => {
            ring.style.width = '54px'; ring.style.height = '54px';
            ring.style.borderColor = 'rgba(240,147,176,0.6)';
            ring.style.mixBlendMode = 'screen';
            dot.style.background = '#f093b0'; dot.style.transform = 'translate(-50%,-50%) scale(1.6)';
        });
        el.addEventListener('mouseleave', () => {
            ring.style.width = '32px'; ring.style.height = '32px';
            ring.style.borderColor = 'rgba(93,228,199,0.5)';
            ring.style.mixBlendMode = '';
            dot.style.background = '#5de4c7'; dot.style.transform = 'translate(-50%,-50%) scale(1)';
        });
    });
})();

// ═══════════════════════════════════════════════════════════════
//  SCROLL-DRIVEN PARALLAX — section titles + bg layers
// ═══════════════════════════════════════════════════════════════
(function() {
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    function onScroll() {
        parallaxEls.forEach(el => {
            const speed  = parseFloat(el.dataset.parallax) || 0.3;
            const rect   = el.getBoundingClientRect();
            const center = rect.top + rect.height / 2 - window.innerHeight / 2;
            el.style.transform = `translateY(${(center * speed).toFixed(2)}px)`;
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();

// ═══════════════════════════════════════════════════════════════
//  SCROLL PROGRESS BAR
// ═══════════════════════════════════════════════════════════════
(function() {
    const bar = document.getElementById('vScrollBar');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const pct = SCROLL_Y / (document.body.scrollHeight - window.innerHeight) * 100;
        bar.style.width = Math.min(100, pct).toFixed(2) + '%';
    }, { passive: true });
})();

// ═══════════════════════════════════════════════════════════════
//  SECTION BIG-TEXT SCROLL SCRUB
// ═══════════════════════════════════════════════════════════════
(function() {
    const scrubs = document.querySelectorAll('.v-scrub-text');
    function update() {
        scrubs.forEach(el => {
            const rect = el.getBoundingClientRect();
            const pct  = 1 - Math.max(0, Math.min(1, rect.bottom / (window.innerHeight + rect.height)));
            el.style.transform  = `translateX(${(pct - 0.5) * -80}px)`;
            el.style.opacity    = 0.04 + pct * 0.04;
        });
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
})();

// ═══════════════════════════════════════════════════════════════
//  SCROLL REVEAL — staggered
// ═══════════════════════════════════════════════════════════════
(function() {
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.v-reveal').forEach(el => io.observe(el));
})();

// ═══════════════════════════════════════════════════════════════
//  3D TILT on cards — perspective enabled per-card
// ═══════════════════════════════════════════════════════════════
(function() {
    document.querySelectorAll('.v-tilt').forEach(card => {
        card.style.transformStyle = 'preserve-3d';
        card.style.perspective = '800px';
        const MAX = parseFloat(card.dataset.tiltMax) || 8;

        let raf = null, tx = 0, ty = 0, cx = 0, cy = 0;

        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            tx = ((e.clientX - r.left) / r.width  - 0.5) * MAX * 2;
            ty = -((e.clientY - r.top)  / r.height - 0.5) * MAX * 2;
        });

        card.addEventListener('mouseleave', () => { tx = 0; ty = 0; });

        function animate() {
            cx += (tx - cx) * 0.1; cy += (ty - cy) * 0.1;
            card.style.transform = `perspective(800px) rotateX(${cy.toFixed(2)}deg) rotateY(${cx.toFixed(2)}deg) translateZ(8px)`;
            if (Math.abs(cx) > 0.01 || Math.abs(cy) > 0.01 || Math.abs(tx) > 0.01 || Math.abs(ty) > 0.01) {
                raf = requestAnimationFrame(animate);
            } else {
                card.style.transform = '';
                raf = null;
            }
        }

        card.addEventListener('mousemove', () => { if (!raf) raf = requestAnimationFrame(animate); });
        card.addEventListener('mouseleave', () => { if (!raf) raf = requestAnimationFrame(animate); });
    });
})();

// ═══════════════════════════════════════════════════════════════
//  FILM REEL — drag + momentum
// ═══════════════════════════════════════════════════════════════
(function() {
    const reel = document.getElementById('filmReel');
    if (!reel) return;
    let isDown = false, startX, scrollLeft, velX = 0, lastX = 0, rafId;

    reel.addEventListener('mousedown', e => {
        isDown = true; startX = e.pageX - reel.offsetLeft;
        scrollLeft = reel.scrollLeft; velX = 0; lastX = e.pageX;
        cancelAnimationFrame(rafId);
    });
    window.addEventListener('mouseup', () => { isDown = false; glide(); });
    reel.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        velX = e.pageX - lastX; lastX = e.pageX;
        reel.scrollLeft = scrollLeft - (e.pageX - reel.offsetLeft - startX) * 1.4;
    });

    function glide() {
        if (Math.abs(velX) < 0.5) return;
        reel.scrollLeft -= velX;
        velX *= 0.94;
        rafId = requestAnimationFrame(glide);
    }
})();

// ═══════════════════════════════════════════════════════════════
//  WAVEFORM BARS
// ═══════════════════════════════════════════════════════════════
(function() {
    const wf = document.getElementById('vWaveform');
    if (!wf) return;
    for (let i = 0; i < 48; i++) {
        const b = document.createElement('div');
        b.className = 'v-waveform-bar';
        b.style.animationDelay    = (i * 0.026).toFixed(3) + 's';
        b.style.animationDuration = (0.6 + Math.random() * 0.9).toFixed(2) + 's';
        wf.appendChild(b);
    }
})();

// ═══════════════════════════════════════════════════════════════
//  COUNTRY COUNTER
// ═══════════════════════════════════════════════════════════════
(function() {
    const numEl = document.getElementById('vCountryNum');
    const fillEl = document.getElementById('vCountryFill');
    if (!numEl || !fillEl) return;
    let done = false;
    const io = new IntersectionObserver(([e]) => {
        if (e.isIntersecting && !done) {
            done = true;
            let n = 0;
            const tick = () => { numEl.textContent = ++n; if (n < 7) setTimeout(tick, 130); };
            setTimeout(tick, 300);
            setTimeout(() => { fillEl.style.width = ((7/193)*100).toFixed(2) + '%'; }, 400);
        }
    }, { threshold: 0.3 });
    io.observe(numEl);
})();

// ═══════════════════════════════════════════════════════════════
//  TRACK FILL ANIMATION
// ═══════════════════════════════════════════════════════════════
(function() {
    document.querySelectorAll('.v-track-fill').forEach(f => {
        const w = f.style.width; f.style.width = '0%';
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setTimeout(() => { f.style.width = w; }, 250); io.unobserve(f); }
        }, { threshold: 0.5 });
        io.observe(f);
    });
})();

// ═══════════════════════════════════════════════════════════════
//  SATURN PARALLAX on goat card
// ═══════════════════════════════════════════════════════════════
(function() {
    const goat   = document.querySelector('.v-goat-card');
    const system = document.querySelector('.v-saturn-system');
    if (!goat || !system) return;
    let ox = 0, oy = 0, tx2 = 0, ty2 = 0, raf;

    goat.addEventListener('mousemove', e => {
        const r = goat.getBoundingClientRect();
        tx2 = ((e.clientX - r.left)/r.width  - 0.5) * 26;
        ty2 = ((e.clientY - r.top) /r.height - 0.5) * 26;
        if (!raf) raf = requestAnimationFrame(satAnim);
    });
    goat.addEventListener('mouseleave', () => { tx2 = 0; ty2 = 0; if (!raf) raf = requestAnimationFrame(satAnim); });

    function satAnim() {
        ox += (tx2 - ox) * 0.08; oy += (ty2 - oy) * 0.08;
        system.style.transform = `translate(${ox.toFixed(1)}px,${oy.toFixed(1)}px)`;
        if (Math.abs(ox - tx2) > 0.05 || Math.abs(oy - ty2) > 0.05) {
            raf = requestAnimationFrame(satAnim);
        } else { raf = null; }
    }
})();

// ═══════════════════════════════════════════════════════════════
//  FLOATING NAV — active section
// ═══════════════════════════════════════════════════════════════
(function() {
    const items = document.querySelectorAll('.v-nav-item');
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                items.forEach(n => n.classList.remove('active'));
                const m = document.querySelector(`.v-nav-item[href="#${e.target.id}"]`);
                if (m) m.classList.add('active');
            }
        });
    }, { threshold: 0.35, rootMargin: '-5% 0px -55% 0px' });
    ['home','cinema','series','football','music','lens','mind'].forEach(id => {
        const el = document.getElementById(id); if (el) io.observe(el);
    });
})();

// ═══════════════════════════════════════════════════════════════
//  MAGNETIC HOVER on pills & CTA
// ═══════════════════════════════════════════════════════════════
(function() {
    document.querySelectorAll('.v-pill, .v-footer-cta, .v-back').forEach(btn => {
        let ax = 0, ay = 0, tx3 = 0, ty3 = 0, inside = false, raf;

        function anim() {
            ax += (tx3 - ax) * 0.16; ay += (ty3 - ay) * 0.16;
            btn.style.transform = `translate(${ax.toFixed(2)}px,${ay.toFixed(2)}px)`;
            if (Math.abs(ax-tx3) > 0.1 || Math.abs(ay-ty3) > 0.1 || inside) {
                raf = requestAnimationFrame(anim);
            } else { btn.style.transform = ''; raf = null; }
        }

        document.addEventListener('mousemove', e => {
            const r = btn.getBoundingClientRect();
            const cx = r.left + r.width/2, cy = r.top + r.height/2;
            const dx = e.clientX - cx, dy = e.clientY - cy;
            const d  = Math.sqrt(dx*dx + dy*dy);
            if (d < 100) {
                inside = true;
                tx3 = dx * (1 - d/100) * 0.35;
                ty3 = dy * (1 - d/100) * 0.35;
                if (!raf) raf = requestAnimationFrame(anim);
            } else if (inside) {
                inside = false; tx3 = 0; ty3 = 0;
                if (!raf) raf = requestAnimationFrame(anim);
            }
        });
    });
})();

// ═══════════════════════════════════════════════════════════════
//  TEXT SCRAMBLE on section headings (on scroll into view)
// ═══════════════════════════════════════════════════════════════
(function() {
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';

    function scramble(el) {
        const original = el.textContent;
        let iteration  = 0;
        const total    = original.length * 3;
        function tick() {
            el.textContent = original.split('').map((ch, i) => {
                if (ch === ' ') return ' ';
                if (i < Math.floor(iteration / 3)) return original[i];
                return CHARS[Math.floor(Math.random() * CHARS.length)];
            }).join('');
            iteration++;
            if (iteration <= total) requestAnimationFrame(tick);
            else el.textContent = original;
        }
        requestAnimationFrame(tick);
    }

    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { scramble(e.target); io.unobserve(e.target); }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.v-scramble').forEach(el => io.observe(el));
})();

// ═══════════════════════════════════════════════════════════════
//  UTD LOGO pulse on hover
// ═══════════════════════════════════════════════════════════════
(function() {
    const logo = document.querySelector('.v-utd-logo');
    if (!logo) return;
    logo.addEventListener('mouseenter', () => { logo.style.animation = 'none'; });
    logo.addEventListener('mouseleave', () => { logo.style.animation  = ''; });
})();

// ═══════════════════════════════════════════════════════════════
//  SHOT PREVIEWS — cursor spotlight inside each card
// ═══════════════════════════════════════════════════════════════
(function() {
    document.querySelectorAll('.v-shot-preview').forEach(p => {
        p.addEventListener('mousemove', e => {
            const r = p.getBoundingClientRect();
            const x = ((e.clientX - r.left)/r.width  * 100).toFixed(1);
            const y = ((e.clientY - r.top) /r.height * 100).toFixed(1);
            p.style.setProperty('--sx', x + '%');
            p.style.setProperty('--sy', y + '%');
        });
        p.addEventListener('mouseleave', () => {
            p.style.setProperty('--sx', '50%'); p.style.setProperty('--sy', '50%');
        });
    });
})();

// ═══════════════════════════════════════════════════════════════
//  HERO TITLE — word-by-word kinetic reveal
// ═══════════════════════════════════════════════════════════════
(function() {
    const title = document.querySelector('.v-hero-title');
    if (!title) return;

    // Wrap each word's chars in spans
    const words = title.querySelectorAll('.vht-word');
    words.forEach((w, wi) => {
        const text = w.textContent;
        if (w.querySelector('span')) return;
        w.textContent = '';
        [...text].forEach((ch, ci) => {
            const s = document.createElement('span');
            s.textContent = ch === ' ' ? ' ' : ch;
            s.style.cssText = `display:inline-block; opacity:0; transform:translateY(40px) rotate(${(Math.random()-0.5)*12}deg);
            transition: opacity 0.6s ease ${(wi*0.3 + ci*0.045).toFixed(3)}s,
                        transform 0.7s cubic-bezier(0.23,1,0.32,1) ${(wi*0.3 + ci*0.045).toFixed(3)}s;`;
            w.appendChild(s);
        });
    });

    // Trigger after 200ms
    setTimeout(() => {
        title.querySelectorAll('.vht-word span').forEach(s => {
            s.style.opacity   = '1';
            s.style.transform = 'translateY(0) rotate(0deg)';
        });
    }, 200);
})();
