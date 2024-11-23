'use server'
import { NextResponse } from "next/server";
import axios from "axios";
import { getCookie } from "@/lib/cookieHandler";

export async function GET(request: Request, { params }: { params: { connectionId: string } }) {
  
  const connectionId = params.connectionId[0]
  const token = await getCookie();
  if (token) {
    try {
      const response = await axios.get(
        `${process.env.FABRIC_API}/organization/sorted-data/${connectionId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      return NextResponse.json(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return NextResponse.json(
          {
            message:
              error.response?.data?.message ||
              "An error occurred while fetching connected clients.",
          },
          { status: error.response?.status || 500 }
        );
      }
      return NextResponse.json(
        { message: "An unexpected error occurred." },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      { message: "Please login to view this page." },
      { status: 401 }
    );
  }
}


export async function POST(request: Request) {

  const token = await getCookie();
  const {connectedOrganizationId, connectionId} = await request.json()
  if (token) {
    try {
      const response = await axios.post(
        `${process.env.FABRIC_API}/organization/connected-organization/clients/sorted-data`,
        {connectedOrganizationId, connectionId},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      return NextResponse.json(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return NextResponse.json(
          {
            message:
              error.response?.data?.message ||
              "An error occurred while fetching connected clients.",
          },
          { status: error.response?.status || 500 }
        );
      }
      return NextResponse.json(
        { message: "An unexpected error occurred." },
        { status: 500 }
      );
    }
  } else {
    return NextResponse.json(
      { message: "Please login to view this page." },
      { status: 401 }
    );
  }
}
