const LocalStrategy = require('passport-local');
const passport = require('passport');
const db = require('./database');

// Two functions responsible for serialising and deserialising the user into a session
// when request made, there is no info but the cookie
// takes cookie and checks to see which user cookie belongs to
// then takes that user and serialising them back in to the actual session
// how user session is maintained
// makes passport very powerful
passport.serializeUser((user, done) => {
    done(null, user.userID);
});

// here username being treated as unique identifier - will be userID
passport.deserializeUser(async (email, done) => {
    try {
        const result = await db.promise().query(`SELECT userID, username FROM USERS WHERE email='${email}'`);
        if (result[0][0]) {
            done(null, result[0][0]);
        }
    }
    catch (err) {
        done(err, null); // no user record
    }
});

passport.use(new LocalStrategy(

    // Check how it finds email and password from req
    // takes in params email and password from request body
    // done is a function to be invoked after checking
    async (email, password, done) => {
        try {

            // Used to check details on the serverside (in case user has javascript disabled like a cheeky hacker)
            const emailCheck = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            const passwordCheck = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,50}$/;

            if(!emailCheck.test(email)||!passwordCheck.test(password)) {
                console.log("Error validating email or password.");
                res.status(500).send({ text: "Error validating email or password." });
            } else {
                let emails = await db.promise().query(`SELECT email FROM USERS`);
                emails = emails[0].map( elm => elm.email );
                console.log(emails);
                console.log(email);
            
                // Check entered email is in db
                if (emails.includes(email)) {
                    // Find password for email
                    dbPassword = await db.promise().query(`SELECT password FROM USERS WHERE email='${email}'`);
                    dbPassword = dbPassword[0].map( elm => elm.password )[0];
                    console.log(dbPassword);
                
                    // Check if the password is correct
                    if (password === dbPassword) {
                        let result = await db.promise().query(`SELECT userID, username FROM USERS WHERE email='${email}' AND password='${password}'`);
                        userID=result[0].map(elm => elm.userID)[0];
                        done(null, result[0][0]); // Passes in actual user record
                        res.status(200).send({text: userID, valid: true});
                        console.log(userID);
                    }
                    else {
                        done(null, false); // Incorrect credentials
                        res.status(500).send({text: "Incorrect email or password"});
                        console.log("Incorrect email or password");
                    }
                }
                else {
                    done(null, false); // null for the error object; user not found
                    res.status(500).send({text: "Incorrect email or password"});
                    console.log("Incorrect email or username");
                }           
            }



            // ORIGINAL CODE FROM TUTORIAL

            // const result = await db.promise().query(`SELECT * FROM USERS WHERE EMAIL='${email}'`);
            // if (result[0].length===0) {
            //     done(null, false); // null for the error object; user not found
            // } else {
            //     if (result[0][0].password === password) {
            //         done(null, result[0][0]); // Passes in actual user record
            //     } else {
            //         done(null, false); // Incorrect credentials
            //     }
            // }




        }
        catch (err) {
            done(err, false); // Pass in error; user not authenticated
        }
    }
));


// OLD LOGIN

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

