let video = document.getElementById("video");
let leftScrubber = document.getElementById("leftScrubber");
let rightScrubber = document.getElementById("rightScrubber");
let timelineContainer = document.querySelector(".timeline-container");
let isDraggingLeft = false;
let isDraggingRight = false;
let videoDuration = 0;

// Your range inputs and labels code
const startRange = document.querySelector('input[name="start_time"]');
const endRange = document.querySelector('input[name="end_time"]');
const startLabel = document.getElementById("start_time_label");
const endLabel = document.getElementById("end_time_label");

const increaseStartTime = document.getElementById("increase_start_time");
const decreaseStartTime = document.getElementById("decrease_start_time");
const increaseEndTime = document.getElementById("increase_end_time");
const decreaseEndTime = document.getElementById("decrease_end_time");

// When the video metadata is loaded, get the video duration
video.addEventListener("loadedmetadata", function () {
  videoDuration = video.duration;
  startRange.value = 0;
  endRange.value = videoDuration;
  updateScrubbers();
  updateLabels();
});

leftScrubber.addEventListener("mousedown", function () {
  isDraggingLeft = true;
});

rightScrubber.addEventListener("mousedown", function () {
  isDraggingRight = true;
});

document.addEventListener("mousemove", function (e) {
  let timelineRect = timelineContainer.getBoundingClientRect();
  let newLeft = e.clientX - timelineRect.left;

  // Get the current positions of scrubbers to compare
  let leftScrubberPos = parseInt(leftScrubber.style.left, 10);
  let rightScrubberPos = parseInt(rightScrubber.style.left, 10);

  if (newLeft < 0) newLeft = 0;
  if (newLeft > timelineRect.width) newLeft = timelineRect.width;

  if (isDraggingLeft && newLeft < rightScrubberPos) {
    leftScrubber.style.left = newLeft + "px";
    let newStartTime = (newLeft / timelineRect.width) * videoDuration;
    startRange.value = newStartTime;
    video.currentTime = newStartTime;
  } else if (isDraggingRight && newLeft > leftScrubberPos) {
    rightScrubber.style.left = newLeft + "px";
    let newEndTime = (newLeft / timelineRect.width) * videoDuration;
    endRange.value = newEndTime;
    video.currentTime = newEndTime;
  }

  updateLabels();
});

video.addEventListener("play", function () {
  if (
    video.currentTime < parseFloat(startRange.value) ||
    video.currentTime > parseFloat(endRange.value)
  ) {
    video.currentTime = parseFloat(startRange.value);
  }
});

video.addEventListener("timeupdate", function () {
  if (video.currentTime >= parseFloat(endRange.value)) {
    video.pause();
  }
});

function updateScrubbers() {
  let leftScrubberPos =
    (parseFloat(startRange.value) / videoDuration) *
    timelineContainer.clientWidth;
  let rightScrubberPos =
    (parseFloat(endRange.value) / videoDuration) *
    timelineContainer.clientWidth;

  leftScrubber.style.left = leftScrubberPos + "px";
  rightScrubber.style.left = rightScrubberPos + "px";
}

document.addEventListener("mouseup", function () {
  isDraggingLeft = false;
  isDraggingRight = false;
});

// Synchronize scrubbers with video playback and vice versa
video.addEventListener("timeupdate", function () {
  // Update the scrubbers without affecting video playback
  let externallyModifiedTime = false;
  let leftScrubberPos =
    (parseFloat(startRange.value) / videoDuration) *
    timelineContainer.clientWidth;
  let rightScrubberPos =
    (parseFloat(endRange.value) / videoDuration) *
    timelineContainer.clientWidth;

  leftScrubber.style.left = leftScrubberPos + "px";
  rightScrubber.style.left = rightScrubberPos + "px";

  if (video.currentTime >= parseFloat(endRange.value)) {
    video.pause();
    return;
  }

  if (
    !externallyModifiedTime &&
    (video.currentTime < parseFloat(startRange.value) - Buffer ||
      video.currentTime > parseFloat(endRange.value)) + Buffer
  ) {
    console.log("Current Time:", video.currentTime);
    console.log("Start Range:", parseFloat(startRange.value));
    console.log("End Range:", parseFloat(endRange.value));
    console.log("Resetting video currentTime");
    console.log("Resetting video currentTime");
    video.currentTime = parseFloat(startRange.value);
    +bu;
  } else {
    externallyModifiedTime = false;
  }
});

document
  .querySelector(".show-trimmed-button")
  .addEventListener("click", function () {
    video.currentTime = parseFloat(startRange.value);
    video.play();

    let interval = setInterval(() => {
      if (video.currentTime >= parseFloat(endRange.value)) {
        video.pause();
        clearInterval(interval);
      }
    }, 100);
  });

increaseStartTime.addEventListener("click", () => {
  startRange.value = (parseFloat(startRange.value) + 0.1).toFixed(1); // existing logic
  video.currentTime = parseFloat(startRange.value);
  updateLabels();
});

decreaseStartTime.addEventListener("click", () => {
  startRange.value = (parseFloat(startRange.value) - 0.1).toFixed(1); // existing logic
  video.currentTime = parseFloat(startRange.value);
  updateLabels();
});

increaseEndTime.addEventListener("click", () => {
  endRange.value = (parseFloat(endRange.value) + 0.1).toFixed(1); // existing logic
  video.currentTime = parseFloat(endRange.value);
  updateLabels();
});

decreaseEndTime.addEventListener("click", () => {
  endRange.value = (parseFloat(endRange.value) - 0.1).toFixed(1); // existing logic
  video.currentTime = parseFloat(endRange.value);
  updateLabels();
});

startRange.addEventListener("input", updateLabels);
endRange.addEventListener("input", updateLabels);

function updateLabels() {
  startLabel.textContent = `${parseFloat(startRange.value).toFixed(1)} seconds`;
  endLabel.textContent = `${parseFloat(endRange.value).toFixed(1)} seconds`;
}
