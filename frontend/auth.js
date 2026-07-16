document.addEventListener('DOMContentLoaded', ()=>{
    const API_URL = 'http://10.55.89.124:5000/api/auth';

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
});