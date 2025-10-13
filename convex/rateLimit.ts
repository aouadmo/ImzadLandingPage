import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Track submission attempts by IP or email
export const checkRateLimit = query({
  args: {
    identifier: v.string(), // IP address or email
    windowMinutes: v.number(), // Time window in minutes
    maxAttempts: v.number() // Max attempts in window
  },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.windowMinutes * 60 * 1000;
    
    // Count recent submissions from this identifier
    const recentSubmissions = await ctx.db
      .query("waitlist")
      .filter((q) => 
        q.and(
          q.or(
            q.eq(q.field("email"), args.identifier),
            q.eq(q.field("phone"), args.identifier)
          ),
          q.gte(q.field("_creationTime"), cutoff)
        )
      )
      .collect();
    
    return {
      allowed: recentSubmissions.length < args.maxAttempts,
      attempts: recentSubmissions.length,
      remaining: Math.max(0, args.maxAttempts - recentSubmissions.length)
    };
  }
});

