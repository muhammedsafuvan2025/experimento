
// ============================================================
//  THEME — dark only
// ============================================================
const html = document.documentElement;
html.setAttribute('data-theme', 'dark');
localStorage.setItem('theme', 'dark');

// ============================================================
//  SOUND ENGINE
// ============================================================
let audioCtx = null;
let soundEnabled = true;

function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

function playSound(type) {
    if (!soundEnabled) return;
    try {
        const ctx = getAudioCtx();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        if (type === 'click') {
            o.type = 'sine';
            o.frequency.setValueAtTime(880, ctx.currentTime);
            o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.08);
            g.gain.setValueAtTime(0.08, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
            o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.08);
        } else if (type === 'hover') {
            o.type = 'sine';
            o.frequency.setValueAtTime(660, ctx.currentTime);
            g.gain.setValueAtTime(0.04, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
            o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.05);
        } else if (type === 'whoosh') {
            o.type = 'sawtooth';
            o.frequency.setValueAtTime(200, ctx.currentTime);
            o.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
            g.gain.setValueAtTime(0.06, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.15);
        } else if (type === 'particle') {
            o.type = 'sine';
            o.frequency.setValueAtTime(1200, ctx.currentTime);
            o.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
            g.gain.setValueAtTime(0.05, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.2);
        }
    } catch(e) {}
}

// ============================================================
//  MUTE TOGGLE
// ============================================================
function initMuteToggle() {
    const btn = document.createElement('button');
    btn.id = 'muteBtn';
    btn.setAttribute('aria-label', 'Toggle sound');
    btn.innerHTML = '🔊';
    btn.style.cssText = '';
    btn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        btn.innerHTML = soundEnabled ? '🔊' : '🔇';
        playSound('click');
    });
    document.body.appendChild(btn);
}

// ============================================================
//  PORTRAIT PARALLAX + BRIGHTNESS REACT
// ============================================================
function initPortraitParallax() {
    const portrait = document.querySelector('.portrait-bg');
    if (!portrait) return;
    let mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', (e) => {
        mx = (e.clientX / window.innerWidth  - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    function tick() {
        cx += (mx - cx) * 0.04;
        cy += (my - cy) * 0.04;
        portrait.style.transform = `translate(${cx * 18}px, ${cy * 12}px) scale(1.06)`;
        const rawX = (mx + 1) / 2;
        const prox = Math.max(0, rawX - 0.35) / 0.65;
        portrait.style.filter  = `grayscale(100%) blur(0.5px) brightness(${(1 + prox * 1.4).toFixed(2)})`;
        portrait.style.opacity = (0.18 + prox * 0.18).toFixed(3);
        requestAnimationFrame(tick);
    }
    tick();
}

// ============================================================
//  SPOTLIGHT
// ============================================================
let spotlightRaf = null;
window.addEventListener('mousemove', (e) => {
    if (spotlightRaf) return;
    spotlightRaf = requestAnimationFrame(() => {
        document.body.classList.add('spotlight-on');
        document.documentElement.style.setProperty('--mx', `${(e.clientX/window.innerWidth)*100}%`);
        document.documentElement.style.setProperty('--my', `${(e.clientY/window.innerHeight)*100}%`);
        spotlightRaf = null;
    });
});
window.addEventListener('mouseleave', () => document.body.classList.remove('spotlight-on'));

// ============================================================
//  GLITCH EFFECT
// ============================================================
function initGlitch() {
    // Only glitch the full name element, not individual hero lines
    const nameEl = document.querySelector('.glitch-name:not(.hf-line)') 
                || document.querySelector('.gradient-text:not(.hf-line)');
    if (!nameEl) return;
    nameEl.setAttribute('data-text', nameEl.textContent);
    function doGlitch() {
        nameEl.classList.add('glitching');
        setTimeout(() => nameEl.classList.remove('glitching'), 400);
        setTimeout(doGlitch, 3000 + Math.random() * 4000);
    }
    setTimeout(doGlitch, 2500);
}

// ============================================================
//  SCRAMBLE TEXT
// ============================================================
function scrambleText(el, finalText, duration) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&';
    const steps = 30;
    let frame = 0;
    const timer = setInterval(() => {
        frame++;
        const progress = frame / steps;
        let result = '';
        for (let i = 0; i < finalText.length; i++) {
            if (finalText[i] === ' ') { result += ' '; continue; }
            if (i / finalText.length < progress) result += finalText[i];
            else result += chars[Math.floor(Math.random() * chars.length)];
        }
        el.textContent = result;
        if (frame >= steps) { clearInterval(timer); el.textContent = finalText; }
    }, duration / steps);
}

function initScramble() {
    // Only scramble a non-hf-line gradient text element
    const nameEl = document.querySelector('.gradient-text:not(.hf-line)');
    if (!nameEl) return;
    const original = nameEl.textContent;
    setTimeout(() => scrambleText(nameEl, original, 1400), 1900);
}

// ============================================================
//  PARTICLE EXPLOSION
// ============================================================
function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particleCanvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9998;';
    document.body.appendChild(canvas);
    const ctx2 = canvas.getContext('2d');
    let particles = [];
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);
    class Particle {
        constructor(x, y) {
            this.x = x; this.y = y;
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 5;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed - 1.5;
            this.life = 1;
            this.decay = 0.02 + Math.random() * 0.025;
            this.size = 2 + Math.random() * 4;
            this.color = `hsla(${130 + Math.random() * 20}, 80%, 55%,`;
        }
        update() { this.x += this.vx; this.y += this.vy; this.vy += 0.15; this.life -= this.decay; }
        draw() {
            ctx2.beginPath();
            ctx2.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
            ctx2.fillStyle = this.color + this.life + ')';
            ctx2.fill();
        }
    }
    document.addEventListener('click', (e) => {
        playSound('particle');
        for (let i = 0; i < 28; i++) particles.push(new Particle(e.clientX, e.clientY));
    });
    function loop() {
        ctx2.clearRect(0, 0, canvas.width, canvas.height);
        particles = particles.filter(p => p.life > 0);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(loop);
    }
    loop();
}

// ============================================================
//  SKILL CHARGE-UP
// ============================================================
// [REMOVED] Skill charge-up animation — unnecessary with terminal-only approach

// ============================================================
//  TERMINAL BLOCK
// ============================================================
// [REMOVED] Auto-typing terminal — replaced by live interactive terminal only

// ============================================================
//  MATRIX EMAIL DECODE
// ============================================================
function initMatrixEmail() {
    const matrixChars = 'アイウエオカキクケコサシスセソタチツテトABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        const original = link.textContent;
        let decoding = false;
        link.addEventListener('mouseenter', () => {
            if (decoding) return;
            decoding = true;
            playSound('whoosh');
            let frame = 0;
            const totalFrames = 18;
            const timer = setInterval(() => {
                frame++;
                const progress = frame / totalFrames;
                let result = '';
                for (let i = 0; i < original.length; i++) {
                    if (['@', '.', ' '].includes(original[i])) { result += original[i]; continue; }
                    if (i / original.length < progress) result += original[i];
                    else result += matrixChars[Math.floor(Math.random() * matrixChars.length)];
                }
                link.textContent = result;
                if (frame >= totalFrames) { clearInterval(timer); link.textContent = original; decoding = false; }
            }, 45);
        });
    });
}

// ============================================================
//  COMMAND PALETTE
// ============================================================
function initCommandPalette() {
    const cmdBtn = document.getElementById('cmdBtn');
    const cmdk = document.getElementById('cmdk');
    const cmdkInput = document.getElementById('cmdkInput');
    const cmdkList = document.getElementById('cmdkList');
    if (!cmdBtn || !cmdk || !cmdkInput || !cmdkList) return;
    const actions = [
        { id:'resume', label:'Open Résumé (PDF)', sub:'assets/Muhammed-Safuvan-resume.pdf', icon:'📄', kbd:'R', run:()=>window.open('assets/Muhammed-Safuvan-resume.pdf','_blank','noopener,noreferrer') },
        { id:'email', label:'Email Muhammed', sub:'muhammedsafuvan1999@gmail.com', icon:'✉️', kbd:'E', run:()=>window.location.href='mailto:muhammedsafuvan1999@gmail.com' },
        { id:'safesurf', label:'Open Safe Surf website', sub:'GitHub Pages demo', icon:'🔒', kbd:'S', run:()=>window.open('https://muhammedsafuvan2025.github.io/safeSurfWebsite/#','_blank','noopener,noreferrer') },
        { id:'home', label:'Go to Home', sub:'Hero section', icon:'🏠', kbd:'H', run:()=>document.querySelector('#home')?.scrollIntoView({behavior:'smooth'}) },
        { id:'about', label:'Go to About', sub:'Summary', icon:'👤', kbd:'A', run:()=>document.querySelector('#about')?.scrollIntoView({behavior:'smooth'}) },
        { id:'skills', label:'Go to Skills', sub:'Technical stack', icon:'🧠', kbd:'K', run:()=>document.querySelector('#skills')?.scrollIntoView({behavior:'smooth'}) },
        { id:'experience', label:'Go to Experience', sub:'Roles', icon:'🧰', kbd:'X', run:()=>document.querySelector('#experience')?.scrollIntoView({behavior:'smooth'}) },
        { id:'projects', label:'Go to Projects', sub:'Featured builds', icon:'🧪', kbd:'P', run:()=>document.querySelector('#projects')?.scrollIntoView({behavior:'smooth'}) },
        { id:'education', label:'Go to Education', sub:'Schools', icon:'🎓', kbd:'D', run:()=>document.querySelector('#education')?.scrollIntoView({behavior:'smooth'}) },
        { id:'contact', label:'Go to Contact', sub:'Get in touch', icon:'☎️', kbd:'C', run:()=>document.querySelector('#contact')?.scrollIntoView({behavior:'smooth'}) },
    ];
    let filtered = [...actions], activeIndex = 0;
    function render() {
        cmdkList.innerHTML = '';
        filtered.forEach((a, idx) => {
            const item = document.createElement('div');
            item.className = 'cmdk-item' + (idx===activeIndex?' active':'');
            item.setAttribute('role','option'); item.dataset.id = a.id;
            item.innerHTML = '<div class="left"><div class="cmdk-icon">'+a.icon+'</div><div><div>'+a.label+'</div><div class="cmdk-sub">'+a.sub+'</div></div></div><div class="cmdk-kbd">'+a.kbd+'</div>';
            item.addEventListener('click', () => { a.run(); closeCmdk(); playSound('click'); });
            cmdkList.appendChild(item);
        });
    }
    function openCmdk() { cmdk.hidden=false; document.body.style.overflow='hidden'; cmdkInput.value=''; filtered=[...actions]; activeIndex=0; render(); setTimeout(()=>cmdkInput.focus(),0); playSound('whoosh'); }
    function closeCmdk() { cmdk.hidden=true; document.body.style.overflow=''; }
    function toggleCmdk() { cmdk.hidden ? openCmdk() : closeCmdk(); }
    cmdBtn.addEventListener('click', openCmdk);
    cmdk.addEventListener('click', e => { if (e.target?.getAttribute?.('data-cmdk-close')==='true') closeCmdk(); });
    cmdkInput.addEventListener('input', () => { const q=cmdkInput.value.trim().toLowerCase(); filtered=actions.filter(a=>(a.label+' '+a.sub).toLowerCase().includes(q)); activeIndex=0; render(); });
    window.addEventListener('keydown', e => {
        if ((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k') { e.preventDefault(); toggleCmdk(); return; }
        if (cmdk.hidden) return;
        if (e.key==='Escape') { e.preventDefault(); closeCmdk(); return; }
        if (e.key==='ArrowDown') { e.preventDefault(); activeIndex=Math.min(activeIndex+1,Math.max(filtered.length-1,0)); render(); return; }
        if (e.key==='ArrowUp') { e.preventDefault(); activeIndex=Math.max(activeIndex-1,0); render(); return; }
        if (e.key==='Enter') { e.preventDefault(); filtered[activeIndex]?.run(); closeCmdk(); return; }
        const a=actions.find(x=>x.kbd===e.key.toUpperCase());
        if (a) { e.preventDefault(); a.run(); closeCmdk(); }
    });
}

// ============================================================
//  NAV + SCROLL + MOBILE
// ============================================================
const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');
hamburger.addEventListener('click', () => { hamburger.classList.toggle('active'); navMenu.classList.toggle('active'); playSound('click'); });
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => { hamburger.classList.remove('active'); navMenu.classList.remove('active'); });
    link.addEventListener('mouseenter', () => playSound('hover'));
});
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        if (window._lenis) return; // Lenis handles it
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    });
});

const navbar = document.querySelector('.navbar');
const scrollProgressBar = document.querySelector('.scroll-progress-bar');
const scrollTopBtn = document.getElementById('scrollTopBtn');
window.addEventListener('scroll', () => {
    if (window._lenis) return;
    const s = window.pageYOffset;
    const d = document.documentElement.scrollHeight - window.innerHeight;
    navbar.style.boxShadow = s > 100 ? '0 4px 6px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.1)';
    if (scrollProgressBar) scrollProgressBar.style.width = (d>0?(s/d)*100:0) + '%';
    if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', s > 400);
    document.querySelectorAll('section[id]').forEach(section => {
        const top = section.offsetTop - 100;
        if (s > top && s <= top + section.offsetHeight) {
            document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
            document.querySelector('.nav-link[href="#'+section.id+'"]')?.classList.add('active');
        }
    });
});
scrollTopBtn?.addEventListener('click', () => { if (!window._lenis) window.scrollTo({top:0,behavior:'smooth'}); playSound('click'); });

// ============================================================
//  INTERSECTION OBSERVER
// ============================================================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.style.opacity='1'; entry.target.style.transform='translateY(0)'; }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

// ============================================================
//  3D TILT
// ============================================================
function attachTilt(el) {
    if (!el) return;
    el.classList.add('tilt');
    if (!el.querySelector('.tilt-glare')) { const glare=document.createElement('div'); glare.className='tilt-glare'; el.appendChild(glare); }
    const max = 10;
    el.addEventListener('mousemove', e => {
        const r=el.getBoundingClientRect();
        const px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
        el.style.transform=`perspective(900px) rotateX(${((py-0.5)*-max).toFixed(2)}deg) rotateY(${((px-0.5)*max).toFixed(2)}deg) translateY(-2px)`;
        el.style.setProperty('--gx',px*100+'%'); el.style.setProperty('--gy',py*100+'%');
    });
    el.addEventListener('mouseleave', () => el.style.transform='');
    el.addEventListener('mouseenter', () => playSound('hover'));
}

// ============================================================
//  BUTTON SOUNDS
// ============================================================
function initButtonSounds() {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => playSound('hover'));
        btn.addEventListener('click', () => playSound('click'));
    });
}

// Active nav style
const styleEl = document.createElement('style');
styleEl.textContent = '.nav-link.active{color:var(--accent-primary)}.nav-link.active::after{width:100%}';
document.head.appendChild(styleEl);


// ============================================================
//  CUSTOM CURSOR
// ============================================================
function initCustomCursor() {
    const dot  = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot) return;
    if (ring) ring.style.display = 'none';

    // Disable on touch/mobile devices
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        dot.style.display = 'none';
        return;
    }
    if (window.innerWidth < 768) { dot.style.display = 'none'; return; }

    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateDot() {
        dotX += (mouseX - dotX) * 0.18;
        dotY += (mouseY - dotY) * 0.18;
        dot.style.left = dotX + 'px';
        dot.style.top  = dotY + 'px';
        requestAnimationFrame(animateDot);
    }
    animateDot();

    const interactiveEls = 'a, button, .btn, .nav-link, .cmd-btn, .scroll-top, #muteBtn';
    document.addEventListener('mouseover', e => {
        if (e.target.closest(interactiveEls)) {
            document.body.classList.add('cursor-hover');
        } else {
            document.body.classList.remove('cursor-hover');
        }
    });

    document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
    document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));
    document.addEventListener('mouseleave', () => dot.style.opacity = '0');
    document.addEventListener('mouseenter', () => dot.style.opacity = '1');
}

// ============================================================
//  HERO TEXT ROTATOR
// ============================================================
function initHeroRotator() {
    const el = document.getElementById('hfRotate');
    if (!el) return;
    const lines = [
        'Built a drone. Moved continents. Now debugging yours.',
        'Active Directory · M365 · Azure · Networking',
        'Thermal-imaging drone engineer turned sysadmin.',
        'CompTIA A+ · AWS · Python · Linux CLI',
        'From Kerala to Canada — same drive, new latitude.',
        'Your next IT hire is scrolling below.',
    ];
    let idx = 0;
    el.textContent = lines[0];
    setInterval(() => {
        el.classList.add('out');
        setTimeout(() => {
            idx = (idx + 1) % lines.length;
            el.textContent = lines[idx];
            el.classList.remove('out');
        }, 350);
    }, 4000);
}

// ============================================================
//  LIVE INTERACTIVE TERMINAL
// ============================================================
function initLiveTerminal() {
    const body = document.getElementById('liveTermBody');
    const input = document.getElementById('termInput');
    const suggestions = document.getElementById('termSuggestions');
    if (!body || !input) return;

    const COMMANDS = {
        help: () => [
            { t:'heading', s:'Available commands:' },
            { t:'info', s:'  help              — show this menu' },
            { t:'info', s:'  whoami            — about me' },
            { t:'info', s:'  skills            — technical skills' },
            { t:'info', s:'  skills --cloud    — cloud & devops' },
            { t:'info', s:'  skills --networking — networking' },
            { t:'info', s:'  skills --tools    — daily tools' },
            { t:'info', s:'  certifications    — certs' },
            { t:'info', s:'  contact           — reach me' },
            { t:'info', s:'  ping <host>       — try it' },
            { t:'info', s:'  clear             — wipe the screen' },
        ],
        whoami: () => [
            { t:'out', s:'Muhammed Safuvan' },
            { t:'info', s:'System Administrator & IT Support Specialist' },
            { t:'info', s:'London, ON, Canada' },
            { t:'dim', s:'B.Tech ECE (CUSAT) → PGC BISA (Fanshawe)' },
        ],
        skills: () => [
            { t:'table-row', s:'<span class="col-label">OS</span> Windows Server, Win 10/11, Ubuntu, macOS' },
            { t:'table-row', s:'<span class="col-label">Identity</span> Active Directory, Azure AD, M365 Admin' },
            { t:'table-row', s:'<span class="col-label">Cloud</span> AWS (EC2, S3, IAM, Lambda), Azure, Docker' },
            { t:'table-row', s:'<span class="col-label">Networking</span> TCP/IP, DNS, DHCP, VPN, LAN/Wi-Fi' },
            { t:'table-row', s:'<span class="col-label">Scripting</span> Python, Bash, PowerShell, JavaScript' },
            { t:'table-row', s:'<span class="col-label">Data</span> SQL, Power BI (DAX), Excel, Pandas' },
            { t:'table-row', s:'<span class="col-label">Databases</span> MySQL, PostgreSQL, MongoDB, SQLite' },
            { t:'table-row', s:'<span class="col-label">Tools</span> VS Code, GitHub, JIRA, ServiceNow, Postman' },
            { t:'dim', s:'Try: skills --cloud, skills --networking, skills --tools' },
        ],
        'skills --cloud': () => [
            { t:'out', s:'AWS — EC2, S3, IAM, Lambda, CloudWatch' },
            { t:'out', s:'Azure — Azure AD, basic VM provisioning' },
            { t:'out', s:'Docker — Dockerfile, docker-compose' },
            { t:'out', s:'GitHub Actions — CI/CD pipelines' },
        ],
        'skills --networking': () => [
            { t:'out', s:'TCP/IP, DNS, DHCP, VPN, LAN/WLAN' },
            { t:'out', s:'Subnetting — CIDR, VLSM' },
            { t:'out', s:'Switching, VLANs, wireless config' },
        ],
        'skills --tools': () => [
            { t:'out', s:'VS Code · GitHub · JIRA · ServiceNow' },
            { t:'out', s:'Postman · Wireshark · PuTTY · WinSCP' },
            { t:'out', s:'PowerShell · Bash · Python REPL' },
            { t:'out', s:'RDP · SSH · Remote Desktop Manager' },
        ],
        certifications: () => [
            { t:'out', s:'CompTIA A+ — Core 1 & Core 2 (Certified)' },
            { t:'out', s:'PGC — Business & Information Systems Architecture' },
            { t:'out', s:'B.Tech ECE — CUSAT, Kochi' },
            { t:'dim', s:'Next: AWS Cloud Practitioner' },
        ],
        contact: () => [
            { t:'out', s:'muhammedsafuvan1999@gmail.com' },
            { t:'out', s:'+1 (226) 977-8208' },
            { t:'out', s:'London, ON, Canada' },
            { t:'out', s:'linkedin.com/in/muhammed-safuvan-b81312189' },
        ],
        clear: () => 'CLEAR',
    };

    // Ping handler
    function handlePing(host) {
        const ms = (Math.random() * 30 + 5).toFixed(1);
        const ms2 = (Math.random() * 30 + 5).toFixed(1);
        const ms3 = (Math.random() * 30 + 5).toFixed(1);
        return [
            { t:'out', s:`PING ${host} (${Math.floor(Math.random()*200)+10}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}): 56 data bytes` },
            { t:'out', s:`64 bytes from ${host}: icmp_seq=0 ttl=64 time=${ms} ms` },
            { t:'out', s:`64 bytes from ${host}: icmp_seq=1 ttl=64 time=${ms2} ms` },
            { t:'out', s:`64 bytes from ${host}: icmp_seq=2 ttl=64 time=${ms3} ms` },
            { t:'dim', s:`--- ${host} ping statistics --- 3 packets transmitted, 3 received, 0.0% packet loss` },
        ];
    }

    function addLines(lines) {
        lines.forEach((l, i) => {
            setTimeout(() => {
                const div = document.createElement('div');
                div.className = 'term-line ' + l.t;
                div.innerHTML = l.s;
                body.appendChild(div);
                body.scrollTop = body.scrollHeight;
            }, i * 35);
        });
    }

    function execute(raw) {
        const cmd = raw.trim().toLowerCase();
        if (!cmd) return;

        // Show the command
        const cmdLine = document.createElement('div');
        cmdLine.className = 'term-line cmd';
        cmdLine.innerHTML = `<span class="t-prompt">$ </span>${raw.trim()}`;
        body.appendChild(cmdLine);

        if (cmd === 'clear') {
            body.innerHTML = '';
            return;
        }

        if (cmd.startsWith('ping ')) {
            const host = raw.trim().slice(5).trim() || 'localhost';
            addLines(handlePing(host));
            return;
        }

        const handler = COMMANDS[cmd];
        if (handler) {
            const result = handler();
            if (result === 'CLEAR') { body.innerHTML = ''; return; }
            addLines(result);
        } else {
            addLines([{ t:'err', s:`command not found: ${raw.trim()}. Type 'help' for available commands.` }]);
        }
    }

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            execute(input.value);
            input.value = '';
            playSound('click');
        }
    });

    if (suggestions) {
        suggestions.querySelectorAll('.term-sug').forEach(btn => {
            btn.addEventListener('click', () => {
                execute(btn.dataset.cmd);
                playSound('click');
            });
        });
    }

    // Auto-run help on first view
    const termObs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            termObs.disconnect();
            setTimeout(() => execute('skills'), 400);
        }
    }, { threshold: 0.3 });
    const termSection = document.getElementById('liveTerminal');
    if (termSection) termObs.observe(termSection);
}

// ============================================================
//  SUBNET CALCULATOR
// ============================================================
function initSubnetCalc() {
    const ipInput = document.getElementById('subnetIp');
    const cidrInput = document.getElementById('subnetCidr');
    const btn = document.getElementById('subnetCalcBtn');
    const results = document.getElementById('subnetResults');
    if (!ipInput || !btn || !results) return;

    function ipToNum(ip) {
        const parts = ip.split('.').map(Number);
        return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
    }
    function numToIp(n) {
        return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
    }

    function calc() {
        const ip = ipInput.value.trim();
        const cidr = parseInt(cidrInput.value, 10);
        if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip) || isNaN(cidr) || cidr < 0 || cidr > 32) {
            results.innerHTML = '<span style="color:#f87171">Invalid input. Use format: 192.168.1.0 / 24</span>';
            return;
        }
        const ipNum = ipToNum(ip);
        const mask = cidr === 0 ? 0 : (0xFFFFFFFF << (32 - cidr)) >>> 0;
        const network = (ipNum & mask) >>> 0;
        const broadcast = (network | (~mask >>> 0)) >>> 0;
        const hosts = cidr >= 31 ? (cidr === 32 ? 1 : 2) : Math.pow(2, 32 - cidr) - 2;
        const firstHost = cidr >= 31 ? network : network + 1;
        const lastHost = cidr >= 31 ? broadcast : broadcast - 1;

        results.innerHTML = `
            <div><span class="sr-label">Network:</span> ${numToIp(network)}/${cidr}</div>
            <div><span class="sr-label">Subnet Mask:</span> ${numToIp(mask)}</div>
            <div><span class="sr-label">Broadcast:</span> ${numToIp(broadcast)}</div>
            <div><span class="sr-label">Usable Range:</span> ${numToIp(firstHost)} — ${numToIp(lastHost)}</div>
            <div><span class="sr-label">Total Hosts:</span> ${hosts.toLocaleString()}</div>
            <div><span class="sr-label">Wildcard:</span> ${numToIp(~mask >>> 0)}</div>`;
        playSound('click');
    }

    btn.addEventListener('click', calc);
    cidrInput.addEventListener('keydown', e => { if (e.key === 'Enter') calc(); });
    ipInput.addEventListener('keydown', e => { if (e.key === 'Enter') calc(); });

    // Auto-calc on load
    calc();
}

// ============================================================
//  BOOT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.skill-card,.timeline-item,.project-card,.education-card,.contact-item').forEach((el, idx) => {
        el.style.opacity='0'; el.style.transform='translateY(30px)';
        el.style.transition=`opacity 0.6s ease ${Math.min(idx*35,180)}ms, transform 0.6s ease ${Math.min(idx*35,180)}ms`;
        observer.observe(el);
    });
    document.querySelectorAll('.project-card,.skill-card,.education-card,.timeline-content').forEach(attachTilt);
    initCommandPalette();
    initPortraitParallax();
    initGlitch();
    initScramble();
    initParticles();
    initMatrixEmail();
    initMuteToggle();
    initButtonSounds();
    initCustomCursor();
    initScrollReveal();
    // ── NEW FEATURES ──
    // initParticleNetwork(); // removed
    initScrollTransitions();
    initClock();
    initLenis();
    initJourney();
    initHeroRotator();
    initSubnetCalc();
});

// ============================================================
//  SCROLL REVEAL
// ============================================================
function initScrollReveal() {
    // Tag all section children for reveal
    const targets = document.querySelectorAll(
        '.about-text p, .skill-card, .timeline-item, .project-card, ' +
        '.education-card, .contact-item, .contact-cta, .section-title, ' +
        '.terminal-block, .timeline-content'
    );
    targets.forEach((el, i) => {
        el.setAttribute('data-reveal', '');
        el.style.transitionDelay = (i % 4) * 80 + 'ms';
    });

    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    targets.forEach(el => revealObs.observe(el));
}

// ============================================================

//  FEATURE 01 — WebGL PARTICLE NETWORK (Hero Background)
// ============================================================
function initParticleNetwork() {
    const canvas = document.getElementById('particleNetwork');
    if (!canvas || typeof THREE === 'undefined') return;

    const hero = document.querySelector('.hero-full') || document.querySelector('.hero');
    const W = hero.offsetWidth, H = hero.offsetHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 1000);
    camera.position.z = 80;

    // ── Particles ──
    const COUNT = 140;
    const positions = new Float32Array(COUNT * 3);
    const nodeData = [];
    const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

    for (let i = 0; i < COUNT; i++) {
        const x = (Math.random() - 0.5) * 180;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 60;
        positions[i * 3]     = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        nodeData.push({
            ox: x, oy: y, oz: z,
            vx: (Math.random() - 0.5) * 0.012,
            vy: (Math.random() - 0.5) * 0.008,
            vz: (Math.random() - 0.5) * 0.004
        });
    }

    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    function getNodeColor() {
        return isDark() ? 0x22c55e : 0x16a34a;
    }

    const ptMat = new THREE.PointsMaterial({
        color: getNodeColor(),
        size: 1.2,
        transparent: true,
        opacity: isDark() ? 0.6 : 0.4,
        sizeAttenuation: true
    });

    const points = new THREE.Points(ptGeo, ptMat);
    scene.add(points);

    // ── Connection Lines ──
    const MAX_DIST = 38;
    const linePositions = new Float32Array(COUNT * COUNT * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    function getLineColor() {
        return isDark() ? 0x22c55e : 0x16a34a;
    }

    const lineMat = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
        color: getLineColor(),
        transparent: true,
        opacity: isDark() ? 0.08 : 0.05,
        vertexColors: false
    }));
    scene.add(lineMat);

    // ── Mouse repulsion ──
    let mx = 0, my = 0;
    hero.addEventListener('mousemove', e => {
        const r = hero.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width  - 0.5) * 180;
        my = -((e.clientY - r.top)  / r.height - 0.5) * 100;
    });

    // ── Animate ──
    let frame = 0;
    function animate() {
        requestAnimationFrame(animate);
        frame++;

        const pos = ptGeo.attributes.position.array;
        const lpos = lineGeo.attributes.position.array;
        let lIdx = 0;

        for (let i = 0; i < COUNT; i++) {
            const nd = nodeData[i];
            nd.ox += nd.vx;
            nd.oy += nd.vy;
            // Boundary bounce
            if (Math.abs(nd.ox) > 90) nd.vx *= -1;
            if (Math.abs(nd.oy) > 50) nd.vy *= -1;

            // Mouse repel
            const dx = nd.ox - mx * 0.3;
            const dy = nd.oy - my * 0.3;
            const distMouse = Math.sqrt(dx*dx + dy*dy);
            if (distMouse < 22) {
                const force = (22 - distMouse) / 22 * 0.25;
                nd.ox += (dx / distMouse) * force;
                nd.oy += (dy / distMouse) * force;
            }

            pos[i*3]     = nd.ox;
            pos[i*3 + 1] = nd.oy;
            pos[i*3 + 2] = nd.oz;
        }
        ptGeo.attributes.position.needsUpdate = true;

        // Build lines
        for (let i = 0; i < COUNT; i++) {
            for (let j = i + 1; j < COUNT; j++) {
                const ax = pos[i*3], ay = pos[i*3+1], az = pos[i*3+2];
                const bx = pos[j*3], by = pos[j*3+1], bz = pos[j*3+2];
                const d = Math.sqrt((ax-bx)**2 + (ay-by)**2 + (az-bz)**2);
                if (d < MAX_DIST) {
                    lpos[lIdx++] = ax; lpos[lIdx++] = ay; lpos[lIdx++] = az;
                    lpos[lIdx++] = bx; lpos[lIdx++] = by; lpos[lIdx++] = bz;
                }
            }
        }
        lineGeo.attributes.position.needsUpdate = true;
        lineGeo.setDrawRange(0, lIdx / 3);

        // Slow camera drift
        camera.position.x = Math.sin(frame * 0.003) * 6;
        camera.position.y = Math.cos(frame * 0.002) * 3;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }

    animate();

    // Fade in after intro
    setTimeout(() => canvas.classList.add('visible'), 3500);

    // Resize
    window.addEventListener('resize', () => {
        const w = hero.offsetWidth, h = hero.offsetHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    });

}

// ============================================================

//  FEATURE 03 — SCROLL-DRIVEN SECTION TRANSITIONS
// ============================================================
function initScrollTransitions() {
    // ── Per-element cinematic reveal ────────────────────────────
    // Each element type gets its own entrance animation
    // driven by IntersectionObserver

    const config = [
        // [selector, initial transform, transition]
        ['.section-title',    'translateY(0) clipPath',  ''],
        ['.section-label',    'translateX(-24px)',         'opacity 0.5s ease, transform 0.5s cubic-bezier(0.16,1,0.3,1)'],
        ['.about-text p',     'translateY(36px)',          'opacity 0.7s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1)'],
        ['.skill-card',        'translateY(44px) scale(0.96)', 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)'],
        ['.project-card',     'translateY(60px) rotate(-0.8deg)', 'opacity 0.65s ease, transform 0.65s cubic-bezier(0.16,1,0.3,1)'],
        ['.education-card',   'translateY(48px) scale(0.97)', 'opacity 0.65s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1)'],
        ['.contact-item',     'translateY(32px)',          'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)'],
        ['.contact-cta',      'translateY(32px)',          'opacity 0.6s ease 0.2s, transform 0.6s cubic-bezier(0.16,1,0.3,1) 0.2s'],
        ['.timeline-content', 'translateX(-40px)',         'opacity 0.7s ease, transform 0.7s cubic-bezier(0.16,1,0.3,1)'],
    ];

    // Section titles use clip-path reveal
    document.querySelectorAll('.section-title').forEach(el => {
        el.style.clipPath = 'inset(0 100% 0 0)';
        el.style.transition = 'clip-path 1s cubic-bezier(0.16,1,0.3,1)';
    });

    // All other elements
    const allEls = [];
    config.filter(c => c[0] !== '.section-title').forEach(([sel, transform, transition], ci) => {
        document.querySelectorAll(sel).forEach((el, i) => {
            // Stagger same-type siblings
            const delay = (i % 5) * 90;
            el.style.opacity = '0';
            el.style.transform = transform;
            el.style.transition = transition
                ? transition + `, filter 0s`
                : `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`;
            el.style.willChange = 'opacity, transform';
            allEls.push(el);
        });
    });

    // Alternate timeline items direction
    document.querySelectorAll('.timeline-item').forEach((el, i) => {
        const dir = i % 2 === 0 ? -50 : 50;
        el.style.opacity = '0';
        el.style.transform = `translateX(${dir}px)`;
        el.style.transition = `opacity 0.7s ease ${i * 100}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 100}ms`;
        allEls.push(el);
    });

    // Single observer for everything
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            if (el.classList.contains('section-title')) {
                el.style.clipPath = 'inset(0 0% 0 0)';
            } else {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0) translateX(0) scale(1) rotate(0deg)';
            }
            obs.unobserve(el);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    [...document.querySelectorAll('.section-title'), ...allEls].forEach(el => obs.observe(el));

    // ── Ghost section numbers ───────────────────────────────────
    ['about','skills','experience','projects','education','contact'].forEach((id, i) => {
        const sec = document.getElementById(id);
        if (!sec) return;
        if (!['relative','absolute','fixed','sticky'].includes(getComputedStyle(sec).position)) {
            sec.style.position = 'relative';
        }
        const num = document.createElement('div');
        num.textContent = String(i + 1).padStart(2, '0');
        num.style.cssText = 'position:absolute;top:2.5rem;right:2.5rem;font-family:JetBrains Mono,monospace;font-size:6rem;font-weight:700;color:var(--accent);opacity:0.03;line-height:1;pointer-events:none;user-select:none;z-index:0;letter-spacing:-0.04em;';
        sec.appendChild(num);
    });

    // ── Smooth section entrance line ────────────────────────────
    // A thin green line sweeps across the top of each section as it enters
    document.querySelectorAll('section[id]:not(#home)').forEach(sec => {
        const line = document.createElement('div');
        line.style.cssText = 'position:absolute;top:0;left:0;height:1px;width:0;background:var(--accent);opacity:0.4;transition:width 0.9s cubic-bezier(0.16,1,0.3,1);z-index:1;pointer-events:none;';
        if (!['relative','absolute','fixed','sticky'].includes(getComputedStyle(sec).position)) {
            sec.style.position = 'relative';
        }
        sec.prepend(line);

        const lineObs = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setTimeout(() => line.style.width = '100%', 100);
                lineObs.disconnect();
            }
        }, { threshold: 0.05 });
        lineObs.observe(sec);
    });
}



// [REMOVED] Animated skill bars — terminal-only approach


// ============================================================

// ============================================================
//  LIVE CLOCK
// ============================================================
function initClock() {
    const el = document.getElementById('hfTime');
    if (!el) return;
    function tick() {
        const now = new Date().toLocaleTimeString('en-CA', {
            timeZone: 'America/Toronto',
            hour12: false,
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        el.textContent = now;
    }
    tick();
    setInterval(tick, 1000);
}


// ============================================================
//  LENIS SMOOTH SCROLL
// ============================================================
function initLenis() {
    if (typeof Lenis === 'undefined') return;
    const lenis = new Lenis({
        duration: 1.25,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: false,
    });

    lenis.on('scroll', ({ scroll, progress }) => {
        window._scrollY = scroll;

        const bar = document.querySelector('.scroll-progress-bar');
        if (bar) bar.style.width = (progress * 100) + '%';

        const navbar = document.querySelector('.navbar');
        if (navbar) navbar.style.boxShadow = scroll > 100
            ? '0 4px 6px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.1)';

        const topBtn = document.getElementById('scrollTopBtn');
        if (topBtn) topBtn.classList.toggle('visible', scroll > 400);

        document.querySelectorAll('section[id]').forEach(section => {
            const top = section.offsetTop - 100;
            if (scroll > top && scroll <= top + section.offsetHeight) {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                document.querySelector('.nav-link[href="#' + section.id + '"]')?.classList.add('active');
            }
        });
    });

    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) lenis.scrollTo(target, { offset: -80, duration: 1.4 });
        });
    });

    document.getElementById('scrollTopBtn')?.addEventListener('click', () => {
        lenis.scrollTo(0, { duration: 1.4 });
    });

    window._lenis = lenis;
}

// ============================================================
//  JOURNEY — SCROLL-PINNED (Apple-style)
// ============================================================
function initJourney() {
    const outer = document.getElementById('journey');
    if (!outer) return;

    const bar   = document.getElementById('jBar');
    const bgYr  = document.getElementById('jBgYr');
    const yrEl  = document.getElementById('jYear');
    const locEl = document.getElementById('jLoc');
    const dots  = document.querySelectorAll('.jd');
    const cards = document.querySelectorAll('.jc');
    const N     = 5;

    const SLIDES = [
        { year: '2018', loc: '📍 Kochi, India' },
        { year: '2022', loc: '📍 Kochi, India' },
        { year: '2023', loc: '📍 London, ON'   },
        { year: '2025', loc: '📍 London, ON'   },
        { year: 'next', loc: '📍 Canada'        },
    ];

    let cur = -1;
    let isAnimating = false;
    let animTimer = null;

    // Animate individual characters of year
    function animateYear(newYear) {
        const chars = newYear.split('');
        yrEl.style.opacity = '0';
        yrEl.style.transform = 'translateY(30px)';
        yrEl.style.filter = 'blur(8px)';
        setTimeout(() => {
            yrEl.textContent = newYear;
            yrEl.style.transition = 'opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1), filter 0.5s ease';
            yrEl.style.opacity = '1';
            yrEl.style.transform = 'translateY(0)';
            yrEl.style.filter = 'blur(0px)';
        }, 120);
    }

    function animateLoc(newLoc) {
        locEl.style.opacity = '0';
        locEl.style.transform = 'translateX(-12px)';
        setTimeout(() => {
            locEl.textContent = newLoc;
            locEl.style.transition = 'opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s';
            locEl.style.opacity = '1';
            locEl.style.transform = 'translateX(0)';
        }, 150);
    }

    function animateBgYear(newYear) {
        bgYr.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        bgYr.style.opacity = '0';
        bgYr.style.transform = 'translate(-50%,-50%) scale(0.85)';
        setTimeout(() => {
            bgYr.textContent = newYear;
            bgYr.style.transition = 'opacity 0.6s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1)';
            bgYr.style.opacity = '0.04';
            bgYr.style.transform = 'translate(-50%,-50%) scale(1)';
        }, 200);
    }

    function goTo(i) {
        i = Math.max(0, Math.min(N - 1, i));
        if (i === cur) return;
        if (isAnimating) return;
        isAnimating = true;
        clearTimeout(animTimer);
        animTimer = setTimeout(() => { isAnimating = false; }, 300);
        const prev = cur; cur = i;

        // Animate left panel
        animateYear(SLIDES[i].year);
        animateLoc(SLIDES[i].loc);
        animateBgYear(SLIDES[i].year);

        // Dots
        dots.forEach((d, k) => d.classList.toggle('on', k === i));

        // Cards — cinematic in/out
        const goingForward = i > prev;
        cards.forEach((c, k) => {
            c.classList.remove('on', 'out', 'out-up');
            if (k === i) {
                // Incoming card: set start position then animate in
                c.style.transition = 'none';
                c.style.opacity = '0';
                c.style.pointerEvents = 'auto';
                c.style.transform = `translateY(calc(-50% + ${goingForward ? 60 : -60}px))`;
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        c.style.transition = 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)';
                        c.style.opacity = '1';
                        c.style.transform = 'translateY(-50%)';
                    });
                });
            } else if (k === prev && prev >= 0) {
                // Outgoing card: animate out in opposite direction
                c.style.pointerEvents = 'none';
                c.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.4,0,1,1)';
                c.style.opacity = '0';
                c.style.transform = `translateY(calc(-50% + ${goingForward ? -60 : 60}px))`;
                setTimeout(() => { c.style.transition = 'none'; }, 420);
            } else {
                // All other cards: ensure they are hidden
                c.style.opacity = '0';
                c.style.pointerEvents = 'none';
            }
        });
    }

    // Init styles on cards
    cards.forEach((c, k) => {
        c.style.position = 'absolute';
        c.style.top = '50%';
        c.style.left = '3rem';
        c.style.right = '0';
        c.style.opacity = k === 0 ? '1' : '0';
        c.style.transform = 'translateY(-50%)';
        c.style.pointerEvents = k === 0 ? 'auto' : 'none';
        c.style.transition = 'none';
    });

    // Init left panel styles for animation
    yrEl.style.transition = 'none';
    yrEl.style.filter = 'blur(0px)';
    locEl.style.transition = 'none';

    function update() {
        const sy = (window._scrollY !== undefined) ? window._scrollY : window.scrollY;
        const outerTop = outer.offsetTop;
        const scrollable = outer.offsetHeight - window.innerHeight;
        const scrolled = Math.max(0, sy - outerTop);
        const p = scrollable > 0 ? Math.min(1, scrolled / scrollable) : 0;

        if (bar) bar.style.width = (p * 100).toFixed(1) + '%';

        // Slide index with small buffer zones so transitions feel natural
        const rawIdx = p * N;
        const idx = Math.floor(rawIdx);
        goTo(Math.min(N - 1, idx));
    }

    (function loop() { update(); requestAnimationFrame(loop); })();

    // Dot clicks
    dots.forEach((d, i) => d.addEventListener('click', () => {
        const top = outer.offsetTop;
        const scrollable = outer.offsetHeight - window.innerHeight;
        const target = top + (i / N) * scrollable;
        if (window._lenis) window._lenis.scrollTo(target, { duration: 1 });
        else window.scrollTo({ top: target, behavior: 'smooth' });
    }));

    cur = -1;
    goTo(0);
}

// ============================================================
//  DRONE MODAL
// ============================================================
let droneStep = 0;
const DRONE_TOTAL = 5;

function openDroneModal() {
    const modal = document.getElementById('droneModal');
    if (!modal) return;
    droneStep = 0;
    renderDroneStep();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (window._lenis) window._lenis.stop();
    playSound('whoosh');
}

function closeDroneModal() {
    const modal = document.getElementById('droneModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (window._lenis) window._lenis.start();
    playSound('click');
}

function renderDroneStep() {
    const steps = document.querySelectorAll('.dm-step');
    const dots  = document.querySelectorAll('.dm-dot');
    const prev  = document.querySelector('.dm-prev');
    const next  = document.querySelector('.dm-next');

    steps.forEach((s, i) => s.classList.toggle('active', i === droneStep));
    dots.forEach((d, i)  => d.classList.toggle('active', i === droneStep));

    if (prev) prev.disabled = droneStep === 0;
    if (next) {
        next.textContent = droneStep === DRONE_TOTAL - 1 ? 'Close ✕' : 'Next →';
    }
}

function droneNext() {
    if (droneStep >= DRONE_TOTAL - 1) { closeDroneModal(); return; }
    droneStep++;
    renderDroneStep();
    playSound('click');
}

function dronePrev() {
    if (droneStep <= 0) return;
    droneStep--;
    renderDroneStep();
    playSound('click');
}

// Close on Escape
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('droneModal');
        if (modal && modal.classList.contains('open')) closeDroneModal();
    }
});

