const UserModel = require("../models/userModel");
const foodlistModel=require("../models/foodlistmodel");
const { distanceTo, isInsideCircle } = require('geofencer');
const otpModel = require("../models/otpModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const nodeGeocoder = require('node-geocoder');
const options = {
  provider: 'openstreetmap'
};
const geoCoder = nodeGeocoder(options);
const e = require("express");
const otpGenerator = require("otp-generator");
const sellerModel = require("../models/foodModel");
const orderModel = require("../models/ordermodel");
const { where } = require("sequelize");
// const locator=require("../util/locator.js");
require("dotenv").config();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "foodorafoodservice@gmail.com",
    pass: process.env.password,
  },
});
const userCtrl = {
  register: async (req, res) => {
    try {
      let { username, email, password } = req.body;
      email = email.toLowerCase();
      const users = await UserModel.findOne({ where: { email:email }});
      if (!users) {
        
        const passwordHash = await bcrypt.hash(password, 12);
        const user = UserModel.build({
          username,
          email,   
          password: passwordHash,
          verify: false,
        });
        await user.save();

        const userotp = otpModel.build({
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
          <h4>You are About to be a Member </h4>
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
  getUsers: async (req, res) => {
    try {
      const result = await UserModel.findall();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, msg: "Operation failed!" });
      console.log(error);
    }
  },
  signin: async (req, res) => {
    try {
      let { email, password } = req.body;
      email = email.toLowerCase();
      const user = await UserModel.findOne({ where:{ email }});
      if (!user) throw new Error("No user found!");
      if (!user.verify) throw new Error("User Not Verified");
      const result = await bcrypt.compare(password, user.password);
      if (!result) throw new Error("Invalid credentials!");


      const accesstoken = createAccessToken({ id: user._id });
      res.status(200).json({
        success: true,
        msg: "Login successful",
        accesstoken,
        id:user._id
      });
    } catch (error) {
      res.status(400).json({ success: false, msg: error.message });
      console.log(error);
    }
  },
  sendOTP: async (req, res) => {
    try {
      // console.log(req.route.path);
      const { email } = req.body;

      const user = await UserModel.findOne({where:{ email }});
      const userotp = await otpModel.findOne({where:{ email }});
      if (!userotp) {
        const userotp = otpModel.build({
          createdAt: new Date(),
          email,
          otp: null,
        });
        await userotp.save();
        userotp.otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          specialChars: false,
          lowerCaseAlphabets: false,
        });
        await userotp.save();
      }
      if (!user) throw new Error("No user found!");
      if (user.verify) throw new Error("User already verified");
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
          <h4>You are About to be a Member </h4>
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
      });
    }
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

      const user = await UserModel.findOne({where:{ email }});
      const userotpold = await otpModel.findOne({where:{ email }});

      if (userotpold && userotpold.verify) throw Error("User Already Verified");
      
      if (!user) throw new Error("User does not exist");
      if (!user.verify) throw new Error("User Not verified.");

      
      let userotp,users;
      if (!userotpold) {
        userotp = otpModel.build({
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
      const user = await UserModel.findOne({where:{ email }});
      const userotp = await otpModel.findOne({where:{ email }});
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
      const user = await UserModel.findOne({where:{ email }});
      const userotp = await otpModel.findOne({where:{ email }});
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
  verify: async (req, res) => {
    try {
      // console.log(req.route.path);
      const { email, otp } = req.body;
      const user = await UserModel.findOne({where:{email}});
      const userotp = await otpModel.findOne({where:{ email }});
      // console.log(user);
      // console.log(userotp);
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
          <h4>You are hereby declared a member of Foodora.</h4>
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
          id:user._id,
          accesstoken
        });
      } else res.status(400).json({ success: false, msg: "OTP incorrect" });
    } catch (error) {
      res.status(400).json({ success: false, msg: error.message });
      console.log(error);
    }
  },


  // refreshToken: (req, res) => {
  //   try {
  //     const rf_token = req.cookies.refreshtoken;
  //     if (!rf_token)
  //       return res.status(400).json({ msg: "Please Login or Register" });

  //     jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
  //       if (err) return res.status(400).json({ msg: "Please Login or Register" });

  //       const accesstoken = createAccessToken({ id: user.id });

  //       res.json({ accesstoken });
  //     });
  //   } catch (err) {
  //     return res.status(500).json({ msg: err.message });
  //   }
  // },
  // logout: async (req, res) => {
  //   try {
  //     res.clearCookie("refreshtoken",{path:'/user/refresh_token'})
  //     return res.json({msg:"Logged Out"})
  //   } catch (err) {
  //     return res.status(500).json({ msg: err.message });
  //   }
  // },
  userprofile:async(req,res)=>{
    try{
      let token=req.headers['accesstoken'] || req.headers['authorization'];
      token = token.replace(/^Bearer\s+/, "");
      const decode = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
      const user_id=decode.id;
        
      // const id = mongoose.Types.ObjectId(user_id);
      console.log(id);
      if(!id)throw new Error("No user exists !")
      const userDetails=await UserModel.findByPk(id);
      const username=userDetails.username
      const emailid=userDetails.email
      const orderhistory=userDetails.orderhistory
      const useraddress=userDetails.address;
      // console.log(userDetails);
      res.status(200).json({
        success: true,
        msg: "user details sent successfully !",
        username,
        emailid,
        imagepath:userDetails.profileimgpath,
        orderhistory,
        useraddress,
      })


    }
    catch (err){
        return res.status(400).json({msg:err.message});
    }
  },

  addtocart:async(req,res)=>{
    try{
      let{seller_id,food_id}=req.body;
      let token=req.headers['accesstoken'] || req.headers['authorization'];
      token = token.replace(/^Bearer\s+/, "");
      const decode = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
      const user_id=decode.id;
        
      let id = mongoose.Types.ObjectId(user_id);

      const fooddetails=await sellerModel.findById(seller_id).populate("food_list");
      const{food_list}=fooddetails;
      let cartfoodlist;
      food_list.forEach(foodlist=>{
        if(foodlist._id==food_id)
        {
          cartfoodlist=foodlist;
        }
      })  
      var foodid = mongoose.Types.ObjectId(food_id);
      var foodname=cartfoodlist.foodname;
      var food_price=cartfoodlist.food_price;
      const user=await UserModel.findById(id);
      let {sellerid}=user;
      if(seller_id==sellerid || sellerid=="")
      {
        if(sellerid=="")
        {
          sellerid=seller_id;
        }
        const {cart}=user;
        let cartinfotemp=null;
        let i=0;
        let j;
        cart.forEach(cartinfo=>{
          if(cartinfo.foodname==foodname)
          {
            cartinfotemp=cartinfo;
            j=i;

          }
          i++;
          
        })
        if(cartinfotemp!=null)
        {
          foodname=cartinfotemp.foodname;
          food_price=cartinfotemp.food_price;
          let quantity=cartinfotemp.quantity+1;
          cart.splice(j,1);
          const newcart=[...cart,{foodname,food_price,quantity}];
         
          // await UserModel.findByIdAndUpdate({_id:id},{cart:cart},{new: true});
          // const result=await UserModel.findByIdAndUpdate({_id:id},{$push:{cart:{foodid:foodid,foodname,food_price,quantity}}},{new: true});  
          const result1=await UserModel.findByIdAndUpdate({_id:id},{cart:newcart},{new: true});
          const result2=await UserModel.findByIdAndUpdate({_id:id},{sellerid:sellerid},{new: true}); 
        }
        else{
          var quantity=1;
          const newcart=[...cart,{foodname,food_price,quantity}];
          const result1=await UserModel.findByIdAndUpdate({_id:id},{cart:newcart},{new: true});
          // const result=await UserModel.findByIdAndUpdate({_id:id},{$push:{cart:{foodid,foodname,food_price,quantity}}},{new: true});
          const result2=await UserModel.findByIdAndUpdate({_id:id},{sellerid:sellerid},{new: true});  
        }
        
      }
      else
      {
        quantity=1;
        sellerid=seller_id;
        const newcart=[{foodid,foodname,food_price,quantity}];
        const result=await UserModel.findByIdAndUpdate({_id:id},{cart:newcart},{new: true});  
        const result2=await UserModel.findByIdAndUpdate({_id:id},{sellerid:sellerid},{new: true}); 
      }
      res.status(200).json({
        success: true,
        msg: "addedtocart",
      })
    }
    catch(err){
      console.log(err);
      return res.status(400).json({ msg: err.message });
    }
  },


  removefromcart:async(req,res)=>{
    try{
      const{seller_id,food_id}=req.body;
      let token=req.headers['accesstoken'] || req.headers['authorization'];
      token = token.replace(/^Bearer\s+/, "");
      const decode = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
      const user_id=decode.id;
        
      const id = mongoose.Types.ObjectId(user_id);

      const fooddetails=await sellerModel.findById(seller_id).populate('food_list');
      const{food_list}=fooddetails;
      let cartfoodlist;
      food_list.forEach(foodlist=>{
        if(foodlist._id==food_id)
        {
          cartfoodlist=foodlist;
        }
      })
      
      var foodname=cartfoodlist.foodname;
      var food_price=cartfoodlist.food_price;
      const user=await UserModel.findById(id);
      const {cart}=user;
      let cartinfotemp=null;
      let i=0;
      let j;
      cart.forEach(cartinfo=>{
        if(cartinfo.foodname==foodname)
        {
          cartinfotemp=cartinfo;
          j=i;
        }
        i++;
        
      })
      if(cartinfotemp!=null)
      {
        foodname=cartinfotemp.foodname;
        food_price=cartinfotemp.food_price;
        let quantity=cartinfotemp.quantity-1;
        if(quantity<=0)
          quantity=0;
          
        cart.splice(j,1);
        if(quantity>0){
        const newcart=[...cart,{foodname,food_price,quantity}];
        const result=await UserModel.findByIdAndUpdate({_id:id},{cart:newcart},{new: true});
        // const result=await UserModel.findByIdAndUpdate({_id:id},{$push:{cart:{foodname,food_price,quantity}}},{new: true});
        }
        else{
          const result=await UserModel.findByIdAndUpdate({_id:id},{cart:cart},{new: true});
        }
      }
      else{
      var quantity=1;
      const newcart=[...cart,{foodname,food_price,quantity}];
      const result=await UserModel.findByIdAndUpdate({_id:id},{cart:newcart},{new: true});
      }
      res.status(200).json({
        success: true,
        msg: "removedfromcart",

      })  
    }
    catch(err){
      return res.status(400).json({ msg: err.message });
    }
  },


  viewcart:async(req,res)=>{
    try{
      let token=req.headers['accesstoken'] || req.headers['authorization'];
      token = token.replace(/^Bearer\s+/, "");
      const decode = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
      const user_id=decode.id;
        
      let id = mongoose.Types.ObjectId(user_id);
      const users=await UserModel.findById(id);
      await sellerModel.populate(users, {path: "food_list"});
      const {cart}=users;
      // if(users.cart=[])throw new Error("cart empty");
        res.status(200).json({
        success:true,
        message:"contents of cart are given below",
        cart,
        sellerid:users.sellerid
      })
    }
    catch(err){
      return res.status(400).json({msg:err.message});
    }
  },
  fooddetails:async(req,res)=>{
    try{
      const{food_id,seller_id}=req.body;
      const seller=await sellerModel.findById(seller_id).populate("food_list");
      // const food_list=await sellerModel.findById(id).populate("food_list");
      const{food_list}=seller;
      let tempfoodinfo=null;
      food_list.forEach(foodinfo=>{
        if(foodinfo._id==food_id)
        {
          tempfoodinfo=foodinfo;
          
        }
      })
      let foodname;
      let foodprice;
      let fooddesc;
      let foodimg;
      if(tempfoodinfo!=null)
      {
        foodname=tempfoodinfo.foodname;
        foodprice=tempfoodinfo.food_price;
        fooddesc=tempfoodinfo.food_desc;
        foodimg=tempfoodinfo.imgpath;
      }
      res.status(200).json({
        success:true,
        message:"food sent successfuly !",
        foodname,
        foodprice,
        fooddesc,
        foodimg
      })


    }
    catch(err){
      return res.status(400).json({msg:err.message});
    }
  },


  send_count_of_fooditem:async(req,res)=>{
    try{
      const{foodname,seller_id}=req.body;
      let token=req.headers['accesstoken'] || req.headers['authorization'];
      token = token.replace(/^Bearer\s+/, "");
      const decode = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
      const user_id=decode.id;
      
      let id = mongoose.Types.ObjectId(user_id);

      const users=await UserModel.findById(id);
      await sellerModel.populate(users, {path: "food_list"});
      const {sellerid}=users;
      let count;
      if(sellerid!=seller_id){
        count=0;
      }
      else{
        const  {cart}=users;
        
        let tempcartinfo=null;
        cart.forEach(cartinfo=>{
          if(cartinfo.foodname==foodname)
          {
            tempcartinfo=cartinfo;
          }
        })
        if(tempcartinfo==null)
        {
          count=0;
        }
        else{
          count=tempcartinfo.quantity;
        }
      }
      res.status(200).json({
        success:true,
        message:"count sent successfully !",
        count
      })
    }
    catch(err){
      return res.status(400).json({msg:err.message});
    }
  },





  // 
  feed:async(req,res)=>{
    try{
      let token=req.headers['accesstoken'] || req.headers['authorization'];
        token = token.replace(/^Bearer\s+/, "");
        const decode = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user_id=decode.id;
        
        let id = mongoose.Types.ObjectId(user_id);
      
    
        const nearby = await UserModel.findById(id);

        console.log(id);
        if(nearby.nearme.length==0)throw new Error("nothing nearby");
      if(!nearby)throw new Error("id incorrect");
      // console.log(near);
      near=nearby.nearme;
      await sellerModel.populate(near, {path: "food_list"});
      // await sellerModel.findById(id).populate("food_list");
      res.status(200).json({
        success: true,
        msg: "Feed sent successfully",
        near,
      })

    }
    catch(err){
      // return res.status(400).json({ msg:"unable to send feed" });
      return res.status(400).json({ success:false,msg:err.message });
    }
  },

  location:async(req,res)=>{
    try{
      const{latitude,longitude}=req.body;
      let token=req.headers['accesstoken'] || req.headers['authorization'];
      token = token.replace(/^Bearer\s+/, "");
      const decode = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
      const user_id=decode.id;
        
      const id = mongoose.Types.ObjectId(user_id);


      // console.log(latitude,longitude);
      const user=await UserModel.findById(id);
      if(!user)throw new Error("id incorrect");
      // let{nearme}=user;
      let near=[];
      
     
        await geoCoder.reverse({ lat: latitude, lon: longitude})
        .then((res)=> {
          address=(res[0]);
        })
        .catch((err)=> {
          console.log(err);
        });
        // console.log(address);
        useraddress=address.formattedAddress;
        const staterestaurants=await sellerModel.find({state:address.state}).populate("food_list");
        
         
        //  console.log(restaurants);
        // console.log(address);
      const userlat=latitude;
      // const restlat=restaurant.latitude;
      const userlong=longitude;
      // const restlong=restaurant.longitude;
      const circle = {
          center: [userlat, userlong], 
          radius: 10000 // 10km
      }
      staterestaurants.forEach(restaurant=>{
        restlat=restaurant.latitude;
        restlong=restaurant.longitude;
        const point = [restlat, restlong];
        if( isInsideCircle(circle.center, point, circle.radius))
        {
          near.push(restaurant);
        }
      });
      // console.log(near);
      user.address=useraddress;
      user.nearme=near;
      user.save();
      // const point = [restlat, restlong] // Alexandria... >5km away from Giza
      // const inside = isInsideCircle(circle.center, point, circle.radius);
      // const distance = distanceTo([userlat, userlong], [userlat, userlong]);
      // console.log(inside,distance/1000);
        res.status(200).json({
          success: true,
          msg: "location identified!",
          address:address.formattedAddress
  
        });
    }
    catch (err){
        return res.status(400).json({success:false,msg:err.message});
    }
  },
  locationbyaddress:async(req,res)=>{
    try{
      const{addr,pincode}=req.body;
      let token=req.headers['accesstoken'] || req.headers['authorization'];
      token = token.replace(/^Bearer\s+/, "");
      const decode = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
      const user_id=decode.id;
        
      const id = mongoose.Types.ObjectId(user_id);

      let loc=true;
      // console.log(latitude,longitude);
      const user=await UserModel.findById(id);
      if(!user)throw new Error("id incorrect");
      // let{nearme}=user;
      let near=[];
      
     
        await geoCoder.geocode(addr)
            .then((res)=> {
              if(res.length==0)loc=false;
              address=res[0];
            //  currstate=(res[0].state);
            //  currlongitude=(res[0].longitude);
            //  currlatitude=(res[0].latitude);
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
              address=res[0];
            //  currstate=(res[0].state);
            //  currlongitude=(res[0].longitude);
            //  currlatitude=(res[0].l/atitude);
             
            })
            .catch((err)=> {
              console.log(err);
            });
            }
          if(!loc)throw new Error("Location not found");
          useraddress=address.formattedAddress;
      
        const staterestaurants=await sellerModel.find({state:address.state}).populate("food_list");
        
         
        //  console.log(restaurants);
        // console.log(address);
      const userlat=address.latitude;
      // const restlat=restaurant.latitude;
      const userlong=address.longitude;
      // const restlong=restaurant.longitude;
      const circle = {
          center: [userlat, userlong], 
          radius: 10000 // 10km
      }
      staterestaurants.forEach(restaurant=>{
        restlat=restaurant.latitude;
        restlong=restaurant.longitude;
        const point = [restlat, restlong];
        if( isInsideCircle(circle.center, point, circle.radius))
        {
          near.push(restaurant);
        }
      });
      // console.log(near);
      user.nearme=near;
      user.address=useraddress;
      user.save();
      // const point = [restlat, restlong] // Alexandria... >5km away from Giza
      // const inside = isInsideCircle(circle.center, point, circle.radius);
      // const distance = distanceTo([userlat, userlong], [userlat, userlong]);
      // console.log(inside,distance/1000);
        res.status(200).json({
          success: true,
          msg: "location identified!",
          address:address.formattedAddress
  
        });
    }
    catch (err){
        return res.status(400).json({success:false,msg:err.message});
    }
  },
  restaurant:async(req,res)=>{
    try{
      
        const id=req.params.id;
        // const seller = await sellerModel.findById(id); 
        const seller=await sellerModel.findById(id).populate("food_list");
      if(!seller)throw new Error("id incorrect");
      
      res.status(200).json({
        success: true,
        msg: "Seller sent successfully",
        seller,
        // foods,
      })

    }
    catch(err){
      // return res.status(400).json({ msg:"unable to send feed" });
      return res.status(400).json({ success:false,msg:err.message });
    }
  },
  checkout:async(req,res)=>{
    try{
      let token=req.headers['accesstoken'] || req.headers['authorization'];
        token = token.replace(/^Bearer\s+/, "");
        const decode = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user_id=decode.id;
        let id = mongoose.Types.ObjectId(user_id);
        
        const user = await UserModel.findById(id);
        await sellerModel.populate(user, {path: "food_list"});
        if(!user)throw new Error("id incorrect");
        if(user.cart.length==0)throw new Error("Cart is Empty");
        // console.log(user.sellerid);
        const order=orderModel({
          order:user.cart,
          sellerid:user.sellerid,
          userid:user._id
        });
        await order.save();
        // usercartobject={cart:user.cart , id:new mongoose.Types.ObjectId};
        // const seller =await sellerModel.findByIdAndUpdate({_id:user.sellerid},{ $push: { orders: usercartobject }}).populate("food_list");
        // const seller=await sellerModel.findById(id).populate("food_list");
        // seller.save(); 
        
        // user.orderhistory.push(usercartobject);
        user.cart=[];
        await user.save();
    
        res.status(200).json({
          success: true,
          msg: "checkout successful",
          // user,
          order,
          
        });
    }
    catch (err){
      console.log(err);
        return res.status(400).json({success:false,msg:err.message});
    }
  },
  search:async(req,res) => {
    try {
        const {text} = req.body;
        const filter = {$regex: text ,'$options': 'i'};
        let docs = await sellerModel.aggregate([
            { $match:{restaurantname: filter} },
            // { $lookup: {from: 'sellerModel', localField: 'food_list', foreignField: 'food_list', as: 'userModel'} }
          ])
          await sellerModel.populate(docs, {path: "food_list"});
          // .populate("food_list")
        if(!docs) return res.status(400).json({msg:'Not able to search.'});

        const restaurants = [];
        docs.forEach(obj=>{
            restaurants.push(obj);
        });

        return res.status(200).json(restaurants);
    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
},
  profileimage:async(req,res) =>{
    try{    
      let token=req.headers['accesstoken'] || req.headers['authorization'];
      token = token.replace(/^Bearer\s+/, "");
      const decode = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
      const user_id=decode.id;
      let id = mongoose.Types.ObjectId(user_id);
      
      const user = await UserModel.findById(id);
      
      if(!user)throw new Error("id incorrect");

            let filepath = null;

            if(req.file !== undefined){
                filepath = 'uploads/' + req.file.filename;
            }
      user.profileimgpath=filepath;
      user.save();
      return res.status(200).json({msg:"image added"});
    } catch(err) {
      console.log(err);
      return res.status(400).json(err);
    }
  },
  category:async(req,res)=>{
    try{
      let {category}=req.body;
      const pipeline=[
          {
            '$match': {
              'food_category': category
            }
          }
      ]
      if(category=="all")
      {resultcategory=await foodlistModel.find();}
      else
      {resultcategory=await foodlistModel.aggregate(pipeline);}

       return res.status(200).json({
        msg:"food category sent !",
        resultcategory
      });
      
      
    }
    catch(err){
      console.log(err);
      return res.status(400).json(err);
    }
  },
  
  userorders:async(req,res)=>{
    try{    
      let token=req.headers['accesstoken'] || req.headers['authorization'];
      token = token.replace(/^Bearer\s+/, "");
      const decode = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
      const user_id=decode.id;
      let id = mongoose.Types.ObjectId(user_id);
      const user = await UserModel.findById(id);
      if(!user)throw new Error("id incorrect");
      // const {orderid,status}=req.body;
      // let id = mongoose.Types.ObjectId(orderid);
      // console.log(id);
      const orders = await orderModel.find({userid:id}).sort({_id:-1});
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
  order:async(req,res)=>{
    try{
      
        const id=req.params.id;
        // const seller = await sellerModel.findById(id); 
        const order=await orderModel.findById(id);
      if(!order)throw new Error("id incorrect");
      
      res.status(200).json({
        success: true,
        msg: "Order sent successfully",
        order:order.order,
        // foods,
      })

    }
    catch(err){
      // return res.status(400).json({ msg:"unable to send feed" });
      return res.status(400).json({ success:false,msg:err.message });
    }
  },
  rating:async(req,res)=>{
    try{
      const{rating,food_id}=req.body;
      let token=req.headers['accesstoken'] || req.headers['authorization'];
      token = token.replace(/^Bearer\s+/, "");
      const decode = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
      const user_id=decode.id;
      const id = mongoose.Types.ObjectId(user_id);
      const user=await UserModel.findById(id);
      if(!user)throw new Error("id incorrect");
      // let {cart}=user;
      // console.log(cart);
      // let i=0;
      // let j=0;
      // cart.forEach(cartele=>{
      //   i++;
      //   if(cartele.foodid==food_id)
      //   {
      //     carteletemp=cartele;
      //     j=i;
      //   }
      // })
      // if(carteletemp.rating!=0)throw new Error("User already rated the item !");
      // carteletemp.rating=rating;
      
      // cart.splice(j-1,1,carteletemp);
      // console.log(cart);

      // const result=await UserModel.findByIdAndUpdate({_id:id},{cart:cart},{new: true});

      // let {order}=user;
      console.log(user);
      let i=0;
      let j=0;
      let carteletemp;
      orderhistory.forEach(cartele=>{
        i++;
        if(cartele.foodid==food_id)
        {
          carteletemp=cartele;
          j=i;
        }
  
      })
      console.log(carteletemp);
      if(carteletemp.rating!=0)throw new Error("User already rated the item !");
      carteletemp.rating=rating;
      
      orderhistory.splice(j-1,1,carteletemp);
      console.log(orderhistory);

      const result=await UserModel.findByIdAndUpdate({_id:id},{orderhistory:orderhistory},{new: true});
      const ratingele=await foodlistModel.findById(food_id);
      console.log(ratingele);
      ratingele.ratingtotal=+ratingele.ratingtotal+ +rating;
      ratingele.ratingcount=ratingele.ratingcount+1;
      ratingele.food_rating=ratingele.ratingtotal/ratingele.ratingcount;
      ratingele.save();

      return res.status(200).json({
      msg:"rating added !",
      })

    }
    catch(err){
      console.log(err);
      return res.status(400).json({success:false,msg:err.message});
    }
  },
  rating2:async(req,res)=>{
    try{
      const{rating,food_id}=req.body;
      let token=req.headers['accesstoken'] || req.headers['authorization'];
      token = token.replace(/^Bearer\s+/, "");
      const decode = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
      const user_id=decode.id;
      const id = mongoose.Types.ObjectId(user_id);
      const foodid = mongoose.Types.ObjectId(food_id);
      // console.log(id);
      const orders=await orderModel.find({userid:id});
      await orderModel.deleteMany( { "userid" : id } );
      if(!orders)throw new Error("id incorrect");
      // console.log(orders);
      // orders.forEach(cartele=>{
      //   cartele.order.forEach(item=>{
      //     // console.log(item);
      //     if(item.rating!=0)throw new Error("Item Already rated by this user");
      //     else
      //     item.rating=rating;
      //   });
        
      // });
      for(i=0;i<orders.length;i++)
      {
        // console.log(orders[i]);
        for(j=0;j<orders[i].order.length;j++)
        {
          // console.log(orders[i].order[j]);
          if(orders[i].order[j].rating!=0)throw new Error("Item Already rated by this user");
          else if(orders[i].order[j]._id==food_id)
          orders[i].order[j].rating=rating;
        }
        await orders[i].save();
      }
      // for(i=0;i<orders.length;i++)
      // {
      //   result = await orders[i].save();
      //   console.log(result);
      // }
      // console.log(orders[0].order);
      
      // console.log(carteletemp);
      // if(carteletemp.rating!=0)throw new Error("User already rated the item !");
      // carteletemp.rating=rating;
      
      // orderhistory.splice(j-1,1,carteletemp);
      // console.log(orderhistory);

      // const result=await UserModel.findByIdAndUpdate({_id:id},{orderhistory:orderhistory},{new: true});
      //
      // const ratingele=await foodlistModel.findById(food_id);
      // console.log(ratingele);
      // ratingele.ratingtotal=+ratingele.ratingtotal+ +rating;
      // ratingele.ratingcount=ratingele.ratingcount+1;
      // ratingele.food_rating=ratingele.ratingtotal/ratingele.ratingcount;
      // ratingele.save();

      return res.status(200).json({
      msg:"rating added !",
      })

    }
    catch(err){
      console.log(err);
      return res.status(400).json({success:false,msg:err.message});
    }
  }
  
  

}



const createAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
};

// const createRefreshToken = (user) => {
//   return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
// };


module.exports = userCtrl;