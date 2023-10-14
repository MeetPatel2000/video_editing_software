// const startRange = document.querySelector('input[name="start_time"]');
// const endRange = document.querySelector('input[name="end_time"]');
// const startLabel = document.getElementById("start_time_label");
// const endLabel = document.getElementById("end_time_label");

// const increaseStartTime = document.getElementById("increase_start_time");
// const decreaseStartTime = document.getElementById("decrease_start_time");
// const increaseEndTime = document.getElementById("increase_end_time");
// const decreaseEndTime = document.getElementById("decrease_end_time");

// // Update the range input and label when buttons are clicked
// increaseStartTime.addEventListener("click", () => {
//   startRange.value = (parseFloat(startRange.value) + 0.1).toFixed(1);
//   updateLabels();
// });

// decreaseStartTime.addEventListener("click", () => {
//   startRange.value = (parseFloat(startRange.value) - 0.1).toFixed(1);
//   updateLabels();
// });

// increaseEndTime.addEventListener("click", () => {
//   endRange.value = (parseFloat(endRange.value) + 0.1).toFixed(1);
//   updateLabels();
// });

// decreaseEndTime.addEventListener("click", () => {
//   endRange.value = (parseFloat(endRange.value) - 0.1).toFixed(1);
//   updateLabels();
// });

// // Update labels as the range inputs change
// startRange.addEventListener("input", updateLabels);
// endRange.addEventListener("input", updateLabels);

// function updateLabels() {
//   startLabel.textContent = `${startRange.value} seconds`;
//   endLabel.textContent = `${endRange.value} seconds`;
// }

// // New code starts from here

// let video = document.getElementById("video");
// let scrubber = document.querySelector(".scrubber");
// let timelineContainer = document.querySelector(".timeline-container");
// let isDragging = false;
// let rightScrubber = document.getElementById("rightScrubber");
// let isDraggingRight = false;
// let label = document.querySelector(".endSecondsLabel"); // assuming you have a <div class="endSecondsLabel"></div> somewhere in the HTML

// rightScrubber.addEventListener("mousedown", function () {
//   isDraggingRight = true;
// });

// scrubber.addEventListener("mousedown", function () {
//   isDragging = true;
// });

// document.addEventListener("mousemove", function (e) {
//   if (isDragging || isDraggingRight) {
//     let timelineRect = timelineContainer.getBoundingClientRect();
//     let newLeft = e.clientX - timelineRect.left;

//     if (newLeft < 0) newLeft = 0;
//     if (newLeft > timelineRect.width) newLeft = timelineRect.width;

//     let scrubberToMove = isDragging ? scrubber : rightScrubber;
//     scrubberToMove.style.left = newLeft + "px";

//     if (isDraggingRight) {
//       let scrubberPosition = newLeft / timelineRect.width;
//       label.textContent =
//         (video.duration * scrubberPosition).toFixed(2) + " seconds";
//     }
//   }
// });
// document.addEventListener("mouseup", function () {
//   isDragging = false;
//   isDraggingRight = false;
// });

// video.addEventListener("timeupdate", function () {
//   let leftScrubberPos =
//     parseFloat(scrubber.style.left) / timelineContainer.clientWidth;
//   let rightScrubberPos =
//     parseFloat(rightScrubber.style.left) / timelineContainer.clientWidth;

//   if (
//     video.currentTime < video.duration * leftScrubberPos ||
//     video.currentTime > video.duration * rightScrubberPos
//   ) {
//     video.currentTime = video.duration * leftScrubberPos;
//   }
// });

// video.addEventListener("loadedmetadata", function () {
//   let totalSeconds = video.duration;
//   let minutes = Math.floor(totalSeconds / 60);
//   let seconds = Math.floor(totalSeconds % 60);
//   console.log("Total Duration:", minutes, "minutes", seconds, "seconds");
// });

// document
//   .querySelector(".show-trimmed-button")
//   .addEventListener("click", function () {
//     let startTime = parseFloat(startRange.value);
//     let endTime = parseFloat(endRange.value);

//     video.currentTime = startTime;
//     let interval = setInterval(() => {
//       if (video.currentTime >= endTime) {
//         video.pause();
//         clearInterval(interval);
//       }
//     }, 100);
//   });

// // New code ends here

let video = document.getElementById("video");
let leftScrubber = document.getElementById("leftScrubber");
let rightScrubber = document.getElementById("rightScrubber");
let timelineContainer = document.querySelector(".timeline-container");
let isDraggingLeft = false;
let isDraggingRight = false;
let videoDuration = 0;

// When the video metadata is loaded, get the video duration
video.addEventListener("loadedmetadata", function () {
  videoDuration = video.duration;
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

  if (newLeft < 0) newLeft = 0;
  if (newLeft > timelineRect.width) newLeft = timelineRect.width;

  if (isDraggingLeft) {
    leftScrubber.style.left = newLeft + "px";
    let newStartTime = (newLeft / timelineRect.width) * videoDuration;
    startRange.value = newStartTime;
    video.currentTime = newStartTime; // Seek the video to the scrubber's position
  } else if (isDraggingRight) {
    rightScrubber.style.left = newLeft + "px";
    let newEndTime = (newLeft / timelineRect.width) * videoDuration;
    endRange.value = newEndTime;
    video.currentTime = newEndTime; // Seek the video to the scrubber's position
  }

  updateLabels(); // Update the labels when scrubbers are moved
});

document.addEventListener("mouseup", function () {
  isDraggingLeft = false;
  isDraggingRight = false;
});

// Synchronize scrubbers with video playback and vice versa
video.addEventListener("timeupdate", function () {
  let leftScrubberPos =
    (parseFloat(startRange.value) / videoDuration) *
    timelineContainer.clientWidth;
  let rightScrubberPos =
    (parseFloat(endRange.value) / videoDuration) *
    timelineContainer.clientWidth;

  leftScrubber.style.left = leftScrubberPos + "px";
  rightScrubber.style.left = rightScrubberPos + "px";

  if (
    video.currentTime < parseFloat(startRange.value) ||
    video.currentTime > parseFloat(endRange.value)
  ) {
    video.currentTime = parseFloat(startRange.value);
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

// Your range inputs and labels code
const startRange = document.querySelector('input[name="start_time"]');
const endRange = document.querySelector('input[name="end_time"]');
const startLabel = document.getElementById("start_time_label");
const endLabel = document.getElementById("end_time_label");

const increaseStartTime = document.getElementById("increase_start_time");
const decreaseStartTime = document.getElementById("decrease_start_time");
const increaseEndTime = document.getElementById("increase_end_time");
const decreaseEndTime = document.getElementById("decrease_end_time");

increaseStartTime.addEventListener("click", () => {
  startRange.value = (parseFloat(startRange.value) + 0.1).toFixed(1);
  updateLabels();
});

decreaseStartTime.addEventListener("click", () => {
  startRange.value = (parseFloat(startRange.value) - 0.1).toFixed(1);
  updateLabels();
});

increaseEndTime.addEventListener("click", () => {
  endRange.value = (parseFloat(endRange.value) + 0.1).toFixed(1);
  updateLabels();
});

decreaseEndTime.addEventListener("click", () => {
  endRange.value = (parseFloat(endRange.value) - 0.1).toFixed(1);
  updateLabels();
});

startRange.addEventListener("input", updateLabels);
endRange.addEventListener("input", updateLabels);

function updateLabels() {
  startLabel.textContent = `${parseFloat(startRange.value).toFixed(1)} seconds`;
  endLabel.textContent = `${parseFloat(endRange.value).toFixed(1)} seconds`;
}
