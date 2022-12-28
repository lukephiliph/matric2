const { response } = require('express');
var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')
const adminHelper=require('../helpers/admin-helpers');
const adminHelpers = require('../helpers/admin-helpers');
const admincontroller=require('../controllers/admincontroller')

/* GET users listing. */


router.get('/',function(req,res){
  
  res.render('admin/adminlogin')    
})
router.post('/adminlogin',function(req,res){
  req.session.loggedIn=true       
  req.session.admin=response.admin
  console.log(response.admin)
  res.redirect('/admin/view-products')
})

router.get('/add-product',async function(req,res){
  await adminHelper.getCategory().then((category)=>{
    res.render('admin/add-product',{admin:true,category})
  })

  
})

router.post('/add-product',async(req,res)=>{
     await productHelpers.addProduct(req.body,(id)=>{
      let image=req.files.Image
      let image2=req.files.Image2
         image.mv('./public/product-images/'+id+'.jpg'),image2.mv('./public/product-images2/'+id+'.jpg'),(err,done)=>{
        if(!err){res.redirect('/admin/add-products')}
        else{console.log(err)}
      }
       
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
    res.render('admin/edit-product',{admin:true,product,category})
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
router.route('/view-users').get(function(req, res, next) {
  userHelpers.getAllUsers().then((users)=>{
    res.render('admin/view-users',{admin:true,users})
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
   
router.get('/view-orders',async(req,res)=>{
  let totalAmount=await adminHelpers.getTotalAmount()
  let totalorders=await adminHelpers.getAllOrders()
  let cancelled=await adminHelpers.getcanceledOrder()
  let cancelOrders=await adminHelpers.cancelOrders()
  cancelOrders
  console.log(totalAmount)
    orders=adminHelper.getOrders().then((orders)=>{
    res.render('admin/view-orders',{admin:true,orders,totalAmount,totalorders,cancelled,cancelOrders})  
  }) 
})
router.get('/chart',async(req,res)=>{
  let totalAmount = await productHelpers.getTotalAmount()
  let totalSales = await productHelpers.getTotalSales()
  let totalOrders = await productHelpers.getTotalOrders()
  let orderDate = await productHelpers.getOrderCount()
  let date = await productHelpers.getOrderDate()
  let sales = await productHelpers.getSalesCount()
  let cod = await productHelpers.getCodCount()
  let online = await productHelpers.getOnlineCount()
  console.log("sales"+sales)
  console.log("totalSales"+totalSales)
  console.log("totalOrders"+totalOrders)
  console.log("orderDate"+orderDate)
  console.log("date"+date)
  console.log("cod"+cod )
  console.log("totalAmount"+totalAmount)
  
  res.render('admin/chart',{admin:true,totalAmount,totalSales,totalOrders,orderDate,date,sales,cod,online})
   
})              


router.get('/add-category',function(req,res){
res.render('admin/add-category',{admin:true})
})
     
router.post('/add-category',async function(req,res){
  await adminHelper.addCategory(req.body).then((response)=>{
    res.redirect('/admin/add-category')
  })
  console.log(req.body)
})
      
router.get('/add-coupens',function(req,res){
  res.render('admin/coupens',{admin:true})
  })   

  router.post('/add-coupens',async function(req,res){
    await adminHelper.addCoupens(req.body).then((response)=>{
      res.redirect('/admin/add-coupens')
    })
  })
  
  router.get('/block-user/:id',(req,res)=>{
    let userId=req.params.id
    userHelpers.blockUser(userId).then((response)=>{
      res.redirect('/admin/view-users')
    })     
  })
  
  router.get('/unblock-user/:id',(req,res)=>{
    let userId=req.params.id
    userHelpers.unBlockUser(userId).then((response)=>{
      res.redirect('/admin/view-users')
    })
  })  
  router.get('/add-banner',function(req,res){
    adminHelpers.getAllbanner().then((banner)=>{
  
    res.render('admin/add-banner',{admin:true,banner})
  })
  })
  
  router.post('/add-banner',function(req, res) {
    // console.log(req.body);
    // console.log(req.files.banner);
  
    adminHelpers.addBanner(req.body).then((id) => {
      console.log("Inserted Id : " + id);
      let banner = req.files.banner;
      try {
        banner.mv('./public/product-images/'+id+'.jpg');
        res.redirect("/admin/add-banner");
      } catch (err) {
        console.log(err);
      }
    });
  })
  router.get('/delete-banner/:id',(req,res)=>{
    let catId = req.params.id
    console.log(catId)
    adminHelpers.deletebanner(catId).then((response)=>{
      res.redirect('/admin/add-banner')
    })   
  })
  router.get('/orders',async(req,res)=>{
    console.log(req.session.user);
     let orders=await userHelpers.getUserOrders()
     console.log(orders);
     res.render('admin/orders',{admin:true,orders})
   })
   
   router.get('/cancel-order/:id',(req,res)=>{
     let userId=req.params.id
     productHelpers.cancelOrder(userId).then((response)=>{
       res.redirect('/admin/view-orders')
     })
   })
    
   router.get('/deliver-order/:id',(req,res)=>{
    let userId=req.params.id
    productHelpers.deliverOrder(userId).then((response)=>{
      res.redirect('/admin/view-orders')
    })
  })
                         
module.exports = router; 
                               

