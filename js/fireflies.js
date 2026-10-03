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
    firefly.angle += firefly.turnSpeed;

    firefly.speedX = Math.cos(firefly.angle) * 0.5;
    firefly.speedY = Math.sin(firefly.angle) * 0.5;

    firefly.x += firefly.speedX;
    firefly.y += firefly.speedY;


    // Limites da área dos vagalumes

    const margin = 60;

    if (firefly.x < margin) {
        firefly.angle = 0;
    }

    if (firefly.x > canvas.width - margin) {
        firefly.angle = Math.PI;
    }

    if (firefly.y < margin) {
        firefly.angle = Math.PI / 2;
    }

    if (firefly.y > canvas.height * 0.7 - margin) {
        firefly.angle = -Math.PI / 2;
    }


    // Brilho

    firefly.glow += firefly.glowSpeed;

    if (firefly.glow > 1 || firefly.glow < 0) {
        firefly.glowSpeed *= -1;
    }
}

// Capturar vagalume

function captureFirefly(mouseX, mouseY) {

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