import vorpal from 'vorpal'
import { prompt } from 'inquirer'

import {
  readFile,
  writeFile,
  chooseRandom,
  createPrompt,
  createQuestions,
  gradeQuiz,
  readFileExtra
} from './lib'

const cli = vorpal()

const askForQuestions = [
  {
    type: 'input',
    name: 'numQuestions',
    message: 'How many questions do you want in your quiz?',
    validate: input => {
      const pass = input.match(/^[1-9]{1}$|^[1-9]{1}[0-9]{1}$|^100$/)
      return pass ? true : 'Please enter a valid number! (1-100)'
    }
  },
  {
    type: 'input',
    name: 'numChoices',
    message: 'How many choices should each question have?',
    validate: input => {
      const pass = input.match(/^(?:[2-4]|0[2-4]|4)$/)
      return pass ? true : 'Please enter a valid number! (2-4)'
    }
  }
]

//Create a quiz
const createQuiz = title =>
  prompt(askForQuestions)
    .then(answer => createPrompt(answer))
    .then(createdPrompt => prompt(createdPrompt)
      .then(inputedQuestions => createQuestions(inputedQuestions))
//      .then(questions => writeFile(title,questions)))
      .then(questionsAndAnswers => {
        writeFile(title,questionsAndAnswers[0])
        writeFile(title + '-answers', questionsAndAnswers[1])}))
    .catch(err => console.log('Error creating the quiz.', err))

//Take a quiz and put answeres in outputfile
const takeQuiz = (title, output, getGrade) => 
  readFile(title)
    .then(quiz => prompt(quiz)
      .then(answers => writeFile(output,answers)))
    .catch(err => console.log('Error while taking Quiz.', err))

//Fuse all the quizes together and return a random quiz from all file,
// then put answers into output file
const takeRandomQuiz = (quizes, output, n, getGrade) =>
  Promise.all(quizes.map(fileName => readFile(fileName)))
    .then(values => [].concat.apply([], values))
    .then(combineTest => chooseRandom(combineTest,n))
    .then(randomTest => prompt(randomTest)
      .then(answers => writeFile(output,answers)))
    .catch(err => console.log('Error while taking random Quiz.', err))


//Grade taken test
const gradeTakenQuiz = (takenQuiz, quizes, getGrade) => {
  Promise.all(quizes.map(fileName => readFile(fileName + '-answers')))
    .then(values => [].concat.apply([], values))
    .then(answers => readFileExtra(takenQuiz,answers))
    .then(info => gradeQuiz(info[0],info[1],getGrade))
    .catch(err => console.log('Error while grading Quiz.', err))
}

cli
  .command(
    'create <fileName>',
    'Creates a new quiz and saves it to the given fileName'
  )
  .action(function (input, callback) {
    return createQuiz(input.fileName)
  })

cli
  .command(
    'take <fileName> <outputFile>',
    'Loads a quiz and saves the users answers to the given outputFile'
  )
  //.option('-g, --grade', 'Grade quiz after completion')
  .action(function (input, callback) {
    return takeQuiz(input.fileName,input.outputFile,input.options.grade)
  })

cli
  .command(
    'random <outputFile> <fileNames...>',
    'Loads a quiz or' +
      ' multiple quizes and selects a random number of questions from each quiz.' +
      ' Then, saves the users answers to the given outputFile'
  )
  //.option('-g, --grade', 'Grade quiz after completion')
  .option('-q, --questions <number>', 'Input the number of questions you want in the quiz')
  .action(function (input, callback) {
    return takeRandomQuiz(input.fileNames,input.outputFile,input.options.questions,input.options.grade)
  })


  cli
  .command(
    'grade <fileName> <quizNames...>',
    'Grades quiz that was taken and returns grade'
  )
  .action(function (input, callback) {
    return gradeTakenQuiz(input.fileName,input.quizNames,true)
  })

cli.delimiter(cli.chalk['yellow']('<quizler>')).show()
