document.addEventListener("DOMContentLoaded", function () {
    const IDList = ["0","1127021375"];
    const nameData = [];

    function fetchData(id) {
      return new Promise((resolve, reject) => {
        const url = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTD8Xa1Y46D0xgOF2F79jRb74_4If2AR8bFzoNT3nwWpDk34SSHoFidOfnMpawKt9yj9Wxepyh4l79Z/pub?gid=${id}&single=true&output=csv`;
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
    let muscleData = [];

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
      muscleData = nameData[1];

      quiz = Array.from(checkBoxes)
        .filter(elm => elm.checked)
        .flatMap(elm => {
          const dataId = elm.getAttribute('data-id');
          if (dataId === 'epithelium_') return epitheliumData;
          if (dataId === 'muscle_') return muscleData;
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

      const percentage = document.getElementById("percentage").value;
      const flip = Math.random() * 10;

      if (percentage < flip) {
        selectedQuestion = quiz[randomIndex].zh;
        selectedAnswer = quiz[randomIndex].en;
      } else {
        selectedQuestion = quiz[randomIndex].en;
        selectedAnswer = quiz[randomIndex].zh;
      }
      questionElement.textContent = selectedQuestion;
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