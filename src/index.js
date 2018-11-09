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

const createQuiz = title =>
  prompt(askForQuestions)
    .then(answer =>
      // TODO finish createQuiz logic
      console.log(answer)
    )
    .catch(err => console.log('Error creating the quiz.', err))

// const takeQuiz = (title, output) =>
// TODO implement takeQuiz

// const takeRandomQuiz = (quizes, output, n) =>
// TODO implement takeRandomQuiz


//REMEMBER: return a promise or command line will just exit, look at vorpal docs

cli
  .command(
    'create <fileName>',
    'Creates a new quiz and saves it to the given fileName'
  )
  .action(function (input, callback) {
    // TODO update create command for correct functionality
    return createQuiz(input.fileName)
  })

cli
  .command(
    'take <fileName> <outputFile>',
    'Loads a quiz and saves the users answers to the given outputFile'
  )
  .action(function (input, callback) {
    // TODO implement functionality for taking a quiz
  })

cli
  .command(
    'random <outputFile> <fileNames...>',
    'Loads a quiz or' +
      ' multiple quizes and selects a random number of questions from each quiz.' +
      ' Then, saves the users answers to the given outputFile'
  )
  .action(function (input, callback) {
    // TODO implement the functionality for taking a random quiz
  })

cli.delimiter(cli.chalk['yellow']('quizler>')).show()
