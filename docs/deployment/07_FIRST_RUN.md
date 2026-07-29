# First Run — Complete Demo Flow

End-to-end walkthrough of the commercial demo. Run this after seed data is confirmed.

---

## Before You Start

Confirm all three are running:

```bash
bash scripts/health-check.sh
```

Expected output:
```
[✓] Backend   — http://localhost:3000/api/v1 (200 OK)
[✓] Dashboard — http://localhost:3001 (200 OK)
[✓] Flutter   — check device manually (flutter devices)
```

---

## The Demo Script (22 steps)

### Part 1 — Brand Dashboard

**Step 1 — Open Dashboard**
- URL: http://localhost:3001
- Screen: Login

**Step 2 — Brand Login**
- Email: `demo@brand.com`
- Password: `Demo1234!`
- Expected: Redirected to Overview screen

**Step 3 — Overview Screen**
- Shows: Total redemptions (49), live pulse animation
- Shows: Live feed with recent participant activity
- Polling: Counter updates every 3 seconds after new activity

**Step 4 — Campaign & QR Screen**
- Navigate to Campaign & QR
- Shows: Campaign name, product name, location
- Shows: QR code PNG image
- Action: Leave this screen visible on a second monitor or printed for the consumer scan

---

### Part 2 — Consumer Mobile App

**Step 5 — Open Consumer App**
- The Flutter app should be running on your demo device
- Screen: Splash → Phone number entry

**Step 6 — Enter Phone Number**
- Enter any Egyptian phone format: `+201001234567`
- Tap Send OTP

**Step 7 — OTP Entry**
- Enter: `0000` (demo bypass — works for any phone when DEMO_MODE=true)
- Tap Verify

**Step 8 — Registration**
- Name: any name
- Age range: choose from dropdown
- Gender: choose
- City: **Cairo, Giza, Alexandria, or Other — do NOT select Mansoura**
- Tap Register
- Expected: Redirected to Home screen

**Step 9 — Home Screen**
- Shows: Campaign card with product name and reward points (50 points)
- Shows: QR scan button

**Step 10 — QR Scan**
- Tap the QR scan button
- Grant camera permission if prompted
- Point camera at the QR code displayed on the brand dashboard (Step 4)
- Expected: QR detected → navigates to Survey screen

---

### Part 3 — Survey

**Step 11 — Survey Screen**
- Shows: Arabic RTL survey with 5 questions
- Progress bar at top shows current question / total

**Step 12 — Answer Questions**
- Q1 (Stars): tap a star rating 1-5
- Q2 (Scale): tap a number 1-10 (purchase intent)
- Q3 (Multiple choice): select a word descriptor
- Q4 (Multiple choice): select comparison vs. competitors
- Q5 (Text, optional): type a comment or leave blank

**Step 13 — Submit Survey**
- Tap "إرسال الإجابات" (Submit)
- Expected: Thank You screen with "+50" points (or "+0" — DEFECT-007, cosmetic only)

---

### Part 4 — Dashboard Live Update

**Step 14 — Return to Dashboard**
- Switch to the brand dashboard
- The Overview counter should now show **50** (was 49)
- The live feed should show the new participant

**Step 15 — Demographics Screen**
- Navigate to Demographics
- Shows: Age, gender, city distribution charts
- The new participant's demographics are included

**Step 16 — Survey Results Screen**
- Navigate to Survey Results
- Shows: Purchase intent score, verbatims, question breakdowns
- The new participant's answers are included

**Step 17 — Participants Screen**
- Navigate to Participants
- Shows: Paginated list — new participant appears at top
- Badge shows "Has Survey" in green

---

### Part 5 — Report

**Step 18 — AI Summary**
- Navigate to AI Summary (Report tab)
- On first load: AI narrative is generated (Anthropic → OpenAI → fallback)
- Expected: 4-6 sentences of executive insight with specific numbers
- Note: First generation may take 3-8 seconds if calling external AI API

**Step 19 — PDF Export**
- On the Report screen, click "Export PDF"
- Expected: PDF downloads with campaign data, charts summary, and AI narrative
- File is saved to the browser's default download location

---

## Demo Duration

| Part | Estimated Time |
|------|---------------|
| Brand login → Campaign QR displayed | 2 minutes |
| Consumer phone → OTP → Register → Home | 2 minutes |
| QR scan → Survey → Thank You | 3 minutes |
| Dashboard live update → All screens | 3 minutes |
| AI Summary → PDF export | 2 minutes |
| **Total** | **~12 minutes** |

---

## Next Step

→ [10_PRE_DEMO_CHECKLIST.md](10_PRE_DEMO_CHECKLIST.md)
