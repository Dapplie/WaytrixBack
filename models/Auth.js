const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 20
    },
    email: {
      type: String,
      required: true
    },
    phone: {
        type: Number,
        required: true
      },
      gender: {
        type: String,
        required: false
      },
    password: {
      type: String,
      required: true
    },
    gender: {
      type: String,
      required: false
    },
    age: {
      type: Number,
      required: false
    },
   totalTimesSigned: {
    type: Number,
    required: false
   },
    role: {
        type: String,
        required: true
      },
    verified:{
        type:Boolean,
        required:true
    },
    verificationKey:{
        type:Number,
        required:true
    },
    forgotKey:{
        type:Number
          },
          restoId:{
            type:String
          },
          // tableId
          tableId:{
            type:[String]
          },
          SmsVerification:{
            type:Number          },
          smsVerified:{
            type:Boolean          }, // redeem
          redeemName: {
            type: String,
          },
          redeemPhone: {
            type: Number,
          },
          redeemEmail: {
            type: String,
          },
          redeemKey:{
            type:Number
          },
          longitude:{
            type:Number          },
          latitude:{
            type:Number          },
          ip:{
            type:String          },
            ContactUsClick:{
              type:Number,
              required:false
            },
            spinCounts:{
              type:Number,
              required:false
            },
            voucherNum:{
              type:Number,
              required:false
            },
            deleted:{
              type:Boolean,
              required:false
            }
  }
);



const WaytrixUser = mongoose.model('waytrixusers', UserSchema);

module.exports = WaytrixUser;
