const iconDisplay = document.querySelector('.main_content');

// Makes an initial get request to display all recipes in the database
initialSearch = function() {
    fetch('http://localhost:3000/recipes/search')
        .then(response => response.json())
        .then(data => {
            data.forEach(article => {
                summary = '<p id="rcorners1"><b>' + article.name + '</b> - ' + article.summary;
                summary += '<br>Vg: ' + article.vegetarian + ', Ve: ' + article.vegan + ', Ko: ' + article.kosher + ', Ha: ' + article.halal;
                summary += '<br>Serves: ' + article.serving + ', Time: ' + article.time + ', Difficulty: ' + article.difficulty + '</p>';
                iconDisplay.insertAdjacentHTML("beforeend", summary);
            });
        })
        .catch(err => console.log(err));
}

// Parses the filter options selected in the nav bar into the correct JSON format,
// sends post request to the search route using the JSON,
// then adds the returned recipes to the display
filterRecipes = function() {
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

    //alert("Serving: " + serving+ ", Time: " + time + ", Diffuclty: " + difficulty + ", Vegetarian: " + vegetarian + ", Vegan: " + vegan + ", Kosher: " + kosher + ", Halal: " + halal);

    iconDisplay.innerHTML = "<p>Loading recipes...</p>";

    fetch("http://localhost:3000/recipes/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            search: null,
            ingredients: null,
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
            summary = '<p id="rcorners1"><b>' + article.name + '</b> - ' + article.summary;
            summary += '<br>Vg: ' + article.vegetarian + ', Ve: ' + article.vegan + ', Ko: ' + article.kosher + ', Ha: ' + article.halal;
            summary += '<br>Serves: ' + article.serving + ', Time: ' + article.time + ', Difficulty: ' + article.difficulty + '</p>';
            iconDisplay.insertAdjacentHTML("beforeend", summary);
        })
    })
    .catch(err => console.log(err));
}

validate = function() {
    alert("Filter submitted");
}

initialSearch();
