const foodCtrl=require("../controllers/foodCtrl");
const router=require("express").Router();
const Upload = require('../middleware/upload');
const auth = require("../middleware/auth");

router.post('/register',foodCtrl.register);
router.post('/restaurantregister',auth,Upload.uploadImg.array('image',5),foodCtrl.registerrestaurant);
router.post('/foodlisting',auth,Upload.uploadImg.single('image'), foodCtrl.listfooditems);
router.post('/verify/send',foodCtrl.sendOTP);
router.post('/verify',foodCtrl.verify);
router.post('/signin',foodCtrl.signin);

router.post('/forgot/send',foodCtrl.forgotsendOTP);
router.post('/forgot/verify',foodCtrl.forgotverify);
router.post('/forgot/reset',foodCtrl.resetpass);
router.post('/sellerprofile',auth,foodCtrl.sellerprofile);
router.post("/setorderstatus",auth,foodCtrl.setorderstatus);
// router.post('/removefromorders',auth,foodCtrl.removefromorders);
router.get("/sellerpendingorders",auth,foodCtrl.sellerpendingorders);
module.exports=router;


