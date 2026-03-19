# pco-backup

Node project to download and backup song data from [Planning Center (PCO) Services](https://api.planningcenteronline.com/docs/overview/getting-started).

## Authentication (Personal Access Token)

This app uses **Personal Access Token (PAT)** auth so it can run without a browser or fragile login automation.

1. Log in to Planning Center and open your [developer account](https://api.planningcenteronline.com/oauth/applications).
2. Create a new **Personal Access Token**.
3. Put the **Application ID** and **Secret** in `.env` (see below).  
   **Important:** Never commit or share your token; it has the same power as your username and password.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure `.env`**

   Create a `.env` file in the project root:

   ```env
   # PCO API (required)
   PCO_APPLICATION_ID=your_pat_application_id
   PCO_SECRET=your_pat_secret

   # Optional overrides (defaults are in code)
   # APIURL=https://api.planningcenteronline.com/services/v2/songs
   # DBPATH=./database.db

   # Optional: label for this backup source (default: "Default")
   SOURCE_NAME=My Church

   # Optional: User-Agent sent with API requests (PCO recommends identifying your app)
   # PCO_USER_AGENT=pco-backup (your@email.com)
   ```

3. **Build and run**

   ```bash
   npm run build
   npm start
   ```

## Rate limits

PCO allows about 100 API calls per 20 seconds. The app reports average call rate after a run.

## API docs

- [Getting started](https://api.planningcenteronline.com/docs/overview/getting-started)
- [Authentication](https://api.planningcenteronline.com/docs/overview/authentication)
