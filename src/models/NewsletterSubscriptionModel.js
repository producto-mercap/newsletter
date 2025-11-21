const { query } = require('../config/database');

/**
 * Modelo para manejar suscripciones al newsletter
 */
class NewsletterSubscriptionModel {
    /**
     * Obtener todas las suscripciones activas
     */
    static async getAll(activeOnly = true) {
        let sql = 'SELECT * FROM newsletter_subscriptions';
        if (activeOnly) {
            sql += ' WHERE is_active = true';
        }
        sql += ' ORDER BY subscribed_at DESC';
        
        const result = await query(sql);
        return result.rows;
    }

    /**
     * Obtener una suscripción por email
     */
    static async getByEmail(email) {
        const sql = 'SELECT * FROM newsletter_subscriptions WHERE email = $1';
        const result = await query(sql, [email]);
        return result.rows[0];
    }

    /**
     * Crear una nueva suscripción
     */
    static async create(data) {
        const sql = `
            INSERT INTO newsletter_subscriptions (name, email, bank_entity)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const params = [
            data.name,
            data.email,
            data.bank_entity || null
        ];
        const result = await query(sql, params);
        return result.rows[0];
    }

    /**
     * Actualizar una suscripción
     */
    static async update(id, data) {
        const updates = [];
        const params = [];
        let paramCount = 1;

        if (data.name !== undefined) {
            updates.push(`name = $${paramCount}`);
            params.push(data.name);
            paramCount++;
        }
        if (data.email !== undefined) {
            updates.push(`email = $${paramCount}`);
            params.push(data.email);
            paramCount++;
        }
        if (data.bank_entity !== undefined) {
            updates.push(`bank_entity = $${paramCount}`);
            params.push(data.bank_entity);
            paramCount++;
        }
        if (data.is_active !== undefined) {
            updates.push(`is_active = $${paramCount}`);
            params.push(data.is_active);
            paramCount++;
        }

        updates.push(`updated_at = NOW()`);
        params.push(id);

        const sql = `
            UPDATE newsletter_subscriptions 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await query(sql, params);
        return result.rows[0];
    }

    /**
     * Desactivar una suscripción (soft delete)
     */
    static async unsubscribe(email) {
        const sql = `
            UPDATE newsletter_subscriptions 
            SET is_active = false, updated_at = NOW()
            WHERE email = $1
            RETURNING *
        `;
        const result = await query(sql, [email]);
        return result.rows[0];
    }

    /**
     * Eliminar una suscripción
     */
    static async delete(id) {
        const sql = 'DELETE FROM newsletter_subscriptions WHERE id = $1 RETURNING *';
        const result = await query(sql, [id]);
        return result.rows[0];
    }
}

module.exports = NewsletterSubscriptionModel;


