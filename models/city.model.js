const db = require('../config/database');

/**
 * City Model - Şəhər ilə əlaqəli verilənlər bazası əməliyyatları
 */
class City {
  /**
   * Bütün şəhərləri almaq
   * @returns {Array} Şəhərlərin siyahısı
   */
  static async getAll() {
    try {
      const [rows] = await db.execute('SELECT * FROM cities ORDER BY name ASC');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * ID'yə görə şəhər axtarışı
   * @param {Number} id - Şəhər ID
   * @returns {Object|null} Tapılmış şəhər və ya null
   */
  static async findById(id) {
    try {
      const [rows] = await db.execute('SELECT * FROM cities WHERE id = ?', [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = City; 