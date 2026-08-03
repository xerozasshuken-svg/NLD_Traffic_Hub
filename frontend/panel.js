//ESTADOS Y REFERENCIAS AL DOM

let reportesList = [];
let categoriaActual = 'Todos';
let modoImagen = 'file';

//Elementos del DOM
const reportsContainer = document.getElementById('reports-container');
const inputBusqueda = document.getElementById('input-busqueda');
const filterButtons = document.querySelectorAll('.btn-filter');

//Elementos modal
const modalReporte = document.getElementById('modal-reporte');
const btnAbrirModal = document.getElementById('btn-abrir-modal');  
const btnCerrarModal = document.getElementById('btn-cerrar-modal');
const btnCancelarModal = document.getElementById('btn-cancelar-modal');
const formNuevoReporte = document.getElementById('form-nuevo-reporte');

const btnModeFile = document.getElementById('btn-mode-file');
const btnModeUrl = document.getElementById('btn-mode-url');
const inputImgFile = document.getElementById('rep-imagen-file');
const inputImgUrl= document.getElementById('rep-imagen-url');
//Inicializador
document.addEventListener('DOMContentLoaded', ()=>{
    evaluarrFiltros();
    cargarReportes();
    configurarEventos();
});

//FUNCION PARA INTERACCIONES
function configurarEventos(){

    //Abrir/Cerrar Modal
    if (btnAbrirModal) btnAbrirModal.addEventListener('click', abrirModal);
    if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModal);
    if (btnCancelarModal) btnCancelarModal.addEventListener('click', cerrarModal);

    //Cerrar el modal al hacer clic fuera
    if (modalReporte) {
        modalReporte.addEventListener('click', (e)=> {
            if (e.target === modalReporte) cerrarModal();
        });    
    }

    //Enviar formulario de Nuevo Reporte
    if (formNuevoReporte) {
        formNuevoReporte.addEventListener('submit', guardarNuevoReporte);    
    }

    if (btnModeFile && btnModeUrl) {

        btnModeFile.addEventListener('click', ()=>{
            modoImagen = 'file';
            btnModeFile.classList.add('active');
            btnModeUrl.classList.remove('active');

            inputImgFile.style.display = 'block';
            inputImgUrl.style.display = 'none';
        });

        btnModeUrl.addEventListener('click', ()=>{
            modoImagen = 'url';
            btnModeUrl.classList.add('active');
            btnModeFile.classList.remove('active');

            inputImgUrl.style.display = 'block';
            inputImgFile.style.display = 'none';
        });
    }

    //FILTRADO POR CATEGORIA
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e)=> {
            filterButtons.forEach(b => b.classList.remove('active'));
            
            e.target.classList.add('active');
            categoriaActual = e.target.getAttribute('data-cat');
            filtrarYRenderizar();
        });
    });

    //Busqueda en tiempo real
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', filtrarYRenderizar);    
    }
}

function abrirModal(){
    if(modalReporte) modalReporte.style.display = 'flex';
}

function cerrarModal(){
    if(modalReporte) modalReporte.style.display = 'none';
    if(formNuevoReporte) formNuevoReporte.reset();
}

//LOGICA FETCH Y POST
async function cargarReportes(){
    try {
        const res = await fetch('/api/reportes');
        if (res.ok) {
            reportesList = await res.json();
            filtrarYRenderizar();
        }
        else{
            console.warn("No se pudo obtener la lista de reportes del servidor");
        }    
    } 
    catch (error) {
        console.error("Error al conectar con el Backend", error);

    }
}

//Guardar nuevos reportes
async function guardarNuevoReporte(e) {
    e.preventDefault();

    const token = localStorage.getItem('viales_token'); 
    if (!token) {
        alert("Debes iniciar sesion para publicar un reporte");
        return;
    }
    const categoria = formNuevoReporte.querySelector('input[name="categoria"]:checked')?.value || 'Tráfico';
    const ubicacion = document.getElementById('rep-ubicacion')?.value.trim() || 'Sin ubicación';
    const descripcion = document.getElementById('rep-descripcion')?.value.trim() || '';

    let imagenFinal = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80';
    
    if (modoImagen === 'url' && inputImgUrl && inputImgUrl.value.trim() !== '') {
        imagenFinal = inputImgUrl.value.trim();
    }
    else if (modoImagen === 'file' && inputImgFile.files && inputImgFile.files[0]){
        try {
            imagenFinal = await convertirImagenABase64(inputImgFile.files[0]);    
        }
        catch (err) {
            console.error("Error al procesar la imagen seleccionada", err);
        }
        
    }

    const nuevoReporte = {
        categoria,
        ubicacion,
        descripcion,
        imagen_url: imagenFinal,
        estado: 'pendiente' 
    };

    try {
        const res = await fetch('/api/reportes', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization' : `Bearer ${token}`
            },
            body: JSON.stringify(nuevoReporte)
        });
        
        if (res.ok) {
            const data = await res.json();
            const reporteGuardado = data.reporte || data;

            reportesList.unshift(reporteGuardado);
            cerrarModal();
            filtrarYRenderizar();
        }else if ( res.status === 401){
            alert('Tu sesion ha expirado o no tiene permiso. Por favor vuelve a iniciar sesion.');
        }else {
            alert('Ocurrio un problema al guardar el reporte en el servidor');
        }
    }
    catch (error) {
        console.error("Erroa al enviar el reporte", error);
        alert('Error de conexion con el servidor');
    }
}
//Auxiliar para converit archivos locales de imagen
function convertirImagenABase64(archivo){
    return new Promise((resolve, reject) =>{
        const reader = new FileReader();
        reader.readAsDataURL(archivo);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}
//Revelar filtro de pendientes si es Admin
function evaluarrFiltros(){
    const usuarioActual = JSON.parse(localStorage.getItem('viales_user') || '{}');
    const btnPendientes = document.getElementById('btn-filtro-pendientes');

    if (usuarioActual && usuarioActual.rol === 'admin' && btnPendientes) {
        btnPendientes.style.display = 'inline-block';
    }
}

//Filtrado y Renderizado en pantalla
function filtrarYRenderizar(){
    const query = inputBusqueda ? normalizarTexto(inputBusqueda.value) : '';
    const catFiltradoNorm = normalizarTexto(categoriaActual);

    let filtrados = reportesList.filter(rep =>{
        const catReporteNorm = normalizarTexto(rep.categoria);
        const estadoReporte = (rep.estado || 'pendiente').toLowerCase();

        //Logica de filtrado de estado
        let coincideCategoria = false;

        if (categoriaActual === 'Pendientes') {
            //Muestra reportes que no estan aprobados}
            coincideCategoria = estadoReporte !== 'aprobado';
        }
        else if (categoriaActual === 'Todos') {
            //Para las pestañas noprmales se muestra los aprobados
            coincideCategoria = estadoReporte === 'aprobado';
        }
        else{
            //Filtrado por categoria especifica
            coincideCategoria = (catReporteNorm === catFiltradoNorm) && (estadoReporte === 'aprobado');
        }
        
        const ubicacionNorm = normalizarTexto(rep.ubicacion);
        const descripcionNorm = normalizarTexto(rep.descripcion);

        const coincideTexto = ubicacionNorm.includes(query) || descripcionNorm.includes(query);

        return coincideCategoria && coincideTexto;
    });

    filtrados.sort((a,b) => new Date(b.fecha_creacion || b.fechaCreacion) - new Date(a.fecha_creacion || a.fechaCreacion));
    renderizarTarjetas(filtrados);
}

function renderizarTarjetas(lista = []){
    if(!reportsContainer) return;

    reportsContainer.innerHTML = '';
    
    if (lista.length === 0) {
        reportsContainer.innerHTML = `
            <p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 40px;">
                No se encontraron reportes con los criterios seleccionados.
            </p>`;
        return;
    }

    lista.forEach(rep =>{
        const claseBadge = obtenerClaseCategoria(rep.categoria);
        const fechaRaw = rep.fecha_creacion || rep.fechaCreacion;
        const fechaFormateada = fechaRaw
                ? new Date(fechaRaw).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) 
                : (rep.fecha || 'Reciente');

        const cardHTML = `
            <article class="report-card" onclick="window.location.href='mostrar_reporte.html?id=${rep.id}'">
                <div class="card-img-wrapper">
                    <img src="${rep.imagen_url}" alt="${rep.categoria}" onerror="this.src='https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80'">
                    <span class="card-badge ${claseBadge}">
                        ${rep.categoria}
                    </span>
                </div>
                <div class="card-body">
                    <h3 class="card-tittle">
                        ${rep.ubicacion}
                    </h3>
                    <p class="card-location">
                        Publicado: ${fechaFormateada}
                    </p>
                    <p class="card-desc">
                        ${rep.descripcion}
                    </p>
                </div>
            </article>
        `;

        reportsContainer.insertAdjacentHTML('beforeend', cardHTML);
    });
}

function obtenerClaseCategoria(cat){
    if(!cat) return 'cat-todos';

    const normalizado = normalizarTexto(cat);

    switch(normalizado){
        case 'accidente': return 'cat-accidente';
        case 'trafico': return 'cat-trafico';
        case 'calle cerrada': return 'cat-cerrada';
        case 'inundacion': return 'cat-inundacion';
        case 'obra vial': return 'cat-obra';
        default: return 'cat-todos';
    }
}

//AUXILAR
function normalizarTexto(texto = ''){
    return texto
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

//Funcion de prueba
function usarReportesDemo(){
 reportesList = [
    {
        id: 1,
        categoria: 'Accidente',
        ubicacion: 'Av. Reforma y Paseo Colon',
        descripcion: 'Choque por alcance entre dos vehiculos',
        imagen_url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=80',
        fecha: 'Hace 35 min',
    },
    {
        id: 2,
        categoria: 'Obra vial',
        ubicacion: 'Cerralvo y Av Tecnologico',
        descripcion: 'Trabajo de bancheo y reparacion',
        imagen_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80',
        fecha: 'Hace 10 min',
    },
    {
        id: 3,
        categoria: 'Inundacion',
        ubicacion: 'Por Colorines',
        descripcion: 'Se inundo por falla de drenaje',
        imagen_url: '',
        fecha: 'Hace 1 hora',
    }
 ];
 filtrarYRenderizar();
}