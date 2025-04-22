const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount:{
        type:Number,
        require:true,
     },
    
     status: {
        type:String,
        enum: ["success", "failed"],
       
     },

  
},{
    timestamps:true
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
