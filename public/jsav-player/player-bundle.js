(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const EXEC_ENV = 'STATIC';
const SUBMISSION_URL = 'http://localhost:3000/submissions';

module.exports = {
  EXEC_ENV,
  SUBMISSION_URL
}

},{}],2:[function(require,module,exports){
let $ = window.$;

const dataStructures = require("../dataStructures/dataStructures")
const { getSwappedIndexes, isSwap } = require("../utils/helperFunctions")
const modelSolution = {
  being: "",
  end: "",
  stepsForward: [],
  stepsBackward: [],
}

function setAnimationSteps(av, submission) {
  setMutationObserver($('.jsavoutput')[0]);
  submission.animation.forEach(step => {
    switch(step.type) {
      case "click":
        try {
          handleClick(av, step)
        } catch (err) {
          console.warn(`Error handling click action: ${err.message} \n continuing with execution but shown animation
          might not respond real submission`)
        }
        break;
      case String(step.type.match(/^model-.*/)):
        try {
          handleModelSolution(av, step)
        } catch (err) {
          console.warn(`Error when openening model solution window: ${err}`)
        }
        break;
      case "state-change":
        try {
          handleStateChange(av, step)
        } catch (err) {
          console.warn(`Error handling state change: ${err.message} \n continuing with execution but shown animation
          might not respond real submission`)
        }
        break;
      case "undo":
      try {
        handleUndo(av, step)
      } catch (err) {
        console.warn(`Error handling undo: ${err.message} \n continuing with execution but shown animation
        might not respond real submission`)
      }
      break;
      case "grade":
        try {
          handleGradeEvent(av, step)
        } catch (err) {
          console.warn(`Error handling grade event: ${err.message} \n continuing with execution but shown animation
          might not respond real submission`)
        }
        break;
      default:
        throw new Error(`Unknown animation step type: ${JSON.stringify(step)}`)
    }
  })
}

function handleClick(av, step) {
  const dataStructure = dataStructures.getDataStructure(step.dataStructureId)
  switch(dataStructure.type) {
    case "array":
      handleArrayClick(av,dataStructure, step)
      break
    default:
      throw new Error(`Unknown data structure type: ${JSON.stringify(step)}`)
    }
}

function handleArrayClick(av, dataStructure, step) {
  dataStructure.arr.highlight(step.index)
  av.step()
}

function handleArrayStateChange(av, dataStructure, step) {
  const oldState = dataStructure.arr._values
  const newState = step.state
  const stateChangeType = getArrayStateChangeType(oldState, newState)
  switch(stateChangeType) {
    case "swap":
      const [ i, j ] = getSwappedIndexes(oldState, newState)
      dataStructure.arr.swap(i, j)
      dataStructure.arr.unhighlight(i)
      dataStructure.arr.unhighlight(j)
      av.step();
      av.clearumsg();
      break
    default:
      dataStructure.arr.unhighlight()
      throw new Error(`Unknown state change type: ${stateChangeType}`)
  }
}

function getArrayStateChangeType(oldState, newState) {
  if(isSwap(oldState, newState)){
    return "swap"
  }
  return `Old state: ${oldState} \n New statea: ${newState}`
}

function handleModelSolution(av, step) {
  switch(step.type) {
    case "model-recorded":
      modelSolution.begin = step.state;
      av.umsg("Model solution opened", {"color": "blue"});
      av.step();
      break;
    case "model-forward":
      modelSolution.stepsForward.push(step.state)
      av.umsg(`Model solution forward ${modelSolution.stepsForward.length}`, {"color": "blue"});
      av.step();
      break;
    case "model-backward":
      modelSolution.stepsBackward.push(step.state)
      av.umsg(`Model solution backward ${modelSolution.stepsBackward.length}`, {"color": "blue"});
      av.step();
      break;
    case "model-begin":
      av.umsg(`Model solution to first step`, {"color": "blue"});
      av.step();
      break;
    case "model-end":
      modelSolution.end = step.state;
      av.umsg(`Model solution to last step`, {"color": "blue"});
      av.step();
      break;
    case "model-close":
      av.umsg(`Model solution closed`, {"color": "blue"});
      av.step();
      break;
    default:

  }
}

function handleGradeEvent(av, step)  {
  av.umsg("Animation finished", {"color": "red"});
  Object.keys(step.score).forEach(key => {
    let span = document.createElement('span')
    span.innerText = `${key[0].toUpperCase()}${key.slice(1)}: ${step.score[key]} `
    document.getElementById('scores').appendChild(span)
  })
  av.step();
}

function handleStateChange(av, step) {
  const dataStructure = dataStructures.getDataStructure(step.dataStructureId)
  switch(dataStructure.type) {
    case "array":
      try {
        handleArrayStateChange(av, dataStructure, step)
      } catch (err) {
        console.warn(`Error handling array state change: ${err.message} \n continuing with execution but shown animation
        might not respond real submission`)
      }
      break
    default:
      throw new Error(`Unknown data structure type: ${JSON.stringify(step)}`)
  }
}

function handleUndo(av, step) {
  av.umsg("Undo", {"color": "red"});
  return handleStateChange(av, step);
}

//We need it to set the content of the model solution div
const setMutationObserver = (targetNode) => {
  let msIndex;
  const callback = function(mutationsList, observer) {
    let text;
    for(let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        if(mutation.target) {
          if(mutation.target.firstChild) {
            if(mutation.target.firstChild.innerText) {
              text = mutation.target.firstChild.innerText;
            }
          }
        }
        if(text){
          switch(text) {
            case "Model solution opened":
              msIndex = 0;
              $('#model-solution')[0].innerHTML = modelSolution.begin
              break;
            case String(text.match(/.*forward.*\d*/)):
              msIndex = parseInt(String(text.match(/\d+/))) -1;
              $('#model-solution')[0].innerHTML = modelSolution.stepsForward[msIndex]
              break;
            case String(text.match(/.*backward.*\d*/)):
              msIndex = parseInt(String(text.match(/\d+/))) -1;
              $('#model-solution')[0].innerHTML = modelSolution.stepsBackward[msIndex]
              break;
            case String(text.match(/.*first step/)):
              $('#model-solution')[0].innerHTML = modelSolution.begin
              break;
            case String(text.match(/.*last step/)):
              $('#model-solution')[0].innerHTML = modelSolution.end;
              break;
            case "Model solution closed":
              $('#model-solution')[0].innerHTML = "";
              break;
            case "Animation finished":
              let stopButton = $('#pause-button')[0]
              if(stopButton) {
                stopButton.click();
              }
              break;
            default:
              $('#model-solution')[0].innerHTML = "";
              break;
          }
        }
      }
    }
  }
  const config = { childList: true, subtree: true };
  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
}

// export default {
//   setAnimationSteps
// }

module.exports = {
  setAnimationSteps,
}

},{"../dataStructures/dataStructures":3,"../utils/helperFunctions":7}],3:[function(require,module,exports){
const dataStructures = []

function addArray(submissionId, arr) {
  dataStructures.push({
    type: "array",
    submissionId,
    arr })
}

function getDataStructure(submissionId) {
  return dataStructures.find(ds => ds.submissionId === submissionId)
}

function reset() {
  console.warn('Clearing animation data structures');
  dataStructures.forEach((e) => dataStructures.pop())
}

module.exports = {
  addArray,
  getDataStructure,
  reset
}

},{}],4:[function(require,module,exports){
const dataStructures = require("../dataStructures/dataStructures")

function setInitialDataStructures (av, submission) {
  submission.initialState.forEach(ds => {
    switch (ds.type) {
      case "array":
        setArray(av, ds)
        break
      // TODO cases for other ds types
      default:
        throw new Error(`Submission contains unknown data structure type: ${ds}`)
    }
  })
}

function setArray (av, arrayDs) {
  const arr = av.ds.array(arrayDs.values, arrayDs.options)
  dataStructures.addArray(arrayDs.id,arr)
}

module.exports = {
  setInitialDataStructures
}

},{"../dataStructures/dataStructures":3}],5:[function(require,module,exports){
const initialState = require("./initialState/initialState")
const animation = require("./animation/animation")
const dataStructures = require("./dataStructures/dataStructures")
const rest = require("./rest/rest")
const env = require('./.env.js');
let $ = window.$;

async function initialize(JSAV) {
  // let message = env.SUBMISSION_URL ? `Fetching submission data from server`
  // : `No server url provided, reading submission data from window global object`;
  try {
    // console.warn(message);
    // let submission = env.SUBMISSION_URL ? await getSingleSubmission(env.SUBMISSION_URL)
    // : window.submission
    let submission = JSON.parse(new URL(location.href).searchParams.get('submission'))
    console.log('submission', submission);
    if(submission && Object.keys(submission).length > 0){
      initiateAnimation(JSAV, submission);
      setListeners();
    } else {
      console.warn('No animation data received')
    }
  } catch (err) {
    alertAndLog(err)
  }
}

async function getSingleSubmission(url) {
  try {
    const submissions = await rest.getSubmissions(url);
    return submissions[submissions.length -1]
  } catch (err) {
    throw new Error(` Failed getting submission from address ${url}: ${err}`)
  }
}

function initiateAnimation(JSAV, submission) {
  try {
    new JSAV.utils.Settings($('#settings'));
    const instructions = submission.definitions.options.instructions;
    const title = submission.definitions.options.title
    $("#exercise-instructions").innerHTML = instructions;
    let av = new JSAV($("#jsavcontainer"), { title: title })
    initialState.setInitialDataStructures(av, submission)
    av.displayInit();
    animation.setAnimationSteps(av, submission)
    av.recorded();
  } catch (err) {
    console.warn(err)
    throw err
  }
}

function setListeners() {
  $("#play-button").on('click', startAutoAnimation)
  document.onkeydown = function(event) {
    //let n = $('.jsavbackward').length -1
    switch (event.keyCode) {
      case 37:
        $('.jsavbackward')[0].click()
        break;
      case 38:
        $('.jsavbegin')[0].click()
        break;
      case 39:
        $('.jsavforward')[0].click()
        break;
      case 40:
        $('.jsavend')[0].click()
        break;
    }
  }
}

const startAutoAnimation = () => {
  let animator = startAnimator()
  $("#play-button").off('click', startAutoAnimation)
  $('.jsavforward')[0].click()
  $("#stop-button").on('click', () => {
    clearInterval(animator)
    $('.jsavbegin')[0].click();
    $("#play-button").on('click', startAutoAnimation)
  })
  $("#pause-button").on('click', () => {
    clearInterval(animator)
    $("#play-button").on('click', startAutoAnimation)
  })
}

const startAnimator = () => {
  return setInterval(timedAction, 1000);
}

const timedAction = () => {
  $('.jsavforward')[0].click();
}


const alertAndLog = (error) => {
  alert(`Error handling animation: ${error.message} \n continuing with execution but the shown animation
  might not respond real submission`);
  console.warn(`Error handling animation: ${error.message} \n continuing with execution but shown animation
  might not respond real submission`)
}

if(env.EXEC_ENV === 'STATIC') {
  initialize(window.JSAV, window.submission);
}


window.initializeAnimation = initialize;
window.resetAnimationData = dataStructures.reset;

module.exports = {
  initialize
}

// let player = {
//   initialize
// }
// export default player;

},{"./.env.js":1,"./animation/animation":2,"./dataStructures/dataStructures":3,"./initialState/initialState":4,"./rest/rest":6}],6:[function(require,module,exports){
const server = "http://localhost:3000/submissions"

async function getSubmissions () {  
  const response = await fetch(server)
  return response.json()
}

const rest = { getSubmissions }

module.exports = rest

},{}],7:[function(require,module,exports){
function getSwappedIndexes(oldState, newState) {
  const swappedIndices = []
  newState.forEach((v,i) => {
    if(oldState[i] !== v) {
      swappedIndices.push(i)
    }
  })  
  return isSwap(oldState, newState) && swappedIndices
}

function isSwap(oldState, newState) {
  const changedValues = oldState.filter((v,i) => {
    return newState[i] !== v
  })
  const newIndices = changedValues.map(v => newState.indexOf(v))
  return changedValues.length === 2 && newIndices.indexOf(-1) === -1
}

module.exports = {
  getSwappedIndexes,
  isSwap
}
},{}]},{},[5]);
