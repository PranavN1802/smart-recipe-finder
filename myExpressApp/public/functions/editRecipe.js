
const $nameResult = $('#nameResult');
const $summaryResult = $('#summaryResult');
const $servingSize = $('#servingSize');
const $time = $('#time');
const $difficulty = $('#difficulty');
const $vegetarian = $('#vegetarian');
const $vegan = $('#vegan');
const $kosher = $('#kosher');
const $ingredientsResult = $('#ingredientTableResult');
const $stepsResult = $('#stepsResult');
const $recipeRefResult = $('#recipeRefResult');

fetchDetails = function(){

    console.log(recID)

    fetch('http://localhost:3000/recipes/find/' + recID)
            .then(response => response.json())
            .then(data => {
                data = data[0];

                $nameResult.text(data.name);
                $summaryResult.text(data.summary);
                $servingSize.value(data.serving);
                $time.value(data.time);
                $difficulty.value(data.difficulty);
                $stepsResult.text(data.steps);
                $recipeRefResult.text(data.recRef);

            })
            .catch(err => console.log(err));

}

