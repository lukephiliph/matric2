const mongoClient=require('mongodb').MongoClient
const state={
    db:null
}

module.exports.connect=function(done){
    const url='mongodb+srv://Amal:amal1234@cluster0.xibharg.mongodb.net/?retryWrites=true&w=majority'
    const dbname='shopping'

    mongoClient.connect(url,function (err, data) {
            if (err)    
                return done(err)
            state.db = data.db(dbname)
            done()
        })
        
}
   
module.exports.get=function(){
    return state.db
}      