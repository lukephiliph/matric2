
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
    returnOrder:(userId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({_id:objectId(userId)},{
                $set:{
                    status:"Return" 
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
                    status:"delivered",
                    dummy:"delivered"
                }
            }).then((response)=>{
                resolve()
            })
        })
    },
    getTotalAmount:()=>{
        return new Promise(async(resolve,reject)=>{
            let totalAmount =await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{status:"placed"}
                },
                {
                    $project:{_id:0,status:1,totalAmount:1}
                },
                {
                    $group:{_id:"status",total:{$sum:"$totalAmount"}}
                }
            ]).toArray()
            resolve(totalAmount[0].total)
           
        })
    },

    getTotalSales:()=>{
        return new Promise(async(resolve,reject)=>{
            let totalSales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{status:"placed"}
                },
                {
                    $project:{_id:0,status:1}
                },
                {
                    $group:{_id:"status",total:{$sum:1}}
                }
            ]).toArray()
            resolve(totalSales[0].total)
        })
    },

    getTotalOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let totalOrders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $group:{_id:"",count:{$sum:1}}
                }
            ]).toArray()
        resolve(totalOrders[0].count)
        })
        
    },

    getOrderCount:()=>{
        return new Promise(async(resolve,reject)=>{
            let orderCount = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $group:{_id:"$date", count:{$sum:1}}
                },
                {
                    $sort:{_id:-1}
                },
                {
                    $limit:5
                },
                {
                    $project:{_id:0,count:1}
                }

            ]).toArray()
            let count = [];
            let i;
            let n=orderCount.length
            for(i=0;i<n;i++){
             count[n-1-i]=orderCount[i].count
            }
            resolve(count)
        })
    },

    getOrderDate:()=>{
        return new Promise(async(resolve,reject)=>{
            let orderDate = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $group:{_id:"$date", count:{$sum:1}}
                },
                {
                    $sort:{_id:-1}
                },
                {
                    $limit:5
                },
                {
                    $project:{_id:1,count:0}
                }
            ]).toArray()
            console.log(orderDate)
            let count = [];
            let i;
            let n=orderDate.length
            for(i=0;i<n;i++){
             count[n-1-i]=orderDate[i]._id
            }
            let obj={}
            for(i=0;i<count.length;i++){
                obj[i]=count[i]

            }
            console.log(obj)
            resolve(obj)
        })
    },

    getSalesCount:()=>{
        return new Promise(async(resolve,reject)=>{
            let salesCount = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{status:"placed"}
                },
                {
                    $group:{_id:"$date",count:{$sum:1}}
                },
                {
                    $sort:{_id:-1}
                },
                {
                    $limit:5
                },
                {
                    $project:{_id:0,count:1}
                }
            ]).toArray()
            let count = [];
            let i;
            let n=salesCount.length
            for(i=0;i<n;i++){
             count[n-1-i]=salesCount[i].count
            }
            resolve(count)
        })
    },

    getSalesDetails:()=>{
        return new Promise(async(resolve,reject)=>{
          let products =await db.get().collection(collection.PRODUCT_COLLECTION)
            .find().toArray()
            resolve(products)
        })
    },

    getCodCount:()=>{
        return new Promise(async(resolve,reject)=>{
            let totalCount = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{paymentMethod:"COD"}
                },
                {
                    $group:{_id:'$COD',count:{$sum:1}}
                },
                {

                    $project:{_id:0,count:1}
                }
            ]).toArray()
            resolve(totalCount[0].count)
        })
    },
    getOnlineCount:()=>{
        return new Promise(async(resolve,reject)=>{
            let totalCount = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{paymentMethod:"ONLINE"}
                },
                {
                    $group:{_id:'$ONLINE',count:{$sum:1}}
                },
                {

                    $project:{_id:0,count:1}
                }
            ]).toArray()
            console.log(totalCount[0].count)
            resolve(totalCount[0].count)
        })
    }
}
    
        