import { NextApiRequest, NextApiResponse } from "next";

const FETCH_TIMEOUT_MS = 30000;

/**
 * Proxies packaging price calculation to the WordPress/RBX API.
 * Used by the public calculadora (no auth required).
 * Only supports GET with calcular=1 - does not save.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if ( req.method !== "GET" ) {
    res.setHeader( "Allow", "GET" );
    res.status( 405 ).json( { error: "Method not allowed" } );
    return;
  }

  const rbxApiUrl = ( process.env.RIBERMAX_API_URL || "" ).replace( /\/$/, "" );
  const rbxApiToken = process.env.RIBERMAX_API_TOKEN as string;
  const calcEmail =
    process.env.CALCULADORA_API_EMAIL || "calculadora@ribermax.com.br";

  if ( !rbxApiUrl || !rbxApiToken ) {
    res.status( 500 ).json( {
      error: "Server configuration missing (RIBERMAX_API_URL/TOKEN)",
    } );
    return;
  }

  const { modelo, comprimento, largura, altura, pesoProd, empresa, ...rest } =
    req.query;

  if ( !modelo || !comprimento || !largura || !empresa ) {
    res.status( 400 ).json( {
      error: "Missing required params: modelo, comprimento, largura, empresa",
    } );
    return;
  }

  const params = new URLSearchParams( {
    calcular: "1",
    modelo: String( modelo ),
    comprimento: String( comprimento ),
    largura: String( largura ),
    empresa: String( empresa ),
    Token: rbxApiToken,
  } );

  if ( altura !== undefined && altura !== "" ) {
    params.set( "altura", String( altura ) );
  }
  if ( pesoProd !== undefined && pesoProd !== "" ) {
    params.set( "pesoProd", String( pesoProd ) );
  }

  Object.entries( rest ).forEach( ( [ k, v ] ) => {
    if ( v !== undefined && v !== "" ) {
      params.set( k, Array.isArray( v ) ? v[ 0 ] : String( v ) );
    }
  } );

  const queryStr = params.toString();
  const urlsToTry = [
    `${ rbxApiUrl }/produtos?${ queryStr }`,
    rbxApiUrl.endsWith( "/api" )
      ? `${ rbxApiUrl.replace( /\/api$/, "" ) }/produtos?${ queryStr }`
      : null,
  ].filter( Boolean ) as string[];

  const controller = new AbortController();
  const timeout = setTimeout( () => controller.abort(), FETCH_TIMEOUT_MS );

  let lastError: string | null = null;
  let lastRaw: string | null = null;
  let lastStatus = 0;

  for ( const externalUrl of urlsToTry ) {
    try {
      const response = await fetch( externalUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Token: rbxApiToken,
          Email: calcEmail,
        },
        signal: controller.signal,
      } );

      const text = await response.text();
      lastStatus = response.status;
      lastRaw = text.substring( 0, 500 );

      let data: unknown;
      try {
        data = text ? JSON.parse( text ) : {};
      } catch {
        lastError = `Invalid JSON at ${ externalUrl }`;
        continue;
      }

      clearTimeout( timeout );

      if ( !response.ok ) {
        const errMsg =
          ( data as { message?: string } )?.message ||
          ( data as { error?: string } )?.error ||
          response.statusText;
        res.status( response.status ).json( { error: errMsg } );
        return;
      }

      res.status( 200 ).json( data );
      return;
    } catch ( err: unknown ) {
      lastError = ( err as Error )?.message || "Fetch failed";
    }
  }

  clearTimeout( timeout );
  res.status( 502 ).json( {
    error: lastError || "Invalid JSON from pricing API",
    raw: lastRaw,
    status: lastStatus,
    hint: "Check RIBERMAX_API_URL (try http://localhost/produtos or http://localhost/api/produtos)",
  } );
}
