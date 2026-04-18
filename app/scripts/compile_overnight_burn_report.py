#!/home/dylan/pestsense-academy/.venv-media/bin/python
import argparse
import json
from datetime import datetime
from pathlib import Path


def load_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--baseline", required=True)
    parser.add_argument("--final", required=True)
    parser.add_argument("--dogfood", required=True)
    args = parser.parse_args()

    baseline = load_json(args.baseline)
    final = load_json(args.final)
    dogfood = load_json(args.dogfood)

    out_dir = Path("/home/dylan/pestsense-academy/qa/reviews")
    stamp = datetime.now().strftime("%Y-%m-%d-%H%M")
    out_path = out_dir / f"{stamp}-overnight-proof-of-concept-burn.md"

    lines = [
        "# Overnight Proof-of-Concept Burn Report",
        "",
        f"- Compiled at: {datetime.now().isoformat()}",
        f"- Baseline snapshot: `{args.baseline}`",
        f"- Final snapshot: `{args.final}`",
        f"- Dogfood report: `{args.dogfood}`",
        "",
        "## Coverage Delta",
        "",
    ]

    for entity in ("categories", "courses", "modules", "lessons"):
        base_counts = baseline["published_locale_counts"][entity]
        final_counts = final["published_locale_counts"][entity]
        lines.append(f"### {entity.title()}")
        lines.append("")
        for locale in sorted(set(base_counts) | set(final_counts)):
            before = base_counts.get(locale, 0)
            after = final_counts.get(locale, 0)
            delta = after - before
            lines.append(f"- `{locale}`: {before} -> {after} ({delta:+d})")
        lines.append("")

    lines.extend(["## Flagship Missing Lessons", ""])
    for locale in ("fr", "es", "de"):
        lines.append(f"### {locale.upper()}")
        lines.append("")
        for course_slug, before_data in baseline["flagship_missing_lessons"][locale].items():
            after_data = final["flagship_missing_lessons"][locale][course_slug]
            lines.append(
                f"- `{course_slug}`: {before_data['missing_lessons']} -> {after_data['missing_lessons']} missing"
            )
        lines.append("")

    lines.extend(["## Image and Media Inventory", ""])
    for locale in ("fr", "es", "de"):
        before = baseline["file_inventory"]["localized_images"][locale]
        after = final["file_inventory"]["localized_images"][locale]
        lines.append(f"- Localized images `{locale}`: {before} -> {after} ({after - before:+d})")
    lines.append(
        f"- Live localized media files: {baseline['file_inventory']['live_i18n_media_files']} -> {final['file_inventory']['live_i18n_media_files']}"
    )
    lines.append(
        f"- Premium localized media files: {baseline['file_inventory']['premium_i18n_media_files']} -> {final['file_inventory']['premium_i18n_media_files']}"
    )

    lines.extend(["", "## Dogfood Summary", ""])
    lines.append(f"- Pages checked: {dogfood['summary']['pages_checked']}")
    lines.append(f"- Media checks: {dogfood['summary']['media_checked']}")
    lines.append(f"- Issues found: {dogfood['summary']['issues']}")

    page_issues = [item for item in dogfood["page_checks"] if item["issues"]]
    media_issues = [item for item in dogfood["media_checks"] if item["issues"]]

    lines.extend(["", "## Review-First Queue", ""])
    if not page_issues and not media_issues:
        lines.append("- No automated dogfood issues were detected on the flagship sweep.")
    else:
        for item in page_issues[:12]:
            issues = "; ".join(item["issues"])
            lines.append(f"- Page `{item['locale']}{item['path']}`: {issues}")
        for item in media_issues[:12]:
            issues = "; ".join(item["issues"])
            lines.append(f"- Media `{item['locale']}` `{item['lesson_slug']}`: {issues}")

    remaining_priority = []
    for locale in ("fr", "es", "de"):
        for course_slug, data in final["flagship_missing_lessons"][locale].items():
            if data["missing_lessons"] > 0:
                remaining_priority.append((locale, data["missing_lessons"], course_slug))
    remaining_priority.sort(key=lambda row: (-row[1], row[0], row[2]))

    lines.extend(["", "## Recommended Next-Day Manual Review Order", ""])
    if not remaining_priority:
        lines.append("- 1. Listen to the flagship dubbed videos in French, Spanish, and German and note naturalness issues.")
        lines.append("- 2. Review the localized screenshots inside the onboarding and product lessons for typography and visual consistency.")
        lines.append("- 3. Decide whether the long training-session draft is strong enough for another premium pass or should stay review-only.")
    else:
        for index, (locale, missing, course_slug) in enumerate(remaining_priority[:10], start=1):
            lines.append(f"- {index}. `{locale}` `{course_slug}` still has {missing} missing flagship lesson locales.")

    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"report": str(out_path)}, indent=2))


if __name__ == "__main__":
    main()
