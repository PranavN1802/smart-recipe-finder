createRecipe = function() {
    const $nameResult = $('#nameResult');
    const $summaryResult = $('#summaryResult');
    const $ingredientsResult = $('#ingredientTableResult');
    const $stepsResult = $('#stepsResult');
    const $recipeRefResult = $('#recipeRefResult')

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

    

    if(document.getElementById('vegetarian').checked) vegetarian = true;
    else vegetarian = false;
    if(document.getElementById('vegan').checked) vegan = true;
    else vegan = false;
    if(document.getElementById('kosher').checked) kosher = true;
    else kosher = false;

    const steps = document.getElementById('steps').value;
    const stepsCheck = /^.{100,16777215}$/;
    if(stepsCheck.test(steps) == false) {
        valid = false;
        $stepsResult.text('Steps must be between 100 to 16,777,215 characters and cannot include a \'/\' or \'\\\' character!');
        $stepsResult.css('color', 'red');
    } else {
        $stepsResult.text('Summary is valid');
        $stepsResult.css('color', 'green');
    }

    const reference = document.getElementById('recipeRef').value;
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
    }

    alert("Name: " + name + ", Summary: " +  summary + ", Steps: " + steps + ", Reference: " + reference);
    console.log(name, summary, steps, reference);
}

validate = function() {
    alert("Filter submitted");
}