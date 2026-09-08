---
title: Mental Health Crisis Detection
slug: crisis-detection
group: side
order: 1
summary: An NLP classifier that flags crisis signals in short text, so the ones that matter don't get missed.
tech:
  - Python
  - RoBERTa
  - NLP / text classification
links: []
---

A side project on a problem where the false negative is the expensive one.

## Problem

Crisis signals in free text — forum posts, messages, journal entries — are easy for a person to skim past and hard to triage at volume. Missing one matters more than a handful of false alarms.

## Approach

A text classifier built on a RoBERTa encoder, tuned for recall on the crisis class and evaluated on public datasets so the numbers mean something outside my own test set.

## Result

Still in progress. The model trains and classifies; I'm benchmarking it on public
datasets now and would rather leave this blank than quote a number off my own test
set. The headline recall figure and a proper error analysis land here once that's
done.
