// import { NextResponse } from 'next/server';
// import {getApiDocs} from '@/lib/swagger';
// import { corsHeaders, handleOptions } from '@/lib/utils/response';

// export async function OPTIONS() {
//   return handleOptions();
// }

// export async function GET() {
//   return NextResponse.json(getApiDocs(), {
//     headers: corsHeaders,
//   });
// }

import { NextResponse } from 'next/server';
import { getApiDocs } from '@/lib/swagger';
import { corsHeaders, handleOptions } from '@/lib/utils/response';

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  try {
    const spec = getApiDocs();
    return NextResponse.json(spec, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('[SWAGGER_DOCS_GEN_ERROR]:', error);
    return NextResponse.json(
      {
        status: 'error',
        code: 500,
        message: 'Failed to generate OpenAPI specification',
        data: null,
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}