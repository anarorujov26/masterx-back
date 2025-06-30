const Proposal = require('../models/proposal.model');
const Job = require('../models/job.model');

/**
 * Təklif yaratma
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.createProposal = async (req, res) => {
  try {
    const { job_id, price, message } = req.body;
    const master_id = req.user.id;
    
    // Məcburi sahələrin yoxlanması
    if (!job_id || !price) {
      return res.status(400).json({
        success: false,
        message: 'İş ID və qiymət daxil edilməlidir'
      });
    }
    
    // İlanın mövcudluğunu yoxlayırıq
    const job = await Job.findById(job_id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'İlan tapılmadı'
      });
    }
    
    // İlanın statusunu yoxlayırıq
    if (job.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Bu ilana artıq təklif vermək mümkün deyil'
      });
    }
    
    // Ustanın bu ilana artıq təklif verib-vermədiyini yoxlayırıq
    const hasProposal = await Proposal.hasProposal(job_id, master_id);
    if (hasProposal) {
      return res.status(400).json({
        success: false,
        message: 'Siz artıq bu ilana təklif vermisiniz'
      });
    }
    
    // Təklifi yaradırıq
    const proposal = await Proposal.create({
      job_id,
      master_id,
      price,
      message: message || null
    });
    
    res.status(201).json({
      success: true,
      message: 'Təklif uğurla əlavə edildi',
      data: proposal
    });
  } catch (error) {
    console.error('Create proposal error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
};

/**
 * İlan ID'sinə görə təklifləri almaq
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.getProposalsByJobId = async (req, res) => {
  try {
    const { job_id } = req.params;
    
    // İlanın mövcudluğunu yoxlayırıq
    const job = await Job.findById(job_id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'İlan tapılmadı'
      });
    }
    
    // İlanın müştəriyə aid olub-olmadığını yoxlayırıq
    if (job.customer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu ilana aid təklifləri görmək üçün icazəniz yoxdur'
      });
    }
    
    // Təklifləri alırıq
    const proposals = await Proposal.getByJobId(job_id);
    
    res.json({
      success: true,
      message: 'Təkliflər uğurla alındı',
      data: proposals
    });
  } catch (error) {
    console.error('Get proposals by job id error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
};

/**
 * Ustanın təkliflərini almaq
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.getMasterProposals = async (req, res) => {
  try {
    const master_id = req.user.id;
    
    // Təklifləri alırıq
    const proposals = await Proposal.getByMasterId(master_id);
    
    res.json({
      success: true,
      message: 'Təkliflər uğurla alındı',
      data: proposals
    });
  } catch (error) {
    console.error('Get master proposals error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
};

/**
 * İlan ID'sinə görə təklif sayını almaq
 * @param {Object} req - Request objesi
 * @param {Object} res - Response objesi
 */
exports.getProposalCountByJobId = async (req, res) => {
  try {
    const { job_id } = req.params;
    
    // İlanın mövcudluğunu yoxlayırıq
    const job = await Job.findById(job_id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'İlan tapılmadı'
      });
    }
    
    // Təklif sayını alırıq
    const count = await Proposal.getCountByJobId(job_id);
    
    res.json({
      success: true,
      message: 'Təklif sayı uğurla alındı',
      data: { job_id, count }
    });
  } catch (error) {
    console.error('Get proposal count error:', error);
    res.status(500).json({
      success: false,
      message: 'Daxili server xətası'
    });
  }
}; 