const AIResponse = require('../models/aiResponse.model');

exports.getAllResponses = async () => {
  return await AIResponse.find();
};

exports.createResponse = async (data) => {
  const newResponse = new AIResponse(data);
  return await newResponse.save();
};

exports.updateResponse = async (id, data) => {
  return await AIResponse.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteResponse = async (id) => {
  await AIResponse.findByIdAndDelete(id);
};

// Sample data initialization
exports.initializeDefaultResponses = async () => {
  const defaultResponses = [
    {
      question: "How do I make a booking?",
      answer: "To make a booking, select your desired listing, choose your dates, and click the 'Book Now' button. Follow the payment process to confirm your booking.",
      category: "booking",
      keywords: ["book", "booking", "reserve", "reservation"],
      needsHumanSupport: false
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept credit cards, debit cards, and PayPal for all bookings.",
      category: "payment",
      keywords: ["payment", "pay", "card", "credit", "debit", "paypal"],
      needsHumanSupport: false
    },
    {
      question: "I need help with my booking",
      answer: "I'll connect you with our support team who can assist you better with your booking.",
      category: "booking",
      keywords: ["help", "support", "assistance", "problem"],
      needsHumanSupport: true
    }
    // Add more default responses as needed
  ];

  for (const response of defaultResponses) {
    try {
      await AIResponse.findOneAndUpdate(
        { question: response.question },
        response,
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Error initializing response:', error);
    }
  }
};