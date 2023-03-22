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

editRecipe = function(recID) {
    window.open("http://localhost:3000/recipes/edit/" + recID, '_blank');
}

deleteRecipe = function(recID) {
    if(confirm("Are you sure you want to delete this recipe?")) {
        fetch('http://localhost:3000/recipes/delete/' + recID, { method: "POST" })
            .then(response => response.json())
            .then(data => {
                message = data.text;
                alert(message);
            })
            .catch(err => console.log(err));
    }
}

create = function() {
    window.location.replace("http://localhost:3000/recipes/create");
}

fetchDetails();