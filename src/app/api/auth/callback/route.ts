import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const shopId = process.env.SHOPIFY_SHOP_ID;
    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const callbackUrl = process.env.NEXT_PUBLIC_CALLBACK_URL;

    if (!code) {
        return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    try {
        // Shopify Customer Account API Token Endpoint
        // Format: https://shopify.com/<SHOP_ID>/auth/oauth/token
        const tokenUrl = `https://shopify.com/${shopId}/auth/oauth/token`;

        const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                // Customer Account API uses Public Client (no secret needed usually for mobile/SPA)
                // or Confidential Client. For this test, we assume Public or Basic Auth if needed.
            },
            body: new URLSearchParams({
                client_id: clientId!,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: callbackUrl!,
            }),
        });

        const data = await tokenResponse.json();

        if (!tokenResponse.ok) {
            return NextResponse.json({
                error: 'Token exchange failed',
                details: data,
                url_attempted: tokenUrl
            }, { status: tokenResponse.status });
        }

        return NextResponse.json({
            message: 'Successfully logged in!',
            token_data: data
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
    }
}
