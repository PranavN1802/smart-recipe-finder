const difficulties = ['easy', 'medium', 'hard'];
const dietary = ['vegetarian', 'vegan', 'kosher'];
const times = ['<5min', '5-10min', '10-20min', '20-30min', '30-40min', '40-50min', '50-60min', '60-90min', '90-120min', '120-180min', '>180min'];
const servings = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '>10'];

const $passwordResult = $('#passwordResult');
const $passwordRepeatResult = $('#passwordRepeatResult');

// Stops automatic page refresh on password change submission
var form = document.getElementById("changePasswordForm");
function handleForm(event) { event.preventDefault(); } 
form.addEventListener('submit', handleForm);


$('div.dropdown-menu').on('click', function(event){
    // The event won't be propagated up to the document NODE and 
    // therefore delegated events won't be fired
    event.stopPropagation();
});

var userEmail;

fetchDetails = function() { 
    const username = document.querySelector('#username');
    const email = document.querySelector('#email');
    const upvotesDisplay = document.querySelector('#upvoted');
    const iconDisplay = document.querySelector('#icons');
    //const $summary = $('#summary');
    //const author = document.querySelector('#author');

    fetch('http://localhost:3000/users/account/fetch')
            .then(response => response.json())
            .then(data => {

                username.insertAdjacentHTML("beforeend", data[0].username + "!");
                email.insertAdjacentHTML("beforeend", data[0].email);
                userEmail = data[0].email;

                data[1].forEach(article => {
                    var icon = '<div class="flex-container"><img class="recipe_picture" src="/images/random_food.png" alt="plate" /><p id="rcorners1">';
                    icon += '<a style="color: black" href="http://localhost:3000/recipes/view/' + article.recID + '" target="_blank"><b>' + article.name + '</b></a> - ' + article.summary;
                    icon += '<br><span id="rcorners2" style="display: inline-block"><img class="detail_icon" src="/images/icons/serving-dish.png" alt="serving dish"/><b>' + servings[article.serving] + '</b></span>';
                    icon += '<span id="rcorners2" style="display: inline-block"><img class="detail_icon" src="/images/icons/clock.png" alt="clock" /><b>' + times[article.time] + '</b></span></p>';
                    icon += '<div class="chosen_options_from_sidebar" style="margin-left: auto;">';
                    icon += '<img class="recipe_icon"src="/images/icons/' + difficulties[article.difficulty] + '.png" alt="' + difficulties[article.difficulty] + '">';

                    if (article.vegetarian) {
                        icon += '<img class="recipe_icon"src="/images/icons/vegetarian.png" alt="vegetarian">';
                    }
                    if (article.vegan) {
                        icon += '<img class="recipe_icon"src="/images/icons/vegan.png" alt="vegan">';
                    }
                    if (article.kosher) {
                        icon += '<img class="recipe_icon"src="/images/icons/kosher.png" alt="kosher">';
                    }

                    icon += '</div></div>';

                    upvotesDisplay.insertAdjacentHTML("beforeend", icon);

                    /*
                    <div class="flex-container">
                        <img class="recipe_picture" src="/images/random_food.png" alt="plate" />
                        <p id="rcorners1">
                            <a style="color: black" href="http://localhost:3000/recipes/view/' + article.recID + '" target="_blank"><b>article.name</b></a> - Creamy and nutritious, vegan mushroom stroganoff made with blended cashews.
                            <br>

                            <span id="rcorners2" style="display: inline-block">
                            <img class="detail_icon" src="/images/icons/serving-dish.png" alt="serving dish"/>
                            <b>4</b>
                            </span>

                            <span id="rcorners2" style="display: inline-block">
                            <img class="detail_icon" src="/images/icons/clock.png" alt="clock" />
                            <b>40-50min</b>
                            </span>
                        </p>
                        <div class="chosen_options_from_sidebar" style="margin-left: auto;" >
                            <img class="recipe_icon" src="/images/icons/easy.png" alt="easy" >
                            <img class="recipe_icon" src="/images/icons/vegetarian.png" alt="vegetarian" />
                            <img class="recipe_icon" src="/images/icons/vegan.png" alt="vegan" />
                            <img class="recipe_icon" src="/images/icons/kosher.png" alt="kosher" />

                            <div style="display: flex; margin-left: 5px">
                            <div class="recipe_edit_and_delete_btns">
                                <button class="edit-btn" title="Edit recipe" onclick="editRecipe(71); return false;">
                                    <span id="edit_and_delete_buttons_style" style="position: relative; bottom: 5px">
                                    <img src="/images/editing.png" style="width: 25px; margin-top: -9px"/>
                                    </span>
                                </button>
                                <button class="delete-btn" title="Delete recipe" onclick="deleteRecipe(72); return false;">
                                <span style="position: relative; bottom: 5px">
                                    <img src="/images/delete.png" style="width: 25px; margin-top: -8px"/>
                                </span>
                                </button>
                            </div>
                            </div>
                        </div>
                    </div>
                    */
                });

                data[2].forEach(article => {
                    var icon = '<div class="flex-container"><img class="recipe_picture" src="/images/random_food.png" alt="plate" /><p id="rcorners1">';
                    icon += '<a style="color: black" href="http://localhost:3000/recipes/view/' + article.recID + '" target="_blank"><b>' + article.name + '</b></a> - ' + article.summary;
                    icon += '<br><span id="rcorners2" style="display: inline-block"><img class="detail_icon" src="/images/icons/serving-dish.png" alt="serving dish"/><b>' + servings[article.serving] + '</b></span>';
                    icon += '<span id="rcorners2" style="display: inline-block"><img class="detail_icon" src="/images/icons/clock.png" alt="clock" /><b>' + times[article.time] + '</b></span></p>';
                    icon += '<div class="chosen_options_from_sidebar" style="margin-left: auto;">';
                    icon += '<img class="recipe_icon"src="/images/icons/' + difficulties[article.difficulty] + '.png" alt="' + difficulties[article.difficulty] + '">';

                    if (article.vegetarian) {
                        icon += '<img class="recipe_icon"src="/images/icons/vegetarian.png" alt="vegetarian">';
                    }
                    if (article.vegan) {
                        icon += '<img class="recipe_icon"src="/images/icons/vegan.png" alt="vegan">';
                    }
                    if (article.kosher) {
                        icon += '<img class="recipe_icon"src="/images/icons/kosher.png" alt="kosher">';
                    }

                    icon += '<div style="display: flex; margin-left: 5px"><div class="recipe_edit_and_delete_btns">';
                    icon += '<button class="edit-btn" title="Edit recipe" onclick="editRecipe(' + article.recID + '); return false;">';
                    icon += '<span id="edit_and_delete_buttons_style" style="position: relative; bottom: 5px"><img src="/images/editing.png" style="width: 25px; margin-top: -9px"/></span></button>';
                    icon += '<button class="delete-btn" title="Delete recipe" onclick="deleteRecipe(' + article.recID + '); return false;">';
                    icon += '<span style="position: relative; bottom: 5px"><img src="/images/delete.png" style="width: 25px; margin-top: -8px"/></span></button>';
                    icon += '</div></div></div></div>';

                    iconDisplay.insertAdjacentHTML("beforeend", icon);
                });
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
                window.location.reload();
            })
            .catch(err => console.log(err));
    }
}

create = function() {
    window.location.replace("http://localhost:3000/recipes/create");
}

changePassword = function() {
    var valid = true;

    var oldPassword = document.getElementById("oldPassword").value;

    // Checks if password is of the required format
    var newPassword = document.getElementById("newPassword").value;
    const passwordCheck = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*]{8,50}$/;
    if(passwordCheck.test(newPassword) == false) {
        valid = false;
        $passwordResult.text('Password must be between 8 to 50 characters include at least one capital, symbol (!@#$%^&*) and number!');
        $passwordResult.css('color', 'red');
    } else {
        $passwordResult.text('Password is valid');
        $passwordResult.css('color', 'green');
    }

    // Checks if passwords match
    var passwordRepeat = document.getElementById("reEnter").value;
    if(newPassword != passwordRepeat) {
        valid = false;
        $passwordRepeatResult.text('Passwords must match!');
        $passwordRepeatResult.css('color', 'red');
    } else {
        $passwordRepeatResult.text('Passwords match');
        $passwordRepeatResult.css('color', 'green');
    }

    if(valid == true) {
        fetch('http://localhost:3000/users/changePassword', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: userEmail,
                password: oldPassword,
                newPassword: newPassword
            })}
            )
            .then(response => response.json())
            .then(data => {
                message = data.text;
                alert(message);
                if(data.error == false) window.location.reload();
            })
            .catch(err => console.log(err));
    }
}

deleteAccount = function() {
    if(confirm("Are you sure you want to delete your account? WARNING:\nYour recipes will not be deleted, your username will be replaced with 'Deleted User'\nYour reports and upvotes will be removed\nYou will NOT be able to recover your account nor claim back your recipes!")) {
        if(confirm("Are you ABSOLUTELY sure? (There is no going back)")) {

            document.cookie = "confirmation=delete";
            window.location.replace('http://localhost:3000/users/delete');
        }
    }
}

fetchDetails();