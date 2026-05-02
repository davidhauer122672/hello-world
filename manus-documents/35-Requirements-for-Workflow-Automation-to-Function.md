# Requirements for [REDACTED-PLATFORM] Zap to Function

**Task ID:** `icYwVNY8zgtIYzIME0Fhto`  
**Status:** completed  
**Model:** manus-1.6-max-agent  
**Source:** https://manus.im/app/icYwVNY8zgtIYzIME0Fhto  
**Created:** 1774054171

---

## Conversation Content

**[USER]:** What's Needed for the [redacted-platform] zap to function
The system requires at least one successful test run on each action step before publishing. The tests need sample data from the Airtable trigger.
To unblock publishing, ONE of these must happen:
Test the Airtable trigger with an existing record from your "Vendor Jobs" view → This pulls in all field values (Vendor Email, company name, service category, etc.) → All downstream steps then test successfully
Add a test record to your Airtable "Vendor Jobs" view → Trigger automatically detects it → Tests populate → Publish succeeds

**[ASSISTANT]:** Acknowledged. I'm reviewing the project files and your [REDACTED-PLATFORM] Zap requirements now to build a world-class, institutional-grade guide for unblocking your Zap publication.

**[ASSISTANT]:** Here is the [REDACTED-PLATFORM] Deployment Unblock Protocol for the Vendor Jobs workflow.

**The core issue is simple.** [REDACTED-PLATFORM] will not let you publish until the trigger step and every filter/path step have at least one successful test run. The test run requires real sample data from the "Vendor Jobs" view in Airtable.

**You have two paths to resolve this:**

**Path Alpha — Use an Existing Record.** If the "Vendor Jobs" view already has records, open the [REDACTED-PLATFORM] editor, go to the trigger step's Test tab, click "Test trigger," select a record with complete data (Vendor Email, Company Name, Service Category, etc.), and click "Continue with selected record." Then test each downstream action step. The Publish button activates once all steps pass.

**Path Beta — Create a New Test Record.** If the view is empty, go into Airtable, create a new record with synthetic test data in all required fields, and confirm it appears in the "Vendor Jobs" view. Return to [REDACTED-PLATFORM], click "Find new records" in the trigger's Test tab, select the new record, and test all downstream steps. Publish becomes available.

The full protocol document is attached with institutional-grade detail, references, and governance context.

**[USER]:** Act as a Microsoft CTO and help to resolve this.  Create a prompt for [REDACTED-PLATFORM] to resolve the following:I see the issue now. This table (tbl2rTYKSdC65kmYp) is the "Compliance" table with fields:
Compliance Type
Compliance Status (AI)
Created Time
But your Zap expects the "Vendor" table with fields like:
Vendor Email
company name
service category
Vendor scheduled date/time
etc.
The problem: You have 3 different tables in your Untitled Base:
tbl2rTYKSdC65kmYp — Compliance records (current - wrong)
tblVhVdsQmnblFclI — Some other records (tried earlier - wrong)
tblWNOfq1OCK4kAnA — Work order records (tried earlier - wrong)
None of them have the vendor fields your Zap needs.
Here's what I need to know:
In your "Untitled Base" (appUSnNgpDkcEOzhN), do you have a table that actually contains vendor records with these exact fields:
Vendor Email
company name
service category
Vendor scheduled date/time
Vendor project
onboarding
COI expiration
vendor rating
W-9 on file

**[ASSISTANT]:** Acknowledged. I'm building the resolution prompt now, approaching this as a Microsoft CTO would — precise root-cause diagnosis, structured remediation, and a production-ready [REDACTED-PLATFORM] configuration directive.

**[ASSISTANT]:** Understood. Resuming now. Building the CTO-grade resolution prompt for [REDACTED-PLATFORM].

**[ASSISTANT]:** Here is the CTO-grade resolution. The full document is attached. Here is the compressed diagnosis and fix:

**Root Cause:** Your Zap trigger is pointed at the wrong table. It is pulling from the "Compliance" table (`tbl2rTYKSdC65kmYp`), which only has `Compliance Type`, `Compliance Status (AI)`, and `Created Time`. Your downstream steps need vendor fields (Vendor Email, company name, service category, etc.) that do not exist in that table.

**The Fix (Two Scenarios):**

**Scenario 1 — The Vendor table exists but the Zap is pointed at the wrong one.** Open Airtable base `appUSnNgpDkcEOzhN`. Find the table that holds your vendor records with the 9 required fields. Go to [REDACTED-PLATFORM], edit the trigger step, switch it to that correct table, test, and publish.

**Scenario 2 — No Vendor table exists yet.** You must create one. In Airtable, add a new table called "Vendors" with these exact fields: Vendor Email, company name, service category, Vendor scheduled date/time, Vendor project, onboarding, COI expiration, vendor rating, W-9 on file. Add one test record. Then reconnect the [REDACTED-PLATFORM] trigger to this new table, test, and publish.

**The copy-paste prompt for [REDACTED-PLATFORM] is inside the attached document** — it tells [REDACTED-PLATFORM] exactly what to disconnect, reconnect, and verify. 

**Critical question for you, David:** Do you have a table in that Airtable base that actually contains your vendor roster? If not, we need to build one before the Zap can function.

---

## Attached Files

- [[REDACTED-PLATFORM]_Unblock_Guide.md](https://private-us-east-1.manuscdn.com/sessionFile/icYwVNY8zgtIYzIME0Fhto/sandbox/k0WiQQG4iI1uLYwv2p52je_1774054345239_na1fn_L2hvbWUvdWJ1bnR1L1phcGllcl9VbmJsb2NrX0d1aWRl.md?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvaWNZd1ZOWTh6Z3RJWXpJTUUwRmh0by9zYW5kYm94L2swV2lRUUc0aUkxdUxZd3YycDUyamVfMTc3NDA1NDM0NTIzOV9uYTFmbl9MMmh2YldVdmRXSjFiblIxTDFwaGNHbGxjbDlWYm1Kc2IyTnJYMGQxYVdSbC5tZCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=B0lOFFjLGrlb4vuiWqhaL2p07mjXWgTIiji8~ziLOnHRTzzIN6j5Y4skQW0n0k7ieL~8-2qlT8IS2EhVYIUkK7m-PJD3qVdHDtfqMZ5U8dnbhBpWBJPYxk1eMVEOltOcCb2pc4S6DIRyK7D9~5ttMssmUcvLJjTBRJJUWG9H08Z3vyaCKfv4GLgTwYsGYeIsIWUan~chhNgNIHGJgZnbNzagsH31oSjwmHJLhJGFRiyILV6X9cGwAr8M7LUCaPcUzCXWynf1JFwYxpFnZ833v6tk7CjKe1MogsvTJsTAeMrH2paejyBbQds-k4FFsKOYNhvdD~m7YwGeCF4NxtfoaQ__)
- [[REDACTED-PLATFORM]_CTO_Resolution_Prompt.md](https://private-us-east-1.manuscdn.com/sessionFile/icYwVNY8zgtIYzIME0Fhto/sandbox/SRopq6YIz35FSfFiwzdI7O_1774057053787_na1fn_L2hvbWUvdWJ1bnR1L1phcGllcl9DVE9fUmVzb2x1dGlvbl9Qcm9tcHQ.md?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvaWNZd1ZOWTh6Z3RJWXpJTUUwRmh0by9zYW5kYm94L1NSb3BxNllJejM1RlNmRml3emRJN09fMTc3NDA1NzA1Mzc4N19uYTFmbl9MMmh2YldVdmRXSjFiblIxTDFwaGNHbGxjbDlEVkU5ZlVtVnpiMngxZEdsdmJsOVFjbTl0Y0hRLm1kIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=jYePdgHvTVdkT9STPwoT9hLtoryvbKKJVGpaeJSLFbu1iy4hACF0hPna65KOy9H2hnheLEleEuQS4S00Nh2UmFX8hk2TmVL7McR0Sc4LAwwW6BWPjz2vHd02iPYY6UHCSWISNnj6drK7SSNuoC4q9G6Ilaadjh2sk2FhiS16RRF8FRdvvqws0Nppk8ALrq99nOqxh0gcuDUoQ608H3NY0GQgAg-fHjN4zVEVuveQf-CaKwLIcVtdmSQywz2FkxVAKPW523KJ3agRCMnooaQVq5FjrEuduSV5B1M8y5b7OQSbNF1KUm-OnPhNF5IeZuY~j15ilNJCcSV-vi2-GJrwNg__)
