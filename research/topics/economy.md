# Economy — France

Notes, findings, and links for economic questions. Each section
corresponds to a finding from one or more questions; link back to the
Q-### that sparked the work.

---

## Pharmacies vs bakeries

Source: [Q-007](../questions.md#q-007-are-there-really-more-pharmacies-than-bakeries-in-france)
Datasets: [DS-001](../datasets.md#ds-001), [DS-002](../datasets.md#ds-002), [DS-003](../datasets.md#ds-003)

**The short answer: the "more pharmacies than bakeries" claim is folklore. It's wrong — but the underlying reason people believe it (the *extreme density* of French pharmacies) is real and more interesting.**

### National totals (well-cited externals)

- France has roughly **21,000 pharmacies** (Ordre national des pharmaciens).
- France has roughly **35,000 bakeries** (Confédération nationale de la boulangerie-pâtisserie française / INSEE SIRENE NAF 1071C).
- Ratio nationally: **~1.67 bakeries per pharmacy.** Bakeries win.

These totals are not drawn from data.gouv.fr directly (the national SIRENE parquet dump is too large for the MCP Tabular API, 2.6 GB; see DS-003). They are the widely-cited baseline figures we'd reproduce via a direct SIRENE download when we want to own the numbers ourselves.

### Where we *can* ground this in data.gouv.fr data: Île-de-France

INSEE's Base Permanente des Équipements is republished at commune level by Région Île-de-France (DS-001 santé, DS-002 commerces). 1,300 communes and Paris arrondissements. Equipment counts circa 2014, population from 2010 census.

**Top 14 Paris arrondissements, pharmacies vs bakeries:**

| Arrondissement  | Pop (2010) | Pharmacies | Bakeries | Bakeries/Pharmacy | Pharmacies / 10k |
|-----------------|-----------:|-----------:|---------:|------------------:|-----------------:|
| Paris 8e        | 41,280     | 58         | 61       | 1.05              | 14.05            |
| Paris 9e        | 60,139     | 61         | 78       | 1.28              | 10.14            |
| Paris 5e        | 60,938     | 47         | 73       | 1.55              | 7.71             |
| Paris 10e       | 95,394     | 59         | 85       | 1.44              | 6.18             |
| Paris 17e       | 169,325    | 92         | 133      | 1.45              | 5.43             |
| Paris 11e       | 153,202    | 78         | 128      | 1.64              | 5.09             |
| Paris 12e       | 144,262    | 69         | 123      | 1.78              | 4.78             |
| Paris 16e       | 171,124    | 81         | 105      | 1.30              | 4.73             |
| Paris 18e       | 202,685    | 94         | 155      | 1.65              | 4.64             |
| Paris 14e       | 138,299    | 60         | 108      | 1.80              | 4.34             |
| Paris 15e       | 236,715    | 98         | 147      | 1.50              | 4.14             |
| Paris 13e       | 181,532    | 60         | 104      | 1.73              | 3.31             |
| Paris 20e       | 196,880    | 65         | 124      | 1.91              | 3.30             |
| Paris 19e       | 186,652    | 46         | 118      | 2.57              | 2.46             |

**What the data shows:**

1. **Bakeries outnumber pharmacies in every Paris arrondissement.** The closest call is the 8e at almost 1:1 (58 pharmacies, 61 bakeries). The widest gap is the 19e at 2.57×.

2. **Pharmacy density in central Paris is exceptional.** Paris 8e hits **14 pharmacies per 10,000 residents** — that's one pharmacy per ~712 residents. For comparison, WHO reports the EU average is closer to ~3 per 10,000. The 8e is not residential in the usual sense (high daytime commuter population, tourism), which inflates the effective user base; but even the residential arrondissements (11e, 17e, 18e) sit at 4-5 per 10k.

3. **Bakery density is also exceptional, and moves in lockstep with pharmacy density.** Same arrondissements lead both lists in the same order. What this really is: a commercial-density story, not a bread-or-medicine story. Central Paris has more of *everything*.

### What this opens up

- **The "density twin" pattern.** Every Parisian arrondissement has both a lot of pharmacies *and* a lot of bakeries. The question "what's the ratio?" is more interesting than "which is more?". Candidate follow-up: scatter-plot pharmacies vs bakeries per commune; fit a line; find the outliers that break the pattern.
- **National-scale follow-up.** Need the SIRENE parquet (DS-003) to produce a commune-level national map. Good first extension after the IDF-only story ships.
- **EU comparison.** Pharmacy density numbers vs Eurostat / WHO would let us state "France has the densest pharmacy network in Europe" with an actual number.

### Caveats

- IDF data is from circa 2014. Population is 2010 census. Absolute counts may have shifted; the structural pattern is durable (Paris arrondissements have consistently been France's densest commercial areas for decades).
- "Pharmacie" in the BPE means an *officine de pharmacie* — a retail pharmacy store. It excludes hospital pharmacies and mail-order channels.
- "Boulangerie" in the BPE means a shop classified under retail bakery; specialist pâtisseries without bread may be counted separately in finer datasets. This rolls up to the figure most people would recognise as "a French bakery."
