const express = require('express')
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//#region Set up the app
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname,"templates")))

const PORT = process.env.PORT || 3000

app.listen(PORT,()=> {
        console.log(`Server is running at port: ${PORT}!`)
})
const salt = bcrypt.genSaltSync(8);


//#region Setting up mongoose mapping
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/logi_db',{useNewUrlParser: true , useUnifiedTopology: true})
    .then(()=>{console.log("You are now connect to database!")})
    .catch((err)=> console.log(err))

const UserSchema = new mongoose.Schema({
    _id: String,
    First_Name: String,
    Last_Name: String,
    Salary: String,
    Department: String
})

User = mongoose.model('User',UserSchema);

//#endregion

//#endregion

//#region Get all employees
app.get("/api/users",(req,res,next)=>{
    User.find((err,data)=> {
        if(err) return next(err)
        res.json(data);
    })
})
//#endregion

//#region Find 1 by id
app.get("/api/users/:id",async (req,res,next)=>{
    let id = req.params.id;
    let object = await Employee.findById(id)
    res.json(object);
})
//#endregion

//#region Delete employee
app.delete("/api/users/:id",verifyToken,(req,res,next)=>{
    let id = req.params.id;
    User.findByIdAndRemove(id,(err,object)=> {
        if(err) return next(err)
        res.json(object);
    })
})
//#endregion

//#region Post NEW employee
app.post("/api/users",verifyToken,(req,res,next)=>{
    console.log("POST /api/users");
    let create_object;
    if(req.body!==undefined){
        create_object = req.body;
    }
    User.create(create_object,(err,object)=> {
        if(err) return next(err)
        res.json(object);        
    })
})
//#endregion

//#region Updating Employee
app.put("/api/users/:id",(req,res,next)=>{
    let id = req.params.id;
    let updated_object;
    if(req.body!==undefined){
        updated_object = req.body;
    }
    User.findByIdAndUpdate(id,updated_object,(err,object)=> {
        if(err) return next(err)
        res.json(object);        
    })
})

//#endregion

//#region Authentication
let apiusers = [
   {'id':1,'username':'admin','password':'admin'}
]

app.post('/register',(req,res)=>{
    let user = req.body;
    if(user==null || user==undefined){
        res.status(401).send("Invalid user!")
    }
    user.id = apiusers.length+1;
    apiusers.push(user);
    res.status(200).send({'msg':'You have been successfully registered!'})
});

app.post('/login',(req,res)=>{
    let user= req.body;
    if(user==null || user==undefined){
        res.status(401).send("Invalid user!")
    }
    let valid = false;
    let userID = 0;
    for(let i=0;i<users.length;i++){
        if(user.username==apiusers[i].username     
            && user.password == apiusers[i].password){
                valid= true;
                userID = users[i].id
            }
    }
    if(valid) {
        let payload = {subject:userID}
        let token = jwt.sign(payload,'secretKey');
        res.status(200).send({token})
    } else {
        res.status(401).send("Invalid username or password!")
    }

})

function verifyToken(req,res,next){
    if(!req.headers.authorization){
        return res.status(401).send('Unauthorized request')
    }
    let token = req.headers.authorization.split(' ')[1];
    if(token === null){
        return res.status(401).send('Unauthorized request')
    }
    let validtoken = jwt.verify(token,'secretKey');
    if(!validtoken){
        return res.status(401).send('Unauthorized request')
    }
    next();
}

app.get('/users',verifyToken,(req,res)=>{
    res.json(apiusers)
})

//#endregion