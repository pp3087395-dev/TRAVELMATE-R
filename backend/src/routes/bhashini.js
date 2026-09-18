const express = require('express');
const router = express.Router();
const bhashiniController = require('../controllers/bhashiniController');

// GET /api/bhashini/languages - List supported Indian vernacular languages
router.get('/languages', bhashiniController.getLanguages);

// POST /api/bhashini/translate - Vernacular translation pipeline
router.post('/translate', bhashiniController.translate);

module.exports = router;
