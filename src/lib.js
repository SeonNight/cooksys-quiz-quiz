//Choose random array from given array
const chooseRandom = (array, numItems) => {
    return (array === undefined) ?
        [] //If array is undefined return an empty array
        : (array.length < 2) ?
            array //If array has the length of 0 or 1 just return the array
            : array.slice().map((cur, ind, curArray) => { //Create a random array with given length
                return curArray.splice(Math.floor(Math.random() * (array.length - ind)) + ind,1,curArray[ind])[0]
                }).splice(0,(numItems === undefined || numItems < 1 || numItems > array.length) ?
                    Math.floor(Math.random() * array.length) + 1 //If given number is invalid return a number between 1 and array length
                    : numItems)
}

//Create prompt using Json object input
const createPrompt = (input) => {
    //Get random id for questions
    const getRand = () => {
        return Math.random().toString(36).substr(2, 9);
    }
    //Get the number of (questions/choices)
    const getValue = (input, name, defaultVal) => {
        //If the input is invalid return the default value
        return (input === undefined) ? defaultVal : (input[name] === undefined) ? defaultVal : parseInt(input[name])
    }
    //Create the choices prompt
    const getChoices = (id,numChoices) => {
        return Array.apply(null, {length: numChoices}).map((cur,index) => {return {
            type: 'input',
            name: `question-${id}-choice-${index+1}`,
            message: `Enter answer choice ${index+1} for question ${id}`
        }})
    }
    //Create the question prompt
    const getQuestionsAndChoices = (id,numChoices) => {
        return [{
            type: 'input',
            name: `question-${id}`,
            message: `Enter question ${id}`
        }].concat(getChoices(id,numChoices)).concat({
            type: 'input',
            name: `question-${id}-answer`,
            message: `Enter which answer choice is correct for question ${id}`,
            validate: input => {
                const pass = input.match(new RegExp('^(?:[1-' + numChoices + ']|0[1-' + numChoices + ']|' + numChoices+')$'))
                //const pass = input.match(/^(?:[1-4]|0[1-4]|4)$/)
                return pass ? true : `Please enter a valid number! (1-${numChoices})`
            }
        })
    }
    //Create a prompt based on number of questions and choices
    const getPrompt = (numQuestions, numChoices) => {
        return [].concat.apply([],Array.apply(null, {length: numQuestions}).map((cur,index) => {
            return getQuestionsAndChoices(getRand(),numChoices)
        }))
    }

    //return created prompt
    return getPrompt(getValue(input, 'numQuestions', 1),getValue(input, 'numChoices', 2))
}

//Create questions using Json object input
const createQuestions = (questions) => {
    //Get the questions
    const getQuestions = (json) => {return Object.keys(json).filter(key=>(!key.includes('choice') && !key.includes('answer')))}
    //Get the choices of question
    const getChoices = (json, name) => {return Object.keys(json).filter(key => key.indexOf(name + '-choice-') == 0 ).map(key=>json[key])}
    //Get answers
    const getAnswers = (json) => {return Object.keys(json).filter(key=>key.includes('answer'))}
    //Create the json set
    const getQuestionsAndChoicesSet = (questionName,message,choices) => {
        return {type: 'list',
            name: questionName,
            message: message,
            choices: choices
        }
    }
    //Get an answer object
    const getAnswerSet = (questionName, answer) => {
        return {
            [questionName]: answer
        }
    }

    //Get the list of questions and choices
    const getQuestionList = (json) => {
        return (json === undefined) ? [] : getQuestions(json).map((cur) =>{
                return getQuestionsAndChoicesSet(cur,json[cur],getChoices(json,cur))
            })
    }

    //Get a array of answers
    const getAnswerList = (json) => {
        return getAnswers(json).map((cur,ind) => {return getAnswerSet(cur.replace('-answer',''),json[cur.replace('-answer','-choice-')+json[cur]])})
    }

    //Get questions and answers
    const getQuestionsAndAnswers = (json) => {
        return [getQuestionList(json),getAnswerList(json)]
    }

    //Return questions and answers
    return getQuestionsAndAnswers(questions)
}

import fs from 'fs'

const readFile = fileName => {
    return new Promise((resolve, reject) => {
        fs.readFile('quizes/'+fileName,(err, data) => {
            if(err) {
                reject(err)
            } else {
                resolve(JSON.parse(data))
            }
        })
    })
}
//Read file + passing extra data
const readFileExtra = (fileName, extraData) => {
    return new Promise((resolve, reject) => {
        fs.readFile('quizes/'+fileName,(err, data) => {
            if(err) {
                reject(err)
            } else {
                resolve([JSON.parse(data),extraData])
            }
        })
    })
}
const writeFile  = (fileName,data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile('quizes/'+fileName,JSON.stringify(data,null,2),err => {
            if(err) {
                reject(err)
            } else {
                resolve('file saved successfully')
            }
        })
    })
}

//Grade quiz
const gradeQuiz = (takenQuiz, quizAnswers) => {
    //Whiche you got correct
    let sum = 0;
    //Total count
    let count = 0;
    //Turn quizAnswers into one object
    let quizAnswersConcat = quizAnswers.reduce(function(result, currentObject) {
        for(var key in currentObject) {
            if (currentObject.hasOwnProperty(key)) {
                result[key] = currentObject[key];
            }
        }
        return result;
    }, {})
    //Count which ones are correct
    for(let v of Object.keys(takenQuiz).map(key => takenQuiz[key] == quizAnswersConcat[key])) {
        count++
        if(v) {
            sum++
        }
    }
    //Return grade
    console.log("Grade: " + parseInt(sum/count * 100))
    return parseInt(sum/count * 100)
}

//Export above functions
export {chooseRandom, createPrompt, createQuestions, readFile, writeFile, gradeQuiz, readFileExtra}
