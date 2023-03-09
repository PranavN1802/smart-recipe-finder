const iconDisplay = document.querySelector('.main_content');

/*
console.log("recipeIcons loaded");
request.post('http://localhost:3000/recipes/search',
        { json: { type: "initial" }},
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                body = body.json();
                body.forEach(article => {
                    const summary = '<p id="rcorners1"><b>' + article.name + '</b> - ' + article.summary + '</p>';
                    iconDisplay.insertAdjacentHTML("beforeend", summary);
                });
                console.log(body);
            }
        }
);
*/


fetch('http://localhost:3000/recipes/search')
    .then(response => response.json())
    .then(data => {
        data.forEach(article => {
            const summary = '<p id="rcorners1"><b>' + article.name + '</b> - ' + article.summary + '</p>';
            iconDisplay.insertAdjacentHTML("beforeend", summary);
        });
    })
    .catch(err => console.log(err));
