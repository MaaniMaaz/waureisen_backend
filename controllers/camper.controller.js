const camperService = require('../services/camper.service');

/**
 * Get all campers
 */
exports.getAllCampers = async (req, res, next) => {
  try {
    // Extract query parameters
    const { category, status } = req.query;
    const filters = {};
    
    // Add filters if provided
    if (category) filters.category = category;
    if (status) filters.status = status;
    
    const campers = await camperService.getAllCampers(filters);
    res.json(campers);
  } catch (err) {
    console.error('Error fetching campers:', err);
    next(err);
  }
};

/**
 * Get camper by ID
 */
exports.getCamperById = async (req, res, next) => {
  try {
    const camper = await camperService.getCamperById(req.params.id);
    
    if (!camper) {
      return res.status(404).json({ message: 'Camper not found' });
    }
    
    res.json(camper);
  } catch (err) {
    console.error(`Error fetching camper ${req.params.id}:`, err);
    next(err);
  }
};
/**
 * Get camper by Title
 */
exports.getCamperBytitle = async (req, res, next) => {
  try {
    const camper = await camperService.getCamperByTitle(req.params.title);
    
    if (camper?.length < 1) {
      return res.status(404).json({ message: 'Camper not found' });
    }
    
    res.status(200).json(camper[0]);
  } catch (err) {
    console.error(`Error fetching camper :`, err);
    next(err);
  }
};

/**
 * Create new camper
 */
exports.createCamper = async (req, res, next) => {
  try {
    // Validation
    const { title, description, metaTitle, metaDescription, featuredImage, content } = req.body;
    
    if (!title || !description  || !featuredImage ) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, description, category, and featuredImage are required' 
      });
    }
    const isCamperExist = await camperService?.getCamperByTitle(title)
    
    if(isCamperExist?.length > 0 ){
      return res.status(400).json({ 
        message: 'Camper already exist with this title, change the title to post.' 
      });

    }
    
    if (!Array.isArray(content) || content.length === 0) {
      return res.status(400).json({ 
        message: 'Content is required and must be an array of content elements' 
      });
    }
    
    // Add admin as author
    const camperData = {
      ...req.body,
      author: req.user.id, // From auth middleware
      publishDate: new Date()
    };
    
    const newCamper = await camperService.createCamper(camperData);
    res.status(201).json(newCamper);
  } catch (err) {
    console.error('Error creating camper:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(err.errors).map(e => e.message) 
      });
    }
    
    next(err);
  }
};

/**
 * Update camper post
 */
exports.updateCamper = async (req, res, next) => {
  try {
    // Check if camper exists
    console.log(req.params.id);
    
    const camper = await camperService.getCamperByTitle(req.params.id);
    console.log(camper, camper);
    
    if (!camper[0]) {
      return res.status(404).json({ message: 'Camper not found' });
    }
    
    // Update camper
    const updatedCamper = await camperService.updateCamper(
      camper[0]._id, 
      { ...req.body, updatedAt: Date.now() }
    );

    console.log(camper , updatedCamper)
    
    res.json(updatedCamper);
  } catch (err) {
    console.error(`Error updating camper ${req.params.id}:`, err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(err.errors).map(e => e.message) 
      });
    }
    
    next(err);
  }
};

/**
 * Delete camper post
 */
exports.deleteCamper = async (req, res, next) => {
  try {
    // Check if camper exists
    const camper = await camperService.getCamperById(req.params.id);
    
    if (!camper) {
      return res.status(404).json({ message: 'Camper not found' });
    }
    
    await camperService.deleteCamper(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(`Error deleting camper ${req.params.id}:`, err);
    next(err);
  }
};

/**
 * Get available campers
 */
exports.getAvailableCampers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const campers = await camperService.getAvailableCampers(limit);
    res.json(campers);
  } catch (err) {
    console.error('Error fetching available campers:', err);
    next(err);
  }
};

/**
 * Get campers by category
 */
exports.getCampersByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const campers = await camperService.getCampersByCategory(category);
    res.json(campers);
  } catch (err) {
    console.error(`Error fetching campers in category ${req.params.category}:`, err);
    next(err);
  }
};