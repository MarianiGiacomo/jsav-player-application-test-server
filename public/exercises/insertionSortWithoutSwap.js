
var arraySize = 10,
    initialArray = [],
    initialTempArray = [],
    jsavArray,
    jsavTempArray,
    selectedIndex,
    $array = $("#exerArray"),
    $temparray = $("#tempArray"),
    av = new JSAV($("#jsavcontainer"));
    code = av.code(
    "def inssortshift(A) {\n"+
    "   for i in range(1, len(A)):\n"+
    "       temp = A[i]\n"+
    "       while (j > 0) and (temp < A[j-1]):\n"+
    "           A[j] = A[j-1]\n"+
    "           j -= 1\n"+
    "       A[j] = temp");

av.recorded(); // we are not recording an AV with an algorithm

function initialize() {
    turnAnimationOff();

    var htmldata = "";
    for (var i = 0; i < arraySize; i++) {
        randomVal = Math.floor(Math.random()*100) + 10;
        htmldata += "<li>" + randomVal + "</li>";
        initialArray[i] = randomVal;
    }
    $array.html(htmldata);

    randomVal = Math.floor(Math.random()*100) + 10;
    initialTempArray[0] = randomVal;
    $temparray.html("<li>"+randomVal+"</li>");

    selectedIndex = av.variable(-2);

    // av.umsg("Sort the table using insertion sort.");
    av.forward();

    jsavArray = av.ds.array($array, {indexed: true, layout: "bar"});
    jsavTempArray = av.ds.array($temparray, {indexed: false});
    code.show();
    code.highlight(4);
    restoreAnimationState();
    return jsavArray;
}

function modelSolution(jsav) {
    var modelArray = jsav.ds.array(initialArray, {indexed: true, layout: "bar"});
    var modelTempArray = jsav.ds.array(initialTempArray);

    jsav._undo = [];
    modelArray.layout();
    jsav.displayInit();

    for (var i = 1; i < arraySize; i++) {
        // jsav.effects.copyValue(modelArray, i, modelTempArray, 0);
        // modelTempArray.value(0, modelArray.value(i));
        copyValue(modelArray, i , modelTempArray, 0);
        jsav.stepOption("grade", true);
        jsav.step();
        var j = i;
        while (j > 0 && modelArray.value(j - 1) > modelTempArray.value(0)) {
            // jsav.effects.copyValue(modelArray, j - 1, modelArray, j);
            // modelArray.value(j, modelArray.value(j - 1));
            // modelArray.layout();
            copyValue(modelArray, j - 1, modelArray, j);
            jsav.stepOption("grade", true);
            jsav.step();
            j--;
        }
        if (j !== i) {
            // jsav.effects.copyValue(modelTempArray, 0, modelArray, j);
            // modelArray.value(j, modelTempArray.value(0));
            // modelArray.layout();
            copyValue(modelTempArray, 0, modelArray, j);
            jsav.stepOption("grade", true);
            jsav.step();
        }
    }


  return modelArray;
}



//fixes problem in the JSAV copyValue effect
function copyValue(array1, fromIndex, array2, toIndex) {
    $fromValElem = array1.element.find("li:eq("+fromIndex+") .jsavvaluelabel");
    $toValElem = array2.element.find("li:eq("+toIndex+") .jsavvaluelabel");

    array2.value(toIndex, array1.value(fromIndex));
    array2.layout();

    $toValElem.position({of: $fromValElem});
    if (array2.options.layout === "bar") {
        var bottom = array2.element.find("li:eq("+toIndex+") .jsavvalue").height() - $toValElem.position().top - 20;
        $toValElem.css("top","").css("bottom", bottom);

        $toValElem.animate({"left": 0, "bottom": 0}, 400, "linear");
    } else {
        $toValElem.animate({"left": 0, "top": 0}, 400, "linear");
    }
}

var oldfx;

function turnAnimationOff() {
    //save the state of fx.off
    var oldfx = $.fx.off || false;
    //turn off the jQuery animations
    $.fx.off = true;
}

function restoreAnimationState() {
    $.fx.off = oldfx;
}

var exercise = av.exercise(modelSolution, initialize, {}, {feedback: "atend"});
exercise.reset();

// bind a function to handle all click events on the array
jsavArray.click(function(index) {

    if (selectedIndex.value() === -2) {
        // first click will select an index and save it
        this.addClass(index, "selected");
        selectedIndex.value(index);
    } else if (selectedIndex.value() === index) {
        //deselect
        this.removeClass(index, "selected");
        //reset select index
        selectedIndex.value(-2);
    } else if (selectedIndex.value() > -1) {
        // move value within the array
        this.removeClass(selectedIndex.value(), "selected");
        copyValue(this, selectedIndex.value(), this, index);
        selectedIndex.value(-2);
        exercise.gradeableStep();
    } else if (selectedIndex.value() === -1) {
        // move value from the temporary variable to the array
        jsavTempArray.removeClass(0, "selected");
        copyValue(jsavTempArray, 0, this, index);
        //reset select index
        selectedIndex.value(-2);
        exercise.gradeableStep();
    }
});

jsavTempArray.click(function(index) {
    if (selectedIndex.value() === -2) {
        // select temporary variable if nothing else is selected
        this.addClass(index, "selected");
        selectedIndex.value(-1);
    } else if (selectedIndex.value() === -1) {
        // deselect temporary variable
        this.removeClass(index, "selected");
        selectedIndex.value(-2);
    } else {
        // move the value from the array into the temporary variable
        jsavArray.removeClass(selectedIndex.value(), "selected");
        copyValue(jsavArray, selectedIndex.value(), this, index);
        //reset select index
        selectedIndex.value(-2);
        exercise.gradeableStep();
    }
});
