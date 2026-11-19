// ===== Arma tu piñata =====

// TODO 4: ¿Qué tiene tu piñata adentro?
// Pon cada cosa entre comillas y sepáralas con comas. En el celular puedes usar el teclado de emojis.
// Ejemplo: const dulces = ['🍬', '🍭', '🥜', '🍊', '🦖'];
const dulces = ['🥜', '🍊', '🍬', '🍭', '🎋', '🍫'];

// TODO 6: ¿Cuántos golpes aguanta antes de romperse?
const resistencia = 10;

// TODO 7: ¿Qué tan traviesa es la persona que jala la cuerda? Elige del 0 al 3.
// 0 = no se mueve, 1 = se mece, 2 = la suben, la bajan y le dan jalones, 3 = no tiene piedad
const travesura = 2;


// ===== A partir de aquí no necesitas cambiar nada, pero puedes explorar =====

const letra = [
  'Dale, dale, dale,',
  'no pierdas el tino,',
  'porque si lo pierdes,',
  'pierdes el camino.',
  'Ya le diste uno,',
  'ya le diste dos,',
  'ya le diste tres',
  '¡y tu tiempo se acabó!',
];
const golpesFuertes = ['¡Pum!', '¡Paf!', '¡Zas!', '¡Toing!', '¡Cuas!'];

const niveles = [
  { mecer: 0, subir: 0, rapidez: 1 },
  { mecer: 16, subir: 30, rapidez: 1.2 },
  { mecer: 26, subir: 80, rapidez: 1.5 },
  { mecer: 36, subir: 140, rapidez: 2.1 },
];

const limitar = (n, min, max) => Math.min(max, Math.max(min, Math.round(Number(n) || 0)));
const golpesNecesarios = limitar(resistencia, 1, 999);
const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
const movimiento = sinMovimiento ? niveles[0] : niveles[limitar(travesura, 0, 3)];
const contenido = dulces.length > 0 ? dulces : ['🍬'];

const patio = document.querySelector('#patio');
const colgante = document.querySelector('#colgante');
const cuerda = document.querySelector('#cuerda');
const pinata = document.querySelector('#pinata');
const dibujo = document.querySelector('#dibujo');
const verso = document.querySelector('#verso');
const marcador = document.querySelector('#marcador');
const final = document.querySelector('#final');
const resumen = document.querySelector('#resumen');
const botonOtra = document.querySelector('#otra');
const capa = document.querySelector('#capa');
const palo = document.querySelector('#palo');
const bolsa = document.querySelector('#bolsa');
const contadorBolsa = document.querySelector('#contador-bolsa');

document.title = document.querySelector('.titulo').textContent.trim();
patio.style.setProperty('--subir', `${movimiento.subir}px`);

let golpes = 0;
let intentos = 0;
let rota = false;
let juntados = 0;
let linea = 0;
let conos = [];
let grietas = [];
let piezas = [];

// ----- Dibujo de la piñata (SVG) -----

const SVG = 'http://www.w3.org/2000/svg';

const azar = (min, max) => min + Math.random() * (max - min);
const xy = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;

function crear(etiqueta, atributos, padre) {
  const elemento = document.createElementNS(SVG, etiqueta);
  for (const [nombre, valor] of Object.entries(atributos)) {
    elemento.setAttribute(nombre, valor);
  }
  padre.append(elemento);
  return elemento;
}

// Esta piñata es un burro: cada parte es un rectángulo con tiras de papel de china
const FRANJA = 13;

function parte(padre, { x, y, ancho, alto, transformar, color = 1 }) {
  const grupo = crear('g', transformar ? { transform: transformar } : {}, padre);
  let n = color;
  for (let fila = y; fila < y + alto; fila += FRANJA) {
    crear('rect', { x, y: fila, width: ancho, height: Math.min(FRANJA, y + alto - fila), class: `relleno-${n}` }, grupo);
    if (fila + FRANJA < y + alto) {
      crear('path', { d: `M${x + 3} ${fila + FRANJA} H${x + ancho - 3}`, class: `fleco trazo-${n}` }, grupo);
    }
    n = (n % 3) + 1;
  }
  crear('rect', { x, y, width: ancho, height: alto, rx: 6, fill: 'none', class: 'contorno' }, grupo);
  return grupo;
}

function guardarPedazo(grupo, centro, angulo = Math.atan2(centro[1], centro[0])) {
  conos.push({ grupo, angulo, centro });
}

function dibujarPinata() {
  dibujo.replaceChildren();
  conos = [];

  // Cola de papel
  const cola = crear('g', {}, dibujo);
  [[-148, -30], [-151, -18], [-149, -6], [-145, 4], [-139, 12]].forEach((fin, i) => {
    crear('path', { d: `M-106 -46 L${xy(fin)}`, class: `borla trazo-${(i % 3) + 1}` }, cola);
  });
  guardarPedazo(cola, [-130, -15]);

  // Patas con sus cascos
  for (const [x, color] of [[-96, 2], [-62, 3], [28, 2], [60, 3]]) {
    const pata = parte(dibujo, { x, y: 26, ancho: 26, alto: 90, color });
    crear('rect', { x, y: 112, width: 26, height: 14, rx: 4, fill: '#2B1D14' }, pata);
    guardarPedazo(pata, [x + 13, 72]);
  }

  // Cuerpo: la cuerda lo sostiene del lomo, en (0, -62)
  guardarPedazo(parte(dibujo, { x: -112, y: -62, ancho: 204, alto: 96, color: 1 }), [-10, -14], -Math.PI / 2);

  // Cuello
  guardarPedazo(parte(dibujo, { x: -20, y: -78, ancho: 40, alto: 84, color: 3, transformar: 'translate(70 -40) rotate(28)' }), [95, -75]);

  // Orejas
  for (const [x, y, giro] of [[96, -134, -20], [116, -138, 8]]) {
    const oreja = crear('g', { transform: `translate(${x} ${y}) rotate(${giro})` }, dibujo);
    crear('ellipse', { cx: 0, cy: -24, rx: 10, ry: 26, class: 'relleno-2 contorno' }, oreja);
    crear('ellipse', { cx: 0, cy: -22, rx: 4, ry: 16, class: 'relleno-cuerpo' }, oreja);
    guardarPedazo(oreja, [x, y - 24]);
  }

  // Cabeza con hocico y ojo
  const cabeza = parte(dibujo, { x: -16, y: -24, ancho: 76, alto: 46, color: 1, transformar: 'translate(108 -118) rotate(22)' });
  crear('rect', { x: 38, y: -22, width: 24, height: 42, rx: 9, class: 'relleno-cuerpo contorno' }, cabeza);
  crear('circle', { cx: 52, cy: 8, r: 3, fill: '#2B1D14' }, cabeza);
  crear('circle', { cx: 14, cy: -6, r: 5.5, fill: '#2B1D14' }, cabeza);
  crear('circle', { cx: 15.5, cy: -7.5, r: 1.8, fill: '#FFFFFF' }, cabeza);
  guardarPedazo(cabeza, [130, -105]);

  // Grietas: aparecen poco a poco con cada golpe, solo sobre el cuerpo
  const capaGrietas = crear('g', {}, dibujo);
  grietas = [];
  const dentro = ([x, y]) => x > -108 && x < 88 && y > -58 && y < 30;
  for (let i = 0; i < 6; i++) {
    let punto = [azar(-80, 60), azar(-40, 15)];
    let rumbo = azar(0, 2 * Math.PI);
    let d = `M${xy(punto)}`;
    for (let paso = 0; paso < 6 && dentro(punto); paso++) {
      rumbo += azar(-0.6, 0.6);
      punto = [punto[0] + Math.cos(rumbo) * azar(12, 20), punto[1] + Math.sin(rumbo) * azar(12, 20)];
      punto = [Math.min(88, Math.max(-108, punto[0])), Math.min(30, Math.max(-58, punto[1]))];
      d += ` L${xy(punto)}`;
    }
    grietas.push(crear('path', { d, class: 'grieta' }, capaGrietas));
  }
}

// ----- Golpes -----

function cantar() {
  verso.textContent = letra[linea % letra.length];
  linea++;
  reiniciarAnimacion(verso, 'nuevo');
}

function reiniciarAnimacion(elemento, clase) {
  elemento.classList.remove(clase);
  void elemento.offsetWidth;
  elemento.classList.add(clase);
}

function batear(x, y) {
  const lado = x < innerWidth / 2 ? 'izquierda' : 'derecha';
  palo.className = `palo ${lado}`;
  palo.style.left = `${x}px`;
  palo.style.top = `${y}px`;
  reiniciarAnimacion(palo, 'activo');
}

function mostrarTexto(x, y, texto, clase = '') {
  const pum = document.createElement('p');
  pum.className = `pum ${clase}`;
  pum.textContent = texto;
  pum.style.left = `${x}px`;
  pum.style.top = `${y}px`;
  pum.addEventListener('animationend', () => pum.remove());
  document.body.append(pum);
}

function pegar(x, y) {
  if (rota) return;
  golpes++;
  intentos++;
  cantar();
  batear(x, y);
  mostrarTexto(x, y, golpesFuertes[Math.floor(Math.random() * golpesFuertes.length)]);
  reiniciarAnimacion(dibujo, 'golpe');

  // Si le pegas del lado izquierdo, la piñata se va a la derecha (y al revés)
  const caja = pinata.getBoundingClientRect();
  const direccion = x < caja.left + caja.width / 2 ? -1 : 1;
  pendulo.velocidad += direccion * azar(70, 120);

  const visibles = Math.floor((golpes / golpesNecesarios) * (grietas.length + 1));
  grietas.forEach((grieta, i) => grieta.classList.toggle('visible', i < visibles));
  marcador.textContent = `Golpes: ${golpes}`;

  if (golpes >= golpesNecesarios) romper();
}

function fallar(x, y) {
  if (rota) return;
  intentos++;
  cantar();
  batear(x, y);
  mostrarTexto(x, y, '¡Aire!', 'aire');
}

// Con el dedo o el mouse: solo cuenta si tocas el dibujo
pinata.addEventListener('pointerdown', (evento) => {
  evento.stopPropagation();
  pegar(evento.clientX, evento.clientY);
});

// Con el teclado (Enter o espacio)
pinata.addEventListener('click', (evento) => {
  if (evento.detail !== 0) return;
  const caja = pinata.getBoundingClientRect();
  pegar(caja.left + caja.width * azar(0.3, 0.7), caja.top + caja.height * 0.5);
});

patio.addEventListener('pointerdown', (evento) => {
  if (evento.target.closest('.final')) return;
  fallar(evento.clientX, evento.clientY);
});

// ----- ¡Se rompió! -----

function agregarPieza(pieza) {
  capa.append(pieza.el);
  piezas.push({ giro: 0, vgiro: 0, gravedad: 1400, ...pieza });
}

function romper() {
  rota = true;
  // Las posiciones son relativas a la tarjeta, que es donde caen los dulces
  const origen = capa.getBoundingClientRect();
  const caja = dibujo.getBoundingClientRect();
  const tam = dibujo.offsetWidth;
  const centroX = caja.left + caja.width / 2 - origen.left;
  const centroY = caja.top + caja.height / 2 - origen.top;
  const escala = tam / 400;

  if (!sinMovimiento) {
    // Cada pico sale volando por su lado
    for (const cono of conos) {
      const svg = document.createElementNS(SVG, 'svg');
      svg.setAttribute('viewBox', '-200 -200 400 400');
      svg.setAttribute('class', 'fragmento');
      svg.style.width = svg.style.height = `${tam}px`;
      svg.style.transformOrigin = `${(cono.centro[0] + 200) * escala}px ${(cono.centro[1] + 200) * escala}px`;
      svg.append(cono.grupo.cloneNode(true));
      const fuerza = azar(220, 420);
      agregarPieza({
        el: svg,
        tipo: 'fragmento',
        x: centroX - tam / 2,
        y: centroY - tam / 2,
        vx: Math.cos(cono.angulo) * fuerza,
        vy: Math.sin(cono.angulo) * fuerza - 250,
        vgiro: azar(-300, 300),
        vida: 1.6,
      });
    }

    // Confeti de papel de china
    for (let i = 0; i < 45; i++) {
      const confeti = document.createElement('span');
      confeti.className = 'confeti';
      confeti.style.background = `var(${['--color-1', '--color-2', '--color-3', '--cuerpo'][i % 4]})`;
      agregarPieza({
        el: confeti,
        tipo: 'confeti',
        x: centroX + azar(-30, 30),
        y: centroY + azar(-30, 30),
        vx: azar(-380, 380),
        vy: azar(-650, -150),
        vgiro: azar(-720, 720),
        gravedad: 700,
        fase: azar(0, 6),
        vida: azar(2.5, 4),
      });
    }
  }

  // Los dulces caen al piso
  for (let i = 0; i < 28; i++) {
    const dulce = document.createElement('span');
    dulce.className = 'dulce';
    dulce.textContent = contenido[i % contenido.length];
    const pieza = {
      el: dulce,
      tipo: 'dulce',
      x: centroX + azar(-20, 20),
      y: centroY + azar(-20, 20),
      vx: azar(-280, 280),
      vy: azar(-560, -120),
      vgiro: azar(-400, 400),
      suelo: capa.clientHeight - azar(18, 46),
    };
    dulce.addEventListener('pointerdown', () => juntar(pieza));
    agregarPieza(pieza);
  }

  pinata.hidden = true;
  marcador.hidden = true;
  verso.textContent = '';
  bolsa.hidden = false;

  setTimeout(() => {
    resumen.textContent = `Le pegaste ${golpes} ${golpes === 1 ? 'vez' : 'veces'} en ${intentos} ${intentos === 1 ? 'intento' : 'intentos'}. Toca los dulces para juntarlos.`;
    final.hidden = false;
    botonOtra.focus({ preventScroll: true });
  }, 700);
}

function juntar(pieza) {
  if (pieza.juntado) return;
  pieza.juntado = true;
  const origen = capa.getBoundingClientRect();
  const destino = bolsa.getBoundingClientRect();
  const x = destino.left + destino.width / 2 - origen.left;
  const y = destino.top + destino.height / 2 - origen.top;
  pieza.el.style.transition = 'transform 0.45s cubic-bezier(0.5, -0.4, 0.7, 1), opacity 0.45s ease';
  pieza.el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(0.4)`;
  pieza.el.style.opacity = '0';
  setTimeout(() => {
    pieza.el.remove();
    piezas = piezas.filter((otra) => otra !== pieza);
    juntados++;
    contadorBolsa.textContent = juntados;
    reiniciarAnimacion(bolsa, 'lleno');
  }, 450);
}

botonOtra.addEventListener('click', () => {
  piezas.forEach((pieza) => pieza.el.remove());
  piezas = [];
  golpes = 0;
  intentos = 0;
  linea = 0;
  rota = false;
  pendulo.angulo = 0;
  pendulo.velocidad = 0;
  dibujarPinata();
  pinata.hidden = false;
  marcador.hidden = false;
  marcador.textContent = 'Golpes: 0';
  verso.textContent = 'Toca la piñata para pegarle';
  final.hidden = true;
  pinata.focus({ preventScroll: true });
});

// ----- Movimiento: la piñata se mece y la suben y bajan -----

const pendulo = { angulo: 0, velocidad: 0 };
let tiempo = 0;
let anterior = performance.now();
let largoCuerda = cuerda.offsetHeight;
let jalon = 0;
let siguienteJalon = azar(2, 4);
addEventListener('resize', () => { largoCuerda = cuerda.offsetHeight; });

function moverPiezas(dt) {
  for (const p of piezas) {
    if (p.juntado || p.quieto) continue;

    p.vy += p.gravedad * dt;
    if (p.tipo === 'confeti') {
      p.vx *= 1 - 1.8 * dt;
      p.vy = Math.min(p.vy, 130);
      p.x += Math.sin(tiempo * 6 + p.fase) * 40 * dt;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.giro += p.vgiro * dt;

    if (p.tipo === 'dulce') {
      if (p.y > p.suelo) {
        p.y = p.suelo;
        p.vy = Math.abs(p.vy) < 90 ? 0 : p.vy * -0.35;
        p.vx *= 0.6;
        p.vgiro *= 0.5;
        if (p.vy === 0 && Math.abs(p.vx) < 2) p.quieto = true;
      }
      const pared = capa.clientWidth - 20;
      if (p.x < 20 || p.x > pared) {
        p.x = Math.min(pared, Math.max(20, p.x));
        p.vx *= -0.5;
      }
      p.el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) rotate(${p.giro}deg)`;
    } else {
      p.vida -= dt;
      p.el.style.opacity = Math.min(1, Math.max(0, p.vida));
      const centrar = p.tipo === 'confeti' ? ' translate(-50%, -50%)' : '';
      p.el.style.transform = `translate(${p.x}px, ${p.y}px)${centrar} rotate(${p.giro}deg)`;
    }
  }

  piezas = piezas.filter((p) => {
    if (p.vida !== undefined && p.vida <= 0) {
      p.el.remove();
      return false;
    }
    return true;
  });
}

function animar(ahora) {
  const dt = Math.min(0.05, (ahora - anterior) / 1000);
  anterior = ahora;
  tiempo += dt * movimiento.rapidez;

  // Un péndulo con resorte: se mece solo y reacciona a cada golpe
  // Dos vaivenes mezclados para que no sea fácil adivinar a dónde va
  const objetivo = movimiento.mecer * (0.65 * Math.sin(tiempo * 1.3) + 0.35 * Math.sin(tiempo * 2.9 + 1));
  pendulo.velocidad += (-(pendulo.angulo - objetivo) * 28 - pendulo.velocidad * 2.2) * dt;
  pendulo.angulo += pendulo.velocidad * dt;

  // De vez en cuando, quien jala la cuerda le da un jalón hacia arriba
  if (movimiento.subir > 0) {
    siguienteJalon -= dt;
    if (siguienteJalon <= 0) {
      jalon = 1;
      siguienteJalon = azar(1.5, 4) / movimiento.rapidez;
      pendulo.velocidad += azar(-3, 3) * movimiento.mecer;
    }
    jalon = Math.max(0, jalon - dt * 1.8);
  }
  const subida = 1 - Math.sin(jalon * Math.PI);
  const bajada = movimiento.subir * ((1 - Math.cos(tiempo * 1.6)) / 2) * (0.6 + 0.4 * Math.sin(tiempo * 0.5)) * subida;

  colgante.style.transform = `rotate(${pendulo.angulo}deg)`;
  cuerda.style.transform = `scaleY(${(largoCuerda + bajada) / largoCuerda})`;
  pinata.style.transform = `translateY(${bajada}px)`;

  moverPiezas(dt);
  requestAnimationFrame(animar);
}

dibujarPinata();
requestAnimationFrame(animar);
