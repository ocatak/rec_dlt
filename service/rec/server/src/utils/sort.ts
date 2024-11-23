function getQuarterOfHour(timestamp: string | number): number {
    const date = new Date(parseInt(timestamp as string));
    const minutes = date.getMinutes();
    if (minutes < 15) {
        return 15;
    } else if (minutes < 30) {
        return 30;
    } else if (minutes < 45) {
        return 45;
    } else {
        return 60;
    }
}

interface GetRecordIdParams {
    connectionId: string;
    timestamp: string | number;
}

interface RecordIdResult {
    recordId: string;
    hourQuarter: number;
    date: {
        local: string;
        iso: string;
    };
    timestamp: number;
}

export function getRecordId({ connectionId, timestamp }: GetRecordIdParams): RecordIdResult {
    const minutes = new Date(parseInt(timestamp as string)).getUTCMinutes();
    let hourQuarter = getQuarterOfHour(timestamp);
    const minutesToAdd = hourQuarter - minutes;
    const newTimestamp = parseInt(timestamp as string) + minutesToAdd * 60 * 1000;
    const date = new Date(newTimestamp);

    const year = date.getUTCFullYear();
    let month = date.getUTCMonth();
    const aDate = date.getUTCDate();
    let hours = date.getUTCHours();

    return {
        recordId: `${connectionId}_${year}_${month}_${aDate}_${hours}_${hourQuarter}`,
        hourQuarter,
        date: {
            local: date.toLocaleString(),
            iso: date.toISOString(),
        },
        timestamp: newTimestamp
    };
}

