document.addEventListener("DOMContentLoaded", function () {
  const IDList = ["0","1799364348","921153934"];
  const nameData = [];

  function fetchData(id) {
    return new Promise((resolve, reject) => {
      const url = `https://docs.google.com/spreadsheets/d/e/2PACX-1vQOe2DbJt4qsq9EqJ8FWePmAtKziGCYbkudSxZXd999cmma8ukfyeNBM8gRPIK3KDwtioGjbLjcCBpB/pub?gid=${id}&single=true&output=csv`;
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

  let headBonesData = [];
  let headMusclesData = [];
  let neckData = [];

  let quiz = [];
  let selectedQuestion;
  let selectedAnswer;
  let randomIndex = 0;
  let lastQuestionIndex = -1;
  let noRepeatIndexes = [];
  let anatomyImgURL = "";

  const checkBoxes = document.querySelectorAll("input[type=checkbox]");
  const submitButton = document.getElementById("submit");
  const nextButton = document.getElementById("next");
  const questionElement = document.getElementById("question");
  const resultElement = document.getElementById("result");
  const answerInput = document.getElementById("ansInput");
  const anatomyImg = document.getElementById("anatomyImg");

  function updateQuiz() {
    headBonesData = nameData[0];
    headMusclesData = nameData[1];
    neckData = nameData[2];

    quiz = Array.from(checkBoxes)
      .filter(elm => elm.checked)
      .flatMap(elm => {
        const dataId = elm.getAttribute('data-id');
        if (dataId === 'headBones_') return headBonesData;
        if (dataId === 'headMuscles_') return headMusclesData;
        if (dataId === 'neck_') return neckData;
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
    anatomyImgURL = quiz[randomIndex].image;
    questionElement.textContent = selectedQuestion;
    resultElement.textContent = "";
    answerInput.value = "";

    anatomyImg.style.display = "none";  // Ensure the image is hidden initially
  }

  function checkAnswer() {
    const input = answerInput.value.trim();

    if (input === selectedAnswer || input === selectedAnswer + ' ' || input === selectedAnswer + '.') {
      resultElement.innerHTML = `Correct`;
    } else {
      resultElement.innerHTML = `Incorrect! <i>${selectedAnswer}</i>`;
      noRepeatIndexes.pop();
    }

    // Display the image
    if (window.innerWidth > 1000) {
      anatomyImg.innerHTML = `<img src="${anatomyImgURL}" alt="No Anatomy Image :(" style="width: 400px;">`;
    } else {
      anatomyImg.innerHTML = `<img src="${anatomyImgURL}" alt="No Anatomy Image :(" style="height: 30vh;">`;
    }
    anatomyImg.style.display = "block";
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
