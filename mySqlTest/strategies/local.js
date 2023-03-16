const LocalStrategy = require('passport-local');
const passport = require('passport');
const db = require('../database');


// Two functions responsible for serialising and deserialising the user into a session
// when request made, there is no info but the cookie
// takes cookie and checks to see which user cookie belongs to
// then takes that user and serialising them back in to the actual session
// how user session is maintained
// makes passport very powerful
passport.serializeUser((user, done) => {
    done(null, user.username);
});

// here username being treated as unique identifier - will be userID
passport.deserializeUser(async (username, done) => {
    try {
        const result = await db.promise().query(`SELECT * FROM USERS WHERE USERNAME='${username}'`);
        if (result[0][0]) {
            done(null, result[0][0]);
        }
    }
    catch (err) {
        done(err, null); // no user record
    }
});


passport.use(new LocalStrategy(
    // takes in params username and password from request body
    // done is a function to be invoked after checking
    async (username, password, done) => {
        try {
            const result = await db.promise().query(`SELECT * FROM USERS WHERE USERNAME='${username}'`);
            if (result[0].length===0) {
                done(null, false); // null for the error object; user not found
            } else {
                if (result[0][0].password === password) {
                    done(null, result[0][0]); // Passes in actual user record
                } else {
                    done(null, false); // Incorrect credentials
                }
            }
        }
        catch (err) {
            done(err, false); // Pass in error; user not authenticated
        }
    }
));