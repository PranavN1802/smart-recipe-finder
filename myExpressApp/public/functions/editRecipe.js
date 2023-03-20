
const $nameResult = document.getElementById('name');
const $summaryResult = document.getElementById('summary');
const $servingSize = document.getElementById('servingSize');
const $time = document.getElementById('time');
const $difficulty = document.getElementById('difficulty');
const $vegetarian = document.getElementById('vegetarian');
const $vegan = document.getElementById('vegan');
const $kosher = document.getElementById('kosher');
const $ingredientsResult = $('#ingredientTableResult');
const $stepsResult = document.getElementById('steps');
const $recipeRefResult = document.getElementById('recipeRef');

fetchDetails = function(){

    alert("http request made");

    //console.log(recID)
    //console.log(req.recID);

    fetch('http://localhost:3000/recipes/find')
            .then(response => response.json())
            .then(data => {
                data = data[0];

                $nameResult.value = (data.name);
                $summaryResult.value =(data.summary);
                $servingSize.value =(data.serving);
                $time.value =(data.time);
                $difficulty.value =(data.difficulty);
                if (data.kosher == true) $kosher.checked = true;
                if (data.vegetarian == true) $vegetarian.checked = true;
                if (data.vegan == true) $vegan.checked = true;
                $stepsResult.value = (data.steps);
                $recipeRefResult.value = (data.recRef);

            })
            .catch(err => console.log(err));


}

validate = function() {
    alert("Source link worked!");
}

validate();

fetchDetails();