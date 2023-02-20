async function calculatePing() {
    let pingValues = [];
    for (let i = 0; i < 10; i++) {
        try {
            const startTime = Date.now();
            await fetch("http://localhost:3000/ping");
            const endTime = Date.now();
            const pingTime = endTime - startTime;
            pingValues.push(pingTime);
        } catch (error) {
            console.error(`Error calculating ping: ${error}`);
        }
    }
    const averagePing = pingValues.reduce((a, b) => a + b, 0) / pingValues.length;
    return Math.round(averagePing);
}

export default calculatePing;
