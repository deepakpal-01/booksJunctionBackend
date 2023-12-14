const express=require('express')
const userModel=require('../Models/UserModel')
const router=express.Router()
const bcrypt=require('bcryptjs')
const jwt=require( 'jsonwebtoken')
const { body, validationResult } = require('express-validator')
const fetchuser=require('../Middleware/fetchuser')


const JWT_SECRET="Deepakpalsecondjwtsecret"


router.get('/allusers',async(req,res)=>{
    const result=await userModel.getAllUser()
    res.json(result)
})


//1.create user in database
router.post('/createuser',[           //setting validations
body('name',"Enter full name").isLength({min:3}),
body('email',"Enter valid Email").isEmail(),
body('password',"Password is too short").isLength({min:5})
],async(req,res)=>{
    //checking validations for fields and returns bad request
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({status:false,errors: errors.array()});
    }

    const salt= await bcrypt.genSalt(10);
    const securedPassword= await bcrypt.hash(req.body.password,salt);

    const user={
        "email":req.body.email,
        "name":req.body.name,
        "password":securedPassword
    }
    const result=await userModel.createUser(user)

    if(result.status){
        const data={
            user:{
                id:result.response
            }
        }
        const authtoken=jwt.sign(data,JWT_SECRET)
        return res.json({status:result.status,authtoken})
    }
    else{
        // res.json(result)
        return res.status(500).json(result)
    }
})

//Route 2: Login existing user
router.post('/login',[           //setting validations
body('email',"Enter valid Email").isEmail(),
body('password',"Password is too short").isLength({min:5})
],async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({success:false,errors: errors.array()});
    }
    const {email,password}=req.body
    try{
   
        const result=await userModel.getUserByEmail(email)

        if(!result.status){
            return res.status(400).json(result)
        }

        const passwordCompare=await bcrypt.compare(password,result.response.password)
        if(!passwordCompare){
           return  res.status(400).json({status:false,response:"Invalid password"})
        }

        if(result.status){
            const data={
                user:{
                    id:result.id
                }
            }
            const authtoken=jwt.sign(data,JWT_SECRET)
            return res.json({status:result.status,authtoken})
        }
        else{
            return res.status(500).json(result) 
        }

    }
    catch(error){
        return res.status(500).json({status:false,error})
    }  

})


//Route 3: Getting info of logged in User via authtoken
router.get('/getuser',fetchuser,async(req,res)=>{
    try {
        const userId=req.user.id
        const id=userId.split(':')[2]
        const result=await userModel.findById(id)
        if(result.status){
            return res.json(result.response)
        }
        
    } catch (error) {
        return res.status(401).json({status:false,message:"Can not get a user!!"})
    }
})





module.exports=router