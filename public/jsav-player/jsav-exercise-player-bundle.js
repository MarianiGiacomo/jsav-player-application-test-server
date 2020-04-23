(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
let $ = window.$;
let stepcount = -1
let showClicks = false;

initialize();

async function initialize() {
  try {
    let submission = await getSubmission();
    if(submission && Object.keys(submission).length > 0){
      initiateSlideShow(submission);
      initializeAnimationButtonsListeners(submission);
    } else {
      console.warn('No animation data received')
    }
  } catch (err) {
    console.warn(err)
  }
}

async function getSubmission() {
  try {
    const parsedUrl = new URL(window.location.href);
    const url = parsedUrl.searchParams.get("submission");
    const response = await fetch(url)
    const submission = response.json();
    return submission;
  } catch (err) {
    throw new Error(` Failed getting submission from address ${url}: ${err}`)
  }
}


function initiateSlideShow(submission) {
  let animationSteps = getAnimationSteps(submission);
  try {
    $('#animation-container')[0].innerHTML = submission.initialState.animationDOM;
    $('#step-forward').on('click', () => {
      if (stepcount +1 < animationSteps.length) {
        stepcount ++;
        $('#animation-container')[0].innerHTML = animationSteps[stepcount].animationDOM;
      } else {
        $('#animation-container')[0].innerHTML = '<h3>Ended</h3>'
      }
    });
    $('#to-beginning').on('click', () => {
      stepcount = -1;
      $('#animation-container')[0].innerHTML = submission.initialState.animationDOM;
    });
    $('#step-backward').on('click', () => {
      if (stepcount > 0) {
        stepcount --;
        $('#animation-container')[0].innerHTML = animationSteps[stepcount].animationDOM;
      } else {
        $('#animation-container')[0].innerHTML = submission.initialState.animationDOM;
      }
    });
    $('#to-end').on('click', () => {
      stepcount = animationSteps.length - 1;
      $('#animation-container')[0].innerHTML = animationSteps[stepcount].animationDOM
    });
  } catch (err) {
    console.warn(err)
    throw err
  }
}

function getAnimationSteps(submission) {
  let gradableSteps = submission.animation.filter(step => step.type === 'gradeable-step');
  let clickSteps = submission.animation.filter(step => step.type === 'click');
  return showClicks? clickSteps : gradableSteps;
}

function exportAnimation(submission) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(submission));
  newWindow = window.open(dataStr);
  // let dlAnchorElem = document.getElementById('downloadAnchorElem');
  // dlAnchorElem.setAttribute("href",     dataStr     );
  // dlAnchorElem.setAttribute("download", "scene.json");
  // dlAnchorElem.click();
}

function handlePlayAnimation(animationSteps) {
  function playAnimation(steps) {
    let interval = setInterval(stepForward, 1000);
    function stepForward() {
      if(stepcount +1 < animationSteps.length) {
        stepcount ++;
        $('#animation-container')[0].innerHTML = animationSteps[stepcount].animationDOM;
      } else {
        $('#animation-container')[0].innerHTML = '<h3>Ended</h3>'
        clearAndResetInterval(interval, $("#play-button"), () => playAnimation(animationSteps));
        stepcount = -1;
      }
    }
  }
  $("#play-button").off('click', playAnimation);
  if(stepcount === -1) {
    $('#animation-container')[0].innerHTML = animationSteps[stepcount].animationDOM;
    setTimeout(playAnimation(animationSteps));
  } else {
    playAnimation(animationSteps)
  }
  $("#pause-button").on('click', () => {
      clearAndResetInterval(interval, $("#play-button"), () => handlePlayAnimation(animationSteps));
  });
}



function clearAndResetInterval(interval, $element, action) {
  clearInterval(interval)
  $element.on('click', action)
}

function initializeAnimationButtonsListeners(submission) {
  let animationSteps = getAnimationSteps(submission);
  $("#play-button").on('click', () => handlePlayAnimation(animationSteps))
}
// function startAutoAnimation() {
//   let animator = startAnimator()
//   $("#play-button").off('click', startAutoAnimation)
//   $('#step-forward').click()
//   $("#stop-button").on('click', () => {
//     clearInterval(animator)
//     $('#to-beginning').click();
//     $("#play-button").on('click', startAutoAnimation)
//   })
//   $("#pause-button").on('click', () => {
//     clearInterval(animator)
//     $("#play-button").on('click', startAutoAnimation)
//   })
// }
//
// function startAnimator() {
//   return setInterval(timedAction, 1000);
// }
//
// function timedAction() {
//   $('#step-forward').click();
// }

module.exports = {
  initialize
}

},{}]},{},[1]);
