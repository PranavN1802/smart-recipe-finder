const iconDisplay = document.querySelector('.main_content');

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
                    summary = '<p id="rcorners1"><b>' + article.name + '</b> - ' + article.summary;
                    summary += '<br>Vg: ' + article.vegetarian + ', Ve: ' + article.vegan + ', Ko: ' + article.kosher + ', Ha: ' + article.halal;
                    summary += '<br>Serves: ' + article.serving + ', Time: ' + article.time + ', Difficulty: ' + article.difficulty + '</p>';
                    iconDisplay.insertAdjacentHTML("beforeend", summary);
                }
            });
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
            ingredients[j] = ingredients[j].split(" ");
            console.log(ingredients[j]);
            for(let i = 0; i<ingredients[j].length; i++) {
                ingredients[j][i] = ingredients[j][i][0].toUpperCase() + ingredients[j][i].substring(1);
            }
            ingredients[j] = ingredients[j].join(" ");
        }
    }

    difficulty = null;
    serving = null;
    time = null;

    for(var i = 0; i <= 10; i++) {
        if(i <= 2) {
            if(document.getElementById('difficulty'+i).checked) {
                difficulty = i;
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
    if(document.getElementById('halal').checked) halal = true;
    else halal = null;

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
            vegetarian: vegetarian,
            vegan: vegan,
            kosher: kosher,
            halal: halal,
            serving: serving,
            time: time,
            difficulty: difficulty,
            sortBy: null
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
                summary = '<p id="rcorners1"><b>' + article.name + '</b> - ' + article.summary;
                summary += '<br>Vg: ' + article.vegetarian + ', Ve: ' + article.vegan + ', Ko: ' + article.kosher + ', Ha: ' + article.halal;
                summary += '<br>Serves: ' + article.serving + ', Time: ' + article.time + ', Difficulty: ' + article.difficulty + '</p>';
                iconDisplay.insertAdjacentHTML("beforeend", summary);
            }
        })
    })
    .catch(err => console.log(err));
}

validate = function() {
    alert("Filter submitted");
}

initialSearch();
