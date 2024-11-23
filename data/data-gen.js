const fs = require('fs'); // Use require for file system access

function appendDataToFile(filePath, data) {
    fs.appendFile(filePath, data, 'utf8', (err) => {
        if (err) {
            console.error(`Error appending data to ${filePath}: ${err}`);
        }
    });
}

function generateTimestamps(count, intervalMinutes, filePath, startTime) {
    const intervalMillis = intervalMinutes * 60 * 1000; // Convert interval to milliseconds
    const startTimestamp = startTime ? new Date(startTime).getTime() : Date.now();
    for (let i = 1; i <= count; i++) {
        const currentTimestamp = startTimestamp - i * intervalMillis;
        saveData(currentTimestamp, filePath);
    }
}

function saveData(timestamp, filePath) {
    const producedEnergy = generateRandomEnergy(100, 500);
    const forcastedEnergy = generateRandomEnergy(100, 500);

    const client = 'client@rec.com';
    let data = `${client},${timestamp},${producedEnergy},${forcastedEnergy}\n`;
    appendDataToFile(filePath, data);
}

function generateRandomEnergy(min, max) {
    const minValue = Math.ceil(min);
    const maxValue = Math.floor(max);

    const randomInteger = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;

    return randomInteger;
}

function dataGenerator(count, intervalMinutes, filePath) {
    generateTimestamps(count, intervalMinutes, filePath);
}

// Call the dataGenerator function
dataGenerator(1000, 1, `./rec.csv`);
