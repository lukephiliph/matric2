var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { response, request } = require('express')
var objectId=require('mongodb').ObjectId
var Razorpay=require('razorpay')
const { resolve } = require('path')
var instance=new Razorpay({
  key_id:'rzp_test_KQ55U4ZSmUGOFn',
  key_secret:'BVPV0TZMDG6IdipBw05fCk26'
})
module.exports={
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.Password=await bcrypt.hash(userData.Password,10)
            db.get().collection(collection.USER_COLLECTION)
            .insertOne(userData)
            .then((data)=>{resolve(data)
             })
            
        })
         
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
                let response={}
                
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){
                bcrypt.compare(userData.Password,user.Password).then((status)=>{
                    if(status){
                        console.log("login success")
                        response.user=user
                        response.status=true
                        resolve(response)
                    }else{
                        console.log("login err")
                        resolve({status:false})
                    }
                })
            }else{
                console.log("login failed")
                resolve({status:false})
            }
        })
    },
    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let user=await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(user)
        })
    },
    addToCart: (proId, userId) => {
        let proObj = {
          item: objectId(proId),
          quantity: 1,
        };
        return new Promise(async (resolve, reject) => {
          let userCart = await db
            .get()
            .collection(collection.CART_COLLECTION)
            .findOne({ user: objectId(userId) });
          if (userCart) {
            let proExist = userCart.products.findIndex(
              (product) => product.item == proId
            );
            console.log(proExist);
            if (proExist != -1) {
              db.get()
                .collection(collection.CART_COLLECTION)
                .updateOne(
                  { user: objectId(userId), "products.item": objectId(proId) },
                  {
                    $inc: { "products.$.quantity": 1 },
                  }
                )
                .then(() => {
                  resolve();
                });
            } else {
              db.get()
                .collection(collection.CART_COLLECTION)
                .updateOne(
                  { user: objectId(userId) },
                  {
                    $push: { products: proObj },
                  }
                )
                .then((response) => {
                  resolve();
                });
              }}else{
             let cartObj = {
              user: objectId(userId),
              products: [proObj],
            };
            db.get()
              .collection(collection.CART_COLLECTION)
              .insertOne(cartObj)
              .then((response) => {
                resolve();
              });
        }})
        
      },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
          let cartItems = await db
            .get()
            .collection(collection.CART_COLLECTION)
            .aggregate([
              {
                $match: { user: objectId(userId) },
              },
              {
                $unwind: "$products",
              },
              {
                $project: {
                  item: "$products.item",
                  quantity: "$products.quantity",
                  
                },
              },
              {
                $lookup: {
                  from: collection.PRODUCT_COLLECTION,
                  localField: "item",
                  foreignField: "_id",
                  as: "product",
                },
              },
              {
                $project: {
                  item: 1,
                  quantity: 1,
                  product: { $arrayElemAt: ["$product", 0] },
                },
              },
            ])
            .toArray();
            console.log(cartItems)
          resolve(cartItems);
        });
      },
      getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            count=0
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            if(cart){
                count=cart.products.length
            }
            resolve(count)
        })
      },
      removeproduct:(data)=>{
        return new Promise(async(resolve,reject)=>{
          await db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(data.cart)},
          {
            $pull:{products:{item:objectId(data.product)}}
          }).then((response)=>{
            resolve({removeproduct:true})
          })
        
        })
      },
      changeproductQuantity:(details)=>{
        details.count=parseInt(details.count)
       details.quantity=parseInt(details.quantity)
        return new Promise((resolve,reject)=>{
          if(details.count==-1&&details.quantity==1){
            db.get().collection(collection.CART_COLLECTION).updateOne({_id:objectId(details.cart)},
            {
              $pull:{products:{item:objectId(details.product)}}
            }).then((response)=>{
              resolve({removeProduct:true})
            })
          }else{
            db.get().collection(collection.CART_COLLECTION).updateOne({_id: objectId(details.cart),'products.item':objectId(details.product)},
            {
              $inc:{'products.$.quantity':details.count}
            }).then((response)=>{
              resolve({status:true})
            })
          }
          
        })


        
      },
      getTotalAmount:(userId)=>{
        return new Promise(async (resolve, reject) => {
          let totalAmount = await db
            .get()
            .collection(collection.CART_COLLECTION)
            .aggregate([
              {
                $match: { user: objectId(userId) },
              },
              {
                $unwind: "$products",
              },
              {
                $project: {
                  item: "$products.item",
                  quantity: "$products.quantity",
                 
                },
              },
              {
                $lookup: {
                  from: collection.PRODUCT_COLLECTION,
                  localField: "item",
                  foreignField: "_id",
                  as: "product",
                  
                },
              },
              {
                $project: {
                  item: 1,
                  quantity: 1,
                  product: { $arrayElemAt: ["$product", 0] },
                },
              },
              {
                $group:{
                      _id:null,
                      totalAmount:{ $sum:{ $multiply:['$quantity',{$toInt:'$product.Price'}]}}
                }
              }
            ]).toArray();  
            try{ resolve(totalAmount[0].totalAmount)}catch{
              resolve(0)
            }
             
            
              
        })
     
      },
      placeOrder:(order,products,total)=>{
        try{
          return new Promise((resolve,reject)=>{
            console.log(order,products,total)
            let status=order['payment-method']==='COD'?'placed':'pending'
            let orderObj={
              deliveryDetails:{
                mobile:order.Phone,
                address:order.Address,
                pincode:order.PIN,
                country:order.Country
              },
              userId:objectId(order.userId),
              paymentMethod:order['payment-method'],
              products:products,
              status:status,
              totalAmount:total,
              date:new Date().toLocaleDateString()
            }
            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response)=>{
              db.get().collection(collection.CART_COLLECTION).deleteOne({user:objectId(order.userId)})
              console.log("order",response.insertedId)
              resolve(response.insertedId)
            })
          })   
        }catch{}           
                    
      },     
      getCartProductList:(userId)=>{
        try{
          return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})
            resolve(cart.products)
          }) 
        }catch{}  
      },
      getUserOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
          let orders=await db.get().collection(collection.ORDER_COLLECTION)
          .find({userId:objectId(userId)}).toArray()
          resolve(orders)
        })
      },
      getOrderProducts:(orderId)=>{
        return new Promise(async (resolve, reject) => {
          let orderItems = await db
            .get()
            .collection(collection.ORDER_COLLECTION)
            .aggregate([
              {
                $match: { _id: objectId(orderId) },
              },
              {
                $unwind: "$products",
              },
              {
                $project: {
                  item: "$products.item",
                  quantity: "$products.quantity",
                  
                },
              },
              {
                $lookup: {
                  from: collection.PRODUCT_COLLECTION,
                  localField: "item",
                  foreignField: "_id",
                  as: "product",
                },
              },
              {
                $project: {
                  item: 1,
                  quantity: 1,
                  product: { $arrayElemAt: ["$product", 0] },
                },
              },
            ])
            .toArray();
            console.log(orderItems)
          resolve(orderItems);
        });    

      },
      generateRazorpay:(orderId,total)=>{
        return new Promise((resolve,reject)=>{
          var options={
            amount:total*100,   
            currency:"INR",
            receipt:""+orderId
          }
          console.log(options)
          instance.orders.create(options,function(err,order){
            if(err){
              console.log(err)
            }else{
              console.log("Order :" ,order)
              resolve(order)
            }
            
          })   

        })
      },
      verifypayment:(details)=>{
        return new Promise((resolve,reject)=>{
          const crypto=require('crypto')
          let hmac=crypto.createHmac('sha256','BVPV0TZMDG6IdipBw05fCk26')
          hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
          hmac=hmac.digest('hex')
          if(hmac==details['payment[razorpay_signature]']){
            resolve()
          }else{
            reject()
          }
        })
      },
      changePaymentStatus:(orderId)=>{
        return new Promise((resolve,reject)=>{
          db.get().collection(collection.ORDER_COLLECTION)
          .updateOne({_id:objectId(orderId)},
          {
            $set:{
              status:'placed'
            }
          }
          ).then(()=>{
            resolve()
          })
        })
      },
        addToWishlist: (proId, userId) => {
          let proObj = {
            item: objectId(proId),
            quantity: 1,
          };
          return new Promise(async (resolve, reject) => {
            let userCart = await db        
              .get()
              .collection(collection.WISHLIST_COLLECTION)
              .findOne({ user: objectId(userId) });
            if (userCart) {
              let proExist = userCart.products.findIndex(
                (product) => product.item == proId
              );
              console.log(proExist);
              if (proExist != -1) {
                db.get()
                  .collection(collection.WISHLIST_COLLECTION)
                  .updateOne(
                    { user: objectId(userId), "products.item": objectId(proId) },
                    {
                      $inc: { "products.$.quantity": 1 },
                    }
                  )
                  .then(() => {
                    resolve();
                  });
              } else {
                db.get()
                  .collection(collection.WISHLIST_COLLECTION)
                  .updateOne(
                    { user: objectId(userId) },
                    {
                      $push: { products: proObj },
                    }
                  )
                  .then((response) => {
                    resolve();
                  });
                }}else{
               let cartObj = {
                user: objectId(userId),
                products: [proObj],
              };
              db.get()
                .collection(collection.WISHLIST_COLLECTION)
                .insertOne(cartObj)
                .then((response) => {
                  resolve();
                });
          }})
          
        },
        getWishlistProducts: (userId) => {
          return new Promise(async (resolve, reject) => {
            let cartItems = await db
              .get()
              .collection(collection.WISHLIST_COLLECTION)
              .aggregate([
                {
                  $match: { user: objectId(userId) },
                },
                {
                  $unwind: "$products",
                },
                {
                  $project: {
                    item: "$products.item",
                    quantity: "$products.quantity",
                    
                  },
                },
                {
                  $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: "item",
                    foreignField: "_id",
                    as: "product",
                  },
                },
                {
                  $project: {
                    item: 1,
                    quantity: 1,
                    product: { $arrayElemAt: ["$product", 0] },
                  },
                },
              ])
              .toArray();
              console.log(cartItems)
            resolve(cartItems);
          });
        },
        getcoupen:(details)=>{
          return new Promise(async(resolve,reject)=>{
            let coopenstatus=false
            try{
              let coupen=await db.get().collection(collection.COUPEN_COLLECTION).findOne( { CoupenCode:details.CoupenCode } ).then(()=>{
                coopenstatus=true
                if(coopenstatus){
                 details.total
                  
                }else{
                  totalAmount=details.total
                }
                resolve(totalAmount)
              }
              )
              console.log(coopenstatus)
             
            }catch{
              console.log("err")
            }
               
           
          })
            
         
        }
        
    
    
    
                
}                