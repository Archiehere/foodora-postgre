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

const Sequelize = require('sequelize');
const {sequelize} = require("../dbconnect/dbconnection");

const orderModel = sequelize.define('order',{
  _id:{
    type: Sequelize.BIGINT,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  // order: {
  //   type: Sequelize.ARRAY(Sequelize.BIGINT),
  //   // required: true,
  //   // unique: true,
  //   // allowNull: false
  // },
  userid:{
    type: Sequelize.BIGINT,
    // required:false,
    defaultValue: null
  },
  sellerid:{
    type: Sequelize.BIGINT,
    // required:false,
    defaultValue: null
  },
  status:{
    type: Sequelize.STRING,
    // required:false,
    defaultValue: "Pending"
  },
});


module.exports=orderModel;


