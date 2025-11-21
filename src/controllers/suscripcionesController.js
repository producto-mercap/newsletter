const NewsletterSubscriptionModel = require('../models/NewsletterSubscriptionModel');

/**
 * Controller para manejar suscripciones al newsletter
 */
class SuscripcionesController {
    /**
     * Crear nueva suscripción
     */
    static async suscribir(req, res) {
        try {
            const { name, email, bank_entity } = req.body;

            if (!name || !email) {
                return res.status(400).json({
                    success: false,
                    error: 'Nombre y email son requeridos'
                });
            }

            // Validar formato de email básico
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    error: 'Email inválido'
                });
            }

            // Verificar si ya existe
            const existente = await NewsletterSubscriptionModel.getByEmail(email);
            if (existente) {
                // Si existe pero está inactiva, reactivarla
                if (!existente.is_active) {
                    const actualizada = await NewsletterSubscriptionModel.update(existente.id, {
                        is_active: true,
                        name,
                        bank_entity
                    });
                    return res.json({
                        success: true,
                        message: 'Suscripción reactivada',
                        suscripcion: actualizada
                    });
                }
                return res.status(400).json({
                    success: false,
                    error: 'Este email ya está suscrito'
                });
            }

            const nuevaSuscripcion = await NewsletterSubscriptionModel.create({
                name,
                email,
                bank_entity: bank_entity || null
            });

            res.json({
                success: true,
                message: 'Suscripción realizada correctamente',
                suscripcion: nuevaSuscripcion
            });
        } catch (error) {
            console.error('Error al suscribir:', error);
            
            // Error de constraint único (email duplicado)
            if (error.code === '23505') {
                return res.status(400).json({
                    success: false,
                    error: 'Este email ya está suscrito'
                });
            }

            res.status(500).json({
                success: false,
                error: 'Error al procesar la suscripción'
            });
        }
    }

    /**
     * Desuscribir (soft delete)
     */
    static async desuscribir(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    error: 'Email es requerido'
                });
            }

            const suscripcion = await NewsletterSubscriptionModel.unsubscribe(email);

            if (!suscripcion) {
                return res.status(404).json({
                    success: false,
                    error: 'Email no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Desuscripción realizada correctamente'
            });
        } catch (error) {
            console.error('Error al desuscribir:', error);
            res.status(500).json({
                success: false,
                error: 'Error al procesar la desuscripción'
            });
        }
    }

    /**
     * Obtener todas las suscripciones (admin)
     */
    static async obtenerTodas(req, res) {
        try {
            const suscripciones = await NewsletterSubscriptionModel.getAll(false);
            res.json({
                success: true,
                suscripciones
            });
        } catch (error) {
            console.error('Error al obtener suscripciones:', error);
            res.status(500).json({
                success: false,
                error: 'Error al obtener suscripciones'
            });
        }
    }
}

module.exports = SuscripcionesController;


