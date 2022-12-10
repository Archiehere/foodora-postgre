// const mongoose = require("mongoose");
// require('dotenv').config();
// const dbconnection = async() => {
//   try {
//     await mongoose.connect(process.env.dbconfig, () => {
//       console.log("db connection successful");
//     });
//   } catch (err) {
//     console.log(err);
//   }
// };
// module.exports = dbconnection;

const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DATABASE,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        dialect: 'postgres',
        host: 'localhost'
    }
);


module.exports = {
    sequelize
};
