
    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Game state
    let gameState = "menu"; // "menu"|"playing"|"paused"|"won"|"lost"|"entering_name"
    let gameMode  = "easy";
    let startTime = 0;
    let elapsedTime = 0;
    let pausedAt = 0;

    // Fade in
    let fadeAlpha = 0;
    let fadingIn  = false;

    // Cursor / net
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    let netSwing = 0;       // 0=idle, 1=swinging down
    let netSwingT = 0;

    // Combo
    let combo = 0;
    let comboTimer = 0;
    let bonusPopups = []; // {x, y, t, text}
    const COMBO_WINDOW = 1500; // ms entre capturas para manter combo
    const BONUS_TIME   = 3000; // ms ganhos por combo ≥ 2

    const MODES = {
        easy:     { count: 75, limit: 10, speed: 1.0, timeLimit: 10000,  dawnStart: 7000,  endless: false },
        hard:     { count: 75, limit: 20, speed: 1.8, timeLimit: 10000,  dawnStart: 7000,  endless: false },
        havefun:  { count: 75, limit: Infinity, speed: 1.2, timeLimit: 60000, dawnStart: 40000, endless: true  }
    };

    const TIME_LIMIT = () => MODES[gameMode].timeLimit;
    const DAWN_START = () => MODES[gameMode].dawnStart;

    // Leaderboard
    function getLeaderboard(mode) {
        const val = localStorage.getItem(`leaderboard_${mode}`);
        return val ? JSON.parse(val) : [];
    }
    function saveLeaderboard(mode, entries) {
        localStorage.setItem(`leaderboard_${mode}`, JSON.stringify(entries));
    }
    function isTopFive(mode, value) {
        const board = getLeaderboard(mode);
        if (board.length < 5) return true;
        if (MODES[mode].endless) return value > (board[board.length - 1].score ?? 0);
        return value < board[board.length - 1].time;
    }
    function addToLeaderboard(mode, name, value) {
        const board = getLeaderboard(mode);
        if (MODES[mode].endless) {
            board.push({ name: name.toUpperCase(), score: value });
            board.sort((a, b) => b.score - a.score);
        } else {
            board.push({ name: name.toUpperCase(), time: value });
            board.sort((a, b) => a.time - b.time);
        }
        if (board.length > 5) board.length = 5;
        saveLeaderboard(mode, board);
    }

    let nameInput = "";
    let nameIsNew = false;

    function formatTime(ms) {
        const s  = Math.floor(ms / 1000);
        const m  = Math.floor(s / 60);
        const ss = (s % 60).toString().padStart(2, "0");
        const cs = Math.floor((ms % 1000) / 10).toString().padStart(2, "0");
        return m > 0 ? `${m}:${ss}.${cs}` : `${s}.${cs}s`;
    }

    function startGame(mode) {
        gameMode  = mode;
        gameState = "playing";
        startTime = performance.now();
        fireflies.length    = 0;
        jarFireflies.length = 0;
        capturedFireflies   = 0;
        gameWon             = false;
        camAngle            = 0;
        targetCamAngle      = 0;
        combo               = 0;
        comboTimer          = 0;
        bonusPopups.length  = 0;
        fadeAlpha           = 1;
        fadingIn            = true;
        generateFireflies(MODES[mode]);
    }

    // Camera
    let camAngle = 0;
    let targetCamAngle = 0;
    const keys = {};

    window.addEventListener("mousemove", e => { mouseX = e.clientX; mouseY = e.clientY; });

    window.addEventListener("keydown", function(e) {
        keys[e.key] = true;

        if (e.key === "Escape") {
            if (gameState === "playing") { pausedAt = performance.now(); gameState = "paused"; }
            else if (gameState === "paused") { startTime += performance.now() - pausedAt; gameState = "playing"; }
        }

        if (gameState === "entering_name") {
            if (e.key === "Backspace") {
                nameInput = nameInput.slice(0, -1);
            } else if (/^[a-zA-Z]$/.test(e.key) && nameInput.length < 3) {
                nameInput += e.key.toUpperCase();
            } else if (e.key === "Enter" && nameInput.length === 3) {
                const val = MODES[gameMode].endless ? capturedFireflies : elapsedTime;
                addToLeaderboard(gameMode, nameInput, val);
                gameState = "won";
            }
        }
    });

    window.addEventListener("keyup", e => keys[e.key] = false);

    canvas.addEventListener("click", function(event) {
        if (gameState === "menu") {
            const cx = canvas.width / 2, cy = canvas.height / 2;
            const mx = event.clientX, my = event.clientY;
            const btnY = canvas.height * 0.38;
            if (mx > cx - 230 && mx < cx - 90  && my > btnY - 25 && my < btnY + 25) startGame("easy");
            if (mx > cx - 70  && mx < cx + 70   && my > btnY - 25 && my < btnY + 25) startGame("hard");
            if (mx > cx + 90  && mx < cx + 230  && my > btnY - 25 && my < btnY + 25) startGame("havefun");
            return;
        }
        if (gameState === "paused") return;
        if (gameState === "won" || gameState === "lost") { gameState = "menu"; return; }
        if (gameState === "entering_name") return;

        // Swing net
        netSwing = 1;
        netSwingT = 0;

        const captured = captureFirefly(event.clientX, event.clientY, camAngle);
        if (captured && !MODES[gameMode].endless) {
            const now = performance.now();
            if (now - comboTimer < COMBO_WINDOW) {
                combo++;
                if (combo >= 2) {
                    startTime -= BONUS_TIME;
                    elapsedTime = Math.min(elapsedTime, performance.now() - startTime);
                    bonusPopups.push({ x: event.clientX, y: event.clientY - 20, t: 1.0, text: `+${BONUS_TIME/1000}s!` });
                }
            } else {
                combo = 1;
            }
            comboTimer = now;
        } else if (!captured) {
            combo = 0;
        }
    });

    generateStars();
    generateForest();

    function drawNet(x, y, swing) {
        ctx.save();
        ctx.translate(x, y);

        // Cabo
        const handleAngle = -Math.PI / 2 + swing * 0.5;
        const hx = Math.cos(handleAngle) * 28;
        const hy = Math.sin(handleAngle) * 28;

        ctx.strokeStyle = "rgba(200,170,120,0.9)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(hx, hy);
        ctx.stroke();

        // Aro da rede
        const netOffY = swing * 14;
        ctx.strokeStyle = "rgba(220,200,150,0.85)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, netOffY, 14, 10, swing * 0.4, 0, Math.PI * 2);
        ctx.stroke();

        // Rede (linhas cruzadas dentro do aro)
        ctx.strokeStyle = "rgba(220,200,150,0.4)";
        ctx.lineWidth = 1;
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 7, netOffY - 10);
            ctx.lineTo(i * 5, netOffY + 10);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-14, netOffY + i * 4);
            ctx.lineTo(14, netOffY + i * 4);
            ctx.stroke();
        }

        ctx.restore();
    }

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const now = performance.now();

        if (gameState === "playing") {
            const rotSpeed = 0.03;
            if (keys["ArrowLeft"]  || keys["a"] || keys["A"]) targetCamAngle -= rotSpeed;
            if (keys["ArrowRight"] || keys["d"] || keys["D"]) targetCamAngle += rotSpeed;
            elapsedTime = now - startTime;

            if (gameWon) {
                elapsedTime = now - startTime;
                nameIsNew   = isTopFive(gameMode, elapsedTime);
                nameInput   = "";
                gameState   = nameIsNew ? "entering_name" : "won";
            } else if (elapsedTime >= TIME_LIMIT()) {
                elapsedTime = TIME_LIMIT();
                if (MODES[gameMode].endless) {
                    // Have fun: salva score por pontuação
                    nameIsNew = isTopFive(gameMode, capturedFireflies);
                    nameInput = "";
                    gameState = nameIsNew ? "entering_name" : "won";
                } else {
                    gameState = "lost";
                }
            }
        }

        // Net swing animation
        if (netSwing > 0) {
            netSwingT += 0.12;
            netSwing = Math.max(0, 1 - netSwingT);
        }

        // Fade in
        if (fadingIn) {
            fadeAlpha = Math.max(0, fadeAlpha - 0.025);
            if (fadeAlpha === 0) fadingIn = false;
        }

        // Bonus popups
        bonusPopups = bonusPopups.filter(p => p.t > 0);
        bonusPopups.forEach(p => p.t -= 0.02);

        const dawnProgress = (gameState === "playing" || gameState === "lost" || gameState === "paused") && MODES[gameMode].endless
            ? Math.max(0, (elapsedTime - DAWN_START()) / (TIME_LIMIT() - DAWN_START()))
            : 0;

        camAngle += (targetCamAngle - camAngle) * 0.06;

        drawSky(dawnProgress);
        drawStars(camAngle, dawnProgress);
        drawMoon(camAngle, dawnProgress);
        drawGround(dawnProgress);
        drawForest(camAngle);

        if (gameState === "playing" || gameState === "paused" || gameState === "entering_name") {
            // Velocidade aumenta com o tempo (até 1.5× nos últimos 10s)
            const timeRatio  = Math.min(1, elapsedTime / TIME_LIMIT());
            const speedBoost = 1 + timeRatio * 0.5;

            for (const firefly of fireflies) {
                updateFirefly(firefly, MODES[gameMode].speed * speedBoost, gameMode, mouseX, mouseY, camAngle);
                drawFirefly(firefly, camAngle);
            }
            updateJarFireflies();
        }

        drawUI();

        // Bonus popups
        for (const p of bonusPopups) {
            ctx.save();
            ctx.globalAlpha = p.t;
            ctx.fillStyle = "#ffd700";
            ctx.font = "bold 22px Arial";
            ctx.textAlign = "center";
            ctx.fillText(p.text, p.x, p.y - (1 - p.t) * 30);
            ctx.restore();
        }

        // Cursor rede (só durante o jogo)
        if (gameState === "playing" || gameState === "entering_name") {
            drawNet(mouseX, mouseY, netSwing);
        }

        // Fade overlay (só durante fade in)
        if (fadingIn && fadeAlpha > 0) {
            ctx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Cursor: none durante jogo, normal no menu
        canvas.style.cursor = (gameState === "playing" || gameState === "paused") ? "none" : "default";

        requestAnimationFrame(gameLoop);
    }

    gameLoop();
