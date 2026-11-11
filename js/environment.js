function drawSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#1a1535");
    gradient.addColorStop(0.5, "#2e2a55");
    gradient.addColorStop(1, "#4a4870");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// worldAngle fixo da lua no mundo
const MOON_WORLD_ANGLE = Math.PI * 0.3;

function drawMoon(camAngle) {
    const mx = worldToScreen(MOON_WORLD_ANGLE, camAngle);
    const my = canvas.height * 0.18;

    // Fora do campo de visão
    if (mx < -150 || mx > canvas.width + 150) return;

    // Outer halo
    const halo = ctx.createRadialGradient(mx, my, 30, mx, my, 130);
    halo.addColorStop(0, "rgba(255,243,196,0.12)");
    halo.addColorStop(1, "rgba(255,243,196,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(mx, my, 130, 0, Math.PI * 2);
    ctx.fill();

    // Inner glow
    const glow = ctx.createRadialGradient(mx, my, 20, mx, my, 60);
    glow.addColorStop(0, "rgba(255,248,210,0.35)");
    glow.addColorStop(1, "rgba(255,243,196,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(mx, my, 60, 0, Math.PI * 2);
    ctx.fill();

    // Moon body
    const moonGrad = ctx.createRadialGradient(mx - 10, my - 10, 5, mx, my, 40);
    moonGrad.addColorStop(0, "#fffde0");
    moonGrad.addColorStop(0.6, "#fff3c4");
    moonGrad.addColorStop(1, "#e8d898");
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(mx, my, 40, 0, Math.PI * 2);
    ctx.fill();
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

function drawStars(camAngle) {
    for (const star of stars) {
        star.glow += star.glowSpeed;
        if (star.glow > 1 || star.glow < 0) star.glowSpeed *= -1;

        const sx = worldToScreen(star.worldAngle, camAngle);
        if (sx < -10 || sx > canvas.width + 10) continue;

        const alpha = 0.4 + star.glow * 0.6;
        ctx.fillStyle = `rgba(255,246,214,${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawGround() {
    const grad = ctx.createLinearGradient(0, canvas.height * 0.56, 0, canvas.height);
    grad.addColorStop(0, "#2a4535");
    grad.addColorStop(0.3, "#1e3328");
    grad.addColorStop(1, "#111e18");
    ctx.fillStyle = grad;
    ctx.fillRect(0, canvas.height * 0.56, canvas.width, canvas.height * 0.5);
}
