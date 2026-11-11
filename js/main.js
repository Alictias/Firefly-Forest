
    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Camera rotation state
    let camAngle = 0;
    let targetCamAngle = 0;
    const keys = {};

    window.addEventListener("keydown", e => keys[e.key] = true);
    window.addEventListener("keyup",   e => keys[e.key] = false);

    canvas.addEventListener("click", function(event) {
        if (gameWon) {
            for (const jf of jarFireflies) {
                fireflies.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height * 0.7,
                    size: 3 + Math.random() * 2,
                    speedX: 0,
                    speedY: 0,
                    glow: Math.random(),
                    glowSpeed: 0.01 + Math.random() * 0.02,
                    angle: Math.random() * Math.PI * 2,
                    turnSpeed: -0.02 + Math.random() * 0.04
                });
            }
            jarFireflies.length = 0;
            capturedFireflies = 0;
            gameWon = false;
            return;
        }
        captureFirefly(event.clientX, event.clientY, camAngle);
    });

    generateStars();
    generateForest();
    generateFireflies();

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Camera rotation via keys
        const rotSpeed = 0.03;
        if (keys["ArrowLeft"]  || keys["a"] || keys["A"]) targetCamAngle -= rotSpeed;
        if (keys["ArrowRight"] || keys["d"] || keys["D"]) targetCamAngle += rotSpeed;

        // Smooth camera lerp
        camAngle += (targetCamAngle - camAngle) * 0.06;

        drawSky();
        drawStars(camAngle);
        drawMoon(camAngle);
        drawGround();
        drawForest(camAngle);

        for (const firefly of fireflies) {
            updateFirefly(firefly);
            drawFirefly(firefly, camAngle);
        }

        updateJarFireflies();
        drawUI();

        requestAnimationFrame(gameLoop);
    }

    gameLoop();
