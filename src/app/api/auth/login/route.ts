export const runtime = 'edge';
import { NextResponse } from 'next/server';

import { generateCodeVerifier, generateCodeChallenge, generateState } from '@/lib/pkce';

export async function GET() {
    try {
        const shopId = process.env.SHOPIFY_SHOP_ID;
        const clientId = process.env.SHOPIFY_CLIENT_ID;
        const callbackUrl = process.env.NEXT_PUBLIC_CALLBACK_URL || 'https://void-zodiac.pages.dev/auth/callback';

        if (!shopId || !clientId) {
            console.error('Missing config:', { shopId: !!shopId, clientId: !!clientId });
            return NextResponse.json({
                error: 'Configuration Error',
                message: 'SHOPIFY_SHOP_ID or SHOPIFY_CLIENT_ID not found in environment.'
            }, { status: 500 });
        }

        const state = generateState();
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        const params = new URLSearchParams({
            client_id: clientId,
            scope: 'openid email customer-account-api:full',
            redirect_uri: callbackUrl,
            state: state,
            response_type: 'code',
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
        });

        const authUrl = `https://shopify.com/authentication/${shopId}/oauth/authorize?${params.toString()}`;

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
    } catch (error: any) {
        console.error('Login Route Error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

