const iconDisplay = document.querySelector('#icons');

const difficulties = ['easy', 'medium', 'hard'];
const dietary = ['vegetarian', 'vegan', 'kosher'];
const times = ['<5min', '5-10min', '10-20min', '20-30min', '30-40min', '40-50min', '50-60min', '60-90min', '90-120min', '120-180min', '>180min'];
const servings = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '>10'];

// Makes an initial get request to display all recipes in the database
initialSearch = function() {
    fetch('http://localhost:3000/recipes/search')
        .then(response => response.json())
        .then(data => {
            data.forEach(article => {
                if (article.alert != undefined) {
                    if (article.alert == true) {
                        alert(article.text);
                    } 
                } else {
                    summary = '<div class="flex-container"><img class="recipe_picture" src="/images/random_food.png" alt="plate"><p id="rcorners1"><a style="color: black;" href="http://localhost:3000/recipes/view/' + article.recID + '" target="_blank"><b>' + article.name + '</b></a> - ' + article.summary + '<br>';
                    summary += '<span id="rcorners2"><img class="detail_icon_square"src="/images/icons/serving-dish.png" alt="serving dish"><b>' + servings[article.serving] + '</b></span>';
                    summary += '<span id="rcorners2"><img class="detail_icon"src="/images/icons/clock.png" alt="clock"><b>' + times[article.time] + '</b></span></p>';
                    summary += '<img class="recipe_icon"src="/images/icons/' + difficulties[article.difficulty] + '.png" alt="' + difficulties[article.difficulty] + '">';

                    if (article.vegetarian) {
                        summary += '<img class="recipe_icon"src="/images/icons/vegetarian.png" alt="vegetarian">';
                    }
                    if (article.vegan) {
                        summary += '<img class="recipe_icon"src="/images/icons/vegan.png" alt="vegan">';
                    }
                    if (article.kosher) {
                        summary += '<img class="recipe_icon"src="/images/icons/kosher.png" alt="kosher">';
                    }
                    
                    summary += '</div>'

                    iconDisplay.insertAdjacentHTML("beforeend", summary);
                }
            });

            var height = $('.main_content').height();
            $('.sidenav').height(height);
        })
        .catch(err => console.log(err));
}

// Parses the filter options selected in the nav bar into the correct JSON format,
// sends post request to the search route using the JSON,
// then adds the returned recipes to the display
filterRecipes = function() {
    // Capitalises first letter of each word
    search = document.getElementById('search').value;
    if(search == "") search = null;
    else {
        search = search.split(" ");
        for(let i = 0; i<search.length; i++) {
            search[i] = search[i][0].toUpperCase() + search[i].substring(1);
        }
        search = search.join(" ");
    }

    ingredients = document.getElementById('ingredients').value;
    if(ingredients == "") ingredients = null;
    else {
        ingredients = ingredients.split(",");
        for(let j = 0; j<ingredients.length; j++) {
            ingredients[j] = ingredients[j].trim();
            ingredients[j] = ingredients[j].split(" ");
            console.log(ingredients[j]);
            for(let i = 0; i<ingredients[j].length; i++) {
                ingredients[j][i] = ingredients[j][i][0].toUpperCase() + ingredients[j][i].substring(1);
            }
            ingredients[j] = ingredients[j].join(" ");
        }
    }

    allergies = document.getElementById('allergies').value;
    if(allergies == "") allergies = null;
    else {
        allergies = allergies.split(",");
        for(let j = 0; j<allergies.length; j++) {
            allergies[j] = allergies[j].trim();
            allergies[j] = allergies[j].split(" ");
            console.log(allergies[j]);
            for(let i = 0; i<allergies[j].length; i++) {
                allergies[j][i] = allergies[j][i][0].toUpperCase() + allergies[j][i].substring(1);
            }
            allergies[j] = allergies[j].join(" ");
        }
    }

    difficulty = null;
    serving = null;
    time = null;
    sortBy = null;

    for(var i = 0; i <= 10; i++) {
        if(i <= 2) {
            if(document.getElementById('difficulty'+i).checked) {
                difficulty = i;
            }
        }
        if(i <= 3) {
            if(document.getElementById('sortBy'+i).checked) {
                sortBy = i;
            }
        }
        if(document.getElementById('serving'+i).checked) {
            serving = i;
        }
        if(document.getElementById('time'+i).checked) {
            time = i;
        }
    }

    if(document.getElementById('vegetarian').checked) vegetarian = true;
    else vegetarian = null;
    if(document.getElementById('vegan').checked) vegan = true;
    else vegan = null;
    if(document.getElementById('kosher').checked) kosher = true;
    else kosher = null;

    halal = null;

    //alert("Search: " + search + ", Ingredients:" + ingredients + "Serving: " + serving+ ", Time: " + time + ", Diffuclty: " + difficulty + ", Vegetarian: " + vegetarian + ", Vegan: " + vegan + ", Kosher: " + kosher + ", Halal: " + halal);

    iconDisplay.innerHTML = "<p id='rcorners1'>Loading recipes...</p>";

    fetch("http://localhost:3000/recipes/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            search: search,
            ingredients: ingredients,
            allergies: allergies,
            vegetarian: vegetarian,
            vegan: vegan,
            kosher: kosher,
            halal: halal,
            serving: serving,
            time: time,
            difficulty: difficulty,
            sortBy: sortBy
        })
    })
    .then((response) => response.json())
    .then(data => {
        iconDisplay.innerHTML = "";
        data.forEach(article => {
            if (article.alert != undefined) {
                if (article.alert == true) {
                    alert(article.text);
                }
            } else {
                summary = '<div class="flex-container"><img class="recipe_picture" src="/images/random_food.png" alt="plate"><p id="rcorners1"><a style="color: black;" href="http://localhost:3000/recipes/view/' + article.recID + '" target="_blank"><b>' + article.name + '</b></a> - ' + article.summary + '<br>';
                summary += '<span id="rcorners2"><img class="detail_icon_square"src="/images/icons/serving-dish.png" alt="serving dish"><b>' + servings[article.serving] + '</b></span>';
                summary += '<span id="rcorners2"><img class="detail_icon"src="/images/icons/clock.png" alt="clock"><b>' + times[article.time] + '</b></span></p>';
                summary += '<img class="recipe_icon"src="/images/icons/' + difficulties[article.difficulty] + '.png" alt="' + difficulties[article.difficulty] + '">';

                if (article.vegetarian) {
                    summary += '<img class="recipe_icon"src="/images/icons/vegetarian.png" alt="vegetarian">';
                }
                if (article.vegan) {
                    summary += '<img class="recipe_icon"src="/images/icons/vegan.png" alt="vegan">';
                }
                if (article.kosher) {
                    summary += '<img class="recipe_icon"src="/images/icons/kosher.png" alt="kosher">';
                }
                
                summary += '</div>'

                iconDisplay.insertAdjacentHTML("beforeend", summary);

                /*
                <div class="flex-container">
                    <img class="recipe_picture" src="/images/random_food.png" alt="plate">
                    <p id="rcorners1">
                    <a style="color: black;" href="http://localhost:3000/recipes/view/' + article.recID + '" target="_blank"><b>article.name</b></a> - Creamy and nutritious, vegan mushroom stroganoff made with blended cashews.
                    <br>

                    <span id="rcorners2">
                        <b>4</b>
                        <img class="detail_icon_square"src="/images/icons/serving-dish.png" alt="serving dish">
                    </span>
                    
                    <span id="rcorners2">
                        <b>4</b>
                        <img class="detail_icon"src="/images/icons/clock.png" alt="clock">
                    </span>
                    </p>

                    <img class="recipe_icon"src="/images/icons/easy.png" alt="easy">
                    <img class="recipe_icon"src="/images/icons/vegetarian.png" alt="vegetarian">
                    <img class="recipe_icon"src="/images/icons/vegan.png" alt="vegan">
                    <img class="recipe_icon"src="/images/icons/kosher.png" alt="kosher">
                </div>
                */
            }
        })
    })
    .catch(err => console.log(err));
}

create = function() {
    window.location.replace("http://localhost:3000/recipes/create");
}

validate = function() {
    alert("Filter submitted");
}

initialSearch();
