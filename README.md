# Workera Attendance Automation

Node.js script that signs into the Workera portal, opens the attendance modal, and confirms either an *entrada* (morning) or *salida* (afternoon) punch depending on the local execution time.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Store your portal credentials in `.env` (same directory as the script):

   ```text
   WORKERA_EMAIL=you@example.com
   WORKERA_PASSWORD=supersecret
   ```

   You can also export the same variables in your shell instead of using `.env`.

## Usage

```bash
node workera_clocker.js
```

The script launches Chromium in headed mode, navigates to `https://workera.com/portal/login`, confirms attendance, and closes the browser window. When run before noon it confirms *entrada*; otherwise it confirms *salida*. Update `resolveAction` if your schedule differs.
