# Rolemaster Suomi

Epävirallisia suomalaisen Rolemaster-laitoksen lisämateriaaleja ja errata. Sivusto on toteutettu Vite-, React- ja TypeScript-teknologioilla.

## Kehitys

```bash
npm install
npm run dev
```

## Erratan päivittäminen

Lisää korjaukset tiedostoon `public/data/errata.json`. Jokainen merkintä noudattaa muotoa:

```json
{
  "id": "uniikki-tunniste",
  "book": "Kirjan nimi",
  "page": 42,
  "section": "Luvun tai taulukon nimi",
  "published": "2026-09-19",
  "original": "Painettu teksti",
  "correction": "Korjattu teksti",
  "explanation": "Korjauksen valinnainen perustelu",
  "category": "errata"
}
```

`category` on `errata` varsinaisille virheille ja `minor` pienille virheille.

## Julkaisu

Työnkulku `.github/workflows/deploy-pages.yml` rakentaa ja julkaisee sivuston GitHub Pagesiin jokaisesta `main`-haaraan tehdystä pushista. Valitse repositorion asetuksissa **Pages → Source → GitHub Actions**.
