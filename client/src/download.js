async function calculateDownloadSpeed() {

  const speed_count = 10;
  const test_url = "http://localhost:3000/test-file";
  const test_result = [];

  const download_speed = () => {
    return new Promise((resolve, reject) => {
      let startTime = Date.now();
      let xhr = new XMLHttpRequest();
      xhr.open('GET', test_url, true);
      xhr.responseType = "blob";
      xhr.onload = function() {
        let endTime = Date.now();
        let contentLength = xhr.getResponseHeader("Content-Length");
        let calc = (contentLength * 8) / ((endTime - startTime) * 0.001);
        console.log("file size: %d", contentLength)
        resolve(calc);
      };
      xhr.onerror = function(err) {
        reject(err);
      };
      xhr.send();
    });
  };
  
  async function getLoadSpeed() {
    let speed_bps = await download_speed();
    let speed_kbps = speed_bps / 1000;
    let speed_mbps = speed_kbps / 1000;
    return speed_mbps;
  }

  async function final_download_speed() {
    for (let i = 0; i < speed_count; i++) {
      let speed = await getLoadSpeed();
      test_result.push(speed);
    }
    let sum = test_result.reduce((a, b) => a + b, 0);
    let avg = sum / test_result.length;
    return Math.round(avg);
  }

  return await final_download_speed();
}

  
  export default calculateDownloadSpeed;