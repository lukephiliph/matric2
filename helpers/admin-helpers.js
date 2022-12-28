var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { response } = require('express')
var objectId=require('mongodb').ObjectId
module.exports={
    adminSignup:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            adminData.Password=await bcrypt.hash(adminData.Password,10)
            db.get().collection(collection.ADMIN_COLLECTION)
            .insertOne(adminData)
            .then((data)=>{resolve(data)
             })
            
        })
         
    },doAdLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
                let response={}
                
            let user=await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:userData.email})
            console.log(user)
            if(user){
                bcrypt.compare(userData.password,user.Password).then((status)=>{
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
    getOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            resolve(orders)
        })

      },
      addCategory:(details)=>{
        return new Promise(async(resolve,reject)=>{
            let category=await db.get().collection(collection.CATEGORY_COLLECTION).insertOne(details).then((response)=>{
                resolve(response)
            })
        })
      },
      getCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            let category= await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(category)
            console.log(category)
        })
      },
      addCoupens:(details)=>{
        return new Promise(async(resolve,reject)=>{
            let coupen=await db.get().collection(collection.COUPEN_COLLECTION).insertOne(details).then((response)=>{
                resolve(response)
            })
        })

      },
      Chartdata:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders=await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            console.log(orders)
            resolve(orders)
        })

      },
      addBanner: (banner) => {
        return new Promise((resolve, reject) => {
          db.get()
            .collection(collection.BANNER_COLLECTION)
            .insertOne({ name: banner.name })
            .then((data) => {
              resolve(data.insertedId);
            });
        });
      },
      getAllbanner:()=>{
        return new Promise(async(resolve,reject)=>{
            let banner = await db.get().collection(collection.BANNER_COLLECTION)
            .find().toArray()
            resolve(banner)
        })
    },

    deletebanner:(catId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.BANNER_COLLECTION)
        .deleteOne({_id:objectId(catId)}).then((response)=>{
            resolve(response)
        })
    })
},
getAllOrders:(userId)=>{
    return new Promise(async(resolve,reject)=>{
    let totalorders=await db.get().collection(collection.ORDER_COLLECTION)
        .aggregate([
            {
                $group:{_id:"",count:{$sum:1}}
            }
        ]).toArray()
           
            resolve(totalorders[0].count)
            console.log(totalorders[0].count);
        })
    },
    getTotalAmount:()=>{
        return new Promise(async(resolve,reject)=>{
            let totalAmount =await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{status:"placed"}
                },
                // {
                //     $project:{_id:0,status:1,totalAmount:1}
                // },
                {
                    $group:{_id:"status",total:{$sum:"$totalAmount"}}
                }
            ]).toArray()
            console.log(totalAmount)
            resolve(totalAmount[0].total)
           
        })
    },
    getcanceledOrder:()=>{
        return new Promise(async(resolve,reject)=>{
            let totalAmount =await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{status:"cancelled"}
                },
                // {
                //     $project:{_id:0,status:1,totalAmount:1}
                // },
                {
                    $group:{_id:"status",total:{$sum:"$totalAmount"}}
                }
            ]).toArray()
            console.log(totalAmount)
            resolve(totalAmount[0].total)
           
        })
    },cancelOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
        let totalorders=await db.get().collection(collection.ORDER_COLLECTION)
            .aggregate([
                {
                    $match:{status:"cancelled"}
                },
                {
                    $group:{_id:"",count:{$sum:1}}
                }
            ]).toArray()
               
                resolve(totalorders[0].count)
                console.log(totalorders[0].count);
            })
        },getOrderDate:()=>{
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
        }

 
}