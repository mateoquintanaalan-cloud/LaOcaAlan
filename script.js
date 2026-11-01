
let nomJugador = "Jugador A";
const MAX_TIRADES = 6;
const ULTIMA_CASILLA = 36; // La imagen elegida llega a la casilla 36

function sumar(a, b) { return a + b; }
function multiplicar(a, b) { return a * b; }

class Jugador {
    constructor(nombre, letra) {
        this.nombre = nombre;
        this.letra = letra;
        this.posicion = 0;
        this.activado = letra === "A";
        this.pierdeTurno = false;
    }
}

const jugadorA = new Jugador("Jugador A", "A");
const jugadorB = new Jugador("Jugador B", "B");
const { nombre, posicion } = jugadorA; // Ejemplo de desestructuración

let estado = "inicio";
let turno = "A";
let guanyador = null;
let ultimaTirada = null;
let esperandoPregunta = false;
let animando = false;
let jugadorPregunta = null;

let dataPartida = new Date();

const nombresCasillas = [];
for (let i = 0; i <= 36; i++) {
    if (i == 0) nombresCasillas.push("Salida");
    else if (i == 36) nombresCasillas.push("Llegada");
    else nombresCasillas.push("Casilla " + i);
}

const casellesExercici10 = [];
for (let i = 0; i <= 20; i++) {
    casellesExercici10.push(i);
}
const casillas = [];
for (let i = 0; i <= 36; i++) {
    casillas.push(i);
}

const casellesEspecials = {
    4: { tipo: "avanza", destino: 9, mensaje: "Casilla 4: avanza a la 9." },
    11: { tipo: "inicio", mensaje: "Casilla 11: vuelve a la salida." },
    16: { tipo: "pierde", mensaje: "Casilla 16: pierdes el siguiente turno." }
};

const preguntas = [
    { pregunta: "¿Cuánto es 2 + 2?", respuestas: ["3", "4", "5"], correcta: 1 },
    { pregunta: "¿Qué lenguaje modifica el DOM?", respuestas: ["CSS", "HTML", "JavaScript"], correcta: 2 },
    { pregunta: "¿Cuánto es 5 x 2?", respuestas: ["10", "15", "20"], correcta: 0 },
    { pregunta: "¿Qué palabra declara una constante?", respuestas: ["let", "const", "varios"], correcta: 1 },
    { pregunta: "¿Cuál es el índice del primer elemento de un array?", respuestas: ["0", "1", "2"], correcta: 0 },
    { pregunta: "¿Qué método convierte un objeto a JSON?", respuestas: ["JSON.parse", "JSON.stringify", "Math.random"], correcta: 1 }
];

const centros = [
    [126, 383], // 0: salida, fuera del tablero
    [130, 342], [132, 295], [137, 245], [143, 198], [148, 151], [157, 109],
    [203, 100], [260, 100], [309, 102], [355, 103], [404, 104], [458, 106],
    [462, 156], [468, 199], [472, 263], [472, 340], [416, 341], [351, 338],
    [285, 339], [212, 338], [193, 284], [194, 214], [199, 163], [254, 158],
    [304, 158], [357, 156], [411, 157], [414, 202], [412, 240], [410, 271],
    [355, 271], [304, 271], [257, 271], [258, 216], [308, 215], [354, 213]
];

const tablero = [];
for (let i = 0; i < centros.length; i++) {
    tablero.push({
        casilla: i,
        fichas: {
            A: { x: centros[i][0] - 9, y: centros[i][1] - 5 },
            B: { x: centros[i][0] + 9, y: centros[i][1] + 7 }
        }
    });
}

const partida = {
    torn: "A",
    estat: "inicio",
    dataPartida: "",
    jugadors: [],
    guanyador: null,
    ultimaTirada: null,
    preguntaPendent: false
};

function obtenerJugador(letra) {
    return letra === "A" ? jugadorA : jugadorB;
}

function mostrarEstado() {
    let texto = "";
    switch (estado) {
        case "inicio": texto = "Inicio de partida"; break;
        case "turnoA": texto = "Turno de " + jugadorA.nombre; break;
        case "turnoB": texto = "Turno de " + jugadorB.nombre; break;
        case "final": texto = `Fin: ha ganado ${guanyador}`; break;
    }
    document.querySelector("#estado").textContent = texto;
}

function actualizarJSON() {
    partida.torn = turno;
    partida.estat = estado;
    partida.dataPartida = dataPartida.toLocaleDateString("es-ES");
    partida.jugadors = [
        { nom: jugadorA.nombre, posicio: jugadorA.posicion, activat: jugadorA.activado, perdTorn: jugadorA.pierdeTurno },
        { nom: jugadorB.nombre, posicio: jugadorB.posicion, activat: jugadorB.activado, perdTorn: jugadorB.pierdeTurno }
    ];
    partida.guanyador = guanyador;
    partida.ultimaTirada = ultimaTirada;
    partida.preguntaPendent = esperandoPregunta;
    document.getElementById("panel-json").textContent = JSON.stringify(partida, null, 2);
}

function dibujarTablero() {
    for (let letra of ["A", "B"]) {
        let jugador = obtenerJugador(letra);
        let punto = tablero[jugador.posicion].fichas[letra];
        let ficha = document.getElementById("ficha" + letra);
        ficha.style.left = (punto.x / 577 * 100) + "%";
        ficha.style.top = (punto.y / 433 * 100) + "%";
        ficha.title = jugador.nombre + ": " + jugador.posicion;
    }
    document.getElementById("posiciones").textContent =
        `${jugadorA.nombre}: ${jugadorA.posicion} | ${jugadorB.nombre}: ${jugadorB.posicion}`;
    actualizarJSON();
}

function activarBotones() {
    const bloqueado = esperandoPregunta || animando || estado === "final";
    document.getElementById("dadoA").disabled = bloqueado || turno !== "A";
    document.getElementById("dadoB").disabled = bloqueado || turno !== "B";
}

function actualizarPantalla() {
    mostrarEstado();
    dibujarTablero();
    activarBotones();
}

const tirarDau = () => Math.floor(Math.random() * MAX_TIRADES) + 1;

function moverJugador(jugador, destino) {
    jugador.posicion = Math.max(0, Math.min(ULTIMA_CASILLA, destino));
    dibujarTablero();
}

function captura(jugador) {
    let rival = jugador.letra === "A" ? jugadorB : jugadorA;
    if (jugador.posicion !== 0 && jugador.posicion === rival.posicion) {
        rival.posicion = 0;
        document.getElementById("mensaje").textContent +=
            ` Captura: ${rival.nombre} vuelve a salida.`;
        dibujarTablero();
    }
}

function comprobarVictoria(jugador) {
    if (jugador.posicion >= ULTIMA_CASILLA) {
        jugador.posicion = ULTIMA_CASILLA;
        guanyador = jugador.nombre;
        estado = "final";
        document.getElementById("mensaje").textContent =
            jugador.nombre + " ha ganado la partida";
        actualizarPantalla();
        return true;
    }
    return false;
}

function aplicarCasillaEspecial(jugador) {
    let especial = casellesEspecials[jugador.posicion];
    if (!especial) return false;
    document.getElementById("mensaje").textContent += " " + especial.mensaje;
    if (especial.tipo === "avanza") jugador.posicion = especial.destino;
    if (especial.tipo === "inicio") jugador.posicion = 0;
    if (especial.tipo === "pierde") jugador.pierdeTurno = true;
    dibujarTablero();
    return true;
}

function hacerPregunta(jugador) {
    esperandoPregunta = true;
    jugadorPregunta = jugador;
    const pregunta = preguntas[Math.floor(Math.random() * preguntas.length)];
    const caja = document.getElementById("preguntas");
    const respuestas = document.getElementById("respuestas");
    caja.hidden = false;
    document.getElementById("textoPregunta").textContent = pregunta.pregunta;
    document.getElementById("resultadoPregunta").textContent = "";
    document.getElementById("continuar").hidden = true;
    respuestas.replaceChildren();
    for (let i = 0; i < pregunta.respuestas.length; i++) {
        let texto = pregunta.respuestas[i];
        const boton = document.createElement("button");
        boton.textContent = texto;
        boton.addEventListener("click", function () {
            let botones = respuestas.querySelectorAll("button");
            for (let j = 0; j < botones.length; j++) {
                botones[j].disabled = true;
            }
            if (i === pregunta.correcta) {
                document.getElementById("resultadoPregunta").textContent = "Correcto";
            } else {
                jugador.posicion = Math.max(0, jugador.posicion - 1);
                document.getElementById("resultadoPregunta").textContent =
                    "Incorrecto: retrocedes una casilla.";
                captura(jugador);
            }
            dibujarTablero();
            document.getElementById("continuar").hidden = false;
        });
        respuestas.appendChild(boton);
    }
    activarBotones();
    actualizarJSON();
}

function cambiarTurno() {
    turno = turno === "A" ? "B" : "A";
    jugadorA.activado = turno === "A";
    jugadorB.activado = turno === "B";
    estado = turno === "A" ? "turnoA" : "turnoB";
    actualizarPantalla();
    comprobarTurnoPerdido();
}

function comprobarTurnoPerdido() {
    const jugador = obtenerJugador(turno);
    if (!jugador.pierdeTurno || estado === "final") return;
    jugador.pierdeTurno = false;
    document.getElementById("mensaje").textContent =
        `${jugador.nombre} pierde este turno por la casilla 16.`;
    turno = turno === "A" ? "B" : "A";
    jugadorA.activado = turno === "A";
    jugadorB.activado = turno === "B";
    estado = turno === "A" ? "turnoA" : "turnoB";
    actualizarPantalla();
}

function lanzarDado(letra) {
    if (turno !== letra || estado === "final" || esperandoPregunta || animando) return;
    animando = true;
    activarBotones();
    const jugador = obtenerJugador(letra);
    const dado = tirarDau();
    ultimaTirada = dado;
    const mensaje = `Jugador ${jugador.nombre} ha sacado ${dado}`;
    console.log(mensaje.toUpperCase());
    document.getElementById("dado").textContent = `Última tirada: ${dado}`;
    document.getElementById("mensaje").textContent = mensaje;
    moverJugador(jugador, jugador.posicion + dado);
    animando = false;
    if (comprobarVictoria(jugador)) return;
    const especial = aplicarCasillaEspecial(jugador);
    captura(jugador);
    document.getElementById("mensaje").textContent +=
        ` Has caído en: ${nombresCasillas[jugador.posicion]}.`;
    if (especial) cambiarTurno();
    else hacerPregunta(jugador);
    actualizarPantalla();
}

document.getElementById("dadoA").addEventListener("click", () => lanzarDado("A"));
document.getElementById("dadoB").addEventListener("click", () => lanzarDado("B"));
document.getElementById("continuar").addEventListener("click", function () {
    if (!esperandoPregunta || document.getElementById("continuar").hidden) return;
    esperandoPregunta = false;
    jugadorPregunta = null;
    document.getElementById("preguntas").hidden = true;
    cambiarTurno();
});

document.getElementById("formulario").addEventListener("submit", function (event) {
    event.preventDefault();
    const a = document.getElementById("nombreA").value.trim();
    const b = document.getElementById("nombreB").value.trim();
    if (!a || !b) return alert("Introduce los dos nombres");
    jugadorA.nombre = a;
    jugadorB.nombre = b;
    nomJugador = a;
    document.getElementById("nombres").textContent = `${a} contra ${b}`;
    actualizarPantalla();
});

function nuevaPartida() {
    for (const jugador of [jugadorA, jugadorB]) {
        jugador.posicion = 0;
        jugador.pierdeTurno = false;
    }
    jugadorA.activado = true;
    jugadorB.activado = false;
    turno = "A";
    estado = "turnoA";
    ultimaTirada = null;
    guanyador = null;
    animando = false;
    esperandoPregunta = false;
    jugadorPregunta = null;
    dataPartida = new Date();
    document.getElementById("fecha").textContent =
        "Partida iniciada: " + dataPartida.getDate() + "/" +
        (dataPartida.getMonth() + 1) + "/" + dataPartida.getFullYear();
    document.getElementById("preguntas").hidden = true;
    document.getElementById("dado").textContent = "Última tirada: ninguna";
    document.getElementById("mensaje").textContent = "Nueva partida. Empieza el jugador A.";
    actualizarPantalla();
}
document.getElementById("nuevaPartida").addEventListener("click", function () {
    if (!animando) nuevaPartida();
});

function numerosOperacion() {
    return [Number(document.getElementById("numero1").value),
            Number(document.getElementById("numero2").value)];
}
document.getElementById("sumar").addEventListener("click", function () {
    const [a, b] = numerosOperacion();
    document.getElementById("resultadoOperacion").textContent = "Resultado: " + sumar(a, b);
});
document.getElementById("multiplicar").addEventListener("click", function () {
    const [a, b] = numerosOperacion();
    document.getElementById("resultadoOperacion").textContent = "Resultado: " + multiplicar(a, b);
});
document.getElementById("hacerTabla").addEventListener("click", function () {
    const valor = document.getElementById("numeroTabla").value;
    if (valor === "") return;
    const numero = Number(valor);
    let texto = "";
    if (numero < 0) texto = "El número ha de ser más grande que 0";
    else if (numero > 10) texto = "El número ha de ser más pequeño que 11";
    else {
        for (let i = 1; i <= 10; i++) texto += `${numero} x ${i} = ${multiplicar(numero, i)}\n`;
    }
    const mensaje = numero >= 0 && numero <= 10 ? "Número válido" : "Número no válido";
    document.getElementById("resultadoTabla").textContent = mensaje + "\n" + texto;
});
 document.getElementById("cambiarTexto").addEventListener("click", function () {
    const texto = document.querySelector("#textoDOM");
    texto.textContent = "Texto cambiado con JavaScript";
    texto.classList.add("modificado");
});

nuevaPartida();
