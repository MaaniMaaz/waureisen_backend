const Message = require('../models/message.model');
const AIResponse = require('../models/aiResponse.model');
// const openai = require('../configs/openai'); // Commented out OpenAI integration

const findBestMatch = async (userMessage) => {
  const keywords = userMessage.toLowerCase().split(' ');
  
  // Search for matching responses based on keywords
  const possibleResponses = await AIResponse.find({
    keywords: { 
      $in: keywords.map(keyword => new RegExp(keyword, 'i')) 
    }
  });

  if (possibleResponses.length === 0) {
    return {
      answer: "I'm sorry, I couldn't understand your question. Let me connect you with a human support agent.",
      needsHumanSupport: true
    };
  }

  // Return the first matching response
  // In a production environment, you would implement more sophisticated matching
  return {
    answer: possibleResponses[0].answer,
    needsHumanSupport: possibleResponses[0].needsHumanSupport
  };
};

exports.processMessage = async (userId, message) => {
  try {
    // Get conversation history
    const previousMessages = await Message.find({
      $or: [
        { sender: userId, messageType: 'chatbot' },
        { receiver: userId, messageType: 'chatbot' }
      ]
    }).sort({ createdAt: -1 }).limit(5);

    // Prepare conversation context
    const conversationContext = previousMessages.map(msg => ({
      role: msg.sender.equals(userId) ? 'user' : 'assistant',
      content: msg.content
    }));

    /* Commented out OpenAI integration
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: conversationContext
    });
    const aiResponse = completion.data.choices[0].message.content;
    */

    // Use local AI response matching instead
    const { answer: aiResponse, needsHumanSupport } = await findBestMatch(message);

    // Save bot's response
    const responseMessage = new Message({
      sender: process.env.CHATBOT_ID,
      senderType: 'Admin',
      receiver: userId,
      receiverType: 'User',
      messageType: 'chatbot',
      content: aiResponse,
      chatbotContext: {
        previousMessages: conversationContext,
        resolved: !needsHumanSupport
      }
    });

    await responseMessage.save();

    // If human support needed, create support ticket
    if (needsHumanSupport) {
      const supportTicket = new Message({
        sender: userId,
        senderType: 'User',
        receiver: process.env.ADMIN_SUPPORT_ID,
        receiverType: 'Admin',
        messageType: 'support',
        content: message,
        supportTicket: {
          priority: 'medium',
          status: 'open',
          category: 'other'
        }
      });

      await supportTicket.save();
    }

    return {
      response: aiResponse,
      needsHumanSupport
    };
  } catch (error) {
    console.error('Chatbot processing error:', error);
    throw error;
  }
};