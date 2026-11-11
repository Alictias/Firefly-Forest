
function drawUI() {
    drawJar();
    if (gameWon) drawWinScreen();
}

function drawJar() {
    const jarX = 20;
    const jarY = canvas.height - 200;
    const jarW = 80;
    const jarH = 130;
    const neckW = 36;
    const neckH = 22;

    ctx.save();

    // Corpo da jarra (clip para vagalumes ficarem dentro)
    const jarBodyPath = new Path2D();
    jarBodyPath.roundRect(jarX, jarY + neckH, jarW, jarH, [0, 0, 18, 18]);

    // Brilho interno
    if (jarFireflies.length > 0) {
        const glow = ctx.createRadialGradient(
            jarX + jarW / 2, jarY + neckH + jarH / 2, 5,
            jarX + jarW / 2, jarY + neckH + jarH / 2, jarW * 0.7
        );
        glow.addColorStop(0, `rgba(255,246,168,${0.08 + jarFireflies.length * 0.012})`);
        glow.addColorStop(1, "rgba(255,246,168,0)");
        ctx.fillStyle = glow;
        ctx.fill(jarBodyPath);
    }

    // Vagalumes dentro da jarra
    ctx.save();
    ctx.clip(jarBodyPath);
    for (const jf of jarFireflies) {
        const fx = jarX + jf.x * jarW;
        const fy = jarY + neckH + jf.y * jarH;
        const miniGlow = ctx.createRadialGradient(fx, fy, 0, fx, fy, 6);
        miniGlow.addColorStop(0, `rgba(255,246,168,${jf.glow})`);
        miniGlow.addColorStop(1, "rgba(255,246,168,0)");
        ctx.fillStyle = miniGlow;
        ctx.beginPath();
        ctx.arc(fx, fy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255,246,168,${jf.glow})`;
        ctx.beginPath();
        ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    // Vidro da jarra (corpo)
    ctx.strokeStyle = "rgba(200,230,255,0.7)";
    ctx.lineWidth = 2.5;
    ctx.fillStyle = "rgba(180,220,255,0.08)";
    ctx.fill(jarBodyPath);
    ctx.stroke(jarBodyPath);

    // Gargalo
    const neckX = jarX + (jarW - neckW) / 2;
    ctx.fillStyle = "rgba(180,220,255,0.10)";
    ctx.strokeStyle = "rgba(200,230,255,0.7)";
    ctx.beginPath();
    ctx.roundRect(neckX, jarY, neckW, neckH + 2, [6, 6, 0, 0]);
    ctx.fill();
    ctx.stroke();

    // Tampa
    ctx.fillStyle = "rgba(160,200,140,0.85)";
    ctx.strokeStyle = "rgba(120,170,100,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(neckX - 4, jarY - 10, neckW + 8, 12, 4);
    ctx.fill();
    ctx.stroke();

    // Reflexo no vidro
    ctx.fillStyle = "rgba(255,255,255,0.13)";
    ctx.beginPath();
    ctx.roundRect(jarX + 10, jarY + neckH + 10, 10, jarH * 0.55, 5);
    ctx.fill();

    // Texto ao lado da jarra
    ctx.fillStyle = "#fff6d6";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Vagalumes: ${capturedFireflies} / 25`, jarX + jarW + 14, jarY + neckH + jarH / 2);

    ctx.restore();
}

function drawWinScreen() {
    // Overlay escuro
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Painel
    ctx.fillStyle = "rgba(30,28,60,0.92)";
    ctx.strokeStyle = "rgba(255,246,168,0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - 200, cy - 110, 400, 220, 20);
    ctx.fill();
    ctx.stroke();

    // Vagalumes decorativos
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + performance.now() * 0.001;
        const rx = cx + Math.cos(angle) * 170;
        const ry = cy + Math.sin(angle) * 90;
        const g = ctx.createRadialGradient(rx, ry, 0, rx, ry, 18);
        g.addColorStop(0, "rgba(255,246,168,0.9)");
        g.addColorStop(1, "rgba(255,246,168,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(rx, ry, 18, 0, Math.PI * 2);
        ctx.fill();
    }

    // Texto
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff6d6";
    ctx.font = "bold 64px Arial";
    ctx.fillText("You Win!", cx, cy - 20);
    ctx.font = "22px Arial";
    ctx.fillStyle = "rgba(255,246,168,0.8)";
    ctx.fillText("Você capturou todos os vagalumes!", cx, cy + 30);
    ctx.font = "16px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText("Clique para soltar e jogar novamente", cx, cy + 70);
}