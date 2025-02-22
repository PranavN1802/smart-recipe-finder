fetchDetails = function() {

    const $recipeName = $('#recipeName');
    const $summary = $('#summary');
    const author = document.querySelector('#author');
    const recRef = document.querySelector('#recRef');
    const scrambledRef = document.querySelector('#scrambledRef');
    const icons = document.querySelector('#dietary');
    const serving = document.querySelector('#serving');
    const time = document.querySelector('#time');
    const ingredients = document.querySelector('#ingredients');
    const $steps = $('#steps');
    const upvotes = document.querySelector('#upvotes');
    

    console.log(recID);

    fetch('http://localhost:3000/recipes/find/' + recID)
            .then(response => response.json())
            .then(data => {
                console.log(data);

                $recipeName.text(data.name);

                if(typeof data.summary !== 'undefined') {
                    $summary.text(data.summary);
                    author.insertAdjacentHTML("beforeend", data.username)
                    if (data.recRef != null && data.recRef != 'null') recRef.insertAdjacentHTML("beforebegin", data.recRef);
                    if (data.scrambledRef != "" && data.scrambledRef != null && data.scrambledRef != 'null') scrambledRef.insertAdjacentHTML("beforebegin", data.scrambledRef);

                    var dietary = '<img class="recipe_icon"src="/images/icons/' + difficulties[data.difficulty] + '.png" alt="' + difficulties[data.difficulty] + '">';

                    if (data.vegetarian == 1) dietary += '<img class="recipe_icon"src="/images/icons/vegetarian.png" alt="vegetarian">';
                    if (data.vegan == 1) dietary += '<img class="recipe_icon"src="/images/icons/vegan.png" alt="vegan">';
                    if (data.kosher == 1) dietary += '<img class="recipe_icon"src="/images/icons/kosher.png" alt="kosher">';
                    icons.insertAdjacentHTML("beforeend", dietary);

                    serving.insertAdjacentHTML("beforebegin", '<b>' + servings[data.serving] + '</b>  ');
                    time.insertAdjacentHTML("beforebegin", '<b>' + times[data.time] + '</b>  ');

                    var ingredientEntry;
                    for(var i = 0; i < data.ingredients.length; i++) {
                        ingredientEntry = '<li>' + data.ingredients[i];
                        if (i < data.quantities.length && data.quantities[i] != 'null') ingredientEntry += ' - ' + data.quantities[i];
                        ingredientEntry += '</li>';

                        ingredients.insertAdjacentHTML("beforeend", ingredientEntry);
                    }

                    console.log(data.steps);
                    steps = data.steps.split('\n');
                    console.log(data.steps);

                    stepText = '';

                    $steps.text(data.steps);
                    upvotes.insertAdjacentHTML("beforeend", data.upvotes);
                }
            })
            .catch(err => console.log(err));

    // <%= recID %>
}

var recID;

const difficulties = ['easy', 'medium', 'hard']
const times = ['Less than 5 minutes', '5-10 minutes', '10-20 minutes', '20-30 minutes', '30-40 minutes', '40-50 minutes', '50-60 minutes', '60-90 minutes', '90-120 minutes', '120-180 minutes', 'More than 180 minutes'];
const servings = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'more than 10']

fetch(window.location.href, { method: "POST" })
            .then(response => response.json())
            .then(data => {
                recID = data.recID;
                fetchDetails();
            })
            .catch(err => console.log(err));

function scrambleRedirect(){
    window.location.replace("http://localhost:3000/recipes/scramble/" + recID);
}

report = function(){
    console.log('report function');

    fetch('http://localhost:3000/recipes/' + recID + '/report', { method: "POST" })
            .then(response => response.json())
            .then(data => {
                message = data.msg;
                alert(message);
            })
            .catch(err => console.log(err));
}

upvote = function(){
    console.log('upvote function');

    fetch('http://localhost:3000/recipes/' + recID + '/upvote', { method: "POST" })
            .then(response => response.json())
            .then(data => {
                message = data.msg;
                alert(message);
                window.location.reload();
            })
            .catch(err => console.log(err));
}



