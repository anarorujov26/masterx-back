const express = require('express');
const proposalController = require('../controllers/proposal.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Usta tarafından teklif oluşturma
router.post('/', authenticate, authorize('master'), proposalController.createProposal);

// Ustanın kendi tekliflerini görmesi
router.get('/master/my-proposals', authenticate, authorize('master'), proposalController.getMasterProposals);

// Müşterinin kendi ilanına gelen teklifleri görmesi
router.get('/job/:job_id', authenticate, authorize('user'), proposalController.getProposalsByJobId);

// İlan için teklif sayısını alma (herkes erişebilir)
router.get('/count/:job_id', proposalController.getProposalCountByJobId);

module.exports = router; 