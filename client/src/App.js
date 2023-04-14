import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactMapGL, { Marker, Popup, GeolocateControl } from "react-map-gl";





import Checkbox from "./checkbox.js";
import calculateDownloadSpeed from "./download.js";
import calculateUploadSpeed from "./upload.js";
import calculatePing from "./ping.js";
import * as building from "./Building_name.json";


import refreshIcon from "./icons/refresh.svg";
import dino from "./icons/dino.svg";

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
import geolocate from "./icons/geolocate.svg";






export default function App() {

  const [downloadSpeed, setDownloadSpeed] = useState();
  const [uploadSpeed, setUploadSpeed] = useState();
  const [ping, setPing] = useState();
  const [locationLoaded, setLocationLoaded] = useState(false);

  const [speedTime, setSpeedTime] = useState();

  const [user_up, setUserUp] = useState();
  const [user_down, setUserDown] = useState();
  const [user_ping, setUserPing] = useState();

  const [viewport, setViewport] = useState({
    latitude: 28.063570,
    longitude: -80.623040,
    width: "100vw",
    height: "90vh",
    zoom: 16.45
  });

  const [lat, setLat] = useState();
  const [lng, setLng] = useState();

  const [lat1, setLat1] = useState();
  const [lng1, setLng1] = useState();

  const [status, setStatus] = useState(0);
  const [status1, setStatus1] = useState(null);

  const [pointData, setPointData] = useState([]);

  const [refreshTime, setRefreshTime] = useState();
  const [refreshTimems, setRefreshTimems] = useState();


  function formatTimestamp(timestamp) {
    const date = new Date(Number(timestamp));
    const currentDate = new Date();
    const isToday = date.getDate() === currentDate.getDate() &&
                    date.getMonth() === currentDate.getMonth() &&
                    date.getFullYear() === currentDate.getFullYear();
    
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    
    if (isNaN(date.getTime())) {
      return 'Invalid timestamp';
    } else if (isToday) {
      return `${hours}:${minutes}:${seconds} ${ampm}`;
    } else {
      return `${month}/${day}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
    }
  }
  
  
  

  const getData = (building1) => {
    axios.get("http://localhost:3000/data")
      .then(response => {
        setPointData(response.data);
        let buildingData = [];
        buildingData = response.data.find(data => data.building === building1);
        const currentTime1 = new Date(Date.now());
        //console.log(response.data);
        if (buildingData) {
          const { download, upload, ping, time, latitude, longitude } = buildingData;
          setUserUp(upload);
          setUserDown(download);
          setUserPing(ping);
          setSpeedTime(formatTimestamp(time));
          setLat1(latitude);
          setLng1(longitude);
        }
        setRefreshTime(formatTimestamp(currentTime1)); 
        setRefreshTimems(Date.now());
      })
      .catch(error => {
        console.log("error with getData")
        console.log(error);
      });
  }

  function scheduleRequestTest() {
    setTimeout(function() {
      getLocation()
    }, 15 * 60 * 1000); // 15 minutes in milliseconds
  }
  
  
  const postData = (lat, lng, downloadSpeed, uploadSpeed, ping, currentBuilding) => {
    if (downloadSpeed && locationLoaded) {
      var currentTime = Date.now();
      setSpeedTime(formatTimestamp(currentTime));
      const time = currentTime;
      const newData = {
        time: time,
        upload: uploadSpeed,
        download: downloadSpeed,
        ping: ping,
        latitude: lat,
        longitude: lng,
        building: currentBuilding
      };
      console.log("newData: ", newData);
      axios.post("http://localhost:3000/data", newData)
        .then(response => {
          console.log('Data sent successfully:', response);
          // need to wait until aggregated data is set
          setTimeout(() => getData(currentBuilding), 2000);
          setStatus1(null);

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
      setLat();
      setLng();
      setDownloadSpeed();
      setUploadSpeed();
      setPing();
      setcurrentBuilding();
      setLocationLoaded(false);
      setStatus('Locating...');
      navigator.geolocation.getCurrentPosition(async (position) => {
        setStatus(null);
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setLocationLoaded(true);
  
      }, () => {
        setStatus('Unable to retrieve your location');
      });    
    }
  };
  const [currentBuilding, setcurrentBuilding] = useState();
  var building1;

  function set_building_name(lat, lng) {
    return new Promise((resolve, reject) => {
      for (let i = 0; i < 49; i++) { 
        if ((lat >=building.building_name[i].SW_Lat && lat <= building.building_name[i].NE_Lat) && 
            (lng >=building.building_name[i].NW_Long && lng <= building.building_name[i].SE_Long)) {
          setcurrentBuilding(building.building_name[i].Location);
          building1 = building.building_name[i].Location;
          resolve(building1);
          return; // exit the loop
        }
      }
      // If no matching building name is found, reject promise
      reject('No matching building name found');
    });
  }
  

  async function requestTest(building1) {
    try {
      const response = await axios.get(`http://localhost:3000/test?currentBuilding=${building1}`);
      const { result } = response.data;
      console.log(`speed test:${result}`);
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

    const northWestbab = { latitude: 28.063705301357434, longitude: -80.62112072428444 };
    const northEastbab = { latitude: 28.063713098620028, longitude: -80.62039615788663 };
    const southEastbab = { latitude: 28.06276962573779, longitude: -80.620515446257 };
    const southWestbab = { latitude: 28.062757929741014, longitude: -80.6211339785478 };
    
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

    ((lat >= southWestbab.latitude && lat <= northEastbab.latitude) &&
    (lng >= northWestbab.longitude && lng <= southEastbab.longitude)) ||

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
            setStatus1("calculating ping");
            console.log(`Ping calculated: ${ping_calc}`);
            setPing(ping_calc);
            
            const sum = await calculateDownloadSpeed();
            setStatus1("calculating download");
            console.log(`Download speed calculated: ${sum}`);
            setDownloadSpeed(sum);
            
            const sum2 = await calculateUploadSpeed();
            setStatus1("calculating upload");

            console.log(`Upload speed calculated: ${sum2}`);
            setUploadSpeed(sum2);

            scheduleRequestTest();

          }
          // false condition set user's current metrics to aggregated data for current building

          else{
            scheduleRequestTest();
            getData(building1);
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

  const [showPopup, setShowPopup] = useState(false);

  const geolocateStyle = {
    position: "absolute",
    top: 0,
    right: 0,
    margin: 10,
    };


  return (
    <div>
      <div
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          backgroundColor: "#f2f2f2",
          fontSize: "120%",
          fontFamily: "Arial, sans-serif",
          textAlign: "center",
          border: "1px solid black",
          margin: "0 auto"
        }}
      >
        <h3>Current metrics</h3>
        <p style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr", // change the column widths
          columnGap: "1px",
          alignItems: "<self-position>",
          justifyItems: "center",
        }}>
          <span>
            Location: {status} {currentBuilding} <br />
            Speed Test Time: {status1} {speedTime} <br />
            Map Refreshed: {refreshTime}
          </span>
          <span>
            Upload: {user_up} Mbps<br />
            Download: {user_down} Mbps<br />
            Ping: {user_ping} ms
          </span>

          <button
  style={{
    fontSize: "110%",
    padding: "1% 1%",
    borderRadius: "20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    width: "70%",   // set width to 20% of the parent container's width
    height: "50%"   // set height to 10% of the parent container's height
  }}
  onClick={() => setShowPopup(true)}
>
  info
</button>


        </p>
      </div>

      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            padding: "30px",
            width: "80%",
            zIndex: "9999",
            border: "1px solid black"
          }}
        >
          <h2 style={{textAlign: "center"}}>Information</h2>
          <p> The <strong>current metrics</strong> section above shows the current average speed test data for the building where you are located</p>
          <p><img src={uploadClicked} alt="clicked upload icon" style={{width: '3%', height: '3%', marginRight: '1px'}} /> 
          <img src={uploadUnclicked} alt="refresh" style={{width: '3%', height: '3%', marginRight: '5px'}} />
            The buttons on the left side of the screen will toggle the selected icons on the map</p>
          <p><img src={refreshIcon} alt="refresh" style={{width: '3%', height: '3%', marginRight: '5px'}} />
            The refresh button on the left side of the screen will update the map with the most recent data</p>
          <p><img src={uploadGood} alt="refresh" style={{width: '3%', height: '3%', marginRight: '5px'}} />
            Green icons indicate that the metrics in that location are better than your current metrics</p>
          <p><img src={downloadOkay} alt="refresh" style={{width: '3%', height: '3%', marginRight: '5px'}} />
            Yellow icons indicate that the metrics in that location are the same as your current metrics</p>
          <p><img src={pingBad} alt="refresh" style={{width: '3%', height: '3%', marginRight: '5px'}} />
            Red icons indicate that the metrics in that location are worse than your current metrics</p>
          <p><img src={dino} alt="dinosaur" style={{width: '3%', height: '3%', marginRight: '5px'}} />
            A dinosaur on top of the icons on the map indicates that those metrics are older than 15 minutes</p>
          <p><img src={geolocate} alt="geolocation" style={{width: '3%', height: '3%', marginRight: '5px'}} />
            This icon located in the upper right side of the screen will toggle between campus view and personal view</p>
          <button           
            style={{
            fontSize: "120%",
            padding: "12px 20px",
            borderRadius: "20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            float: "right"
          }}onClick={() => setShowPopup(false)}>Close</button>
        </div>
      )}


      <ReactMapGL
      
        {...viewport}
        mapboxApiAccessToken={"pk.eyJ1IjoiZHJlc2VuZGVzIiwiYSI6ImNsYWczYnVxdDA5aXEzd21vdmlzY3lmemUifQ.szVCqwXEpk5-FpJFutAFCg"}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onViewportChange={viewport=> {
          setViewport(viewport)}}
      >

        <GeolocateControl
          style={geolocateStyle}
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true}
          onViewportChange={(viewport) => setViewport({ ...viewport, zoom: 18.2 })}
        />


        

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
<button onClick={() => getData(currentBuilding)} style={{width: '40px', height: '40px',  padding: '5px', marginLeft: '10px', marginTop: '10px'}}>
  <img src={refreshIcon} alt="refresh" style={{width: '100%', height: '100%'}} />
</button>


        </div>


  {pointData.map(datapoint => {
    
    const timeDiffInMinutes = (Math.round(((refreshTimems)-(datapoint.time))/60000));
    if (timeDiffInMinutes > 15) {
      return (
        <Marker 
          key={datapoint.time}
          latitude={datapoint.latitude}
          longitude={datapoint.longitude}
          offsetTop={-20}
          offsetLeft={-20}
        >
          <button 
            className="marker-btn" 
            onClick={(e) => {
              e.preventDefault();
              setselectedPoint(datapoint);
            }}
          >
            <img 
              src={dino} 
              alt="Dinosaur Icon"
            />
          </button>
        </Marker>
      );
    }
    return null;
})}



{pointData.map(datapoint => (
  showUpload ? 
    <Marker 
      key={datapoint.time}
      latitude ={datapoint.latitude}
      longitude ={datapoint.longitude}
      offsetLeft={-40}

    >
      <button className = "marker-btn" onClick={(e) =>{
                      e.preventDefault();
                      setselectedPoint(datapoint);
                      // directions.setDestination([datapoint.longitude, datapoint.latitude]);

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
      <button className = "marker-btn" onClick={(e) =>{
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
      <button className = "marker-btn" onClick={(e) =>{
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
              <h2>{selectedPoint.building}</h2>
              <h3>{formatTimestamp(selectedPoint.time)}</h3>
              <p>{"Time since update: "} {Math.round(((refreshTimems)-(selectedPoint.time))/60000)}{" Minutes"}</p>
              <p>{"UPLOAD: "}{selectedPoint.upload}</p>
              <p>{"DOWNLOAD: "}{selectedPoint.download}</p>
              <p>{"PING: "}{selectedPoint.ping}</p>

            </div>
          </Popup>

        ): null}

      {lat1 && lng1 && (
        <Marker latitude={lat1} longitude={lng1}
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