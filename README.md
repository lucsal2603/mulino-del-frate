# Mulino del Frate: bozza di restyling

Proposta di restyling del sito di [Mulino del Frate](https://mulinodelfrate.it), con lo shop rifatto. A cura di Luca Salvemini.

Struttura e animazioni riprese da frantoiocavalli.com (Awwwards, Sito del Giorno del 6 aprile 2022), con contenuti, foto e prodotti del Mulino.

## Come aprirla
Sito statico, senza build. Basta servire la cartella:

```bash
python3 -m http.server 8000
```

poi aprire http://localhost:8000.

## Stack
- GSAP 3.13 (ScrollTrigger, SplitText) e Lenis, caricati da CDN
- Instrument Serif e Inter da Google Fonts
- Viste: home, `#bottega` (categoria) e `#prodotto-<id>` (scheda prodotto)

## File
- `index.html`, `style.css`, `app.js`
- `assets/`: foto del Mulino, prodotti scontornati (`c-*.webp`), incisioni di sfondo (`inc-*.webp`)
- `DA-VERIFICARE.md`: dati da confermare con il cliente
