// 数据库代码，数据操作
const mongoose = require("mongoose")

// 连接数据库
mongoose.connect('mongodb://localhost:27017/server-shop',{
    useNewUrlParser:true,
    useCreateIndex:true
})

// 用户 模型,实际上就是个集合或者SQL中的表
const userSchema = new mongoose.Schema({
    // unique意思是唯一
    username:{ 
        type: String , 
        index:{unique:true} 
    },
    password:{ 
        type: String,
        set(val){
            // console.log(require('bcrypt').hashSync(val,salt))
            return require("bcryptjs").hashSync(val, 8);
        }
    }
})


// const clientUserSchema = new mongoose.Schema({
//     username:{type:String},
//     password:{type:String}
// })

//商品集合
const goodSchema = new mongoose.Schema({
    title:{ type: String },
    goodsSrc:{ type: String },
    price:{ type: Number },
    num:{ type: Number }
})

const User = mongoose.model('User',userSchema)
const Goods = mongoose.model('Goods',goodSchema)
// const clientU = mongoose.model('clientU',clientUserSchema)
// 删除表
// User.db.dropCollection("users")

module.exports = { User,Goods }