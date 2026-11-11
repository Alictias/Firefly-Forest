# Documentação Técnica — Firefly Forest

## Visão Geral

Firefly Forest é um jogo de navegador desenvolvido inteiramente em **HTML5 Canvas 2D** e **JavaScript puro**, sem bibliotecas externas. O jogador captura vagalumes em uma floresta noturna 3D girando a câmera 360° e clicando nos vagalumes com uma rede.

**Tecnologias utilizadas:**
- HTML5 `<canvas>` com API de contexto `2d`
- JavaScript ES6+ (arrow functions, destructuring, template literals, `performance.now()`, `localStorage`)
- CSS mínimo (apenas reset de margens e `overflow: hidden`)

---

## Estrutura de Arquivos

```
Firefly-Forest/
├── index.html
├── css/
│   └── style.css
└── js/
    ├── environment.js   — céu, lua, estrelas, chão
    ├── forest.js        — geração e desenho das árvores
    ├── fireflies.js     — lógica e desenho dos vagalumes
    ├── ui.js            — interface: menu, HUD, telas de resultado
    └── main.js          — loop principal, câmera, estados do jogo
```

A ordem de carregamento no HTML é importante: `environment.js` e `forest.js` definem funções e constantes (como `FOV` e `worldToScreen`) que são usadas pelos arquivos seguintes.

---

## 1. Efeito 3D — Projeção Cilíndrica 360°

### Conceito

O efeito 3D é uma **ilusão de perspectiva cilíndrica** implementada em Canvas 2D. Não há WebGL nem geometria tridimensional real. A técnica simula uma câmera posicionada no centro de um cilindro, olhando para fora.

### Como funciona

Cada objeto do mundo (árvore, vagalume, estrela, lua) possui um `worldAngle` — sua posição angular no mundo, de `0` a `2π` (0° a 360°). A câmera também tem um ângulo (`camAngle`). A diferença entre os dois determina onde o objeto aparece na tela:

```js
// forest.js / fireflies.js
function worldToScreen(worldAngle, camAngle) {
    let delta = worldAngle - camAngle;
    while (delta >  Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    return canvas.width * 0.5 + (delta / (FOV * 0.5)) * canvas.width * 0.5;
}
```

- `delta = 0` → objeto está no centro da tela
- `delta = ±FOV/2` → objeto está nas bordas da tela
- `delta > FOV/2` → objeto está fora do campo de visão, descartado

O **FOV (Field of View)** é `Math.PI * 0.7` radianos (~126°), controlando quanto do círculo é visível de uma vez.

### Profundidade com 3 camadas

As árvores são distribuídas em 3 camadas com `radius` diferente (0.55, 0.75, 1.0). A escala de cada árvore na tela é calculada invertendo o radius:

```js
const scale = 0.4 + (1 - tree.radius) * 1.4;
```

- Camada 0 (fundo, `radius 0.55`) → `scale ≈ 0.63` — menor, mais escura
- Camada 2 (frente, `radius 1.0`) → `scale = 0.4` — maior, mais vívida

As árvores são ordenadas por `radius` antes de desenhar (painter's algorithm), garantindo que as do fundo sejam desenhadas primeiro e cobertas pelas da frente.

### Rotação da câmera

A câmera usa **interpolação linear (lerp)** para suavizar o movimento:

```js
// main.js
camAngle += (targetCamAngle - camAngle) * 0.06;
```

`targetCamAngle` é incrementado pelas teclas A/D ou setas. O fator `0.06` cria uma desaceleração suave — quanto mais próximo do alvo, mais devagar a câmera se move.

---

## 2. Desenho das Árvores com Volume

### Técnica de iluminação 2.5D

Cada árvore é composta por múltiplas camadas de triângulos sobrepostos, simulando volume e iluminação lateral da lua:

1. **Sombra no chão** — elipse achatada com `globalAlpha` reduzido, centralizada na base do tronco
2. **Tronco cônico** — trapézio com gradiente horizontal (escuro nas bordas, claro no centro)
3. **Folhagem traseira** — triângulo maior na cor mais escura da camada, simula a sombra do volume
4. **Folhagem principal** — triângulo médio com gradiente horizontal: lado esquerdo escuro, lado direito claro (luz da lua vindo da direita)
5. **Sliver de highlight** — triângulo fino no lado direito com `globalAlpha 0.5`, simula o brilho direto da lua no topo

```js
// forest.js — gradiente lateral simulando luz da lua
const fg = ctx.createLinearGradient(screenX - s * 0.5, 0, screenX + s * 0.5, 0);
fg.addColorStop(0, layer.mid);
fg.addColorStop(0.65, layer.mid);
fg.addColorStop(1, layer.light);
```

### Paleta por camada

Cada camada tem três tons de verde:

| Camada | dark | mid | light |
|--------|------|-----|-------|
| Fundo | `#0d1f18` | `#122518` | `#1a3528` |
| Meio | `#152e22` | `#1e4030` | `#2a5c42` |
| Frente | `#1e3d2c` | `#2a5540` | `#3a7a5a` |

As camadas do fundo são mais escuras e azuladas (simulando névoa de distância), as da frente são mais saturadas e vívidas.

### Névoa rasteira

Após desenhar todas as árvores, um gradiente linear vertical é aplicado na linha do horizonte:

```js
const fog = ctx.createLinearGradient(0, canvas.height * 0.54, 0, canvas.height * 0.68);
fog.addColorStop(0.4, "rgba(60,80,100,0.18)");
```

---

## 3. Ambiente — Céu, Lua e Estrelas

### Lua com halo

A lua é desenhada em três passes com `createRadialGradient`:
1. **Halo externo** — raio 130px, opacidade 12%, simula a difusão atmosférica
2. **Glow interno** — raio 60px, opacidade 35%
3. **Corpo** — gradiente radial deslocado para simular iluminação interna

A lua tem um `MOON_WORLD_ANGLE` fixo no mundo (`Math.PI * 0.3`), projetada com `worldToScreen` como qualquer outro objeto, desaparecendo quando a câmera gira para longe dela.

### Estrelas com twinkle

120 estrelas com `worldAngle` aleatório. Cada uma tem `glow` e `glowSpeed` individuais que oscilam entre 0 e 1 a cada frame, criando o efeito de cintilação independente:

```js
star.glow += star.glowSpeed;
if (star.glow > 1 || star.glow < 0) star.glowSpeed *= -1;
const alpha = (0.4 + star.glow * 0.6) * (1 - dawn);
```

### Amanhecer gradual (modo Have Fun)

A função `lerpColor` interpola componente a componente entre duas cores hex:

```js
function lerpColor(a, b, t) {
    // extrai R, G, B de cada cor e interpola linearmente
    const r = Math.round(ar + (br - ar) * t);
    ...
}
```

`dawnProgress` vai de 0 a 1 entre os 40s e 60s do modo Have Fun. Com ele:
- O céu interpola de roxo escuro para laranja/azul do amanhecer
- Um brilho de horizonte laranja aparece com `opacity = dawn * 0.35`
- Estrelas e lua somem multiplicando sua opacidade por `(1 - dawn)`
- O chão clareia levemente

---

## 4. Vagalumes — Movimento e Captura

### Representação no mundo

Cada vagalume tem:
- `worldAngle` — posição horizontal no mundo (0 a 2π), normalizado a cada frame
- `y` — posição vertical em pixels
- `moveAngle` — direção atual do movimento (em radianos)
- `turnSpeed` — taxa de curvatura aleatória, cria trajetórias orgânicas
- `glow` / `glowSpeed` — controle do brilho pulsante

### Movimento orgânico

O movimento usa um sistema de ângulo acumulativo: a cada frame, `moveAngle` é incrementado por `turnSpeed`, e a velocidade é decomposta em componentes horizontal (worldAngle) e vertical (y):

```js
firefly.moveAngle += firefly.turnSpeed;
firefly.worldAngle += Math.cos(firefly.moveAngle) * 0.0008 * speed;
firefly.y          += Math.sin(firefly.moveAngle) * 0.5 * speed;
```

Isso cria trajetórias curvilíneas suaves sem precisar de física complexa.

### Fuga do mouse (modo Hard)

No modo Hard, cada vagalume verifica a distância angular até o cursor. A posição do mouse em pixels é convertida para `worldAngle` com `screenToWorldAngle` (inverso de `worldToScreen`). Se o vagalume estiver dentro de um raio de 180px (em espaço de tela), ele vira progressivamente para longe:

```js
const fleeAngle = Math.atan2(dy, dAngle * canvas.width);
const diff = fleeAngle - firefly.moveAngle;
firefly.moveAngle += Math.sign(Math.sin(diff)) * 0.08;
speed *= 1 + (1 - screenDist / FLEE_RADIUS) * 1.2;
```

O `Math.sign(Math.sin(diff))` determina o sentido de rotação mais curto para virar na direção de fuga.

### Aceleração progressiva

A velocidade aumenta com o tempo em todos os modos:

```js
const timeRatio  = Math.min(1, elapsedTime / TIME_LIMIT());
const speedBoost = 1 + timeRatio * 0.5; // até 1.5× no final
```

### Captura

A detecção de captura compara a distância euclidiana entre o clique e a posição projetada do vagalume na tela (não no mundo), com raio de 35px:

```js
const screenX = worldToScreen(firefly.worldAngle, camAngle);
const dist = Math.sqrt((mouseX - screenX) ** 2 + (mouseY - firefly.y) ** 2);
if (dist < 35) { ... }
```

---

## 5. Jarra de Vidro

A jarra é desenhada com `Path2D.roundRect` e múltiplas camadas:
- **Brilho interno** — `createRadialGradient` que intensifica conforme mais vagalumes são capturados
- **Vagalumes internos** — clipping path limita o desenho ao interior da jarra; posições normalizadas (0–1) mapeadas para pixels
- **Vidro** — fill com `rgba(180,220,255,0.08)` e stroke com `rgba(200,230,255,0.7)`
- **Reflexo** — retângulo estreito com `rgba(255,255,255,0.13)` no lado esquerdo

Os vagalumes dentro da jarra têm movimento e glow atualizados em `updateJarFireflies()`, chamado no game loop separado do draw, evitando acumulação de velocidade.

---

## 6. Sistema de Jogo

### Máquina de estados

O jogo usa uma variável `gameState` com 6 estados possíveis:

```
menu → playing → won / lost / entering_name
         ↕
       paused
```

- `menu` — tela inicial com leaderboards
- `playing` — jogo ativo
- `paused` — jogo congelado (ESC), timer pausado
- `entering_name` — input de 3 letras após entrar no top 5
- `won` — tela de vitória com ranking
- `lost` — tela de game over (Easy/Hard apenas)

### Pausa com timer correto

Ao pausar, `pausedAt = performance.now()` é salvo. Ao retomar, o tempo pausado é adicionado ao `startTime`:

```js
startTime += performance.now() - pausedAt;
```

Isso garante que `elapsedTime = performance.now() - startTime` continue correto após a pausa.

### Modos de jogo

```js
const MODES = {
    easy:    { count: 75, limit: 10, speed: 1.0, timeLimit: 10000,  endless: false },
    hard:    { count: 75, limit: 20, speed: 1.8, timeLimit: 10000,  endless: false },
    havefun: { count: 75, limit: Infinity, speed: 1.2, timeLimit: 60000, endless: true }
};
```

- Easy/Hard: capturar `limit` vagalumes antes do tempo acabar. Vitória ao atingir o limite, derrota ao esgotar o tempo.
- Have Fun: tempo fixo de 60s, capturar o máximo possível. Ao acabar o tempo, vai direto para a tela de resultado.

### Combo e bônus de tempo

Exclusivo dos modos Easy e Hard. Capturar vagalumes em sequência com menos de 1500ms de intervalo incrementa o combo. A partir do 2º consecutivo, `+3s` são adicionados subtraindo 3000ms do `startTime`:

```js
startTime -= BONUS_TIME; // recua o início, aumentando o tempo restante
```

---

## 7. Leaderboard

Os recordes são salvos no `localStorage` do navegador em formato JSON, separados por modo:

```
localStorage["leaderboard_easy"]    → [{name, time}, ...]   ordenado por tempo crescente
localStorage["leaderboard_hard"]    → [{name, time}, ...]   ordenado por tempo crescente
localStorage["leaderboard_havefun"] → [{name, score}, ...]  ordenado por score decrescente
```

Ao vencer, `isTopFive()` verifica se o resultado entra no top 5. Se sim, o jogo entra no estado `entering_name` onde o jogador digita 3 letras via teclado. O input é validado com regex `/^[a-zA-Z]$/` e confirmado com Enter.

---

## 8. Cursor Rede

O cursor padrão do navegador é ocultado com `canvas.style.cursor = "none"` durante o jogo. A rede é desenhada a cada frame na posição do mouse com `ctx.translate`:

- **Cabo** — linha com ângulo calculado por `Math.cos/sin` do `handleAngle`
- **Aro** — elipse com rotação proporcional ao `swing`
- **Malha** — linhas verticais e horizontais dentro do aro

Ao clicar, `netSwing = 1` e `netSwingT = 0`. A cada frame, `netSwingT += 0.12` e `netSwing = Math.max(0, 1 - netSwingT)`, criando uma animação de descida e retorno em ~8 frames.

---

## 9. Fade In

Ao iniciar uma partida, `fadeAlpha = 1` e `fadingIn = true`. A cada frame, `fadeAlpha` é decrementado em `0.025` (40 frames ≈ 667ms para completar). Um retângulo preto com essa opacidade é desenhado por cima de tudo, criando a transição suave de entrada.

---

## 10. Game Loop

O loop principal usa `requestAnimationFrame` para sincronizar com o refresh do monitor (~60fps). A ordem de desenho por frame é:

1. `clearRect` — limpa o frame anterior
2. `drawSky` → `drawStars` → `drawMoon` → `drawGround` — ambiente (fundo para frente)
3. `drawForest` — árvores ordenadas por profundidade
4. `updateFirefly` + `drawFirefly` — vagalumes (camada do meio)
5. `updateJarFireflies` — atualiza vagalumes da jarra
6. `drawUI` — interface (sempre por cima de tudo)
7. Bonus popups — texto "+3s!" animado
8. `drawNet` — cursor rede (último, sempre visível)
9. Fade overlay — se ativo, por cima de absolutamente tudo
