const mongoose = require('mongoose');

const CustomButtonsSchema = new mongoose.Schema(
  {
    restoId:{
    type:String,
    required:true
  },
  order:{
        type:String,
        required:true
    },
    svgLink:{
        type:String,
        required:true
    }
    
  }
);



const waytrixCustomButtons = mongoose.model('waytrixCustomButtons', CustomButtonsSchema);

module.exports = waytrixCustomButtons;
