import { NextResponse } from 'next/server';
import { generateCodeVerifier, generateCodeChallenge, generateState } from '@/lib/pkce';

export async function GET() {
    const shopId = process.env.SHOPIFY_SHOP_ID;
    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const callbackUrl = process.env.NEXT_PUBLIC_CALLBACK_URL || 'https://void-zodiac.vercel.app/api/auth/callback';

    if (!shopId || !clientId) {
        return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
    }

    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    // Shopify Customer Account API Authorize URL with PKCE
    const authUrl = `https://shopify.com/authentication/${shopId}/oauth/authorize?` +
        new URLSearchParams({
            client_id: clientId,
            scope: 'openid email customer-account-api:full',
            redirect_uri: callbackUrl,
            state: state,
            response_type: 'code',
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
        }).toString();

    const response = NextResponse.redirect(authUrl);

    // Store code_verifier and state in cookies
    response.cookies.set('shopify_code_verifier', codeVerifier, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 3600
    });
    response.cookies.set('shopify_state', state, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 3600
    });

    return response;
}
