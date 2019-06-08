const { User,Goods } = require("./models.js")

const express = require("express")
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')

const SECRET = "iubeibwiusmwoi"
const app = express()
app.use(express.json())//允许使用json解析
app.use(bodyParser.urlencoded());


var urlencodedParser = bodyParser.urlencoded({extended: false});

// 先加头部信息
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    //Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', '*');
    // res.header('Content-Type', 'application/json;charset=utf-8');
    next();
});


app.get("/",async(req,res)=>{
    // 操作数据库
    const users = await User.find()
    res.send(users)
})

app.get("/api/users",async(req,res)=>{
    // 操作数据库
    const users = await User.find()
    res.send(users)
})

app.get("/api/showgoods",async(req,res)=>{
    const goods = await Goods.find()
    res.send(goods)
})


app.post("/api/register",async(req,res)=>{
    // models中定义了什么字段，此处传递什么字段
    // console.log(req.body)
    // 往数据库里创建加入用户
    const user = await User.create({
        username:req.body.username,
        password:req.body.password
    })
    .catch((err)=>err);
    // console.log(req.body.password)
    res.send(user)
})


app.post("/api/addgoods",async(req,res)=>{
    // models中定义了什么字段，此处传递什么字段
    // console.log(req.body)
    // 往数据库里创建加入用户
    const goods = await Goods.create({
        title:req.body.title,
        goodsSrc:req.body.goodsSrc,
        price:req.body.price,
        num:req.body.num
    })
    res.send(goods)
})


// 登陆
app.post("/api/login",async(req,res)=>{
    const user= await User.findOne({
        username:req.body.username
    })
    if(!user){
        return res.status(422).send({
            message:"用户不存在"
        })
    }
    const isPasswordValid = require("bcryptjs").compareSync(
        req.body.password,
        user.password
    )
    if(!isPasswordValid){
        return res.status(422).send({
            message:"密码无效"
        })
    }
    //生成token，客户端后续请求加入
    // 用户id生成token
    const token = jwt.sign({
        id:String(user._id)
    },SECRET)

    res.send({
        user,
        token:token
    })
})

// 中间件
const auth = async(req,res,next)=>{
    const raw = String(req.headers.authorization).split(' ').pop()
    const {id} = jwt.verify(raw,SECRET)
    req.user = await User.findById(id)
    next()
}

app.get("/api/profile",auth,async(req,res)=>{
    // const orders = await orders.find().where({
    //     user:req.user._id
    // })
    return res.send(req.user)
})


// app.post("/api/join",urlencodedParser,async(req,res)=>{
//     // models中定义了什么字段，此处传递什么字段
//     // console.log(req.body)
//     // 往数据库里创建加入用户
//     const user = await clientU.findOne({
//         username:req.body.username
//     })
//     if(!req.body) return res.sendStatus(400);
//     res.send(user);
    
//     // res.send(user)
// })

app.listen("3000",(req,res)=>{
    console.log("running at http://localhost:3000")
})