const express = require('express');
const jobController = require('../controllers/job.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, authorize('user'), jobController.createJob);

router.get('/user/my-jobs', authenticate, authorize('user'), jobController.getUserJobs);
router.get('/user/in-progress', authenticate, authorize('user'), jobController.getCustomerInProgressJobs);
router.post('/accept-proposal', authenticate, authorize('user'), jobController.acceptProposal);
router.post('/complete', authenticate, authorize('user'), jobController.completeJob);

router.get('/master/in-progress', authenticate, authorize('master'), jobController.getMasterInProgressJobs);
router.get('/master/completed', authenticate, authorize('master'), jobController.getMasterCompletedJobsWithReviews);

router.get('/in-progress/count', authenticate, jobController.getInProgressJobsCount);

router.get('/pending', jobController.getAllPendingJobs);
router.get('/filter', jobController.getFilteredJobs);
router.get('/:id', jobController.getJobById);

module.exports = router; 