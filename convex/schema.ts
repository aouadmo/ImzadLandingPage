import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  waitlist: defineTable({
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    firstName: v.string(),
    userType: v.string(),        // "shopper" | "traveler" | "both" | "not_specified"
    contactMethod: v.string(),   // "email" | "phone"
    language: v.string(),        // "en" | "fr" | "ar"
    source: v.string(),          // "landing_page"
    timestamp: v.string()        // ISO string
  }),
});

