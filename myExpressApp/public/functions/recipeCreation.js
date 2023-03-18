var ingredientRows = [0];
const ingredientTable = document.querySelector('#ingredientTable');

const $nameResult = $('#nameResult');
const $summaryResult = $('#summaryResult');
const $ingredientsResult = $('#ingredientTableResult');
const $stepsResult = $('#stepsResult');
const $recipeRefResult = $('#recipeRefResult')

createRecipe = function() {
    valid = true;

    // Checks name against regular expression
    const name = document.getElementById('name').value;
    const nameCheck = /^.{6,150}$/;
    if(nameCheck.test(name) == false) {
        valid = false;
        $nameResult.text('Name must be between 6 to 150 characters!');
        $nameResult.css('color', 'red');
    } else {
        $nameResult.text('Name is valid');
        $nameResult.css('color', 'green');
    }

    // Checks summary against reqular expression
    const summary = document.getElementById('summary').value;
    const summaryCheck = /^.{6,255}$/;
    if(summaryCheck.test(summary) == false) {
        valid = false;
        $summaryResult.text('Summary must be between 6 to 255 characters!');
        $summaryResult.css('color', 'red');
    } else {
        $summaryResult.text('Summary is valid');
        $summaryResult.css('color', 'green');
    }

    // Retrieves the values of serving, time and difficulty
    const serving = Number(document.getElementById('servingSize').value);
    const time = Number(document.getElementById('time').value);
    const difficulty = Number(document.getElementById('difficulty').value);

    // Sets the values of the dietary requirements
    var vegetarian = false;
    var vegan = false;
    var kosher = false;
    if(document.getElementById('vegetarian').checked) vegetarian = true;
    if(document.getElementById('vegan').checked) vegan = true;
    if(document.getElementById('kosher').checked) kosher = true;


    var nullIndex = [];
    var ingredients = [];
    var quantities = [];
    const ingredientCheck = /^.{1,50}$/;
    const quantityCheck = /^.{0,20}$/;

    for(var i=0; i < ingredientRows.length; i++) {
        index = ingredientRows[i];
        console.log(index);

        var ingredient = document.getElementById('ingredientName' + index).value;
        var quantity = document.getElementById('ingredientQuantity' + index).value;

        if(ingredientCheck.test(ingredient) == false) {
            valid = false;
            $ingredientsResult.text('All ingredient names must be between 1-50 characters!');
            $ingredientsResult.css('color', 'red');
            break;
        } else if(quantityCheck.test(quantity) == false) {
            valid = false;
            $ingredientsResult.text('All quantities must be between 0-20 characters!');
            $ingredientsResult.css('color', 'red');
            break;
        }

        if(quantity.length == 0) {
            console.log("empty");
            nullIndex.push(index);
        } else {
            ingredients.push(ingredient);
            quantities.push(quantity);
        }
    }
    if (ingredientCheck.test(ingredient) == true && quantityCheck.test(quantity) == true) {
        $ingredientsResult.text('Ingredients are valid');
        $ingredientsResult.css('color', 'green');

        for(var i=0; i < nullIndex.length; i++) {
            index = nullIndex[i];
            console.log(index);

            var ingredient = document.getElementById('ingredientName' + index).value;
            var quantity = document.getElementById('ingredientQuantity' + index).value;

            ingredients.push(ingredient);
            quantities.push(null);
        }
    }

    // Checks steps against reqular expression
    const steps = document.getElementById('steps').value;
    const stepsCheck = /^.{50,16777215}$/;
    if(stepsCheck.test(steps) == false) {
        valid = false;
        $stepsResult.text('Steps must be between 50 to 16,777,215 characters and cannot include a \'/\' or \'\\\' character!');
        $stepsResult.css('color', 'red');
    } else {
        $stepsResult.text('Summary is valid');
        $stepsResult.css('color', 'green');
    }

    // Checks reference against reqular expression
    var reference = document.getElementById('recipeRef').value;
    if(reference != "") {
        const referenceCheck = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
        if(referenceCheck.test(reference) == false) {
            valid = false;
            $recipeRefResult.text('Link must be valid!');
            $recipeRefResult.css('color', 'red');
        } else {
            $recipeRefResult.text('Link is valid');
            $recipeRefResult.css('color', 'green');
        }
    } else {
        reference = null;
    }

    alert("Name: " + name + "\nSummary: " +  summary + "\nServing: " + serving + "\nTime: " + time + "\nDifficulty: " + difficulty + "\nVegetarian: " + vegetarian + "\nVegan: " + vegan + "\nKosher: " + kosher + "\nIngredients: " + ingredients + "\nQuantities: " + quantities + "\nSteps: " + steps + "\nReference: " + reference);
    console.log(JSON.stringify({
        name: name,
        recRef: reference,
        vegetarian: vegetarian,
        vegan: vegan,
        kosher: kosher,
        halal: false,
        serving: serving,
        time: time,
        difficulty: difficulty,
        ingredients: ingredients,
        quantities: quantities,
        steps: steps,
        summary: summary
    }));

    if(valid == true) {
        fetch("http://localhost:3000/recipes/create/1", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: name,
                recRef: reference,
                vegetarian: vegetarian,
                vegan: vegan,
                kosher: kosher,
                halal: false,
                serving: serving,
                time: time,
                difficulty: difficulty,
                ingredients: ingredients,
                quantities: quantities,
                steps: steps,
                summary: summary
            })
        })
        .then((response) => response.json())
        .then(article => {
            if (article.alert != undefined) {
                if (article.alert == true) {
                    alert(article.text);
                } else {
                    alert(article.text);
                    window.location.replace("http://localhost:3000/recipes/view/" + article.recID.recID);
                }
            }
        })
        .catch(err => console.log(err));
    }
}

addIngredient = function(index) {
    const newIndex = index + 1;
    ingredientRows.push(newIndex);
    var entry = '';

    entry += '<tr id="entry' + newIndex + '">';
    entry += '<td><input type="text" class="recipeIngredient" id="ingredientName' + newIndex + '" placeholder="e.g Oat/Salt/Pasta"></td>';
    entry += '<td><input type="text" class="recipeIngredient" id="ingredientQuantity' + newIndex + '" placeholder="e.g 500g/3tbsp"></td>';
    entry += '<td><button title="Add Ingredient" class ="editRow" id="addIngredient' + newIndex + '" onclick="addIngredient(' + newIndex + ')"><span style="position: relative; bottom: 3px">';
    entry += '<img src="/images/plus.png" style="height: 10px; width: 10px;" alt="add"/></span></button></td>';
    entry += '<td id="removeIngredient' + newIndex + '"</td></tr>';

    ingredientTable.insertAdjacentHTML("beforeend", entry);

    const deleteButton = document.getElementById("removeIngredient" + index);
    deleteButton.innerHTML = '<td><button title="Remove Ingredient" class ="editRow" onclick="removeIngredient(' + index + ')"><span style="position: relative; bottom: 3px"><img src="/images/pot.png" style="height: 10px; width: 10px;" alt="add"/></span></button></td>';

    const addButton = document.getElementById("addIngredient" + index);
    addButton.remove();

    console.log(ingredientRows);
}

removeIngredient = function(index) {
    const location = ingredientRows.indexOf(index);
    if (location > -1) { // only splice array when item is found
        ingredientRows.splice(location, 1); // 2nd parameter means remove one item only
    }

    const row = document.getElementById("entry" + index);
    row.remove();

    console.log(ingredientRows);
}

validate = function() {
    alert("Filter submitted");
}