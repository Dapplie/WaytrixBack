const mongoose = require('mongoose');

const OrdersSchema = new mongoose.Schema(
  {
    tableId: {
      type: String,
      required: true
    },
    restoId:{
      type:String,
      required:true
    },
    waiterId: {
      type: String,
      required: true
    },
    deleteId:{
        type: String,
        required: true
    },
    order: {
        type: String,
        required: true
      },
      tableName: {
        type: String,
        required: true
      },
    
  }
);



const waytrixOrders = mongoose.model('waytrixOrders', OrdersSchema);

module.exports = waytrixOrders;
