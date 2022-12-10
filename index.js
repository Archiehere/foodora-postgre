
const express = require("express");
const {sequelize} = require("./dbconnect/dbconnection");

require('dotenv').config();
const app = express();
const CookieParser=require("cookie-parser");
const cors = require('cors');
const fs = require('fs');
if(!fs.existsSync('./uploads')){
  fs.mkdirSync('./uploads');
}
app.use(cors());


// dbconnection();

app.use(express.json());
app.use(CookieParser());
app.use(express.static(__dirname + '/public'));

app.use('/uploads', express.static('uploads'));

app.use('/user',require('./router/userRouter'));
app.use('/seller',require('./router/foodRouter'));
app.get('/',(req,res)=>{
  return res.send("Welcome to home screen");
});


const connectdb = async ()=>{
  try {
      const result = await sequelize.sync();
      console.log('DB Connection has been established successfully.');
      app.listen(process.env.PORT);
      console.log(`Listening on port ${process.env.PORT}`);
    } catch (err) {
      console.error('Unable to connect to the database:', err);
    }
}

connectdb();
// const PORT = process.env.PORT;
// app.listen(PORT, () => {

//   console.log(`Listening to the PORT ${PORT}`);
// });

