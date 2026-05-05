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

### baguettes: The baguette-capital question
- Status: ✅ published
- Published URL: /stories/baguettes/
- Source question: [Q-034](questions.md#q-034)
- Hook: Which commune in IDF has the most bakeries per person? Not Paris — a market town in Seine-et-Marne with 2,151 people and five boulangeries claims the per-capita crown. Within Paris, it's the 1er, where tourists and office workers inflate the denominator.
- Data: INSEE BPE Commerces (IDF), 1,300 communes, vintage circa 2014. Reuses data from pharmacy-myth.
- Angle:
  1. Paris arrondissement bar chart (per 10k, sorted) — shows internal variation, 1er leads at 20.8 vs 15e at 6.2.
  2. Département comparison (8 IDF depts) — Seine-Saint-Denis outbakes wealthier Hauts-de-Seine; grande couronne data is skewed by rural communes.
  3. Scatter plot (population vs per10k, log scale) — shows variance collapsing at larger sizes, Paris as outlier cluster.
  4. Conclusion: Rebais wins on paper, Paris wins in practice.
- Draft X summary:
  > Paris has 8 bakeries per 10,000 people — but the "baguette capital" of Île-de-France is technically a market town in Seine-et-Marne. The numbers, three charts, and why this is actually a story about urban form. 🇫🇷

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

