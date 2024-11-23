'use server'

import { NextResponse } from 'next/server';
import axios from 'axios';
import { getCookie } from '@/lib/cookieHandler';
interface Organization {
  organizationName: string;
  organizationEmail: string;
  organizationAgentEndpoint: string;
}

interface ConnectedOrganization {
  clientAgentEndpoint: string;
  clientEmail: string;
  clientName: string;
  connectionId: string;
  docType: string;
  organizationEmail: string;
  type: string;
}


interface MappedOrganization {
  organizationName: string;
  organizationEmail: string;
  organizationAgentEndpoint: string;
  connectionId?: string; 
}
export async function GET() {
  try {
  const token = await getCookie()
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }
  
    const [resp1, resp2] = await Promise.all([ axios.get(`${process.env.FABRIC_API}/organization/all`, config), axios.get(`${process.env.FABRIC_API}/organization/connection/organizations`, config)])
    const allOrg = resp1.data.response
    const connectedOrg = resp2.data.response
    const connectedOrgMap = new Map<string, ConnectedOrganization>();
    connectedOrg.map((org: ConnectedOrganization) => {
      connectedOrgMap.set(org.clientEmail, org)
    });

    const mappedOrganization: MappedOrganization = allOrg.map((org: Organization)=>{
      const connectedOrg = connectedOrgMap.get(org.organizationEmail)
      return {
        organizationName: org.organizationName,
        organizationEmail: org.organizationEmail,
        organizationAgentEndpoint: org.organizationAgentEndpoint,
        connectionId: connectedOrg?.connectionId 
      };
    
    })

    return NextResponse.json({success: true, org: mappedOrganization});
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { message: error.response?.data?.message || "An error occurred while fetching connections." },
        { status: error.response?.status || 500 }
      );
    }
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
