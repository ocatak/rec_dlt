'use server'

import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const { invitation, agentEndpoint } = await req.json();

    if (!invitation) {
      return NextResponse.json({ success: false, message: 'Invitation URL is required' }, { status: 400 });
    }
 

    const response = await axios.post(`${agentEndpoint}/accept-invitation`, {
      invitation
    });

    if (response.status === 200 && response.data) {
      return NextResponse.json({ 
        success: true, 
        message: 'Connection established successfully',
        invitation: response.data
      });
    } else {
      throw new Error('Failed to establish connection');
    }
  } catch (error) {
    console.error('Error establishing connection:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
}
