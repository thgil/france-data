# Questions

Running list of questions about France worth answering with open data.
Each question has a status, topic, and (once researched) links to
datasets and the resulting story.

## Status legend

- 🟢 **open** — not yet investigated
- 🟡 **researching** — data being explored
- 🔵 **blocked** — data not available / quality insufficient
- 🟣 **premise-failed** — data was available, but the question's framing didn't hold (worth a brief note; may reshape into a new question)
- ✅ **answered** — finding recorded in topic file (and maybe a story)

---

## Demographics

### Q-001: Which département has aged the fastest over the last 20 years?
- Status: 🟢 open
- Topic: [demographics](topics/demographics.md)

### Q-002: What commune has France's highest crude birth rate?
- Status: 🟢 open
- Topic: [demographics](topics/demographics.md)

### Q-003: How has France's fertility rate changed since 2000, and which types of territory (urban / rural / DOM-TOM) have diverged most from the national trend?
- Status: 🟢 open
- Topic: [demographics](topics/demographics.md)

### Q-004: Which French cities have the oldest and youngest median ages?
- Status: 🟢 open
- Topic: [demographics](topics/demographics.md)

### Q-005: What share of communes lose population every year?
- Status: 🟢 open
- Topic: [demographics](topics/demographics.md)

### Q-006: Where are the "centenarian capitals" — communes with the most residents over 100?
- Status: 🟢 open
- Topic: [demographics](topics/demographics.md)

## Economy

### Q-007: Are there really more pharmacies than bakeries in France?
- Status: 🟣 premise-failed
- Topic: [economy](topics/economy.md#pharmacies-vs-bakeries)
- Datasets: [DS-001](datasets.md#ds-001), [DS-002](datasets.md#ds-002)
- Finding: Bakeries outnumber pharmacies in every Paris arrondissement (the IDF data we have at commune level), and well-cited national totals put it at ~35K bakeries vs ~21K pharmacies. The folklore is wrong. The real story is the *density* — Paris 8e has ~14 pharmacies per 10,000 residents, among the highest urban densities in Europe. See [pitch](story-ideas.md#pharmacy-myth).
- Story: [pharmacy-myth](/stories/pharmacy-myth/)

### Q-008: Which commune has the highest median household income?
- Status: 🟢 open
- Topic: [economy](topics/economy.md)

### Q-009: Which commune has the most registered businesses per capita?
- Status: 🟢 open
- Topic: [economy](topics/economy.md)

### Q-010: How much of France's GDP comes from Île-de-France alone?
- Status: 🟢 open
- Topic: [economy](topics/economy.md)

### Q-011: Which industries employ the most French workers today, and how does that compare to 1980?
- Status: 🟢 open
- Topic: [economy](topics/economy.md)

### Q-012: Where are micro-enterprises growing fastest?
- Status: 🟢 open
- Topic: [economy](topics/economy.md)

### Q-026: How many cows does France have, and where are they densest? (Agriculture / livestock — filed under economy.)
- Status: 🟢 open
- Topic: [economy](topics/economy.md)

### Q-036: Which region files the most patents per capita?
- Status: 🟢 open
- Topic: [economy](topics/economy.md)

## Health

### Q-013: Which département has the longest life expectancy at birth?
- Status: 🟢 open
- Topic: [health](topics/health.md)

### Q-014: How many "medical deserts" are there in France, and where?
- Status: ✅ answered
- Topic: [health](topics/health.md)
- Datasets: [DS-APL](datasets.md#ds-apl), [DS-CONTOURS](datasets.md#ds-contours)
- Finding: 12,771 of 34,886 communes (36.6%) fall below the APL 2.5 threshold, home to 11.1 million people. The access gap is centre-vs-periphery, not urban-vs-rural: Paris (dept 75) has an average APL of 4.96 with zero desert communes, while the surrounding IDF suburbs (Seine-et-Marne, Val-d'Oise, Yvelines, Essonne) rank among the worst-served in France. Three Guyanese communes (Maripasoula, Grand-Santi, Papaichton) have APL = 0.00.
- Story: [medical-deserts](/stories/medical-deserts/)

### Q-015: Which commune has the most doctors per capita?
- Status: 🟢 open
- Topic: [health](topics/health.md)

### Q-016: How has hospital access (distance to nearest hospital) changed in the last 10 years?
- Status: 🟢 open
- Topic: [health](topics/health.md)

### Q-017: Which regions have the best cancer survival rates?
- Status: 🟢 open
- Topic: [health](topics/health.md)

## Education

### Q-018: Which département sends the highest share of students to classes préparatoires?
- Status: 🟢 open
- Topic: [education](topics/education.md)

### Q-019: Where are France's top-performing lycées, by baccalauréat results?
- Status: 🟢 open
- Topic: [education](topics/education.md)

### Q-020: How many primary schools have closed in rural France since 2000?
- Status: 🟢 open
- Topic: [education](topics/education.md)

### Q-021: What is the gender gap in French STEM higher education, by field?
- Status: 🟢 open
- Topic: [education](topics/education.md)

### Q-022: Which cities have the highest student population per capita?
- Status: 🟢 open
- Topic: [education](topics/education.md)

## Environment

### Q-023: Which commune has France's worst recorded air quality?
- Status: 🟢 open
- Topic: [environment](topics/environment.md)

### Q-024: How much forest does France actually have, and is it growing or shrinking?
- Status: 🟢 open
- Topic: [environment](topics/environment.md)

### Q-025: Which regions produce the most renewable energy per capita?
- Status: 🟢 open
- Topic: [environment](topics/environment.md)

### Q-027: What's the most polluted river in France, by recent monitoring?
- Status: 🟢 open
- Topic: [environment](topics/environment.md)

## Transport

### Q-028: Which commune is farthest from a TGV station?
- Status: 🟢 open
- Topic: [transport](topics/transport.md)

### Q-029: How many roundabouts does France have, and is it really the world leader?
- Status: 🟢 open
- Topic: [transport](topics/transport.md)

### Q-030: Which département has the most traffic deaths per capita?
- Status: 🟢 open
- Topic: [transport](topics/transport.md)

### Q-031: Which cities have the most kilometers of bike lane per capita?
- Status: 🟢 open
- Topic: [transport](topics/transport.md)

### Q-032: Which TER line is the most consistently delayed?
- Status: 🟢 open
- Topic: [transport](topics/transport.md)

## Culture

### Q-033: Which commune has the most bars per capita?
- Status: ✅ answered
- Topic: [culture](topics/culture.md)
- Finding: Answered nationally rather than at commune level. Finistère (1,014 bars, under 1M residents) and tourism-heavy Mediterranean départements (Var 1,042, Hérault 1,013) punch clearly above their weight per capita. Exact commune-level per-capita rankings require a population join we don't have in this dataset. The overall picture — 49,385 active débits de boissons (NAF 56.30Z), with Nord+Pas-de-Calais (3,226 combined) edging Paris (3,120) for first place — is mapped in Story 4.
- Story: [bars](/stories/bars/)

### Q-034: Where is the "baguette capital" — the commune with the most bakeries per capita?
- Status: ✅ answered
- Topic: [culture](topics/culture.md)
- Datasets: [DS-001](datasets.md#ds-001) (IDF BPE via communes.geojson)
- Finding: Among IDF communes with pop > 2,000, Paris 1er leads at 20.8 bakeries per 10,000 residents (36 bakeries, 17,308 people). But the distribution is sharply unequal: 607 of 1,300 IDF communes have zero bakeries (46.7%), and in Seine-et-Marne 59% of communes are bakery-free. Urban towns like Jouy-le-Moutier (16,589 residents, 1 bakery = 0.6/10k) show a 35× gap vs Paris 1er. Data is IDF only.
- Story: [bread-gap](/stories/bread-gap/)

### Q-035: How many communes have a public library, and how many don't?
- Status: 🟢 open
- Topic: [culture](topics/culture.md)

### Q-037: What is the single most common commune name in France?
- Status: 🟢 open
- Topic: [culture](topics/culture.md)

### Q-038: Where are France's most-visited cultural sites (museums, monuments) actually located?
- Status: 🟢 open
- Topic: [culture](topics/culture.md)

### Q-039: Which commune in France has the shortest official name?
- Status: 🟢 open
- Topic: [culture](topics/culture.md)

### Q-040: Which département borrows the most books from public libraries per capita?
- Status: 🟢 open
- Topic: [culture](topics/culture.md)

### Q-041: Where are IDF's bakeries densest?
- Status: ✅ answered
- Topic: [culture](topics/culture.md)
- Finding: Paris's inner arrondissements dominate by count (Paris 18e: 155, 15e: 147, 17e: 133) and run at ~8 bakeries per 10k residents — the highest in IDF. Smaller outer communes like Cormeilles-en-Vexin top the per-capita ranking due to small denominators. 607 of 1,300 IDF communes have zero recorded bakeries. The density pattern closely tracks the pharmacy network from Q-007 — the same commercial-density logic governs both trades.
- Story: [baguettes](/stories/baguettes/)
