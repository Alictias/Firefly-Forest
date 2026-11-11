const forest = [];

// Field of view em radianos — quanto do círculo aparece na tela
const FOV = Math.PI * 0.7;

const LAYERS = [
    { depth: 0, radius: 0.55, count: 30, sizeMin: 200, sizeMax: 320, dark: "#0d1f18", mid: "#122518", light: "#1a3528" },
    { depth: 1, radius: 0.75, count: 40, sizeMin: 120, sizeMax: 210, dark: "#152e22", mid: "#1e4030", light: "#2a5c42" },
    { depth: 2, radius: 1.0,  count: 50, sizeMin: 70,  sizeMax: 140, dark: "#1e3d2c", mid: "#2a5540", light: "#3a7a5a" },
];

function generateForest() {
    for (const layer of LAYERS) {
        for (let i = 0; i < layer.count; i++) {
            const angle = (i / layer.count) * Math.PI * 2 + Math.random() * (Math.PI * 2 / layer.count);
            const size  = layer.sizeMin + Math.random() * (layer.sizeMax - layer.sizeMin);
            const yBase = canvas.height * 0.56;
            const yOff  = Math.random() * canvas.height * 0.04;
            forest.push({ angle, size, yBase: yBase + yOff, layer: layer.depth, radius: layer.radius });
        }
    }
}

function drawTree(screenX, screenY, size, layerIdx, scale) {
    const layer = LAYERS[layerIdx];
    const s = size * scale;

    // Shadow
    ctx.save();
    ctx.globalAlpha = (0.15 + layerIdx * 0.05) * scale;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(screenX, screenY + 4, s * 0.38, s * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Trunk
    const tw = s * 0.13, th = s * 0.38;
    const tg = ctx.createLinearGradient(screenX - tw, 0, screenX + tw, 0);
    tg.addColorStop(0, "#2a1a10");
    tg.addColorStop(0.4, "#5a3a28");
    tg.addColorStop(1, "#2a1a10");
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.moveTo(screenX - tw * 0.6, screenY);
    ctx.lineTo(screenX + tw * 0.6, screenY);
    ctx.lineTo(screenX + tw * 0.35, screenY - th);
    ctx.lineTo(screenX - tw * 0.35, screenY - th);
    ctx.closePath();
    ctx.fill();

    // Back foliage
    ctx.fillStyle = layer.dark;
    ctx.beginPath();
    ctx.moveTo(screenX, screenY - s * 1.1);
    ctx.lineTo(screenX - s * 0.62, screenY - s * 0.22);
    ctx.lineTo(screenX + s * 0.62, screenY - s * 0.22);
    ctx.closePath();
    ctx.fill();

    // Mid foliage
    ctx.fillStyle = layer.mid;
    ctx.beginPath();
    ctx.moveTo(screenX, screenY - s * 0.95);
    ctx.lineTo(screenX - s * 0.48, screenY - s * 0.28);
    ctx.lineTo(screenX + s * 0.48, screenY - s * 0.28);
    ctx.closePath();
    ctx.fill();

    // Light side gradient
    const fg = ctx.createLinearGradient(screenX - s * 0.5, 0, screenX + s * 0.5, 0);
    fg.addColorStop(0, layer.mid);
    fg.addColorStop(0.65, layer.mid);
    fg.addColorStop(1, layer.light);
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.moveTo(screenX, screenY - s * 0.95);
    ctx.lineTo(screenX - s * 0.48, screenY - s * 0.28);
    ctx.lineTo(screenX + s * 0.48, screenY - s * 0.28);
    ctx.closePath();
    ctx.fill();

    // Highlight sliver
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = layer.light;
    ctx.beginPath();
    ctx.moveTo(screenX + s * 0.05, screenY - s * 0.95);
    ctx.lineTo(screenX + s * 0.42, screenY - s * 0.32);
    ctx.lineTo(screenX + s * 0.48, screenY - s * 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawForest(camAngle) {
    // Projeta cada árvore com perspectiva cilíndrica
    const projected = [];

    for (const tree of forest) {
        // Diferença angular entre a árvore e a câmera, normalizada em [-PI, PI]
        let delta = tree.angle - camAngle;
        while (delta >  Math.PI) delta -= Math.PI * 2;
        while (delta < -Math.PI) delta += Math.PI * 2;

        // Fora do campo de visão — descarta
        if (Math.abs(delta) > FOV * 0.5 + 0.3) continue;

        // Posição X na tela: delta=0 é centro, ±FOV/2 são as bordas
        const screenX = canvas.width * 0.5 + (delta / (FOV * 0.5)) * canvas.width * 0.5;

        // Escala por profundidade: camada 0 (fundo) menor, camada 2 (frente) maior
        // radius vai de 0.55 (fundo) a 1.0 (frente) — invertemos para perspectiva
        const scale = 0.4 + (1 - tree.radius) * 1.4;

        projected.push({ tree, screenX, scale });
    }

    // Ordena: fundo primeiro (radius menor = mais longe)
    projected.sort((a, b) => a.tree.radius - b.tree.radius);

    for (const { tree, screenX, scale } of projected) {
        drawTree(screenX, tree.yBase, tree.size, tree.layer, scale);
    }

    // Ground fog
    const fog = ctx.createLinearGradient(0, canvas.height * 0.54, 0, canvas.height * 0.68);
    fog.addColorStop(0, "rgba(80,100,120,0)");
    fog.addColorStop(0.4, "rgba(60,80,100,0.18)");
    fog.addColorStop(1, "rgba(30,50,70,0)");
    ctx.fillStyle = fog;
    ctx.fillRect(0, canvas.height * 0.54, canvas.width, canvas.height * 0.14);
}
