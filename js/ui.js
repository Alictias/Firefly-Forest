
function drawUI() {
    if (gameState === "menu")          { drawMenu();        return; }
    if (gameState === "entering_name") { drawJar(); drawEnterName(); return; }
    drawJar();
    if (gameState === "won")  drawWinScreen();
    if (gameState === "lost") drawLostScreen();
}

// ─── MENU ────────────────────────────────────────────────────────────────────

function drawMenu() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.fillStyle = "rgba(10,8,30,0.72)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + performance.now() * 0.0008;
        const rx = cx + Math.cos(a) * 220;
        const ry = cy + Math.sin(a) * 110;
        const g = ctx.createRadialGradient(rx, ry, 0, rx, ry, 20);
        g.addColorStop(0, "rgba(255,246,168,0.85)");
        g.addColorStop(1, "rgba(255,246,168,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(rx, ry, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "#fff6d6";
    ctx.font = "bold 72px Arial";
    ctx.fillText("Firefly Forest", cx, cy - 100);

    ctx.font = "18px Arial";
    ctx.fillStyle = "rgba(255,246,168,0.6)";
    ctx.fillText("Capture os vagalumes antes que a noite acabe", cx, cy - 55);

    drawMenuButton(cx - 85, cy + 30, 140, 50, "Easy", "#2a5c42", "#3a7a5a");
    drawMenuButton(cx + 85, cy + 30, 140, 50, "Hard", "#5c2a2a", "#7a3a3a");

    ctx.font = "13px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillText("25 vagalumes", cx - 85, cy + 65);
    ctx.fillText("30 vagalumes · mais rápidos", cx + 85, cy + 65);

    // Top 5 Easy
    drawLeaderboardPanel(cx - 85, cy + 90, "easy", "Easy");
    // Top 5 Hard
    drawLeaderboardPanel(cx + 85, cy + 90, "hard", "Hard");
}

function drawLeaderboardPanel(cx, topY, mode, label) {
    const board = getLeaderboard(mode);
    ctx.textAlign = "center";
    ctx.font = "bold 13px Arial";
    ctx.fillStyle = "rgba(255,246,168,0.7)";
    ctx.fillText(`🏆 Top ${label}`, cx, topY + 16);

    if (board.length === 0) {
        ctx.font = "12px Arial";
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillText("Sem records", cx, topY + 36);
        return;
    }

    for (let i = 0; i < board.length; i++) {
        const e = board[i];
        const y = topY + 36 + i * 20;
        const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
        ctx.font = i === 0 ? "bold 13px Arial" : "12px Arial";
        ctx.fillStyle = i === 0 ? "#ffd700" : "rgba(255,246,168,0.55)";
        ctx.fillText(`${medal} ${e.name}  ${formatTime(e.time)}`, cx, y);
    }
}

function drawMenuButton(cx, cy, w, h, label, colorDark, colorLight) {
    const x = cx - w / 2, y = cy - h / 2;
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, colorLight);
    grad.addColorStop(1, colorDark);
    ctx.fillStyle = grad;
    ctx.strokeStyle = "rgba(255,246,168,0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff6d6";
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "center";
    ctx.fillText(label, cx, cy + 8);
}

// ─── JAR HUD ─────────────────────────────────────────────────────────────────

function drawJar() {
    const limit = MODES[gameMode].limit;
    const jarX = 20, jarY = canvas.height - 200;
    const jarW = 80, jarH = 130, neckW = 36, neckH = 22;

    ctx.save();

    const jarBodyPath = new Path2D();
    jarBodyPath.roundRect(jarX, jarY + neckH, jarW, jarH, [0, 0, 18, 18]);

    if (jarFireflies.length > 0) {
        const glow = ctx.createRadialGradient(
            jarX + jarW / 2, jarY + neckH + jarH / 2, 5,
            jarX + jarW / 2, jarY + neckH + jarH / 2, jarW * 0.7
        );
        glow.addColorStop(0, `rgba(255,246,168,${0.08 + jarFireflies.length * 0.006})`);
        glow.addColorStop(1, "rgba(255,246,168,0)");
        ctx.fillStyle = glow;
        ctx.fill(jarBodyPath);
    }

    ctx.save();
    ctx.clip(jarBodyPath);
    for (const jf of jarFireflies) {
        const fx = jarX + jf.x * jarW;
        const fy = jarY + neckH + jf.y * jarH;
        const mg = ctx.createRadialGradient(fx, fy, 0, fx, fy, 6);
        mg.addColorStop(0, `rgba(255,246,168,${jf.glow})`);
        mg.addColorStop(1, "rgba(255,246,168,0)");
        ctx.fillStyle = mg;
        ctx.beginPath();
        ctx.arc(fx, fy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255,246,168,${jf.glow})`;
        ctx.beginPath();
        ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    ctx.strokeStyle = "rgba(200,230,255,0.7)";
    ctx.lineWidth = 2.5;
    ctx.fillStyle = "rgba(180,220,255,0.08)";
    ctx.fill(jarBodyPath);
    ctx.stroke(jarBodyPath);

    const neckX = jarX + (jarW - neckW) / 2;
    ctx.fillStyle = "rgba(180,220,255,0.10)";
    ctx.strokeStyle = "rgba(200,230,255,0.7)";
    ctx.beginPath();
    ctx.roundRect(neckX, jarY, neckW, neckH + 2, [6, 6, 0, 0]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(160,200,140,0.85)";
    ctx.strokeStyle = "rgba(120,170,100,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(neckX - 4, jarY - 10, neckW + 8, 12, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.13)";
    ctx.beginPath();
    ctx.roundRect(jarX + 10, jarY + neckH + 10, 10, jarH * 0.55, 5);
    ctx.fill();

    const remaining = Math.max(0, TIME_LIMIT - elapsedTime);
    const isUrgent  = remaining < 30000;
    ctx.fillStyle = isUrgent
        ? `rgba(255,${Math.floor(100 + Math.sin(Date.now() * 0.01) * 80)},80,1)`
        : "#fff6d6";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`${capturedFireflies} / ${limit}`, jarX + jarW + 14, jarY + neckH + jarH / 2 - 10);
    ctx.font = "bold 15px Arial";
    ctx.fillText(formatTime(remaining), jarX + jarW + 14, jarY + neckH + jarH / 2 + 14);

    ctx.restore();
}

// ─── ENTER NAME ──────────────────────────────────────────────────────────────

function drawEnterName() {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2, cy = canvas.height / 2;

    ctx.fillStyle = "rgba(30,28,60,0.95)";
    ctx.strokeStyle = "rgba(255,246,168,0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - 200, cy - 120, 400, 240, 20);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = "#fff6d6";
    ctx.font = "bold 36px Arial";
    ctx.fillText("You Win! 🎉", cx, cy - 65);

    ctx.font = "20px Arial";
    ctx.fillStyle = "rgba(255,246,168,0.8)";
    ctx.fillText(`Tempo: ${formatTime(elapsedTime)}`, cx, cy - 25);

    ctx.font = "16px Arial";
    ctx.fillStyle = "rgba(255,246,168,0.55)";
    ctx.fillText("Novo top 5! Digite seu nome (3 letras):", cx, cy + 15);

    // Caixinhas das letras
    for (let i = 0; i < 3; i++) {
        const bx = cx - 60 + i * 44;
        const by = cy + 35;
        const letter = nameInput[i] || "";
        const isActive = nameInput.length === i;

        ctx.fillStyle = isActive ? "rgba(255,246,168,0.15)" : "rgba(255,255,255,0.05)";
        ctx.strokeStyle = isActive ? "rgba(255,246,168,0.9)" : "rgba(255,246,168,0.3)";
        ctx.lineWidth = isActive ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(bx - 16, by, 32, 38, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#fff6d6";
        ctx.font = "bold 26px Arial";
        ctx.fillText(letter, bx, by + 28);

        // Cursor piscando na caixa ativa
        if (isActive && Math.floor(Date.now() / 500) % 2 === 0) {
            ctx.fillStyle = "rgba(255,246,168,0.8)";
            ctx.fillRect(bx - 1, by + 32, 2, 4);
        }
    }

    ctx.font = "13px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillText(nameInput.length === 3 ? "Enter para confirmar" : "Digite 3 letras", cx, cy + 95);
}

// ─── WIN SCREEN ──────────────────────────────────────────────────────────────

function drawWinScreen() {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2, cy = canvas.height / 2;

    ctx.fillStyle = "rgba(30,28,60,0.92)";
    ctx.strokeStyle = "rgba(255,246,168,0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - 240, cy - 150, 480, 300, 20);
    ctx.fill();
    ctx.stroke();

    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + performance.now() * 0.001;
        const rx = cx + Math.cos(angle) * 210;
        const ry = cy + Math.sin(angle) * 120;
        const g = ctx.createRadialGradient(rx, ry, 0, rx, ry, 18);
        g.addColorStop(0, "rgba(255,246,168,0.9)");
        g.addColorStop(1, "rgba(255,246,168,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(rx, ry, 18, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "#fff6d6";
    ctx.font = "bold 52px Arial";
    ctx.fillText("You Win!", cx, cy - 90);

    ctx.font = "20px Arial";
    ctx.fillStyle = "rgba(255,246,168,0.9)";
    ctx.fillText(`Tempo: ${formatTime(elapsedTime)}`, cx, cy - 55);

    // Top 5
    const board = getLeaderboard(gameMode);
    ctx.font = "bold 14px Arial";
    ctx.fillStyle = "rgba(255,246,168,0.7)";
    ctx.fillText("🏆 Ranking", cx, cy - 20);

    for (let i = 0; i < board.length; i++) {
        const e = board[i];
        const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
        // Destaca a entrada recém adicionada
        const isRecent = Math.abs(e.time - elapsedTime) < 50;
        ctx.font = isRecent ? "bold 14px Arial" : "13px Arial";
        ctx.fillStyle = isRecent ? "#ffd700" : (i === 0 ? "#ffd700" : "rgba(255,246,168,0.55)");
        ctx.fillText(`${medal} ${e.name}  ${formatTime(e.time)}`, cx, cy + 10 + i * 22);
    }

    ctx.font = "14px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText("Clique para voltar ao menu", cx, cy + 130);
}

// ─── LOST SCREEN ─────────────────────────────────────────────────────────────

function drawLostScreen() {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2, cy = canvas.height / 2;

    ctx.fillStyle = "rgba(40,20,20,0.92)";
    ctx.strokeStyle = "rgba(255,100,80,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - 220, cy - 110, 440, 220, 20);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffb0a0";
    ctx.font = "bold 64px Arial";
    ctx.fillText("Game Over", cx, cy - 30);

    ctx.font = "20px Arial";
    ctx.fillStyle = "rgba(255,200,180,0.8)";
    ctx.fillText(`Capturou ${capturedFireflies} de ${MODES[gameMode].limit} vagalumes`, cx, cy + 20);

    ctx.font = "15px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText("Clique para voltar ao menu", cx, cy + 70);
}
