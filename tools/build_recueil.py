#!/usr/bin/env python3
"""Convertit un fichier texte de cantiques en recueil2.json + recueil2.local.js.

Format du fichier texte (un cantique par bloc) :

    ## 12 | Titre du cantique | Nom de l'auteur   (l'auteur est facultatif)
    Première strophe, ligne 1
    Première strophe, ligne 2

    ~ Refrain, ligne 1
    Refrain, ligne 2

    Deuxième strophe...

- « ## numéro | titre » commence un cantique (le numéro est celui du livre imprimé).
- Une ligne vide sépare les strophes.
- Une strophe dont la première ligne commence par « ~ » est un refrain.
- Une ligne « @ remarque » est ignorée (pratique pour noter « à vérifier »).

Utilisation :  python tools/build_recueil.py mon_recueil.txt
"""
import io, json, re, sys


def parse(text):
    songs, cur, stanza = [], None, None

    def close_stanza():
        nonlocal stanza
        if cur is not None and stanza:
            cur['s'].append([stanza[0], stanza[1]])
        stanza = None

    for raw in text.splitlines():
        line = raw.rstrip()
        m = re.match(r'^##\s*(\d+)\s*\|\s*([^|]+?)\s*(?:\|\s*(.+))?$', line)
        if m:
            close_stanza()
            cur = {'n': int(m.group(1)), 't': m.group(2).strip(), 'c': 0, 's': []}
            if m.group(3):
                cur['a'] = m.group(3).strip()
            songs.append(cur)
            continue
        if cur is None or line.startswith('@'):
            continue
        if not line.strip():
            close_stanza()
            continue
        if stanza is None:
            if line.startswith('~'):
                stanza = ['r', [line[1:].strip()]]
            else:
                stanza = ['v', [line.strip()]]
        else:
            stanza[1].append(line.strip())
    close_stanza()
    return [s for s in songs if s['s']]


def main(path):
    songs = parse(io.open(path, encoding='utf8').read())
    seen = set()
    for s in songs:
        if s['n'] in seen:
            print('ATTENTION : numéro en double', s['n'])
        seen.add(s['n'])
    songs.sort(key=lambda s: s['n'])
    data = {'categories': ['Recueil'], 'cantiques': songs}
    js = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    io.open('recueil2.json', 'w', encoding='utf8').write(js)
    io.open('recueil2.local.js', 'w', encoding='utf8').write('window.__RECUEIL2=' + js + ';\n')
    print(len(songs), 'cantiques écrits dans recueil2.json et recueil2.local.js')
    print('Pensez à changer VERSION dans sw.js pour que les téléphones se mettent à jour.')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
