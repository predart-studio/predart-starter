#!/usr/bin/env python3
"""audit-motion.py — deterministic motion inventory for a project built on this starter.

Reproduces the "what values are actually used" sweep behind
references/this-project-motion-system.md §B. The point is to surface SPREAD: how many distinct
durations / eases / staggers / distances exist. Distinct counts far above the canonical
token-table size are the concrete source of a "hectic" feel.

Pure standard library — no ripgrep/grep portability traps (rg is a shell function on this
machine and invisible to scripts; grep \\b/\\s differ across macOS/GNU). Python regex is uniform.

Usage:
  python3 .claude/skills/motion-director/scripts/audit-motion.py            # live surface only
  python3 .claude/skills/motion-director/scripts/audit-motion.py --all      # include /lab catalog
  python3 .claude/skills/motion-director/scripts/audit-motion.py --root DIR # custom repo root
"""
from __future__ import annotations
import argparse
import os
import re
import sys
from collections import Counter

SCAN_DIRS = ["components", "app", "lib", "hooks"]
CODE_EXT = (".ts", ".tsx", ".js", ".jsx", ".css", ".mjs", ".cjs")

# Path segments excluded for the "live surface" scan (the /lab catalog + shadcn + tests).
# lib/motion.generated.ts is a FILE (the canonical constants) and is kept.
LIVE_EXCLUDE_SEGMENTS = {
    os.path.join("app", "lab"),
    os.path.join("components", "animations"),
    os.path.join("components", "ui"),
    os.path.join("lib", "motion"),
    "__tests__",
    "node_modules",
    ".next",
}

# (label, compiled regex, capture-group-or-0, target-note)
CATEGORIES = [
    ("Durations (JS duration: N)", re.compile(r"\bduration:\s*([0-9.]+)"), 0,
     "4 values: micro .2 / fast .3 / base .6 / slow .9. >6 distinct == collapse."),
    ("Durations (Tailwind classes)", re.compile(r"\bduration-(?:\[[0-9]+m?s?\]|[0-9]+)"), 0,
     "ONE micro value for all hover/press/color. 200/250/300 coexisting == collapse."),
    ("Easings (cubic-bezier)", re.compile(r"cubic-bezier\([^)]*\)"), 0,
     "house / exit / inout only. More custom curves == collapse."),
    ("Easings (GSAP named)", re.compile(r"\b(?:power[0-4]|expo|sine|back|elastic|circ|bounce)\.(?:inOut|in|out)(?:\([0-9.,]+\))?"), 0,
     "Map to house (CustomEase). 'none' OK for scrub/marquee. ONE back.out amount."),
    ("Easings (ease: '...')", re.compile(r"ease:\s*['\"][^'\"]+['\"]"), 0,
     "Should resolve to house / none / one overshoot."),
    ("Stagger / stagger()", re.compile(r"\bstagger(?:Children)?[:(]\s*([0-9.]+)"), 0,
     "tight .03 / base .08 / loose .12. One rhythm per section."),
    ("Delay", re.compile(r"\bdelay:\s*([0-9.]+)"), 0,
     "Prefer timeline position offsets over piles of delays."),
    ("Reveal travel y:", re.compile(r"(?<![A-Za-z_])y:\s*(-?[0-9]+)\b"), 0,
     "rise-sm 16 / rise-md 32 / rise-lg 48. 7 distinct values == collapse."),
    ("Reveal travel x:", re.compile(r"(?<![A-Za-z_])x:\s*(-?[0-9]+)\b"), 0,
     "x slides are signature — keep rare."),
    ("Scrub weights", re.compile(r"\bscrub:\s*(true|[0-9.]+)"), 0,
     "ONE scrub weight site-wide."),
    ("Reveal start points", re.compile(r"\bstart:\s*['\"][^'\"]+['\"]"), 0,
     "ONE wake point (top 85%) unless deliberate."),
    ("Blur radii", re.compile(r"blur(?:\(|-\[)([0-9]+)px"), 0,
     "Cap 8px; short one-time effects only; never continuous/large."),
]

ANTI_PATTERNS = [
    ("transition: all / transition-all", re.compile(r"transition:\s*all|transition-all\b")),
    ("will-change: all", re.compile(r"will-change:\s*all")),
]


def iter_files(root: str, scan_dirs, include_catalog: bool):
    for base in scan_dirs:
        start = os.path.join(root, base)
        if not os.path.isdir(start):
            continue
        for dirpath, dirnames, filenames in os.walk(start):
            rel = os.path.relpath(dirpath, root)
            if not include_catalog:
                # prune excluded path segments
                seg = rel.replace("\\", "/")
                if any(seg == ex.replace("\\", "/") or seg.endswith("/" + ex.replace("\\", "/"))
                       or ("/" + ex.replace("\\", "/") + "/") in ("/" + seg + "/")
                       for ex in LIVE_EXCLUDE_SEGMENTS):
                    dirnames[:] = []
                    continue
            for fn in filenames:
                if fn.endswith(CODE_EXT):
                    yield os.path.join(dirpath, fn)


def main() -> int:
    ap = argparse.ArgumentParser(description="Motion inventory for this project")
    ap.add_argument("--all", action="store_true", help="include /lab catalog + components/animations + lib/motion")
    ap.add_argument("--root", default=".", help="repo root (default: cwd)")
    args = ap.parse_args()

    files = list(iter_files(args.root, SCAN_DIRS, args.all))
    scope = "EVERYTHING (incl. /lab catalog)" if args.all else "LIVE surface only (use --all for the catalog)"
    print(f"# Motion inventory — scanning {scope}")
    print(f"# {len(files)} files under {', '.join(SCAN_DIRS)}\n")

    texts = {}
    for f in files:
        try:
            texts[f] = open(f, encoding="utf-8", errors="ignore").read()
        except OSError:
            pass

    for label, rx, _grp, note in CATEGORIES:
        counts = Counter()
        for f, txt in texts.items():
            for m in rx.finditer(txt):
                token = (m.group(1) if m.groups() else m.group(0)).strip()
                counts[token] += 1
        print("─" * 58)
        print(f"## {label}  —  {len(counts)} distinct")
        print("─" * 58)
        for token, n in counts.most_common(40):
            print(f"  {n:>4}  {token}")
        if not counts:
            print("  (none)")
        print(f"  → target: {note}\n")

    # Reduced-motion coverage
    print("─" * 58)
    print("## Reduced-motion coverage")
    print("─" * 58)
    canonical = sum(1 for t in texts.values() if "usePrefersReducedMotion" in t)
    framer = sum(1 for f, t in texts.items()
                 if re.search(r"\buseReducedMotion\b", t) and "use-reduced-motion" not in f)
    css_mq = sum(1 for f, t in texts.items()
                 if f.endswith(".css") and "prefers-reduced-motion" in t)
    print(f"  usePrefersReducedMotion (canonical hook): {canonical} files")
    print(f"  Framer useReducedMotion (2nd mechanism — aim for 0): {framer} files")
    print(f"  CSS @media prefers-reduced-motion (in .css files): {css_mq} "
          f"{'(present)' if css_mq else '(MISSING — add to a non-generated stylesheet)'}\n")

    # Anti-patterns
    print("─" * 58)
    print("## Anti-patterns (aim for 0)")
    print("─" * 58)
    for label, rx in ANTI_PATTERNS:
        hits = []
        for f, t in texts.items():
            for _ in rx.finditer(t):
                hits.append(f)
        print(f"  {label}: {len(hits)}")
    # sections importing BOTH engines
    both = []
    for f, t in texts.items():
        if os.sep + "sections" + os.sep in f:
            has_gsap = re.search(r"from ['\"]gsap", t)
            has_framer = re.search(r"from ['\"](?:motion/react|framer-motion)['\"]", t)
            if has_gsap and has_framer:
                both.append(os.path.relpath(f, args.root))
    print(f"  sections importing BOTH gsap and framer ({len(both)}):")
    for f in both:
        print(f"      {f}")

    print("\n" + "─" * 58)
    print("Compare each 'distinct' count to the canonical token set in")
    print("references/this-project-motion-system.md §A. Counts >> token-table size")
    print("are the concrete source of 'hectic'. Collapse via the §C mapping table.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
