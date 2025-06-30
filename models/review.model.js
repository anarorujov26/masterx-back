const db = require('../config/database');

/**
 * Review Model - Dəyərləndirmə ilə əlaqəli verilənlər bazası əməliyyatları
 */
class Review {
  /**
   * Yeni dəyərləndirmə əlavə etmə
   * @param {Object} reviewData - Dəyərləndirmə məlumatları
   * @returns {Object} Yaradılmış dəyərləndirmə
   */
  static async create(reviewData) {
    try {
      const [result] = await db.execute(
        'INSERT INTO reviews (job_id, master_id, customer_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
        [
          reviewData.job_id, 
          reviewData.master_id, 
          reviewData.customer_id, 
          reviewData.rating,
          reviewData.comment
        ]
      );
      
      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Dəyərləndirmə ID'sinə görə axtarış
   * @param {Number} id - Dəyərləndirmə ID
   * @returns {Object|null} Tapılmış dəyərləndirmə və ya null
   */
  static async findById(id) {
    try {
      const [rows] = await db.execute(`
        SELECT r.*, 
          m.name as master_name, m.surname as master_surname, 
          u.name as customer_name, u.surname as customer_surname,
          j.title as job_title
        FROM reviews r
        LEFT JOIN masters m ON r.master_id = m.id
        LEFT JOIN users u ON r.customer_id = u.id
        LEFT JOIN jobs j ON r.job_id = j.id
        WHERE r.id = ?
      `, [id]);
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Review; 