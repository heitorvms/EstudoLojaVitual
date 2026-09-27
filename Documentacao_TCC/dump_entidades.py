import re
from pathlib import Path

ENTITY_DIR = Path(__file__).resolve().parent.parent / "Backend/src/main/java/com/dev/Backend/entity"
RELEVANT = ("Column", "JoinColumn", "Id", "Enumerated", "OneToOne", "ManyToOne", "OneToMany", "ManyToMany", "Lob", "Temporal", "JoinTable")

for path in sorted(ENTITY_DIR.glob("*.java")):
    src = path.read_text(encoding="utf-8")
    if "public enum" in src:
        values = re.search(r"enum\s+\w+\s*\{([^}]*)\}", src, re.S)
        print(f"## ENUM {path.stem}: {' '.join(values.group(1).split()) if values else ''}")
        continue
    table = re.search(r'@Table\(name\s*=\s*"(\w+)"', src)
    print(f"## {path.stem} table={table.group(1) if table else '(default)'}")
    annotations = []
    for raw in src.splitlines():
        line = raw.strip()
        if line.startswith("@") and not line.startswith(("@Entity", "@Table", "@Data")):
            annotations.append(line)
            continue
        field = re.match(r"private\s+([\w<>, .]+?)\s+(\w+)\s*(=.*)?;", line)
        if field:
            ann = " ".join(a for a in annotations if any(k in a for k in RELEVANT))
            print(f"  {field.group(2)} : {field.group(1)} | {ann}")
            annotations = []
        elif line and not line.startswith(("/", "*")) and not line.endswith(","):
            annotations = []
