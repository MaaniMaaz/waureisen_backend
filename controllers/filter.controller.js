const Filter = require('../models/filter.model');
const filterService = require('../services/filter.service');

/**
 * Get all filter documents
 */
exports.getAllFilters = async (req, res, next) => {
  try {
    const filters = await filterService.getAllFilters();
    res.json(filters);
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single filter document by ID
 */
exports.getFilterById = async (req, res, next) => {
  try {
    const filter = await filterService.getFilterById(req.params.id);
    if (!filter) {
      return res.status(404).json({ message: 'Filter not found' });
    }
    res.json(filter);
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new filter document
 */
exports.createFilter = async (req, res, next) => {
  try {
    const newFilter = await filterService.createFilter(req.body);
    res.status(201).json(newFilter);
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing filter document
 */
exports.updateFilter = async (req, res, next) => {
  try {
    const updatedFilter = await filterService.updateFilter(req.params.id, req.body);
    if (!updatedFilter) {
      return res.status(404).json({ message: 'Filter not found' });
    }
    res.json(updatedFilter);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a filter document
 */
exports.deleteFilter = async (req, res, next) => {
  try {
    await filterService.deleteFilter(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * Get active filter configuration with subsections
 */
exports.getActiveFilters = async (req, res, next) => {
  try {
    const activeFilters = await filterService.getActiveFilters();
    res.json(activeFilters);
  } catch (err) {
    next(err);
  }
};

/**
 * Add a new subsection to a filter
 */
exports.addSubsection = async (req, res, next) => {
  try {
    const { filterId } = req.params;
    const subsectionData = req.body;
    
    const updatedFilter = await filterService.addOrUpdateSubsection(filterId, subsectionData);
    res.status(201).json(updatedFilter);
  } catch (err) {
    if (err.message === 'Cannot modify predefined subsection') {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
};

/**
 * Update an existing subsection
 */
exports.updateSubsection = async (req, res, next) => {
  try {
    const { filterId, subsectionId } = req.params;
    const subsectionData = req.body;
    
    const updatedFilter = await filterService.addOrUpdateSubsection(filterId, subsectionData, subsectionId);
    res.json(updatedFilter);
  } catch (err) {
    if (err.message === 'Cannot modify predefined subsection') {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
};

/**
 * Delete a subsection
 */
exports.deleteSubsection = async (req, res, next) => {
  try {
    const { filterId, subsectionId } = req.params;
    
    const updatedFilter = await filterService.deleteSubsection(filterId, subsectionId);
    res.json(updatedFilter);
  } catch (err) {
    if (err.message === 'Cannot delete predefined subsection') {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
};

/**
 * Add a new filter to a subsection
 */
exports.addSubsectionFilter = async (req, res, next) => {
  try {
    const { filterId, subsectionId } = req.params;
    const filterData = req.body;
    
    const updatedFilter = await filterService.addOrUpdateSubsectionFilter(filterId, subsectionId, filterData);
    res.status(201).json(updatedFilter);
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing filter in a subsection
 */
exports.updateSubsectionFilter = async (req, res, next) => {
  try {
    const { filterId, subsectionId, subFilterId } = req.params;
    const filterData = req.body;
    
    const updatedFilter = await filterService.addOrUpdateSubsectionFilter(
      filterId, 
      subsectionId, 
      filterData, 
      subFilterId
    );
    res.json(updatedFilter);
  } catch (err) {
    if (err.message === 'Cannot modify predefined filter') {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
};

/**
 * Delete a filter from a subsection
 */
exports.deleteSubsectionFilter = async (req, res, next) => {
  try {
    const { filterId, subsectionId, subFilterId } = req.params;
    
    const updatedFilter = await filterService.deleteSubsectionFilter(
      filterId, 
      subsectionId, 
      subFilterId
    );
    res.json(updatedFilter);
  } catch (err) {
    if (err.message === 'Cannot delete predefined filter') {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
};

/**
 * Add a new subsubsection to a subsection
 */
exports.addSubsubsection = async (req, res, next) => {
  try {
    const { filterId, subsectionId } = req.params;
    const subsubsectionData = req.body;
    
    const updatedFilter = await filterService.addOrUpdateSubsubsection(filterId, subsectionId, subsubsectionData);
    res.status(201).json(updatedFilter);
  } catch (err) {
    if (err.message === 'Cannot modify predefined subsection') {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
};

/**
 * Update an existing subsubsection
 */
exports.updateSubsubsection = async (req, res, next) => {
  try {
    const { filterId, subsectionId, subsubsectionId } = req.params;
    const subsubsectionData = req.body;
    
    const updatedFilter = await filterService.addOrUpdateSubsubsection(
      filterId, 
      subsectionId, 
      subsubsectionData, 
      subsubsectionId
    );
    res.json(updatedFilter);
  } catch (err) {
    if (err.message === 'Cannot modify predefined subsubsection') {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
};

/**
 * Delete a subsubsection
 */
exports.deleteSubsubsection = async (req, res, next) => {
  try {
    const { filterId, subsectionId, subsubsectionId } = req.params;
    
    const updatedFilter = await filterService.deleteSubsubsection(filterId, subsectionId, subsubsectionId);
    res.json(updatedFilter);
  } catch (err) {
    if (err.message === 'Cannot delete predefined subsubsection') {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
};

/**
 * Add a new filter to a subsubsection
 */
exports.addSubsubsectionFilter = async (req, res, next) => {
  try {
    const { filterId, subsectionId, subsubsectionId } = req.params;
    const filterData = req.body;
    
    const updatedFilter = await filterService.addOrUpdateSubsubsectionFilter(
      filterId, 
      subsectionId, 
      subsubsectionId, 
      filterData
    );
    res.status(201).json(updatedFilter);
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing filter in a subsubsection
 */
exports.updateSubsubsectionFilter = async (req, res, next) => {
  try {
    const { filterId, subsectionId, subsubsectionId, subFilterId } = req.params;
    const filterData = req.body;
    
    const updatedFilter = await filterService.addOrUpdateSubsubsectionFilter(
      filterId, 
      subsectionId, 
      subsubsectionId, 
      filterData, 
      subFilterId
    );
    res.json(updatedFilter);
  } catch (err) {
    if (err.message === 'Cannot modify predefined filter') {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
};

/**
 * Delete a filter from a subsubsection
 */
exports.deleteSubsubsectionFilter = async (req, res, next) => {
  try {
    const { filterId, subsectionId, subsubsectionId, subFilterId } = req.params;
    
    const updatedFilter = await filterService.deleteSubsubsectionFilter(
      filterId, 
      subsectionId, 
      subsubsectionId, 
      subFilterId
    );
    res.json(updatedFilter);
  } catch (err) {
    if (err.message === 'Cannot delete predefined filter') {
      return res.status(403).json({ message: err.message });
    }
    next(err);
  }
};

/**
 * Get template filter document
 */
exports.getTemplateFilter = async (req, res, next) => {
  try {
    const templateFilter = await Filter.findOne({ isTemplate: true });
    if (!templateFilter) {
      return res.status(404).json({ message: 'Template filter not found' });
    }
    res.json(templateFilter);
  } catch (err) {
    next(err);
  }
};

/**
 * Update the template filter
 */
exports.updateTemplateFilter = async (req, res, next) => {
  try {
    const updatedFilter = await filterService.updateTemplateFilter(req.body);
    res.json(updatedFilter);
  } catch (err) {
    next(err);
  }
};

module.exports = exports;