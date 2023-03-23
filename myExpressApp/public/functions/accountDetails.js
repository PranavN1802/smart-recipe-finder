const difficulties = ['easy', 'medium', 'hard'];
const dietary = ['vegetarian', 'vegan', 'kosher'];
const times = ['<5min', '5-10min', '10-20min', '20-30min', '30-40min', '40-50min', '50-60min', '60-90min', '90-120min', '120-180min', '>180min'];
const servings = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '>10'];

fetchDetails = function() { 
    const username = document.querySelector('#username');
    const email = document.querySelector('#email');
    const iconDisplay = document.querySelector('#icons');
    //const $summary = $('#summary');
    //const author = document.querySelector('#author');

    fetch('http://localhost:3000/users/account/fetch')
            .then(response => response.json())
            .then(data => {

                username.insertAdjacentHTML("beforeend", data[0].username + "!");
                email.insertAdjacentHTML("beforeend", data[0].email);

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

                    icon += '<div style="display: flex; margin-left: 5px"><div class="recipe_edit_and_delete_btns">';
                    icon += '<button class="edit-btn" title="Edit recipe" onclick="editRecipe(' + article.recID + '); return false;">';
                    icon += '<span id="edit_and_delete_buttons_style" style="position: relative; bottom: 5px"><img src="/images/editing.png" style="width: 25px; margin-top: -9px"/></span></button>';
                    icon += '<button class="delete-btn" title="Delete recipe" onclick="deleteRecipe(' + article.recID + '); return false;">';
                    icon += '<span style="position: relative; bottom: 5px"><img src="/images/delete.png" style="width: 25px; margin-top: -8px"/></span></button>';
                    icon += '</div></div></div></div>';

                    iconDisplay.insertAdjacentHTML("beforeend", icon);

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

fetchDetails();