const mongoose = require('mongoose');
const VideoSchema = new mongoose.Schema(
  {
    videoURL: {
      type: String,
      required: true
    },
    restoId: {
      type: String,
      required: true
    },
    forLoopId:{
type: mongoose.Schema.Types.ObjectId,
required:true
    },
    tableId: {
        type: String,
        required: true
      },
   
      lastPlayedOrder: {
        type: Number,
        default: -1
      },
      order:{
        type:Number,
        required:true
      },
      partnerId:{
        type:String,
        required:false
      },
      uploadDate:{
        type:String,
        required:true
      },
      duration:{
        type:Number,
        required:true
      },
      rushHour:{
        type:Boolean,
        required:true
      }
    
  }
);



const waytrixVideo = mongoose.model('waytrixVideo', VideoSchema);

module.exports = waytrixVideo;
