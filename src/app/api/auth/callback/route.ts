import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const shopId = process.env.SHOPIFY_SHOP_ID;
    const clientId = process.env.SHOPIFY_CLIENT_ID;

    let callbackUrl = process.env.NEXT_PUBLIC_CALLBACK_URL;
    if (!callbackUrl) {
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host');
        callbackUrl = `${protocol}://${host}/api/auth/callback`;
    }

    if (!code) {
        return NextResponse.json({ error: 'Missing code' }, { status: 400 });
    }

    try {
        // Shopify Customer Account API Token Endpoint (New structure)
        const tokenUrl = `https://shopify.com/authentication/${shopId}/oauth/token`;

        console.log('Exchanging code at:', tokenUrl);
        console.log('Using redirect_uri:', callbackUrl);

        const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
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
                url_attempted: tokenUrl,
                redirect_uri_used: callbackUrl
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
