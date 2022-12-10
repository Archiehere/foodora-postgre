
const Sequelize = require('sequelize');
const {sequelize} = require("../dbconnect/dbconnection");

const otpModel = sequelize.define('sellerotp',{
  _id:{
    type: Sequelize.BIGINT,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  email: {
    type: Sequelize.STRING,
    // required: true,
    // unique: true,
    allowNull: false
  },
  otp:{
    type: Sequelize.BIGINT,
    // required:false,
    defaultValue: null
  },
  verify:{
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
});


module.exports=otpModel;

