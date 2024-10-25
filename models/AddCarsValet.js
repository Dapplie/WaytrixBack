const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const CarSchema = new mongoose.Schema(
  {
    carName:{
      type:String,
      required:true
    },
    color:{
      type:String,
      required:true
    },
    date: {
      type: Date,
      default: Date.now // Automatically fills with the current date
    },
  restoId:{
    type:String,
    required:true
  },
   ticketNum:{
    type:String,
    required:true
   },
    requested:{
        type:Boolean,
        required:true
    },
    customerId:{
      type:String,
      required:true
    },
    minutes:{
      type:Number
        },
        timer:{
          type:Boolean,
          required:true
        },
        
          timeNum:{
            type:Number,
            
          }
  }
);



const WaytrixCars = mongoose.model('waytrixCars', CarSchema);

module.exports = WaytrixCars;
