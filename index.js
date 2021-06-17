const express = require('express')
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//#region Set up the app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))


app.use(express.static(path.join(__dirname,"templates")))

const PORT = process.env.PORT || 3000

app.listen(PORT,()=> {
        console.log(`Server is running at port: ${PORT}!`)
})
const salt = "$2b$08$WZ8EEq.ln5EGCFX2";


//#region Setting up mongoose mapping
const mongoose = require('mongoose');
const { create } = require('domain');

mongoose.connect('mongodb://localhost/logi_db',{useNewUrlParser: true , useUnifiedTopology: true})
    .then(()=>{console.log("You are now connect to database!")})
    .catch((err)=> console.log(err))

const UserSchema = new mongoose.Schema({
    _id: {type: mongoose.Types.ObjectId, auto: true},
    login_id: String,
    hashed_password: String,
    email: String,
    contacts: [{
        title: String,
        first_name: String,
        last_name: String,
        mobile_phone: String,
        office_phone: String,
        office_ext: String,
        fax: String,
        toll_free: String,
        toll_free_ext: String,
        email: String,
    }],
    notes: [{
        time_stamp: String,
        body: String,
    }],
    provider: [{
        name: String,
        address_line1: String,
        address_line2: String,
        address_line3: String,
        country: String,
        city: String,
        state: String,
        zip_code: String,
        phone: String,
        phone_ext: String,
        fax: String,
        toll_free: String,
        email: String,
        primary_contact: String,
        time_zone: String,
        hour_start: Number,
        hour_end: Number,
        active: Boolean,
        rate_signed: Boolean,
        primary: Boolean
    }]
})


User = mongoose.model('User',UserSchema);

//#endregion

//#endregion

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


//#region Get all employees
app.get("/api/users",(req,res,next)=>{
    User.find((err,data)=> {
        if(err) return next(err)
        res.json(data);
    })
})
//#endregion

/*
//#region Find 1 by id
app.get("/api/users/:id",async (req,res,next)=>{
    let formatted_id = mongoose.Types.ObjectId(req.params.id);
    let object = await User.findById(formatted_id).exec();
    res.json(object);
})
//#endregion
*/

//#region Find 1 by loginid
app.get("/api/users/:id",async (req,res,next)=>{
    console.log("GET by loginid")
    try {
        let object = await User.find({ _id:  req.params.id }).exec();
        console.log("Returning: " + object)
        res.json(object);
    } catch (err) {
        res.json({message: err});
    }
    
})
//#endregion



//#region Post check login (NEEDS TESTING)
app.post("/api/users/login",async (req,res) => {
        //req.body should contain a login_id, and password
    //let hashpass = bcrypt.hashSync(req.body.password, salt);
    try {
        console.log("POST /api/users/login");
        let result = req.body;

        console.log("request body: " + result);
        console.log("req body login id :" + result.login_id);
        console.log("req body hashedpass: " + result.hashed_password);
        let object = await User.find({ login_id: result.login_id }).exec().
                    then(
                        matches => {
                            if (matches.length < 1) {
                                return res.status(401).json({message: 'Login Failed.'});
                            }
                            else {
                                // console.log("Comparing BCRYPT from body: " + req.body.hashed_password);
                                // console.log("With stored hashedpass: " + matches[0].hashed_password); 
                                // console.log("BEFORE BCRYPT COMPARE");
                                bcrypt.compare(req.body.hashed_password, 
                                    matches[0].hashed_password, function (err,hashresult) {
                                        console.log("In BCRYPT COMPARE");
                                        console.log("hashresult = " + hashresult);
                                        if (err) {
                                            console.log("in if(err) tree");
                                            return res.status(401).json({message: 'Login Failed.'});
                                        }
                                        if (hashresult) {
                                            console.log("Hash success");
                                            console.log("Returning object: " + matches[0]);
                                            return res.status(200).json(matches[0])
                                        } else {
                                            console.log("Hash failure");
                                            return res.status(401).json({message:'Login Failed.'});
                                        }
                                
                                        // console.log("after both err and hashresult");
                                        // return res.status(401).json({message: 'Login Failed.'});
                                    }
                                );
                                console.log("AFTER BCRYPT COMPARE");
                            }
                        }
                    );
    } catch (err) {
        res.json({message:err});
    }
})
//#endregion


app.post("/api/users/lostpass",async (req,res)=>{
    //req.body should contain a login_id, and password
//let hashpass = bcrypt.hashSync(req.body.password, salt);
try {
    console.log("POST /api/users/lostpass");
    let result = req.body;
    
    console.log("request body: " + result);
    console.log("req body login id :" + result.login_id);
    console.log("req body hashedpass: " + result.email);
    let object = await User.find({ login_id: result.login_id, email: result.email }).exec().
        then(
            matches => {
                if (matches.length < 1) {
                    return res.status(401).json({message: 'No matches found'});
                }
                else {
                   return res.status(200).json(object);
                    
                } 
            }
        );
} catch (err) {
    res.json({message:err});
}
});

//#region Post NEW user
app.post("/api/users/register",verifyToken,(req,res,next)=>{
    console.log("POST /api/users");
    let create_object;

    var hashpass;

    bcrypt.hash(req.body.hashed_password, 10, function(err, hash) {
        if(err) console.log("ERROR HASHING");
        else {
            hashpass = hash;
            console.log("Hash complete: hash produced = " + hash);

            if(req.body!==undefined){
                create_object = req.body;
            }
            
            create_object.hashed_password = hashpass;
            console.log("create_object is " + create_object);
            User.create(create_object,(err,object)=> {
                if(err) return next(err)
                res.json(object);        
            })
        }
    });


})
//#endregion

//#region Delete user
app.delete("/api/users/:id",verifyToken,(req,res,next)=>{
    let id = req.params.id;
    User.findByIdAndRemove(id,(err,object)=> {
        if(err) return next(err)
        res.json(object);
    })
})
//#endregion

//#region Post NEW user
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

//#region Updating user
app.put("/api/users/:id",(req,res,next)=>{
    let received_object = JSON.stringify(req.body);
    console.log("parsed received object: " + received_object);
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Origin, Content-Type, Accept, Accept-Language, Origin, User-Agent');
    console.log("PUT /api/users/:id");
    let id = req.params.id;

    console.log("Updated notes: " + req.body.notes);
    for(var i in req.body.notes) {
        console.log(i.time_stamp);
        console.log(i.body);
    }

    let updated_object;
    if(req.body!==undefined){
        updated_object = req.body;
    }
    User.findByIdAndUpdate(id,updated_object,(err,object)=> {
        if(err) { 
            return next(err)
        }
        else {
            console.log("Updated: " + object);
            res.json(object); 
        }       
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
    for(let i=0;i<apiusers.length;i++){
        if(user.username==apiusers[i].username     
            && user.password == apiusers[i].password){
                valid= true;
                userID = apiusers[i].id
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