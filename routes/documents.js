const { Router } = require('express');
const documentsController = require('../controllers/documentsController');
const router = Router();

router.get('/', documentsController.documents);
router.get('/sessions', documentsController.sessions);
router.get('/reports', documentsController.reports);
router.get('/base', documentsController.base);
router.get('/download/:category', documentsController.download);
router.post('/:category', documentsController.search);

module.exports = router;
