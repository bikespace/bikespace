# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///

# INSTRUCTIONS
# - run with `make split-svgs`
# - You must have Inkscape (https://inkscape.org/) installed
# - If needed, set the path to your Inkscape executable by setting the INKSCAPE_COMMAND environment variable. The default uses the path for recent versions of MacOS.
# - The folders to be processed are defined in TO_PROCESS below

from os import getenv
from pathlib import Path
import subprocess
import xml.etree.ElementTree as ET

TO_PROCESS = [
    ("src/assets/icons/bicycle_network/src", "src/assets/icons/bicycle_network/split")
]

INKSCAPE_COMMAND = getenv(
    "INKSCAPE_COMMAND", "/Applications/Inkscape.app/Contents/MacOS/inkscape"
)
NS = {
    "sodipodi": "http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd",
    "inkscape": "http://www.inkscape.org/namespaces/inkscape",
}


def with_ns(tag: str, ns: dict[str, str] = NS) -> str:
    """Expand out xml namespace using prefixed tag.

    e.g. "example:tag" -> "{http://example.org/namespaces/example}tag" """
    ns_prefix, tag_name = tag.split(":")
    return f"{{{ns[ns_prefix]}}}{tag_name}"


def split_icons(src_path: str, out_path: str) -> None:
    """Find .svg files that use Inkscape's multi-page feature in the src_path folder and split them out into individual plain .svg files saved in out_path.

    Adds the page title as a suffix to the filename.

    .svg files in src_path that do not use Inkscape's multi-page feature are simply copied over to out_path as plain .svg files."""
    src = Path(src_path)
    out = Path(out_path)
    files = src.glob("*.svg")

    # check files in src folder, split out if multi-page
    for file in files:
        tree = ET.parse(file)
        root = tree.getroot()
        pages = list(root.findall(f".//{with_ns('inkscape:page')}"))

        if pages:
            for index, page in enumerate(pages, start=1):
                page_name = page.attrib[with_ns("inkscape:label")]
                file_name = out / f"{file.stem}_{page_name}.svg"
                print(f"generating: {file_name}")
                subprocess.run(
                    [
                        INKSCAPE_COMMAND,
                        "--export-type=svg",
                        f"--export-page={index}",
                        "--export-plain-svg",
                        f"--export-filename={file_name}",
                        f"{file}",
                    ],
                    check=True,
                    text=True,
                )
        else:
            file_name = out / file.name
            print(f"copying out: {file_name}")
            subprocess.run(
                [
                    INKSCAPE_COMMAND,
                    "--export-type=svg",
                    "--export-plain-svg",
                    f"--export-filename={file_name}",
                    f"{file}",
                ],
                check=True,
                text=True,
            )


if __name__ == "__main__":
    for src, out in TO_PROCESS:
        split_icons(src, out)
