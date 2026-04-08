# RateHawk Certification Request — X Travel (xturizm.com)

**To:** Anastasiya Krikunova / RateHawk Integration Support
**From:** X Travel — key_id 422
**Subject:** Certification request — key_id 422 (X Travel / xturizm.com)

---

Hi Anastasiya,

We have completed the sandbox integration for key_id 422 and would like to request production credentials + certification review. Below are the checklist answers and our sandbox verification results.

## 1. Company / Integration details

- **Company:** X Travel / xturizm.com
- **Tech contact:** Tunca Bildik — info@viagotransfer.com
- **Integration type:** B2B v3 (JSON, Basic Auth)
- **Stack:** Next.js 16 + Supabase (Postgres) + Vercel
- **Scope (phase 1):** Hotel search + booking, `payment_type=hotel` only (guest pays at property, no PSP handling on our side).

## 2. Test scenarios — all 7 verified end-to-end against sandbox

Harness: `scripts/rh-cert-test.mts`. Full flow: `searchByHotels → hotelPage → prebook → bookFormPartner → bookFinish → pollFinishStatus`.

| # | Scenario | Hotel ID | Trigger | Result |
|---|---|---|---|---|
| 1 | Multiroom — 2 rooms, mixed children (2a+1c[3], 2a+3c[1,5,17]) | 10004834 | — | finish acknowledged |
| 2 | Citizenship — Uzbekistan | 10004834 | residency=uz | `success` (20 polls) |
| 3 | Children — Monaco, ages 0 & 17 | 10004834 | residency=mc | finish acknowledged |
| 4 | Price increase ~10% | 8819557 | — | Δ=10.0% detected at prebook |
| 5 | Unknown → success | 10004834 | `partner_order_id` suffix `unknown_success` | finish errored → polled → `success` (12 polls) |
| 6 | Unknown → soldout | 10004834 | suffix `unknown_soldout` | finish errored → polled → `soldout` (12 polls) |
| 7 | Unknown → book_limit | 10004834 | suffix `unknown_book_limit` | finish errored → polled → `book_limit` (36 polls) |

Sample partner_order_ids (can be cross-checked in your logs):
- `x-cert2-mnq5zlex` — success (citizenship=uz)
- `x-cert5-mnq7cptu-unknown_success`
- `x-cert6-mnq7js3e-unknown_soldout`
- `x-cert7-mnq7qjrh-unknown_book_limit`

Additionally, a real browser-initiated booking was completed on our preview environment:
- `x-mnq4q0dp-elu6ae` — Conrad LA, full user flow (search → detail → room → guest form → confirmation), verified status=confirmed in our DB.

## 3. Call sequence — search through cancellation

```
/search/serp/hotels/          (SERP, hids + residency)
  → /search/hp/                (locks book_hash per rate)
    → /hotel/prebook/          (price lock + cancellation policies)
      → /hotel/order/booking/form/      (bookFormPartner — commits partner_order_id)
        → /hotel/order/booking/finish/  (async commit)
          → /hotel/order/booking/finish/status/ (polled until percent=100 OR terminal error)
```

Cancellation policies are extracted from prebook `payment_options.payment_types[0].cancellation_penalties` and surfaced to the user before they confirm.

## 4. IP whitelist

- **Production egress IP (static):** `63.182.154.248` — dedicated AWS Lightsail instance (`api-proxy`, Frankfurt / eu-central-1, Zone A). All RateHawk B2B v3 calls from Vercel are routed through this static proxy so the source IP stays constant.
- **IPv6:** `2a05:d014:1270:4800:bd9d:861a:790a:b5aa` (same host)

## 5. RPM (requests per minute) per endpoint — expected peak

| Endpoint | Expected peak RPM |
|---|---|
| `/search/serp/region/` | 60 |
| `/search/serp/hotels/` | 30 |
| `/search/hp/` | 120 |
| `/hotel/info/` | 60 (cached 7 days in Supabase) |
| `/hotel/prebook/` | 30 |
| `/hotel/order/booking/form/` | 15 |
| `/hotel/order/booking/finish/` | 15 |
| `/hotel/order/booking/finish/status/` | 90 (polling — ~45 attempts/booking × concurrent) |

These are phase-1 estimates for an MVP launch. We will scale up gradually and notify RateHawk before significant increases.

## 6. Payment types

Phase 1: **`hotel` only** (guest pays at property). We do not touch guest card data, issue charges, or handle any financial flow on our side during phase 1.

Phase 2 (planned Q3): `deposit` once we complete our PSP integration (iyzico). Will re-certify before switching.

## 7. Static data update methodology

- `lib/ratehawk/cache.ts` — Supabase-backed cache for `/hotel/info/` responses, **7-day TTL**, keyed by RateHawk hid.
- Cold-fetch on SERP miss, write-back fire-and-forget, cache-transparent aggregator.
- We will refresh static data (hotel info dumps) on a scheduled job once production access is granted. Frequency: weekly for delta, monthly for full dump — pending your recommendation.

## 8. booking/finish + booking/finish/status handling

Our `pollFinishStatus()` helper (`lib/ratehawk/services/hotel.ts`) implements the following state machine:

- **Poll interval:** 2s + 0.5s per attempt, capped at 5s
- **Max attempts:** 45 (~3 minutes)
- **Terminal states from root response:**
  - `order.status = success` → mark order `confirmed`
  - `percent >= 100` without explicit status → treat as `success`
- **Terminal states from error envelope:**
  - `error = soldout` → mark order `failed`, user message "room no longer available"
  - `error = book_limit` → mark order `failed`, user message "booking limit reached"
- **Transient states:** `error = unknown`, network errors, `percent < 100` → retry with backoff
- **Exhaustion:** 45 attempts without terminal → mark order `form_submitted` (manual review queue), user gets "still processing" message
- **`bookFinish` error handling:** if finish returns `error = unknown`, we do NOT throw. We proceed to polling per your async-commit contract — the order may still commit.

Full audit trail is written to `hotel_orders.raw_request` / `raw_response` JSONB columns including the form payload, finish payload, and every status poll response.

## 9. Next steps — requests for RateHawk

1. Production `key_id` + `api_key`
2. Production base URL confirmation
3. Static egress IP recommendation (we can allocate a dedicated NAT if needed)
4. Any additional scenarios you want us to run before certification sign-off
5. Confirmation that phase-1 `payment_type=hotel` scope is acceptable for production approval

Happy to do a walkthrough call if useful. Thanks!

Best,
Tunca Bildik
X Travel
