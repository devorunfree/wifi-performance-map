async function calculateUploadSpeed() {
    const file = new File([new ArrayBuffer(10485760)], 'test.txt', { type: "text/plain" });
  
    const fileSize = file.size * 8;
  
    const uploadSpeed = () => {
      return new Promise((resolve, reject) => {
        let startTime = Date.now();
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:3000/upload", true);
        xhr.onload = function () {
          if (this.status >= 200 && this.status < 300) {
            let endTime = Date.now();
            let calc = endTime - startTime;
            resolve(calc);
          } else {
            reject(this.statusText);
          }
        };
        xhr.onerror = function (err) {
          reject(err);
        };
        let formData = new FormData();
        formData.append("file", file);
        //console.log("Sending file: ", file);
        xhr.send(formData);
      });
    };
  
    async function getUploadSpeed() {
      let uploadTime = await uploadSpeed();
      //console.log("upload time", uploadTime);
      if (uploadTime < 1) uploadTime = 1;
      let speed_bps = fileSize / ((uploadTime)*0.001);
      let speed_kpbs = speed_bps / (1000);
      let mbps = speed_kpbs / 1000;
      return mbps;
    }
  
    async function final_upload_speed() {
      let speed_count = 10;
      let test_result = [];
      let sum2 = 0;
      for (let i = 0; i < speed_count; i++) {
        let speed = await getUploadSpeed();
        test_result.push(speed);
      }
      sum2 = test_result.reduce((a, b) => a + b, 0);
      sum2 = sum2 / test_result.length;
      //console.log(sum2);
      return Math.round(sum2);


    }
  
    return await final_upload_speed();
  }
  
  export default calculateUploadSpeed;
  