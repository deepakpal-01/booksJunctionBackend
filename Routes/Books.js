const express=require('express')
const router=express.Router()
const BookModel=require('../Models/BookModel')
const fetchuser = require('../Middleware/fetchuser')


router.get('/getallbooks',fetchuser,async(req,res)=>{
    try {
        const result=await BookModel.getAllBooks(req.user)
        return res.send(result)
    } catch (error) {
        return res.status(500).send({status:false,error})
    }
}) 
router.post('/addbook',fetchuser,async(req,res)=>{
    try {
        const book={
            "title":req.body.title,
            "description":req.body.description,
            "category":req.body.category,
            "price":req.body.price,
            "discount":req.body.discount,
            "userid":req.user.id.split(':')[2]
        }
        const result=await BookModel.addBook(req.user,book)
        return res.send(result)
    } catch (error) {
        return res.status(500).send({status:false,error:"Book not added"})
    }
})
router.put('/editbook/:id',fetchuser,async(req,res)=>{
    try {
        const userid=req.user.id.split(':')[2]
        const updatedBook={
        "title":req.body.title,
        "description":req.body.description,
        "category":req.body.category,
        "price":req.body.price,
        "discount":req.body.discount,
        "userid":req.user.id.split(':')[2]
    }
    const result=await BookModel.editBook(userid,req.params.id,updatedBook)
    return res.send(result)
    } catch (error) {
        return res.status(500).send(result,error)
    }
    
})
router.delete('/deletebook/:id',fetchuser,async(req,res)=>{
    try {
        const userid=req.user.id.split(':')[2]
    const result=await BookModel.deleteBook(userid,req.params.id)
    return res.send(result)
    } catch (error) {
        return res.status(500).send(result)
    }
})



module.exports=router