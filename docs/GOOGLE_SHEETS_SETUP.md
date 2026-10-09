# Google Sheets Integration & Setup Guide
## Asset Management Portal — Phase 1 Persistence Layer

**Version:** 1.0.0  
**Target:** Google Cloud Platform (GCP) & Google Sheets API v4  

---

## 1. Overview

The Asset Management Portal utilizes Google Sheets as its primary tabular persistence engine for Phase 1. Access to the spreadsheet is mediated strictly through the server-side repository adapter (`GoogleSheetsAssetRepository`) via a Google Cloud Service Account. The client browser has zero direct access to Google APIs, spreadsheet IDs, or tokens.

---

## 2. Google Cloud Service Account Setup

1. **Create GCP Project:**
   - Log in to the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a dedicated project (e.g., `org-asset-portal-prod`).

2. **Enable Required APIs:**
   - Enable **Google Sheets API v4** (`sheets.googleapis.com`).
   - Enable **Google Drive API v3** (`drive.googleapis.com`) for document attachments in later stages.

3. **Create Service Account:**
   - In GCP Console, navigate to **IAM & Admin > Service Accounts**.
   - Click **Create Service Account**.
   - Name: `asset-portal-daemon`
   - Description: `Server-side data persistence daemon for Asset Management Portal`
   - Role: None required at project level (access is granted at spreadsheet level).

4. **Generate Service Account Private Key:**
   - Click on the created service account > **Keys** tab > **Add Key > Create new key**.
   - Select **JSON** format and download the file securely.
   - Extract:
     - `client_email` (e.g. `asset-portal-daemon@org-asset-portal.iam.gserviceaccount.com`)
     - `private_key` (The RSA Private Key PEM block beginning with `-----BEGIN PRIVATE KEY-----`)

---

## 3. Spreadsheet Workbook Provisioning

1. **Create Workbook:**
   - Create a new Google Spreadsheet in your organization's Google Drive.
   - Name it `IT Asset Management Master Ledger`.

2. **Grant Permissions to Service Account:**
   - Click **Share** on the spreadsheet.
   - Add the Service Account email address (`client_email`).
   - Assign **Editor** permissions.
   - Uncheck "Notify people" (since it is a service account).

3. **Provision Tab Sheets & Column Headers:**
   - Rename `Sheet1` to `Assets`.
   - Ensure Row 1 contains the exact 30 column headers specified in `docs/DATABASE_DESIGN.md` §3.1:
     ```
     asset_id, asset_tag, name, category_id, subcategory, brand, model, serial_number, description, status, condition, custody_type, department_id, location_id, current_user_id, current_assignment_id, purchase_date, purchase_cost, useful_life_months, current_value, currency, vendor_id, invoice_reference, warranty_start, warranty_expiry, custom_fields, is_archived, created_at, updated_at, archived_at
     ```
   - Create the `Transactions` sheet with the 10 headers:
     ```
     transaction_id, asset_id, transaction_type, timestamp, performed_by, previous_state, new_state, related_assignment_id, notes, metadata
     ```
   - Create the `Audit Logs` sheet with the 11 headers:
     ```
     audit_id, timestamp, actor_user_id, action, entity_type, entity_id, before_state, after_state, ip_address, user_agent, session_id
     ```
   - Create the `Settings` sheet with the 8 headers:
     ```
     key, value, value_type, category, description, is_system, updated_by, updated_at
     ```
   - Add standard initial settings row in `Settings`:
     ```
     ASSET_ID_SEQUENCE, 0, NUMBER, SEQUENCES, Sequential asset natural ID counter, TRUE, SYSTEM, 2026-01-01T00:00:00Z
     ```

4. **Extract Spreadsheet ID:**
   - The Spreadsheet ID is found in the browser URL:
     `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`

---

## 4. Server Environment Configuration

Set the following environment variables in `.env.local` (local development) or your hosting provider dashboard (e.g. Vercel, AWS):

```bash
# Google Cloud Service Account Credentials
GOOGLE_SPREADSHEET_ID="your-spreadsheet-id-here"
GOOGLE_SERVICE_ACCOUNT_EMAIL="asset-portal-daemon@org-asset-portal.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

> **Security Rule:**
> Never prefix these variables with `NEXT_PUBLIC_`.
> Never commit real credentials to Git.

---

## 5. Operational Verification

1. When configured, navigating to `/assets` loads live records from the Google Sheet.
2. If credentials are unset or invalid, the portal displays a safe, unconfigured alert banner explaining that configuration is required, without leaking stack traces or using mock data.
