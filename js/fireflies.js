let capturedFireflies = 0;

const fireflies = [];

function generateFireflies() {
    for (let i = 0; i < 50; i++) {

        const firefly = {

            x: Math.random() * canvas.width,

            y: Math.random() * canvas.height * 0.7,

            size: 3 + Math.random() * 2,

            speedX: -0.3 + Math.random() * 0.6,

            speedY: -0.2 + Math.random() * 0.4,

            glow: Math.random(),

            glowSpeed: 0.01 + Math.random() * 0.02,

            // Controle do movimento
            angle: Math.random() * Math.PI * 2,

            turnSpeed: -0.02 + Math.random() * 0.04
        }

        fireflies.push(firefly);
    }

}


function drawFirefly(firefly) {

    const brightness = firefly.glow;

    const glow = ctx.createRadialGradient(
        firefly.x,
        firefly.y,
        0,
        firefly.x,
        firefly.y,
        35
    );

    glow.addColorStop(
        0,
        `rgba(255, 246, 168, ${brightness})`
    );

    glow.addColorStop(
        1,
        "rgba(255, 246, 168, 0)"
    );

    ctx.fillStyle = glow;

    ctx.beginPath();

    ctx.arc(
        firefly.x,
        firefly.y,
        35,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Corpo do vagalume

    ctx.fillStyle =
        `rgba(255, 246, 168, ${brightness})`;

    ctx.beginPath();

    ctx.arc(
        firefly.x,
        firefly.y,
        firefly.size,
        0,
        Math.PI * 2
    );

    ctx.fill();
}

function updateFirefly(firefly) {

    // Movimento da direção
    firefly.angle += firefly.turnSpeed;//serve para curva

    //controla o movimento geral, alterando as direções horizontal e vertical com base no ângulo
    firefly.speedX = Math.cos(firefly.angle) * 0.5;//horizontal
    firefly.speedY = Math.sin(firefly.angle) * 0.5;//vertical

    firefly.x += firefly.speedX;
    firefly.y += firefly.speedY;


    // Limites da área dos vagalumes (bate e volta nas bordas)
    const margin = 60;
    //se bateu na esquerda, vai para direita
    if (firefly.x < margin) {
        firefly.angle = 0;
    }
    //o contrario 
    if (firefly.x > canvas.width - margin) {
        firefly.angle = Math.PI;
    }
    //y é vertical, se bateu em baixo, vai para cima 
    if (firefly.y < margin) {
        firefly.angle = Math.PI / 2;
    }
    //contrario (limitado a 0.7 pois vagalumes só chegam a 70% da tela)
    if (firefly.y > canvas.height * 0.7 - margin) {
        firefly.angle = -Math.PI / 2;
    }


    // Brilho aumenta a cada frame, diminui quando chega em 1 (efeito pisca pisca)

    firefly.glow += firefly.glowSpeed;

    if (firefly.glow > 1 || firefly.glow < 0) {
        firefly.glowSpeed *= -1;
    }
}

// Capturar vagalume com o mouse

function captureFirefly(mouseX, mouseY) {//recebe a posição do clique

    for (let i = fireflies.length - 1; i >= 0; i--) {

        const firefly = fireflies[i];

        const distance = Math.sqrt(
            (mouseX - firefly.x) ** 2 +
            (mouseY - firefly.y) ** 2
        );

        if (distance < 25) {

            fireflies.splice(i, 1);

            capturedFireflies++;

            break;
        }
    }
}