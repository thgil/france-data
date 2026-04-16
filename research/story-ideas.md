# Story Ideas

Greenlit and pitched story ideas, with a visible status pipeline.

## Status pipeline

- 💡 **idea** — pitched, awaiting user greenlight
- 🔬 **researching** — approved, data being gathered
- ✏️ **drafting** — story page being written
- ✅ **published** — live on the site

## Pitch template

When adding a new pitch, use this shape:

```
### <slug>: <title>
- Status: 💡 idea
- Source question: [Q-###](questions.md#q-###)
- Hook: <one-sentence "wait, really?">
- Data: <which datasets, coverage, gaps>
- Angle: <chart type or narrative structure>
- Draft X summary: <1-2 sentences ready to tweet>
```

---

## Pitches

### pharmacy-myth: The pharmacy myth (and what's actually weird about French pharmacies)
- Status: 💡 idea
- Source question: [Q-007](questions.md#q-007-are-there-really-more-pharmacies-than-bakeries-in-france)
- Hook: The internet keeps saying France has more pharmacies than bakeries. It doesn't. But the *real* reason that myth feels true is more interesting — central Paris has roughly one pharmacy for every 700 residents.
- Data: National totals (~21K pharmacies vs ~35K bakeries) are well-cited externals. For commune-level density, IDF BPE data ([DS-001](datasets.md#ds-001), [DS-002](datasets.md#ds-002)) gives 1,300 communes with both counts side by side. National coverage requires SIRENE parquet ([DS-003](datasets.md#ds-003)) — out of scope for v1, but a clear follow-up.
- Angle:
  1. Lead with the myth-busting: a simple bar showing 35K vs 21K nationally.
  2. Pivot: "But here's why the myth feels true" — switch to per-capita density. Paris 8e at 14 pharmacies per 10k is the headline.
  3. Reveal the deeper pattern: scatter of pharmacies vs bakeries across all IDF communes, with the Paris arrondissements highlighted. The fitted line shows they move in lockstep — this is a commercial-density story, not a bread-or-medicine story.
  4. Close on the EU comparison (France leads Europe in pharmacy density per capita, by a wide margin).
- Confidence: high on the structural pattern (the IDF BPE data is from INSEE, and the population-relative density pattern is durable). Medium on absolute counts since BPE counts are circa 2014.
- Cadence: not time-sensitive. Evergreen story.
- Draft X summary:
  > "More pharmacies than bakeries" is one of those facts about France that everyone repeats and almost no one checks. Today on **france-data**: the actual numbers, why people get them wrong, and the one Paris neighbourhood with a pharmacy for every 712 residents. 🇫🇷

