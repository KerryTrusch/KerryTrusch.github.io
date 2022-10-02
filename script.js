const video = document.getElementById("webcam");
const liveView = document.getElementById("tempLive");
const demosSection = document.getElementById("demos");
const enableWebcamButton = document.getElementById("webcamButton");
let phoneNumber = "";
// Check if webcam access is supported.
function getUserMediaSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to button for when user
// wants to activate it to call enableCam function which we will
// define in the next step.
if (getUserMediaSupported()) {
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}

// Enable the live webcam view and start classification.
function enableCam(event) {
  // Only continue if the COCO-SSD has finished loading.
  if (!model) {
    return;
  }

  // Hide the button once clicked.
  event.target.classList.add("removed");

  // getUsermedia parameters to force video but not audio.
  const constraints = {
    video: true,
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}

var children = [];
const objSet = new Set();
const objCooldowns = new Map();

function addToSets(e) {
  let tagContainer = document.getElementById("current-filtered-items");
  
  if (!objSet.has(this.innerText)) {
    let newTag = document.createElement("ul");
    newTag.classList.add("item");
    let newInnerTag = document.createElement("div");
    newInnerTag.innerHTML = this.innerHTML.trim();
    newInnerTag.classList.add("tag-text");
    let newXButton = document.createElement("img");
    newXButton.src = "x-svg.svg";
    newXButton.classList.add("x-svg");
    newXButton.onclick = () => {
      objSet.delete(this.innerText);
      tagContainer.removeChild(newTag);
    }
    newTag.appendChild(newInnerTag);
    newTag.appendChild(newXButton);
    tagContainer.appendChild(newTag);
    objSet.add(this.innerText);
    objCooldowns.set(this.innerText, 0);
  }
}


let div = document.getElementById("myDropdown");
let arr = ["dog", "cat", "person", "cup", "chair", "bird", "horse", "sheep", "elephant", "bear", "suitcase", "sports ball", "bottle", "fork", "knife", "bowl", "bed", "keyboard", "tv", "teddy bear"];
for (let i = 0; i < arr.length; i++) {
  const newSpan = document.createElement("span");
  newSpan.innerHTML = arr[i];
  div.appendChild(newSpan);
}
let a = div.getElementsByTagName("span");
for (let i = 0; i < a.length; i++) {
  a[i].onclick = addToSets;
}

function predictWebcam() {
  // Now let's start classifying a frame in the stream.
  model.detect(video).then(function (predictions) {
    // Remove any highlighting we did previous frame.
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
    children.splice(0);
    
    // Now lets loop through predictions and draw them to the live view if
    // they have a high confidence score.
    for (let n = 0; n < predictions.length; n++) {
      // If we are over 66% sure we are sure we classified it right, draw it!
      if (objSet.has(predictions[n].class) && predictions[n].score > 0.66) {
        if (phoneNumber.length === 10) {
          let data={phone: phoneNumber, message: 'Your webcam has spotted a ' + predictions[n].class, key:'textbelt'}
          fetch("https://textbelt.com/text", {
            method: "POST",
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(data)
          }).then(res => {
            console.log("Request complete! response:", res);
          });
          phoneNumber = "";
        }
        if (objCooldowns.get(predictions[n].class) == 0) {
          objCooldowns.set(predictions[n].class, 1200);
        } else if (objCooldowns.get(predictions[n].class) > 0) {
          objCooldowns.set(predictions[n].class, objCooldowns.get(predictions[n].class) - 1);
        }
        const p = document.createElement('p');
        p.innerText = predictions[n].class  + ' - with ' 
            + Math.round(parseFloat(predictions[n].score) * 100) 
            + '% confidence.';
        p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
            + (predictions[n].bbox[1] - 10) + 'px; width: ' 
            + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
            + predictions[n].bbox[1] + 'px; width: ' 
            + predictions[n].bbox[2] + 'px; height: '
            + predictions[n].bbox[3] + 'px;';

        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p);
      }
    }
    
    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);
  });
}


// Store the resulting model in the global scope of our app.
var model = undefined;

// Before we can use COCO-SSD class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment 
// to get everything needed to run.
// Note: cocoSsd is an external object loaded from our index.html
// script tag import so ignore any warning in Glitch.
cocoSsd.load().then(function (loadedModel) {
  model = loadedModel;
  // Show demo section now model is ready to use.
  demosSection.classList.remove('invisible');
});


function showDropdown() {
  document.getElementById("myDropdown").classList.toggle("show");
}

function filterFunction() {
  var input, filter, a, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  div = document.getElementById("myDropdown");
  a = div.getElementsByTagName("span");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}

function saveNumber() {
  let inputval = document.getElementById("number").value;
  if (inputval.length === 10 && !isNaN(inputval)) {
    phoneNumber = inputval;
  }
}