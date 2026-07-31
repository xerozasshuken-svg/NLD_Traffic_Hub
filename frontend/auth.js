document.addEventListener('DOMContentLoaded', ()=>{
    const API_URL = 'http://192.168.1.89:5000/api/auth';

    //Logica para el boton "comenzar"
    const btComenzar = document.getElementById('btn-comenzar');
    if (btComenzar) {
        btComenzar.addEventListener('click', ()=>{
            const token = localStorage.getItem('viales_token');

            if (token) {
                //Si el usuario ya esta autenticado, va a panel
                window.location.href = 'panel_reportes.html';
            }
            else{
                //Si no
                window.location.href = 'inicio_sesion.html';
            }
        });
    }

    //Logica para el formulario de inicio de sesion
    const formLogin = document.getElementById('form-login');
    if(formLogin){
        formLogin.addEventListener('submit', async (e) =>{
            e.preventDefault();

            const correo = document.getElementById('correo').value;
            const password = document.getElementById('password').value;

            console.log("Intentando login con:", { correo, password });

            try {
                const respuesta = await fetch(`${API_URL}/login`,{
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify({correo, password})
                });  

                const datos = await respuesta.json();

                if (respuesta.ok) {
                    //Guardar Token y datos
                    localStorage.setItem('viales_token', datos.token);
                    localStorage.setItem('viales_user', JSON.stringify(datos.usuario));

                    alert('Inicio de sesion exitoso');
                    window.location.href = 'panel_reportes.html';
                }
                else{
                    alert(datos.mensaje || 'Error al iniciar sesion');
                }
            }
            catch (error) {
                console.error('Error:', error);
                alert('No se pudo conectar con el servidor backend');
            }

        });
    }

    //Logica para el formulario de registro
    const formRegistro = document.getElementById('form-registro');
    if (formRegistro) {
        formRegistro.addEventListener('submit', async (e) =>{
            e.preventDefault();

            const nombre = document.getElementById('nombre').value;
            const correo = document.getElementById('correo-reg').value;
            const password = document.getElementById('password-reg').value;

            try {
                const respuesta = await fetch(`${API_URL}/registrar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify({nombre,correo,password})
                });

                const datos = await respuesta.json();

                if (respuesta.ok) {
                    alert('Usuario registrado con exito');
                    window.location.href = 'inicio_sesion.html';
                }
                else{
                    alert(datos.mensaje || 'Error al registrar usuario');
                }
            } catch (error) {
                console.error('Error: ', error);
                alert('No se pudo conectar con el servidor backend');
            }
        });
    }

    // Logica para la pagina Cuenta.html
    const accountContainer = document.getElementById('account-content');
    if (accountContainer) {
        const usuarioStorage = localStorage.getItem('viales_user');

        if (usuarioStorage) {
            const usuario = JSON.parse(usuarioStorage);
            //Sin no se envio el rol, por defecto 'usuario'
            const rolUser = usuario.rol || 'usuario';
            const esAdmin = rolUser === 'admin';

            accountContainer.innerHTML = `
                <div class="account-info">
                    <div class="account-field">
                        <span class="account-label">Nombre</span>
                        <span class="account-value">${usuario.nombre || 'sin nombre'}</span>
                    </div>

                    <div class="account-field">
                        <span class="account-label">Correo</span>
                        <span class="account-value">${usuario.correo || 'sin correo'}</span>
                    </div>

                    <div class="account-field">
                        <span class="account-label">Usuario</span>
                        <span class="role-badge ${esAdmin ? 'admin' : 'user'}">
                            ${esAdmin ? 'Administrador' : 'usuario Ciudadano'}
                        </span>
                    </div>
                </div>

                ${esAdmin ? `
                    <div style="background-color: #fff5f5; border: 1px dashed #feb2b2; padding: 10px; border-radius: 8px; margin-bottom: 15px; font-size: 13px; color: #c53030;">
                        Eres admin
                    </div>
                ` : ''}

                <button id="btn-logout" class="btn-auth-submit" style="background-color: #e74c3c;">
                    Cerrar Sesion
                </button>
            `;
            
            //Boton de cerrar sesion
            document.getElementById('btn-logout').addEventListener('click', ()=>{
                localStorage.removeItem('viales_token');
                localStorage.removeItem('viales_user');
                alert('Sesion cerrada correctamente');
                window.location.href = 'comienzo.html';
            });
        }
        else{
            //Si no esta logueado
            accountContainer.innerHTML = `
                <p style="color: #7f8c8d; margin-bottom: 20px;">
                    No has iniciado sesion
                </p>
                <a href="inicio_sesion.html" class="btn-auth-submit" style="display: block; text-decoration: none; text-align: center;">
                    Iniciar sesion
                </a>
            `;
        }
    }
});