fetchDetails = function() {

    const $recipeName = $('#recipeName');
    const $summary = $('#summary');
    const recRef = document.querySelector('#recRef');
    const scrambledRef = document.querySelector('#scrambledRef');
    const $dietary = $('#dietary');
    const $difficulty = $('#difficulty');
    const $serving = $('#serving');
    const $time = $('#time');
    const ingredients = document.querySelector('#ingredients');
    const $steps = $('#steps');

    console.log(recID);

    fetch('http://localhost:3000/recipes/find/' + recID)
            .then(response => response.json())
            .then(data => {
                data = data[0];

                $recipeName.text(data.name);
                $summary.text(data.summary);
                recRef.insertAdjacentHTML("beforebegin", data.recRef);
                if (data.scrambledRef != "") scrambledRef.insertAdjacentHTML("beforebegin", data.scrambledRef);

                var dietary = '';
                if (data.vegetarian == 1) dietary += "Vegetarian, ";
                if (data.vegan == 1) dietary += "Vegan, ";
                if (data.kosher == 1) dietary += "Kosher ";
                $dietary.text(dietary);

                $difficulty.text(difficulty[data.difficulty]);
                $time.text(times[data.time]);
                $serving.text(servings[data.serving]);

                var ingredientEntry;
                for(var i = 0; i < data.ingredients.length; i++) {
                    ingredientEntry = '<li>' + data.ingredients[i];
                    if (i < data.quantities.length) ingredientEntry += ' - ' + data.quantities[i];
                    ingredientEntry += '</li>';

                    ingredients.insertAdjacentHTML("beforeend", ingredientEntry);
                }

                $steps.text(data.steps);
            })
            .catch(err => console.log(err));

    // <%= recID %>
}

var recID;

const difficulty = ['Easy', 'Medium', 'Hard']
const times = ['Less than 5 minutes', '5-10 minutes', '10-20 minutes', '20-30 minutes', '30-40 minutes', '40-50 minutes', '50-60 minutes', '60-90 minutes', '90-120 minutes', '120-180 minutes', 'More than 180 minutes'];
const servings = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'more than 10']

fetch(window.location.href, { method: "POST" })
            .then(response => response.json())
            .then(data => {
                recID = data.recID;
                fetchDetails();
            })
            .catch(err => console.log(err));