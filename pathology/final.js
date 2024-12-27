document.addEventListener("DOMContentLoaded", function () {
  const IDList = ["0"];
  const nameData = [];

  let showAsImage = true; // Toggle between text and image display

  function fetchData(id) {
    return new Promise((resolve, reject) => {
      const url = `https://docs.google.com/spreadsheets/d/e/2PACX-1vSH0OdJ6XqbkA6LvUriJ5VsY3HTGfH3Ym2WZnPqE2TtHuxh5Gjzh5W4_7kyuBw1CFNgqLFIjlsnW5VZ/pub?gid=${id}&single=true&output=csv`;
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

  let pathologySlides = [];

  let quiz = [];
  let selectedQuestion;
  let selectedAnswer;
  let randomIndex = 0;
  let noRepeatIndex = [];
  let lastQuestionIndex = -1;

  const checkBoxes = document.querySelectorAll("input[type=checkbox]");
  const submitButton = document.getElementById("submit");
  const nextButton = document.getElementById("next");
  const questionElement = document.getElementById("question");
  const resultElement = document.getElementById("result");
  const answerInput = document.getElementById("ansInput");
  const anatomyImg = document.getElementById("anatomyImg");
  const toggleButton = document.getElementById("toggleQuestionType");

  function updateQuiz() {
    pathologySlides = nameData[0];

    quiz = Array.from(checkBoxes)
      .filter(elm => elm.checked)
      .flatMap(elm => {
        const dataId = elm.getAttribute('data-id');
        if (dataId === 'pathologySlides_') return pathologySlides;
        return [];
      });
    
    noRepeatIndex = [];
    
    if (quiz.length === 0) {
      console.error("Quiz data is empty. Check if data is correctly loaded.");
      return;
    }

    updateUI();
  }

  function updateUI() {
    do {
      randomIndex = Math.floor(Math.random() * quiz.length);
    } while (noRepeatIndex.includes(randomIndex) || randomIndex === lastQuestionIndex);

    selectedQuestion = quiz[randomIndex];
    lastQuestionIndex = randomIndex;
    noRepeatIndex.push(randomIndex);

    if (noRepeatIndex.length >= Math.floor(quiz.length * 0.75)) {
      noRepeatIndex.shift();
    }

    if (!selectedQuestion) {
      console.error("Selected question is undefined.");
      return;
    }

    selectedAnswer = selectedQuestion.en || ""; // Get answer in English or set to empty string

    if (showAsImage) {
      questionElement.innerHTML = '';
      
      if (!selectedQuestion.image) {
        console.warn("No image available for the selected question.");
        updateUI();
        return;
      }

      const imageURLs = selectedQuestion.image.split(";").map(url => url.trim());
      const randomImageURL = `https://ee2.csmu.edu.tw/sysdata/doc/1/1c03048d5d0328ba/images/${imageURLs[Math.floor(Math.random() * imageURLs.length)]}.jpg`;

      const img = document.createElement("img");
      img.src = randomImageURL;
      img.alt = "No pathology Image :(";
      anatomyImg.innerHTML = '';
      anatomyImg.appendChild(img);
    } else {
      questionElement.innerHTML = selectedQuestion.zh || "No question available.";
      anatomyImg.innerHTML = '';
    }

    answerInput.value = '';
    resultElement.innerHTML = '';
  }

  function checkAnswer() {
    const inputAnswer = answerInput.value.trim();
    if (inputAnswer === selectedAnswer) {
      resultElement.innerHTML = 'Correct!';
    } else {
      resultElement.innerHTML = "Incorrect! The correct answer was:" + "<br>" + `${selectedAnswer}`;
      noRepeatIndex.pop();
    }
  }

  submitButton.addEventListener("click", checkAnswer);
  answerInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      checkAnswer();
    }
  });

  nextButton.addEventListener("click", updateQuiz);

  toggleButton.addEventListener("click", () => {
    showAsImage = !showAsImage;
    updateUI();
  });

  updateQuiz();
});
