'use server'
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers'
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    const response = await axios.post(`${process.env.FABRIC_API}/organization/login`, {
      email,
      password
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.status !== 200) {
        return NextResponse.json(
          { message: response.data.message || "Login failed" },
          { status: response.status }
        );
      }
  
      const authToken = response.headers['authorization'];
      cookies().set({
        name: 'auth',
        value: authToken.split(' ')[1],
        path: '/',
        httpOnly: true,
      });
  
      return NextResponse.json({ success: true, orgData: response.data.orgData });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { message: error.response?.data?.message || "An error occurred during login." },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { message: "An error occurred." },
      { status: 500 }
    );
  }
}