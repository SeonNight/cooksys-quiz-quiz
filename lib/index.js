'use strict';

var _vorpal = require('vorpal');

var _vorpal2 = _interopRequireDefault(_vorpal);

var _inquirer = require('inquirer');

var _lib = require('./lib');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const cli = (0, _vorpal2.default)();

const askForQuestions = [{
  type: 'input',
  name: 'numQuestions',
  message: 'How many questions do you want in your quiz?',
  validate: input => {
    const pass = input.match(/^[1-9]{1}$|^[1-9]{1}[0-9]{1}$|^100$/);
    return pass ? true : 'Please enter a valid number! (1-100)';
  }
}, {
  type: 'input',
  name: 'numChoices',
  message: 'How many choices should each question have?',
  validate: input => {
    const pass = input.match(/^(?:[2-4]|0[2-4]|4)$/);
    return pass ? true : 'Please enter a valid number! (2-4)';
  }
}];

//Create a quiz
const createQuiz = title => (0, _inquirer.prompt)(askForQuestions).then(answer => (0, _lib.createPrompt)(answer)).then(createdPrompt => (0, _inquirer.prompt)(createdPrompt).then(inputedQuestions => (0, _lib.createQuestions)(inputedQuestions))
//      .then(questions => writeFile(title,questions)))
.then(questionsAndAnswers => {
  (0, _lib.writeFile)(title, questionsAndAnswers[0]);
  (0, _lib.writeFile)(title + '-answers', questionsAndAnswers[1]);
})).catch(err => console.log('Error creating the quiz.', err));

//Take a quiz and put answeres in outputfile
const takeQuiz = (title, output, getGrade) => (0, _lib.readFile)(title).then(quiz => (0, _inquirer.prompt)(quiz).then(answers => (0, _lib.writeFile)(output, answers))).catch(err => console.log('Error while taking Quiz.', err));

//Fuse all the quizes together and return a random quiz from all file,
// then put answers into output file
const takeRandomQuiz = (quizes, output, n, getGrade) => Promise.all(quizes.map(fileName => (0, _lib.readFile)(fileName))).then(values => [].concat.apply([], values)).then(combineTest => (0, _lib.chooseRandom)(combineTest, n)).then(randomTest => (0, _inquirer.prompt)(randomTest).then(answers => (0, _lib.writeFile)(output, answers))).catch(err => console.log('Error while taking random Quiz.', err));

//Grade taken test
const gradeTakenQuiz = (takenQuiz, quizes, getGrade) => {
  Promise.all(quizes.map(fileName => (0, _lib.readFile)(fileName + '-answers'))).then(values => [].concat.apply([], values)).then(answers => (0, _lib.readFileExtra)(takenQuiz, answers)).then(info => (0, _lib.gradeQuiz)(info[0], info[1], getGrade)).catch(err => console.log('Error while grading Quiz.', err));
};

cli.command('create <fileName>', 'Creates a new quiz and saves it to the given fileName').action(function (input, callback) {
  return createQuiz(input.fileName);
});

cli.command('take <fileName> <outputFile>', 'Loads a quiz and saves the users answers to the given outputFile')
//.option('-g, --grade', 'Grade quiz after completion')
.action(function (input, callback) {
  return takeQuiz(input.fileName, input.outputFile, input.options.grade);
});

cli.command('random <outputFile> <fileNames...>', 'Loads a quiz or' + ' multiple quizes and selects a random number of questions from each quiz.' + ' Then, saves the users answers to the given outputFile')
//.option('-g, --grade', 'Grade quiz after completion')
.option('-q, --questions <number>', 'Input the number of questions you want in the quiz').action(function (input, callback) {
  return takeRandomQuiz(input.fileNames, input.outputFile, input.options.questions, input.options.grade);
});

cli.command('grade <fileName> <quizNames...>', 'Grades quiz that was taken and returns grade').action(function (input, callback) {
  return gradeTakenQuiz(input.fileName, input.quizNames, true);
});

cli.delimiter(cli.chalk['yellow']('<quizler>')).show();