from pathlib import Path
from PIL import Image

from analysis_for_city.generate_damage_report import (
    resize_image,
    MAX_PHOTO_HEIGHT,
    MAX_PHOTO_WIDTH,
)

test_path = Path("./photos/1290.jpg")


def test_resize():
    output_path = resize_image(test_path)
    resized_image = Image.open(output_path)
    assert (
        resized_image.height <= MAX_PHOTO_HEIGHT
        and resized_image.width <= MAX_PHOTO_WIDTH
    )
