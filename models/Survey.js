const mongoose = require('mongoose');

const SurveysSchema = new mongoose.Schema(
  {restoId:{
    type:String,
    required:true
  },
    name:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    foodQuality: {
      type: String,
      required: true
    },
    serviceQuality: {
      type: String,
      required: true
    },
    staffFriendliness: {
        type: String,
        required: true
      },
      valueForMoney: {
        type: String,
        required: true
      },
      restaurantCleanliness: {
        type: String,
        required: true
      },
      restaurantDesign: {
        type: String,
        required: true
      },
      wayTrixService: {
          type: String,
          required: true
        },
        additionalComments: {
          type: String,
          required: true
        },
        date: {
          type: Date,
          default: Date.now // Automatically fills with the current date
        },
    
  }
);



const waytrixSurvey = mongoose.model('waytrixSurvey', SurveysSchema);

module.exports = waytrixSurvey;
