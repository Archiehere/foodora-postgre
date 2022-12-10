// const mongoose=require("mongoose");
// const foodSchema=mongoose.Schema({
//     username:{
//         type:String,
//         required:true,

//     },
//     password:{
//         type:String,
//         required:true,

//     },
//     email:{
//         type:String,
//         required:true,
//     },
//     restaurantname:{
//         type:String,

//         // unique:true,
//         // default:""
//     },
//     mobilenumber:{
//         type:String,
//         // unique:true,
//         // required:false,
//         // default:""
//     },
//     restaurantaddress:{
//         type:String,
//         // unique:true,
//         // default:""
//     },

//     restaurant_openingtime:{
//         type:String,
//         default:""
//     },
//     restaurant_closingtime:{
//         type:String,
//         default:""
//     },
//     imgpath:{
//         type:Array,
//         default:"uploads/1668831088524-Logo.png"
//     },
//     state:{
//         type:String,
//         default:""
//     },
//     latitude:{
//         type:Number
//     },
//     longitude:{
//         type:Number
//     },
//     verify:{
//         type:Boolean,
//         required:false,
//       },
//     food_list:[{
//        type:mongoose.Schema.Types.ObjectId,
//        ref:"foodlist"

//     }],
// });
// const foodModel=mongoose.model("sellers",foodSchema);

// module.exports=foodModel;
// const mongoose = require("mongoose");

// const orderSchema = mongoose.Schema({
//   order:{
//     type:Array
//   },
//   userid:{
//     type:mongoose.Types.ObjectId
//   },
//   sellerid:{
//     type:mongoose.Types.ObjectId
//   },
//   status:{
//     type:String,
//     default:"Pending"
//   }
// });

// const orderModel = mongoose.model("order",orderSchema);

// module.exports=orderModel;

const Sequelize = require("sequelize");
const { sequelize } = require("../dbconnect/dbconnection");

const foodModel = sequelize.define("restaurant", {
  _id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  username: {
    type: Sequelize.STRING,
    // required: true,
  },
 password: {
    type: Sequelize.STRING,
    // required: true,
  },
  email: {
    type: Sequelize.STRING,
    // required: true,
  },
  restaurantname: {
    type: Sequelize.STRING,
    // required: true,
  },
  mobilenumber: {
    type: Sequelize.STRING,
    // required: true,
  },
  restaurantaddress: {
    type: Sequelize.STRING,
    // required: true,
  },
  restaurant_openingtime: {
    type: Sequelize.STRING,
    // required: true,
  },
  restaurant_closingtime: {
    type: Sequelize.STRING,
    // required: true,
  },
  state: {
    type: Sequelize.STRING,
    // required: true,
  },
  latitude: {
    type: Sequelize.BIGINT,
    // required: true,
  },
  longitude: {
    type: Sequelize.BIGINT,
    // required: true,
  },
 verify:{
    type: Sequelize.BOOLEAN
 }
});

module.exports = foodModel;
