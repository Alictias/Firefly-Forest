
    const canvas = document.getElementById("game");
    
    const ctx = canvas.getContext("2d");
    //pode ser alterador para webgl para 3d dps

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.fillStyle = "#202044";
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    canvas.addEventListener("click", function(event) {
        if (gameWon) {
            // Soltar os vagalumes de volta
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
        captureFirefly(event.clientX, event.clientY);
    });

    //--------------------------------------------------------
//DESENHAR NA TELA (chamar as funções)  

    generateStars();
    generateForest();
    generateFireflies();

    function gameLoop() {

        // Limpa o quadro anterior

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        // Desenha o cenário

        drawSky();

        drawStars();

        drawMoon();

        drawGround();

        drawForest();


        // Atualiza e desenha os vagalumes

        for (const firefly of fireflies) {
            updateFirefly(firefly);
            drawFirefly(firefly);
        }

        updateJarFireflies();

        drawUI();

        requestAnimationFrame(gameLoop);
    }

    gameLoop();

