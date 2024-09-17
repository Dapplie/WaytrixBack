const mongoose = require('mongoose');

const PartnersSchema = new mongoose.Schema(
  {
    logo: {
      type: String,
      required: true
    },
    role: {
      type:String,
      required:true
    },
    name: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    phone: {
        type: Number,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      restoIdArray:{
        type:[String],
        required:true
      }
    
  }
);



const waytrixPartners = mongoose.model('waytrixPartners', PartnersSchema);

module.exports = waytrixPartners;
