const travelMagazineService = require('../services/travelMagazine.service');

/**
 * Get all travel magazine posts
 */
exports.getAllTravelMagazines = async (req, res, next) => {
  try {
    // Extract query parameters
    const { category, status } = req.query;
    const filters = {};
    
    // Add filters if provided
    if (category) filters.category = category;
    if (status) filters.status = status;
    
    const travelMagazines = await travelMagazineService.getAllTravelMagazines(filters);
    res.json(travelMagazines);
  } catch (err) {
    console.error('Error fetching travel magazines:', err);
    next(err);
  }
};

/**
 * Get travel magazine post by ID
 */
exports.getTravelMagazineById = async (req, res, next) => {
  try {
    const travelMagazine = await travelMagazineService.getTravelMagazineById(req.params.id);
    
    if (!travelMagazine) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    res.json(travelMagazine);
  } catch (err) {
    console.error(`Error fetching travel magazine ${req.params.id}:`, err);
    next(err);
  }
};

/**
 * Create new travel magazine post
 */
exports.createTravelMagazine = async (req, res, next) => {
  try {
    // Validation
    const { title, description, category, featuredImage, content } = req.body;
    
    if (!title || !description || !category || !featuredImage) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, description, category, and featuredImage are required' 
      });
    }
    
    if (!Array.isArray(content) || content.length === 0) {
      return res.status(400).json({ 
        message: 'Content is required and must be an array of content elements' 
      });
    }
    
    // Add admin as author
    const blogData = {
      ...req.body,
      author: req.user.id, // From auth middleware
      publishDate: new Date()
    };
    
    const newTravelMagazine = await travelMagazineService.createTravelMagazine(blogData);
    res.status(201).json(newTravelMagazine);
  } catch (err) {
    console.error('Error creating travel magazine:', err);
    
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
 * Update travel magazine post
 */
exports.updateTravelMagazine = async (req, res, next) => {
  try {
    // Check if post exists
    const travelMagazine = await travelMagazineService.getTravelMagazineById(req.params.id);
    
    if (!travelMagazine) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    // Update blog post
    const updatedTravelMagazine = await travelMagazineService.updateTravelMagazine(
      req.params.id, 
      { ...req.body, updatedAt: Date.now() }
    );
    
    res.json(updatedTravelMagazine);
  } catch (err) {
    console.error(`Error updating travel magazine ${req.params.id}:`, err);
    
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
 * Delete travel magazine post
 */
exports.deleteTravelMagazine = async (req, res, next) => {
  try {
    // Check if post exists
    const travelMagazine = await travelMagazineService.getTravelMagazineById(req.params.id);
    
    if (!travelMagazine) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    await travelMagazineService.deleteTravelMagazine(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(`Error deleting travel magazine ${req.params.id}:`, err);
    next(err);
  }
};

/**
 * Get published travel magazine posts
 */
exports.getPublishedTravelMagazines = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const travelMagazines = await travelMagazineService.getPublishedTravelMagazines(limit);
    res.json(travelMagazines);
  } catch (err) {
    console.error('Error fetching published travel magazines:', err);
    next(err);
  }
};

/**
 * Get travel magazine posts by category
 */
exports.getTravelMagazinesByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const travelMagazines = await travelMagazineService.getTravelMagazinesByCategory(category);
    res.json(travelMagazines);
  } catch (err) {
    console.error(`Error fetching travel magazines in category ${req.params.category}:`, err);
    next(err);
  }
};