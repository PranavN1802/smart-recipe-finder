loginCheck = function() {
    var valid = true;

    const $userEmail = $('#emailResult');
    const $userPassword = $('#passwordResult');

    // Checks the email is of the required format
    var email = document.getElementById("userEmail").value;
    const emailCheck = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if(emailCheck.test(email) == false) {
        valid = false;
        $userEmail.text('Email must be valid!');
        $userEmail.css('color', 'red');
    } else {
        $userEmail.text('Email is valid');
        $userEmail.css('color', 'green');
    }

    // Checks if password is of the required format
    var password = document.getElementById("userPassword").value;
    const passwordCheck = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,50}$/;
    if(passwordCheck.test(password) == false) {
        valid = false;
        $userPassword.text('Password must be valid!');
        $userPassword.css('color', 'red');
    } else {
        $userPassword.text('Password is valid');
        $userPassword.css('color', 'green');
    }

    // Send post request to /users/login with information given
    if (valid) {
        fetch("http://localhost:3000/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
        .then((response) => response.json())
        .then(data => {
            // Show alert with database response
            alert(data.text);
            if (data.valid) {
                window.location.replace("http://localhost:3000/");
            }
        })
        .catch(err => console.log(err));
    }
}