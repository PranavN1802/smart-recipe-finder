fetch("http://localhost:3000/users/checklogin")
    .then((response) => response.json())
    .then(data => {
        if (data.login == true) {
            var buttons = '<a class="dropdown-item" href="/account">Account</a>';
            buttons += '<a class="dropdown-item" href="/logout">Logout</a>';
        } else {
            var buttons = '<a class="dropdown-item" href="/register">Register</a>';
            buttons += '<a class="dropdown-item" href="/login">Login</a>';
        }

        document.querySelector('#accountMenu').insertAdjacentHTML("beforeend", buttons);
    })
    .catch(err => console.log(err));