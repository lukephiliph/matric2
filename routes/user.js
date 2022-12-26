const { response } = require('express');
var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers')
const userHelpers=require('../helpers/user-helpers')
const adminHelpers = require('../helpers/admin-helpers');
/* GET home page. */
const verifylogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }     
}
router.get('/', async function(req, res, next) {
  let user=req.session.user
  let cartCount=null
  if(req.session.user){
    cartCount=await userHelpers.getCartCount(req.session.user._id)
    
  }
  banner=await adminHelpers.getAllbanner()
  
  productHelpers.getAllProducts().then((products)=>{
    res.render('user/view-products',{products,user,cartCount,banner})
  })
            
})

router.get('/login',(req,res)=>{
  if (req.session.loggedIn) {
      res.redirect('/')   
  }else{
    
    res.render('user/login',{"loginErr":req.session.loginErr})
    req.session.loginErr=false
  }
      
})

  
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signup',(req,res)=>{
     userHelpers.doSignup(req.body).then((response)=>{
      console.log(req.body) 
      console.log(response)  
      req.session.loggedIn=true       
      req.session.user=response.user  
      res.redirect('/')    
    })
})  
router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{  
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user   
      res.redirect('/')
    }else{
      req.session.loginErr=true     
      res.redirect('/login')        
    }    
  })      
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/') 
})

router.get('/add-to-cart/:id',verifylogin,(req,res)=>{
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.redirect('/')
  })
}) 
router.get('/cart',verifylogin,async(req,res)=>{
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/cart',{products,user:req.session.user,total})
  // console.log(products._id)
  
})  
router.post('/remove-product',verifylogin,(req,res,next)=>{
        userHelpers.removeproduct(req.body).then((response)=>{
          console.log(req.body)
          res.json(response)
          console.log(response)
        })
  
})

router.post('/change-product-quantity',(req,res,next)=>{ 
  console.log(req.body)
  userHelpers.changeproductQuantity(req.body).then(async(response)=>{
    response.total=await userHelpers.getTotalAmount(req.session.user._id)
    res.json(response)     
   
  })
}) 
router.get('/place-order',verifylogin,async(req,res)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  let products=await userHelpers.getCartProducts(req.session.user._id)
  cartCount=await userHelpers.getCartCount(req.session.user._id)
  res.render('user/placeorder',{total,user:req.session.user,products,cartCount}) 
   
})     
    
   
 router.post('/place-order',async(req,res,next)=>{    
    let products=await userHelpers.getCartProductList(req.body.userId)
    let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
    userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
      if(req.body['payment-method']==='COD'){    
        res.json({codSuccess:true})
      }else{
         userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
          res.json(response)
      
         })
        
      } 
               
            
    })    
    
 })

 router.post('/verifypayment',(req,res)=>{
  userHelpers.verifypayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true})
    })
  }).catch((err)=>{
    res.json({status:false})
  })
  // console.log(req.body)
 })
 router.get('/order-success',async(req,res)=>{
  res.render('user/order-success',{user:req.session.user}) 
 })

router.get('/orders',async(req,res)=>{
  try{
    let orders=await userHelpers.getUserOrders(req.session.user._id)
    res.render('user/orders',{user:req.session.user,orders})
  }
    catch{console.log("err")}
  
})
router.get('/view-order-products/:id',async(req,res)=>{
  let products=await userHelpers.getOrderProducts(req.params.id)
  res.render('user/view-order-products',{user:req.session.user,products})
})


router.get('/add-to-wishlist/:id',verifylogin,(req,res)=>{
  userHelpers.addToWishlist(req.params.id,req.session.user._id).then(()=>{
    res.redirect('/')
  })      
})   
 
router.get('/wishlist',verifylogin,async(req,res)=>{  
  let products=await userHelpers.getWishlistProducts(req.session.user._id)  
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  console.log(products)
  res.render('user/wishlist',{products,user:req.session.user,total})
})

router.get('/profile',verifylogin,async(req,res)=>{
  userprofile=req.session.user
  res.render('user/profile',{userprofile})
  console.log(userprofile)
})

router.post('/profile',verifylogin,async(req,res)=>{
  userHelpers.updateuser(req.body,req.session.user._id).then((response)=>{
    res.redirect('/login')
  })
  console.log(req.session.user._id)
  console.log(req.body)
}) 


router.post('/coopen',async(req,res)=>{
  let totalPrice=await userHelpers.getTotalAmount(req.session.user._id)
  let coopen= await userHelpers.getcoupen(req.body,totalPrice).then((Price)=>{
    console.log("total"+Price)
    res.json({Price})      
  })  
}) 

router.route('/selectedpro/:id').get(verifylogin,async(req,res)=>{
  let products=await productHelpers.getSelectedProducts(req.params.id)
  res.render('user/selectedpro',{products})
})
router.get('/orders/:id',(req,res)=>{
  let userId=req.params.id
  productHelpers.cancelOrder(userId).then((response)=>{
    res.redirect('/orders')
  })
})    
    
module.exports = router;   
             