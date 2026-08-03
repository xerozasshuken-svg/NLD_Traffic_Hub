const esAdminMiddleware = (req, res, next) =>{
    //req.usuario es asignado previamente por authMiddleware
    if (!req.usuario || req.usuario.rol !== 'admin') {
        return res.status(403).json({
            mensaje: 'Acceso denegado: Se requieren permisos de Administrador'
        });
    }
    next();
}   

module.exports = esAdminMiddleware;