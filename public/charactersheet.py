#!/usr/bin/env -S uv run
# /// script
# requires-python = "==3.12.*"
# dependencies = [
#   "typer==0.19.2",
#   "loguru==0.7.3",
#   "pymupdf==1.28.2",
# ]
# ///
"""Builds Rolemaster 2nd edition Finnish character sheet as vector tables 
and standard PDF AcroForm fields.
"""

from pathlib import Path

import pymupdf as fitz
import typer
from loguru import logger

ROOT = Path(__file__).resolve().parent
BLACK = (0, 0, 0)
LABEL_FONT = fitz.Font("tibo")
LEFT_FIELD_PADDING = 1.5


class Form:
    def __init__(self) -> None:
        self.doc = fitz.open()
        self.page = self.doc.new_page(width=595.26, height=841.86)

    def line(self, x1: float, y1: float, x2: float, y2: float, width: float = 0.35) -> None:
        self.page.draw_line((x1, y1), (x2, y2), color=BLACK, width=width)

    def text(self, x: float, y: float, value: str, size: float = 8) -> None:
        self.page.insert_text((x, y), value, fontname="tibo", fontsize=size, color=BLACK)

    def center(self, x: float, y: float, value: str, size: float = 8) -> None:
        width = LABEL_FONT.text_length(value, fontsize=size)
        self.text(x - width / 2, y, value, size)

    def field(self, name: str, label: str, x1: float, x2: float, baseline: float,
              *, centered: bool = False) -> None:
        self.line(x1, baseline, x2, baseline)
        widget = fitz.Widget()
        widget.field_name = name
        widget.field_label = label
        widget.field_type = fitz.PDF_WIDGET_TYPE_TEXT
        text_x1 = x1 if centered else x1 + LEFT_FIELD_PADDING
        widget.rect = fitz.Rect(text_x1, baseline - 10.5, x2, baseline - 0.3)
        widget.text_font = "Helv"
        widget.text_fontsize = 7
        widget.text_color = BLACK
        widget.border_width = 0
        added = self.page.add_widget(widget)
        if centered:
            self.doc.xref_set_key(added.xref, "Q", "1")

    def labeled(self, name: str, label: str, x: float, y: float, end: float,
                label_size: float = 8, *, centered: bool = False) -> None:
        self.text(x, y, label, size=label_size)
        start = x + LABEL_FONT.text_length(label, fontsize=label_size) + 1
        self.field(name, label.rstrip(":"), start, end, y + 2, centered=centered)

    def checkbox(self, name: str, label: str, x: float, y: float) -> None:
        widget = fitz.Widget()
        widget.field_name = name
        widget.field_label = label
        widget.field_type = fitz.PDF_WIDGET_TYPE_CHECKBOX
        # ZapfDingbats character 8 is the standard PDF cross (X) mark.
        widget.button_caption = "8"
        widget.rect = fitz.Rect(x, y, x + 5, y + 5)
        widget.border_color = BLACK
        widget.border_width = 0.55
        widget.text_color = BLACK
        widget.fill_color = (1, 1, 1)
        widget.field_value = "Off"
        added = self.page.add_widget(widget)
        # MuPDF defaults to a tick even with a cross caption. Supply explicit
        # vector appearances so PDF viewers display the same X when toggled.
        self.doc.xref_set_key(added.xref, "MK/CA", "(8)")
        state = self.page.load_widget(added.xref).on_state()
        _, appearance = self.doc.xref_get_key(added.xref, f"AP/N/{state}")
        self.doc.update_stream(int(appearance.split()[0]), (
            "q 1 1 1 rg 0 0 5 5 re f 0 G 0.55 w "
            "0.275 0.275 4.45 4.45 re S "
            "0.65 w 1 1 m 4 4 l 1 4 m 4 1 l S Q"
        ).encode("ascii"))

    def build(self) -> None:
        # Straighten the scan and restore the worn top border above Nimi/Kieli.
        for coords in [
            (47, 9, 47, 694), (529, 9, 529, 694), (47, 694, 529, 694),
            (47, 9, 529, 9), (216, 9, 216, 163), (376, 9, 376, 227),
            (47, 163, 376, 163), (346, 163, 346, 307),
            (346, 227, 529, 227), (47, 307, 529, 307),
        ]:
            self.line(*coords, width=1.1)

        for name, label, x, y, end in [
            ("nimi", "Nimi:", 49, 27.5, 211),
            ("rotu", "Rotu:", 49, 40.5, 211),
            ("pituus", "Pituus:", 49, 53.5, 112),
            ("hiukset", "Hiukset:", 117, 53.5, 211),
            ("paino", "Paino:", 49, 66.5, 112),
            ("silmat", "Silmät:", 117, 66.5, 211),
            ("ika", "Ikä:", 49, 79.5, 112),
            ("sukupuoli", "Sukupuoli:", 117, 79.5, 211),
            ("ulkonako", "Ulkonäkö (UL):", 49, 92.5, 211),
            ("muuta", "Muuta:", 49, 105.5, 211),
            ("ammatti", "Ammatti:", 49, 118.5, 211),
            ("taso", "Taso:", 49, 131.5, 211),
            ("kokemuspisteet", "Kokemuspisteet:", 49, 144.5, 211),
        ]:
            self.labeled(name, label, x, y, end)
        self.field("kokemuspisteet_jatko", "Kokemuspisteet / lisätiedot", 49, 211, 159)

        self.center(265, 28.5, "KIELI")
        self.center(329, 28.5, "Puhuttu")
        self.center(360, 18.5, "Kirjoi-")
        self.center(360, 28.5, "tettu")
        for row in range(10):
            y = 43 + row * 13
            for name, label, x1, x2 in [
                ("kieli", "Kieli", 219, 311),
                ("puhuttu", "Puhuttu", 318, 342),
                ("kirjoitettu", "Kirjoitettu", 349, 373),
            ]:
                self.field(f"kielet_{row+1:02}_{name}", f"Kieli {row+1}: {label}", x1, x2, y,
                           centered=name != "kieli")

        self.center(412, 28.5, "LOITSULISTA")
        self.center(461, 28.5, "Tasolle")
        self.center(501, 18.5, "Oppimis-")
        self.center(501, 28.5, "mahdollisuus")
        for row in range(15):
            y = 43 + row * 12.9
            for name, label, x1, x2 in [
                ("loitsu", "Loitsulista", 378, 446),
                ("taso", "Tasolle", 449, 473),
                ("oppiminen", "Oppimismahdollisuus", 478, 523),
            ]:
                self.field(f"loitsut_{row+1:02}_{name}", f"Loitsulista {row+1}: {label}", x1, x2, y,
                           centered=name != "loitsu")

        self.text(49, 172, "OMINAISUUDET")
        self.center(129, 172, "Lyh.")
        columns = [(144, 176, "Väl."), (183, 215, "Ylär."), (219, 252, "Keh. pist."),
                   (258, 289, "Norm."), (294, 313, "Rotu"), (316, 343, "Yht.")]
        for x1, x2, label in columns:
            self.center((x1+x2)/2, 172, label)
        attributes = [("Ruumiinrakenne", "RR"), ("Näppäryys", "NÄ"), ("Itsekuri", "IK"),
                      ("Muisti", "MU"), ("Päättely", "PÄ"), ("Voima", "VO"),
                      ("Nopeus", "NO"), ("Olemus", "OL"), ("Empatia", "EM"), ("Intuitio", "IN")]
        for row, (label, abbreviation) in enumerate(attributes):
            y = 186.5 + row * 13
            self.text(49, y - 2, label)
            self.center(129, y - 2, f"({abbreviation})")
            for col, (x1, x2, heading) in enumerate(columns):
                if row >= 5 and col == 2:
                    self.center((x1+x2)/2, y - 2, "XXX")
                else:
                    self.field(f"ominaisuus_{row+1:02}_{col+1}", f"{label}: {heading}", x1, x2, y,
                               centered=True)

        for name, label, x, y, end in [
            ("peruskesto", "Peruskesto:", 347.5, 237.5, 423),
            ("taikuuden_laji", "Taikuuden laji:", 427, 237.5, 523),
            ("kokonaiskesto", "Kokonaiskesto:", 347.5, 250.5, 423),
            ("mahtipisteet", "Mahtipisteet:", 427, 250.5, 523),
            ("haarniskatyyppi", "Haarniskatyyppi:", 347.5, 276.5, 423),
            ("nopein_kaynti", "Nopein käynti:", 427, 276.5, 523),
            ("puolustusbonus", "Puolustusbonus:", 347.5, 289.5, 423),
            ("perusliikkumisvauhti", "Perusliikkumisvauhti:", 427, 289.5, 523),
            ("kilpibonus", "Kilpibonus:", 347.5, 302.5, 423),
        ]:
            self.labeled(name, label, x, y, end,
                         label_size=7 if name == "haarniskatyyppi" else 8,
                         centered=True)
        self.field("kilpibonus_lisatiedot", "Kilpibonus / lisätiedot", 427, 523, 304.5,
                   centered=True)

        self.center(244, 317, "KYKYASTEET")
        self.center(437, 317, "BONUKSET")
        for x1, x2 in [(205, 213), (275, 283), (403, 411), (462, 470)]:
            self.line(x1, 314.5, x2, 314.5, width=0.7)
        self.text(49, 329, "Kyky/taito")
        self.center(129, 329, "Hinta")
        self.center(179, 329, "5 % kykyaste")
        self.center(254.5, 329, "2 % kykyaste")
        self.center(319.5, 329, "1 % kykyaste")
        bonus_columns = [(350, 374, "Aste"), (379, 403, "Omin."), (408, 423, "Taso"),
                         (428, 448, "Esine"), (453, 473, "Sekal."),
                         (478, 498, "Sekal."), (503, 523, "Yht.")]
        for x1, x2, label in bonus_columns:
            self.center((x1+x2)/2, 329, label)
        for row in range(28):
            y = 343.5 + row * 12.8
            prefix = f"kyky_{row+1:02}"
            self.field(f"{prefix}_nimi", f"Kyky/taito {row+1}", 50, 114, y)
            self.field(f"{prefix}_hinta", f"Kyky {row+1}: Hinta", 119, 139, y, centered=True)
            for percent, start, count in [(5, 147, 10), (2, 222.5, 10), (1, 303.5, 5)]:
                for box in range(count):
                    self.checkbox(f"{prefix}_{percent}pct_{box+1:02}",
                                  f"Kyky {row+1}: {percent} % kykyaste, ruutu {box+1}",
                                  start + box * 6.5, y - 7)
            for col, (x1, x2, label) in enumerate(bonus_columns):
                self.field(f"{prefix}_bonus_{col+1}", f"Kyky {row+1}: {label} ({col+1})", x1, x2, y,
                           centered=True)
        self.doc.set_metadata({"title": "Hahmolomake – täytettävä", "author": "",
                               "subject": "Vector recreation of Rolemaster 2nd edition character sheet with AcroForm fields",
                               "creator": "charactersheet.py / PyMuPDF"})
        self.doc.xref_set_key(self.page.xref, "Tabs", "/R")
        self.doc.need_appearances(False)


def verify(path: Path) -> tuple[int, int]:
    """Check structure and round-trip filled text and checked/unchecked boxes."""
    with fitz.open(path) as doc:
        assert len(doc) == 1
        page = doc[0]
        assert not page.get_images(), "Output must contain no raster images"
        assert "Näppäryys" in page.get_text()
        widgets = list(page.widgets())
        assert len({w.field_name for w in widgets}) == len(widgets)
        texts = [w for w in widgets if w.field_type == fitz.PDF_WIDGET_TYPE_TEXT]
        checks = [w for w in widgets if w.field_type == fitz.PDF_WIDGET_TYPE_CHECKBOX]
        assert len(checks) == 700
        assert len(texts) == 406
        centered_names = {
            w.field_name for w in texts
            if w.field_name.startswith("ominaisuus_")
            or w.field_name.startswith("kyky_") and (
                w.field_name.endswith("_hinta") or "_bonus_" in w.field_name
            )
            or w.field_name.startswith("loitsut_") and (
                w.field_name.endswith("_taso") or w.field_name.endswith("_oppiminen")
            )
            or w.field_name in {
                "peruskesto", "taikuuden_laji", "kokonaiskesto", "mahtipisteet",
                "haarniskatyyppi", "nopein_kaynti", "puolustusbonus",
                "perusliikkumisvauhti", "kilpibonus", "kilpibonus_lisatiedot",
            }
        }
        for widget in texts:
            if widget.field_name in centered_names:
                assert doc.xref_get_key(widget.xref, "Q") == ("int", "1"), (
                    f"Field {widget.field_name} must be centered"
                )
        labels = [
            span
            for block in page.get_text("dict")["blocks"] if "lines" in block
            for line in block["lines"]
            for span in line["spans"]
        ]
        for widget in texts:
            for label in labels:
                overlap = widget.rect & fitz.Rect(label["bbox"])
                assert overlap.get_area() < 0.1, (
                    f"Field {widget.field_name} overlaps label {label['text']!r}"
                )
        for widget in widgets:
            assert page.rect.contains(widget.rect)
            assert widget.rect.width > 0 and widget.rect.height > 0
        texts[0].field_value = "Väinö Ääkkönen"
        texts[0].update()
        for widget in checks:
            assert widget.on_state(), "Checkbox needs a checked appearance"
            assert widget.button_caption == "8", "Checkbox must use an X mark"
        for widget in (checks[0], checks[-1]):
            state = widget.on_state()
            doc.xref_set_key(widget.xref, "V", f"/{state}")
            doc.xref_set_key(widget.xref, "AS", f"/{state}")
        with fitz.open(stream=doc.tobytes(), filetype="pdf") as filled:
            filled_page = filled[0]
            values = {w.field_name: w.field_value for w in filled_page.widgets()}
            assert values[texts[0].field_name] == "Väinö Ääkkönen"
            assert values[checks[0].field_name] != "Off"
            assert values[checks[-1].field_name] != "Off"
            assert values[checks[1].field_name] == "Off"
            # Rendering validates generated appearance streams, too.
            filled_page.get_pixmap(matrix=fitz.Matrix(1, 1))
        return len(texts), len(checks)


def main(
    output: Path = typer.Option(ROOT / "hahmolomake.pdf", help="Destination PDF file."),
    preview: Path | None = typer.Option(None, help="Optional destination PNG preview."),
) -> None:
    form = Form()
    form.build()
    form.doc.save(output, garbage=4, deflate=True)
    if preview:
        form.page.get_pixmap(matrix=fitz.Matrix(2, 2)).save(preview)
    form.doc.close()
    texts, boxes = verify(output)
    logger.info("Wrote {} — {} text fields, {} checkboxes; validation passed", output, texts, boxes)


if __name__ == "__main__":
    typer.run(main)
