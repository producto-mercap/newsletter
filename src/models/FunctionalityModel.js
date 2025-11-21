const { query } = require('../config/database');

/**
 * Modelo para manejar funcionalidades
 */
class FunctionalityModel {
    /**
     * Obtener todas las funcionalidades con filtros opcionales
     */
    static async getAll(filters = {}) {
        let sql = 'SELECT * FROM functionalities WHERE 1=1';
        const params = [];
        let paramCount = 1;

        // Filtro por tipo (catalogo, newsletter, proximamente)
        if (filters.type) {
            sql += ` AND type = $${paramCount}`;
            params.push(filters.type);
            paramCount++;
        }

        // Filtro por sección
        if (filters.section) {
            sql += ` AND section = $${paramCount}`;
            params.push(filters.section);
            paramCount++;
        }

        // Búsqueda por título o descripción
        if (filters.search) {
            sql += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
            params.push(`%${filters.search}%`);
            paramCount++;
        }

        sql += ' ORDER BY created_at DESC';

        const result = await query(sql, params);
        return result.rows;
    }

    /**
     * Obtener una funcionalidad por ID
     */
    static async getById(id) {
        const sql = 'SELECT * FROM functionalities WHERE id = $1';
        const result = await query(sql, [id]);
        return result.rows[0];
    }

    /**
     * Obtener una funcionalidad por slug
     */
    static async getBySlug(slug) {
        const sql = 'SELECT * FROM functionalities WHERE slug = $1';
        const result = await query(sql, [slug]);
        return result.rows[0];
    }

    /**
     * Crear una nueva funcionalidad
     */
    static async create(data) {
        const sql = `
            INSERT INTO functionalities (title, description, icon, section, type, alcance, alcance_imagen, ventajas_esperadas, partes_interesadas, slug)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;
        const params = [
            data.title,
            data.description || null,
            data.icon || null,
            data.section,
            data.type || 'catalogo',
            data.alcance || null,
            data.alcance_imagen || null,
            data.ventajas_esperadas || null,
            data.partes_interesadas || null,
            data.slug || null
        ];
        const result = await query(sql, params);
        return result.rows[0];
    }

    /**
     * Actualizar una funcionalidad
     */
    static async update(id, data) {
        const updates = [];
        const params = [];
        let paramCount = 1;

        if (data.title !== undefined) {
            updates.push(`title = $${paramCount}`);
            params.push(data.title);
            paramCount++;
        }
        if (data.description !== undefined) {
            updates.push(`description = $${paramCount}`);
            params.push(data.description);
            paramCount++;
        }
        if (data.icon !== undefined) {
            updates.push(`icon = $${paramCount}`);
            params.push(data.icon);
            paramCount++;
        }
        if (data.section !== undefined) {
            updates.push(`section = $${paramCount}`);
            params.push(data.section);
            paramCount++;
        }
        if (data.type !== undefined) {
            updates.push(`type = $${paramCount}`);
            params.push(data.type);
            paramCount++;
        }
        if (data.alcance !== undefined) {
            updates.push(`alcance = $${paramCount}`);
            params.push(data.alcance || null);
            paramCount++;
        }
        if (data.alcance_imagen !== undefined) {
            updates.push(`alcance_imagen = $${paramCount}`);
            params.push(data.alcance_imagen || null);
            paramCount++;
        }
        if (data.ventajas_esperadas !== undefined) {
            updates.push(`ventajas_esperadas = $${paramCount}`);
            params.push(data.ventajas_esperadas || null);
            paramCount++;
        }
        if (data.partes_interesadas !== undefined) {
            updates.push(`partes_interesadas = $${paramCount}`);
            params.push(data.partes_interesadas || null);
            paramCount++;
        }
        if (data.slug !== undefined) {
            updates.push(`slug = $${paramCount}`);
            params.push(data.slug || null);
            paramCount++;
        }

        // Actualizar updated_at
        updates.push(`updated_at = NOW()`);
        params.push(id);

        const sql = `
            UPDATE functionalities 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await query(sql, params);
        return result.rows[0];
    }

    /**
     * Eliminar una funcionalidad
     */
    static async delete(id) {
        const sql = 'DELETE FROM functionalities WHERE id = $1 RETURNING *';
        const result = await query(sql, [id]);
        return result.rows[0];
    }

    /**
     * Obtener funcionalidades por sección y tipo
     */
    static async getBySectionAndType(section, type) {
        const sql = `
            SELECT * FROM functionalities 
            WHERE section = $1 AND type = $2 
            ORDER BY created_at DESC
        `;
        const result = await query(sql, [section, type]);
        return result.rows;
    }
}

module.exports = FunctionalityModel;

