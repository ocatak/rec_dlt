import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

type FabricResponse<R = any> = {
  status: string;
  data: R;
};

export async function fabricFetcher<T = {}, R = {}>({ 
  url, 
  method, 
  payload, 
}: { 
  url: string; 
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'; 
  payload?: T; 
}): Promise<FabricResponse<R>> {
  try {
    const config: AxiosRequestConfig = {
      timeout: 60000, // 1 minute timeout
      timeoutErrorMessage: `Failed to connect to fabric server (${url}) within 60 seconds`,
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      data: payload,
    };

    const axiosResponse: AxiosResponse<R> = await axios(config);
    return {
      status: axiosResponse.status.toString(),
      data: axiosResponse.data,
    };

  } catch (e) {
    if (axios.isAxiosError(e)) {
      if (e.response) {
        return {
          status: e.response.status.toString(),
          data: e.response.data as R,
        };
      } else if (e.request) {
        return {
          status: '500',
          data: {
            message: `No response received from ${url}`,
          } as unknown as R,
        };
      } else {
        const errorMessage = getAxiosErrorMessage(e.code, url);
        return {
          status: '500',
          data: {
            message: errorMessage,
          } as unknown as R,
        };
      }
    } else {
      return {
        status: '500',
        data: {
          message: `Failed to invoke ${url}`,
        } as unknown as R,
      };
    }
  }
}

function getAxiosErrorMessage(errorCode: string | undefined, url: string): string {
  switch (errorCode) {
    case 'ECONNREFUSED':
      return `Connection to ${url} refused`;
    case 'ENOTFOUND':
      return `Could not find ${url}`;
    case 'ETIMEDOUT':
      return `Connection to ${url} timed out`;
    default:
      return `Failed to invoke ${url}`;
  }
}
