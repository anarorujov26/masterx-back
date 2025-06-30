const Job = require('../models/job.model');
const Category = require('../models/category.model');
const City = require('../models/city.model');
const Master = require('../models/master.model');
const Review = require('../models/review.model');

/**
 * Yeni ilan əlavə etmə
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.createJob = async (req, res) => {
  try {
    const { title, description, category_id, city_id } = req.body;
    const customer_id = req.user.id;
    
    // Məcburi sahələrin yoxlanması
    if (!title || !description || !category_id || !city_id) {
      return res.status(400).json({
        success: false,
        message: 'Bütün məlumatlar daxil edilməlidir'
      });
    }
    
    // Kateqoriyanın mövcudluğunu yoxlayırıq
    const category = await Category.findById(category_id);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Seçilmiş kateqoriya tapılmadı'
      });
    }
    
    // Şəhərin mövcudluğunu yoxlayırıq
    const city = await City.findById(city_id);
    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'Seçilmiş şəhər tapılmadı'
      });
    }
    
    // İlanı yaradırıq
    const job = await Job.create({
      customer_id,
      title,
      description,
      category_id,
      city_id
    });
    
    res.status(201).json({
      success: true,
      message: 'İlan uğurla əlavə edildi',
      data: job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
};

/**
 * Bütün "pending" ilanları almaq
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.getAllPendingJobs = async (req, res) => {
  try {
    const jobs = await Job.getAllPending();
    
    res.json({
      success: true,
      message: 'İlanlar uğurla alındı',
      data: jobs
    });
  } catch (error) {
    console.error('Get all pending jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
};

/**
 * İlanları filtrələmək
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.getFilteredJobs = async (req, res) => {
  try {
    const { city_id, category_id, title } = req.query;
    
    // Filtr parametrlərini hazırlayırıq
    const filters = {};
    
    if (city_id && !isNaN(city_id)) {
      filters.city_id = parseInt(city_id);
    }
    
    if (category_id && !isNaN(category_id)) {
      filters.category_id = parseInt(category_id);
    }
    
    if (title) {
      filters.title = title;
    }
    
    // Filtrələnmiş ilanları alırıq
    const jobs = await Job.getFilteredJobs(filters);
    
    res.json({
      success: true,
      message: 'Filtrələnmiş ilanlar uğurla alındı',
      data: jobs
    });
  } catch (error) {
    console.error('Get filtered jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
};

/**
 * İlan detallarını almaq
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await Job.findById(id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'İlan tapılmadı'
      });
    }
    
    res.json({
      success: true,
      message: 'İlan detalları uğurla alındı',
      data: job
    });
  } catch (error) {
    console.error('Get job by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
};

/**
 * İstifadəçinin ilanlarını almaq (durum filtrelemesi ile)
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.getUserJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    
    const validStatuses = ['pending', 'in_progress', 'completed'];
    const filterStatus = status && validStatuses.includes(status) ? status : null;
    
    const jobs = await Job.getUserJobs(userId, filterStatus);
    
    res.json({
      success: true,
      message: 'İstifadəçinin ilanları uğurla alındı',
      data: jobs
    });
  } catch (error) {
    console.error('Get user jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
};


exports.acceptProposal = async (req, res) => {
  try {
    const { job_id, master_id } = req.body;
    const customer_id = req.user.id;  // Token'dan alırıq
    
    // Məcburi sahələrin yoxlanması
    if (!job_id || !master_id) {
      return res.status(400).json({
        success: false,
        message: 'İş ID və usta ID daxil edilməlidir'
      });
    }
    
    // İşin mövcudluğunu yoxlayırıq
    const job = await Job.findById(job_id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'İş tapılmadı'
      });
    }
    
    // İşin müştəriyə aid olub-olmadığını yoxlayırıq
    if (job.customer_id !== customer_id) {
      return res.status(403).json({
        success: false,
        message: 'Bu işi qəbul etmək üçün icazəniz yoxdur'
      });
    }
    
    // İşin statusunu yoxlayırıq
    if (job.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Bu iş artıq qəbul edilib və ya tamamlanıb'
      });
    }
    
    // Ustanın mövcudluğunu yoxlayırıq
    const master = await Master.findById(master_id);
    if (!master) {
      return res.status(404).json({
        success: false,
        message: 'Usta tapılmadı'
      });
    }
    
    // İşi başladırıq
    const updatedJob = await Job.acceptProposal(job_id, master_id, customer_id);
    
    res.json({
      success: true,
      message: 'Təklif uğurla qəbul edildi və iş başladıldı',
      data: updatedJob
    });
  } catch (error) {
    console.error('Accept proposal error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
};

/**
 * İşi tamamlamaq və dəyərləndirmə əlavə etmək
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.completeJob = async (req, res) => {
  try {
    const { job_id, rating, comment } = req.body;
    const customer_id = req.user.id;  // Token'dan alırıq
    
    // Məcburi sahələrin yoxlanması
    if (!job_id) {
      return res.status(400).json({
        success: false,
        message: 'İş ID daxil edilməlidir'
      });
    }
    
    // İşin mövcudluğunu yoxlayırıq
    const job = await Job.findById(job_id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'İş tapılmadı'
      });
    }
    
    // İşin müştəriyə aid olub-olmadığını yoxlayırıq
    if (job.customer_id !== customer_id) {
      return res.status(403).json({
        success: false,
        message: 'Bu işi tamamlamaq üçün icazəniz yoxdur'
      });
    }
    
    // İşin statusunu yoxlayırıq
    if (job.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Bu iş davam etmir'
      });
    }
    
    // İşi tamamlayırıq
    const updatedJob = await Job.completeJob(job_id, customer_id);
    
    // Dəyərləndirməni əlavə edirik
    if (rating && !isNaN(rating)) {
      await Review.create({
        job_id,
        customer_id,
        master_id: job.selected_master_id,
        rating: parseInt(rating),
        comment: comment || ''
      });
    }
    
    res.json({
      success: true,
      message: 'İş uğurla tamamlandı',
      data: updatedJob
    });
  } catch (error) {
    console.error('Complete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
};

/**
 * Müşterinin davam edən işlərini almaq (sadece müşteri kullanabilir)
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.getCustomerInProgressJobs = async (req, res) => {
  try {
    const customerId = req.user.id;
    
    // Müşterinin devam eden işlerini al
    const jobs = await Job.getCustomerInProgressJobs(customerId);
    
    res.json({
      success: true,
      message: 'Davam edən işlər uğurla alındı',
      data: jobs
    });
  } catch (error) {
    console.error('Get customer in progress jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
};

/**
 * Ustanın davam edən işlərini almaq (sadece usta kullanabilir)
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.getMasterInProgressJobs = async (req, res) => {
  try {
    const masterId = req.user.id;
    
    // Ustanın devam eden işlerini al
    const jobs = await Job.getMasterInProgressJobs(masterId);
    
    res.json({
      success: true,
      message: 'Davam edən işlər uğurla alındı',
      data: jobs
    });
  } catch (error) {
    console.error('Get master in progress jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
};

/**
 * Davam edən işlərin sayını almaq (Müştəri və ya usta üçün)
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.getInProgressJobsCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    let count = 0;
    
    if (userRole === 'user') {
      // Müşterinin devam eden işlerinin sayısını al
      count = await Job.getCustomerInProgressJobsCount(userId);
    } else if (userRole === 'master') {
      // Ustanın devam eden işlerinin sayısını al
      count = await Job.getMasterInProgressJobsCount(userId);
    }
    
    res.json({
      success: true,
      message: 'Davam edən işlərin sayı uğurla alındı',
      data: {
        count: parseInt(count, 10) || 0
      }
    });
  } catch (error) {
    console.error('Get in progress jobs count error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
};

/**
 * Ustanın tamamlanmış işlərini və dəyərləndirmələrini almaq (sadece usta kullanabilir)
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.getMasterCompletedJobsWithReviews = async (req, res) => {
  try {
    const masterId = req.user.id;
    
    // Ustanın tamamlanmış işlerini ve değerlendirmelerini al
    const jobs = await Job.getMasterCompletedJobsWithReviews(masterId);
    
    res.json({
      success: true,
      message: 'Tamamlanmış işlər və dəyərləndirmələr uğurla alındı',
      data: jobs
    });
  } catch (error) {
    console.error('Get master completed jobs with reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
}; 