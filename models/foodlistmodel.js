// const mongoose=require('mongoose');

// const foodlistSchema=mongoose.Schema({
//     sellerid:{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:"foodmodel"
//     },
//     foodname:{
//         type:String,

//         // unique:true,
//     },
//     food_price:{

//         type:Number,

//     },
//     food_desc:{
//         type:String,

//     },
//     food_category:{
//         type:String,
//     },
//     food_rating:{
//         type:Number,
//         default:0
//     },
//     ratingtotal:{
//         type:Number,
//         default:0
//     },
//     ratingcount:{
//         type:Number,
//         default:0
//     },
//     imgpath:{
//         type:String,
//         default:"uploads/1668831088524-Logo.png"
//     }

// });
// const foodlist=mongoose.model("foodlist",foodlistSchema);
// module.exports=foodlist;

const Sequelize = require("sequelize");
const { sequelize } = require("../dbconnect/dbconnection");

const foodlist = sequelize.define("food", {
  _id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  sellerid: {
    type: Sequelize.BIGINT,
    // required:false,
    defaultValue: null,
  },
  foodname: {
    type: Sequelize.STRING,
    // required:false,
    // defaultValue: "Pending"
  },
  food_price: {
    type: Sequelize.BIGINT,
    // required: true,
    // unique: true,
    // allowNull: false
  },
  food_desc: {
    type: Sequelize.STRING,
    // required:false,
    // defaultValue: "Pending"
  },
  food_category: {
    type: Sequelize.STRING,
  },
  imgpath: {
    type: Sequelize.STRING,
    default: "uploads/1668831088524-Logo.png",
  },
});

module.exports = foodlist;
