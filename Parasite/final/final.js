let quiz = [];    

let SelectedQ;
let SelectedA;
let randomN = 0;
let rand = -1;
let lastQ = -1;
let norepeat = [];
const checkBoxes = document.querySelectorAll("input[type=checkbox]");

function nextQ() {
    do {
    randomN = Math.floor(Math.random() * quiz.length);
    } while (norepeat.includes(randomN) === true || randomN === lastQ);
    rand = randomN;
    lastQ = rand;

    norepeat.push(rand);

    if (norepeat.length >= Math.floor(quiz.length * 0.75)) {
    norepeat.shift();
    }

    let percentage = document.getElementById("percentage").value;
    let flip = Math.random() * 10;
    
    if (percentage < flip) {
    SelectedQ = quiz[rand].question;
    SelectedA = quiz[rand].answer;
    }
    else {
    SelectedQ = quiz[rand].answer;
    SelectedA = quiz[rand].question;
    };
    document.getElementById("question").innerHTML = `${SelectedQ}`;
    document.getElementById("result").innerHTML = ``;
    document.getElementById("ansInput").value = "";
    //document.getElementById("debug").innerHTML = `rand=${rand}, norepeat=${norepeat.toString()}, lastQ=${lastQ}`;
}

function checkAns() {
    let input = document.getElementById("ansInput").value;
    
    if (input === SelectedA || input === SelectedA + ' ' || input === SelectedA + '.') {
    document.getElementById("result").innerHTML = `Correct`;
    }
    else {
    document.getElementById("result").innerHTML = `Incorrect! <i>${SelectedA}</i>`;
    norepeat.pop();
    }
}

function updateQuiz() {
    quiz = Array.from(checkBoxes)
    .filter(elm => elm.checked)
    .flatMap(elm => {
        const dataId = elm.getAttribute('data-id');
        if (dataId === 'trematoda_') return trematoda_;
        if (dataId === 'protozoa_') return protozoa_;
        if (dataId === 'amoeba_') return amoeba_;
        if (dataId === 'snail_') return snail_;
        return [];
    });
    norepeat = [];
    nextQ();
}

window.onload = function() {
    checkBoxes.forEach(elm => elm.addEventListener("change", updateQuiz));
    updateQuiz();
    
    document.getElementById("ansInput").addEventListener("keyup", ({key}) => {
    if (key === "Enter") {
        checkAns();
    }
    });
}