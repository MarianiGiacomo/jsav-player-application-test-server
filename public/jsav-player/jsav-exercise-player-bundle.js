(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class DOMAnimation {
  stepCount = 0;
  paused = false;
  constructor(initialStateDOM, animationSteps, canvas) {
    this.initialStateDOM = initialStateDOM;
    this.animationSteps = animationSteps;
    this.canvas = canvas;
  }

  play(speed) {
    if(!this.paused) this.reset();
    this.paused = false;
    this.interval = setInterval(() => this.stepForward(), speed)
  }

  stepForward() {
    if (this.stepCount < this.animationSteps.length) {
      this.canvas.innerHTML = this.animationSteps[this.stepCount].animationDOM;
      this.stepCount++;
    } else {
      clearInterval(this.interval);
      this.canvas.innerHTML = '<h3>Ended</h3>';
    }
  }

  pause() {
    this.paused = true;
    clearInterval(this.interval);
  }

  reset() {
    clearInterval(this.interval);
    this.stepCount = 0;
    this.canvas.innerHTML = this.initialStateDOM
  }
}

module.exports = {
  DOMAnimation
}

},{}],2:[function(require,module,exports){
class DOMSlideShow {
  stepCount = -1;
  constructor(initialStateDOM, animationSteps, canvas) {
    this.initialStateDOM = initialStateDOM;
    this.animationSteps = animationSteps;
    this.canvas = canvas;
  }

  backward() {
    if (this.stepCount >= 0) {
      this.canvas.innerHTML = this.animationSteps[this.stepCount].animationDOM;
      this.stepCount--;
    } else {
      this.reset();
    }
  }

  forward() {
    if (this.stepCount < this.animationSteps.length -1) {
      this.stepCount++;
      this.canvas.innerHTML = this.animationSteps[this.stepCount].animationDOM;
    } else {
      this.canvas.innerHTML = '<h3>Ended</h3>';
    }
  }

  toEnd() {
    this.stepCount = this.animationSteps.length -1;
    this.canvas.innerHTML = this.animationSteps[this.stepCount].animationDOM;
  }

  reset() {
    this.stepCount = -1;
    this.canvas.innerHTML = this.initialStateDOM;
  }

}

module.exports = { DOMSlideShow }

},{}],3:[function(require,module,exports){
const { DOMAnimation } = require('./animation/animation.js');
const { DOMSlideShow } = require('./animation/slideShow.js');

let $ = window.$;
let showClicks = false;
let initialStateDOM;
let animationSteps;
let $animationContainer = $('#animation-container');
let canvas = $animationContainer[0];

initialize();

async function initialize() {
  try {
    let submission = await getSubmission();
    if(submission && Object.keys(submission).length > 0){
      initialStateDOM = submission.initialState.animationDOM;
      animationSteps = getAnimationSteps(submission);
      canvas.innerHTML = initialStateDOM;
      initiateSlideShow(submission);
      initializeAnimation(submission);
      $('#jaal').on('click', () => showJaal(submission));
      $('#export').on('click', () => exportAnimation());
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
  try {
    var slideShow = new DOMSlideShow(initialStateDOM, animationSteps, canvas);
  } catch (err) {
    console.warn(`Error when initializing slideshow: ${err}`);
  }
  try {
    $('#to-beginning').on('click', () => slideShow.reset());
    $('#step-backward').on('click', () => slideShow.backward());
    $('#step-forward').on('click', () => slideShow.forward());
    $('#to-end').on('click', () => slideShow.toEnd());
  } catch (err) {
    console.warn(`Error when setting listeners for slideshow: ${err}`);
  }
}

function showJaal(submission) {
  const modalContent = JSON.stringify(submission, null, 2);
  useModal(modalContent);
}

function exportAnimation() {
  const iframe = `<iframe src=${window.location.href}</iframe>`
  const modalContent = `Add this iframe to an HTML document to import the animation: \n${iframe}`;
  useModal(modalContent);
}

function useModal(modalContent) {
  $("#modal-content").text(modalContent);
  const modal = $('#myModal');
  modal.css('display', 'block');
  const close = $('.close');
  close.on('click', () => modal.css('display', 'none'));
}

function initializeAnimation(submission) {
  try {
    var animation = new DOMAnimation(initialStateDOM, animationSteps, canvas);
  } catch (err) {
    console.warn(`Error when initializing animation: ${err}`);
  }
  try {
    $("#play-button").on('click', () => animation.play(1000));
    $("#pause-button").on('click', () => animation.pause());
    $("#reset-button").on('click', () => animation.reset());
  } catch (err) {
    console.warn(`Error when setting listeners for animation: ${err}`);
  }
}

function getAnimationSteps(submission) {
  try {
    var gradableSteps = submission.animation.filter(step => step.type === 'gradeable-step');
    var clickSteps = submission.animation.filter(step => step.type === 'click');
  } catch (err) {
    console.warn(` Failed getting animation steps: ${err}`);
  }
  return showClicks? clickSteps : gradableSteps;
}

module.exports = {
  initialize
}

},{"./animation/animation.js":1,"./animation/slideShow.js":2}]},{},[3]);
