def normalize_county_name(name: str) -> str:
    """Normalize KNBS/facilities county names to the backend canonical style."""
    if not isinstance(name, str):
        return ""

    cleaned = " ".join(name.strip().split())
    key = cleaned.upper()

    county_map = {
        "TAITA/TAVETA": "Taita Taveta",
        "ELGEYO/MARAKWET": "Elgeyo Marakwet",
        "THARAKA-NITHI": "Tharaka Nithi",
        "NAIROBI CITY": "Nairobi",
        "MURANG'A": "Murang'a",
    }

    if key in county_map:
        return county_map[key]

    return cleaned.title()
