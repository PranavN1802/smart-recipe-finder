const LocalStrategy = require('passport-local');
const passport = require('passport');
const db = require('../routes/database');

// Two functions responsible for serialising and deserialising the user into a session
// when request made, there is no info but the cookie
// takes cookie and checks to see which user cookie belongs to
// then takes that user and serialising them back in to the actual session
// how user session is maintained
// makes passport very powerful
passport.serializeUser((user, done) => {
    console.log('Serialising user');

    if (user.userID===undefined) {
        done(null, user);
    } else {
        console.log(user);
        console.log(user.userID);
        done(null, user.userID); // Could be user.id??
    }
});

// here username being treated as unique identifier - will be userID
passport.deserializeUser(async (userID, done) => {
    console.log('Deserialising user');
    console.log(typeof(userID));

    if (typeof(userID)==='number') {
        console.log(userID);
        try {
            const result = await db.promise().query(`SELECT userID, username FROM USERS WHERE userID=${userID}`);
            if (result[0][0]) {
                done(null, result[0][0]);
            }
        }
        catch (err) {
            done(err, null); // no user record
        }
    } else {
        done(null, null);
    }
});




// Anytime username is used, it is referring to the email
// Set up needed to use passport local
passport.use(new LocalStrategy({
    usernameField: 'email',
    }, async (email, password, done) => {
        try {
            console.log('local');

            console.log(email);
            console.log(password);

            // const emailCheck = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            // const passwordCheck = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,50}$/;

            // if(!emailCheck.test(username)||!passwordCheck.test(password)) {
            //     console.log("Error validating email or password.");
            // } else {
            //     console.log("Validation passed.");
            // }

            // const result = await db.promise().query(`SELECT userID, username FROM USERS WHERE EMAIL='${username}'`);
            // const dbPassword = await db.promise().query(`SELECT password FROM USERS WHERE EMAIL='${username}'`);
            // if (result[0].length===0) {
            //     done(null, false); // null for the error object; user not found
            // } else {
            //     if (dbPassword[0].map( elm => elm.password )[0] === password) {
            //         done(null, result[0][0]); // Passes in actual user record
            //     } else {
            //         done(null, false); // Incorrect credentials
            //     }
            // }



            
            // Used to check details on the serverside (in case user has javascript disabled like a cheeky hacker)
            const emailCheck = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            const passwordCheck = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,50}$/;

            if(!emailCheck.test(email)||!passwordCheck.test(password)) {
                console.log('Validation failed');
                console.log("Error validating email or password.");
                // res.status(500).send({ text: "Error validating email or password." });
                // done(new Error("Error validating email or password."), false); // null for the error object; validation failed
                
                
                done(null, "Error validating email or password."); // null for the error object; validation failed
                // Instead of res statement
                // throw new Error("Error validating email or password.");
            } else {
                console.log('Validation passed');
                let emails = await db.promise().query(`SELECT email FROM USERS`);
                emails = emails[0].map( elm => elm.email );
                console.log(emails);

                // Check entered email is in db
                if (emails.includes(email)) {
                    console.log('Email exists');
                    // Find password for email
                    var dbPassword = await db.promise().query(`SELECT password FROM USERS WHERE email='${email}'`);
                
                    // Check if the password is correct
                    if (dbPassword[0].map( elm => elm.password )[0] === password) {
                        console.log('Passwords match');
                        var result = await db.promise().query(`SELECT userID, username FROM USERS WHERE email='${email}'`);
                        userID=result[0].map(elm => elm.userID)[0];
                        done(null, result[0][0]); // Passes in actual user record
                        // res.status(200).send({text: userID, valid: true}); 
                        console.log(userID);

                        // Instead of res statement
                        // throw new Error("Error validating email or password.");
                    }
                    else {
                        console.log('Passwords do not match');
                        // done(new Error("Incorrect email or password"), false); // Incorrect credentials
                        console.log("Incorrect email or password");
                        
                        done(null, "Incorrect email or password"); // Incorrect credentials
                        
                        // res.status(500).send({text: "Incorrect email or password"});

                        // Instead of res statement
                        // throw new Error("Incorrect email or password");
                    }
                
                } else {
                    console.log('Email does not exist');
                    // done(new Error("Incorrect email or username"), false); // null for the error object; user not found
                    console.log("Incorrect email or username");
                    
                    done(null, "Incorrect email or password"); // null for the error object; user not found
                    
                    // res.status(500).send({text: "Incorrect email or password"});
                    
                    // Instead of res statement
                    // throw new Error("Incorrect email or username");
                }  
            }
        } catch(err) {
            done(err, false); // Pass in error; user not authenticated
        }
    }
));