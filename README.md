# Joe Barber Studio

Mobile-first booking system for a Kuwait City barbershop. Customer site at `/`, password-protected owner panel at `/admin`. State is in-memory (React Context) with a `localStorage` cache so demo data survives reloads — no real database yet.

## Stack

- Next.js 14 (App Router) + React 18
- TypeScript
- Tailwind CSS with brand colors `#1E3A8A` / `#FACC15`

## Run it

```bash
npm install
npm run dev
```

Open `http://localhost:3000` on a phone-width viewport (390px).

## Admin login

`/admin/*` is protected by a Next.js middleware that checks an httpOnly cookie. Sign in at `/admin/login`.

Default password: **`admin123`**

Override with an env var:

```bash
# .env.local
ADMIN_PASSWORD=your-strong-password
```

Sessions last 8 hours, then you'll be redirected back to login.

## Routes

| Path | Screen |
| --- | --- |
| `/` | Home / landing — services + Book Now |
| `/book` | 4-step picker: service → time → details → **payment** |
| `/confirmation/[id]` | Booking reference + payment status + next steps |
| `/admin/login` | Password gate |
| `/admin` | Today's bookings dashboard |
| `/admin/bookings` | All bookings, filter by date / status |
| `/admin/bookings/[id]` | Detail with **Mark as Done** / **Cancel** / **Mark cash as Paid** |
| `/admin/slots` | Open / close time slots |

## Payment

Three methods on the booking flow:

1. **Visa / Mastercard** — fake inline card form (Phase 1 of MyFatoorah integration is wired; UI swap pending — see below).
2. **KNET** — same.
3. **Cash on site** — booking is created *Unpaid*. Admin clears it via **Mark cash as Paid** in the booking detail when the customer pays.

## MyFatoorah integration

Phase 1 (current) — server-side API client at [lib/myfatoorah.ts](lib/myfatoorah.ts). UI still uses the fake card forms.

To enable, in `.env.local` (and Vercel env vars):

```
MYFATOORAH_API_TOKEN=eyJ0eXAiOiJK...    # from https://portal.myfatoorah.com
MYFATOORAH_BASE_URL=https://apitest.myfatoorah.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Restart the dev server after changing env vars.

**Test cards (sandbox):**
- Visa: `4111 1111 1111 1111` · expiry `01/27` · CVV `100`
- KNET: see MyFatoorah docs

**Phase 2 (next)** — replace fake card forms with redirect to MyFatoorah's hosted page, add `payment_status='pending'` state + a `payment_intent_id` column, add `/api/payment/callback` to verify and finalize the booking. Stuck-payment cleanup at 15min.

For production, switch `MYFATOORAH_BASE_URL` to `https://api.myfatoorah.com` and use the live API token.

## Demo flow

1. Land on `/`, tap **Book Now**.
2. Pick **Haircut**, pick a slot, fill name + phone (8-digit Kuwait number).
3. Pick **Cash on site** (or Visa with `4242 4242 4242 4242` while still on the fake demo).
4. Confirmation shows your `KB-####` booking ID.
5. Visit `/admin`, sign in with `admin123`.
6. Open your booking → **Mark cash as Paid**, then **Mark as Done**.
