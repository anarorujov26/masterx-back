const db = require('../config/database');
const { notifyCustomerForProposal } = require('../services/socket');

class Proposal {

  static async create(proposalData) {
    try {
      const [result] = await db.execute(
        'INSERT INTO proposals (job_id, master_id, price, message) VALUES (?, ?, ?, ?)',
        [
          proposalData.job_id, 
          proposalData.master_id, 
          proposalData.price, 
          proposalData.message
        ]
      );
      
      await notifyCustomerForProposal(result.insertId);
      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }
  

  static async findById(id) {
    try {
      const [rows] = await db.execute(`
        SELECT p.*, 
          m.name as master_name, m.surname as master_surname, m.email as master_email,
          j.title as job_title, j.status as job_status
        FROM proposals p
        LEFT JOIN masters m ON p.master_id = m.id
        LEFT JOIN jobs j ON p.job_id = j.id
        WHERE p.id = ?
      `, [id]);
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * İlan ID'sinə görə təklifləri almaq
   * @param {Number} jobId - İlan ID
   * @returns {Array} Təkliflər siyahısı
   */
  static async getByJobId(jobId) {
    try {
      const [rows] = await db.execute(`
        SELECT p.*, 
          m.name as master_name, m.surname as master_surname, m.email as master_email,
          j.title as job_title, j.status as job_status
        FROM proposals p
        LEFT JOIN masters m ON p.master_id = m.id
        LEFT JOIN jobs j ON p.job_id = j.id
        WHERE p.job_id = ?
        ORDER BY p.created_at DESC
      `, [jobId]);
      
      return rows;
    } catch (error) {
      throw error;
 
    }
  }

  
  static async getByMasterId(masterId) {
    try {
      const [rows] = await db.execute(`
        SELECT p.*, 
          j.title as job_title, j.description as job_description, j.status as job_status,
          c.name as category_name, ct.name as city_name,
          u.name as customer_name, u.surname as customer_surname
        FROM proposals p
        LEFT JOIN jobs j ON p.job_id = j.id
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN cities ct ON j.city_id = ct.id
        LEFT JOIN users u ON j.customer_id = u.id
        WHERE p.master_id = ?
        ORDER BY p.created_at DESC
      `, [masterId]);
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getCountByJobId(jobId) {
    try {
      const [rows] = await db.execute(
        'SELECT COUNT(*) as count FROM proposals WHERE job_id = ?',
        [jobId]
      );
      
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Ustanın ilana təklif verib-vermədiyini yoxlamaq
   * @param {Number} jobId - İlan ID
   * @param {Number} masterId - Usta ID
   * @returns {Boolean} Təklif verib-vermədiyi
   */
  static async hasProposal(jobId, masterId) {
    try {
      const [rows] = await db.execute(
        'SELECT COUNT(*) as count FROM proposals WHERE job_id = ? AND master_id = ?',
        [jobId, masterId]
      );
      
      return rows[0].count > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Proposal; 