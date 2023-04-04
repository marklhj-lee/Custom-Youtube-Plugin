
const video = document.querySelector("video.html5-main-video")

// Video in time in seconds for when the video should repeat from, or null if no repeating
var loopStart = null
// Video in time in seconds for when the video should repeat to, or null if no repeating
var loopEnd = null
function goToMostReplayedSection() {
    const classes = document.getElementsByClassName("ytp-heat-map-path");
 
    if (classes.length == 0){
        console.log("Most replayed section not found!");
        return;
    }
 
    console.log("Fast forwarding to most replayed section of video!");
 
    // Parse SVG path into array of tuples
    const path = classes[0].getAttribute("d").split(" ");
    var pathArr = [];
    var j = 0;
    for (let i = 0; i < path.length; i++) {
        if (path[i] === 'M' | path[i] === 'C') {
            continue;
        }
 
        pathArr[j] = path[i].split(",");
        pathArr[j][0] = parseFloat(pathArr[j][0]);
        pathArr[j][1] = parseFloat(pathArr[j][1]);
 
        j++
    }
 
    // Find index of most replayed peak
    const flatArray = pathArr.map((tuple) => tuple[1]);
    const min = Math.min(...flatArray);
    const vidPosIndex = flatArray.indexOf(min);
    const vidPos = pathArr[vidPosIndex][0];
 
    // Translate index into video time in seconds
    const mostRepTime = vidPos / 1000 * document.getElementsByTagName('video')[0].duration;
    const negOffset = document.getElementsByTagName('video')[0].duration * 0.01;
 
    // Fast forward video
    document.getElementsByTagName('video')[0].currentTime = mostRepTime - negOffset;
}
 

function setloopStart(time = video.currentTime) {
  loopStart = time
  if (loopEnd == null || loopEnd <= loopStart) {
    loopEnd = video.duration
  }
  updateUI()
}

function setloopEnd(time = video.currentTime) {
  loopEnd = time
  if (loopStart == null || loopStart >= loopEnd) {
    loopStart = 0
  }
  updateUI()
}

function restartLoop() {
  if (loopStart != null && loopEnd != null) {
    video.currentTime = loopStart
  }
}
function resetLoop(){
  if (loopStart != null || loopEnd != null){
    loopStart = null
    loopEnd = null
  }
}

function bindListeners() {
  var seeking = false
  video.addEventListener('seeking', () => { seeking = true })
  video.addEventListener('seeked', () => { seeking = false })
  video.addEventListener('timeupdate', () => {
    if (loopStart != null && loopEnd != null) {
      if (video.currentTime - loopEnd > 0.1) {
        if (seeking) {
          // The user is seeking in the timeline past the repeat range! Extend the
          // end of the repeat range to the end of the video to allow continued
          // seeking.
          loopEnd = video.duration
          updateUI()
        } else {
          // This is the result of regular playback, and we've reached the end of
          // the repeat range! Go back to the start.
          restartLoop()
        }
      } else if (loopStart - video.currentTime > 0.1) {
        if (seeking) {
          // The user is seeking in the timeline before the repeat range! Extend
          // the start of the repeat range to thestartend of the video to allow
          // continued seeking.
          loopStart = 0
          updateUI()
        }
      }
    }
  })

  document.addEventListener('keyup', (e) => {
    if (e.key === "v" ) {
        goToMostReplayedSection()
        return
    }


    if (e.key === 's') {
      setloopStart()
      return
    }

    if (e.key === 'e') {
      setloopEnd()
      return
    }

    if (e.key === 'z') {
      restartLoop()
      updateUI()
      return
    }
    if (e.key === 'r') {
      resetLoop()
      updateUI()
      return
    }
  })
}

const updateUI = (function() {
  const videoContainer = document.getElementById("movie_player")
  
  
  const timeDisplay = document.querySelector(".ytp-time-display")
  const textReadout = document.createElement("span")

  timeDisplay.appendChild(textReadout)

  

  // for(element of document.getElementsByClassName('ytp-ce-element')) {
  //   element.style.display = 'none'; 
  // }  

  // let allEndscreenItems = document.querySelectorAll(".ytp-ce-element");

  // // Hide them all
  // allEndscreenItems.forEach((item) => (item.style.display = "none"));
  
  const progressList = document.querySelector(".ytp-progress-list")

  const markerSize = 10

  const beforeloopStartCover = document.createElement("div")
  beforeloopStartCover.style.height = '100%'
  beforeloopStartCover.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
  beforeloopStartCover.style.zIndex = 999
  beforeloopStartCover.style.position = "absolute"

  const loopStartMarker = document.createElement("div")
  loopStartMarker.style.width = 0
  loopStartMarker.style.height = 0
  loopStartMarker.style.borderTop = loopStartMarker.style.borderBottom = `${markerSize}px solid transparent`
  loopStartMarker.style.borderLeft = `${markerSize}px solid #f00`
  loopStartMarker.style.position = "absolute"
  loopStartMarker.style.top = `calc(-50% - ${markerSize/2}px)`
  loopStartMarker.style.zIndex = 999

  function timeFromEvent(ev) {
    const bounds = progressList.getBoundingClientRect()
    return video.duration * (ev.clientX - bounds.x) / bounds.width
  }

  loopStartMarker.addEventListener("mousedown", function() {
    function onMouseMove(ev) {
      setloopStart(timeFromEvent(ev))
    }
    function onMouseUp(ev) {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  })

  const loopEndMarker = document.createElement("div")
  loopEndMarker.style.position = "absolute"
  loopEndMarker.style.width = 0
  loopEndMarker.style.height = 0
  loopEndMarker.style.borderTop = loopEndMarker.style.borderBottom = `${markerSize}px solid transparent`
  loopEndMarker.style.borderRight = `${markerSize}px solid #f00`
  loopEndMarker.style.position = "absolute"
  loopEndMarker.style.top = `calc(-50% - ${markerSize/2}px)`
  loopEndMarker.style.zIndex = 999

  loopEndMarker.addEventListener("mousedown", function() {
    function onMouseMove(ev) {
      setloopEnd(timeFromEvent(ev))
    }
    function onMouseUp(ev) {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  })

  const afterloopEndCover = document.createElement("div")
  afterloopEndCover.style.height = '100%'
  afterloopEndCover.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
  afterloopEndCover.style.zIndex = 999
  afterloopEndCover.style.position = "absolute"
  afterloopEndCover.style.right = "0"

  const progressListRepeatContainer = document.createElement("div")
  progressList.appendChild(progressListRepeatContainer)
  progressListRepeatContainer.appendChild(beforeloopStartCover)
  progressListRepeatContainer.appendChild(afterloopEndCover)
  progressListRepeatContainer.appendChild(loopStartMarker)
  progressListRepeatContainer.appendChild(loopEndMarker)

  function zeroPad(str, length) {
    str = `${str}`
    while (str.length < length) str = '0' + str
    return str
  }

  function formatTime(seconds) {
    return `${Math.floor(seconds / 60)}:${zeroPad(Math.floor(seconds) % 60, 2)}`
  }

  return function update() {
    let readout = ` @ ${Math.round(video.playbackRate * 100)}%`
    if (loopStart != null && loopEnd != null) {
      readout += `, repeating from ${formatTime(loopStart)} to ${formatTime(loopEnd)}`
    }
    textReadout.innerHTML = readout

    if (loopStart != null && loopEnd != null) {
      progressListRepeatContainer.style.display = 'block'

      beforeloopStartCover.style.width = `${(loopStart/video.duration) * 100}%`
      loopStartMarker.style.left = `calc(${(loopStart/video.duration) * 100}% - ${markerSize}px)`
      loopEndMarker.style.left = `${(loopEnd/video.duration) * 100}%`
      afterloopEndCover.style.width = `${(1 - loopEnd/video.duration) * 100}%`
    } else {
      progressListRepeatContainer.style.display = 'none'
    }

    // After the text readout has been updated, fake a mouse move event to force
    // the readout to be displayed.
    videoContainer.dispatchEvent(new MouseEvent('mousemove', {clientX: 1, clientY: 1}))
    videoContainer.dispatchEvent(new MouseEvent('mousemove', {clientX: 2, clientY: 2}))
  }
})()

function main() {

  bindListeners()
  updateUI()
  console.log("Function goes brrrr!")

  
  console.log("YouTube Customizer Online!")
}

main()

