'use server'
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const { agentEndpoint } = await req.json();

    if (!agentEndpoint) {
      return NextResponse.json({ success: false, message: 'Organization endpoint is required' }, { status: 400 });
    }


    const response = await axios.get(`${agentEndpoint}/create-invitation`);

    if (response.status === 200 && response.data) {
      return NextResponse.json({ 
        success: true, 
        message: 'Invitation created successfully',
        data: response.data.data
      });
    } else {
      throw new Error('Failed to create invitation');
    }
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
}
