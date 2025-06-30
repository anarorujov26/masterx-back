const db = require('../config/database');
const bcrypt = require('bcrypt');

class Master {

  static async create(masterData, categories) {
    let connection;
    try {
      // Şifrəni hashləmə
      const hashedPassword = await bcrypt.hash(masterData.password, 10);
      
      // Transaksiya başlatmaq
      connection = await db.getConnection();
      await connection.beginTransaction();
      
      // Ustanı yaratmaq
      const [result] = await connection.execute(
        'INSERT INTO masters (name, surname, email, password, phone, profile_image, city_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          masterData.name,
          masterData.surname,
          masterData.email,
          hashedPassword,
          masterData.phone,
          masterData.profile_image || null,
          masterData.city_id
        ]
      );
      
      const masterId = result.insertId;
      
      // Usta bacarıqlarını əlavə etmək
      for (const categoryId of categories) {
        await connection.execute(
          'INSERT INTO master_skills (master_id, category_id) VALUES (?, ?)',
          [masterId, categoryId]
        );
      }
      
      // Transaksiya təsdiqi
      await connection.commit();
      
      // Yaradılmış ustanı qaytarmaq
      const [master] = await db.execute(
        'SELECT id, name, surname, email, phone, profile_image, city_id, created_at FROM masters WHERE id = ?',
        [masterId]
      );
      
      const [skills] = await db.execute(
        'SELECT ms.category_id, c.name FROM master_skills ms JOIN categories c ON ms.category_id = c.id WHERE ms.master_id = ?',
        [masterId]
      );
      
      const [cityInfo] = await db.execute(
        'SELECT * FROM cities WHERE id = ?',
        [masterData.city_id]
      );
      
      return {
        ...master[0],
        city: cityInfo[0] || null,
        skills: skills || []
      };
    } catch (error) {
      // Xəta baş verdikdə, transaksiya geri qaytarılır
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Email'ə görə usta axtarışı
   * @param {String} email - Usta email
   * @returns {Object|null} Tapılmış usta və ya null
   */
  static async findByEmail(email) {
    try {
      const [rows] = await db.execute('SELECT * FROM masters WHERE email = ?', [email]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * ID'yə görə usta axtarışı və bacarıqları/şəhər məlumatlarını əlavə etmək
   * @param {Number} id - Usta ID
   * @returns {Object|null} Tapılmış usta və ya null
   */
  static async findById(id) {
    try {
      const [master] = await db.execute(
        'SELECT id, name, surname, email, phone, profile_image, city_id, created_at FROM masters WHERE id = ?',
        [id]
      );
      
      if (!master.length) return null;
      
      const [skills] = await db.execute(
        'SELECT ms.category_id, c.name FROM master_skills ms JOIN categories c ON ms.category_id = c.id WHERE ms.master_id = ?',
        [id]
      );
      
      const [cityInfo] = await db.execute(
        'SELECT * FROM cities WHERE id = ?',
        [master[0].city_id]
      );
      
      return {
        ...master[0],
        city: cityInfo[0] || null,
        skills: skills || []
      };
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

  /**
   * Bütün ustaların listesini almaq (ortalama dəyərləndirmə və kateqoriyaları ilə)
   * @returns {Array} Ustaların siyahısı
   */
  static async getAllMastersWithRating() {
    try {
      // Önce tüm ustaları ve temel bilgilerini alalım
      const [masters] = await db.execute(`
        SELECT 
          m.id, 
          m.name, 
          m.surname, 
          c.id as city_id, 
          c.name as city_name,
          IFNULL(AVG(r.rating), 0) as average_rating,
          COUNT(DISTINCT j.id) as completed_jobs_count
        FROM 
          masters m
        LEFT JOIN 
          cities c ON m.city_id = c.id
        LEFT JOIN 
          jobs j ON j.selected_master_id = m.id AND j.status = 'completed'
        LEFT JOIN 
          reviews r ON r.master_id = m.id
        GROUP BY 
          m.id
        ORDER BY 
          average_rating DESC, completed_jobs_count DESC
      `);
      
      // Her usta için kategori bilgilerini alalım
      const mastersWithCategories = await Promise.all(
        masters.map(async (master) => {
          // Ustanın beceri kategorilerini alalım
          const [categories] = await db.execute(`
            SELECT 
              ms.category_id,
              c.name as category_name
            FROM 
              master_skills ms
            JOIN 
              categories c ON ms.category_id = c.id
            WHERE 
              ms.master_id = ?
          `, [master.id]);
          
          return {
            ...master,
            categories: categories || []
          };
        })
      );
      
      return mastersWithCategories;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Usta profilini almaq (ortalama dəyərləndirmə, tamamlanmış iş sayı və bacarıqları ilə)
   * @param {Number} masterId - Usta ID
   * @returns {Object|null} Usta profili və ya null
   */
  static async getMasterProfileWithStats(masterId) {
    try {
      // Usta əsas məlumatları
      const [masterData] = await db.execute(`
        SELECT 
          m.id, 
          m.name, 
          m.surname, 
          m.email, 
          m.phone, 
          m.profile_image, 
          c.id as city_id, 
          c.name as city_name,
          IFNULL(AVG(r.rating), 0) as average_rating,
          COUNT(DISTINCT j.id) as completed_jobs_count
        FROM 
          masters m
        LEFT JOIN 
          cities c ON m.city_id = c.id
        LEFT JOIN 
          jobs j ON j.selected_master_id = m.id AND j.status = 'completed'
        LEFT JOIN 
          reviews r ON r.master_id = m.id
        WHERE 
          m.id = ?
        GROUP BY 
          m.id
      `, [masterId]);

      if (!masterData.length) return null;

      // Usta bacarıqları
      const [skills] = await db.execute(`
        SELECT 
          ms.category_id, 
          c.name as category_name
        FROM 
          master_skills ms
        JOIN 
          categories c ON ms.category_id = c.id
        WHERE 
          ms.master_id = ?
      `, [masterId]);

      return {
        ...masterData[0],
        skills: skills || []
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Ustanın kateqoriyalara görə performansını almaq (sadəcə iş bitirdiyi kateqoriyalar)
   * @param {Number} masterId - Usta ID
   * @returns {Array} Kateqoriyalara görə performans
   */
  static async getMasterCategoryPerformance(masterId) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          c.id as category_id, 
          c.name as category_name,
          COUNT(j.id) as completed_jobs_count,
          IFNULL(AVG(r.rating), 0) as average_rating
        FROM 
          jobs j
        JOIN 
          categories c ON j.category_id = c.id
        LEFT JOIN 
          reviews r ON r.job_id = j.id AND r.master_id = ?
        WHERE 
          j.selected_master_id = ? 
          AND j.status = 'completed'
        GROUP BY 
          c.id
        HAVING 
          completed_jobs_count > 0
        ORDER BY 
          average_rating DESC, completed_jobs_count DESC
      `, [masterId, masterId]);
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Ustanın müəyyən kateqoriyada tamamladığı işləri və dəyərləndirmələri almaq
   * @param {Number} masterId - Usta ID
   * @param {Number} categoryId - Kateqoriya ID
   * @returns {Array} Tamamlanmış işlər və dəyərləndirmələr
   */
  static async getMasterCompletedJobsByCategory(masterId, categoryId) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          j.id as job_id, 
          j.title, 
          j.description,
          j.created_at as job_created_at,
          c.id as category_id,
          c.name as category_name,
          u.id as customer_id,
          u.name as customer_name,
          u.surname as customer_surname,
          r.id as review_id,
          r.rating,
          r.comment,
          r.created_at as review_date
        FROM 
          jobs j
        JOIN 
          categories c ON j.category_id = c.id
        JOIN 
          users u ON j.customer_id = u.id
        LEFT JOIN 
          reviews r ON r.job_id = j.id AND r.master_id = ?
        WHERE 
          j.selected_master_id = ? 
          AND j.status = 'completed'
          AND j.category_id = ?
        ORDER BY 
          j.created_at DESC
      `, [masterId, masterId, categoryId]);
      
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Master; 