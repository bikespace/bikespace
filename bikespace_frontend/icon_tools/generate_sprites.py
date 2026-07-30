# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///

# INSTRUCTIONS
# - run with `make generate-sprites`
# - You must have spreet (https://github.com/flother/spreet) installed
# - The folders to be processed are defined in TO_PROCESS below

from pathlib import Path
import subprocess

TO_PROCESS = [
    ("src/assets/icons/parking_map", "public/parking_sprites/parking_sprites"),
    ("src/assets/icons/imagery_map", "public/imagery_map_sprites/imagery_map_sprites"),
]


def generate_sprites(src_path: str, out_path: str) -> None:
    """Convert all .svg files from src_path into @1x and @2x spritesheet files in out_path using spreet."""

    src = Path(src_path)
    out = Path(out_path)
    out.parent.mkdir(exist_ok=True)

    subprocess.run(
        ["spreet", "--unique", src, out],
        check=True,
        text=True,
    )
    subprocess.run(
        ["spreet", "--retina", "--unique", src, f"{out}@2x"],
        check=True,
        text=True,
    )


if __name__ == "__main__":
    for src, out in TO_PROCESS:
        generate_sprites(src, out)
