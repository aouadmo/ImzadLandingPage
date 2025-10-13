# 🚀 Quick Start Guide - Deploy Imzad Landing Page in 30 Minutes

## Step 1: Update CORS (5 minutes) ⚠️ CRITICAL

1. Open `convex/http.ts`
2. Replace `YOUR_DOMAIN_HERE` with your actual domain:
   ```typescript
   const ALLOWED_ORIGINS = [
     "https://imzadapp.com",  // ← Your production domain
     "https://www.imzadapp.com"
   ];
   ```
3. Deploy to Convex:
   ```bash
   npx convex deploy
   ```

---

## Step 2: Deploy to Vercel (10 minutes)

### Option A: Deploy via Vercel Dashboard (Easiest)
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Click "Deploy"
5. Done! Your site is live at `https://your-project.vercel.app`

### Option B: Deploy via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## Step 3: Add Custom Domain (10 minutes)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your domain (e.g., `imzadapp.com`)
4. Update your DNS records as instructed by Vercel
5. Wait 5-10 minutes for SSL certificate

**DNS Records (example):**
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel's IP)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## Step 4: Update CORS Again (5 minutes)

Now that you have your production domain:

1. Open `convex/http.ts`
2. Update with your actual Vercel domain:
   ```typescript
   const ALLOWED_ORIGINS = [
     "https://imzadapp.com",           // Your custom domain
     "https://your-project.vercel.app" // Your Vercel domain
   ];
   ```
3. Deploy:
   ```bash
   npx convex deploy
   ```

---

## Step 5: Test Everything (5 minutes)

### Test Checklist:
- [ ] Visit your production URL
- [ ] Click "Join iOS Waitlist"
- [ ] Fill out form and submit
- [ ] Check Convex dashboard for new entry: https://dashboard.convex.dev/d/spotted-civet-148/data/waitlist
- [ ] Test in mobile browser
- [ ] Switch languages (EN → FR → AR)
- [ ] Click Privacy Policy link
- [ ] Click Terms of Service link

---

## Step 6: Set Up Email Notifications (Optional, 15 minutes)

### Using Resend (Recommended - Free tier: 3,000 emails/month)

1. Sign up at https://resend.com
2. Get API key
3. Add to Convex environment variables:
   ```bash
   npx convex env set RESEND_API_KEY your_api_key_here
   ```
4. Create `convex/notifications.ts`:
   ```typescript
   import { action } from "./_generated/server";
   import { v } from "convex/values";

   export const sendAdminNotification = action({
     args: {
       email: v.string(),
       firstName: v.string(),
       userType: v.string(),
       contactMethod: v.string()
     },
     handler: async (ctx, args) => {
       const response = await fetch("https://api.resend.com/emails", {
         method: "POST",
         headers: {
           "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
           "Content-Type": "application/json"
         },
         body: JSON.stringify({
           from: "Imzad Waitlist <noreply@imzadapp.com>",
           to: "admin@imzadapp.com",
           subject: `New Waitlist Signup: ${args.firstName}`,
           html: `
             <h2>New Waitlist Signup</h2>
             <p><strong>Name:</strong> ${args.firstName}</p>
             <p><strong>Contact:</strong> ${args.email || args.phone || 'N/A'}</p>
             <p><strong>User Type:</strong> ${args.userType}</p>
             <p><strong>Contact Method:</strong> ${args.contactMethod}</p>
             <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
           `
         })
       });

       if (!response.ok) {
         throw new Error(`Email failed: ${response.statusText}`);
       }

       return { success: true };
     }
   });
   ```

5. Update `convex/waitlist.ts` to call notification:
   ```typescript
   import { api } from "./_generated/api";

   export const add = mutation({
     // ... existing args ...
     handler: async (ctx, args) => {
       // ... existing validation ...

       await ctx.db.insert("waitlist", args);

       // Send notification (fire and forget)
       ctx.scheduler.runAfter(0, api.notifications.sendAdminNotification, {
         email: args.email || "",
         firstName: args.firstName,
         userType: args.userType,
         contactMethod: args.contactMethod
       });

       return { success: true };
     }
   });
   ```

6. Deploy:
   ```bash
   npx convex deploy
   ```

---

## Step 7: Add Analytics (Optional, 10 minutes)

### Using Plausible (Privacy-friendly, GDPR compliant)

1. Sign up at https://plausible.io
2. Add your domain
3. Add script to `index.html`, `privacy.html`, `terms.html`, `contact.html`:
   ```html
   <head>
     ...
     <script defer data-domain="imzadapp.com" src="https://plausible.io/js/script.js"></script>
   </head>
   ```

### Using Google Analytics 4

1. Create GA4 property at https://analytics.google.com
2. Get Measurement ID (e.g., `G-XXXXXXXXXX`)
3. Add to all HTML pages:
   ```html
   <head>
     ...
     <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
     <script>
       window.dataLayer = window.dataLayer || [];
       function gtag(){dataLayer.push(arguments);}
       gtag('js', new Date());
       gtag('config', 'G-XXXXXXXXXX');
     </script>
   </head>
   ```

---

## Step 8: SEO Optimization (10 minutes)

Add to `<head>` of `index.html`:

```html
<!-- Primary Meta Tags -->
<meta name="title" content="Imzad - Connect Algerian Shoppers with International Travelers">
<meta name="description" content="Join the waitlist for Imzad, the platform connecting Algerian shoppers with travelers. Get products from abroad delivered safely and affordably.">
<meta name="keywords" content="Algeria, shopping, travel, delivery, marketplace, Imzad">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://imzadapp.com/">
<meta property="og:title" content="Imzad - Connect Shoppers with Travelers">
<meta property="og:description" content="Join the waitlist for Imzad, the platform connecting Algerian shoppers with travelers.">
<meta property="og:image" content="https://imzadapp.com/images/og-image.jpg">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://imzadapp.com/">
<meta property="twitter:title" content="Imzad - Connect Shoppers with Travelers">
<meta property="twitter:description" content="Join the waitlist for Imzad, the platform connecting Algerian shoppers with travelers.">
<meta property="twitter:image" content="https://imzadapp.com/images/og-image.jpg">
```

Create `robots.txt` in root:
```
User-agent: *
Allow: /

Sitemap: https://imzadapp.com/sitemap.xml
```

Create `sitemap.xml` in root:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://imzadapp.com/</loc>
    <lastmod>2025-01-15</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://imzadapp.com/privacy.html</loc>
    <lastmod>2025-01-15</lastmod>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://imzadapp.com/terms.html</loc>
    <lastmod>2025-01-15</lastmod>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://imzadapp.com/contact.html</loc>
    <lastmod>2025-01-15</lastmod>
    <priority>0.5</priority>
  </url>
</urlset>
```

---

## 🎉 You're Live!

Your landing page is now:
- ✅ Deployed to production
- ✅ Secured with HTTPS
- ✅ Collecting waitlist signups
- ✅ Protected with CORS and rate limiting
- ✅ (Optional) Sending email notifications
- ✅ (Optional) Tracking analytics
- ✅ (Optional) Optimized for SEO

---

## 📊 Monitor Your Launch

### Daily Checks (Week 1)
- Check Convex dashboard for new signups
- Monitor email notifications
- Check analytics for traffic sources
- Test form submission once

### Weekly Checks
- Export waitlist data: `npx convex run waitlist:exportAll > backup.json`
- Review analytics (traffic, conversion rate)
- Check for errors in Convex logs

### Monthly Tasks
- Backup waitlist data
- Review and respond to contact form emails
- Plan launch announcement email

---

## 🆘 Troubleshooting

### "CORS error" in browser console
→ Update `ALLOWED_ORIGINS` in `convex/http.ts` and redeploy

### Form submits but no data in Convex
→ Check Convex logs: https://dashboard.convex.dev/d/spotted-civet-148/logs

### Email notifications not working
→ Verify `RESEND_API_KEY` is set: `npx convex env list`

### Rate limiting too strict
→ Adjust `maxAttempts` or `windowMinutes` in `convex/http.ts`

---

## 📞 Need Help?

- **Convex Discord:** https://convex.dev/community
- **Vercel Support:** https://vercel.com/support
- **Your Convex Dashboard:** https://dashboard.convex.dev/d/spotted-civet-148

---

**Estimated Total Time:** 30-60 minutes
**Difficulty:** Beginner-friendly
**Cost:** $0 (using free tiers)

