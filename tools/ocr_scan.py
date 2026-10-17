#!/usr/bin/env python3
"""Lit un PDF scanné (images) et écrit le texte brut de chaque page avec Tesseract.

Prérequis (une fois) :
  1. Installer Tesseract avec la langue française : https://github.com/UB-Mannheim/tesseract/wiki
  2. pip install pymupdf pytesseract pillow

Utilisation :
  python tools/ocr_scan.py scan.pdf sortie.txt            # pages droites
  python tools/ocr_scan.py scan.pdf sortie.txt --rotate 270 --from 23 --to 74

Les pages photographiées « en travers » demandent --rotate 90 ou 270 selon le sens.
Le texte obtenu est BRUT : il faut le relire et le corriger, puis le mettre au format décrit
dans tools/build_recueil.py avant de le convertir en recueil2.json.
"""
import argparse, io

import pymupdf
import pytesseract
from PIL import Image


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('pdf')
    ap.add_argument('out')
    ap.add_argument('--rotate', type=int, default=0, choices=[0, 90, 180, 270])
    ap.add_argument('--from', dest='first', type=int, default=1)
    ap.add_argument('--to', dest='last', type=int, default=0)
    ap.add_argument('--dpi', type=int, default=300)
    ap.add_argument('--lang', default='fra')
    a = ap.parse_args()

    doc = pymupdf.open(a.pdf)
    last = a.last or len(doc)
    z = a.dpi / 72
    with io.open(a.out, 'w', encoding='utf8') as f:
        for n in range(a.first, last + 1):
            pix = doc[n - 1].get_pixmap(matrix=pymupdf.Matrix(z, z).prerotate(a.rotate))
            img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples).convert('L')
            txt = pytesseract.image_to_string(img, lang=a.lang, config='--psm 4')
            f.write('\n@@ PAGE %d\n%s\n' % (n, txt))
            print('page', n)


if __name__ == '__main__':
    main()
