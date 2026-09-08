function limpiarNumero(texto) {
    if (!texto) return 0;
    const textoStr = String(texto);
    const sinPuntos = textoStr.replaceAll('.', '').replaceAll(',', '').trim();
    const numero = Number(sinPuntos);
    return isNaN(numero) ? 0 : numero;
}

function limpiarNumeroDecimal(texto) {
    if (!texto) return 0;
    const textoStr = String(texto);
    const limpio = textoStr.replaceAll('.', '').replace(',', '.').trim();
    const numero = Number(limpio);
    return isNaN(numero) ? 0 : numero;
}

function formatearNumero(numero) {
    if (isNaN(numero) || numero === null || numero === undefined) return '0';
    return Number(numero).toLocaleString('es-CO');
}

function formatearDecimal(numero) {
    if (isNaN(numero) || numero === null || numero === undefined) return '0';
    return Number(numero).toLocaleString('es-CO', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
}

function redondearACien(numero) {
    return Math.round(numero / 100) * 100;
}

function obtenerConfig() {
    const configGuardada = localStorage.getItem('config');
    return configGuardada ? JSON.parse(configGuardada) : null;
}

function obtenerHistorial() {
    const historialGuardado = localStorage.getItem('historial');
    return historialGuardado ? JSON.parse(historialGuardado) : [];
}

function obtenerLecturaAnterior() {
    const historial = obtenerHistorial();
    const config = obtenerConfig();
    
    if (historial.length > 0) {
        return historial[historial.length - 1].lecturaActual;
    }
    if (config && config.lecturaInicial) {
        return config.lecturaInicial;
    }
    return 0;
}

function mostrarLecturaAnterior() {
    const lectura = obtenerLecturaAnterior();
    document.getElementById('lectura-anterior').textContent = formatearNumero(lectura) + ' kWh';
}




let mesesAMostrar = 3;
let graficoConsumo = null;
let graficoPago = null;

function mostrarGraficos() {
    const historial = obtenerHistorial();
    const container = document.getElementById('graficos-container');
    
    if (historial.length === 0) {
        container.classList.add('oculta');
        return;
    }
    
    container.classList.remove('oculta');
    
    const historialReciente = historial.slice(-mesesAMostrar);
    
    const etiquetas = historialReciente.map(function(item) {
        const fecha = new Date(item.fecha);
        const mes = fecha.toLocaleDateString('es-CO', { month: 'short' });
        return mes.charAt(0).toUpperCase() + mes.slice(1).replace('.', '');
    });
    
    const consumoDepto1 = historialReciente.map(function(item) {
        return item.consumoDepto1 || 0;
    });
    const consumoDepto2 = historialReciente.map(function(item) {
        return item.consumoDepto2 || 0;
    });
    const pagoDepto1 = historialReciente.map(function(item) {
        return item.totalDepto1 || 0;
    });
    const pagoDepto2 = historialReciente.map(function(item) {
        return item.totalDepto2 || 0;
    });
    
    const nombreDepto1 = historialReciente[historialReciente.length - 1].nombreDepto1;
    const nombreDepto2 = historialReciente[historialReciente.length - 1].nombreDepto2;
    
    if (graficoConsumo) graficoConsumo.destroy();
    if (graficoPago) graficoPago.destroy();
    
    const colorDepto1 = 'rgba(251, 146, 60, 0.85)';
    const colorDepto2 = 'rgba(194, 65, 12, 0.85)';
    
    const opcionesComunes = {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 10, bottom: 5 } },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: { size: 12, weight: '500' },
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    boxWidth: 8,
                    boxHeight: 8
                }
            },
            tooltip: {
                backgroundColor: 'rgba(23, 23, 23, 0.95)',
                titleFont: { size: 13, weight: '600' },
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                boxPadding: 4
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                border: { display: false },
                grid: { color: 'rgba(0, 0, 0, 0.04)', drawTicks: false },
                ticks: { font: { size: 10 }, color: '#a3a3a3', padding: 8, maxTicksLimit: 5 }
            },
            x: {
                border: { display: false },
                grid: { display: false },
                ticks: { font: { size: 11, weight: '500' }, color: '#525252', padding: 4 }
            }
        }
    };
    
    const barConfig = {
        borderRadius: 6,
        borderSkipped: false,
        borderWidth: 0,
        maxBarThickness: 40,
        categoryPercentage: 0.7,
        barPercentage: 0.85
    };
    
    const ctxConsumo = document.getElementById('grafico-consumo').getContext('2d');
    graficoConsumo = new Chart(ctxConsumo, {
        type: 'bar',
        data: {
            labels: etiquetas,
            datasets: [
                { label: nombreDepto1, data: consumoDepto1, backgroundColor: colorDepto1, hoverBackgroundColor: 'rgba(251, 146, 60, 1)', ...barConfig },
                { label: nombreDepto2, data: consumoDepto2, backgroundColor: colorDepto2, hoverBackgroundColor: 'rgba(194, 65, 12, 1)', ...barConfig }
            ]
        },
        options: {
            ...opcionesComunes,
            plugins: {
                ...opcionesComunes.plugins,
                tooltip: {
                    ...opcionesComunes.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toLocaleString('es-CO') + ' kWh';
                        }
                    }
                }
            },
            scales: {
                ...opcionesComunes.scales,
                y: {
                    ...opcionesComunes.scales.y,
                    ticks: { ...opcionesComunes.scales.y.ticks, callback: function(value) { return value.toLocaleString('es-CO'); } }
                }
            }
        }
    });
    
    const ctxPago = document.getElementById('grafico-pago').getContext('2d');
    graficoPago = new Chart(ctxPago, {
        type: 'bar',
        data: {
            labels: etiquetas,
            datasets: [
                { label: nombreDepto1, data: pagoDepto1, backgroundColor: colorDepto1, hoverBackgroundColor: 'rgba(251, 146, 60, 1)', ...barConfig },
                { label: nombreDepto2, data: pagoDepto2, backgroundColor: colorDepto2, hoverBackgroundColor: 'rgba(194, 65, 12, 1)', ...barConfig }
            ]
        },
        options: {
            ...opcionesComunes,
            plugins: {
                ...opcionesComunes.plugins,
                tooltip: {
                    ...opcionesComunes.plugins.tooltip,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': $' + context.parsed.y.toLocaleString('es-CO');
                        }
                    }
                }
            },
            scales: {
                ...opcionesComunes.scales,
                y: {
                    ...opcionesComunes.scales.y,
                    ticks: {
                        ...opcionesComunes.scales.y.ticks,
                        callback: function(value) {
                            if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'k';
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
    
    const btnVerMas = document.getElementById('btn-ver-mas');
    if (mesesAMostrar >= historial.length) {
        btnVerMas.classList.add('oculta');
    } else {
        btnVerMas.classList.remove('oculta');
        btnVerMas.textContent = 'Ver más meses';
    }
}




function cargarConfiguracion() {
    const config = obtenerConfig();
    if (!config) return;
    
    document.getElementById('nombre-depto1').value = config.nombreDepto1 || '';
    document.getElementById('nombre-depto2').value = config.nombreDepto2 || '';
    document.getElementById('dia-corte').value = config.diaCorte || '';
    document.getElementById('lectura-inicial').value = config.lecturaInicial || '';
}

document.getElementById('btn-guardar-config').addEventListener('click', function() {
    const nombreDepto1 = document.getElementById('nombre-depto1').value.trim();
    const nombreDepto2 = document.getElementById('nombre-depto2').value.trim();
    const diaCorte = limpiarNumero(document.getElementById('dia-corte').value);
    const lecturaInicial = limpiarNumero(document.getElementById('lectura-inicial').value);
    
    if (!nombreDepto1 || !nombreDepto2) {
        alert('Por favor escribe el nombre de los dos departamentos');
        return;
    }
    
    if (nombreDepto1.toLowerCase() === nombreDepto2.toLowerCase()) {
        alert('Los dos departamentos no pueden tener el mismo nombre');
        return;
    }
    
    if (diaCorte < 1 || diaCorte > 31) {
        alert('El día de corte debe estar entre 1 y 31');
        return;
    }
    
    if (lecturaInicial === 0) {
        alert('Por favor escribe la lectura inicial del contador');
        return;
    }
    
    const config = { nombreDepto1, nombreDepto2, diaCorte, lecturaInicial };
    
    localStorage.setItem('config', JSON.stringify(config));
    
    mostrarLecturaAnterior();
    
    alert('Cambios guardados correctamente');
});




function mostrarEstadoPrincipal() {
    const estadoSin = document.getElementById('estado-sin-pendiente');
    const estadoCon = document.getElementById('estado-con-pendiente');
    const formLectura = document.getElementById('form-lectura');
    
    estadoSin.classList.add('oculta');
    estadoCon.classList.add('oculta');
    formLectura.classList.add('oculta');
    
    document.getElementById('resultado').innerHTML = '';
    
    const pendienteGuardado = localStorage.getItem('lecturaPendiente');
    
    if (pendienteGuardado) {
        const datosPendiente = JSON.parse(pendienteGuardado);
        const fecha = new Date(datosPendiente.fecha);
        const fechaTexto = fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
        
        // Calcular el consumo del depto 2 
        const lecturaAnterior = obtenerLecturaAnterior();
        const consumoDelMes = datosPendiente.lectura - lecturaAnterior;
        
        document.getElementById('lectura-pendiente-valor').textContent = formatearNumero(datosPendiente.lectura) + ' kWh';
        document.getElementById('lectura-pendiente-consumo').textContent = formatearNumero(consumoDelMes) + ' kWh';
        document.getElementById('lectura-pendiente-fecha').textContent = fechaTexto;
        
        estadoCon.classList.remove('oculta');
    } else {
        estadoSin.classList.remove('oculta');
    }
}




document.getElementById('btn-mostrar-form-lectura').addEventListener('click', function() {
    const config = obtenerConfig();
    if (!config) {
        alert('Antes de registrar una lectura, ve a configuración y llena los datos');
        return;
    }
    
    document.getElementById('estado-sin-pendiente').classList.add('oculta');
    document.getElementById('form-lectura').classList.remove('oculta');
    document.getElementById('lectura-actual').focus();
});

document.getElementById('btn-cancelar-lectura').addEventListener('click', function() {
    document.getElementById('form-lectura').classList.add('oculta');
    document.getElementById('estado-sin-pendiente').classList.remove('oculta');
    document.getElementById('lectura-actual').value = '';
});

document.getElementById('btn-guardar-lectura').addEventListener('click', function() {
    const lecturaActual = limpiarNumero(document.getElementById('lectura-actual').value);
    
    if (lecturaActual === 0) {
        alert('Por favor escribe la lectura del contador');
        return;
    }
    
    const lecturaAnterior = obtenerLecturaAnterior();
    
    if (lecturaActual <= lecturaAnterior) {
        alert('La lectura debe ser mayor a la anterior (' + formatearNumero(lecturaAnterior) + ' kWh). Recuerda que el contador no se reinicia.');
        return;
    }
    
    const yaHayPendiente = localStorage.getItem('lecturaPendiente');
    if (yaHayPendiente) {
        const confirmar = confirm('Ya hay una lectura pendiente guardada. ¿Quieres reemplazarla con esta?');
        if (!confirmar) return;
    }
    
    const pendiente = { lectura: lecturaActual, fecha: new Date().toISOString() };
    
    localStorage.setItem('lecturaPendiente', JSON.stringify(pendiente));
    
    document.getElementById('lectura-actual').value = '';
    mostrarEstadoPrincipal();
    
    alert('Lectura guardada. Cuando llegue el recibo nuevo, escribe los datos del recibo y calcula.');
});

document.getElementById('btn-borrar-pendiente').addEventListener('click', function() {
    const confirmar = confirm('¿Seguro que quieres borrar la lectura pendiente? Esta acción no se puede deshacer.');
    if (!confirmar) return;
    
    localStorage.removeItem('lecturaPendiente');
    
    document.getElementById('total-celsia').value = '';
    document.getElementById('total-otras-entidades').value = '';
    document.getElementById('total-kwh-recibo').value = '';
    document.getElementById('resultado').innerHTML = '';
    ultimoCalculo = null;
    
    mostrarEstadoPrincipal();
});

document.getElementById('btn-ir-config').addEventListener('click', function() {
    cambiarPantalla('pantalla-configuracion');
});



let ultimoCalculo = null;

document.getElementById('btn-calcular').addEventListener('click', function() {
    
    const pendienteGuardado = localStorage.getItem('lecturaPendiente');
    if (!pendienteGuardado) {
        alert('No hay lectura pendiente para calcular');
        return;
    }
    
    const config = obtenerConfig();
    if (!config) {
        alert('Primero tienes que llenar la configuración');
        return;
    }
    
    const totalCelsia = limpiarNumero(document.getElementById('total-celsia').value);
    const totalOtrasEntidades = limpiarNumero(document.getElementById('total-otras-entidades').value);
    const totalKwhRecibo = limpiarNumero(document.getElementById('total-kwh-recibo').value);
    
    if (totalCelsia === 0) {
        alert('Por favor escribe el total Celsia (energía) que dice el recibo');
        return;
    }
    
    if (totalOtrasEntidades === 0) {
        alert('Por favor escribe el total de otras entidades que dice el recibo');
        return;
    }
    
    if (totalKwhRecibo === 0) {
        alert('Por favor escribe el total de kWh que dice el recibo');
        return;
    }
    
    const pendiente = JSON.parse(pendienteGuardado);
    const lecturaActual = pendiente.lectura;
    const lecturaAnterior = obtenerLecturaAnterior();
    
    const consumoDepto2 = lecturaActual - lecturaAnterior;
    
    if (consumoDepto2 > totalKwhRecibo) {
        alert('El depto 2 consumió ' + consumoDepto2 + ' kWh pero el recibo dice ' + totalKwhRecibo + ' kWh en total. Revisa que los datos estén bien.');
        return;
    }
    
    // Cálculos
    const precioKwhEfectivo = totalCelsia / totalKwhRecibo;
    const energiaDepto2 = consumoDepto2 * precioKwhEfectivo;
    const otrasEntidadesCadaUno = totalOtrasEntidades / 2;
    const totalDepto2 = redondearACien(energiaDepto2 + otrasEntidadesCadaUno);
    
    // El depto 1 paga el resto para que cuadre con el total del recibo
    const totalRecibo = totalCelsia + totalOtrasEntidades;
    const totalDepto1 = totalRecibo - totalDepto2;
    
    ultimoCalculo = {
        fecha: new Date().toISOString(),
        lecturaAnterior,
        lecturaActual,
        nombreDepto1: config.nombreDepto1,
        nombreDepto2: config.nombreDepto2,
        consumoDepto2,
        consumoDepto1: totalKwhRecibo - consumoDepto2,
        precioKwhEfectivo,
        energiaDepto2: redondearACien(energiaDepto2),
        otrasEntidadesCadaUno: redondearACien(otrasEntidadesCadaUno),
        totalDepto2,
        totalDepto1,
        totalCelsia,
        totalOtrasEntidades,
        totalKwhRecibo,
        totalRecibo
    };
    
    const html = `
        <div class="desprendible">
            <div class="depto-recibo">
                <h3>Debe pagar ${config.nombreDepto2}</h3>
                <div class="linea"><span>Consumo:</span><strong>${formatearNumero(consumoDepto2)} kWh</strong></div>
                <div class="linea"><span>Precio kWh:</span><strong>$${formatearDecimal(precioKwhEfectivo)}</strong></div>
                <div class="linea"><span>Energía:</span><strong>$${formatearNumero(redondearACien(energiaDepto2))}</strong></div>
                <div class="linea"><span>Otras entidades (mitad):</span><strong>$${formatearNumero(redondearACien(otrasEntidadesCadaUno))}</strong></div>
                <div class="linea total"><span>Total a pagar:</span><strong>$${formatearNumero(totalDepto2)}</strong></div>
            </div>
            
            <div class="info-complementaria">
                <p>Total del recibo: $${formatearNumero(totalRecibo)}</p>
                <p>${config.nombreDepto1} paga: $${formatearNumero(totalDepto1)}</p>
            </div>
            
            <button id="btn-guardar-historial" class="btn-guardar-historial">Guardar en historial</button>
        </div>
    `;
    
    document.getElementById('resultado').innerHTML = html;
    document.getElementById('btn-guardar-historial').addEventListener('click', guardarEnHistorial);
    document.getElementById('resultado').scrollIntoView({ behavior: 'smooth' });
});




function guardarEnHistorial() {
    if (!ultimoCalculo) {
        alert('No hay un cálculo para guardar');
        return;
    }
    
    const confirmar = confirm('¿Guardar este cálculo en el historial? La lectura de hoy quedará como la anterior del próximo mes.');
    if (!confirmar) return;
    
    const historial = obtenerHistorial();
    historial.push(ultimoCalculo);
    localStorage.setItem('historial', JSON.stringify(historial));
    
    localStorage.removeItem('lecturaPendiente');
    
    document.getElementById('total-celsia').value = '';
    document.getElementById('total-otras-entidades').value = '';
    document.getElementById('total-kwh-recibo').value = '';
    
    ultimoCalculo = null;
    mostrarLecturaAnterior();
    mostrarHistorial();
    mostrarGraficos();
    mostrarEstadoPrincipal();
    
    alert('Guardado correctamente en el historial');
}



function mostrarHistorial() {
    const historial = obtenerHistorial();
    const contenedor = document.getElementById('lista-historial');
    
    if (historial.length === 0) {
        contenedor.innerHTML = '<p class="mensaje-vacio">Todavía no hay meses guardados</p>';
        return;
    }
    
    const DIAS_MAXIMOS_PARA_ELIMINAR = 2;
    const historialInvertido = [...historial].reverse();
    
    let html = '';
    historialInvertido.forEach(function(item, indice) {
        const fecha = new Date(item.fecha);
        const fechaTexto = fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
        
        const esElMasReciente = (indice === 0);
        const ahora = new Date();
        const diferenciaDias = (ahora - fecha) / (1000 * 60 * 60 * 24);
        const dentroDelPlazo = diferenciaDias <= DIAS_MAXIMOS_PARA_ELIMINAR;
        const mostrarBotonEliminar = esElMasReciente && dentroDelPlazo;
        
        const botonEliminarHTML = mostrarBotonEliminar
            ? `<button class="btn-eliminar" title="Eliminar este mes">✕</button>`
            : '';
        
        html += `
            <div class="item-historial">
                <div class="cabecera-item">
                    <div class="fecha-item">${fechaTexto}</div>
                    ${botonEliminarHTML}
                </div>
                <div class="linea"><span>${item.nombreDepto2}</span><strong>$${formatearNumero(item.totalDepto2)}</strong></div>
                <div class="linea consumo-info">
                    <span>Lectura: ${formatearNumero(item.lecturaActual)} kWh</span>
                    <span>Consumo: ${formatearNumero(item.consumoDepto2)} kWh</span>
                </div>
            </div>
        `;
    });
    
    contenedor.innerHTML = html;
    
    const botonEliminar = document.querySelector('.btn-eliminar');
    if (botonEliminar) {
        botonEliminar.addEventListener('click', eliminarUltimoDelHistorial);
    }
}



function eliminarUltimoDelHistorial() {
    const confirmar = confirm('¿Seguro que quieres eliminar el último mes del historial? Esta acción no se puede deshacer.');
    if (!confirmar) return;
    
    const historial = obtenerHistorial();
    if (historial.length === 0) return;
    
    historial.pop();
    localStorage.setItem('historial', JSON.stringify(historial));
    
    mostrarHistorial();
    mostrarGraficos();
    mostrarLecturaAnterior();
    
    alert('Último mes eliminado del historial');
}



const botonesNav = document.querySelectorAll('.btn-nav');

botonesNav.forEach(function(boton) {
    boton.addEventListener('click', function() {
        const pantallaId = boton.getAttribute('data-pantalla');
        cambiarPantalla(pantallaId);
    });
});

function cambiarPantalla(idPantalla) {
    const todasLasSecciones = document.querySelectorAll('main section');
    todasLasSecciones.forEach(function(seccion) {
        seccion.classList.add('oculta');
    });
    
    const pantalla = document.getElementById(idPantalla);
    if (pantalla) pantalla.classList.remove('oculta');
    
    botonesNav.forEach(function(boton) {
        boton.classList.remove('activo');
    });
    
    const botonActivo = document.querySelector(`[data-pantalla="${idPantalla}"]`);
    if (botonActivo) botonActivo.classList.add('activo');
    
    window.scrollTo(0, 0);
}



cargarConfiguracion();
mostrarLecturaAnterior();
mostrarEstadoPrincipal();
mostrarHistorial();
mostrarGraficos();
cambiarPantalla('pantalla-principal');

