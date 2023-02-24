import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactMapGL, { Marker, Popup, GeolocateControl } from "react-map-gl";
import Checkbox from "./checkbox.js";
import calculateDownloadSpeed from "./download.js";
import calculateUploadSpeed from "./upload.js";
import calculatePing from "./ping.js";
import * as building from "./Building_name.json"


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

  const [refreshTime, setRefreshTime] = useState();

  const getData = () => {
    axios.get("http://localhost:3000/data")
      .then(response => {
        setPointData(response.data);
        const currentTime1 = new Date(Date.now());
        setRefreshTime(currentTime1.toLocaleString()); 
      })
      .catch(error => {
        console.log("error with getData")
        console.log(error);
      });
  }
  
  

  var time;
  const [speedTime, setSpeedTime] = useState();
  const postData = (lat, lng, downloadSpeed, uploadSpeed, ping, currentBuilding) => {
    if (downloadSpeed && locationLoaded) {
      const currentTime = new Date(Date.now());
      setSpeedTime(currentTime.toLocaleString());
      time = currentTime.toLocaleString();
      const newData = {
        time: time,
        upload: uploadSpeed,
        download: downloadSpeed,
        ping: ping,
        latitude: lat,
        longitude: lng,
        building: currentBuilding
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
  const [currentBuilding, setcurrentBuilding] = useState();
  var building1;

  function set_building_name(lat, lng) {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < 48; i++) { 
        if ((lat >=building.building_name[i].SW_Lat && lat <= building.building_name[i].NE_Lat) && 
            (lng >=building.building_name[i].NW_Long && lng <= building.building_name[i].SE_Long)) {
          setcurrentBuilding(building.building_name[i].Location);
          building1 = building.building_name[i].Location;
          resolve(building1);
          return; // exit the loop after setting the building name
        }
      }
      // If no matching building name is found, reject the promise
      reject('No matching building name found');
    });
  }
  

  async function requestTest(building1) {
    try {
      console.log(building1)
      const response = await axios.get(`http://localhost:3000/test?currentBuilding=${building1}`);
      const { result } = response.data;
      console.log(result);
      return result;
    } catch (error) {
      console.error('Error while sending test request:', error);
      return false;
    }
  }
  
  
  
  async function onFIT(lat, lng) {
  
      const northWest = { latitude: 28.069694, longitude: -80.625449 };
      const northEast = { latitude: 28.069635, longitude: -80.621458 };
      const southEast = { latitude: 28.057966, longitude: -80.621641 };
      const southWest = { latitude: 28.057947, longitude: -80.625564 };
      
      const northWestTestA = { latitude: 27.627685726024367, longitude: -80.48778145560247 };
      const northEastTestA = { latitude: 27.62768264423744, longitude:  -80.48711360380926 };
      const southEastTestA = { latitude: 27.627164902802857, longitude: -80.48710664701976 };
      const southWestTestA = { latitude: 27.62718031180948, longitude: -80.48778841239198 };
      
      const northWestTestB = { latitude: 28.05684075086767, longitude: -80.62562845853505 };
      const northEastTestB = { latitude: 28.056850256630913, longitude: -80.62374265747248 };
      const southEastTestB = { latitude: 28.05480197711898, longitude: -80.6237623605586 };
      const southWestTestB = { latitude: 28.054808932293692, longitude: -80.6256499162083 };
  
    // Check if the user's location is within the geofence
    
    const isWithinGeofence =
      ((lat >= southWest.latitude && lat <= northEast.latitude) &&
      (lng >= northWest.longitude && lng <= southEast.longitude)) ||
  
      ((lat >= southWestTestA.latitude && lat <= northEastTestA.latitude) &&
      (lng >= northWestTestA.longitude && lng <= southEastTestA.longitude))||
  
      ((lat >= southWestTestB.latitude && lat <= northEastTestB.latitude) &&
      (lng >= northWestTestB.longitude && lng <= southEastTestB.longitude));
  
      if (isWithinGeofence) {
        try {
          await set_building_name(lat, lng);
          console.log(`Building name has been set: ${building1}`);
          
          const testResult = await requestTest(building1);
          console.log('Speed test requested');
          
          if (testResult === true) {
            const ping_calc = await calculatePing();
            console.log(`Ping calculated: ${ping_calc}`);
            setPing(ping_calc);
            
            const sum = await calculateDownloadSpeed();
            console.log(`Download speed calculated: ${sum}`);
            setDownloadSpeed(sum);
            
            const sum2 = await calculateUploadSpeed();
            console.log(`Upload speed calculated: ${sum2}`);
            setUploadSpeed(sum2);
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        console.log('Outside geofence');
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
      postData(lat, lng, downloadSpeed, uploadSpeed, ping, currentBuilding);
    }
  }, [ping, uploadSpeed, downloadSpeed, locationLoaded, currentBuilding]);
  
  

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
      <p>Speed Test Time: {speedTime} <br />
      Location: {status} {currentBuilding} <br />
      Map Refreshed: {refreshTime}</p>
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