
function drawUI() {

    ctx.fillStyle = "#fff6d6";

    ctx.font = "20px Arial";

    ctx.textAlign = "left";

    ctx.fillText(
        `Vagalumes: ${capturedFireflies} / 50`,
        25,
        35
    );
}