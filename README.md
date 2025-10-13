# 🚀 Imzad Landing Page

A trilingual (English, French, Arabic) landing page with iOS waitlist functionality for the Imzad marketplace platform.

## 📋 Overview

Imzad connects Algerian shoppers with international travelers to facilitate product delivery. This landing page collects waitlist signups for the upcoming iOS app launch.

### Key Features

- **Trilingual Support**: English, French, and Arabic (with RTL layout)
- **iOS Waitlist Modal**: Progressive disclosure form with email/phone options
- **Legal Compliance**: Privacy Policy, Terms of Service, and Contact pages
- **Responsive Design**: Mobile-first, optimized for all devices
- **Accessibility**: WCAG 2.1 AA compliant with ARIA labels and keyboard navigation
- **Backend**: Serverless Convex backend with rate limiting and validation

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Convex (serverless)
- **Hosting**: Vercel (recommended) / Netlify / GitHub Pages
- **Analytics**: Plausible / Google Analytics (optional)
- **Email**: Resend (optional, for notifications)

## 📁 Project Structure

```
ImzadLandingPage/
├── index.html              # Main landing page
├── privacy.html            # Privacy Policy (13 sections)
├── terms.html              # Terms of Service (15 sections)
├── contact.html            # Contact page
├── style.css               # Main stylesheet (navy/gold/white theme)
├── script.js               # Language switching & interactive elements
├── waitlist.js             # Waitlist modal functionality
├── analytics.js            # Analytics tracking (optional)
├── test-waitlist.html      # Testing page for API
├── convex/
│   ├── schema.ts           # Database schema (waitlist table)
│   ├── waitlist.ts         # Waitlist mutation
│   ├── http.ts             # HTTP actions (CORS, rate limiting)
│   └── rateLimit.ts        # Rate limiting query
├── images/                 # App screenshots
├── PRODUCTION_CHECKLIST.md # Comprehensive pre-launch checklist
├── QUICK_START_GUIDE.md    # 30-minute deployment guide
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Convex account (free tier available)
- Git installed

### 1. Clone and Install

```bash
git clone https://github.com/aouadmo/ImzadLandingPage.git
cd ImzadLandingPage
npm install
```

### 2. Configure Convex

The Convex backend is already configured and deployed to:
- **Dev:** `https://spotted-civet-148.convex.cloud`
- **HTTP Endpoint:** `https://spotted-civet-148.convex.site/waitlistSubmit`

To deploy updates:
```bash
npx convex deploy
```

### 3. Update CORS (IMPORTANT!)

Before deploying to production, update `convex/http.ts`:

```typescript
const ALLOWED_ORIGINS = [
  "https://your-domain.com",  // Replace with your actual domain
  "https://www.your-domain.com"
];
```

Then redeploy:
```bash
npx convex deploy
```

### 4. Deploy to Vercel

```bash
npm i -g vercel
vercel login
vercel --prod
```

Or use the Vercel dashboard to import from GitHub.

### 5. Test

Visit your deployed URL and:
1. Click "Join iOS Waitlist"
2. Fill out the form
3. Submit
4. Check Convex dashboard: https://dashboard.convex.dev/d/spotted-civet-148/data/waitlist

## 📊 Features Breakdown

### Waitlist Modal
- **Triggers**: Button click, exit-intent (session-gated), scroll depth
- **Fields**: First name, user type (shopper/traveler/both), email OR phone
- **Validation**: Real-time, localized error messages
- **GDPR**: Explicit consent checkbox with privacy policy link
- **Phone Validation**: Algerian format (+213)
- **Success State**: Animated counter, thank you message

### Legal Pages
- **Privacy Policy**: 13 sections, GDPR-compliant, trilingual
- **Terms of Service**: 15 sections, comprehensive, trilingual
- **Contact Page**: Simple mailto link, trilingual

### Backend (Convex)
- **Waitlist Table**: Stores email, phone, firstName, userType, contactMethod, language, source, timestamp
- **Rate Limiting**: Max 3 submissions per email/phone in 60 minutes
- **CORS**: Configurable allowed origins
- **Validation**: Server-side validation for all fields

## 🔒 Security

- ✅ HTTPS enforced
- ✅ CORS protection (configure before production)
- ✅ Rate limiting (3 submissions/hour per identifier)
- ✅ Input validation (client + server)
- ✅ No sensitive data in frontend code
- ✅ Environment variables for API keys

## 📈 Analytics

The `analytics.js` file provides a simple analytics wrapper. Integrate with:

- **Google Analytics 4**: Add GA4 tracking code
- **Plausible**: Privacy-friendly, GDPR-compliant
- **Simple Analytics**: Lightweight alternative

### Tracked Events
- Page views
- Waitlist modal opened/closed
- Form started/submitted
- Contact method toggled
- Language switched
- Form errors

## 🌍 Internationalization

### Supported Languages
- **English** (en)
- **French** (fr)
- **Arabic** (ar) with RTL layout

### How It Works
- All text wrapped in `<span data-lang="en|fr|ar">` elements
- JavaScript toggles visibility based on selected language
- Language preference saved in localStorage
- RTL layout automatically applied for Arabic

### Adding New Languages

1. Add language button to header:
```html
<button data-lang="es" aria-label="Switch to Spanish">ES</button>
```

2. Add translations to all `data-lang` spans:
```html
<span data-lang="en">Hello</span>
<span data-lang="fr">Bonjour</span>
<span data-lang="ar">مرحبا</span>
<span data-lang="es">Hola</span>
```

3. Update `script.js` to handle new language

## 🧪 Testing

### Manual Testing
```bash
# Open test page
open test-waitlist.html

# Or test with curl
curl -X POST https://spotted-civet-148.convex.site/waitlistSubmit \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","firstName":"Test","userType":"shopper","contactMethod":"email","language":"en","source":"test","timestamp":"2025-01-15T10:00:00Z"}'
```

### Browser Testing
- Chrome (desktop & mobile)
- Firefox (desktop & mobile)
- Safari (desktop & mobile)
- Edge
- Samsung Internet

### Accessibility Testing
- Keyboard navigation (Tab, Enter, ESC)
- Screen reader (NVDA, JAWS, VoiceOver)
- Color contrast checker
- Focus indicators

## 📦 Deployment

### Recommended: Vercel
```bash
vercel --prod
```

### Alternative: Netlify
```bash
netlify deploy --prod
```

### Alternative: GitHub Pages
```bash
# Push to gh-pages branch
git subtree push --prefix . origin gh-pages
```

## 🔧 Configuration

### Environment Variables (Convex)

Set in Convex dashboard or via CLI:

```bash
# For email notifications (optional)
npx convex env set RESEND_API_KEY your_api_key_here

# For custom domain CORS
# Update ALLOWED_ORIGINS in convex/http.ts instead
```

### Customization

**Colors** (in `style.css`):
```css
:root {
  --primary-color: #0c2446;    /* Navy blue */
  --accent-orange: #d4af37;    /* Gold */
  --background: #ffffff;       /* White */
}
```

**Rate Limiting** (in `convex/http.ts`):
```typescript
windowMinutes: 60,    // Time window
maxAttempts: 3        // Max submissions
```

## 📊 Monitoring

### Convex Dashboard
- View waitlist data: https://dashboard.convex.dev/d/spotted-civet-148/data/waitlist
- Check logs: https://dashboard.convex.dev/d/spotted-civet-148/logs
- Monitor functions: https://dashboard.convex.dev/d/spotted-civet-148/functions

### Export Waitlist Data
```bash
npx convex run waitlist:exportAll > waitlist-backup.json
```

## 🆘 Troubleshooting

### Form not submitting
1. Check browser console for errors
2. Verify Convex deployment is running
3. Check CORS settings in `convex/http.ts`
4. Test endpoint with curl

### CORS errors
Update `ALLOWED_ORIGINS` in `convex/http.ts` with your production domain

### Rate limiting too strict
Adjust `maxAttempts` or `windowMinutes` in `convex/http.ts`

## 📚 Documentation

- [Production Checklist](PRODUCTION_CHECKLIST.md) - Comprehensive pre-launch guide
- [Quick Start Guide](QUICK_START_GUIDE.md) - Deploy in 30 minutes
- [Convex Docs](https://docs.convex.dev) - Backend documentation

## 🤝 Contributing

This is a private project for Imzad. For questions or issues, contact admin@imzadapp.com.

## 📄 License

Proprietary - All rights reserved by Imzad

## 📞 Support

- **Email**: admin@imzadapp.com
- **Convex Dashboard**: https://dashboard.convex.dev/d/spotted-civet-148
- **Convex Discord**: https://convex.dev/community

---

**Built with ❤️ for the Algerian community**

Last Updated: January 2025

