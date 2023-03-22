fetchDetails = function() { 
    const username = document.querySelector('#username');
    const email = document.querySelector('#email');
    //const $summary = $('#summary');
    //const author = document.querySelector('#author');

    fetch('http://localhost:3000/users/account/fetch')
            .then(response => response.json())
            .then(data => {
                data = data[0];

                username.insertAdjacentHTML("beforeend", data.username + "!");
                email.insertAdjacentHTML("beforeend", data.email);
            })
            .catch(err => console.log(err));
}

fetchDetails();