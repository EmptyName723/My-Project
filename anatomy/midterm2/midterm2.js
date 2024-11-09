document.addEventListener("DOMContentLoaded", function () {
  const IDList = ["0", "1354138976", "1009987224", "1141327788", "356285221", "1095511943", "477638692", "223957772"];
  const nameData = [];

  let showAsImage = false; // Toggle between text and image display

  function fetchData(id) {
    return new Promise((resolve, reject) => {
      const url = `https://docs.google.com/spreadsheets/d/e/2PACX-1vSCEadwvqHn1fjg5cjNSV8-n1xduRmdGg8TY5795C2uMPckvva_uo8VdIZSsCn2Lh9upJkVWuO16cEO/pub?gid=${id}&single=true&output=csv`;
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

  let thoraxBonesData = [];
  let thoraxMusclesData = [];
  let thoraxVesselsData = [];
  let thoraxNervesData = [];
  let armBonesData = [];
  let armMusclesData = [];
  let armVesselsData = [];
  let armNervesData = [];

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
    thoraxBonesData = nameData[0];
    thoraxMusclesData = nameData[1];
    thoraxVesselsData = nameData[2];
    thoraxNervesData = nameData[3];
    armBonesData = nameData[4];
    armMusclesData = nameData[5];
    armVesselsData = nameData[6];
    armNervesData = nameData[7];

    quiz = Array.from(checkBoxes)
      .filter(elm => elm.checked)
      .flatMap(elm => {
        const dataId = elm.getAttribute('data-id');
        if (dataId === 'thoraxBones_') return thoraxBonesData;
        if (dataId === 'thoraxMuscles_') return thoraxMusclesData;
        if (dataId === 'thoraxVessels_') return thoraxVesselsData;
        if (dataId === 'thoraxNerves_') return thoraxNervesData;
        if (dataId === 'armBones_') return armBonesData;
        if (dataId === 'armMuscles_') return armMusclesData;
        if (dataId === 'armVessels_') return armVesselsData;
        if (dataId === 'armNerves_') return armNervesData;
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
      
      if (selectedQuestion.image == "") {
        updateUI();
      }

      const imageURLs = (selectedQuestion.image || "").split(";"); // Split URLs by ";"
      const randomImageURL = imageURLs[Math.floor(Math.random() * imageURLs.length)].trim(); // Pick a random image URL

      const img = document.createElement("img");
      img.src = randomImageURL;
      img.alt = "No Anatomy Image :(";
      anatomyImg.innerHTML = '';
      anatomyImg.appendChild(img);
    } else {
      questionElement.innerHTML = selectedQuestion ? selectedQuestion.zh : "No question available.";
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
      resultElement.innerHTML = `Incorrect! The correct answer was: ${selectedAnswer}`;
      noRepeatIndex.pop();
    }
  }

  submitButton.addEventListener("click", checkAnswer);
  answerInput.addEventListener("keyup", () => {
    if (event.key === "Enter") {
      checkAnswer();
    }
  });

  nextButton.addEventListener("click", updateQuiz);

  toggleButton.addEventListener("click", () => {
    showAsImage = !showAsImage;
    updateUI();
  });

});
