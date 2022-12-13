var db=require('../config/connection')
var collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { response } = require('express')
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

      }

 
}