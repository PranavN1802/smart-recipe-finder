const iconDisplay = document.querySelector('.main_content');

fetch('http://localhost:3000/recipes/search')
    .then(response => response.json())
    .then(data => {
        data.forEach(article => {
            const summary = '<p id="rcorners1"><b>' + article.name + '</b> - ' + article.summary + '</p>';
            iconDisplay.insertAdjacentHTML("beforeend", summary);
        });
    })
    .catch(err => console.log(err));