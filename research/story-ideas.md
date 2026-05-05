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

### baguettes: The Bread Gap
- Status: ✅ published
- Published URL: /stories/baguettes/
- Source question: [Q-034](questions.md#q-034-where-is-the-baguette-capital--the-commune-with-the-most-bakeries-per-capita)
- Hook: Paris 1er has one boulangerie for every 481 residents. Two IDF suburbs with more than 5,000 people have zero. The baguette isn't evenly distributed.
- Data: INSEE BPE Commerces (IDF), 1,300 communes, circa 2014 counts, 2010 population. Same dataset as pharmacy-myth but focused on bakery density as the story rather than as context.
- Angle:
  1. Set up the gap: 46.7% of IDF communes have zero bakeries, but most are tiny.
  2. Among large communes, Paris 1er wins — 20.8/10k, one per 481 residents.
  3. Surprising suburban champions: Enghien-les-Bains, Le Raincy, Fontainebleau beat most Paris arrondissements.
  4. Within Paris, steep gradient from 1er (20.8) to 15e (6.2).
  5. Département level: Paris 8.0/10k, Essonne 4.3/10k.
  6. Close on urbanisme framing: density tracks foot traffic, not wealth.
- Confidence: high — same BPE data as pharmacy-myth, structural pattern durable.
- Draft X summary:
  > Paris 1er has one boulangerie for every 481 residents. Saint-Germain-lès-Arpajon has 9,338 residents and zero. The baguette, supposedly universal, is unevenly distributed — and the map looks a lot like a walkability map. 🇫🇷

### pharmacy-myth: The pharmacy myth (and what's actually weird about French pharmacies)
- Status: ✅ published
- Published URL: /stories/pharmacy-myth/
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
- X summary (final):

