const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema(
  {
    
    restoId:{
    type:String,
    required:true
  },
    imageLink:{
        type:String,
        required:true
    }
    
    
  }
);



const waytrixMenu = mongoose.model('waytrixMenu', MenuSchema);

module.exports = waytrixMenu;
