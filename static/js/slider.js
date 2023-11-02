import RangeSliderPips from "https://cdn.skypack.dev/svelte-range-slider-pips@2.2.2";

let videoDuration;
const video = document.getElementById("video");
const $slider = document.getElementById("slider");
const slider = document.querySelector("#PriceGradient");
let timer;
let startRange = 0;
let endRange = 0;

video.addEventListener("loadedmetadata", function () {
  videoDuration = video.duration;
  endRange = videoDuration;
  initializeSlider();
});

const formatter = (value) => `${value.toFixed(1)}s`;

video.addEventListener("timeupdate", function () {
  if (video.currentTime < startRange || video.currentTime > endRange) {
    video.currentTime = startRange;
    video.play();
  }
});

const stop = () => {
  const $slider = document.querySelector("#PriceGradient");
  $slider.classList.remove("up", "down");
};

const slide = (e) => {
  const $slider = document.querySelector("#PriceGradient");
  const delta = -(e.detail.previousValue - e.detail.value);
  if (delta > 0) {
    $slider.classList.add("up");
    $slider.classList.remove("down");
  } else {
    $slider.classList.add("down");
    $slider.classList.remove("up");
  }

  startRange = parseFloat(e.detail.values[0]);
  endRange = parseFloat(e.detail.values[1]);

  if (video.currentTime < startRange || video.currentTime > endRange) {
    video.currentTime = startRange;
    video.pause();
  }

  const newCurrentTime = parseFloat(e.detail.value);
  video.currentTime = newCurrentTime;

  clearTimeout(timer);
  timer = setTimeout(stop, 66);

  document.getElementById("startRangeInput").value = parseFloat(
    e.detail.values[0]
  );
  document.getElementById("endRangeInput").value = parseFloat(
    e.detail.values[1]
  );
};

slider.addEventListener("mouseup", () => {
  setTimeout(() => {
    const tooltip = slider.querySelector(".tooltip"); // assuming tooltip class is used for the tooltip
    tooltip.style.opacity = "0";
  }, 0);

  clearTimeout(timer);
  timer = setTimeout(stop, 66);
});

slider.addEventListener("mousedown", () => {
  const tooltip = slider.querySelector(".tooltip");
  tooltip.style.opacity = "1";
});

slider.addEventListener("input", (e) => {
  const sliderPercentage =
    (slider.value - slider.min) / (slider.max - slider.min);
  video.currentTime = sliderPercentage * video.duration;
  video.currentTime = parseFloat(e.target.value);
});

function initializeSlider() {
  const slider = new RangeSliderPips({
    target: $slider,
    props: {
      id: "PriceGradient",
      min: 0,
      max: videoDuration,
      values: [0, videoDuration],
      pips: true,
      range: true,
      pipstep: 1,
      step: 0.1,
      first: false,
      last: false,
      float: true,
      formatter: formatter,
    },
  });

  slider.$on("change", slide);
  slider.$on("stop", stop);

  setTimeout(() => {
    document.querySelector("#PriceGradient .rangeHandle").focus();
  }, 1000);

  //   // Clone the tooltip
  //   const originalTooltip = document.querySelector("#PriceGradient .rangeFloat");
  //   const clonedTooltip = originalTooltip.cloneNode(true);
  //   clonedTooltip.style.top = "80px"; // Adjust this value as per your design needs
  //   originalTooltip.parentNode.appendChild(clonedTooltip);

  //   // Assuming that the second tooltip can be differentiated by its order in the document
  //   const originalTooltip2 = document.querySelectorAll(".rangeFloat")[1];
  //   const clonedTooltip2 = originalTooltip2.cloneNode(true);
  //   clonedTooltip2.style.top = "-80px"; // Adjust as needed
  //   originalTooltip2.parentNode.appendChild(clonedTooltip2);
}

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
