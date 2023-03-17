// var express = require('express');
const {Router} = require('express');
// var router = express.Router();

const db = require('./database');


// FOR SESSIONS AND PASSPORT

// install passport and passport local for user authentication
// passport is an authentication middleware that allows the handling of everything to do with authentication
// also takes care of saving sessions into the request object so don't have to implement own sessions
// passport local is the strategy planning to use to authenticate user (i.e. username and password)
// lots of different strategy options on passport.js e.g. with google
// const passport = require('passport');

// const LocalStrategy = require('passport-local');
const passport = require('passport');
// const db = require('../routes/database');



// END OF SESSIONS AND PASSPORT

const router = Router();


router.get('/', async(req, res, next) => {
    return res.redirect('/register');
});


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
            console.log(typeof(req.user.userID));
            res.status(200).send({text: req.user.userID, valid: true});     
        }
    } catch(err) {
        console.log('Error caught');
        console.log(err);
    }
});

// END OF NEW VERSION

// PREVIOUS VERSION OF LOGIN
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

module.exports = router;