const forest = [];

function drawTree(x, y, size) {

    // Tronco
    ctx.fillStyle = "#5a4035";

    ctx.fillRect(
        x - size * 0.1,
        y - size * 0.4,
        size * 0.2,
        size * 0.4
    );


    // Silhueta
    ctx.fillStyle = "#193b32";

    ctx.beginPath();

    ctx.moveTo(
        x,
        y - size * 1.15
    );

    ctx.lineTo(
        x - size * 0.65,
        y - size * 0.25
    );

    ctx.lineTo(
        x + size * 0.65,
        y - size * 0.25
    );

    ctx.closePath();

    ctx.fill();


    // Copa
    ctx.fillStyle = "#315c4b";

    ctx.beginPath();

    ctx.moveTo(
        x,
        y - size
    );

    ctx.lineTo(
        x - size * 0.5,
        y - size * 0.3
    );

    ctx.lineTo(
        x + size * 0.5,
        y - size * 0.3
    );

    ctx.closePath();

    ctx.fill();
}
            
function generateForest() {

    for (let i = 0; i < 35; i++) {

        const tree = {

            x: Math.random() * canvas.width,

            y:
                canvas.height * 0.55 +
                Math.random() * canvas.height * 0.35,

            size:
                40 + Math.random() * 160
        };

        forest.push(tree);
    }

    forest.sort((a, b) => a.y - b.y);
}

function drawForest() {

    for (const tree of forest) {

        drawTree(
            tree.x,
            tree.y,
            tree.size
        );
    }
}
