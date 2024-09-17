const mongoose = require('mongoose');

const ContactUsSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true
    },
    restoId:{
        type:String,
        required:true
    },
    Phone: {
      type: Number,
      required: true
    },
    Text: {
        type: String,
        required: true
      },
    
    
  }
);



const ContactUS = mongoose.model('waytrixContactUS', ContactUsSchema);

module.exports = ContactUS;
