var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const mysql = require('mysql');



const db = require('./database');


// FOR SESSIONS AND PASSPORT
const passport = require('passport');


router.get('/', async(req, res, next) => {
    return res.redirect('/register');
});

router.get('/checklogin', async(req, res, next) => {
    if(req.user) {
        res.status(200).send({login: true});
    } else {
        res.status(200).send({login: false});
    }
})


// NEW VERSION OF LOGIN FOR SESSIONS AND PASSPORT

router.post('/login', passport.authenticate('local'), (req, res) => {
    console.log('login');
    // res.status(200).send({text: "finished", valid: true});     
    try {
        if (req.user.userID===undefined) {
            console.log('userID undefined');
            res.status(500).send({text: `${req.user}`});
        } else {
            console.log('Authorisation passed');
            console.log(req.user);
            res.status(200).send({text: 'Welcome!', valid: true});     
        }
    } catch(err) {
        console.log('Error caught');
        console.log(err);
    }
});

// END OF NEW VERSION


//hashing
//const saltRounds = 10; // Number of rounds of hashing 
//const password = const {password}; 
//const password = await bcrypt.hash(password, saltRounds);

//db.connect();
//const email = const {email} // replace with user’s email





// OLD VERSION OF LOGIN
// router.post('/login', async(req, res, next) => {

//     // Jay - your serverside code goes here!

//     const { email, password } = req.body;

//     // Used to check details on the serverside (in case user has javascript disabled like a cheeky hacker)
//     const emailCheck = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
//     const passwordCheck = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,50}$/;

//     if(!emailCheck.test(email)||!passwordCheck.test(password)) {
//         console.log("Error validating email or password.");
//         res.status(500).send({ text: "Error validating email or password." });
//     } else {
//         let emails = await db.promise().query(`SELECT email FROM USERS`);
//         emails = emails[0].map( elm => elm.email );
//         console.log(emails);
//         console.log(email);
    
//         // Check entered email is in db
//         if (emails.includes(email)) {
//             // Find password for email
//             dbPassword = await db.promise().query(`SELECT password FROM USERS WHERE email='${email}'`);
//             dbPassword = dbPassword[0].map( elm => elm.password )[0];
//             console.log(dbPassword);
        
//             // Check if the password is correct
//             if (password === dbPassword) {
//                 let userID = await db.promise().query(`SELECT userID FROM USERS WHERE email='${email}' AND password='${password}'`);
//                 userID=userID[0].map(elm => elm.userID)[0];
//                 res.status(200).send({text: userID, valid: true});
//                 console.log(userID);
//             }
//             else {
//                 res.status(500).send({text: "Incorrect email or password"});
//                 console.log("Incorrect email or username");
//             }
//         }
//         else {
//             res.status(500).send({text: "Incorrect email or password"});
//             console.log("Incorrect email or username");
//         }           
//     }



// });

router.post('/register', async(req, res, next) => {
    const { email, username, password } = req.body;

    // For password recovery
    // const { email, username, password, question, answer } = req.body;

    if (email && username && password) {
        // Used to check details on the serverside (in case user has javascript disabled like a cheeky hacker)
        const userCheck = /^[A-Za-z0-9_]{6,20}$/;
        const emailCheck = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        const passwordCheck = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,50}$/;

        // If the checks fail, send error message, else proceeed with query
        if(!emailCheck.test(email) || !userCheck.test(username) || !passwordCheck.test(password)) {
            console.log("Error validating username, email or password.");
            res.status(500).send({ text: "Error validating username, email or password." });
        } else {
            try {


                //hashing
                /// Check entered email is in db
       //if (emails.includes(email)) {
        // Find password for email
        //const sql = `SELECT password FROM users WHERE email = '${email}'`;
        //db.query(sql, async (err, results) => {
            //if (err) throw err;
            //if (results.length > 0) {




        //const hashedPassword = results[0].password;
        //const plainPassword = const { password }
        //const passwordMatches = await bcrypt.compare(plainPassword, hashedPassword);
   
        // Check if the password is correct
        //if (passwordMatches) {
            //console.log('Login Successful');
            //redirect to user's account page
        //} else {
            //console.log('Incorrect Password')
            //display error on login page
        //}
    //} else {
       // console.log('User Not Found')
        //display error on login page
    }
});


db.end()

       
    


db.end()

                // Extract all usernames and email already in the dbss
                let details = await db.promise().query(`SELECT email, username FROM USERS`);
                let usernames = details[0].map( elm => elm.username );
                let emails = details[0].map( elm => elm.email );

                // Check email and username are unique
                if (emails.includes(email)) {
                    res.status(500).send({text: "Email taken"});
                    console.log("Email taken");
                }
                else if (usernames.includes(username)) {
                    res.status(500).send({text: "Username taken"});
                    console.log("Username taken");
                }
                else {
                    // Only create user if the email and username are unique
                    db.promise().query(`INSERT INTO USERS (email, username, password) VALUES ('${email}','${username}', '${password}')`);
                    
                    // // For password recovery
                    // db.promise().query(`INSERT INTO USERS (email, username, password, question, answer) VALUES ('${email}','${username}', '${password}', ${question}, '${answer}')`);

                    res.status(201).send({text: 'Your account has been created!', valid: true});
                    console.log(req.body);
                }
            }
            catch (err) {
                console.log(err);
            }
        }
    }
});

router.get('/account', async(req, res, next) => {
    if (req.user) {
        res.render('account', { title: 'Account | Bubble\'N\'Sqeak' });
    } else {
        return res.redirect('/login');
    }
});

module.exports = router;