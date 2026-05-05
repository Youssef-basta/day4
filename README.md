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

1. **Visa / Mastercard** — fake card form (number, name, expiry, CVV). Marks booking *Paid*. Stores only the last 4 digits.
2. **KNET** — fake KNET gateway (card + PIN). Marks booking *Paid*.
3. **Cash on site** — booking is created *Unpaid*. Admin clears it via **Mark cash as Paid** in the booking detail when the customer pays.

Online flows have a short artificial delay to feel like a real gateway round-trip. **No real payments are processed.** Card details are not stored or transmitted anywhere.

## Demo flow

1. Land on `/`, tap **Book Now**.
2. Pick **Haircut**, pick a slot, fill name + phone.
3. Pick **Cash on site** (or try Visa with `4242 4242 4242 4242`).
4. Confirmation shows your `KB-####` reference.
5. Visit `/admin`, sign in with `admin123`.
6. Open your booking → **Mark cash as Paid**, then **Mark as Done**.

## What's intentionally not here

- No real payment gateway — fake forms only.
- No persistent database — bookings live in `lib/store.tsx` + localStorage.
- Auth is a single shared password, not per-user accounts.
- No SMS / email notifications.

These are next-day scope.
