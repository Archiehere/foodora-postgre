const sellerModel=require("../models/foodModel");
const foodlistModel=require("../models/foodlistmodel")
const otpModel = require("../models/otpModel2");
const orderModel = require("../models/ordermodel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const e = require("express");
const otpGenerator = require("otp-generator");
const mongoose = require('mongoose');
const nodeGeocoder = require('node-geocoder');
// const { distanceTo, isInsidePolygon, isInsideCircle } = require('geofencer');
const options = {
    provider: 'openstreetmap'
  };
  const geoCoder = nodeGeocoder(options);
require("dotenv").config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "foodorafoodservice@gmail.com",
    pass: process.env.password,
  },
});

// const upload=multer({
//     storage:Storage
// }).single('testImage')

const foodCtrl={
    register:async(req,res)=>{
        try{
            let {username, password,email} = req.body;
            email = email.toLowerCase();
            
            const users = await sellerModel.findOne({ email });
      if (!users) {
        // if (password !== cpassword) {
        //   throw new Error("Password and confirm password do not match!");
        // }
        // if (contact.length > 13) {
        //   throw new Error("Incorrect Credentials");
        // }
        const passwordHash = await bcrypt.hash(password, 12);
        const user=sellerModel({
            username,
            password:passwordHash,
            email

        });
        await user.save();

        const userotp = otpModel({
          createdAt: new Date(),
          email,
        });

        userotp.otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          specialChars: false,
          lowerCaseAlphabets: false,
        });
        await userotp.save();

        const mailoptions = {
          from: "foodorafoodservice@gmail.com",
          to: email,
          subject: "Foodora Verification OTP",
          html: `
        <div
          class="container"
          style="max-width: 90%; margin: auto; padding-top: 20px"
        >
          <h2>Welcome to the Gates of Foodora.</h2>
          <h4>You are About to be a Seller </h4>
          <p style="margin-bottom: 30px;">Please enter this sign up OTP to get started</p>
          <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${userotp.otp}</h1>
     </div>
      `,
        };
        transporter.sendMail(mailoptions, (err, info) => {
          if (err) {
            console.log(err);
          } else {
            console.log("mail sent");
          }
        });
        res.status(200).json({
          success: true,
          msg: "OTP sent",
        });


      } else {
        res.status(400).json({ success: false, msg: "User already exists!" });
      }
    } catch (error) {
      res.status(400).json({ success: false, msg: error.message });
      console.log(error);
    }
    },
    signin: async (req, res) => {
      try {
        let { email, password } = req.body;
        email = email.toLowerCase();
        const user = await sellerModel.findOne({ email });
        if (!user) throw new Error("No user found!");
        if (!user.verify) throw new Error("User Not Verified");
        const result = await bcrypt.compare(password, user.password);
        if (!result) throw new Error("Invalid credentials!");
  
  
        const accesstoken = createAccessToken({ id: user._id });
        // const refreshtoken = createRefreshToken({ id: user._id });
  
        // res.cookie("refreshtoken", refreshtoken, {
        //   httpOnly: true,
        //   path: "/user/refresh_token",
        //   maxAge: 7 * 24 * 60 * 60 * 1000, //7d
        // });
        
        
        res.status(200).json({
          success: true,
          msg: "Login successful",
          accesstoken,
          id:user._id,
        });
      } catch (error) {
        res.status(400).json({ success: false, msg: error.message });
        console.log(error);
      }
    },
    verify: async (req, res) => {
      try {
        // console.log(req.route.path);
        const { email, otp } = req.body;
        const user = await sellerModel.findOne({ email });
        const userotp = await otpModel.findOne({ email });
        if (!userotp) throw new Error("OTP timed out.");
        if (!user) throw new Error("No user found!");
        if (user.verify) throw new Error("User already verified");
        if (userotp.otp == otp) {
          user.verify = true;
          user.save();
          userotp.otp = null;
          userotp.save();
          const mailoptions = {
            from: "foodorafoodservice@gmail.com",
            to: email,
            subject:
              "Dear Customer, sign up to your foodora account is successfull !",
            html: `
          <div
            class="container"
            style="max-width: 90%; margin: auto; padding-top: 20px; "
          >
            <h2>Welcome to the club. ${user.username}</h2>
            <h4>You are hereby declared a Seller of Foodora.</h4>
            <p style="margin-bottom: 30px;">We are really happy to welcome you to our growing family of food lovers. Thank you for showing your interest in our services.</p>
       </div>
        `,
          };
          transporter.sendMail(mailoptions, (err, info) => {
            if (err) {
              console.log(err);
            } else {
              console.log("mail sent");
            }
          });
          const accesstoken = createAccessToken({ id: user._id });
          res.status(200).json({
            success: true,
            msg: "user verified",
            accesstoken,
            id:user._id
          });
        } else res.status(400).json({ success: false, msg: "OTP incorrect" });
      } catch (error) {
        res.status(400).json({ success: false, msg: error.message });
        console.log(error);
      }
    },
    sendOTP: async (req, res) => {
      try {
        // console.log(req.route.path);
        const { email } = req.body;
  
        const user = await sellerModel.findOne({ email });
        const userotp = await otpModel.findOne({ email });
        if (!userotp) {
          const userotp = otpModel({
            createdAt: new Date(),
            email,
            otp: 1,
          });
          await userotp.save();
          userotp.otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
          });
          await userotp.save();
        }
        if (!user) throw new Error("No seller found!");
        if (user.verify) throw new Error("Seller already verified");
        if(userotp){
        userotp.otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          specialChars: false,
          lowerCaseAlphabets: false,
        });
        await userotp.save();
  
        const mailoptions = {
          from: "foodorafoodservice@gmail.com",
          to: email,
          subject: "Foodora Verification OTP",
          html: `
          <div
            class="container"
            style="max-width: 90%; margin: auto; padding-top: 20px"
          >
            <h2>Welcome to the Gates of Foodora.</h2>
            <h4>You are About to be a Seller </h4>
            <p style="margin-bottom: 30px;">Please enter this sign up OTP to get started</p>
            <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${userotp.otp}</h1>
       </div>
        `,
        };
        transporter.sendMail(mailoptions, (err, info) => {
          if (err) {
            console.log(err);
            throw new Error("Mail not sent");
          } else {
            console.log("mail sent");
          }
        });}
  
        res.status(200).json({
          success: true,
          msg: "mail sent",
        });
      } catch (error) {
        res.status(400).json({ success: false, msg: error.message });
        console.log(error);
      }
    },
    forgotsendOTP: async (req, res) => {
      try {
        const { email } = req.body;
  
        const user = await sellerModel.findOne({ email });
        const userotpold = await otpModel.findOne({ email });
  
        if (userotpold && userotpold.verify) throw Error("User Already Verified");
        //  userotp.deleteOne();
        // otpModel.deleteOne({ email });
        if (!user) throw new Error("User does not exist");
        if (!user.verify) throw new Error("User Not verified.");
  
        // if(userotp.verify) throw new Error("Forgot password verification already completed")
        let userotp,users;
        if (!userotpold) {
          userotp = otpModel({
            createdAt: new Date(),
            email,
            verify: false,
            // otp: null,
          });
          await userotp.save();
          userotp.otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
          });
          await userotp.save();
          users=userotp;
        } else {
          // console.log(userotp);
          userotpold.otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
          });
          await userotpold.save();
          users=userotpold;
        }
        const mailoptions = {
          from: "foodorafoodservice@gmail.com",
          to: email,
          subject: "Foodora Verification OTP",
          html: `
          <div
            class="container"
            style="max-width: 90%; margin: auto; padding-top: 20px"
          >
            <h2>Welcome to the Gates of Foodora.</h2>
            <h4>Forgot Password? </h4>
            <p style="margin-bottom: 30px;">Please enter this OTP to Reset Password</p>
            <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${users.otp}</h1>
       </div>
        `,
        };
        transporter.sendMail(mailoptions, (err, info) => {
          if (err) {
            console.log(err);
            throw new Error("Mail not sent");
          } else {
            console.log("mail sent");
          }
        });
        res.status(200).json({
          success: true,
          msg: "mail sent",
        });
      } catch (error) {
        res.status(400).json({ success: false, msg: error.message });
        console.log(error);
      }
    },
    forgotverify: async (req, res) => {
      try {
        // console.log(req.route.path);
        const { email, otp } = req.body;
        const user = await sellerModel.findOne({ email });
        const userotp = await otpModel.findOne({ email });
        if (!userotp) throw new Error("OTP timed out.");
        if (!user) throw new Error("No user found!");
        if (userotp.verify) throw new Error("User already verified");
        if (userotp.otp == otp) {
          userotp.verify = true;
          userotp.otp = null;
          userotp.save();
  
          res.status(200).json({
            success: true,
            msg: "user verified",
          });
        } else res.status(400).json({ success: false, msg: "OTP incorrect" });
      } catch (error) {
        res.status(400).json({ success: false, msg: error.message });
        console.log(error);
      }
    },
    resetpass: async (req, res) => {
      try {
        // console.log(req.route.path);
        const { email, password } = req.body;
        const user = await sellerModel.findOne({ email });
        const userotp = await otpModel.findOne({ email });
        if (!userotp) throw new Error("Verification Timed OUT");
        if (!user) throw new Error("No user found!");
        
        if (userotp.verify == true) {
          const result = await bcrypt.compare(password, user.password);
          if (result) throw new Error("Please Change to new Password");
          const passwordHash = await bcrypt.hash(password, 12);
          user.password = passwordHash;
          user.save();
          userotp.verify = false;
          userotp.save();
  
          res.status(200).json({
            success: true,
            msg: "password changed successfully",
          });
        } else
          res
            .status(400)
            .json({ success: false, msg: "OTP verification Incomplete" });
      } catch (error) {
        res.status(400).json({ success: false, msg: error.message });
        console.log(error);
      }
    },
    registerrestaurant:async(req,res)=>{
        try{
            let currstate,currlatitude,loc=true,currlongitude;
            const{restaurantname,mobilenumber,restaurantaddress,pincode,restaurant_openingtime,restaurant_closingtime}=req.body;
            let token=req.headers['accesstoken'] || req.headers['authorization'];
            token = token.replace(/^Bearer\s+/, "");
            const decode = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
            const _id=decode.id;
              
            const id = mongoose.Types.ObjectId(_id);


           await geoCoder.geocode(restaurantaddress)
            .then((res)=> {
              if(res.length==0)loc=false;
             currstate=(res[0].state);
             currlongitude=(res[0].longitude);
             currlatitude=(res[0].latitude);
            })
            .catch((err)=> {
              console.log(err);
            });
            if(loc==false)
            {
              await geoCoder.geocode(pincode)
            .then((res)=> {
              loc=true;
              if(res.length==0)loc=false;
             currstate=(res[0].state);
             currlongitude=(res[0].longitude);
             currlatitude=(res[0].latitude);
             
            })
            .catch((err)=> {
              console.log(err);
            });
            }
          if(!loc)throw new Error("Location not found");
            let filepath = [];

            if(req.files !== undefined){
                for(let i=0;i<req.files.length;i++)
                filepath[i] = 'uploads/' + req.files[i].filename;
              
                // console.log(req.files.length );
            }
            // console.log(await sellerModel.findById({_id:id}));
            if(!(await sellerModel.findById({_id:id})))throw new Error("login or register !");
            // console.log(currstate);
            const result=await sellerModel.findByIdAndUpdate({_id:id},{restaurantname:restaurantname,mobilenumber:mobilenumber,restaurantaddress:restaurantaddress,restaurant_openingtime:restaurant_openingtime,restaurant_closingtime:restaurant_closingtime,imgpath:filepath,state:currstate,longitude:currlongitude,latitude:currlatitude},{new: true});
            console.log(result);
            
            res.status(200).json({
                success:true,
                msg:"restaurant registered successfully !",
                result

            })
        }
        catch(error){
            res.status(400).json({ success: false, msg: error.message });
            console.log(error);
        }
    },
    listfooditems:async(req,res)=>{
        try{
            // // const{foodname,food_price,food_desc,id}=req.body;
            // const food_image;
            // const food_image= new food_image({
            //     data:req.body.data,
            //     contentType:'image/png'

            // })

            let{foodname,food_price,food_desc,food_category}=req.body;
            food_category=food_category.toLowerCase();

            let token=req.headers['accesstoken'] || req.headers['authorization'];
            token = token.replace(/^Bearer\s+/, "");
            const decode = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
            const _id=decode.id;
              
            const id = mongoose.Types.ObjectId(_id);


            let filepath = null;

            if(req.file !== undefined){
                filepath = 'uploads/' + req.file.filename;
            }
             
            if(!id)throw new Error("login or register !");
            const restaurant=await sellerModel.findById(id);
            
            if(!restaurant)throw new Error("no such restaurant found !");
            // console.log(restaurant.restaurantname);
            if(!restaurant.restaurantname)throw new Error("restaurant not registered"); 
            const present=await foodlistModel.find({});
            let i=0;
            present.forEach(presentfood=>{
              if(presentfood.foodname==foodname && presentfood.sellerid==id)
              {
                 i=1;
              }
            })
            

            if(i==0){
            const foodlist = await foodlistModel.create({
              sellerid:id,
              foodname,
              food_price,
              food_desc,
              food_category,
              imgpath:filepath
          });

          const appendfoodlist = await sellerModel.findByIdAndUpdate(id,{
            $addToSet:{food_list:foodlist._id}
           });

            res.status(200).json({
            success:true,
            msg:"Dish entered successfully !",
            });
          }
         else{
          res.status(400).json({
            success:false,
            msg:"Dish already  present!",
          })
         }
            // const {food_list}=restaurant; //check if empty food_list array is obtained or not on first food item entry
            
            // let i=0;
            // let j=0;
            // let pointer=0;
            // food_list.forEach (async foodlist=>{
            //   let foodlistval=await foodlistModel.findById({foodlist})
            //   if(foodname==foodlistval.foodname)
            //   {
            //     i=1;
            //     pointer=j;
            //   }
            //   j++;
            // })
            
            // if(i==0){
            // const newfoodlist=[...food_list,{foodname,food_price,food_desc,food_category,imgpath : filepath}];
            // const result=await sellerModel.findByIdAndUpdate({_id:id},{food_list:newfoodlist},{new: true});
            // console.log(result);
            // }
            // else{
            //   console.log(pointer);
            //   food_list.splice(pointer,1);
            //   const newfoodlist=[...food_list,{foodname,food_price,food_desc,food_category,imgpath : filepath}];
            //   const result=await sellerModel.findByIdAndUpdate({_id:id},{food_list:newfoodlist},{new: true});

            // }
            
            // res.status(200).json({
            //     success:true,
            //     msg:"Dish entered successfully !",
            // });


        }
        catch(error){
            res.status(400).json({ success: false, msg: error.message });
            console.log(error);
        }
    },
    sellerprofile:async(req,res)=>{
        try{
          let token=req.headers['accesstoken'] || req.headers['authorization'];
          token = token.replace(/^Bearer\s+/, "");
          const decode = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
          const _id=decode.id;
            
          const id = mongoose.Types.ObjectId(_id);
          console.log(id);
          if(!id)throw new Error("No user exists !")
          const sellerDetails=await sellerModel.findById(id).populate('food_list');
          // const sellername=sellerDetails.sellername
          // const emailid=sellerDetails.email
          // const restaurantname=sellerDetails.restaurantname
          // const restaurantaddress=sellerDetails.restaurantaddress
          // const restaurantdesc=sellerDetails.restaurantdesc
          res.status(200).json({
            success: true,
            msg: "seller details sent successfully !",
            sellerDetails,
    
          })

        }
        catch (err){
            return res.status(400).json({msg:err.message});
        }
      },
      
      // removefromorders:async(req,res) =>{
      //   try{    
      //     let token=req.headers['accesstoken'] || req.headers['authorization'];
      //     token = token.replace(/^Bearer\s+/, "");
      //     const decode = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
      //     const user_id=decode.id;
      //     let id = mongoose.Types.ObjectId(user_id);
      //     const {index} = req.body;
      //     const seller = await sellerModel.findById(id);
          
      //     if(!seller)throw new Error("id incorrect");
      //     // console.log(seller.orders);
      //     let orders = seller.orders;
      //     orders.splice(index,1);
      //     // console.log(orders);
      //     seller.orders=orders;      
      //     seller.save();
      //     return res.status(200).json({msg:"order done"});
      //   } catch(err) {
      //     console.log(err);
      //     return res.status(400).json(err);
      //   }
      // },
      setorderstatus:async(req,res)=>{
        try{    
          // let token=req.headers['accesstoken'] || req.headers['authorization'];
          // token = token.replace(/^Bearer\s+/, "");
          // const decode = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
          // const user_id=decode.id;
          // let id = mongoose.Types.ObjectId(user_id);
          // const user = await UserModel.findById(id);
          // if(!user)throw new Error("id incorrect");
          const {orderid,status}=req.body;
          let id = mongoose.Types.ObjectId(orderid);
          // console.log(id);
          const order = await orderModel.findById(id);
          // console.log(order);
          if(!order)throw new Error("order id incorrect");
          // status.toLowerCase();
          order.status=status;
          order.save();      
          return res.status(200).json({msg:"status updated"});
        } catch(err) {
          console.log(err);
          return res.status(400).json(err);
        }
      },
      sellerpendingorders:async(req,res)=>{
        try{    
          let token=req.headers['accesstoken'] || req.headers['authorization'];
          token = token.replace(/^Bearer\s+/, "");
          const decode = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
          const user_id=decode.id;
          let id = mongoose.Types.ObjectId(user_id);
          const user = await sellerModel.findById(id);
          if(!user)throw new Error("id incorrect");
          // const {orderid,status}=req.body;
          // let id = mongoose.Types.ObjectId(orderid);
          // console.log(id);
          // const orders = await orderModel.find({sellerid:id});
          const orders = await orderModel.find({sellerid:id, status:"Pending"}).sort({_id:-1});
          // console.log(order);
          if(!orders)throw new Error("no orders");
          // status.toLowerCase();
          // order.status=status;
          // order.save();      
          return res.status(200).json({orders});
        } catch(err) {
          console.log(err);
          return res.status(400).json(err);
        }
      },
}
const createAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
};

// const createRefreshToken = (user) => {
//   return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
// };

module.exports=foodCtrl;