import json
import re

# Mapping dictionaries for bike types and colors
BIKE_TYPE_MAP = {
    "RC": "Road bike",
    "RG": "Regular bike",
    "MT": "Mountain bike",
    "BM": "BMX",
    "EL": "Electric bike",
    "FO": "Folding bike",
    "SC": "Scooter",
    "TO": "Touring bike",
    "TR": "Tricycle",
    "UN": "Unicycle",
    "OT": "Other",
}

COLOR_MAP = {
    "BLK": "Black",
    "WHI": "White",
    "RED": "Red",
    "BLU": "Blue",
    "GRN": "Green",
    "YEL": "Yellow",
    "ONG": "Orange",
    "PUR": "Purple",
    "GRY": "Grey",
    "SIL": "Silver",
    "GLD": "Gold",
    "BRN": "Brown",
    "BGE": "Beige",
    "PNK": "Pink",
    "MRN": "Maroon",
    "TAN": "Tan",
    "SILRED": "Silver/Red",
    "BLKRED": "Black/Red",
    "BLKWHI": "Black/White",
    "BLUBLU": "Blue",
}

STATUS_MAP = {
    "STOLEN": "stolen",
    "RECOVERED": "recovered",
    "UNKNOWN": "unknown",
}


def normalize_color(raw_color: str) -> str:
    """Look up color code or attempt to clean raw value."""
    if not raw_color or raw_color.strip().lower() == "none":
        return "Unknown"
    upper = raw_color.strip().upper()
    if upper in COLOR_MAP:
        return COLOR_MAP[upper]
    # Fallback: title-case the raw value
    return raw_color.strip().title()


def normalize_bike_type(raw_type: str) -> str:
    if not raw_type or raw_type.strip().lower() == "none":
        return "Unknown"
    return BIKE_TYPE_MAP.get(raw_type.strip().upper(), raw_type.strip().title())


def build_description(props: dict) -> str:
    """Compose a human-readable description from available fields."""
    parts = []

    make = props.get("BIKE_MAKE", "")
    model = props.get("BIKE_MODEL", "")
    if make and make.lower() != "none":
        parts.append(make.title())
    if model and model.lower() != "none":
        parts.append(model.title())

    cost = props.get("BIKE_COST")
    if cost:
        parts.append(f"valued at ${cost:,.0f}")

    speed = props.get("BIKE_SPEED")
    if speed and speed != "0":
        parts.append(f"{speed}-speed")

    location_type = props.get("LOCATION_TYPE", "")
    if location_type:
        parts.append(f"stolen from {location_type.lower()}")

    return ", ".join(parts) if parts else "No description available"


def build_location_label(props: dict) -> str:
    """Use division + location type as a rough location label."""
    division = props.get("DIVISION", "")
    premises = props.get("PREMISES_TYPE", "")
    if division and premises:
        return f"{premises} ({division})"
    return division or premises or "Unknown location"


def convert_feature(feature: dict) -> dict:
    props = feature["properties"]

    # Coordinates — prefer top-level lat/long fields for precision
    lat = props.get("LAT_WGS84")
    lon = props.get("LONG_WGS84")

    # Fallback to geometry coordinates if properties are missing
    if lat is None or lon is None:
        coords = feature.get("geometry", {}).get("coordinates", [[None, None]])[0]
        lon, lat = coords[0], coords[1]

    # Normalize date to YYYY-MM-DD (already in that format in the source)
    raw_date = props.get("OCC_DATE", "")
    date = raw_date[:10] if raw_date else ""

    return {
        "id": str(props.get("_id", "")),
        "date": date,
        "location": build_location_label(props),
        "bikeType": normalize_bike_type(props.get("BIKE_TYPE", "")),
        "color": normalize_color(props.get("BIKE_COLOUR", "")),
        "description": build_description(props),
        "status": STATUS_MAP.get(props.get("STATUS", "").upper(), "unknown"),
        "latitude": lat,
        "longitude": lon,
    }


def convert_geojson(input_path: str, output_path: str) -> None:
    with open(input_path, "r", encoding="utf-8") as f:
        geojson = json.load(f)

    features = geojson.get("features", [])
    reports = [convert_feature(f) for f in features]

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(reports, f, indent=2, ensure_ascii=False)

    print(f"Converted {len(reports)} records → {output_path}")


if __name__ == "__main__":
    convert_geojson("bicycle-thefts.geojson", "stolen_bike_reports.json")