# UAG Platform — API Specification
**Version:** 1.0.0  
**Base URL:** `http://localhost:8080/api/v1`  
**Auth:** JWT Bearer tokens. Protected routes require `Authorization: Bearer <token>`.

---

## Table of Contents
1. [Conventions & Common Responses](#conventions)
2. [Auth — Public (Fan & Athlete)](#auth-public)
3. [Auth — Admin (Super Admin)](#auth-admin)
4. [Athletes — Onboarding](#athletes-onboarding)
5. [Athletes — Dashboard](#athletes-dashboard)
6. [Athletes — Profile Management](#athletes-profile)
7. [Fan — Explore & Leaderboard](#fan-explore)
8. [Fan — Voting](#fan-voting)
9. [Fan — Favorites](#fan-favorites)
10. [Fan — Profile & Settings](#fan-profile)
11. [Shared — Address Book](#addresses)
12. [Shared — Payment Methods (Stripe)](#payment-methods)
13. [Shop — Products](#shop-products)
14. [Shop — Cart](#shop-cart)
15. [Shop — Orders & Checkout](#shop-orders)
16. [Admin — Overview](#admin-overview)
17. [Admin — Products](#admin-products)
18. [Admin — Orders](#admin-orders)
19. [Admin — Customers](#admin-customers)
20. [Admin — Athlete Verification](#admin-verification)
21. [Admin — Vote Income Distribution](#admin-vote-income)
22. [Shared — File Uploads](#file-uploads)
23. [Appendix A — Referral System Logic](#appendix-a)
24. [Appendix B — Tech Stack](#appendix-b)
25. [Appendix C — Docker Services](#appendix-c)

---

## 1. Conventions & Common Responses {#conventions}

### Standard Error Shape
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested athlete does not exist."
  }
}
```

### Standard Success Shape
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "per_page": 20, "total": 250 }
}
```
`meta` is only present on paginated list endpoints.

### Common HTTP Status Codes
| Code | Meaning |
|---|---|
| `200` | OK |
| `201` | Created |
| `204` | No Content (delete success) |
| `400` | Bad Request / Validation Error |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — authenticated but insufficient role |
| `404` | Not Found |
| `409` | Conflict (e.g., duplicate email, already voted) |
| `422` | Unprocessable Entity |
| `429` | Too Many Requests |
| `500` | Internal Server Error |

### Roles
| Role | Description |
|---|---|
| `fan` | Registered fan user |
| `athlete` | Registered athlete user |
| `admin` | Super admin — full platform access |

---

## 2. Auth — Public (Fan & Athlete) {#auth-public}

### `POST /auth/register`
Register a new fan or athlete account.

**Headers:** None

**Request Body:**
```json
{
  "full_name": "Maya Reyes",
  "email": "maya@example.com",
  "password": "Str0ngP@ss!",
  "role": "athlete",
  "referral_code": "UAG-DEVONCARTER"
}
```
> `referral_code` — optional. When valid, credits the referring athlete `$0.50` automatically.  
> `role` — must be `"athlete"` or `"fan"`.

**Success `201`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_01j9k",
      "full_name": "Maya Reyes",
      "email": "maya@example.com",
      "role": "athlete",
      "onboarding_complete": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2026-06-10T00:00:00Z"
  }
}
```

**Errors:**
| Code | Error Code | Description |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Missing required fields or invalid role |
| `400` | `WEAK_PASSWORD` | Password doesn't meet strength requirements |
| `409` | `EMAIL_ALREADY_EXISTS` | Email is already registered |

---

### `POST /auth/login`
Log in as fan or athlete.

**Headers:** None

**Request Body:**
```json
{
  "email": "maya@example.com",
  "password": "Str0ngP@ss!",
  "role": "athlete"
}
```

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_01j9k",
      "full_name": "Maya Reyes",
      "email": "maya@example.com",
      "role": "athlete",
      "onboarding_complete": true,
      "avatar_url": "/uploads/avatars/maya.jpg"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2026-06-10T00:00:00Z"
  }
}
```

**Errors:**
| Code | Error Code | Description |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Missing fields |
| `401` | `INVALID_CREDENTIALS` | Email or password incorrect |
| `403` | `WRONG_ROLE` | Account exists but role doesn't match |

---

### `POST /auth/logout`
Invalidate the current JWT (add to server-side blocklist).

**Headers:** `Authorization: Bearer <token>`

**Success `204`:** No body.

---

### `POST /auth/forgot-password`
Trigger a password reset email.

**Request Body:**
```json
{ "email": "maya@example.com" }
```

**Success `200`:**
```json
{ "success": true, "data": { "message": "If this email exists, a reset link has been sent." } }
```

---

### `POST /auth/reset-password`
Reset password using the token from the email link.

**Request Body:**
```json
{
  "token": "reset_abc123xyz",
  "new_password": "NewStr0ng@Pass!",
  "confirm_password": "NewStr0ng@Pass!"
}
```

**Success `200`:**
```json
{ "success": true, "data": { "message": "Password updated successfully." } }
```

**Errors:**
| Code | Error Code | Description |
|---|---|---|
| `400` | `INVALID_RESET_TOKEN` | Token is invalid or expired |
| `400` | `PASSWORDS_DO_NOT_MATCH` | `new_password` ≠ `confirm_password` |

---

### `GET /auth/me`
Get the currently authenticated user's core profile.

**Headers:** `Authorization: Bearer <token>`

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "id": "usr_01j9k",
    "full_name": "Maya Reyes",
    "email": "maya@example.com",
    "role": "athlete",
    "avatar_url": "/uploads/avatars/maya.jpg",
    "onboarding_complete": true
  }
}
```

---

## 3. Auth — Admin {#auth-admin}

### `POST /admin/auth/signup`
Create a new super admin account. The very first admin can be created without a token. Every subsequent admin requires an existing admin JWT.

**Headers:** `Authorization: Bearer <admin_token>` *(required only if any admin already exists)*

**Request Body:**
```json
{
  "email": "superadmin@uag.com",
  "password": "AdminStr0ng@Pass!",
  "confirm_password": "AdminStr0ng@Pass!"
}
```

**Success `201`:**
```json
{
  "success": true,
  "data": {
    "admin": { "id": "adm_01", "email": "superadmin@uag.com" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
| Code | Error Code | Description |
|---|---|---|
| `400` | `PASSWORDS_DO_NOT_MATCH` | Passwords don't match |
| `400` | `WEAK_PASSWORD` | Password too weak |
| `401` | `UNAUTHORIZED` | Admin exists and no token provided |
| `409` | `EMAIL_ALREADY_EXISTS` | Email already registered |

---

### `POST /admin/auth/login`

**Request Body:**
```json
{
  "email": "superadmin@uag.com",
  "password": "AdminStr0ng@Pass!"
}
```

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "admin": { "id": "adm_01", "email": "superadmin@uag.com" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2026-06-10T00:00:00Z"
  }
}
```

---

### `POST /admin/auth/forgot-password`

**Request Body:**
```json
{ "email": "superadmin@uag.com" }
```

**Success `200`:**
```json
{ "success": true, "data": { "message": "If this email exists, a reset code has been sent." } }
```

---

### `POST /admin/auth/verify-code`
Verify the OTP code sent to the admin's email, returns a short-lived reset token.

**Request Body:**
```json
{
  "email": "superadmin@uag.com",
  "code": "482910"
}
```

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "reset_token": "temp_reset_token_abc123",
    "message": "Code verified. Use reset_token to set a new password."
  }
}
```

**Errors:**
| Code | Error Code | Description |
|---|---|---|
| `400` | `INVALID_CODE` | OTP is wrong or expired |

---

### `POST /admin/auth/reset-password`

**Request Body:**
```json
{
  "reset_token": "temp_reset_token_abc123",
  "new_password": "NewAdmin@Pass!",
  "confirm_password": "NewAdmin@Pass!"
}
```

**Success `200`:**
```json
{ "success": true, "data": { "message": "Admin password updated." } }
```

---

## 4. Athletes — Onboarding {#athletes-onboarding}

> All onboarding routes: `Authorization: Bearer <athlete_token>`, role must be `athlete`.

### `GET /athletes/me/onboarding/status`
Check which steps are complete.

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "current_step": 2,
    "total_steps": 5,
    "completed_steps": ["identity"],
    "onboarding_complete": false
  }
}
```

---

### `PUT /athletes/me/onboarding/identity` — Step 1
**Request Body:**
```json
{
  "full_name": "Maya Reyes",
  "username": "mayareyes",
  "date_of_birth": "2002-08-15",
  "location": "Lagos, Nigeria",
  "profile_photo_url": "/uploads/avatars/maya.jpg"
}
```
> `profile_photo_url` — URL returned from `POST /uploads`.

**Success `200`:**
```json
{
  "success": true,
  "data": { "step": "identity", "next_step": "sport" }
}
```

**Errors:**
| Code | Error Code | Description |
|---|---|---|
| `400` | `USERNAME_TAKEN` | Username already in use |
| `400` | `INVALID_DATE` | Date of birth format invalid |

---

### `PUT /athletes/me/onboarding/sport` — Step 2
**Request Body:**
```json
{
  "sport": "Track & Field",
  "level": "Semi Pro",
  "stats": {
    "sprint_200m": "22.84s",
    "best_season_year": "2023",
    "avg_points_per_game": "28.4",
    "personal_best": "98.2"
  },
  "recent_achievements": "2x National 200m champion • 4th at African U23s"
}
```
> `level` — one of: `"Amateur"`, `"Semi Pro"`, `"College"`, `"Pro"`.  
> `sport` — one of: `"Track & Field"`, `"Basketball"`, `"Hockey"`, `"Football"`, `"Baseball"`, `"MMA"`, `"Climbing"`, `"Skateboarding"`, `"Other"`.

**Success `200`:**
```json
{ "success": true, "data": { "step": "sport", "next_step": "story" } }
```

---

### `PUT /athletes/me/onboarding/story` — Step 3
**Request Body:**
```json
{
  "bio": "Two-time national champion. Training out of a community track.",
  "highlight_clip_url": "/uploads/clips/maya_highlight.mp4",
  "photo_urls": [
    "/uploads/photos/maya_1.jpg",
    "/uploads/photos/maya_2.jpg"
  ],
  "socials": {
    "instagram": "mayareyes",
    "twitter_x": "mayareyes_track",
    "youtube": "UCmayareyes",
    "website": "https://mayareyes.com"
  }
}
```
> `bio` — max 240 characters.  
> `photo_urls` — max 6 items.  
> All `socials` fields are optional.

**Success `200`:**
```json
{ "success": true, "data": { "step": "story", "next_step": "terms" } }
```

**Errors:**
| Code | Error Code | Description |
|---|---|---|
| `400` | `BIO_TOO_LONG` | Bio exceeds 240 characters |
| `400` | `TOO_MANY_PHOTOS` | More than 6 photos provided |

---

### `PUT /athletes/me/onboarding/terms` — Step 4
**Request Body:**
```json
{
  "agreed_to_terms": true,
  "agreed_to_privacy": true,
  "agreed_to_earnings_policy": true
}
```

**Success `200`:**
```json
{ "success": true, "data": { "step": "terms", "next_step": "verification" } }
```

**Errors:**
| Code | Error Code | Description |
|---|---|---|
| `400` | `AGREEMENTS_REQUIRED` | All three flags must be `true` |

---

### `PUT /athletes/me/onboarding/verification` — Step 5
**Request Body:**
```json
{
  "id_document_url": "/uploads/id_docs/maya_passport.pdf"
}
```

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "step": "verification",
    "onboarding_complete": true,
    "verification_status": "pending",
    "referral_code": "UAG-MAYAREYES",
    "referral_link": "https://uag.app/r/UAG-MAYAREYES"
  }
}
```

---

## 5. Athletes — Dashboard {#athletes-dashboard}

> All routes: `Authorization: Bearer <athlete_token>`.

### `GET /athletes/me/stats`
Overview dashboard stats.

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "total_earnings": 2840.00,
    "total_votes": 48200,
    "total_profile_views": 84200,
    "current_rank": 4,
    "votes_to_next_rank": 2150,
    "tier": "RISING"
  }
}
```

---

### `GET /athletes/me/earnings`
Detailed earnings and monthly chart data.

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "available_balance": 3847.20,
    "weekly_change": 1240.00,
    "lifetime_earned": 24780.00,
    "pending": 642.00,
    "this_year": 11840.00,
    "monthly_data": [
      { "month": "Jul", "amount": 1400.00 },
      { "month": "Aug", "amount": 1000.00 },
      { "month": "Sep", "amount": 1900.00 },
      { "month": "Oct", "amount": 1200.00 },
      { "month": "Nov", "amount": 800.00 },
      { "month": "Dec", "amount": 1800.00 }
    ]
  }
}
```

---

### `POST /athletes/me/earnings/withdraw`
Request a balance withdrawal.

**Request Body:**
```json
{
  "amount": 500.00,
  "bank_account_id": "ba_stripe_xxx"
}
```

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "withdrawal_id": "wth_01",
    "amount": 500.00,
    "status": "processing",
    "estimated_arrival": "2026-06-07"
  }
}
```

**Errors:**
| Code | Error Code | Description |
|---|---|---|
| `400` | `INSUFFICIENT_BALANCE` | Amount exceeds available balance |
| `400` | `NO_BANK_ACCOUNT` | No payout method linked |

---

### `GET /athletes/me/referral`
Referral code, link, and earnings breakdown.

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "referral_code": "UAG-MAYAREYES",
    "referral_link": "https://uag.app/r/UAG-MAYAREYES",
    "total_paid_out": 486.50,
    "total_signups": 214,
    "total_votes_via_code": 1082,
    "earnings_per_signup": 0.50,
    "lifetime_tip_percentage": 10
  }
}
```

---

## 6. Athletes — Profile Management {#athletes-profile}

### `GET /athletes/me/profile`

**Headers:** `Authorization: Bearer <athlete_token>`

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "full_name": "Maya Reyes",
    "email": "maya.reyes@example.com",
    "phone": "+1 (555) 987-6543",
    "date_of_birth": "2002-08-15",
    "username": "mayareyes",
    "location": "Brooklyn, NY",
    "avatar_url": "/uploads/avatars/maya.jpg",
    "sport": "MMA",
    "position": "Strawweight",
    "achievements": "Regional Champion 2024, Undefeated Amateur Record",
    "bio": "Fighting out of Brooklyn, NY. Dedicated to martial arts since age 10.",
    "socials": {
      "instagram": "https://instagram.com/mayareyes_mma",
      "twitter_x": "https://x.com/mayareyes_mma",
      "youtube": null,
      "website": null
    },
    "media_gallery": [
      {
        "id": "med_01",
        "type": "video",
        "url": "/uploads/media/highlight.mp4",
        "thumbnail_url": "/uploads/media/highlight_thumb.jpg"
      },
      {
        "id": "med_02",
        "type": "photo",
        "url": "/uploads/media/action1.jpg",
        "thumbnail_url": null
      }
    ]
  }
}
```

---

### `PUT /athletes/me/profile`
Update profile settings (all fields optional, partial updates supported).

**Request Body:**
```json
{
  "full_name": "Maya Reyes",
  "email": "maya.reyes@example.com",
  "phone": "+1 (555) 987-6543",
  "date_of_birth": "2002-08-15",
  "sport": "MMA",
  "position": "Strawweight",
  "achievements": "Regional Champion 2024, Undefeated Amateur Record",
  "bio": "Fighting out of Brooklyn, NY.",
  "socials": {
    "instagram": "https://instagram.com/mayareyes_mma",
    "twitter_x": "https://x.com/mayareyes_mma",
    "youtube": null,
    "website": null
  }
}
```

**Success `200`:**
```json
{ "success": true, "data": { "message": "Profile updated successfully." } }
```

---

### `PUT /athletes/me/avatar`
Upload and update profile avatar.

**Headers:** `Content-Type: multipart/form-data`

**Request Body (multipart):**
| Field | Type |
|---|---|
| `avatar` | File (JPG/PNG, max 5MB) |

**Success `200`:**
```json
{ "success": true, "data": { "avatar_url": "/uploads/avatars/maya_new.jpg" } }
```

---

### `POST /athletes/me/media`
Add a media item (photo or video clip) to the gallery.

**Request Body:**
```json
{
  "type": "photo",
  "url": "/uploads/photos/maya_action3.jpg"
}
```
> `type` — `"photo"` or `"video"`.

**Success `201`:**
```json
{ "success": true, "data": { "id": "med_03", "message": "Media added to gallery." } }
```

---

### `DELETE /athletes/me/media/:media_id`
Remove a media item.

**Success `204`:** No body.

**Errors:**
| Code | Error Code | Description |
|---|---|---|
| `404` | `MEDIA_NOT_FOUND` | Item doesn't exist |
| `403` | `FORBIDDEN` | Item doesn't belong to this athlete |

---

### `PUT /athletes/me/password`

**Request Body:**
```json
{
  "current_password": "OldP@ss!",
  "new_password": "NewStr0ng@Pass!",
  "confirm_password": "NewStr0ng@Pass!"
}
```

**Success `200`:**
```json
{ "success": true, "data": { "message": "Password changed successfully." } }
```

**Errors:**
| Code | Error Code | Description |
|---|---|---|
| `401` | `WRONG_CURRENT_PASSWORD` | Current password is incorrect |
| `400` | `PASSWORDS_DO_NOT_MATCH` | New passwords don't match |

---

## 7. Fan — Explore & Leaderboard {#fan-explore}

### `GET /athletes`
List approved athletes. Public endpoint — auth optional.

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `sport` | string | Filter by sport |
| `search` | string | Search by name/handle |
| `level` | string | Filter by competition level |
| `page` | int | Default: `1` |
| `per_page` | int | Default: `20`, max: `50` |

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "usr_01",
      "full_name": "Elara Vance",
      "username": "elaravance",
      "sport": "Sprinting",
      "location": "Los Angeles, CA",
      "avatar_url": "/uploads/avatars/elara.jpg",
      "total_votes": 42800,
      "rank": 1,
      "tier": "RISING",
      "verified": true
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 250 }
}
```

---

### `GET /athletes/:id`
Get a single athlete's public profile.

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "id": "usr_01",
    "full_name": "Devon Carter",
    "username": "devoncarter",
    "sport": "Basketball",
    "location": "Los Angeles, CA",
    "bio": "6'4\" guard out of Memphis. Averaged 28.4 ppg last season.",
    "avatar_url": "/uploads/avatars/devon.jpg",
    "total_votes": 54300,
    "rank": 1,
    "tier": "RISING",
    "verified": true,
    "achievements": [
      { "year": "2025", "description": "Regional Champion · Best Basketball Player", "badge": "Gold" },
      { "year": "2024", "description": "National Invitational · Top 3", "badge": "Top 3" },
      { "year": "2023", "description": "Featured · Sport Magazine Rookie List", "badge": "Press" }
    ],
    "photos": [
      "/uploads/photos/devon_1.jpg",
      "/uploads/photos/devon_2.jpg"
    ],
    "highlight_clip_url": "/uploads/clips/devon_highlight.mp4",
    "socials": {
      "instagram": "https://instagram.com/devoncarter",
      "twitter_x": null,
      "youtube": null,
      "website": null
    }
  }
}
```

**Errors:**
| Code | Error Code | Description |
|---|---|---|
| `404` | `ATHLETE_NOT_FOUND` | Not found or not yet approved |

---

### `GET /athletes/leaderboard`
Global ranked leaderboard. Public endpoint.

**Query Parameters:** `page`, `per_page`, `sport`

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "top_three": [
      {
        "rank": 1,
        "athlete_id": "usr_01",
        "full_name": "Devon Carter",
        "sport": "Basketball",
        "total_votes": 54300,
        "avatar_url": "/uploads/avatars/devon.jpg"
      },
      {
        "rank": 2,
        "athlete_id": "usr_02",
        "full_name": "Maya Reyes",
        "sport": "Track & Field",
        "total_votes": 41100,
        "avatar_url": "/uploads/avatars/maya.jpg"
      },
      {
        "rank": 3,
        "athlete_id": "usr_03",
        "full_name": "Layla Okafor",
        "sport": "Climbing & MMA",
        "total_votes": 39400,
        "avatar_url": "/uploads/avatars/layla.jpg"
      }
    ],
    "table": [
      {
        "rank": 4,
        "athlete_id": "usr_04",
        "full_name": "Marco Velez",
        "handle": "@marcovz",
        "location": "Buenos Aires",
        "sport": "Football",
        "total_votes": 33500,
        "movement": "same",
        "movement_value": 0,
        "tier": "RISING",
        "avatar_url": "/uploads/avatars/marco.jpg"
      }
    ]
  },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 250,
    "last_updated": "2026-06-03T00:00:00Z"
  }
}
```

---

## 8. Fan — Voting {#fan-voting}

### `POST /athletes/:id/vote`
Cast a vote. One vote per athlete per 24-hour window per fan.

**Headers:** `Authorization: Bearer <fan_token>`

**Request Body:** *(empty body)*

**Success `201`:**
```json
{
  "success": true,
  "data": {
    "athlete_id": "usr_01",
    "new_total_votes": 54301,
    "message": "Vote cast successfully."
  }
}
```

**Errors:**
| Code | Error Code | Description |
|---|---|---|
| `403` | `ATHLETES_CANNOT_VOTE` | Athletes cannot vote on other athletes |
| `404` | `ATHLETE_NOT_FOUND` | Athlete does not exist or is not approved |
| `409` | `ALREADY_VOTED` | Fan has already voted for this athlete today |

---

### `GET /athletes/:id/vote-status`
Check if the current authenticated fan has voted for this athlete today.

**Headers:** `Authorization: Bearer <fan_token>`

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "athlete_id": "usr_01",
    "total_votes": 54301,
    "has_voted_today": true,
    "voted_at": "2026-06-02T14:32:00Z",
    "can_vote_again_at": "2026-06-03T14:32:00Z"
  }
}
```

---

## 9. Fan — Favorites {#fan-favorites}

### `GET /fans/me/favorites`

**Headers:** `Authorization: Bearer <fan_token>`

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "athlete_id": "usr_01",
      "full_name": "Elara Vance",
      "sport": "Sprinting",
      "location": "Los Angeles, CA",
      "total_votes": 42800,
      "avatar_url": "/uploads/avatars/elara.jpg",
      "verified": true,
      "favorited_at": "2026-05-20T10:00:00Z"
    }
  ]
}
```

---

### `POST /fans/me/favorites`

**Request Body:**
```json
{ "athlete_id": "usr_01" }
```

**Success `201`:**
```json
{ "success": true, "data": { "message": "Athlete added to favorites." } }
```

**Errors:**
| Code | Error Code | Description |
|---|---|---|
| `404` | `ATHLETE_NOT_FOUND` | Athlete not found |
| `409` | `ALREADY_FAVORITED` | Already in favorites |

---

### `DELETE /fans/me/favorites/:athlete_id`

**Success `204`:** No body.

---

## 10. Fan — Profile & Settings {#fan-profile}

### `GET /fans/me/profile`

**Headers:** `Authorization: Bearer <fan_token>`

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "id": "usr_02",
    "first_name": "Jon",
    "last_name": "Kabir",
    "email": "jon.kabir@example.com",
    "phone": "+1 (555) 123-4567",
    "avatar_url": "/uploads/avatars/jon.jpg",
    "member_since": "2026-01-15"
  }
}
```

---

### `PUT /fans/me/profile`

**Request Body:**
```json
{
  "first_name": "Jon",
  "last_name": "Kabir",
  "email": "jon.kabir@example.com",
  "phone": "+1 (555) 123-4567"
}
```

**Success `200`:**
```json
{ "success": true, "data": { "message": "Profile updated." } }
```

---

### `PUT /fans/me/avatar`

**Headers:** `Content-Type: multipart/form-data`

**Request Body (multipart):**
| Field | Type |
|---|---|
| `avatar` | File (JPG/PNG, max 5MB) |

**Success `200`:**
```json
{ "success": true, "data": { "avatar_url": "/uploads/avatars/jon_new.jpg" } }
```

---

### `PUT /fans/me/password`

**Request Body:**
```json
{
  "current_password": "OldP@ss!",
  "new_password": "NewStr0ng@Pass!",
  "confirm_password": "NewStr0ng@Pass!"
}
```

**Success `200`:**
```json
{ "success": true, "data": { "message": "Password changed successfully." } }
```

---

### `GET /fans/me/orders`

**Query Parameters:** `page`, `per_page`, `status`

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ord_01",
      "order_number": "ORD-84392",
      "status": "Processing",
      "total": 91.80,
      "item_count": 2,
      "items_preview": [
        { "name": "Pro Performance T-Shirt", "image_url": "/uploads/products/tshirt.png" }
      ],
      "created_at": "2026-05-15T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 5 }
}
```

---

### `GET /fans/me/orders/:order_id`

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "id": "ord_01",
    "order_number": "ORD-84392",
    "status": "Processing",
    "items": [
      {
        "product_id": "prd_01",
        "name": "Pro Performance T-Shirt",
        "size": "L",
        "color": "Black",
        "price": 45.00,
        "quantity": 1,
        "image_url": "/uploads/products/tshirt.png"
      }
    ],
    "subtotal": 80.00,
    "shipping": 5.00,
    "tax": 6.80,
    "total": 91.80,
    "shipping_address": {
      "label": "Home",
      "street": "123 Athlete Way, Apt 4B",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "country": "US"
    },
    "created_at": "2026-05-15T10:00:00Z"
  }
}
```

---

## 11. Shared — Address Book {#addresses}

> Both fans and athletes share the same address book routes under `/users/me/addresses`.

### `GET /users/me/addresses`

**Headers:** `Authorization: Bearer <token>`

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "adr_01",
      "label": "Home",
      "full_name": "Jon Kabir",
      "street": "123 Athlete Way, Apt 4B",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "country": "US",
      "phone": "+1 (555) 123-4567",
      "is_default": true
    },
    {
      "id": "adr_02",
      "label": "Gym",
      "full_name": "Jon Kabir",
      "street": "456 Training Center Blvd",
      "city": "Brooklyn",
      "state": "NY",
      "zip": "11201",
      "country": "US",
      "phone": "+1 (555) 987-6543",
      "is_default": false
    }
  ]
}
```

---

### `POST /users/me/addresses`

**Request Body:**
```json
{
  "label": "Gym",
  "full_name": "Jon Kabir",
  "street": "456 Training Center Blvd",
  "city": "Brooklyn",
  "state": "NY",
  "zip": "11201",
  "country": "US",
  "phone": "+1 (555) 987-6543",
  "is_default": false
}
```

**Success `201`:**
```json
{ "success": true, "data": { "id": "adr_02", "message": "Address added." } }
```

---

### `PUT /users/me/addresses/:address_id`

**Request Body:** Same fields as POST.

**Success `200`:**
```json
{ "success": true, "data": { "message": "Address updated." } }
```

---

### `DELETE /users/me/addresses/:address_id`

**Success `204`:** No body.

---

### `PUT /users/me/addresses/:address_id/set-default`

**Success `200`:**
```json
{ "success": true, "data": { "message": "Default address updated." } }
```

---

## 12. Shared — Payment Methods (Stripe) {#payment-methods}

### `GET /users/me/payment-methods`

**Headers:** `Authorization: Bearer <token>`

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pm_01",
      "stripe_pm_id": "pm_1Qxxx...",
      "brand": "visa",
      "last_four": "4242",
      "expires_month": 12,
      "expires_year": 2026,
      "is_default": true
    }
  ]
}
```

---

### `POST /users/me/payment-methods`
Attach a Stripe `PaymentMethod` (obtained from Stripe.js on the frontend) to the user.

**Request Body:**
```json
{ "stripe_payment_method_id": "pm_1QxxxStripe..." }
```

**Success `201`:**
```json
{
  "success": true,
  "data": {
    "id": "pm_02",
    "brand": "mastercard",
    "last_four": "8899",
    "expires_month": 8,
    "expires_year": 2028,
    "is_default": false
  }
}
```

**Errors:**
| Code | Error Code | Description |
|---|---|---|
| `400` | `STRIPE_ERROR` | Stripe returned an error attaching the method |

---

### `PUT /users/me/payment-methods/:pm_id/set-default`

**Success `200`:**
```json
{ "success": true, "data": { "message": "Default payment method updated." } }
```

---

### `DELETE /users/me/payment-methods/:pm_id`

**Success `204`:** No body.

**Errors:**
| Code | Error Code | Description |
|---|---|---|
| `400` | `ONLY_PAYMENT_METHOD` | Cannot remove the only saved payment method |

---

## 13. Shop — Products {#shop-products}

### `GET /products`
Public product listing.

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `category` | string | e.g. `"T-Shirts"`, `"Hats"`, `"Pants"` |
| `search` | string | Search by product name |
| `page` | int | Default: `1` |
| `per_page` | int | Default: `20` |

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prd_01",
      "name": "Underrated Premium T-Shirt",
      "category": "T-Shirts",
      "price": 280.00,
      "original_price": 390.00,
      "rating": 4.5,
      "review_count": 29,
      "image_url": "/uploads/products/tshirt.png",
      "status": "In Stock",
      "sizes": ["S", "M", "L", "XL"]
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 154 }
}
```

---

### `GET /products/:id`

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "id": "prd_01",
    "name": "Underrated Premium T-Shirt",
    "category": "T-Shirts",
    "price": 280.00,
    "original_price": 390.00,
    "rating": 4.5,
    "review_count": 29,
    "image_url": "/uploads/products/tshirt.png",
    "inventory": 42,
    "status": "In Stock",
    "sizes": ["S", "M", "L", "XL"],
    "colors": ["Black", "White"]
  }
}
```

**Errors:**
| Code | Error Code | Description |
|---|---|---|
| `404` | `PRODUCT_NOT_FOUND` | Product not found |

---

## 14. Shop — Cart {#shop-cart}

> All cart routes require `Authorization: Bearer <fan_token>`.

### `GET /cart`

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "cart_item_id": "ci_01",
        "product_id": "prd_01",
        "name": "Pro Performance T-Shirt",
        "size": "L",
        "color": "Black",
        "price": 45.00,
        "quantity": 1,
        "image_url": "/uploads/products/tshirt.png"
      }
    ],
    "subtotal": 80.00,
    "item_count": 2
  }
}
```

---

### `POST /cart`
Add or increment an item.

**Request Body:**
```json
{
  "product_id": "prd_01",
  "size": "L",
  "color": "Black",
  "quantity": 1
}
```

**Success `201`:**
```json
{ "success": true, "data": { "cart_item_id": "ci_01", "message": "Item added to cart." } }
```

**Errors:**
| Code | Error Code | Description |
|---|---|---|
| `400` | `OUT_OF_STOCK` | Product is out of stock |
| `400` | `INVALID_VARIANT` | Size or color not available |
| `404` | `PRODUCT_NOT_FOUND` | Product not found |

---

### `PUT /cart/:cart_item_id`

**Request Body:**
```json
{ "quantity": 2 }
```

**Success `200`:**
```json
{ "success": true, "data": { "message": "Cart item updated." } }
```

---

### `DELETE /cart/:cart_item_id`

**Success `204`:** No body.

---

### `DELETE /cart`
Clear all items from cart.

**Success `204`:** No body.

---

## 15. Shop — Orders & Checkout {#shop-orders}

### `POST /orders`
Place an order. Fetches cart server-side, creates a Stripe PaymentIntent, charges the card, and records the order.

**Headers:** `Authorization: Bearer <fan_token>`

**Request Body:**
```json
{
  "address_id": "adr_01",
  "payment_method_id": "pm_01"
}
```

**Success `201`:**
```json
{
  "success": true,
  "data": {
    "order_id": "ord_01",
    "order_number": "ORD-84392",
    "status": "Processing",
    "subtotal": 80.00,
    "shipping": 5.00,
    "tax": 6.80,
    "total": 91.80,
    "stripe_payment_intent_id": "pi_stripe_abc123",
    "message": "Order placed successfully. Check your email for confirmation."
  }
}
```

**Errors:**
| Code | Error Code | Description |
|---|---|---|
| `400` | `EMPTY_CART` | Cart is empty |
| `400` | `INVALID_ADDRESS` | Address not found or doesn't belong to user |
| `400` | `INVALID_PAYMENT_METHOD` | Payment method not found |
| `402` | `PAYMENT_FAILED` | Stripe declined payment (includes Stripe decline code) |
| `422` | `ITEMS_OUT_OF_STOCK` | One or more items are now out of stock |

---

### `POST /stripe/webhook`
Stripe sends payment lifecycle events here. Handles `payment_intent.succeeded` and `payment_intent.payment_failed`.

**Headers:** `Stripe-Signature: <stripe_webhook_signature>`

> **Note:** This endpoint is called by Stripe, not the frontend. It must validate the Stripe signature.

**Success `200`:** Acknowledge receipt.

---

## 16. Admin — Overview {#admin-overview}

> All `/admin/*` routes require `Authorization: Bearer <admin_token>`.

### `GET /admin/stats`

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "total_orders": 125,
    "total_products": 34,
    "total_customers": 642,
    "total_athletes": 95,
    "total_revenue": 82120.00,
    "pending_verifications": 4,
    "weekly_order_chart": [
      { "day": "Mon", "orders": 22 },
      { "day": "Tue", "orders": 28 },
      { "day": "Wed", "orders": 20 },
      { "day": "Thu", "orders": 25 },
      { "day": "Fri", "orders": 34 },
      { "day": "Sat", "orders": 18 },
      { "day": "Sun", "orders": 26 }
    ]
  }
}
```

---

## 17. Admin — Products {#admin-products}

### `GET /admin/products`

**Query Parameters:** `search`, `category`, `status`, `page`, `per_page`

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prd_01",
      "name": "Underrated T-Shirt",
      "category": "T-Shirt",
      "price": 65.00,
      "original_price": 90.00,
      "inventory": 42,
      "status": "In Stock",
      "image_url": "/uploads/products/tshirt.png",
      "created_at": "2026-01-10T08:00:00Z"
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 154 }
}
```

---

### `POST /admin/products`

**Request Body:**
```json
{
  "name": "Underrated Premium Vest",
  "category": "Outerwear",
  "price": 280.00,
  "original_price": 390.00,
  "inventory": 50,
  "sizes": ["S", "M", "L", "XL"],
  "colors": ["Black"],
  "image_url": "/uploads/products/vest.png"
}
```

**Success `201`:**
```json
{ "success": true, "data": { "id": "prd_05", "message": "Product created." } }
```

---

### `PUT /admin/products/:id`

**Request Body:** Same as POST (partial updates supported).

**Success `200`:**
```json
{ "success": true, "data": { "message": "Product updated." } }
```

---

### `DELETE /admin/products/:id`

**Success `204`:** No body.

---

## 18. Admin — Orders {#admin-orders}

### `GET /admin/orders`

**Query Parameters:** `search`, `status`, `page`, `per_page`

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ord_01",
      "order_number": "Underrated-5421",
      "customer_name": "Alex Johnson",
      "customer_email": "alex@example.com",
      "date": "2023-10-24",
      "item_count": 2,
      "total": 130.00,
      "status": "Pending"
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 154 }
}
```

---

### `PUT /admin/orders/:id/status`

**Request Body:**
```json
{ "status": "Shipped" }
```
> `status` — one of: `"Pending"`, `"Processing"`, `"Shipped"`, `"Delivered"`, `"Cancelled"`.

**Success `200`:**
```json
{ "success": true, "data": { "message": "Order status updated to Shipped." } }
```

---

## 19. Admin — Customers {#admin-customers}

### `GET /admin/customers`

**Query Parameters:** `search`, `page`, `per_page`

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "usr_02",
      "full_name": "Jon Kabir",
      "email": "jon.kabir@example.com",
      "total_orders": 3,
      "total_spent": 217.30,
      "joined_at": "2026-01-15T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 642 }
}
```

---

### `GET /admin/customers/:id`

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "id": "usr_02",
    "full_name": "Jon Kabir",
    "email": "jon.kabir@example.com",
    "phone": "+1 (555) 123-4567",
    "total_orders": 3,
    "total_spent": 217.30,
    "joined_at": "2026-01-15T10:00:00Z",
    "recent_orders": [
      { "order_number": "ORD-84392", "status": "Processing", "total": 91.80 }
    ]
  }
}
```

---

## 20. Admin — Athlete Verification {#admin-verification}

### `GET /admin/verifications`

**Query Parameters:** `status` (`"pending"` | `"approved"` | `"rejected"`), `search`, `page`, `per_page`

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "verification_id": "ver_01",
      "athlete_id": "usr_01",
      "full_name": "Devon Carter",
      "location": "Los Angeles, CA",
      "sport": "Basketball",
      "tags": ["Basketball", "Rising"],
      "avatar_url": "/uploads/avatars/devon.jpg",
      "id_document_url": "/uploads/id_docs/devon_passport.pdf",
      "submitted_at": "2026-06-01T12:00:00Z",
      "status": "pending"
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 4 }
}
```

---

### `GET /admin/verifications/:id`

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "verification_id": "ver_01",
    "athlete_id": "usr_01",
    "full_name": "Devon Carter",
    "id_document_url": "/uploads/id_docs/devon_passport.pdf",
    "status": "pending",
    "submitted_at": "2026-06-01T12:00:00Z",
    "reviewed_at": null,
    "reviewer_notes": null
  }
}
```

---

### `PUT /admin/verifications/:id`
Approve or reject an athlete.

**Request Body:**
```json
{
  "decision": "approved",
  "notes": "Valid government-issued passport confirmed."
}
```
> `decision` — `"approved"` or `"rejected"`.  
> **On approval:** athlete's `verified = true`, they become visible in explore/leaderboard.  
> **On rejection:** athlete can re-submit a new document.

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "message": "Athlete verification approved.",
    "athlete_id": "usr_01",
    "verified": true
  }
}
```

---

## 21. Admin — Vote Income Distribution {#admin-vote-income}

### `GET /admin/athletes`
List all athletes with vote counts and balance info.

**Query Parameters:** `search`, `sport`, `verification_status`, `page`, `per_page`

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "usr_01",
      "full_name": "Devon Carter",
      "sport": "Basketball",
      "total_votes": 54300,
      "available_balance": 3847.20,
      "lifetime_earned": 24780.00,
      "verification_status": "approved"
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 95 }
}
```

---

### `POST /admin/athletes/:id/distribute-income`
Manually credit vote-based income to an athlete.

**Request Body:**
```json
{
  "amount": 500.00,
  "reason": "Monthly vote income distribution — June 2026",
  "period": "2026-06"
}
```

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "athlete_id": "usr_01",
    "amount_credited": 500.00,
    "new_balance": 4347.20,
    "transaction_id": "txn_01",
    "message": "Income distributed successfully."
  }
}
```

**Errors:**
| Code | Error Code | Description |
|---|---|---|
| `400` | `INVALID_AMOUNT` | Amount must be greater than 0 |
| `404` | `ATHLETE_NOT_FOUND` | Athlete not found |
| `409` | `PERIOD_ALREADY_DISTRIBUTED` | Income already distributed for this period |

---

### `GET /admin/athletes/:id/transactions`
Full transaction history for an athlete.

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "txn_01",
      "type": "referral_signup",
      "amount": 0.50,
      "description": "Referral signup — fan usr_fan_99",
      "created_at": "2026-05-20T10:00:00Z"
    },
    {
      "id": "txn_02",
      "type": "referral_tip",
      "amount": 4.50,
      "description": "10% tip from order ORD-84392 by usr_fan_99",
      "created_at": "2026-05-21T12:30:00Z"
    },
    {
      "id": "txn_03",
      "type": "vote_income",
      "amount": 500.00,
      "description": "Monthly vote income — June 2026 (Admin: superadmin@uag.com)",
      "created_at": "2026-06-03T00:00:00Z"
    }
  ],
  "meta": { "page": 1, "per_page": 20, "total": 47 }
}
```

---

## 22. Shared — File Uploads {#file-uploads}

### `POST /uploads`
Upload any file. Returns the URL for use in subsequent API calls.

**Headers:**  
`Authorization: Bearer <token>`  
`Content-Type: multipart/form-data`

**Request Body (multipart):**
| Field | Type | Description |
|---|---|---|
| `file` | File | The file binary |
| `type` | string | `"avatar"`, `"id_doc"`, `"photo"`, `"clip"`, `"product_image"` |

**Allowed formats & size limits:**
| Type | Formats | Max Size |
|---|---|---|
| `avatar` | JPG, PNG | 5 MB |
| `id_doc` | JPEG, PNG, PDF | 10 MB |
| `photo` | JPG, PNG | 10 MB |
| `clip` | MP4, MOV | 200 MB |
| `product_image` | JPG, PNG | 10 MB |

**Success `201`:**
```json
{
  "success": true,
  "data": {
    "url": "/uploads/avatars/usr_01_1717459200.jpg",
    "type": "avatar",
    "size_bytes": 204800,
    "filename": "usr_01_1717459200.jpg"
  }
}
```

**Errors:**
| Code | Error Code | Description |
|---|---|---|
| `400` | `UNSUPPORTED_FILE_TYPE` | Format not allowed for this upload type |
| `400` | `FILE_TOO_LARGE` | File exceeds the size limit |
| `401` | `UNAUTHORIZED` | Not authenticated |

---

## Appendix A — Referral System Business Logic {#appendix-a}

```
SIGNUP WITH REFERRAL CODE:
─────────────────────────
1. User registers with referral_code = "UAG-MAYAREYES"
2. Server looks up the athlete who owns "UAG-MAYAREYES"
3. Server credits athlete's available_balance += $0.50
4. Server records transaction: { type: "referral_signup", amount: 0.50 }
5. Server stores { new_user_id → referrer_athlete_id } in referral_links table

ORDER BY A REFERRED FAN:
────────────────────────
1. Fan (who signed up via referral) places an order totalling $91.80
2. Server looks up their referrer athlete
3. Server credits referrer's available_balance += $91.80 × 10% = $9.18
4. Server records transaction: { type: "referral_tip", amount: 9.18, order_id }

VOTE-BASED INCOME:
──────────────────
- NOT automatic. Admin manually distributes via:
  POST /admin/athletes/:id/distribute-income
- Transaction type: "vote_income"
- Admin provides the amount, reason, and billing period
- Duplicate protection: same athlete + same period = 409 conflict
```

---

## Appendix B — Tech Stack {#appendix-b}

| Concern | Technology |
|---|---|
| Language | Go 1.22+ |
| Router | Chi v5 |
| Database | PostgreSQL 16 |
| DB Driver | `pgx/v5` + raw SQL (or `sqlc`) |
| Auth | JWT (HS256), `bcrypt` password hashing |
| Payments | Stripe Go SDK (`stripe-go`) |
| File Storage | Local disk (`./uploads/`) with static file serving |
| Config | `.env` + `godotenv` |
| Containerization | Docker + Docker Compose |
| API Testing | Postman Collection (JSON) |
| CORS | Chi `cors` middleware |
| Logging | `go.uber.org/zap` or `log/slog` |
| Rate Limiting | `tollbooth` or Chi middleware |

---

## Appendix C — Docker Services {#appendix-c}

```yaml
# docker-compose.yml
services:
  api:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgres://uag:secret@postgres:5432/uag_db?sslmode=disable
      - JWT_SECRET=your_jwt_secret_here
      - STRIPE_SECRET_KEY=sk_test_...
      - STRIPE_WEBHOOK_SECRET=whsec_...
      - UPLOAD_DIR=./uploads
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./uploads:/app/uploads

  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: uag
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: uag_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U uag -d uag_db"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

---

## Appendix D — Postman Collection Scope

The generated Postman collection (`UAG_API.postman_collection.json`) will include:

- **Environment variables:** `base_url`, `fan_token`, `athlete_token`, `admin_token`
- **Folders:** Auth, Athlete Onboarding, Athlete Dashboard, Fan Explore, Fan Voting, Fan Favorites, Fan Profile, Addresses, Payment Methods, Shop/Cart/Orders, Admin
- **Pre-request scripts:** Auto-inject Bearer token from environment
- **Test scripts:** Assert `success = true`, correct status codes, and presence of key fields
