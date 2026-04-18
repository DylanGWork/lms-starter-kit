#!/home/dylan/pestsense-academy/.venv-media/bin/python
import argparse
import json
import subprocess
from datetime import datetime
from pathlib import Path


ROOT = Path("/home/dylan/pestsense-academy")
SCRIPTS = ROOT / "app" / "scripts"
OUT_DIR = ROOT / "qa" / "reviews"


def run_json(command):
    proc = subprocess.run(command, capture_output=True, text=True, check=True)
    return json.loads(proc.stdout)


def build_summary(content, assets, browser):
    critical = []
    warnings = []

    content_summary = content["summary"]
    asset_summary = assets["summary"]
    browser_summary = browser["summary"]

    if content_summary["missing_locale_rows"] or any(
        key in {"missing_content", "english_content", "english_title"}
        or key.startswith("english_marker:")
        for key in content_summary["issue_breakdown"]
    ):
        critical.append("content_readiness")
    elif content_summary["issues"]:
        warnings.append("content_quality")

    if any(key.startswith("img_http_") or key.startswith("video_http_") or key.startswith("subtitle_http_") for key in asset_summary["issue_breakdown"]):
        critical.append("broken_live_assets")
    elif asset_summary["issues"]:
        warnings.append("asset_quality")

    if browser_summary.get("status") == "ok":
        if browser_summary["issues"]:
            warnings.append("browser_findings")
    elif browser_summary.get("status") == "skipped":
        warnings.append("browser_crawl_skipped")

    status = "green"
    if critical:
        status = "red"
    elif warnings:
        status = "amber"

    return {
        "status": status,
        "critical": critical,
        "warnings": warnings,
    }


def write_reports(prefix, payload):
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    json_path = OUT_DIR / f"{prefix}-localization-gate.json"
    md_path = OUT_DIR / f"{prefix}-localization-gate.md"
    json_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    lines = [
        "# Localization QA Gate",
        "",
        f"- Ran at: {payload['ran_at']}",
        f"- Gate status: `{payload['gate']['status']}`",
        f"- Scope: `{payload['scope']}`",
        "",
        "## Gate Signals",
        "",
        f"- Critical: `{', '.join(payload['gate']['critical']) or 'none'}`",
        f"- Warnings: `{', '.join(payload['gate']['warnings']) or 'none'}`",
        "",
        "## Linked Reports",
        "",
        f"- Content audit: `{payload['content_report']}`",
        f"- Asset audit: `{payload['asset_report']}`",
        f"- Browser crawl: `{payload['browser_report']}`",
        "",
        "## Quick Counts",
        "",
        f"- Content issues: `{payload['content']['summary']['issues']}`",
        f"- Asset issues: `{payload['assets']['summary']['issues']}`",
        f"- Browser issues: `{payload['browser']['summary'].get('issues', 0)}`",
    ]
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return json_path, md_path


def parse_args():
    parser = argparse.ArgumentParser(description="Run localization content, asset, and browser QA gate.")
    parser.add_argument("--scope", choices=("flagship", "all"), default="flagship")
    parser.add_argument("--prefix", default=datetime.now().strftime("%Y-%m-%d-%H%M"))
    return parser.parse_args()


def main():
    args = parse_args()
    content_meta = run_json(
        [
            str(SCRIPTS / "qa_locale_content_audit.py"),
            "--scope",
            args.scope,
            "--prefix",
            args.prefix,
        ]
    )
    asset_meta = run_json(
        [
            str(SCRIPTS / "qa_locale_asset_audit.py"),
            "--scope",
            args.scope,
            "--prefix",
            args.prefix,
        ]
    )
    browser_meta = run_json(
        [
            str(SCRIPTS / "qa_playwright_flagship_crawl.py"),
            "--prefix",
            args.prefix,
        ]
    )

    content = json.loads(Path(content_meta["json"]).read_text(encoding="utf-8"))
    assets = json.loads(Path(asset_meta["json"]).read_text(encoding="utf-8"))
    browser = json.loads(Path(browser_meta["json"]).read_text(encoding="utf-8"))

    payload = {
        "ran_at": datetime.now().isoformat(),
        "scope": args.scope,
        "gate": build_summary(content, assets, browser),
        "content_report": content_meta["markdown"],
        "asset_report": asset_meta["markdown"],
        "browser_report": browser_meta["markdown"],
        "content": content,
        "assets": assets,
        "browser": browser,
    }

    json_path, md_path = write_reports(args.prefix, payload)
    print(json.dumps({"json": str(json_path), "markdown": str(md_path), "gate": payload["gate"]}, indent=2))


if __name__ == "__main__":
    main()
