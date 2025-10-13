import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

// Set this to your production domain(s)
// For multiple domains, check the Origin header and return the matching one
const ALLOWED_ORIGINS = [
  "https://imzadapp.com",
  "https://www.imzadapp.com",
  "http://localhost:5500", // For local testing
  "http://127.0.0.1:5500"
];

function getAllowedOrigin(requestOrigin: string | null): string {
  if (!requestOrigin) return ALLOWED_ORIGINS[0];
  return ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : ALLOWED_ORIGINS[0];
}

const http = httpRouter();

http.route({
  path: "/waitlistSubmit",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const origin = getAllowedOrigin(req.headers.get("Origin"));

    try {
      const body = await req.json();

      // Rate limiting: max 3 submissions per email/phone in 60 minutes
      const identifier = body.email || body.phone;
      if (identifier) {
        const rateCheck = await ctx.runQuery(api.rateLimit.checkRateLimit, {
          identifier,
          windowMinutes: 60,
          maxAttempts: 3
        });

        if (!rateCheck.allowed) {
          return new Response(JSON.stringify({
            success: false,
            error: "Too many submissions. Please try again later."
          }), {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": origin,
              "Vary": "Origin",
              "Retry-After": "3600"
            }
          });
        }
      }

      await ctx.runMutation("waitlist:add", body);

      return new Response(JSON.stringify({ success: true }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin,
          "Vary": "Origin"
        }
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ success: false, error: e.message }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": origin,
          "Vary": "Origin"
        }
      });
    }
  })
});

// Handle CORS preflight
http.route({
  path: "/waitlistSubmit",
  method: "OPTIONS",
  handler: httpAction(async (_, req) => {
    const origin = getAllowedOrigin(req.headers.get("Origin"));

    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Vary": "Origin"
      }
    });
  })
});

export default http;

