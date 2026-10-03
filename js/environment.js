function drawSky() {

    // Céu
    const gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        canvas.height
    );

    gradient.addColorStop(0, "#302b5f");
    gradient.addColorStop(0.6, "#454575");
    gradient.addColorStop(1, "#6b6b91");

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
}

function drawMoon() {

    ctx.fillStyle = "#fff3c4";

    ctx.beginPath();

    ctx.arc(
        canvas.width * 0.8,
        canvas.height * 0.18,
        40,
        0,
        Math.PI * 2
    );

    ctx.fill();
}

const stars = [];

function generateStars() {

    for (let i = 0; i < 60; i++) {

        const star = {
            //posição aleatória da estrela
            x: Math.random() * canvas.width,

            y: Math.random() * canvas.height * 0.55,
            //tamanho da estrela
            size: Math.random() * 2 + 1
        };

        stars.push(star);
    }
}

function drawStars() {

    ctx.fillStyle = "#fff6d6";

    for (const star of stars) {

        ctx.beginPath();

        ctx.arc(
            star.x,
            star.y,
            star.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }
}

//desenhar chão
function drawGround() {

    ctx.fillStyle = "#253b32";

    ctx.fillRect(
        0,
        canvas.height * 0.56,
        canvas.width,
        canvas.height * 0.5
    );
}