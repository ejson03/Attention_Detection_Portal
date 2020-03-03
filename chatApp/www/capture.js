(function () {
  // The width and height of the captured photo. We will set the
  // width to the value defined here, but the height will be
  // calculated based on the aspect ratio of the input stream.

  // |streaming| indicates whether or not we're currently streaming
  // video from the camera. Obviously, we start at false.

  // The letious HTML elements we need to configure or control. These
  // will be set by the startup() function.

  let video = null;
  let canvas = null;
  let photo = null;
  let startbutton = null;

  async function startup() {
    await FaceDetectionSetup()
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    photo = document.getElementById('photo');
    startbutton = document.getElementById('startbutton');

    video.srcObject = await GetWebCam()
    video.play();

    startbutton.addEventListener('click', function (ev) {
      takepicture();
      ev.preventDefault();
    }, false);

    clearphoto();
  }

  // Fill the photo with an indication that none has been
  // captured.

  function clearphoto() {
    let context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);

    let data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
    photo.hidden = true;
  }

  // Capture a photo by fetching the current contents of the video
  // and drawing it into a canvas, then converting that to a PNG
  // format data URL. By drawing it on an offscreen canvas and then
  // drawing that to the screen, we can change its size and/or apply
  // other changes before drawing it.

  async function takepicture() {
    photo.hidden = false;
    let name = document.getElementById("name").value;
    let context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    let base64 = canvas.toDataURL('image/png');
    photo.setAttribute('src', base64);
    base64 = await faceapi.fetchImage(base64);

    let userFaceDescription = await DetectSingleFaceDescriptionWithLandmarksAndDescriptionWithoutExpression(base64)
    console.log("User Description............",userFaceDescription)

    let ctx = canvas.getContext('2d');
    // ctx.beginPath();
    // ctx.rect(userFaceDescription.topLeft.x, userFaceDescription.topLeft.y, userFaceDescription.width, userFaceDescription.height);
    // ctx.stroke();
    // canvas.width = userFaceDescription.width;
    // canvas.height = userFaceDescription.height;
    // ctx.fillStyle = "#AAA";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);
    // ctx.drawImage(photo, userFaceDescription.topLeft.x, userFaceDescription.topLeft.y, userFaceDescription.width, userFaceDescription.height, 0, 0, userFaceDescription.width, userFaceDescription.height);
    // base64 = canvas.toDataURL('image/png');
    image_data = {
      name: name,
      description: userFaceDescription
    }

    photo.hidden = true;

    window.location.href = "http://localhost:9999/course.html"
  
    await fetch("/api/savePerson",
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify(image_data)
    });

  }
  

  // Set up our event listener to run the startup process
  // once loading is complete.
  window.addEventListener('load', startup, false);
})();
