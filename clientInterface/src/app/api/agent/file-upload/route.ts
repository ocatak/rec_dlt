'use server'
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { agentEndpoint, csvData, connectionId, email } = await request.json();
    if (!csvData || !connectionId) {
      return NextResponse.json({ status: 400, message: "Missing required data" }, { status: 400 });
    }
    const messageArray = csvData.split('\n');
    const messageData = messageArray.length > 1 ? messageArray : messageArray[0]

    const result = await axios.post(`${agentEndpoint}/send-message`, { connectionId, messageData, organizationId: email });
    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.log(error.response)
        return NextResponse.json({ status: error.response.status, message: error.response.data.message || "Error occurred while sending message" }, { status: error.response.status });
      } else if (error.request) {
        console.log(error.request)
        return NextResponse.json({ status: 503, message: "No response received from the server" }, { status: 503 });
      } else {
        console.log(error.message)
        return NextResponse.json({ status: 500, message: error.message || "Error setting up the request" }, { status: 500 });
      }
    } else {
      return NextResponse.json({ status: 500, message: "Internal server error" }, { status: 500 });
    }
  }
}
