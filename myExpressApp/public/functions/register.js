registerCheck = function() {
    var valid = true;

    const $nameResult = $('#nameResult');
    const $emailResult = $('#emailResult');
    const $passwordResult = $('#passwordResult');
    const $passwordRepeatResult = $('#passwordRepeatResult');

    // Checks the username is of the required format
    var userName = document.getElementById("userName").value;
    const userCheck = /^[A-Za-z0-9_]{6,20}$/;
    if(userCheck.test(userName) == false) {
        valid = false;
        $nameResult.text('Username must be between 6 to 20 characters and only include letters, numbers or underscores!');
        $nameResult.css('color', 'red');
    } else {
        $nameResult.text('Username is valid');
        $nameResult.css('color', 'green');
    }

    // Checks the email is of the required format
    var email = document.getElementById("userEmail").value;
    const emailCheck = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if(emailCheck.test(email) == false) {
        valid = false;
        $emailResult.text('Email must be valid!');
        $emailResult.css('color', 'red');
    } else {
        $emailResult.text('Email is valid');
        $emailResult.css('color', 'green');
    }

    // Checks if password is of the required format
    var password = document.getElementById("userPassword").value;
    const passwordCheck = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,50}$/;
    if(passwordCheck.test(password) == false) {
        valid = false;
        $passwordResult.text('Password must be between 8 to 50 characters include at least one capital, symbol (!@#$%^&*) and number!');
        $passwordResult.css('color', 'red');
    } else {
        $passwordResult.text('Password is valid');
        $passwordResult.css('color', 'green');
    }

    // Checks if passwords match
    var passwordRepeat = document.getElementById("userRepeatPassword").value;
    if(password != passwordRepeat) {
        valid = false;
        $passwordRepeatResult.text('Passwords must match!');
        $passwordRepeatResult.css('color', 'red');
    } else {
        $passwordRepeatResult.text('Passwords match');
        $passwordRepeatResult.css('color', 'green');
    }

    // Send post request to /users/register with information given
    if (valid) {
        fetch("http://localhost:3000/users/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                username: userName,
                password: password
            })
        })
        .then((response) => response.json())
        .then(data => {
            // Show alert with database response
            alert(data.text);
            if (data.valid) {
                window.location.replace("http://localhost:3000/login");
            }
        })
        .catch(err => console.log(err));
    }
}

validate = function() {
    alert("Register submitted");
}

