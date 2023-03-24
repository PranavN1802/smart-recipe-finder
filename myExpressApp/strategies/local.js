const LocalStrategy = require('passport-local');
const passport = require('passport');
const db = require('../routes/database');

// FOR HASHING
const bcrypt = require('bcryptjs');

// Two functions responsible for serialising and deserialising the user into a session
// when request made, there is no info but the cookie
// takes cookie and checks to see which user cookie belongs to
// then takes that user and serialising them back in to the actual session
// how user session is maintained
// makes passport very powerful
passport.serializeUser((user, done) => {
    //console.log('Serialising user');

    if (user.userID===undefined) {
        done(null, user);
    } else {
        //console.log(user);
        //console.log(user.userID);
        done(null, user.userID); // Could be user.id??
    }
});

// here username being treated as unique identifier - will be userID
passport.deserializeUser(async (userID, done) => {
    //console.log('Deserialising user');
    //console.log(typeof(userID));

    if (typeof(userID)==='number') {
        //console.log(userID);
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
            
            // Used to check details on the serverside (in case user has javascript disabled like a cheeky hacker)
            const emailCheck = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            const passwordCheck = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,50}$/;

            if(!emailCheck.test(email)||!passwordCheck.test(password)) {
                console.log('Validation failed');
                console.log("Error validating email or password.");
                
                done(null, "Error validating email or password."); // null for the error object; validation failed

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
                    dbPassword = dbPassword[0].map( elm => elm.password )[0];
                    console.log(dbPassword);

                    // FOR HASHING
                    const isValid = await bcrypt.compare(password, dbPassword);
                    console.log(isValid);

                    // Check if the password is correct
                    // if (dbPassword[0].map( elm => elm.password )[0] === password) {
                    // FOR HASHING
                    if (isValid) {
                        console.log('Passwords match');

                        var result = await db.promise().query(`SELECT userID, username FROM USERS WHERE email='${email}'`);
                        userID=result[0].map(elm => elm.userID)[0];
                        done(null, result[0][0]); // Passes in actual user record
                        console.log(userID);
                    }
                    else {
                        console.log('Passwords do not match');
                        console.log("Incorrect email or password");
                        
                        done(null, "Incorrect email or password"); // Incorrect credentials
                    }
                
                } else {
                    console.log('Email does not exist');
                    console.log("Incorrect email or username");
                    
                    done(null, "Incorrect email or password"); // null for the error object; user not found
                }  
            }
        } catch(err) {
            console.log('Error');
            done(err, false); // Pass in error; user not authenticated
        }
    }
));
