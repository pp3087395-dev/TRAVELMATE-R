const express = require('express');
const router = express.Router();
const journeyChainController = require('../controllers/journeyChainController');

// GET /api/journeys/chain/verify - Run audit verification
router.post('/verify', journeyChainController.verifyChain);

// GET /api/journeys/chain - Default traveler chain
router.get('/', journeyChainController.getChain);

// GET /api/journeys/chain/:identifier - Fetch chain for traveler ID or journey code
router.get('/:identifier', journeyChainController.getChain);

// POST /api/journeys/chain/add - Append new transit hop node
router.post('/add', journeyChainController.addNode);

module.exports = router;
