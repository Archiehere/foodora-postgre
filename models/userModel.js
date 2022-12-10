// const mongoose = require("mongoose");
// // const foodModel=require("foodModel");
// const userSchema = mongoose.Schema({
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   profileimgpath:{
//     type:String,
//     default:"uploads/1668831088524-Logo.png"
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   username:{
//     type:String,
//     required:true,
//   },
//   // orderhistory:{
//   //   type:Array,
//   //   default:[]
//   // },
//   otp:{
//     type:String,
//     required:false,
//   },
//   verify:{
//     type:Boolean,
//     required:false,
//   },
//   nearme:{
//     type:Array,
//     default:[]
//   },
//   address:{
//     type:String,
//   },
//   sellerid:{
//     type:String,
//     default:""
//   },
//   cart:[{
//     foodid:{
//       type:mongoose.Schema.Types.ObjectId,
//     },
//     foodname:{
//         type:String,
//         // unique:true,
//     },
//     food_price:{

//         type:Number,

//     },
//     quantity:{
//       type:Number,
//       default:null
//     },
//     rating:{
//       type:Number,
//       default:0
//     }

// }],

//   // contact:{
//   //   type:String,
//   //   required:true
//   // },
//   // address:{
//   //   type:String
//   // }
// });

// const UserModel = mongoose.model("USER",userSchema);

// module.exports=UserModel;

const Sequelize = require("sequelize");
const { sequelize } = require("../dbconnect/dbconnection");

const UserModel = sequelize.define("User", {
  _id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  email: {
    type: Sequelize.STRING,
    // required: true,
  },
  profileimgpath: {
    type: Sequelize.STRING,
    defaultValue: "uploads/1668831088524-Logo.png",
  },
  password: {
    type: Sequelize.STRING,
    // required: true,
  },
  username: {
    type: Sequelize.STRING,
    // required: true,
  },

  otp: {
    type: Sequelize.STRING,
    // required: false,
  },
  verify: {
    type: Sequelize.BOOLEAN,
  },
  // nearme: {
  //   type: Sequelize.ARRAY,
  //   defaultValue: [],
  // },
  address: {
    type: Sequelize.STRING,
  },
  sellerid: {
    type: Sequelize.BIGINT,
    // defaultValue: "",
  },
});

module.exports = UserModel;
