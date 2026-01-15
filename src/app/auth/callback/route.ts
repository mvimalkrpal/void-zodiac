export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        const shopId = process.env.SHOPIFY_SHOP_ID;
        const clientId = process.env.SHOPIFY_CLIENT_ID;
        const callbackUrl = process.env.NEXT_PUBLIC_CALLBACK_URL || 'https://void-zodiac.pages.dev/auth/callback';

        const storedState = request.cookies.get('shopify_state')?.value;
        const codeVerifier = request.cookies.get('shopify_code_verifier')?.value;

        if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });

        if (state !== storedState) {
            console.error('State mismatch:', { sent: state, stored: storedState });
            return NextResponse.json({ error: 'State mismatch' }, { status: 400 });
        }

        if (!codeVerifier) return NextResponse.json({ error: 'Missing code verifier' }, { status: 400 });

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

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            return NextResponse.json({
                error: 'Token exchange failed',
                details: tokenData,
                redirect_uri_used: callbackUrl
            }, { status: tokenResponse.status });
        }

        const accessToken = tokenData.access_token;

        // --- FETCH CUSTOMER DATA TO VERIFY TOKEN ---
        const graphqlUrl = `https://shopify.com/${shopId}/account/customer/api/unstable/graphql`;

        const customerQuery = {
            query: `
        query {
          customer {
            firstName
            lastName
            emailAddress {
              emailAddress
            }
          }
        }
      `
        };

        const customerResponse = await fetch(graphqlUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': accessToken, // Shopify Customer API uses the token directly
            },
            body: JSON.stringify(customerQuery),
        });

        const customerData = await customerResponse.json();

        const response = NextResponse.json({
            message: 'Successfully logged in!',
            customer: customerData.data?.customer || 'Could not fetch customer details',
            token_data: tokenData,
            debug_customer_raw: customerData
        });

        response.cookies.delete('shopify_state');
        response.cookies.delete('shopify_code_verifier');

        return response;

    } catch (error: any) {
        console.error('Callback Route Error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            message: error.message
        }, { status: 500 });
    }
}
