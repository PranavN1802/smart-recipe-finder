var express = require('express');
var router = express.Router();

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

router.get('/logout', function (req, res, next) {
    console.log('logout');
    
    if (req.user) {
        req.logOut(function(err) {
            if (err) {
                return next(err);
            }
            res.status(200).clearCookie('connect.sid', {
                path: '/'
            });
            req.session.destroy(function(err) {
                return res.redirect('/');
            });
        });
    } else {
        return res.redirect('/login');
    }
});


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

router.get('/account/fetch', async (req, res) => {
    if (req.user) {
        let userID = req.user.userID;

        try {
            // Find username for the userID
            let details = await db.promise().query(`SELECT email, username FROM USERS WHERE userID=${userID}`);
            console.log(details[0]);
            
            // Find summary recipe details with userID - included recID - wouldn't be displayed but can be used to fetch complete recipe details
            let recipes = await db.promise().query(`SELECT recID, name, vegetarian, vegan, kosher, halal, serving, time, difficulty, summary FROM RECIPES WHERE userID='${userID}'`);
            
            // Extract recipe details as an array - each recipe record is a separate array item - each recipe value can be separately extracted as with userID
            recipes=recipes[0];
            console.log(recipes);
            details[0].push(recipes);
                
            res.status(200).send(details[0]);
        } catch (err) {
            console.log(err);
        }
    } else {
        return res.redirect('/login');
    }
});

router.post('/changePassword', async (req,res) => {
    if(req.user) {
        let userID = req.user.userID;
        let {email, password, newPassword} = req.body;

        try{

            // Find the email and password for this user
            let details = await db.promise().query(`SELECT email, password FROM USERS WHERE userID=${userID}`);
            let userEmail = details[0].map(elm => elm.email)[0];
            let userPassword= details[0].map(elm => elm.password)[0];

            // If the email and password entered are correct, change the password
            if (email == userEmail && password == userPassword){
                db.promise().query(`UPDATE USERS SET password='${newPassword}' WHERE userID=${userID}`);
                console.log('password changed');
                res.status(200).send({error: false, text: "Password changed"});
            }
            else{
                res.status(500).send({error: true, text: 'Incorrect password or email'});
            }

        }
        catch(err){
            console.log(err);
        }
    } else {
        return res.redirect('/login');
    }
});

router.get('/delete', async (req,res) => {
    if (req.user) {
        let userID = req.user.userID;

        const {cookies} = req;
        let confirmation = cookies.confirmation;

        if (confirmation == "delete") {

            console.log('logout');
            req.logOut(function(err) {
                if (err) {
                    return next(err);
                }
                res.status(200).clearCookie('connect.sid', {
                    path: '/'
                });
                req.session.destroy(function(err) {
                    //res.redirect('/');
                });
            });

            try {

                deletedUserID = 1;
                db.promise().query(`UPDATE RECIPES SET userID=${deletedUserID} WHERE userID=${userID}`);


                // Check if the user has already upvoted this recipe
                let upvotedRecipes = await db.promise().query(`SELECT recID FROM UPVOTES WHERE userID=${userID}`);
                upvotedRecipes = upvotedRecipes[0].map( elm => elm.recID );
                            
                if (upvotedRecipes.length===0) {
                    console.log('This user has not upvoted any recipes');
                } else {
                    for (u=0; u<upvotedRecipes.length; u++) {
                        // Find current upvotes value for the recipe
                        let upvotes = await db.promise().query(`SELECT upvotes FROM RECIPES WHERE recID=${upvotedRecipes[u]}`);
                        
                        // Extract upvotes value form array
                        upvotes = upvotes[0].map( elm => elm.upvotes )[0];

                        // Increment the number of upvotes by 1
                        db.promise().query(`UPDATE RECIPES SET upvotes=${upvotes} - 1 WHERE recID= ${upvotedRecipes[u]}`);
                        db.promise().query(`DELETE FROM UPVOTES WHERE userID=${userID} AND recID=${upvotedRecipes[u]}`);
                        console.log('upvote removed');
                    }
                    console.log('upvotes all removed');
                }

                // Check if the user has already upvoted this recipe
                let reportedRecipes = await db.promise().query(`SELECT recID FROM REPORTS WHERE userID=${userID}`);
                reportedRecipes = reportedRecipes[0].map( elm => elm.recID );
                            
                if (reportedRecipes.length===0) {
                    console.log('This user has not reported any recipes');
                } else {
                    for (r=0; r<reportedRecipes.length; r++) {
                        // Find current upvotes value for the recipe
                        let reports = await db.promise().query(`SELECT reports FROM RECIPES WHERE recID=${reportedRecipes[r]}`);
                        
                        // Extract upvotes value form array
                        reports = reports[0].map( elm => elm.reports )[0];

                        // Increment the number of upvotes by 1
                        db.promise().query(`UPDATE RECIPES SET reports=${reports} - 1 WHERE recID= ${reportedRecipes[r]}`);
                        db.promise().query(`DELETE FROM REPORTS WHERE userID=${userID} AND recID=${reportedRecipes[r]}`);
                        console.log('report removed');
                    }
                    console.log('reports all removed');
                }

                // Delete the record in users with that userID
                db.promise().query(`DELETE FROM USERS WHERE userID=${userID}`);

                return res.redirect('/');
                //res.status(200).send({url: 'http://localhost:3000'});
            }
            catch (err) {
                console.log(err);
            }
        }
    } else {
        res.redirect('/login');
    }
});

module.exports = router;