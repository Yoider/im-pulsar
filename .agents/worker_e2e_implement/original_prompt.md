## 2026-06-08T17:57:22Z
You are the Worker for the E2E Testing Track.
Your working directory is d:\DEV\AuthSndr\ImpulsarPage\.agents\worker_e2e_implement.

Please implement and verify the E2E test suite:
1. Read d:\DEV\AuthSndr\ImpulsarPage\TEST_INFRA.md for the E2E test case details.
2. Implement the E2E test suite under a dedicated `e2e/` directory (or similar) using Node.js and `puppeteer-core`. Make sure to resolve local Chrome/Edge executables dynamically from system paths as shown in `qa_check.js` (under C:\Program Files, etc.).
3. The test suite must cover the four features (Authentication, Client Dashboard, Admin Client Audit, Admin Split Modal) with at least 49 test cases across Tiers 1-4.
4. Create a test runner script (e.g. `run_e2e.js` or configure a script in `package.json`) that does the following:
   - Performs a database seed reset if needed to ensure clean testing state.
   - Automatically handles the Next.js server lifecycle (starting the server if not already running on port 3000, and shutting it down when done) or provides a seamless way to run against it.
   - Runs all E2E test cases, checks assertions, logs progress, captures screenshots for failures, and outputs a clear summary of test results (including count of passed and failed cases).
5. Execute the test runner against the current codebase to verify it runs correctly. Some failures are expected because features are not yet implemented. Document the test run output.
6. Create d:\DEV\AuthSndr\ImpulsarPage\TEST_READY.md detailing the test runner command, expected test suite summary, and a feature checklist of tests showing which ones are passing or failing.
7. Write a detailed handoff report in your working directory.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
