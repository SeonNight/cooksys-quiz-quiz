'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.writeFile = exports.readFile = exports.createQuestions = exports.createPrompt = exports.chooseRandom = undefined;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//Choose random array from given array
const chooseRandom = (array, numItems) => {
    return array === undefined ? [] //If array is undefined return an empty array
    : array.length < 2 ? array //If array has the length of 0 or 1 just return the array
    : array.slice().map((cur, ind, curArray) => {
        //Create a random array with given length
        return curArray.splice(Math.floor(Math.random() * (array.length - ind)) + ind, 1, curArray[ind])[0];
    }).splice(0, numItems === undefined || numItems < 1 || numItems > array.length ? Math.floor(Math.random() * array.length) + 1 //If given number is invalid return a number between 1 and array length
    : numItems);
};

//Create prompt using Json object input
const createPrompt = input => {
    //Get the number of (questions/choices)
    const getValue = (input, name, defaultVal) => {
        //If the input is invalid return the default value
        return input === undefined ? defaultVal : input[name] === undefined ? defaultVal : parseInt(input[name]);
    };
    //Create a prompt based on number of questions and choices
    const getPrompt = (numQuestions, numChoices) => {
        return Array.apply(null, { length: numQuestions + numQuestions * numChoices }).map((cur, index) => {
            return index % (numChoices + 1) === 0 ? {
                type: 'input',
                name: `question-${Math.floor(index / (numChoices + 1)) + 1}`,
                message: `Enter question ${Math.floor(index / (numChoices + 1)) + 1}`
            } : {
                type: 'input',
                name: `question-${Math.floor(index / (numChoices + 1)) + 1}-choice-${index % (numChoices + 1)}`,
                message: `Enter answer choice ${index % (numChoices + 1)} for question ${Math.floor(index / (numChoices + 1)) + 1}`
            };
        });
    };

    //return created prompt
    return getPrompt(getValue(input, 'numQuestions', 1), getValue(input, 'numChoices', 2));
};

//Create questions using Json object input
const createQuestions = questions => {
    //Get the questions
    const getQuestions = json => {
        return Object.keys(json).filter(key => !key.includes('choice'));
    };
    //Get the choices of question
    const getChoices = (json, name) => {
        return Object.keys(json).filter(key => key.indexOf(name + '-choice-') == 0).map(key => json[key]);
    };

    //Create the json set
    const getSet = (questionName, message, choices) => {
        return { type: 'list',
            name: questionName,
            message: message,
            choices: choices
        };
    };

    //Get the list of questions and choices
    const getQuestionList = json => {
        return json === undefined ? [] : getQuestions(json).map(cur => {
            return getSet(cur, json[cur], getChoices(json, cur));
        });
    };

    //Return questions
    return getQuestionList(questions);
};

const readFile = fileName => {
    return new Promise((resolve, reject) => {
        _fs2.default.readFile(fileName, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
};

const writeFile = (fileName, data) => {
    return new Promise((resolve, reject) => {
        _fs2.default.writeFile(fileName, JSON.stringify(data, null, 2), err => {
            if (err) {
                reject(err);
            } else {
                resolve('file saved successfully');
            }
        });
    });
};
//Export above functions
exports.chooseRandom = chooseRandom;
exports.createPrompt = createPrompt;
exports.createQuestions = createQuestions;
exports.readFile = readFile;
exports.writeFile = writeFile;