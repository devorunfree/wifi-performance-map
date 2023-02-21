require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const route = require("./route.js");
const path = require("path");
const axios = require('axios');
const multer = require("multer");
const upload = multer({ limit: '10MB' }); // set file size limit to 10 MB

const test_image_path = path.join(__dirname, "pic3.jpg");

let startTime = null;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log('received a request - server');
    next();
});

app.use("/data", route);

app.get('/ping', (req, res) => {
    res.send(Date.now().toString());
});

// app.get('/geolocation', async (req, res) => {
//     try {
//       const response = await axios.get('https://geolocation-db.com/json/');
//       res.json(response.data);
//     } catch (error) {
//       console.error(error);
//       res.status(500).send('Server error');
//     }
//   });

// This route will handle file uploads
app.post("/upload", upload.single("file"), (req, res) => {
    //console.log("Received file: ", req.file);
    if (!startTime) startTime = Date.now();
    //console.log("start time", startTime);
    // the file is stored in the "file" property of the request body
    let file = req.file;
    //console.log("end time", Date.now());
    if (!file) {
        console.error("File is not set in the request body");
        return res.status(400).send("File is not set in the request body");
    }
    // calculate the time it took to receive the file
    let uploadTime = Date.now() - startTime;
    startTime = null;
    // calculate the upload speed in MB/s
    let uploadSpeed = file.size / (uploadTime * 1000);
    //console.log("Upload speed:", uploadSpeed, "MB/s");
    res.send("Upload complete");
});

app.use("/test-file", express.static(test_image_path));

mongoose.connect("mongodb+srv://admin:wifimap@wifi-perform.dfmdh6b.mongodb.net/wifi-performance-map", { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) console.log(err);
    else console.log("MongoDB connected successfully");
});

if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    });
}

app.listen(process.env.PORT || 3000, function() {
    console.log("express server is running");
}).on('error', (e) => {
    console.error(e);
    process.exit(1);
});
