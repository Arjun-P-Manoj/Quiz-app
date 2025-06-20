// Get DOM elements
const startBtn = document.querySelector(".start-btn");
const quizScreen = document.getElementById("quiz-screen");
const startScreen = document.getElementById("start-screen");
const choiceScreen = document.getElementById("choice-screen");
const resultScreen = document.getElementById("result-screen");
const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const currentQ = document.getElementById("current-question");
const totalQ = document.getElementById("total-question");
const scoreDisplay = document.querySelector(".score");
const finalScore = document.getElementById("final-score");
const maxScore = document.getElementById("max-score");
const restartBtn = document.getElementById("restart-btn");
const progressBar = document.getElementById("progress");

let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let selectedCategoryId = null;

// Restart quiz
document.getElementById("restart-btn").addEventListener("click", () => {
  location.reload();
  startBtn.textContent = "Start";
});

// Start quiz by fetching categories

startBtn.addEventListener("click", () => {
  startBtn.textContent = "Loading..";
  startBtn.disabled = true;
  fetchCategories();
});

// Fetch and show categories
async function fetchCategories() {
  const choiceContainer = document.querySelector(".choice-container");
  try {
    const res = await fetch("https://opentdb.com/api_category.php");
    const data = await res.json();
    const categories = data.trivia_categories;

    startScreen.classList.remove("active");
    choiceScreen.classList.add("active");

    choiceContainer.innerHTML = "";
    categories.forEach((category) => {
      const btn = document.createElement("button");
      btn.classList.add("quiz-btn");
      btn.textContent = category.name;
      btn.addEventListener("click", () => {
        selectedCategoryId = category.id;
        btn.classList.add("selected");
        fetchQuizData();
      });
      choiceContainer.appendChild(btn);
    });
  } catch (error) {
    console.error("Failed to load categories:", error);
    choiceContainer.textContent = "❌ Could not load categories.";
  }
}

// Fetch quiz questions
async function fetchQuizData() {
  try {
    const response = await fetch(
      `https://opentdb.com/api.php?amount=5&type=multiple&category=${selectedCategoryId}`
    );
    const data = await response.json();

    if (
      data.response_code !== 0 ||
      !data.results ||
      data.results.length === 0
    ) {
      throw new Error("No quiz questions found.");
    }

    questions = data.results;
    score = 0;
    currentQuestionIndex = 0;
    scoreDisplay.textContent = score;
    totalQ.textContent = questions.length;

    choiceScreen.classList.remove("active");
    quizScreen.classList.add("active");

    showQuestion();
  } catch (error) {
    alert("⚠️ Failed to load quiz. Please try again.\n" + error.message);
    console.error("Quiz load error:", error);
  }
}

// Display current question
function showQuestion() {
  const q = questions[currentQuestionIndex];
  const correctAnswer = decodeHTML(q.correct_answer);
  const options = [...q.incorrect_answers.map(decodeHTML), correctAnswer];
  options.sort(() => Math.random() - 0.5);

  questionText.textContent = decodeHTML(q.question);
  currentQ.textContent = currentQuestionIndex + 1;
  answersContainer.innerHTML = "";

  options.forEach((option) => {
    const btn = document.createElement("button");
    btn.classList.add("answer-btn");
    btn.textContent = option;
    btn.addEventListener("click", () => checkAnswer(option, correctAnswer));
    answersContainer.appendChild(btn);
  });

  updateProgressBar();
}

// Check user's answer
function checkAnswer(selectedAnswer, correctAnswer) {
  const buttons = document.querySelectorAll(".answer-btn");
  buttons.forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === correctAnswer) {
      btn.classList.add("correct");
    } else if (btn.textContent === selectedAnswer) {
      btn.classList.add("incorrect");
    }
  });

  if (selectedAnswer === correctAnswer) {
    score++;
    scoreDisplay.textContent = score;
  }

  setTimeout(() => {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      showQuestion();
    } else {
      showResult();
    }
  }, 1000);
}

// Show quiz result
function showResult() {
  quizScreen.classList.remove("active");
  resultScreen.classList.add("active");
  finalScore.textContent = score;
  maxScore.textContent = questions.length;
  document.getElementById("result-message").textContent =
    score === questions.length
      ? "Excellent!"
      : score >= questions.length / 2
      ? "Good Job!"
      : "Keep Practicing!";
}

// Progress bar update
function updateProgressBar() {
  const percent = (currentQuestionIndex / questions.length) * 100;
  progressBar.style.width = percent + "%";
}

// Decode HTML entities
function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}
