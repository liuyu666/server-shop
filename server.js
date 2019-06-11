const { User,Goods } = require("./models.js")

const express = require("express")
const session = require("express-session")
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

// app.use(session({
//     secret :  'secret', // 对session id 相关的cookie 进行签名
//     resave : true,
//     saveUninitialized: false, // 是否保存未初始化的会话
//     cookie : {
//         maxAge : 1000 * 60 * 3, // 设置 session 的有效时间，单位毫秒
//     },
// }));



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

app.post("/api/showgoods",async(req,res)=>{
    // let page = parseInt(req.body.page)
    // let pageSize = parseInt(req.body.pageSize)
    // let sort = parseInt(req.body.sort)
    // let skip = page*pageSize
    console.log(req.body.pageSize)
    const goods = await Goods.find()
    // 翻页以后再添加
    // .skip(skip).limit(pageSize);
    // 排序方法一
    // if(sort==1){
    //     goods.sort(function(a,b){
    //         return a["price"]-b["price"]
    //     });
    // }else if(sort==2){
    //     goods.sort(function(a,b){
    //         return b["price"]-a["price"]
    //     });
    // }
    // console.log(goods)
    res.send(goods)
})

// 价格区间请求
app.post("/api/goodsection",async(req,res)=>{
    let begin = parseInt(req.body.begin)
    let end = parseInt(req.body.end)
    console.log(req.body)
    const goods = await Goods.find({ "price" : { "$gte" : begin
    , "$lt" : end } })
    
    console.log(goods)
    res.send(goods)
})


app.post("/api/register",async(req,res)=>{
    // models中定义了什么字段，此处传递什么字段
    // console.log(req.body)
    // 往数据库里创建加入用户
    const user = await User.create({
        username:req.body.username,
        password:req.body.password,
        orderList:[],
        cartList:[],
        addressList:[]
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
    const goods = await Goods.find().where({
        user:req.user
    })
    return res.send(goods)
})

// 添加购物车选项
app.post("/api/addcart",async(req,res)=>{
    // console.log(req.session.userId)
    let userId = req.body.userId,productId = req.body._id,change = req.body.change;
    // console.log(userId,productId,change)
    console.log(change)
    await User.findOne({_id:userId},(err,userDoc)=>{
        if(err){
            res.json({
                status:1,
                msg:err.message
            })
        }else{
            // console.log("userDoc:"+userDoc)
            if(userDoc){
                let goodsItem = "";
                // 循环用户的商品购物车列表
                userDoc.cartList.forEach(item => {
                    if(item.productId == productId){
                        console.log(change)
                        // console.log(item.productNum)
                        if(change==1){
                            goodsItem = item;
                            item.productNum--;
                        }else{
                            goodsItem = item;
                            item.productNum++;
                        }
                    }
                });
                if(goodsItem){
                    userDoc.save((err1,doc1)=>{
                        if(err1){
                            res.json({
                                status:1,
                                msg:err.message
                            })
                        }else{
                            res.json({
                                status:0,
                                result:"success"
                            })
                        }
                    })
                }else{
                    Goods.findOne({_id:productId},(err,doc)=>{
                        if(err){
                            res.json({
                                status:1,
                                msg:err.message
                            })
                        }else{
                            if(doc){
                                // console.log(userDoc.cartList)
                                // console.log("doc:"+doc)
                                let newobj = {//新创建一个对象，实现转换mongoose不能直接增加属性的坑
                                    productNum: "1",
                                    checked: "1",
                                    productId: doc._id,
                                    price: doc.price,
                                    title: doc.title,
                                    goodsSrc: doc.goodsSrc,
                                }
                                userDoc.cartList.push(newobj);
                                userDoc.save((err1,doc1)=>{
                                    if(err1){
                                        res.json({
                                            status:1,
                                            msg:err.message
                                        })
                                    }else{
                                        res.json({
                                            status:0,
                                            msg:'err.message',
                                            result:"success"
                                        })
                                    }
                                })
                            }
                        }
                    })
                }
                
            }
        }
    })
})


// 显示购物车列表
app.post("/api/goodscart",async (req,res)=>{
    let userId = req.body.userId;
    // console.log(userId)
    const goods = await User.findOne({_id:userId},{"cartList":1})
    // console.log(goods)
    res.json(goods)
})

app.listen("3000",(req,res)=>{
    console.log("running at http://localhost:3000")
})