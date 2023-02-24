const express = require("express");
const router = express.Router();
const models = require("./datamodel.js");
const bodyParser = require("body-parser")

router.use(express.json({ limit: "10mb" }))
router.use(bodyParser.json({ limit: "10mb" }))
console.log("route.js file accessed");


router.use((req, res, next) => {
    console.log('received a request - router');
    next();
})




router.get('/test', async (req, res) => {
    try {
      const currentBuilding = req.query.currentBuilding;
      console.log(`Current building: ${currentBuilding}`);
      // Get current time
      const currentTime = Date.now();
      console.log(`Current time: ${currentTime}`);
      // Query database for building names matching the one from client request
      const buildingData = await models.data.find({ building: currentBuilding });
      console.log(`Building data: ${buildingData}`);
      if (buildingData.length < 3) {
        // If there are less than 3 points, return true to run speed test
        console.log('Less than 3 data points, running speed test');
        res.json({ result: true });
      } else {
        // If there are 3 points, check if the oldest point is older than 15 minutes
        const oldestPointTime = Date.parse(buildingData[0].time); // convert the string to a Date object
        const elapsedTime = currentTime - oldestPointTime;
        console.log(`Oldest point time: ${oldestPointTime}, Elapsed time: ${elapsedTime}`);
        if (elapsedTime <= 900000) {
          // If oldest is less than 15 minutes, return false
          console.log('Oldest data point is less than 15 minutes old, not running speed test');
          res.json({ result: false });
        } else {
          // If oldest is greater than 15 minutes, return true
          console.log('Oldest data point is more than 15 minutes old, running speed test');
          res.json({ result: true });
          // Drop the oldest point from the database
          await models.data.deleteOne({ _id: buildingData[0]._id });
        }
      }
    } catch (error) {
      console.error('Error in test route:', error);
      res.status(500).json({ error: 'An error occurred while processing the request' });
    }
  });
  



router.route("/").post((req, res) => {
    console.log("inside post to DB")
    const time = req.body.time;
    const upload= req.body.upload;
    const download= req.body.download;
    const ping= req.body.ping;
    const latitude= req.body.latitude;
    const longitude= req.body.longitude;
    const building= req.body.building;
    const newData = new models.data({
        time,
        upload,
        download,
        ping,
        latitude,
        longitude,
        building
    });
    newData.save((err, data) => {
        if(err) res.status(500).json({ message: "Error saving data", error: err });
        else res.status(200).json({ message: "Data saved successfully", data });
    });
    
})

router.route("/").get((req, res) => {
    console.log("inside get request to DB")
    models.data.find() // retrieve all data from the rawData collection
    .then(foundData => {
        res.json(foundData) // return the data in the response
    })
    .catch(err => {
        res.status(500).json({ message: "Error retrieving data from the database", error: err });
    });
});

router.route("/aggregated").get((req, res) => {
    console.log("inside get request to aggregated DB")
    models.aggregatedData.find() // retrieve all data from the aggregatedData collection
    .then(foundData => {
        res.json(foundData) // return the data in the response
    })
    .catch(err => {
        res.status(500).json({ message: "Error retrieving data from the database", error: err });
    });
});

module.exports = router;
