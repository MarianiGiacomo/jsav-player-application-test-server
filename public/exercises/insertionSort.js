
  let oldfx;
  let arraySize = 10;
  let initialArray = [];
  let jsavArray;
  let swapIndex;
  let $array = $("#exerArray");
  let av = new JSAV($("#jsavcontainer"));
  let code = av.code(
      "public static void insertionSort(int[] table) {\n"+
      "   for (int i = 0; i < table.length; i++) {\n"+
      "       int j = i;\n"+
      "       while (j > 0 && table[j - 1] > table[j]) {\n"+
      "           swap(table, j - 1, j);\n"+
      "           j--;\n"+
      "       }\n"+
      "   }\n"+
      "}");
  av.recorded();

  function initialize() {
    turnAnimationOff();
    let htmldata = "";
    for (let i = 0; i < arraySize; i++) {
        let randomVal = Math.floor(Math.random()*100) + 10;
        htmldata += "<li>" + randomVal + "</li>";
        initialArray[i] = randomVal;
    }
    $array.html(htmldata);
    swapIndex = av.variable(-1);
    av.forward();
    jsavArray = av.ds.array($array, {indexed: true, layout: "bar"});
    code.show();
    code.highlight(4);
    restoreAnimationState();
    return jsavArray;
  }

  function modelSolution(jsav) {
    let modelArray = jsav.ds.array(initialArray, {indexed: true, layout: "bar"});
    jsav._undo = [];
    for (let i = 1; i < arraySize; i++) {
        let j = i;
        while (j > 0 && modelArray.value(j-1) > modelArray.value(j)) {
            jsav.umsg('Shift "'+modelArray.value(j)+'" to the left.')
            modelArray.swap(j, j-1);
            jsav.stepOption("grade", true);
            jsav.step();
            j--;
        }
    }
  return modelArray;
  }

  function turnAnimationOff() {
      //save the state of fx.off
      oldfx = $.fx.off || false;
      //turn off the jQuery animations
      $.fx.off = true;
  }

  function restoreAnimationState() {
      $.fx.off = oldfx;
  }

  let exercise = av.exercise(modelSolution, initialize, {feedback: "atend"});
  exercise.reset();

  // bind a function to handle all click events on the array
  jsavArray.click(function(index) {
      // the first click will select an index and save it
      if (swapIndex.value() === -1) {
          swapIndex.value(index);
          this.addClass(index, "selected");
      } else if (swapIndex.value() === index) {
          this.removeClass(swapIndex.value(), "selected");
          swapIndex.value(-1);
      } else { // swap
          this.swap(index, swapIndex.value());
          this.removeClass(swapIndex.value(), "selected");
          swapIndex.value(-1);
          this.removeClass(index, "selected");
          exercise.gradeableStep();
      }
  });
