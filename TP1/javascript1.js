// Variables numéricas con nombres descriptivos
const valorA = 25;
const valorB = 8;

// Operaciones matemáticas
const resultadoSuma = valorA + valorB;
const resultadoResta = valorA - valorB;
const resultadoProducto = valorA * valorB;
const resultadoDivision = valorA / valorB;

// Mostrar resultados en consola
console.log(`Suma: ${resultadoSuma}`);
console.log(`Resta: ${resultadoResta}`);
console.log(`Multiplicación: ${resultadoProducto}`);
console.log(`División: ${resultadoDivision.toFixed(2)}`);

// Comparación de valores
const comparacion = valorA > valorB 
    ? `El valor A (${valorA}) es mayor que el valor B (${valorB})`
    : `El valor B (${valorB}) es mayor que el valor A (${valorA})`;
console.log(comparacion);

// Estructura de control para días de la semana
const diaActual = new Date().getDay();
let nombreDia;

switch(diaActual) {
    case 0: nombreDia = "Domingo"; break;
    case 1: nombreDia = "Lunes"; break;
    case 2: nombreDia = "Martes"; break;
    case 3: nombreDia = "Miércoles"; break;
    case 4: nombreDia = "Jueves"; break;
    case 5: nombreDia = "Viernes"; break;
    case 6: nombreDia = "Sábado"; break;
    default: nombreDia = "Día no válido";
}

console.log(`Hoy es ${nombreDia}`);

// Bucle iterativo
const resultadosIteracion = [];
for(let contador = 1; contador <= 5; contador++) {
    resultadosIteracion.push(`Iteración ${contador}`);
    console.log(`Procesando iteración ${contador}`);
}

// Manejador de formulario
document.getElementById('formularioAcceso').addEventListener('submit', function(evento) {
    evento.preventDefault();
    
    const usuario = document.getElementById('nombreUsuario').value;
    const clave = document.getElementById('claveAcceso').value;
    
    if(usuario && clave) {
        console.log('Validando credenciales...');
        // Aquí iría la lógica de autenticación real
        setTimeout(() => {
            alert('Credenciales recibidas. Redirigiendo...');
            window.location.href = 'panel.html';
        }, 800);
    } else {
        alert('Por favor complete ambos campos');
    }
});
