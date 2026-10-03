
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

        captureFirefly(
            event.clientX,
            event.clientY
        );
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

        drawUI();

        requestAnimationFrame(gameLoop);
    }

    gameLoop();

