const express = require("express");
const router = express.Router();
const Data = require("./datamodel.js");
const bodyParser = require("body-parser")

router.use(express.json({ limit: "10mb" }))
router.use(bodyParser.json({ limit: "10mb" }))

router.use((req, res, next) => {
    console.log('received a request - router');
    next();
})

router.route("/").post((req, res) => {
    console.log("inside post to DB")
    const time = req.body.time;
    const upload= req.body.upload;
    const download= req.body.download;
    const ping= req.body.ping;
    const latitude= req.body.latitude;
    const longitude= req.body.longitude;
    const newData = new Data({
        time,
        upload,
        download,
        ping,
        latitude,
        longitude
    });
    newData.save((err, data) => {
        if(err) res.status(500).json({ message: "Error saving data", error: err });
        else res.status(200).json({ message: "Data saved successfully", data });
    });
    
})


router.route("/").get((req, res) => {
    console.log("inside get request to DB")
    Data.find() // retrieve all data from the Data collection
    .then(foundData => {
    res.json(foundData) // return the data in the response
    })
    .catch(err => {
    res.status(500).json({ message: "Error retrieving data from the database", error: err });
    });
    });

module.exports = router;
