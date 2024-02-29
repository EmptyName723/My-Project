document.addEventListener("DOMContentLoaded", function () {
  const IDList = ["0","1663373183"]//,"973606625","1127021375","862779847"];
  const nameData = [];

  function fetchData(id) {
    return new Promise((resolve, reject) => {
      const url = `https://docs.google.com/spreadsheets/d/e/2PACX-1vSqo6_o4uO88ZXLrRoVXG9HKSV_vrazbeewj5KgjGYExRyNAQm9bNOzz68bL_xffQA_lVEev4sXSIzr/pub?gid=${id}&single=true&output=csv`;
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch data for ID: ${id}`);
          }
          return response.text();
        })
        .then(name_csv => {
          const lines = name_csv.trim().split(/\r\n|\n|\r/);
          const headers = lines[0].split(',');
          const name_list = [];

          for (let i = 1; i < lines.length; i++) {
            const data = lines[i].split(',');
            const rowObject = {};

            for (let j = 0; j < headers.length; j++) {
              rowObject[headers[j]] = data[j];
            }

            name_list.push(rowObject);
          }

          resolve(name_list);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  Promise.all(IDList.map(id => fetchData(id)))
    .then(results => {
      results.forEach(result => {
        nameData.push(result);
      });
      updateQuiz();
    })
    .catch(error => {
      console.error(error);
    });

  let epitheliumData = [];
  let connectiveData = [];
  //let boneData = [];
  //let muscleData = [];
  //let nerveData = [];

  let quiz = [];
  let selectedQuestion;
  let selectedAnswer;
  let randomIndex = 0;
  let lastQuestionIndex = -1;
  let noRepeatIndexes = [];

  const checkBoxes = document.querySelectorAll("input[type=checkbox]");
  const submitButton = document.getElementById("submit");
  const nextButton = document.getElementById("next");
  const questionElement = document.getElementById("question");
  const resultElement = document.getElementById("result");
  const answerInput = document.getElementById("ansInput");

  function updateQuiz() {
    epitheliumData = nameData[0];
    connectiveData = nameData[1];
    //boneData = nameData[2];
    //muscleData = nameData[3];
    //nerveData = nameData[4];

    quiz = Array.from(checkBoxes)
      .filter(elm => elm.checked)
      .flatMap(elm => {
        const dataId = elm.getAttribute('data-id');
        if (dataId === 'epithelium_') return epitheliumData;
        if (dataId === 'connective_') return connectiveData;
        //if (dataId === 'bone_') return boneData;
        //if (dataId === 'muscle_') return muscleData;
        //if (dataId === 'nerve_') return nerveData;
        return [];
      });

    noRepeatIndexes = [];
    nextQuestion();
  }

  function nextQuestion() {
    do {
      randomIndex = Math.floor(Math.random() * quiz.length);
    } while (noRepeatIndexes.includes(randomIndex) || randomIndex === lastQuestionIndex);

    lastQuestionIndex = randomIndex;
    noRepeatIndexes.push(randomIndex);

    if (noRepeatIndexes.length >= Math.floor(quiz.length * 0.75)) {
      noRepeatIndexes.shift();
    }

    selectedQuestion = quiz[randomIndex].img;
    selectedAnswer = quiz[randomIndex].en;

    document.getElementById("question").innerHTML = `<img src=${selectedQuestion}" alt="Question Image">`;
    resultElement.textContent = "";
    answerInput.value = "";
  }

  function checkAnswer() {
    const input = answerInput.value.trim();

    if (input === selectedAnswer || input === selectedAnswer + ' ' || input === selectedAnswer + '.') {
      resultElement.innerHTML = `Correct`;
    } else {
      resultElement.innerHTML = `Incorrect! <i>${selectedAnswer}</i>`;
      noRepeatIndexes.pop();
    }
  }

  function handleKeyPress(event) {
    if (event.key === "Enter") {
      checkAnswer();
    }
  }

  checkBoxes.forEach(elm => elm.addEventListener("change", updateQuiz));
  submitButton.addEventListener("click", checkAnswer);
  nextButton.addEventListener("click", nextQuestion);
  answerInput.addEventListener("keyup", handleKeyPress);
});
