# Daily Development Changelog

This document tracks the changes made during the development session today, as well as planned future updates.

## Completed Today

### 1. Stripe Integration Fix
- **Issue:** The backend was throwing a `400 Bad Request: No such customer` error when trying to attach a new payment method.
- **Root Cause:** The database still contained an old `stripe_customer_id` associated with a previous Stripe account. When the backend tried to use the new Stripe keys, it couldn't find the old customer ID.
- **Fix:** Cleared out the orphaned `stripe_customer_id` in the local PostgreSQL database for the affected user. The backend automatically generated a new valid customer ID on the fly during the next payment method attempt.

### 2. Athlete Media Upload Permissions
- **Issue:** User received a `403 Forbidden` ("You don't have permission to access this resource") error when trying to upload a video to an athlete profile.
- **Root Cause:** The user account was registered with the `fan` role. The backend uses strict `RequireRole("athlete")` middleware to prevent fans from modifying athlete profiles.
- **Resolution:** Confirmed the security behavior is working as intended. Verified that media uploads must be performed by an account registered with the `athlete` role.

### 3. Public Athlete Profile - Video Rendering Fix
- **Issue:** Uploaded videos were not showing up on the public athlete profile (fan view), and the frontend was falling back to displaying dummy default photos.
- **Backend Fix (`backend/internal/handler/athlete_handler.go`):** Updated the `GetPublicProfile` API endpoint. Previously, it filtered the media and only returned a string array of photos. It now returns the full `media_gallery` object containing both photos and videos.
- **Container Restart:** Rebuilt and restarted the compiled Go backend Docker container (`docker compose up -d --build api`) to ensure the changes took effect.
- **Frontend Fix (`src/app/fan/athlete/[id]/page.tsx`):** Updated the fan-facing athlete profile page to map over `media_gallery`. It now detects if `media.type === 'video'` and properly renders an HTML5 `<video>` player, while rendering `<Image>` for photos.

### 4. Dynamic Athlete Stats
- **Issue:** The platform enforced track-and-field specific stats (e.g. 200m Sprint) for all athletes, regardless of their selected sport.
- **Backend Fix:** Created a PostgreSQL migration to drop hardcoded stat columns and introduced a flexible `JSONB` column named `stats`. Updated models, repository, and API handlers (`GetProfile`, `GetPublicProfile`, `UpdateProfile`, `OnboardingSport`) to support dynamic key-value stat mapping.
- **Frontend Fix (`SportStep.tsx`, `profile/page.tsx`, `fan/athlete/[id]/page.tsx`):** Implemented a `SPORT_STATS_CONFIG` mapping for Football, Basketball, Hockey, Baseball, Track & Field, and an Other fallback. The UI now dynamically adapts input fields based on the selected sport and gracefully displays them on the fan profile and athlete settings pages.

### 5. Postman Collection Documentation
- **Updated `backend/UAG_API.postman_collection.json`:**
  - Added a test to the `Get Athlete Profile` endpoint to automatically verify the presence of the `media_gallery` property in the response.
  - Duplicated the `Add Media` endpoint into two explicit examples: `Add Photo Media` and `Add Video Media` to clearly document how to upload video payloads.

### 6. Highlight Clip Rendering Fix
- **Issue:** The highlight clip video uploaded during the athlete onboarding story step was successfully saving to the database, but it was not being displayed on the public fan profile or the athlete settings page.
- **Backend Fix:** Updated `GetProfile` and `UpdateProfile` in `athlete_handler.go` to explicitly return and accept the `highlight_clip_url` field.
- **Frontend Fix:** Added an HTML5 `<video>` player to the Fan Profile view (`src/app/fan/athlete/[id]/page.tsx`) to display the highlight clip right above the "The Story" block. Added a new input field to the Athlete Settings Dashboard (`src/app/athlete/profile/page.tsx`) so athletes can view and change their highlight clip URL.

### 7. Referral Code Integration (Shop & Athlete Earnings)
- **Issue:** Athletes had no way to generate referral codes, and fans had no way to apply them during checkout to credit athletes with commissions.
- **Backend Fix:** 
  - Created a database migration to add `referral_athlete_id` to the `orders` table.
  - Updated `athlete_repo.go` with `FindByReferralCode` and `AddReferralEarnings` methods.
  - Added a `POST /athletes/me/referral` endpoint to dynamically generate a unique 8-character referral code (`REF-XXXXXXXX`) for the athlete.
  - Updated `order_service.go` to intercept `referral_code` during `PlaceOrder`. It verifies the code, maps it to the athlete, calculates a 10% commission of the cart subtotal, and adds it immediately to their `AvailableBalance` and `LifetimeEarned`.
  - **Critical Fix:** Resolved a compilation error caused by a duplicate `FindByReferralCode` method definition which prevented the Docker container from building with the new logic. The container has now been successfully rebuilt and restarted.
  - Added `Generate Referral Code` to the `UAG_API.postman_collection.json`.
- **Frontend Fix:**
  - Added a "Referral Section" to `src/app/athlete/earnings/page.tsx`, allowing athletes to view or generate their referral code with a 1-click copy button.
  - Updated `src/app/fan/checkout/page.tsx` with an optional "Referral Code" input field that passes the code upstream to the order creation endpoint.

### 8. Safari Video Hydration Fix
- **Issue:** The frontend was crashing on Safari with `[browser] Uncaught ReferenceError: Can't find variable: EmptyRanges` when navigating away from athlete profiles containing video elements (e.g. going to the shop).
- **Fix:** Created a custom `<SafeVideo>` React component (`src/components/atoms/SafeVideo.tsx`) that implements a `useEffect` cleanup hook. When the component unmounts, it safely pauses the video, removes the `src` attribute, and calls `.load()` to properly tear down the internal `HTMLVideoElement` state. Replaced all raw `<video>` tags with `<SafeVideo>` across the platform.

## Planned / Next Steps

- **Monitor Video Uploads:** Ensure large video uploads process correctly without timing out, and verify that video URLs resolve properly on the frontend.
- **Ongoing Bug Fixes:** Address any additional frontend rendering issues or backend logic mismatches discovered during testing.
- *(Will be updated as new tasks are requested)*
