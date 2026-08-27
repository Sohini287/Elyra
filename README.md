# Elyra: Secure AI-Powered Private Journal

> Elyra is a luxury, zero-trust digital journal and intelligence workspace powered by Google Gemini and Google Cloud Firestore. Designed with uncompromising user data isolation, server-side secret protection, and cognitive growth analytics.

---

## 1. Architectural Overview & Threat Modeling

**Elyra** is architected on a zero-trust model where security, privacy, and user isolation are enforced at every boundary:

- **Strict User Isolation**: All personal reflections, extracted action items, ideas, and retrospectives reside exclusively within `/users/{userId}/*` subcollections. Firestore Security Rules prevent cross-user document querying or tampering.
- **Server-Side Secret Isolation**: The Gemini API key (`GEMINI_API_KEY`) is stored inside **Google Cloud Secret Manager** and accessed strictly by the backend server layer via runtime IAM bindings. The client browser never receives or compiles the API key.
- **Resilient AI Model Ladder**: Gemini inference requests leverage an automated fallback ladder (`gemini-3.7-flash` ➔ `gemini-3.1-flash-lite` ➔ `gemini-flash-latest`), with full retry resilience across transient errors.
- **Zero-Crash Payload Sanitization**: Deep sanitization strips `undefined` fields prior to all database writes, guaranteeing schema integrity.

### Threat Model & Countermeasure Matrix

| Threat Zone | Identified Attack Vector | Implemented Countermeasure |
| :--- | :--- | :--- |
| **Input Surfaces** | Prompt injection or oversized payloads | Strict schema validation, parameterization, and input truncation (12,000 char cap). |
| **Planning & Reasoning** | System prompt bypass / hallucinated actions | Strict JSON-schema synthesis and temperature-calibrated server-side prompting. |
| **Tool & Secret Execution**| Frontend API key extraction | Gemini credentials live exclusively in Google Cloud Secret Manager; Express API proxy handles calls. |
| **Memory & Database** | Cross-tenant document read/write (IDOR) | Firestore Security Rules enforcing `request.auth.uid == userId` at the kernel database level. |
| **Inter-System Comms** | Unauthenticated API abuse | JWT token verification and user context scoping across all `/api/gemini/*` endpoints. |

---

## 2. Prerequisites & Environment Setup

Ensure the following Google Cloud and development tools are installed and configured:

1. **Google Cloud SDK (`gcloud` CLI)**:
   ```bash
   gcloud components update
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```
2. **Enable Required Google Cloud APIs**:
   ```bash
   gcloud services enable \
     run.googleapis.com \
     secretmanager.googleapis.com \
     firestore.googleapis.com \
     cloudbuild.googleapis.com
   ```
3. **Node.js**: v18.0+ or v20.0+

---

## 3. Secret Management Setup (Google Cloud Secret Manager)

Protect your Gemini API credentials by provisioning them directly inside Secret Manager:

```bash
# 1. Create the secret in Secret Manager
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

# 2. Add your secret payload
echo -n "YOUR_GEMINI_API_KEY_HERE" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 3. Grant Secret Accessor IAM permissions to the Cloud Run Service Account
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 4. Database Security Configuration (Cloud Firestore)

Deploy the owner-bound `firestore.rules` to enforce document-level user isolation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Default Deny: Disallow all unmapped access
    match /{document=**} {
      allow read, write: if false;
    }

    // Strict User-Bound Namespace
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /journals/{journalId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /actionItems/{actionItemId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /ideas/{ideaId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /weeklyReflections/{reflectionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

Deploy the rules using the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 5. Google Cloud Run Deployment Flow

Deploy the containerized full-stack application to Cloud Run with Secret Manager environment injection:

```bash
# Deploy to Google Cloud Run
gcloud run deploy elyra \
  --source=. \
  --platform=managed \
  --region=asia-southeast1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --update-labels=dev-tutorial=cloud-run-ai-challenge
```

### Required Verification Label
The deployment command explicitly applies the mandatory campaign registration label:
```bash
--update-labels=dev-tutorial=cloud-run-ai-challenge
```

---

## 6. Functional Features Overview

1. **Reflective Dialogue & AI Synthesis**: Multi-turn reflective journaling with automatic executive summarization, key point extraction, action item parsing, and thematic tagging.
2. **Journal Archive & Semantic Search**: Chronological editorial journal collection with natural language semantic search powered by Gemini.
3. **Temporal Growth Map**: Cognitive domain distribution and trajectory evolution analysis computed strictly over the user's private entries.
4. **Smart Action Items**: Extraction, status tracking (Suggested ➔ Accepted ➔ Completed), and manual commitment management.
5. **Weekly Retrospective**: Executive weekly synthesis with structured themes, lessons learned, and strategic forward steps.
6. **Idea Vault**: Numbered editorial breakthrough cards with fast clipboard export and category tagging.
7. **Security & Trust Center**: Live automated security verification test harness executing live cross-user isolation and secret protection tests in the browser.
8. **Interactive Persona Switcher**: Seamless switching between **User A (Evelyn Vance)**, **User B (Marcus Sterling)**, and **Google Sign-In** to demonstrate verifiable cross-user data isolation.

---

## 7. Functional Stability & Verification Walkthrough

Follow these concrete steps to verify complete functional and security integrity:

1. **Step 1: Sign in with Demo Persona (User A)**
   - Click the Persona Switcher in the top right navigation. Select **User A (Evelyn Vance)**.
   - Observe User A's seed entries and action items loading into the view.
2. **Step 2: Compose a Reflective Entry**
   - Navigate to the **Journal** tab.
   - Type a reflection: *"Exploring zero-trust architecture and database token validation for our upcoming product launch."*
   - Click **Send Reflection**. Observe Gemini's thoughtful reflective response.
   - Click **Synthesize & Save Journal**. Verify summary, tags, and action items are saved.
3. **Step 3: Test Cross-User Isolation**
   - Switch persona to **User B (Marcus Sterling)**.
   - Observe that User A's journals, action items, and growth maps are completely inaccessible. Only User B's entries appear.
4. **Step 4: Execute Live Security Test Suite**
   - Open the **Security** tab.
   - Click **Run Live Verification Tests**.
   - Observe TEST 3 attempt a real cross-user query (`/users/usr_a_.../journals`) and confirm Firestore Security Rules reject it with `permission-denied`.
