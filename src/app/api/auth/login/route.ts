import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const shopId = process.env.SHOPIFY_SHOP_ID;
    const clientId = process.env.SHOPIFY_CLIENT_ID;

    // Use the callback URL from env, or construct it if not present
    // Note: For Shopify, this MUST match the whitelisted URL in the Partner Dashboard exactly
    let callbackUrl = process.env.NEXT_PUBLIC_CALLBACK_URL;

    if (!callbackUrl) {
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host');
        callbackUrl = `${protocol}://${host}/api/auth/callback`;
    }

    if (!shopId || !clientId) {
        return NextResponse.json({
            error: 'Missing configuration',
            details: { shopId: !!shopId, clientId: !!clientId, callbackUrl: !!callbackUrl }
        }, { status: 500 });
    }

    // Shopify Customer Account API Authorize URL (New structure)
    const authUrl = `https://shopify.com/authentication/${shopId}/oauth/authorize?` +
        new URLSearchParams({
            client_id: clientId,
            scope: 'openid email customer-account-api:full',
            redirect_uri: callbackUrl,
            state: Math.random().toString(36).substring(7),
            response_type: 'code',
        }).toString();

    console.log('Redirecting to:', authUrl);
    return NextResponse.redirect(authUrl);
}
