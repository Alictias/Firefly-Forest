let capturedFireflies = 0;
let gameWon = false;
const JAR_FIREFLIES_LIMIT = 75;

const fireflies = [];
const jarFireflies = [];

function generateFireflies(config) {
    for (let i = 0; i < config.count; i++) {
        fireflies.push({
            worldAngle: Math.random() * Math.PI * 2,
            y: 80 + Math.random() * canvas.height * 0.5,
            size: 3 + Math.random() * 2,
            glow: Math.random(),
            glowSpeed: 0.01 + Math.random() * 0.02,
            moveAngle: Math.random() * Math.PI * 2,
            turnSpeed: -0.02 + Math.random() * 0.04
        });
    }
}

function worldToScreen(worldAngle, camAngle) {
    let delta = worldAngle - camAngle;
    while (delta >  Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    return canvas.width * 0.5 + (delta / (FOV * 0.5)) * canvas.width * 0.5;
}

function screenToWorldAngle(screenX, camAngle) {
    const delta = ((screenX - canvas.width * 0.5) / (canvas.width * 0.5)) * (FOV * 0.5);
    return camAngle + delta;
}

function drawFirefly(firefly, camAngle) {
    const screenX = worldToScreen(firefly.worldAngle, camAngle);
    if (screenX < -50 || screenX > canvas.width + 50) return;

    const brightness = firefly.glow;
    const glow = ctx.createRadialGradient(screenX, firefly.y, 0, screenX, firefly.y, 35);
    glow.addColorStop(0, `rgba(255, 246, 168, ${brightness})`);
    glow.addColorStop(1, "rgba(255, 246, 168, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(screenX, firefly.y, 35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 246, 168, ${brightness})`;
    ctx.beginPath();
    ctx.arc(screenX, firefly.y, firefly.size, 0, Math.PI * 2);
    ctx.fill();
}

function updateFirefly(firefly, speed = 1.0, mode = "easy", mouseX = -999, mouseY = -999, camAngle = 0) {
    if (mode === "hard") {
        // Fuga do mouse: converte posição do mouse para worldAngle e compara
        const mouseWorldAngle = screenToWorldAngle(mouseX, camAngle);
        let dAngle = firefly.worldAngle - mouseWorldAngle;
        while (dAngle >  Math.PI) dAngle -= Math.PI * 2;
        while (dAngle < -Math.PI) dAngle += Math.PI * 2;

        const dy = firefly.y - mouseY;
        const screenDist = Math.sqrt((dAngle * canvas.width) ** 2 + dy ** 2);
        const FLEE_RADIUS = 180;

        if (screenDist < FLEE_RADIUS) {
            // Vira para longe do mouse
            const fleeAngle = Math.atan2(dy, dAngle * canvas.width);
            const diff = fleeAngle - firefly.moveAngle;
            firefly.moveAngle += Math.sign(Math.sin(diff)) * 0.08;
            speed *= 1 + (1 - screenDist / FLEE_RADIUS) * 1.2;
        }
    }

    firefly.moveAngle += firefly.turnSpeed;
    firefly.worldAngle += Math.cos(firefly.moveAngle) * 0.0008 * speed;
    if (firefly.worldAngle >  Math.PI * 2) firefly.worldAngle -= Math.PI * 2;
    if (firefly.worldAngle < 0)            firefly.worldAngle += Math.PI * 2;
    firefly.y += Math.sin(firefly.moveAngle) * 0.5 * speed;

    if (firefly.y < 60)                        { firefly.y = 60;                       firefly.moveAngle = Math.PI / 2; }
    if (firefly.y > canvas.height * 0.7 - 60) { firefly.y = canvas.height * 0.7 - 60; firefly.moveAngle = -Math.PI / 2; }

    firefly.glow += firefly.glowSpeed;
    if (firefly.glow > 1 || firefly.glow < 0) firefly.glowSpeed *= -1;
}

function updateJarFireflies() {
    for (const jf of jarFireflies) {
        jf.angle += jf.turnSpeed;
        jf.x += Math.cos(jf.angle) * 0.004;
        jf.y += Math.sin(jf.angle) * 0.004;
        if (jf.x < 0.05) { jf.x = 0.05; jf.angle = 0; }
        if (jf.x > 0.95) { jf.x = 0.95; jf.angle = Math.PI; }
        if (jf.y < 0.05) { jf.y = 0.05; jf.angle = Math.PI / 2; }
        if (jf.y > 0.95) { jf.y = 0.95; jf.angle = -Math.PI / 2; }
        jf.glow += jf.glowSpeed;
        if (jf.glow > 1 || jf.glow < 0) jf.glowSpeed *= -1;
    }
}

// Retorna true se capturou
function captureFirefly(mouseX, mouseY, camAngle) {
    for (let i = fireflies.length - 1; i >= 0; i--) {
        const firefly = fireflies[i];
        const screenX = worldToScreen(firefly.worldAngle, camAngle);
        const dist = Math.sqrt((mouseX - screenX) ** 2 + (mouseY - firefly.y) ** 2);

        if (dist < 35) {
            fireflies.splice(i, 1);
            capturedFireflies++;
            jarFireflies.push({
                x: 0.2 + Math.random() * 0.6,
                y: 0.2 + Math.random() * 0.6,
                angle: Math.random() * Math.PI * 2,
                turnSpeed: -0.015 + Math.random() * 0.03,
                glow: Math.random(),
                glowSpeed: 0.004 + Math.random() * 0.004
            });
            if (capturedFireflies >= MODES[gameMode].limit) gameWon = true;
            return true;
        }
    }
    return false;
}
