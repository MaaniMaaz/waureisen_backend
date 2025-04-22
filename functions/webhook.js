
const dotenv = require("dotenv");
const Payment = require("../models/payment.model");
dotenv.config();


async function handlePayment(status, payload) {
    try {
      const { amount, userId,  } = payload;
      console.log("success hua hai",status, payload);
  
      if (status === "success") {
        await Payment.create({
            userId: userId,

            status: "success",
            amount: amount
           
          });
      }
    } catch (error) {
      console.log("error", error);
      return error;
    }
  }
  module.exports = { handlePayment };