# 🗓️ Scheduly — Simplified Calendly Clone (MERN Stack)

A full-stack scheduling platform built with MongoDB, Express.js, React (Vite), and Node.js.

---

## 📁 Final Folder Structure

```
scheduly/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register / Login / Me
│   │   ├── availabilityController.js
│   │   └── bookingController.js   # Create / List / Cancel bookings
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT protect middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Availability.js
│   │   └── Booking.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── availabilityRoutes.js
│   │   └── bookingRoutes.js
│   ├── utils/
│   │   └── emailService.js        # Nodemailer notifications
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── layout/
    │   │       └── Layout.jsx     # Sidebar shell
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global auth state
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── AvailabilityPage.jsx
    │   │   └── BookingPage.jsx    # Public /book/:username
    │   ├── services/
    │   │   └── api.js             # Axios instance
    │   ├── utils/
    │   │   └── timeUtils.js       # Slot generation helpers
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    └── vite.config.js
```

---

## 🚀 Run Locally

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- npm or yarn

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
npm install
npm run dev        # Runs on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
cp .env.example .env
# VITE_API_URL defaults to /api (proxied via Vite to :5000)
npm install
npm run dev        # Runs on http://localhost:5173
```

---

## ☁️ Deployment

### Backend → Render
1. Push backend/ to a GitHub repo
2. Create a new **Web Service** on [render.com](https://render.com)
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your Vercel URL)

### Frontend → Vercel
1. Push frontend/ to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Framework: Vite
4. Add env var: `VITE_API_URL=https://your-render-url.onrender.com/api`
5. Remove the proxy in vite.config.js for production (or keep and Vercel rewrites handle it)

### Database → MongoDB Atlas
1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Add database user
3. Whitelist `0.0.0.0/0` (for Render)
4. Copy connection string → set as `MONGO_URI`

---

## 💡 Assumptions Made
- Times stored as UTC strings "HH:MM"; frontend is responsible for local timezone display
- One availability document per user (upserted on save)
- Public booking requires no authentication
- Email is optional — silently skips if EMAIL_USER/PASS not configured
- Username must be lowercase alphanumeric + underscores only

---

## 🔮 Future Improvements
1. **Google Calendar sync** — OAuth2 to push/pull events
2. **Timezone-aware UI** — Auto-detect visitor timezone and display times accordingly
3. **Recurring bookings** — Book a recurring weekly slot
4. **Payment integration** — Stripe for paid consultations
5. **Team scheduling** — Round-robin assignment across team members
6. **Custom meeting types** — 15-min intro, 60-min deep dive, etc.
7. **iCal / .ics download** — Add booking to any calendar app
8. **SMS reminders** — Twilio for booking reminders
9. **Admin analytics** — Booking trends and peak hours dashboard
10. **Webhooks** — Notify external systems on booking events

---

## 🤖 Where LLM Tools Were Used
- **Code generation**: All boilerplate (routes, controllers, models) scaffolded with AI assistance
- **Tailwind styling**: Component styles and responsive layouts suggested by AI
- **Time utility logic**: `generateTimeSlots` helper logic verified with AI
- **README structure**: This documentation was AI-drafted

---
