export interface Record {
  completed: "true" | "false";
  connection_id: string;
  docType?: string;
  email: string;
  endpoint: string;
  name: string;
}

export interface Connection {
  Key: string;
  Record: Record;
}

export type User = {
  name: string;
  email: string;
  connectionId: string;
};

export type Message = {
    timeStamp: Date[],
    produced: number[],
    forcasted: number[]
}
