# -*- coding: utf-8 -*-
"""Converte a última resposta CDP Page.captureScreenshot em PNG: python salvar_print.py <nome>."""
import base64
import json
import sys
from pathlib import Path

LOGS = Path.home() / ".cursor" / "browser-logs"
DESTINO = Path(__file__).resolve().parent / "prints"


def salvar(nome):
    ultimo = max(LOGS.glob("cdp-response-Page.captureScreenshot-*.json"), key=lambda p: p.stat().st_mtime)
    dados = json.loads(ultimo.read_text(encoding="utf-8"))
    DESTINO.mkdir(exist_ok=True)
    saida = DESTINO / f"{nome}.png"
    saida.write_bytes(base64.b64decode(dados["data"]))
    ultimo.unlink()
    from PIL import Image
    print(saida.name, Image.open(saida).size)


if __name__ == "__main__":
    salvar(sys.argv[1])
