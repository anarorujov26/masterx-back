const db = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * User Model - İstifadəçi ilə əlaqəli verilənlər bazası əməliyyatları
 */
class User {
  /**
   * İstifadəçi yaratma
   * @param {Object} userData - İstifadəçi məlumatları
   * @returns {Object} Yaradılmış istifadəçi
   */
  static async create(userData) {
    try {
      // Şifrəni hashləmə
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const [result] = await db.execute(
        'INSERT INTO users (name, surname, email, password, phone) VALUES (?, ?, ?, ?, ?)',
        [userData.name, userData.surname, userData.email, hashedPassword, userData.phone]
      );
      
      const [user] = await db.execute(
        'SELECT id, name, surname, email, phone, created_at FROM users WHERE id = ?',
        [result.insertId]
      );
      
      return user[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Email'ə görə istifadəçi axtarışı
   * @param {String} email - İstifadəçi email
   * @returns {Object|null} Tapılmış istifadəçi və ya null
   */
  static async findByEmail(email) {
    try {
      const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * İstifadəçi ID'sinə görə axtarış
   * @param {Number} id - İstifadəçi ID
   * @returns {Object|null} Tapılmış istifadəçi və ya null
   */
  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT id, name, surname, email, phone, created_at FROM users WHERE id = ?',
        [id]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * İstifadəçi ID'sinə görə telefon nömrəsini almaq
   * @param {Number} id - İstifadəçi ID
   * @returns {Object|null} Telefon nömrəsi və ya null
   */
  static async getPhoneById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT id, phone FROM users WHERE id = ?',
        [id]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Şifrə doğrulaması
   * @param {String} password - Daxil edilən şifrə
   * @param {String} hashedPassword - Verilənlər bazasında saxlanılan hashlanmış şifrə
   * @returns {Boolean} Şifrənin doğru olub-olmaması
   */
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User; 