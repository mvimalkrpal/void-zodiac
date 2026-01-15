export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const shopId = process.env.SHOPIFY_SHOP_ID;
    const clientId = process.env.SHOPIFY_CLIENT_ID;

    const callbackUrl = process.env.NEXT_PUBLIC_CALLBACK_URL || 'https://void-zodiac.vercel.app/auth/callback';

    const storedState = request.cookies.get('shopify_state')?.value;
    const codeVerifier = request.cookies.get('shopify_code_verifier')?.value;

    if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    if (state !== storedState) return NextResponse.json({ error: 'State mismatch' }, { status: 400 });
    if (!codeVerifier) return NextResponse.json({ error: 'Missing code verifier' }, { status: 400 });

    try {
        const tokenUrl = `https://shopify.com/authentication/${shopId}/oauth/token`;

        const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: clientId!,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: callbackUrl,
                code_verifier: codeVerifier,
            }),
        });

        const data = await tokenResponse.json();

        if (!tokenResponse.ok) {
            return NextResponse.json({
                error: 'Token exchange failed',
                details: data,
                redirect_uri_used: callbackUrl
            }, { status: tokenResponse.status });
        }

        const response = NextResponse.json({
            message: 'Successfully logged in!',
            token_data: data
        });

        response.cookies.delete('shopify_state');
        response.cookies.delete('shopify_code_verifier');

        return response;

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
    }
}
