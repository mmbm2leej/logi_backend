const bcrypt = require('bcrypt');

const password = "hellopass";

// Generate Salt
const salt = "$2b$08$WZ8EEq.ln5EGCFX2/Evyu.qEWCCxv0Zug.XCY2/";
console.log("salt = " + salt);

const testhash = bcrypt.hashSync(password, salt);// Synchronous BREAKING

console.log("Testhash: " + testhash);
// Hash Password
const hashedPass = "$2b$10$ImVx9Lv2HTtejR8hVm2EQeB2bcH4yHJEH/PaaUkbSV.u9BbI35SY2";

console.log(password);
console.log(hashedPass);

//ASYNCHRONOUS
//USE THIS
// bcrypt.hash(password, 10, function(err, hash) {
//     if(err) console.log("ERROR HASHING");
//     else {
//         console.log("Hash complete: hash produced = " + hash);
//     }
// });


bcrypt.compare(password, hashedPass, function (err,hashresult) {
        console.log("In BCRYPT COMPARE");
        console.log("hashresult = " + hashresult);
        if (err) {
            console.log("in if(err) tree");
        }
        else if (hashresult) {
            console.log("Hash success");
        }
        else {
            console.log("after both err and hashresult");
        }
    }
);

/*
test777
pass: hellopass
salt: $2b$08$WZ8EEq.ln5EGCFX2


$2b$08$WZ8EEq.ln5EGCFX2/Evyu.qEWCCxv0Zug.XCY2/vKUU68Zwrs5WwK
*/