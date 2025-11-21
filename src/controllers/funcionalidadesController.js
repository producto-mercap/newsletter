const FunctionalityModel = require('../models/FunctionalityModel');

/**
 * Controller para manejar funcionalidades
 */
class FuncionalidadesController {
    /**
     * Mostrar catálogo de funcionalidades
     */
    static async mostrarCatalogo(req, res) {
        try {
            const { section, search } = req.query;
            
            const filters = {
                type: 'catalogo',
                section: section || null,
                search: search || null
            };

            const funcionalidades = await FunctionalityModel.getAll(filters);
            
            // Agrupar por sección
            const porSeccion = {
                'Operatorias': [],
                'Backoffice': [],
                'Market Data': [],
                'Valuacion y Contabilidad': [],
                'Reportes/Interfaces': []
            };

            funcionalidades.forEach(func => {
                if (porSeccion[func.section]) {
                    porSeccion[func.section].push(func);
                }
            });

            // Verificar cookie de admin
            const adminSession = req.cookies && req.cookies.adminSession === 'true';
            
            res.render('pages/catalogo', {
                funcionalidades: porSeccion,
                seccionActiva: section,
                busqueda: search,
                todasLasFuncionalidades: funcionalidades,
                adminSession: adminSession || false
            });
        } catch (error) {
            console.error('Error al obtener catálogo:', error);
            res.status(500).render('pages/error', {
                mensaje: 'Error al cargar el catálogo',
                error: process.env.NODE_ENV === 'development' ? error.message : null
            });
        }
    }

    /**
     * Mostrar newsletter (funcionalidades recientes)
     */
    static async mostrarNewsletter(req, res) {
        try {
            const { search } = req.query;
            
            const filters = {
                type: 'newsletter',
                search: search || null
            };

            const funcionalidades = await FunctionalityModel.getAll(filters);

            // Verificar cookie de admin
            const adminSession = req.cookies && req.cookies.adminSession === 'true';
            
            res.render('pages/newsletter', {
                funcionalidades,
                busqueda: search,
                adminSession: adminSession || false
            });
        } catch (error) {
            console.error('Error al obtener newsletter:', error);
            res.status(500).render('pages/error', {
                mensaje: 'Error al cargar el newsletter',
                error: process.env.NODE_ENV === 'development' ? error.message : null
            });
        }
    }

    /**
     * Mostrar próximamente
     */
    static async mostrarProximamente(req, res) {
        try {
            const { search } = req.query;
            
            const filters = {
                type: 'proximamente',
                search: search || null
            };

            const funcionalidades = await FunctionalityModel.getAll(filters);

            // Verificar cookie de admin
            const adminSession = req.cookies && req.cookies.adminSession === 'true';
            
            res.render('pages/proximamente', {
                funcionalidades,
                busqueda: search,
                adminSession: adminSession || false
            });
        } catch (error) {
            console.error('Error al obtener próximamente:', error);
            res.status(500).render('pages/error', {
                mensaje: 'Error al cargar próximamente',
                error: process.env.NODE_ENV === 'development' ? error.message : null
            });
        }
    }

    /**
     * Mostrar detalle de una funcionalidad
     */
    static async mostrarDetalle(req, res) {
        try {
            const { slug } = req.params;
            
            // Verificar si el admin está logueado
            // Verificar cookie de admin
            const adminSession = req.cookies && req.cookies.adminSession === 'true';
            
            // Si el slug es "nueva", crear una funcionalidad vacía para el formulario
            if (slug === 'nueva') {
                if (!adminSession) {
                    return res.status(403).render('pages/error', {
                        mensaje: 'Acceso denegado. Se requiere autenticación de administrador.',
                        error: null
                    });
                }
                
                const funcionalidad = {
                    id: null,
                    title: '',
                    description: '',
                    icon: '',
                    section: 'Operatorias',
                    type: 'catalogo',
                    alcance: null,
                    ventajas_esperadas: null,
                    partes_interesadas: null,
                    slug: 'nueva'
                };
                
                return res.render('pages/detalle', {
                    funcionalidad,
                    adminSession: true,
                    isNew: true
                });
            }
            
            const funcionalidad = await FunctionalityModel.getBySlug(slug);

            if (!funcionalidad) {
                return res.status(404).render('pages/404');
            }

            // Si viene con ?edit=true y es admin, mostrar el formulario de edición directamente
            const editMode = req.query.edit === 'true' && adminSession;

            res.render('pages/detalle', {
                funcionalidad,
                adminSession: adminSession || false,
                isNew: false,
                editMode: editMode || false
            });
        } catch (error) {
            console.error('Error al obtener detalle:', error);
            res.status(500).render('pages/error', {
                mensaje: 'Error al cargar la funcionalidad',
                error: process.env.NODE_ENV === 'development' ? error.message : null
            });
        }
    }

    /**
     * Mostrar formulario de ABM
     */
    static async mostrarABM(req, res) {
        try {
            // Verificar sesión admin
            // Verificar cookie de admin
            const adminSession = req.cookies && req.cookies.adminSession === 'true';
            if (!adminSession) {
                // Verificar también en query string o header personalizado
                const isAdmin = req.query.admin === 'true' || req.headers['x-admin-session'] === 'true';
                if (!isAdmin) {
                    return res.status(403).render('pages/error', {
                        mensaje: 'Acceso denegado. Se requiere autenticación de administrador.',
                        error: null
                    });
                }
            }

            const { id } = req.query;
            let funcionalidad = null;

            if (id) {
                funcionalidad = await FunctionalityModel.getById(id);
                if (!funcionalidad) {
                    return res.status(404).render('pages/404');
                }
            }

            // Obtener todas las funcionalidades para listar
            const todas = await FunctionalityModel.getAll();

            res.render('pages/abm', {
                funcionalidad,
                todasLasFuncionalidades: todas
            });
        } catch (error) {
            console.error('Error al cargar ABM:', error);
            res.status(500).render('pages/error', {
                mensaje: 'Error al cargar el formulario',
                error: process.env.NODE_ENV === 'development' ? error.message : null
            });
        }
    }

    /**
     * Crear nueva funcionalidad
     */
    static async crear(req, res) {
        try {
            const { title, description, icon, section, type, alcance, alcance_imagen, ventajas_esperadas, partes_interesadas } = req.body;

            if (!title || !section) {
                return res.status(400).json({
                    success: false,
                    error: 'Título y sección son requeridos'
                });
            }

            // Generar slug desde el título
            const slug = title.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();

            const nuevaFuncionalidad = await FunctionalityModel.create({
                title,
                description,
                icon,
                section,
                type: type || 'catalogo',
                alcance: alcance && Array.isArray(alcance) && alcance.length > 0 ? JSON.stringify(alcance) : null,
                alcance_imagen: alcance_imagen || null,
                ventajas_esperadas: ventajas_esperadas && Array.isArray(ventajas_esperadas) && ventajas_esperadas.length > 0 ? JSON.stringify(ventajas_esperadas) : null,
                partes_interesadas: partes_interesadas && partes_interesadas.length > 0 ? JSON.stringify(partes_interesadas) : null,
                slug
            });

            res.json({
                success: true,
                funcionalidad: nuevaFuncionalidad
            });
        } catch (error) {
            console.error('Error al crear funcionalidad:', error);
            res.status(500).json({
                success: false,
                error: 'Error al crear la funcionalidad'
            });
        }
    }

    /**
     * Actualizar funcionalidad
     */
    static async actualizar(req, res) {
        try {
            const { id } = req.params;
            const { title, description, icon, section, type, alcance, alcance_imagen, ventajas_esperadas, partes_interesadas } = req.body;

            // Validación para actualización completa
            if (title && section) {
                // Generar slug desde el título
                const slug = title.toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .trim();

                const funcionalidadActualizada = await FunctionalityModel.update(id, {
                    title,
                    description,
                    icon,
                    section,
                    type,
                    alcance: alcance && Array.isArray(alcance) && alcance.length > 0 ? JSON.stringify(alcance) : null,
                    alcance_imagen: alcance_imagen || null,
                    ventajas_esperadas: ventajas_esperadas && Array.isArray(ventajas_esperadas) && ventajas_esperadas.length > 0 ? JSON.stringify(ventajas_esperadas) : null,
                    partes_interesadas: partes_interesadas ? JSON.stringify(partes_interesadas) : null,
                    slug
                });

                if (!funcionalidadActualizada) {
                    return res.status(404).json({
                        success: false,
                        error: 'Funcionalidad no encontrada'
                    });
                }

                return res.json({
                    success: true,
                    funcionalidad: funcionalidadActualizada
                });
            }

            // Actualización parcial (solo campos específicos)
            const updateData = {};
            if (description !== undefined) updateData.description = description;
            if (alcance !== undefined) updateData.alcance = alcance && Array.isArray(alcance) && alcance.length > 0 ? JSON.stringify(alcance) : null;
            if (alcance_imagen !== undefined) updateData.alcance_imagen = alcance_imagen || null;
            if (ventajas_esperadas !== undefined) updateData.ventajas_esperadas = ventajas_esperadas && Array.isArray(ventajas_esperadas) && ventajas_esperadas.length > 0 ? JSON.stringify(ventajas_esperadas) : null;
            if (partes_interesadas !== undefined) updateData.partes_interesadas = partes_interesadas ? JSON.stringify(partes_interesadas) : null;
            if (type !== undefined) updateData.type = type;
            if (section !== undefined) updateData.section = section;
            if (icon !== undefined) updateData.icon = icon;

            const funcionalidadActualizada = await FunctionalityModel.update(id, updateData);

            if (!funcionalidadActualizada) {
                return res.status(404).json({
                    success: false,
                    error: 'Funcionalidad no encontrada'
                });
            }

            res.json({
                success: true,
                funcionalidad: funcionalidadActualizada
            });
        } catch (error) {
            console.error('Error al actualizar funcionalidad:', error);
            res.status(500).json({
                success: false,
                error: 'Error al actualizar la funcionalidad'
            });
        }
    }

    /**
     * Eliminar funcionalidad
     */
    static async eliminar(req, res) {
        try {
            const { id } = req.params;
            const funcionalidad = await FunctionalityModel.delete(id);

            if (!funcionalidad) {
                return res.status(404).json({
                    success: false,
                    error: 'Funcionalidad no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Funcionalidad eliminada correctamente'
            });
        } catch (error) {
            console.error('Error al eliminar funcionalidad:', error);
            res.status(500).json({
                success: false,
                error: 'Error al eliminar la funcionalidad'
            });
        }
    }

    /**
     * Obtener sugerencias de búsqueda
     */
    static async obtenerSugerencias(req, res) {
        try {
            const { q } = req.query;
            
            if (!q || q.length < 2) {
                return res.json({ sugerencias: [] });
            }

            const funcionalidades = await FunctionalityModel.getAll({
                search: q
            });

            // Extraer títulos únicos con su tipo y sección para redirección
            const sugerencias = funcionalidades
                .slice(0, 5)
                .map(f => ({
                    title: f.title,
                    type: f.type,
                    section: f.section,
                    id: f.id,
                    slug: f.slug || f.title.toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .trim()
                }));

            res.json({ sugerencias });
        } catch (error) {
            console.error('Error al obtener sugerencias:', error);
            res.json({ sugerencias: [] });
        }
    }

    /**
     * Verificar contraseña de admin
     */
    static async verificarAdmin(req, res) {
        try {
            const { password } = req.body;
            const adminPassword = process.env.ADMIN_PASSWORD || 'MPmercap767';
            
            if (password === adminPassword) {
                // Establecer cookie de sesión admin
                res.cookie('adminSession', 'true', {
                    maxAge: 24 * 60 * 60 * 1000, // 24 horas
                    httpOnly: false, // Permitir acceso desde JavaScript
                    path: '/'
                });
                res.json({ success: true });
            } else {
                res.json({ success: false, error: 'Contraseña incorrecta' });
            }
        } catch (error) {
            console.error('Error al verificar admin:', error);
            res.json({ success: false, error: 'Error al verificar contraseña' });
        }
    }
}

module.exports = FuncionalidadesController;

