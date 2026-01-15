export const runtime = 'edge';
import { NextResponse } from 'next/server';

import { generateCodeVerifier, generateCodeChallenge, generateState } from '@/lib/pkce';

export async function GET() {
    const shopId = process.env.SHOPIFY_SHOP_ID;
    const clientId = process.env.SHOPIFY_CLIENT_ID;

    // MATCHING THE SCREENSHOT: Removed '/api' from the path
    const callbackUrl = process.env.NEXT_PUBLIC_CALLBACK_URL || 'https://void-zodiac.vercel.app/auth/callback';

    if (!shopId || !clientId) {
        return NextResponse.json({ error: 'Missing configuration' }, { status: 500 });
    }

    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

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
