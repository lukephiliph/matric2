const { response } = require('express');
var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')
const adminHelper=require('../helpers/admin-helpers')
/* GET users listing. */

router.get('/',function(req,res){

  res.render('admin/adminlogin')    
})
router.post('/adminlogin',function(req,res){
  res.redirect('/admin/view-products')
})

router.get('/add-product',async function(req,res){
  await adminHelper.getCategory().then((category)=>{
    res.render('admin/add-product',{category})
  })

  
})
router.post('/add-product',async(req,res)=>{
    productHelpers.addProduct(req.body,(id)=>{
      let image=req.files.Image
      console.log(id)
            image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
        if(!err){res.redirect('/admin/view-products')}
        else{console.log(err)}
      })  
       
    })  
}) 

router.get('/delete-product/:id',(req,res)=>{
      let proId=req.params.id
      console.log(proId)
      productHelpers.deleteProduct(proId).then((response)=>{
        res.redirect('/admin/view-products')
      })
})

router.get('/edit-product/:id',async(req,res)=>{
  let product= await productHelpers.getProductDetails(req.params.id)
  await adminHelper.getCategory().then((category)=>{
    res.render('admin/edit-product',{product,category})
  })
})
 
router.post('/edit-product/:id',(req,res)=>{
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{
    let id=req.params.id
    res.redirect('/admin/view-products')
    try{
      if(req.files.Image){
      let image=req.files.Image
      image.mv('./public/product-images/'+id+'.jpg')
    }

    }catch{

    }
    
  })  
})
router.get('/view-users', function(req, res, next) {
  userHelpers.getAllUsers().then((users)=>{
    res.render('admin/view-users',{users})
  })
  
})



router.get('/view-products',(req,res)=>{
  productHelpers.getAllProducts().then((products)=>{
    res.render('admin/view-products',{admin:true,products})
  }) 
})




router.post('admin/view-products',(req,res)=>{
  try{
    res.redirect('admin/view-products')
  }catch{
    console.log('err')
  }
  
})








router.post('/adsignup',(req,res)=>{
  adminHelper.adminSignup(req.body).then((response)=>{
    console.log(response)
   
  })
})    


router.get('/signup',function(req,res){

  res.render('admin/signup')
})
   
router.get('/view-orders',(req,res)=>{
    orders=adminHelper.getOrders().then((orders)=>{
    res.render('admin/view-orders',{orders})  
  })
})
router.get('/chart',async(req,res)=>{
  orders=await adminHelper.Chartdata().then((orders)=>{
    res.render('admin/chart',{orders})  
    console.log(orders)
  })
  
})


router.get('/add-category',function(req,res){
res.render('admin/add-category')
})

router.post('/add-category',async function(req,res){
  await adminHelper.addCategory(req.body).then((response)=>{
    res.redirect('/admin/add-category')
  })
  console.log(req.body)
})

router.get('/add-coupens',function(req,res){
  res.render('admin/coupens')
  })

  router.post('/add-coupens',async function(req,res){
    await adminHelper.addCoupens(req.body).then((response)=>{
      res.redirect('/admin/add-coupens')
    })
  })



module.exports = router; 
 