import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const add = mutation({
  args: {
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    firstName: v.string(),
    userType: v.string(),
    contactMethod: v.string(),
    language: v.string(),
    source: v.string(),
    timestamp: v.string()
  },
  handler: async (ctx, args) => {
    if (args.contactMethod === "email" && (!args.email || !args.email.trim())) {
      throw new Error("Email required for contactMethod=email");
    }
    if (args.contactMethod === "phone" && (!args.phone || !args.phone.trim())) {
      throw new Error("Phone required for contactMethod=phone");
    }

    await ctx.db.insert("waitlist", args);
    return { success: true } as const;
  }
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    const allEntries = await ctx.db.query("waitlist").collect();
    return allEntries.length;
  }
});

