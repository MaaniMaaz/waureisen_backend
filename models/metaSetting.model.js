const mongoose = require('mongoose');

const metaSettingSchema = new mongoose.Schema({
    metaData:[
        {

            name: { 
              type: String, 
              required: true 
            },
            metaName: { 
              type: String, 
              required: true 
            },
            metaDescription: { 
              type: String, 
              required: true 
            },
        }
    ]
 
}, { _id: true });

const MetaSetting = mongoose.model('MetaSetting', metaSettingSchema);
module.exports = MetaSetting;