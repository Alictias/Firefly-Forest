
    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Game state
    let gameState = "menu"; // "menu" | "playing" | "won" | "lost" | "entering_name"
    let gameMode  = "easy";
    let startTime = 0;
    let elapsedTime = 0;

    const MODES = {
        easy: { count: 75, limit: 10, speed: 1.0 },
        hard: { count: 75, limit: 10, speed: 1.8 }
    };

    const TIME_LIMIT = 60000;
    const DAWN_START = 40000;

    // --- Leaderboard (top 5 por modo) ---
    function getLeaderboard(mode) {
        const val = localStorage.getItem(`leaderboard_${mode}`);
        return val ? JSON.parse(val) : [];
    }

    function saveLeaderboard(mode, entries) {
        localStorage.setItem(`leaderboard_${mode}`, JSON.stringify(entries));
    }

    // Retorna true se o tempo entra no top 5
    function isTopFive(mode, time) {
        const board = getLeaderboard(mode);
        return board.length < 5 || time < board[board.length - 1].time;
    }

    function addToLeaderboard(mode, name, time) {
        const board = getLeaderboard(mode);
        board.push({ name: name.toUpperCase(), time });
        board.sort((a, b) => a.time - b.time);
        if (board.length > 5) board.length = 5;
        saveLeaderboard(mode, board);
    }

    // --- Name input state ---
    let nameInput   = "";
    let nameIsNew   = false; // se entrou no top 5

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
        generateFireflies(MODES[mode]);
    }

    // Camera
    let camAngle = 0;
    let targetCamAngle = 0;
    const keys = {};

    window.addEventListener("keydown", function(e) {
        keys[e.key] = true;

        if (gameState === "entering_name") {
            if (e.key === "Backspace") {
                nameInput = nameInput.slice(0, -1);
            } else if (/^[a-zA-Z]$/.test(e.key) && nameInput.length < 3) {
                nameInput += e.key.toUpperCase();
            } else if (e.key === "Enter" && nameInput.length === 3) {
                addToLeaderboard(gameMode, nameInput, elapsedTime);
                gameState = "won";
            }
        }
    });

    window.addEventListener("keyup", e => keys[e.key] = false);

    canvas.addEventListener("click", function(event) {
        if (gameState === "menu") {
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const mx = event.clientX, my = event.clientY;
            if (mx > cx - 160 && mx < cx - 10 && my > cy + 5 && my < cy + 55) startGame("easy");
            if (mx > cx + 10  && mx < cx + 160 && my > cy + 5 && my < cy + 55) startGame("hard");
            return;
        }
        if (gameState === "won" || gameState === "lost") {
            gameState = "menu";
            return;
        }
        if (gameState === "entering_name") return;

        captureFirefly(event.clientX, event.clientY, camAngle);
    });

    generateStars();
    generateForest();

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (gameState === "playing") {
            const rotSpeed = 0.03;
            if (keys["ArrowLeft"]  || keys["a"] || keys["A"]) targetCamAngle -= rotSpeed;
            if (keys["ArrowRight"] || keys["d"] || keys["D"]) targetCamAngle += rotSpeed;
            elapsedTime = performance.now() - startTime;

            if (gameWon) {
                elapsedTime = performance.now() - startTime;
                nameIsNew   = isTopFive(gameMode, elapsedTime);
                nameInput   = "";
                gameState   = nameIsNew ? "entering_name" : "won";
            } else if (elapsedTime >= TIME_LIMIT) {
                elapsedTime = TIME_LIMIT;
                gameState   = "lost";
            }
        }

        const dawnProgress = (gameState === "playing" || gameState === "lost")
            ? Math.max(0, (elapsedTime - DAWN_START) / (TIME_LIMIT - DAWN_START))
            : 0;

        camAngle += (targetCamAngle - camAngle) * 0.06;

        drawSky(dawnProgress);
        drawStars(camAngle, dawnProgress);
        drawMoon(camAngle, dawnProgress);
        drawGround(dawnProgress);
        drawForest(camAngle);

        if (gameState === "playing" || gameState === "entering_name") {
            for (const firefly of fireflies) {
                updateFirefly(firefly, MODES[gameMode].speed);
                drawFirefly(firefly, camAngle);
            }
            updateJarFireflies();
        }

        drawUI();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
