document.addEventListener('DOMContentLoaded', ()=>{
    //Extraer el parametro id de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const reporteId = urlParams.get('id');

    //Si no hay Id en la URL, redirigir al panel principal
    if (!reporteId) {
        alert("No se especifico ningun reporte.");
        window.location.href = 'panel_reportes.html';
        return;
    }

    cargarDetalleReporte(reporteId);
});

async function cargarDetalleReporte(id) {
    try {
        const res = await fetch(`/api/reportes/${id}`);

        if (!res.ok) {
            throw new Error("No se pu8do obtener la informacionn del reporte");
        }

        const reporte = await res.json();

        //Inyectar datos al DOM. Categoria y Badge
        const catElement = document.getElementById('det-categoria');
        if (catElement) {
            catElement.textContent = reporte.categoria || 'Sin categoria';
            catElement.className = `badge-large ${obtenerClaseCategoria(reporte.categoria)}`;
        }

        //Imagen
        const imgElement = document.getElementById('det-imagen');
        if (imgElement) {
            imgElement.src = reporte.imagen_url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80';
        }

        //Ubicacion
        const ubElement = document.getElementById('det-ubicacion');
        if (ubElement) {
            ubElement.textContent = `${reporte.ubicacion || 'Sin ubicacion registrada'}`;
        }

        //Fecha de creacion
        const FechaElement = document.getElementById('det-fecha');
        if (FechaElement) {
            const fechaRaw = reporte.fecha_creacion || reporte.fechaCreacion;
            if (fechaRaw) {
                const fechaObj = new Date(fechaRaw);
                FechaElement.textContent =`Publicado: ${fechaObj.toLocaleDateString()} a las ${fechaObj.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
            }
            else{
                FechaElement.textContent = 'Publicado: Reciente';
            }
        }

        document.getElementById('det-descripcion').textContent = reporte.descripcion || 'Sin descripcion';
        document.getElementById('det-usuario').textContent = reporte.creado_por || 'Ciudadano';

        //Conntrol para Admin
        evaluarPermisosAdmin(reporte);
    } 
    catch (error) {
        console.error("Error al cargar detalle del reporte: ", error);
        alert("Ocurrio un error al cargar la iformacion del reporte");
    }
}

function evaluarPermisosAdmin(reporte){
    const adminPannel = document.getElementById('admin-panel');
    const actionsContainer = document.getElementById('admin-actions-container');

    //Leer el usuario guardado en LocalStore al iniciar sesion
    const usuarioActual = JSON.parse(localStorage.getItem('viales_user') || '{}');
    
    //Si no es admin ocultamos el panel inferior
    if (!usuarioActual || usuarioActual.rol !== 'admin') {
        if (adminPannel) adminPannel.style.display = 'none';
        return;
    }

    //Si es adminn
    adminPannel.style.display = 'block';
    document.getElementById('det-estado').textContent = reporte.estado || 'no verificado';
    document.getElementById('det-usuario-id').textContent = reporte.usuario_id || 'Anonimo';

    let botonesHTML = '';

    if (reporte.estado !== 'aprobado') {
        botonesHTML += `
            <button onclick="cambiarEstadoReporte(${reporte.id}, 'aprobar')" 
                            class="btn-filter cat-obra" 
                            style="background:#22c55e; 
                            color:white;">
                Aprobar
            </button>`;
    }
    
    if (reporte.estado !== 'rechazado') {
        botonesHTML += `
            <button onclick="cambiarEstadoReporte(${reporte.id}, 'rechazar')" 
                            class="btn-filter cat-accidente" 
                            style="background:#f97316; 
                            color:white;">
                Rechazar
            </button>`;
    }

    botonesHTML += `
        <button onclick="eliminarReporte(${reporte.id})" 
                        class="btn-filter cat-accidente">
            Eliminar
        </button>`;

    actionsContainer.innerHTML = botonesHTML;
}

async function cambiarEstadoReporte(id, accion) {
    const token = localStorage.getItem('viales_token');

    try {
        const res = await fetch(`/api/reportes/${id}/${accion}`, {
            method: 'PUT',
            headers: {
                'Authorization' : `Bearer ${token}`
            }
        });

        const data = await res.json();
        if (res.ok) {
            alert(`Reporte ${accion === 'aprobar' ? 'aprobado' : 'rechazado'} correctamente.`);
            location.reload();
        }
        else{
            alert(data.mensaje || 'Error al procesar la solicitud');
        }

    }
    catch (err) {
        console.error("Error:", err);
        alert("Error de connexion al procesar la solicitud.");
    }
}

//Peticion para Eliminar
async function eliminarReporte(id) {
   if (!confirm("¿Estás seguro de que deseas eliminar este reporte permanentemente?")) return;

   const token = localStorage.getItem('viales_token');

   try {
        const res = await fetch(`/api/reportes/${id}` ,{
            method: 'DELETE',
            headers: {
                'Authorization' : `Bearer ${token}`
            }
        });

        const data = await res.json();
        if (res.ok) {
            alert('Reporte eliminado correctamente');
            window.location.href = 'panel_reportes.html';
        }
        else{
            alert(data.mensaje || 'Error al eliminar el reporte');
        }
   } 
   catch (err) {
        console.error("Error: ", err);
        alert("Error de conexion con el servidor");
   }
}

function obtenerClaseCategoria(cat){
    switch(cat){
        case 'Accidente': return 'cat-accidente';
        case 'Trafico': return 'cat-trafico';
        case 'Calle cerrada': return 'cat-cerrada';
        case 'Inundacion': return 'cat-inundacion';
        case 'Obra vial' :return 'cat-obra';
        default: return 'cat-todos';
    }
}