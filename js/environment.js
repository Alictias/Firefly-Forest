// Interpola entre duas cores hex com base em t (0-1)
function lerpColor(a, b, t) {
    const ah = parseInt(a.slice(1), 16);
    const bh = parseInt(b.slice(1), 16);
    const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
    const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);
    return `rgb(${r},${g},${bl})`;
}

function drawSky(dawn = 0) {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0,   lerpColor("#1a1535", "#1a3a6e", dawn));
    gradient.addColorStop(0.4, lerpColor("#2e2a55", "#c4622d", dawn));
    gradient.addColorStop(0.7, lerpColor("#3a3868", "#e8874a", dawn));
    gradient.addColorStop(1,   lerpColor("#4a4870", "#f5b97a", dawn));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Brilho do horizonte ao amanhecer
    if (dawn > 0) {
        const sunGlow = ctx.createLinearGradient(0, canvas.height * 0.3, 0, canvas.height * 0.6);
        sunGlow.addColorStop(0, `rgba(255,180,80,0)`);
        sunGlow.addColorStop(0.5, `rgba(255,160,60,${dawn * 0.35})`);
        sunGlow.addColorStop(1, `rgba(255,120,30,0)`);
        ctx.fillStyle = sunGlow;
        ctx.fillRect(0, canvas.height * 0.3, canvas.width, canvas.height * 0.3);
    }
}

const MOON_WORLD_ANGLE = Math.PI * 0.3;

function drawMoon(camAngle, dawn = 0) {
    const mx = worldToScreen(MOON_WORLD_ANGLE, camAngle);
    const my = canvas.height * 0.18;
    if (mx < -150 || mx > canvas.width + 150) return;

    const alpha = 1 - dawn;

    const halo = ctx.createRadialGradient(mx, my, 30, mx, my, 130);
    halo.addColorStop(0, `rgba(255,243,196,${0.12 * alpha})`);
    halo.addColorStop(1, "rgba(255,243,196,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(mx, my, 130, 0, Math.PI * 2);
    ctx.fill();

    const glow = ctx.createRadialGradient(mx, my, 20, mx, my, 60);
    glow.addColorStop(0, `rgba(255,248,210,${0.35 * alpha})`);
    glow.addColorStop(1, "rgba(255,243,196,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(mx, my, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.globalAlpha = alpha;
    const moonGrad = ctx.createRadialGradient(mx - 10, my - 10, 5, mx, my, 40);
    moonGrad.addColorStop(0, "#fffde0");
    moonGrad.addColorStop(0.6, "#fff3c4");
    moonGrad.addColorStop(1, "#e8d898");
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(mx, my, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

const stars = [];

function generateStars() {
    for (let i = 0; i < 120; i++) {
        stars.push({
            worldAngle: Math.random() * Math.PI * 2,
            y: Math.random() * 0.52 * canvas.height,
            size: Math.random() * 1.8 + 0.4,
            glow: Math.random(),
            glowSpeed: 0.003 + Math.random() * 0.005,
        });
    }
}

function drawStars(camAngle, dawn = 0) {
    for (const star of stars) {
        star.glow += star.glowSpeed;
        if (star.glow > 1 || star.glow < 0) star.glowSpeed *= -1;

        const sx = worldToScreen(star.worldAngle, camAngle);
        if (sx < -10 || sx > canvas.width + 10) continue;

        const alpha = (0.4 + star.glow * 0.6) * (1 - dawn);
        if (alpha <= 0) continue;
        ctx.fillStyle = `rgba(255,246,214,${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawGround(dawn = 0) {
    const grad = ctx.createLinearGradient(0, canvas.height * 0.56, 0, canvas.height);
    grad.addColorStop(0,   lerpColor("#2a4535", "#3a5530", dawn));
    grad.addColorStop(0.3, lerpColor("#1e3328", "#2e4a22", dawn));
    grad.addColorStop(1,   lerpColor("#111e18", "#1a2e14", dawn));
    ctx.fillStyle = grad;
    ctx.fillRect(0, canvas.height * 0.56, canvas.width, canvas.height * 0.5);
}
