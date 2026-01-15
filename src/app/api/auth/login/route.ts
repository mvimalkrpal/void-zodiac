import { NextResponse } from 'next/server';

export async function GET() {
    const shopId = process.env.SHOPIFY_SHOP_ID;
    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const callbackUrl = process.env.NEXT_PUBLIC_CALLBACK_URL;

    if (!shopId || !clientId || !callbackUrl) {
        return NextResponse.json({
            error: 'Missing configuration',
            details: { shopId: !!shopId, clientId: !!clientId, callbackUrl: !!callbackUrl }
        }, { status: 500 });
    }

    // Shopify Customer Account API Authorize URL
    // Format: https://shopify.com/<SHOP_ID>/auth/oauth/authorize
    const authUrl = `https://shopify.com/${shopId}/auth/oauth/authorize?` +
        new URLSearchParams({
            client_id: clientId,
            scope: 'openid email customer-account-api:full',
            redirect_uri: callbackUrl,
            state: Math.random().toString(36).substring(7),
            response_type: 'code',
        }).toString();

    return NextResponse.redirect(authUrl);
}
