const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema(
  {restoId:{
    type:String,
    required:true
  },
    points: {
      type: Number,
      required: true
    },
    customerId:{
        type:String,
        required:true
    },
    lastTimeSpinned:{
        type:Date,
        required:true
    }
    
    
  }
);



const WaytrixGame = mongoose.model('waytrixPointsGame', GameSchema);

module.exports = WaytrixGame;
