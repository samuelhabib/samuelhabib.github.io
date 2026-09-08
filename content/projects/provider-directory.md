---
title: Provider Directory
slug: provider-directory
group: work
order: 1
summary: An ingestion pipeline that turns six disagreeing public rosters into one directory that repairs itself every week.
tech:
  - Python
  - PostgreSQL
  - Public CMS / NPI data
  - Scheduled reconciliation
links: []
---

I self-scoped this one at ExaCare after seeing how much manual cleanup our provider data needed.

## Problem

Provider information lives in public sources — CMS, the NPI registry, plan rosters — that disagree with each other, go stale, and move. Six rosters, 40,000+ rows, no single source of truth. Features that needed "which providers are real and reachable" were reading whatever snapshot happened to be loaded.

## Approach

One ingestion pipeline over the public feeds, normalizing each roster into a shared shape, then a weekly reconciliation job that diffs the live sources against our directory and repairs the drift on its own — new records, retired NPIs, changed affiliations — instead of waiting for someone to notice.

![Six rosters reconciled into one directory](/projects/provider-directory-flow.svg)

## Result

40,000+ rows across six rosters kept current without a human in the loop. The reconciliation runs weekly and self-heals; the directory stopped being something anyone has to babysit.
