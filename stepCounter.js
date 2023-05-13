var steps = 0;
var heartRate = 0;
var isRecording = false;
var data = [];
var filename = "data.json";
var theDate = new Date();

// Read any existing data from the file
require("Storage").read(filename, function (err, dataPassed) {
  if (err) {
    console.log("Error reading file: ", err);
  } else {
    data = JSON.parse(dataPassed);
  }
});

// Only the timer is running on some backup battery of the watch
// Everything else is not running 
// Watch, in fact, does not run any code when turned off
Bangle.on('step', function() {
  if (isRecording) {
    steps++;
  }
});

Bangle.setHRMPower(1);
// The watch cannot store the heart rate of the user when the watch is off...only the steps are recorded.
Bangle.on('HRM', function(hrm) {
  if (isRecording) {
    heartRate = hrm.bpm;
  }
});

// the display
g.clear();
g.setFont("6x8",2);
g.drawString("Steps:", 0, 20);
g.drawString(steps.toString(), 0, 40);
g.drawString("Heart rate:", 0, 60);
g.drawString(heartRate.toString(), 0, 80);
g.flip();

setInterval(function() {
  data.push({date: theDate, steps: steps, heartRate: heartRate});

  const jsonString = JSON.stringify(data, null, 2);

  const jsonBlob = new Blob([jsonString], { type: 'application/json' });

  require("Storage").write(filename, jsonBlob, 'a')
    .then(() => {
      console.log('JSON data written to file');
    })
    .catch(error => {
      console.error('Error:', error);
    });

}, 30000);

// Set up the button to toggle recording
setWatch(function() {
  isRecording = !isRecording;
}, BTN1, {repeat:true,edge:"falling"});

E.on('kill', function() {
  const jsonString = JSON.stringify(data, null, 2);

  const jsonBlob = new Blob([jsonString], { type: 'application/json' });

  // Write the JSON data to the file
  require("Storage").write(filename, jsonBlob)
    .then(() => {
      console.log('JSON data written to file');
    })
    .catch(error => {
      console.error('Error:', error);
    });
});
