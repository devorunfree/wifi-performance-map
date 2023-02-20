const mongoose = require("mongoose");


const dataSchema = new mongoose.Schema({
    time: { type: String, required: true },
    upload: { type: Number, required: true },
    download: { type: Number, required: true },
    ping: { type: Number, required: true },
    latitude: {type: Number, required: true },
    longitude:{type: Number, required: true },
    __v: { type: Number }
});


const Data = mongoose.model("Data", dataSchema);

module.exports = Data