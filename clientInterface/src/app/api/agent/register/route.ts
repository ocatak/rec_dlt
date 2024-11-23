'use server'

import { NextRequest, NextResponse } from "next/server";
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
      
      const { name, email, endpoint, password } = await req.json();
      const trimmedEmail = email.trim();
    
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { message: "Invalid email format." },
        { status: 400 }
      );
    }
    const response = await axios.post(`${process.env.FABRIC_API}/client/register`, {
      name,
      email,
      agentEndpoint: endpoint,
      password
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });


    return NextResponse.json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { message: error.response?.data?.message || "An error occurred during registration." },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { message: "An error occurred." },
      { status: 500 }
    );
  }
}
