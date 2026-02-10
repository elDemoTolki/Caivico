#!/usr/bin/env python3
"""
Generador alternativo en Python para assets/gallery.json que escribe rutas absolutas (/assets/...) .
Uso: python scripts/generate-gallery-index.py
"""
import os
import re
import json
from pathlib import Path

project_root = Path(__file__).resolve().parents[1]
assets_dir = project_root / 'assets'
out_file = assets_dir / 'gallery.json'

if not assets_dir.exists():
    raise SystemExit(f"Carpeta assets/ no encontrada: {assets_dir}")

files = os.listdir(assets_dir)
items = []
for f in files:
    m = re.match(r'^gallery(\d+)\.jpg$', f, re.IGNORECASE)
    if m:
        num = int(m.group(1))
        items.append((num, f))

items.sort(key=lambda x: x[0])
paths = [f"/assets/{fn}" for _, fn in items]

data = {
    'timestamp': None,
    'total': len(paths),
    'images': paths
}

from datetime import datetime
data['timestamp'] = datetime.utcnow().isoformat()

with open(out_file, 'w', encoding='utf-8') as fh:
    json.dump(data, fh, indent=2, ensure_ascii=False)

print(f"Generado {out_file.relative_to(project_root)} con {len(paths)} imágenes")
