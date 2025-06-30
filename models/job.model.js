const db = require('../config/database');
const { notifyMatchingUstas } = require('../services/socket')

/**
 * Job Model - İlan ilə əlaqəli verilənlər bazası əməliyyatları
 */
class Job {
  /**
   * Yeni ilan əlavə etmə
   * @param {Object} jobData - İlan məlumatları
   * @returns {Object} Yaradılmış ilan
   */
  static async create(jobData) {
    try {
      const [result] = await db.execute(
        'INSERT INTO jobs (customer_id, title, description, category_id, city_id) VALUES (?, ?, ?, ?, ?)',
        [
          jobData.customer_id,
          jobData.title,
          jobData.description,
          jobData.category_id,
          jobData.city_id
        ]
      );
      notifyMatchingUstas(result.insertId);
      return await this.findById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * İlan ID'sinə görə axtarış
   * @param {Number} id - İlan ID
   * @returns {Object|null} Tapılmış ilan və ya null
   */
  static async findById(id) {
    try {
      const [rows] = await db.execute(`
        SELECT j.*, 
          c.name as category_name, 
          ct.name as city_name, 
          u.name as customer_name, u.surname as customer_surname, u.email as customer_email,
          m.name as master_name, m.surname as master_surname,
          (SELECT COUNT(*) FROM proposals WHERE job_id = j.id) as proposal_count
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN cities ct ON j.city_id = ct.id
        LEFT JOIN users u ON j.customer_id = u.id
        LEFT JOIN masters m ON j.selected_master_id = m.id
        WHERE j.id = ?
      `, [id]);

      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * "Pending" statusunda olan bütün ilanları almaq
   * @returns {Array} İlanların siyahısı
   */
  static async getAllPending() {
    try {
      const [rows] = await db.execute(`
        SELECT j.*, 
          c.name as category_name, 
          ct.name as city_name,
          u.name as customer_name, 
          u.surname as customer_surname,
          (SELECT COUNT(*) FROM proposals WHERE job_id = j.id) as proposal_count
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN cities ct ON j.city_id = ct.id
        LEFT JOIN users u ON j.customer_id = u.id
        WHERE j.status = 'pending'
        ORDER BY j.created_at DESC
      `);

      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * İlanları filtrələmək
   * @param {Object} filters - Filtr parametrləri (city_id, category_id, title)
   * @returns {Array} Filtrələnmiş ilanların siyahısı
   */
  static async getFilteredJobs(filters = {}) {
    try {
      let query = `
        SELECT j.*, 
          c.name as category_name, 
          ct.name as city_name,
          u.name as customer_name, 
          u.surname as customer_surname,
          (SELECT COUNT(*) FROM proposals WHERE job_id = j.id) as proposal_count
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN cities ct ON j.city_id = ct.id
        LEFT JOIN users u ON j.customer_id = u.id
        WHERE j.status = 'pending'
      `;

      const queryParams = [];

      // Şəhərə görə filtrələmə
      if (filters.city_id) {
        query += " AND j.city_id = ?";
        queryParams.push(filters.city_id);
      }

      // Kateqoriyaya görə filtrələmə
      if (filters.category_id) {
        query += " AND j.category_id = ?";
        queryParams.push(filters.category_id);
      }

      // Başlığa görə filtrələmə
      if (filters.title) {
        query += " AND j.title LIKE ?";
        queryParams.push(`%${filters.title}%`);
      }

      query += " ORDER BY j.created_at DESC";

      const [rows] = await db.execute(query, queryParams);

      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * İstifadəçinin ilanlarını almaq (durum filtrelemesi ile)
   * @param {Number} userId - İstifadəçi ID
   * @param {String|null} status - İlanın durumu (pending, in_progress, completed)
   * @returns {Array} İstifadəçinin ilanları
   */
  static async getUserJobs(userId, status = null) {
    try {
      let query = `
        SELECT j.*, 
          c.name as category_name, 
          ct.name as city_name,
          u.name as customer_name, 
          u.surname as customer_surname,
          m.name as master_name, 
          m.surname as master_surname,
          (SELECT COUNT(*) FROM proposals WHERE job_id = j.id) as proposal_count
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN cities ct ON j.city_id = ct.id
        LEFT JOIN users u ON j.customer_id = u.id
        LEFT JOIN masters m ON j.selected_master_id = m.id
        WHERE j.customer_id = ?
      `;

      const queryParams = [userId];

      if (status) {
        query += " AND j.status = ?";
        queryParams.push(status);
      }

      query += " ORDER BY j.created_at DESC";

      const [rows] = await db.execute(query, queryParams);

      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * İstifadəçinin davam edən işlərini almaq
   * @param {Number} customerId - Müştəri ID
   * @returns {Array} Müştərinin davam edən işləri
   */
  static async getCustomerInProgressJobs(customerId) {
    try {
      const [rows] = await db.execute(`
        SELECT j.*, 
          c.name as category_name, 
          ct.name as city_name,
          u.name as customer_name, 
          u.surname as customer_surname,
          m.name as master_name, 
          m.surname as master_surname, 
          m.phone as master_phone
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN cities ct ON j.city_id = ct.id
        LEFT JOIN users u ON j.customer_id = u.id
        LEFT JOIN masters m ON j.selected_master_id = m.id
        WHERE j.customer_id = ? AND j.status = 'in_progress'
        ORDER BY j.created_at DESC
      `, [customerId]);

      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Ustanın davam edən işlərini almaq
   * @param {Number} masterId - Usta ID
   * @returns {Array} Ustanın davam edən işləri
   */
  static async getMasterInProgressJobs(masterId) {
    try {
      const [rows] = await db.execute(`
        SELECT j.*, 
          c.name as category_name, 
          ct.name as city_name,
          u.name as customer_name, 
          u.surname as customer_surname, 
          u.phone as customer_phone
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN cities ct ON j.city_id = ct.id
        LEFT JOIN users u ON j.customer_id = u.id
        WHERE j.selected_master_id = ? AND j.status = 'in_progress'
        ORDER BY j.created_at DESC
      `, [masterId]);

      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Təklifi qəbul etmək və işi başlatmaq
   * @param {Number} jobId - İş ID
   * @param {Number} masterId - Usta ID
   * @param {Number} customerId - Müştəri ID (təhlükəsizlik yoxlaması üçün)
   * @returns {Object} Yenilənmiş iş
   */
  static async acceptProposal(jobId, masterId, customerId) {
    try {
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        await connection.execute(
          'UPDATE jobs SET status = "in_progress", selected_master_id = ? WHERE id = ? AND customer_id = ? AND status = "pending"',
          [masterId, jobId, customerId]
        );

        await connection.execute(
          'DELETE FROM proposals WHERE job_id = ? AND master_id != ?',
          [jobId, masterId]
        );

        await connection.commit();

        return await this.findById(jobId);
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * İşi tamamlamaq
   * @param {Number} jobId - İş ID
   * @param {Number} customerId - Müştəri ID (təhlükəsizlik yoxlaması üçün)
   * @returns {Object} Yenilənmiş iş
   */
  static async completeJob(jobId, customerId) {
    try {
      await db.execute(
        'UPDATE jobs SET status = "completed" WHERE id = ? AND customer_id = ? AND status = "in_progress"',
        [jobId, customerId]
      );

      return await this.findById(jobId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Müşterinin davam edən işlərinin sayını almaq
   * @param {Number} customerId - Müştəri ID
   * @returns {Number} Müştərinin davam edən işlərinin sayı
   */
  static async getCustomerInProgressJobsCount(customerId) {
    try {
      const [rows] = await db.execute(
        'SELECT COUNT(*) as count FROM jobs WHERE customer_id = ? AND status = "in_progress"',
        [customerId]
      );

      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Ustanın davam edən işlərinin sayını almaq
   * @param {Number} masterId - Usta ID
   * @returns {Number} Ustanın davam edən işlərinin sayı
   */
  static async getMasterInProgressJobsCount(masterId) {
    try {
      const [rows] = await db.execute(
        'SELECT COUNT(*) as count FROM jobs WHERE selected_master_id = ? AND status = "in_progress"',
        [masterId]
      );

      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Ustanın tamamlanmış işlərini və dəyərləndirmələrini almaq
   * @param {Number} masterId - Usta ID
   * @returns {Array} Ustanın tamamlanmış işləri və dəyərləndirmələri
   */
  static async getMasterCompletedJobsWithReviews(masterId) {
    try {
      const [rows] = await db.execute(`
        SELECT j.*, 
          c.name as category_name, 
          ct.name as city_name,
          u.name as customer_name, 
          u.surname as customer_surname,
          r.rating, r.comment, r.created_at as review_date
        FROM jobs j
        LEFT JOIN categories c ON j.category_id = c.id
        LEFT JOIN cities ct ON j.city_id = ct.id
        LEFT JOIN users u ON j.customer_id = u.id
        LEFT JOIN reviews r ON r.job_id = j.id
        WHERE j.selected_master_id = ? AND j.status = 'completed'
        ORDER BY j.created_at DESC
      `, [masterId]);

      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Job; 