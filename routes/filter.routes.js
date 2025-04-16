const express = require('express');
const router = express.Router();
const filterController = require('../controllers/filter.controller');
const { verifyToken } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/role');

// Base filter endpoints
router.get('/', filterController.getAllFilters);
router.get('/active', filterController.getActiveFilters); // Special endpoint to get the active filter configuration
router.get('/:id', filterController.getFilterById);

// Protected admin-only routes
router.post('/', verifyToken, isAdmin, filterController.createFilter);
router.put('/:id', verifyToken, isAdmin, filterController.updateFilter);
router.delete('/:id', verifyToken, isAdmin, filterController.deleteFilter);

// Subsection management
router.post('/:filterId/subsections', verifyToken, isAdmin, filterController.addSubsection);
router.put('/:filterId/subsections/:subsectionId', verifyToken, isAdmin, filterController.updateSubsection);
router.delete('/:filterId/subsections/:subsectionId', verifyToken, isAdmin, filterController.deleteSubsection);

// Filter within subsection management
router.post('/:filterId/subsections/:subsectionId/filters', verifyToken, isAdmin, filterController.addSubsectionFilter);
router.put('/:filterId/subsections/:subsectionId/filters/:subFilterId', verifyToken, isAdmin, filterController.updateSubsectionFilter);
router.delete('/:filterId/subsections/:subsectionId/filters/:subFilterId', verifyToken, isAdmin, filterController.deleteSubsectionFilter);

module.exports = router;