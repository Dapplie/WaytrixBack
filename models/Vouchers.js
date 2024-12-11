const mongoose = require('mongoose');

const VouchersSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    restoIdArray:{
      type:[String],
      required:true
    },
    description: {
      type: String,
      required: true
    },
    image: {
        type: String,
        required: true
      },
      pointsCost: {
      type: Number,
      required: true
    },
    partnerId: {
      type: String,
      required: false
    },
   
    Quantity: {
        type: Number,
      required: true
      
      },
      email:{
        type:String,
        required:true
      },
      active:{
        type:Boolean,
        required:true
      }
    
  }
);



const waytrixVouchers = mongoose.model('waytrixVouchers', VouchersSchema);

module.exports = waytrixVouchers;
