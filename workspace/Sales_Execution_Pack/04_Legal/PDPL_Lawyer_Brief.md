# PDPL LAWYER ENGAGEMENT BRIEF
## Tajribti — Consumer Intelligence Platform

**Blocker:** B-03 — Written PDPL legal opinion required before any data-collecting feature ships.  
**Purpose:** This brief scopes the legal engagement for an Egyptian data-privacy lawyer.  
**Source:** `04_Investment/IC_MEMO_v1.0.md` · `08_PRD/MASTER_PRD_v1.0.md` · `09_Technical/TECHNICAL_ARCHITECTURE.md` · `15_Decisions/OPEN_DECISIONS_TRACKER.md`

---

## WHO WE ARE

Tajribti is a Consumer Intelligence Platform being built for the Egyptian FMCG, beauty, and pharma-OTC market.

We convert physical product trials into structured consumer data. An Egyptian consumer tries a product at a retail location, completes a short post-trial survey on their phone, and their feedback is delivered to the brand as a consumer intelligence report.

We are in a pre-launch commercial validation phase. No software is built yet. We are engaging legal counsel before building anything.

---

## WHAT THE PLATFORM DOES

**Step 1 — Consumer registration.**
The consumer downloads the Tajribti mobile app and creates a profile. Profile fields include: first name, age range, gender, area of residence (district level, not GPS address), and optionally interests and demographic segment.

**Step 2 — Campaign participation.**
The consumer visits a physical retail location where a brand's product is available for trial. They scan a QR code to register participation. The QR code is tied to a specific campaign, product, and location.

**Step 3 — Product trial.**
The consumer receives and tries the product. Physical product distribution is at the point of scanning.

**Step 4 — Post-trial survey.**
Immediately after trial (within 15 minutes), the consumer receives a push notification to complete a 3-to-5-question survey. The survey collects: product satisfaction rating, purchase intent score, packaging feedback, and open-ended text response.

**Step 5 — Data processing.**
Survey responses are linked to the consumer's demographic profile and the campaign record. An intelligence report is generated and delivered to the brand within 24 hours.

**Step 6 — Consumer rights.**
The consumer can view all collected data, delete their account, and withdraw consent per data category. These functions are built into the app (TJ-008 Consent & Privacy Center).

---

## DATA CATEGORIES COLLECTED

| Category | Data Points | Purpose |
|---|---|---|
| Identity | First name only (no surname required) | App account |
| Demographics | Age range, gender, area of residence (district), income segment (bracket, not absolute income), optional interests | Segment reporting |
| Behavioral | QR scan events, campaign participation history | Fraud detection, repeat-consumer tracking |
| Survey responses | Ratings, purchase intent, open-ended text | Core product data |
| Device | Device ID, app version | Fraud detection, push notifications |
| Location | Retail location visited (point-of-interest, not GPS tracking) | Campaign attribution |

**What we do not collect:** Full name, national ID, precise GPS coordinates, health data, financial data, biometrics.

---

## CONSENT MECHANISM (PLANNED DESIGN)

- Explicit opt-in at account registration
- Granular consent by data category (demographics / behavioral / survey)
- Consumer can withdraw consent per category at any time via in-app controls
- Consumer can request full data deletion via in-app controls
- Deletion executes as anonymisation within 30 days (not hard delete, to preserve aggregate analytics)
- All consent actions are logged in an audit trail

---

## DATA RESIDENCY

Current plan: AWS me-south-1 (Bahrain region). The question of whether this satisfies Egyptian PDPL is open and is one of the specific items requiring your written opinion.

---

## THE 4 QUESTIONS REQUIRING A WRITTEN OPINION

We need a written legal memo that addresses specifically:

**Question 1 — Consent mechanism validity**
Does our planned consent design (opt-in at registration, granular consent per category, self-service withdrawal and deletion) satisfy the PDPL requirements under Law No. 151 of 2020?

**Question 2 — Permissible data categories**
Of the data categories listed above, which are permissible to collect and process for our stated purpose (consumer intelligence reporting for FMCG brands) under PDPL? Are any categories restricted or requiring additional authorisation?

**Question 3 — Data residency**
Does storing all consumer data in AWS me-south-1 (Bahrain) satisfy Egyptian PDPL requirements for data residency? If not, what is required?

**Question 4 — Cross-brand data usage**
We plan to use anonymised, aggregated, non-brand-attributable data across campaigns to improve platform analytics (e.g., understanding trends in consumer preferences across product categories). Is this permissible under PDPL, and what safeguards are required?

---

## WHAT CLOSES B-03

A written memo from your firm addressing the four questions above. The memo does not need to be lengthy. It needs to be written, signed, and on letterhead.

Upon receipt:
- We will confirm the consent mechanism design
- We will confirm or adjust the data residency decision
- We will confirm permissible data categories before building the data model
- We will reference your opinion in our architecture documentation

---

## WHAT WE NEED FROM YOU AT ENGAGEMENT

1. Confirmation that your firm practices Egyptian data protection law and specifically has experience with PDPL (Law No. 151 of 2020)
2. A scope estimate and fee for a written opinion addressing the four questions above
3. Any preliminary observations on obvious risks or gaps based on this brief
4. An estimate of how long the written memo will take to produce

---

## RELEVANT STATUTES (FOR REFERENCE)

- Personal Data Protection Law (PDPL) — Law No. 151 of 2020 and its Executive Regulations
- Consumer Protection Law — Law No. 181 of 2018
- Egyptian Companies Law — Law No. 159 of 1981
- E-commerce Law — Law No. 15 of 2020

---

## CONTACT

**[Founder Full Name]**  
Founder & CEO, Tajribti  
**[Phone / WhatsApp]**  
**[Email]**

*Tajribti is a working name pending trademark and domain clearance.*
