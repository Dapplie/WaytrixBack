const mongoose = require('mongoose');

const ButtonsSchema = new mongoose.Schema(
  {
    restoId:{
    type:String,
    required:true
  },
  Napkins:{
        type:Boolean,
        required:true
    },
    Sugar:{
        type:Boolean,
        required:true
    },
    Salt: {
      type: Boolean,
      required: true
    },
    Oil: {
      type: Boolean,
      required: true
    },
    GlassOfIce: {
        type: Boolean,
        required: true
      },
      EmptyGlass: {
        type: Boolean,
        required: true
      },
      SousPlat: {
        type: Boolean,
        required: true
      },
      Bill: {
        type: Boolean,
        required: true
      },
      ShishaCharcoal: {
          type: Boolean,
          required: true
        },
        Toothpick: {
          type: Boolean,
          required: true
        },
        Ketchup: {
            type: Boolean,
            required: true
          }
    
  }
);



const waytrixButtons = mongoose.model('waytrixButtons', ButtonsSchema);

module.exports = waytrixButtons;
