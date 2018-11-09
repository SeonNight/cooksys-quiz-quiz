import vorpal from 'vorpal'
import { prompt } from 'inquirer'

import {
  readFile,
  writeFile,
  chooseRandom,
  createPrompt,
  createQuestions
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
      .then(questions => writeFile(title,questions)))
    .catch(err => console.log('Error creating the quiz.', err))

//Take a quiz and put answeres in outputfile
const takeQuiz = (title, output) => 
  readFile(title)
    .then(quiz => prompt(quiz)
      .then(answers => writeFile(output,answers)))
    .catch(err => console.log('Error while taking Quiz.', err))

//Fuse all the quizes together and return a random quiz from all,
// then put answers into output
const takeRandomQuiz = (quizes, output, n) =>
  Promise.all(quizes.map(fileName => readFile(fileName)))
    .then(values => [].concat.apply([], values))
    .then(combineTest => chooseRandom(combineTest))
    .then(randomTest => prompt(randomTest)
      .then(answers => writeFile(output,answers)))
    .catch(err => console.log('Error while taking random Quiz.', err))


//REMEMBER: return a promise or command line will just exit, look at vorpal docs

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
  .action(function (input, callback) {
    return takeQuiz(input.fileName,input.outputFile)
  })

cli
  .command(
    'random <outputFile> <fileNames...>',
    'Loads a quiz or' +
      ' multiple quizes and selects a random number of questions from each quiz.' +
      ' Then, saves the users answers to the given outputFile'
  )
  .action(function (input, callback) {
    return takeRandomQuiz(input.fileNames,input.outputFile,2)
  })

cli.delimiter(cli.chalk['yellow']('quizler>')).show()
