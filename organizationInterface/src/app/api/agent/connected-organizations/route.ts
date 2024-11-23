'use server'

import { NextResponse } from "next/server";
import axios from "axios";
import { getCookie } from "@/lib/cookieHandler";

export async function GET() {
  const token = await getCookie();
  if (token) {
    try {
      const response = await axios.get(
        `${process.env.FABRIC_API}/organization/connection/organizations`,
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
        console.log(error.response?.data);
        return NextResponse.json(
          {
            message:
              error.response?.data?.message ||
              "An error occurred while fetching connections.",
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
