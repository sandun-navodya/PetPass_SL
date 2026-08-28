// import { NextResponse } from 'next/server';

// export const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
//   'Access-Control-Allow-Headers': 'Content-Type, Authorization',
// };

// export function handleOptions() {
//   return new NextResponse(null, {
//     status: 204,
//     headers: corsHeaders,
//   });
// }

// export function jsonSuccess<T>(data: T, message: string, code: number = 200) {
//   return NextResponse.json(
//     {
//       success: true,
//       message,
//       data,
//     },
//     {
//       status: code,
//       headers: corsHeaders,
//     }
//   );
// }

// export function jsonError(message: string, code: number = 400) {
//   return NextResponse.json(
//     {
//       success: false,
//       message,
//     },
//     {
//       status: code,
//       headers: corsHeaders,
//     }
//   );
// }

import { NextResponse } from 'next/server';

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

export function handleOptions(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// 1. Format used by Auth Endpoints
export function jsonSuccess<T>(data: T, message: string, code: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    {
      status: code,
      headers: corsHeaders,
    }
  );
}

export function jsonError(message: string, code: number = 400): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status: code,
      headers: corsHeaders,
    }
  );
}

// 2. Envelope Format used by Locations, Categories, Clinics, & Providers
export function jsonEnvelope<T>(
  data: T,
  message: string,
  statusCode: number = 200,
  isSuccess: boolean = true
): NextResponse {
  return NextResponse.json(
    {
      status: isSuccess ? 'success' : 'error',
      code: statusCode,
      message,
      timestamp: new Date().toISOString(),
      data,
    },
    {
      status: statusCode,
      headers: corsHeaders,
    }
  );
}

export function jsonEnvelopeError(message: string, statusCode: number = 400): NextResponse {
  return NextResponse.json(
    {
      status: 'error',
      code: statusCode,
      message,
      timestamp: new Date().toISOString(),
      data: null,
    },
    {
      status: statusCode,
      headers: corsHeaders,
    }
  );
}