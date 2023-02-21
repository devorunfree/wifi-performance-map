import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactMapGL, { Marker, Popup, GeolocateControl } from "react-map-gl";
import Checkbox from "./checkbox.js";
import calculateDownloadSpeed from "./download.js";
import calculateUploadSpeed from "./upload.js";
import calculatePing from "./ping.js";

import refreshIcon from "./icons/refresh.svg";

import uploadClicked from "./icons/upload_clicked.svg";
import uploadUnclicked from "./icons/upload_unclicked.svg";

import uploadbad from "./icons/upload_bad.svg";
import uploadOkay from "./icons/upload_okay.svg";
import uploadGood from "./icons/upload_good.svg";

import downloadClicked from "./icons/download_clicked.svg";
import downloadUnclicked from "./icons/download_unclicked.svg";

import downloadBad from "./icons/download_bad.svg";
import downloadOkay from "./icons/download_okay.svg";
import downloadGood from "./icons/download_good.svg";

import pingClicked from "./icons/ping_clicked.svg";
import pingUnclicked from "./icons/ping_unclicked.svg";

import pingBad from "./icons/ping_bad.svg";
import pingOkay from "./icons/ping_okay.svg";
import pingGood from "./icons/ping_good.svg";

import userIcon from "./icons/user.svg";





export default function App() {

  const [downloadSpeed, setDownloadSpeed] = useState();
  const [uploadSpeed, setUploadSpeed] = useState();
  const [ping, setPing] = useState();
  const [locationLoaded, setLocationLoaded] = useState(false);


  let user_up = uploadSpeed;
  let user_down = downloadSpeed;
  let user_ping = ping;

  var currentTime = new Date(Date.now());
  var time = currentTime.toLocaleString();

  const [viewport, setViewport] = useState({
    latitude: 28.063570,
    longitude: -80.623040,
    width: "100vw",
    height: "80vh",
    zoom: 16
  });

  const [lat, setLat] = useState();
  const [lng, setLng] = useState();
  const [status, setStatus] = useState(0);

  const [pointData, setPointData] = useState([]);

  const getData = () => {
    axios.get("http://localhost:3000/data")
      .then(response => {
        setPointData(response.data);
      })
      .catch(error => {
        console.log("error with getData")
        console.log(error);
      });
  }


  const postData = (lat, lng, downloadSpeed, uploadSpeed, ping) => {
    if (downloadSpeed && locationLoaded) {
      const newData = {
        time: time,
        upload: uploadSpeed,
        download: downloadSpeed,
        ping: ping,
        latitude: lat,
        longitude: lng
      };
      axios.post("http://localhost:3000/data", newData)
        .then(response => {
          console.log('Data sent successfully:', response);
        })
        .catch(error => {
          console.log("error with postData")
          console.log(error);
        });
    }
  };
  

  
  const getLocation = async () => {
    if (!navigator.geolocation) {
      setStatus('Geolocation is not supported by your browser');
    } else {
      setStatus('Locating...');
      navigator.geolocation.getCurrentPosition(async (position) => {
        setStatus(null);
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setLocationLoaded(true);
        setTimeout(getData, 1000);
  
      }, () => {
        setStatus('Unable to retrieve your location');
      });    
    }
  };
  
  function onFIT(lat, lng) {
  
      const northWest = { latitude: 28.069694, longitude: -80.625449 };
      const northEast = { latitude: 28.069635, longitude: -80.621458 };
      const southEast = { latitude: 28.057966, longitude: -80.621641 };
      const southWest = { latitude: 28.057947, longitude: -80.625564 };
  
      const northWestTestA = { latitude: 27.627688, longitude: -80.487553 };
      const northEastTestA = { latitude: 27.627683, longitude: -80.487311 };
      const southEastTestA = { latitude: 27.627271, longitude: -80.487319 };
      const southWestTestA = { latitude: 27.627317, longitude: -80.487559 };
  
      const northWestTestB = { latitude: 28.0557922, longitude: -80.62516982 };
      const northEastTestB = { latitude: 28.05551762, longitude: -80.6246602 };
      const southEastTestB = { latitude: 28.05535901, longitude: -80.62485332 };
      const southWestTestB = { latitude: 28.05557914, longitude: -80.62531466 };
  
    // Check if the user's location is within the geofence
    
    const isWithinGeofence =
      ((lat >= southWest.latitude && lat <= northEast.latitude) &&
      (lng >= northWest.longitude && lng <= southEast.longitude)) ||
  
      ((lat >= southWestTestA.latitude && lat <= northEastTestA.latitude) &&
      (lng >= northWestTestA.longitude && lng <= southEastTestA.longitude))||
  
      ((lat >= southWestTestB.latitude && lat <= northEastTestB.latitude) &&
      (lng >= northWestTestB.longitude && lng <= southEastTestB.longitude));
  
    if (isWithinGeofence) {
      calculatePing().then(ping_calc => {
        setPing(ping_calc);
      });
    
      calculateDownloadSpeed().then(sum => {
        setDownloadSpeed(sum);
      });
    
      calculateUploadSpeed().then(sum2 => {
        setUploadSpeed(sum2);
      });
    }
  }
  
  useEffect(() => {
    getLocation();
  }, []);
  
  useEffect(() => {
    if (lat && lng) {
      onFIT(lat, lng);
    }
  }, [lat, lng]);
  
  useEffect(() => {
    if (downloadSpeed && locationLoaded && uploadSpeed && ping) {
      postData(lat, lng, downloadSpeed, uploadSpeed, ping);
    }
  }, [ping, uploadSpeed, downloadSpeed, locationLoaded]);
  
  

  const [selectedPoint, setselectedPoint] = useState(null);

  const [showUpload, setShowUpload] = useState(true);
  const [showDownload, setShowDownload] = useState(true);
  const [showPing, setShowPing] = useState(true);


  const geolocateStyle = {
  position: "absolute",
  top: 0,
  right: 0,
  margin: 10
  };


  return (
    <div>
      <div style={{
  display: "block",
  width: "80%",
  height: "auto",
  backgroundColor: "#f2f2f2",
  padding: "20px",
  fontSize: "20px",
  fontFamily: "Arial, sans-serif",
  textAlign: "center",
  border: "1px solid black",
  margin: "0 auto"}}>

      <h3>Current metrics</h3>
      <p>Upload: {user_up}<br />
      Download: {user_down}<br />
      Ping: {user_ping}</p>
      <p>Timestamp: {time} <br />
      Latitude: {status} {lat} <br />
      longitude: {lng}</p>
      </div>
      <ReactMapGL
      
        {...viewport}
        mapboxApiAccessToken={"pk.eyJ1IjoiZHJlc2VuZGVzIiwiYSI6ImNsYWczYnVxdDA5aXEzd21vdmlzY3lmemUifQ.szVCqwXEpk5-FpJFutAFCg"}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onViewportChange={viewport=> {
          setViewport(viewport)}}
      >
        <div className="checkboxes">
          <Checkbox 
            id="upload" 
            label="Upload" 
            checked={showUpload}
            uncheckedImage={uploadUnclicked}
            checkedImage={uploadClicked}
            onChange={(id) => setShowUpload(!showUpload)}
          />
          <Checkbox 
            id="download" 
            label="Download" 
            checked={showDownload} 
            uncheckedImage={downloadUnclicked}
            checkedImage={downloadClicked}
            onChange={(id) => setShowDownload(!showDownload)}
          />
          <Checkbox 
            id="ping" 
            label="Ping" 
            checked={showPing} 
            uncheckedImage={pingUnclicked}
            checkedImage={pingClicked}
            onChange={(id) => setShowPing(!showPing)}
          />
<button onClick={getData} style={{width: '40px', height: '40px',  padding: '5px', marginLeft: '10px', marginTop: '10px'}}>
  <img src={refreshIcon} alt="refresh" style={{width: '100%', height: '100%'}} />
</button>

        </div>


{pointData.map(datapoint => (
  showUpload ? 
    <Marker 
      key={datapoint.time}
      latitude ={datapoint.latitude}
      longitude ={datapoint.longitude}
      offsetLeft={-40}

    >
      <button class = "marker-btn" onClick={(e) =>{
                      e.preventDefault();
                      setselectedPoint(datapoint);
                    }}>
                      <img src={datapoint.upload === user_up ?  uploadOkay : datapoint.upload < user_up ? uploadbad : uploadGood} alt = "upload Icon"/>
      </button>
    </Marker>
  : null
))}

{pointData.map(datapoint => (
  showDownload ? 
    <Marker 
    key={datapoint.time}
    latitude ={datapoint.latitude}
    longitude ={datapoint.longitude}
      offsetLeft={-20}

    >
      <button class = "marker-btn" onClick={(e) =>{
                      e.preventDefault();
                      setselectedPoint(datapoint);
                    }}>
                      <img src={datapoint.download === user_down ?  downloadOkay : datapoint.download < user_down ? downloadBad : downloadGood} alt = "download Icon"/>
      </button>
    </Marker>
  : null
))}

{pointData.map(datapoint => (
  showPing ? 
    <Marker 
      key={datapoint.time}
      latitude ={datapoint.latitude}
      longitude ={datapoint.longitude}
    >
      <button class = "marker-btn" onClick={(e) =>{
                      e.preventDefault();
                      setselectedPoint(datapoint);
                    }}>
                      <img src={datapoint.ping === user_ping ?  pingOkay : datapoint.ping > user_ping ? pingBad : pingGood} alt = "ping Icon"/>
      </button>
    </Marker>
  : null
))}
        
        {selectedPoint ? (
          <Popup 
            latitude ={selectedPoint.latitude}
            longitude ={selectedPoint.longitude}
            onClose={() => {
              setselectedPoint(null);
            }}
          >
            <div>
              <h2>{selectedPoint.time}</h2>
              <p>{"UPLOAD: "}{selectedPoint.upload}</p>
              <p>{"DOWNLOAD: "}{selectedPoint.download}</p>
              <p>{"PING: "}{selectedPoint.ping}</p>

            </div>
          </Popup>

        ): null}


        <GeolocateControl
          style={geolocateStyle}
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true}
          showUserHeading={true}
        />
      {lat && lng && (
        <Marker latitude={lat} longitude={lng}
        offsetLeft={-34}
        offsetTop={-56}
        >
          <img
            src={userIcon}
            alt="User Location"
            style={{ height: 60, width: 60}}
          />

        </Marker>
      )}
      
      </ReactMapGL>
    </div>
  );
}