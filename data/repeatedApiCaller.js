const axios = require('axios')
require('dotenv').config()
function callApiRepeatedly(apiEndpoint, intervalInSeconds) {
    callApi(apiEndpoint);

    const intervalId = setInterval(() => {
        callApi(apiEndpoint);
    }, intervalInSeconds * 1000);

    return intervalId;
}

async function callApi(apiEndpoint) {
    try {
        const response = await axios.post(apiEndpoint, {
            connectionId: process.env.CONNECTION_ID,
            organizationId: process.env.ORGANIZATION_ID,
            messageData: `${process.env.CLIENT_ID},${Date.now()},${Math.ceil(Math.random()*1000)}, ${Math.ceil(Math.random()*1000)}`,
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('API response:', response.data);
    } catch (error) {
        console.error('API request failed:', error.message);
    }
}

const intervalInSeconds = 20;
console.log(`${process.env.CLIENT_API_ENDPOINT}/send-message`)
const intervalId = callApiRepeatedly(`${process.env.CLIENT_API_ENDPOINT}/send-message`, intervalInSeconds);

// Uncomment the following line to stop the interval after a certain time (e.g., after 5 minutes)
const exipiryMinute = 20
setTimeout(() => clearInterval(intervalId), exipiryMinute * 60 * 1000);