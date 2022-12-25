
var db=require('../config/connection')
var collection=require('../config/collections')
var objectId=require('mongodb').ObjectId
module.exports={
    addProduct:(product,callback)=>{
        
        db.get().collection('product').insertOne(product)
        console.log(product)
        callback(product._id)
    } ,
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            console.log(proId)
            console.log(objectId(proId))
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(proId)}).then((response)=>{
                resolve(response) 
            })
        }) 
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product) 
            })
        })
    },
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
                $set:{
                    Name:proDetails.Name,
                    Description:proDetails.Description,
                    Price:proDetails.Price,
                    Category:proDetails.Category
                }
            }).then((response)=>{
                resolve()    
            })
        })
    },
    getSelectedProducts:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product) 
            })
        
        })
    },cancelOrder:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({_id:objectId(userId)},{
                $set:{
                    status:"cancelled" 
                }
            }).then((response)=>{
                resolve()
            })
        })
    },
    placeOrder:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({_id:objectId(userId)},{
                $set:{
                    status:"placed"
                }
            }).then((response)=>{
                resolve()
            })   
        })
    },
    shipOrder:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({_id:objectId(userId)},{
                $set:{
                    status:"shipped"
                }
            }).then((response)=>{
                resolve()
            })
        })         
    },
    deliverOrder:(userId)=>{   
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({_id:objectId(userId)},{
                $set:{
                    status:"delivered"
                }
            }).then((response)=>{
                resolve()
            })
        })
    }
    
}          