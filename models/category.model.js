const db = require('../config/database');

/**
 * Category Model - Kateqoriya ilə əlaqəli verilənlər bazası əməliyyatları
 */
class Category {
  /**
   * Bütün kateqoriyaları almaq
   * @returns {Array} Kateqoriyaların siyahısı
   */
  static async getAll() {
    try {
      const [rows] = await db.execute('SELECT * FROM categories ORDER BY name ASC');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * ID'yə görə kateqoriya axtarışı
   * @param {Number} id - Kateqoriya ID
   * @returns {Object|null} Tapılmış kateqoriya və ya null
   */
  static async findById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM categories WHERE id = ?', [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * ID massivində olan kateqoriyaları yoxlayır
   * @param {Array} ids - Kateqoriya ID'ləri
   * @returns {Boolean} Bütün ID'lərin mövcud olub-olmadığı
   */
  static async validateIds(ids) {
    try {
      if (!ids.length) return false;
      
      const placeholders = ids.map(() => '?').join(',');
      const [rows] = await db.execute(
        `SELECT COUNT(*) as count FROM categories WHERE id IN (${placeholders})`,
        ids
      );
      
      return rows[0].count === ids.length;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Category; 