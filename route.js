const express = require("express");
const router = express.Router();
const models = require("./datamodel.js");
const bodyParser = require("body-parser");


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
      // Query database for building names matching the one from client request
      const buildingData = await models.data.find({ building: currentBuilding });
      console.log(buildingData);
      if (buildingData.length < 3) {
        // If there are less than 3 points, return true to run speed test
        console.log('Less than 3 data points, running speed test');
        res.json({ result: true });
      } else {
        // If there are 3 points, check if the oldest point is older than 15 minutes
        console.log(`oldest point time test: ${buildingData[0].time}`)
        const oldestPointTime = buildingData[0].time;
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
        else {
            res.status(200).json({ message: "Data saved successfully", data });
            aggregateData(building); // call the aggregateData() function
        }
    });
});



async function aggregateData(building) {
  try {
    await models.aggregatedData.deleteMany({ building: building }); // delete only the data of the specified building
    const buildingData = await models.data.find({ building: building });
    const buildingInfo = require("./building_mids.json");

    // Calculate the average of upload, download, and ping for this building
    const uploadSum = buildingData.reduce((sum, data) => sum + data.upload, 0);
    const downloadSum = buildingData.reduce((sum, data) => sum + data.download, 0);
    const pingSum = buildingData.reduce((sum, data) => sum + data.ping, 0);
    const averageUpload = Math.round(uploadSum / buildingData.length);
    const averageDownload = Math.round(downloadSum / buildingData.length);
    const averagePing = Math.round(pingSum / buildingData.length);
    // Get the most recent time for this building
    const mostRecentTime = buildingData.reduce((mostRecent, data) => {
      return mostRecent.time > data.time ? mostRecent : data;
    }).time;
    console.log(`most recent time: ${mostRecentTime}`);
    
    const mostRecentTimeInMs = parseFloat(mostRecentTime);
    const date = new Date(mostRecentTimeInMs).toLocaleString();
    console.log(`date: ${date}`);

    
    // Get the midpoints latitude and longitude for this building from the JSON file
    const buildingCoordinates = buildingInfo[building];
    if (buildingCoordinates) {
      const midpointsLat = buildingCoordinates.Midpoints_Lat;
      const midpointsLong = buildingCoordinates.Midpoints_Long;
      // Add the aggregated data to the list
      const aggregatedData = [{
        building: building,
        time: date,
        upload: averageUpload,
        download: averageDownload,
        ping: averagePing,
        longitude: buildingCoordinates.Midpoints_Long,
        latitude: buildingCoordinates.Midpoints_Lat
      }];
      // Insert the aggregated data into the database
      await models.aggregatedData.insertMany(aggregatedData);
      console.log(`Aggregated data for building ${building} saved successfully`);
    } else {
      console.log(`Skipping building ${building} due to missing coordinates in JSON file`);
    }
  } catch (error) {
    console.error('Error in aggregation route:', error);
    throw error;
  }
};

router.route("/").get((req, res) => {
    console.log("inside get request to DB")
    models.aggregatedData.find() // retrieve all data from the aggergated collection
    .then(foundData => {
        res.json(foundData) // return the data in the response
    })
    .catch(err => {
        res.status(500).json({ message: "Error retrieving data from the database", error: err });
    });
});




module.exports = router;
