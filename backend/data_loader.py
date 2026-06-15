import logging
from pathlib import Path

import numpy as np
import pandas as pd

from utils import normalize_county_name


logger = logging.getLogger(__name__)


DATA_FILE = Path(__file__).parent / "data" / "cleaned_health_facilities_kenya.xlsx"
POPULATION_FILE = Path(__file__).parent / "data" / "county_population.csv"
KDHS_INDICATORS_FILE = Path(__file__).parent / "data" / "kdhs_2022_county_indicators.csv"

EXPECTED_COUNTY_COUNT = 47
EXPECTED_POPULATION_TOTAL = 47_564_296

DEFAULT_PAGE = 1
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100
MAX_SEARCH_LENGTH = 100


REQUIRED_POPULATION_COLUMNS = [
    "county",
    "population_2019",
    "households_2019",
    "area_km2",
    "density_per_km2",
]


REQUIRED_KDHS_INDICATOR_COLUMNS = [
    "county",
    "teenage_pregnancy_pct",
    "modern_contraceptive_use_pct",
    "unmet_need_family_planning_pct",
    "anc_4plus_visits_pct",
    "skilled_delivery_pct",
    "facility_delivery_pct",
    "fully_vaccinated_basic_pct",
]


REQUIRED_FACILITY_COLUMNS = [
    "Facility Code",
    "Facility Name",
    "County",
    "Province",
    "District",
    "Facility Category",
    "Ownership Category",
    "Beds",
    "Operational Status",
    "FP",
    "IPD",
    "HBC",
    "C-IMCI",
    "ART",
]


SERVICE_COLUMNS = {
    "FP": "fp",
    "IPD": "ipd",
    "HBC": "hbc",
    "C-IMCI": "c_imci",
    "ART": "art",
}


OUTPUT_FACILITY_COLUMNS = [
    "Facility Code",
    "Facility Name",
    "County",
    "District",
    "Facility Category",
    "Ownership Category",
    "Beds",
    "Operational Status",
]


OUTPUT_FACILITY_RENAME_MAP = {
    "Facility Code": "facility_code",
    "Facility Name": "facility_name",
    "County": "county",
    "District": "district",
    "Facility Category": "facility_category",
    "Ownership Category": "ownership_category",
    "Beds": "beds",
    "Operational Status": "operational_status",
}


def _raise_data_validation_error(public_message, detail=None):
    """
    Raise a clean validation error while logging detailed context server-side.
    """
    if detail is not None:
        logger.error("%s Detail: %s", public_message, detail)
    else:
        logger.error(public_message)

    raise ValueError(public_message)


def _assert_file_exists(file_path, label):
    if not file_path.exists():
        _raise_data_validation_error(
            f"{label} file was not found.",
            detail=str(file_path),
        )


def _validate_required_columns(source_df, required_columns, source_name):
    missing_columns = [
        column for column in required_columns if column not in source_df.columns
    ]

    if missing_columns:
        _raise_data_validation_error(
            f"{source_name} is missing required columns.",
            detail=missing_columns,
        )


def _clean_text_value(value):
    """
    Normalize whitespace without changing meaning.
    """
    if pd.isna(value):
        return ""

    return " ".join(str(value).strip().split())


def _clean_filter_value(value):
    if value is None:
        return None

    cleaned = str(value).strip().lower()

    return cleaned if cleaned else None


def _clean_search_value(value):
    if value is None:
        return None

    cleaned = str(value).strip().lower()

    if not cleaned:
        return None

    return cleaned[:MAX_SEARCH_LENGTH]


def _safe_text_series(source_df, column):
    return source_df[column].fillna("").astype(str).str.strip().str.lower()


def _service_available_mask(series):
    """
    Return a boolean mask for service availability columns.

    Safely handles:
    - Boolean values
    - Numeric values where values above 0 mean available
    - Text values such as true, yes, y, and 1
    """
    if pd.api.types.is_bool_dtype(series):
        return series.fillna(False)

    numeric_values = pd.to_numeric(series, errors="coerce")

    text_values = (
        series.fillna("")
        .astype(str)
        .str.strip()
        .str.lower()
    )

    text_available = text_values.isin(["true", "yes", "y", "1"])

    numeric_available = numeric_values.fillna(0) > 0

    return numeric_available | text_available


def _validate_pagination(page, page_size):
    try:
        page = int(page)
    except (TypeError, ValueError):
        page = DEFAULT_PAGE

    try:
        page_size = int(page_size)
    except (TypeError, ValueError):
        page_size = DEFAULT_PAGE_SIZE

    page = max(page, 1)
    page_size = max(1, min(page_size, MAX_PAGE_SIZE))

    return page, page_size


def _escape_csv_formula(value):
    """
    Prevent CSV / Excel formula injection.

    Excel may treat cells starting with =, +, -, or @ as formulas.
    """
    if isinstance(value, str) and value.startswith(("=", "+", "-", "@")):
        return "'" + value

    return value


def _prepare_records(source_df):
    """
    Convert a DataFrame into API-safe records.

    Replaces NaN and infinite values with None so JSON responses stay valid.
    """
    safe_df = source_df.replace([np.inf, -np.inf], np.nan)
    safe_df = safe_df.astype(object).where(pd.notna(safe_df), None)

    return safe_df.to_dict(orient="records")


def load_facility_data():
    _assert_file_exists(DATA_FILE, "Facility dataset")

    facilities_df = pd.read_excel(DATA_FILE)

    _validate_required_columns(
        facilities_df,
        REQUIRED_FACILITY_COLUMNS,
        "Facility dataset",
    )

    facilities_df = facilities_df.copy()

    facilities_df["_county_canonical"] = facilities_df["County"].apply(
        normalize_county_name
    )

    return facilities_df


def load_population_data():
    _assert_file_exists(POPULATION_FILE, "Population dataset")

    population_df = pd.read_csv(POPULATION_FILE)

    _validate_required_columns(
        population_df,
        REQUIRED_POPULATION_COLUMNS,
        "Population dataset",
    )

    population_df = population_df[REQUIRED_POPULATION_COLUMNS].copy()

    population_df["county_source"] = population_df["county"].apply(_clean_text_value)

    population_df["county_canonical"] = population_df["county_source"].apply(
        normalize_county_name
    )

    numeric_columns = [
        "population_2019",
        "households_2019",
        "area_km2",
        "density_per_km2",
    ]

    for column in numeric_columns:
        population_df[column] = pd.to_numeric(
            population_df[column],
            errors="coerce",
        )

    if population_df[numeric_columns].isna().any().any():
        bad_rows = population_df[
            population_df[numeric_columns].isna().any(axis=1)
        ][["county_source"] + numeric_columns]

        _raise_data_validation_error(
            "Population dataset has non-numeric or missing values.",
            detail=bad_rows.to_dict(orient="records"),
        )

    duplicate_counties = population_df[
        population_df.duplicated(subset=["county_canonical"], keep=False)
    ]["county_canonical"].tolist()

    if duplicate_counties:
        _raise_data_validation_error(
            "Population dataset has duplicate normalized county names.",
            detail=duplicate_counties,
        )

    if len(population_df) != EXPECTED_COUNTY_COUNT:
        _raise_data_validation_error(
            f"Expected {EXPECTED_COUNTY_COUNT} population rows.",
            detail=f"Found {len(population_df)} rows.",
        )

    population_total = int(population_df["population_2019"].sum())

    if population_total != EXPECTED_POPULATION_TOTAL:
        _raise_data_validation_error(
            "Population total does not match KNBS 2019 county total.",
            detail=(
                f"Expected {EXPECTED_POPULATION_TOTAL:,}, "
                f"found {population_total:,}."
            ),
        )

    return population_df.reset_index(drop=True)


def load_kdhs_indicator_data():
    _assert_file_exists(KDHS_INDICATORS_FILE, "KDHS 2022 indicator dataset")

    kdhs_df = pd.read_csv(KDHS_INDICATORS_FILE)

    _validate_required_columns(
        kdhs_df,
        REQUIRED_KDHS_INDICATOR_COLUMNS,
        "KDHS 2022 indicator dataset",
    )

    kdhs_df = kdhs_df[REQUIRED_KDHS_INDICATOR_COLUMNS].copy()

    kdhs_df["county"] = kdhs_df["county"].apply(_clean_text_value)
    kdhs_df["_county_key"] = kdhs_df["county"].apply(normalize_county_name)

    numeric_columns = [
        column
        for column in REQUIRED_KDHS_INDICATOR_COLUMNS
        if column != "county"
    ]

    for column in numeric_columns:
        kdhs_df[column] = pd.to_numeric(kdhs_df[column], errors="coerce")

    if kdhs_df[numeric_columns].isna().any().any():
        bad_rows = kdhs_df[
            kdhs_df[numeric_columns].isna().any(axis=1)
        ][["county"] + numeric_columns]

        _raise_data_validation_error(
            "KDHS 2022 indicator dataset has non-numeric or missing values.",
            detail=bad_rows.to_dict(orient="records"),
        )

    out_of_range_mask = (
        (kdhs_df[numeric_columns] < 0)
        | (kdhs_df[numeric_columns] > 100)
    )

    if out_of_range_mask.any().any():
        bad_rows = kdhs_df[out_of_range_mask.any(axis=1)][
            ["county"] + numeric_columns
        ]

        _raise_data_validation_error(
            "KDHS 2022 indicator values must be between 0 and 100.",
            detail=bad_rows.to_dict(orient="records"),
        )

    duplicate_counties = kdhs_df[
        kdhs_df.duplicated(subset=["_county_key"], keep=False)
    ]["county"].tolist()

    if duplicate_counties:
        _raise_data_validation_error(
            "KDHS 2022 indicator dataset has duplicate normalized county names.",
            detail=duplicate_counties,
        )

    if len(kdhs_df) != EXPECTED_COUNTY_COUNT:
        _raise_data_validation_error(
            f"Expected {EXPECTED_COUNTY_COUNT} KDHS indicator rows.",
            detail=f"Found {len(kdhs_df)} rows.",
        )

    return kdhs_df.reset_index(drop=True)


def _build_access_density_df():
    facility_totals = (
        df.groupby("_county_canonical")
        .agg(total_facilities=("Facility Code", "count"))
        .reset_index()
        .rename(columns={"_county_canonical": "county"})
    )

    public_mask = _safe_text_series(df, "Ownership Category") == "public"

    public_facilities = (
        df[public_mask]
        .groupby("_county_canonical")
        .agg(public_facilities=("Facility Code", "count"))
        .reset_index()
        .rename(columns={"_county_canonical": "county"})
    )

    art_facilities = (
        df.assign(art_available=_service_available_mask(df["ART"]).astype(int))
        .groupby("_county_canonical")
        .agg(art_facilities=("art_available", "sum"))
        .reset_index()
        .rename(columns={"_county_canonical": "county"})
    )

    population_for_join = df_population[
        [
            "county_canonical",
            "population_2019",
            "households_2019",
            "area_km2",
            "density_per_km2",
        ]
    ].rename(columns={"county_canonical": "county"})

    access_density = (
        facility_totals.merge(public_facilities, on="county", how="left")
        .merge(art_facilities, on="county", how="left")
        .merge(population_for_join, on="county", how="left")
    )

    unmatched = access_density[access_density["population_2019"].isna()]

    if not unmatched.empty:
        _raise_data_validation_error(
            "Population join failed.",
            detail={
                "counties_missing_population_data": unmatched["county"].tolist()
            },
        )

    access_density["public_facilities"] = (
        access_density["public_facilities"].fillna(0).astype(int)
    )

    access_density["art_facilities"] = (
        access_density["art_facilities"].fillna(0).astype(int)
    )

    if (access_density["population_2019"] <= 0).any():
        bad_counties = access_density.loc[
            access_density["population_2019"] <= 0,
            "county",
        ].tolist()

        _raise_data_validation_error(
            "Population values must be greater than zero.",
            detail=bad_counties,
        )

    access_density["facilities_per_100k_population"] = (
        access_density["total_facilities"]
        / access_density["population_2019"]
        * 100000
    ).round(2)

    access_density["public_facilities_per_100k_population"] = (
        access_density["public_facilities"]
        / access_density["population_2019"]
        * 100000
    ).round(2)

    access_density["art_facilities_per_100k_population"] = (
        access_density["art_facilities"]
        / access_density["population_2019"]
        * 100000
    ).round(2)

    metric_columns = [
        "facilities_per_100k_population",
        "public_facilities_per_100k_population",
        "art_facilities_per_100k_population",
    ]

    if access_density[metric_columns].isna().any().any():
        _raise_data_validation_error(
            "Access-density calculation produced missing values."
        )

    if not np.isfinite(access_density[metric_columns].to_numpy(dtype=float)).all():
        _raise_data_validation_error(
            "Access-density calculation produced infinite values."
        )

    return access_density


def _validate_startup_data():
    facility_counties = sorted(df["_county_canonical"].dropna().unique().tolist())

    population_counties = sorted(
        df_population["county_canonical"].dropna().unique().tolist()
    )

    if len(facility_counties) != EXPECTED_COUNTY_COUNT:
        _raise_data_validation_error(
            f"Expected {EXPECTED_COUNTY_COUNT} facility counties.",
            detail={
                "found": len(facility_counties),
                "counties": facility_counties,
            },
        )

    if len(population_counties) != EXPECTED_COUNTY_COUNT:
        _raise_data_validation_error(
            f"Expected {EXPECTED_COUNTY_COUNT} population counties.",
            detail={
                "found": len(population_counties),
                "counties": population_counties,
            },
        )

    missing_in_population = sorted(set(facility_counties) - set(population_counties))
    extra_in_population = sorted(set(population_counties) - set(facility_counties))

    if missing_in_population or extra_in_population:
        _raise_data_validation_error(
            "County normalization mismatch.",
            detail={
                "missing_in_population": missing_in_population,
                "extra_in_population": extra_in_population,
            },
        )

    ownership_values = sorted(
        df["Ownership Category"].dropna().astype(str).str.strip().unique().tolist()
    )

    ownership_values_lower = [value.lower() for value in ownership_values]

    if "public" not in ownership_values_lower:
        _raise_data_validation_error(
            "Expected Public in Ownership Category values.",
            detail=ownership_values,
        )

    for service_column in SERVICE_COLUMNS:
        mask = _service_available_mask(df[service_column])

        if mask.isna().any():
            _raise_data_validation_error(
                f"{service_column} service column produced invalid values."
            )

    access_density = _build_access_density_df()

    if len(access_density) != EXPECTED_COUNTY_COUNT:
        _raise_data_validation_error(
            f"Expected {EXPECTED_COUNTY_COUNT} access-density rows.",
            detail=f"Found {len(access_density)} rows.",
        )

    logger.info(
        "Facilities loaded: %s records, %s counties",
        len(df),
        len(facility_counties),
    )
    logger.info("Population loaded: %s counties", len(population_counties))
    logger.info("County join: 47/47 matched, 0 unmatched")
    logger.info("Public ownership category confirmed")
    logger.info("Service columns confirmed")
    logger.info("Access density calculated")


def _load_app_data():
    try:
        facilities_df = load_facility_data()
        population_df = load_population_data()
        kdhs_indicators_df = load_kdhs_indicator_data()

        return facilities_df, population_df, kdhs_indicators_df

    except Exception as exc:
        logger.exception("Application data failed to load.")
        raise RuntimeError("Application data failed to load.") from exc


df, df_population, df_kdhs_indicators = _load_app_data()

try:
    _validate_startup_data()
except Exception as exc:
    logger.exception("Application startup validation failed.")
    raise RuntimeError("Application startup validation failed.") from exc


def get_summary():
    return {
        "total_facilities": int(len(df)),
        "counties_covered": int(df["County"].nunique()),
        "provinces_covered": int(df["Province"].nunique()),
        "facility_types": int(df["Facility Category"].nunique()),
        "ownership_categories": int(df["Ownership Category"].nunique()),
    }


def get_ownership_breakdown():
    ownership_counts = df["Ownership Category"].value_counts().reset_index()
    ownership_counts.columns = ["category", "count"]

    return _prepare_records(ownership_counts)


def get_facility_type_breakdown():
    facility_type_counts = df["Facility Category"].value_counts().reset_index()
    facility_type_counts.columns = ["category", "count"]

    return _prepare_records(facility_type_counts)


def get_county_breakdown():
    county_group = (
        df.groupby(["County", "Province"])
        .agg(total=("Facility Code", "count"))
        .reset_index()
    )

    ownership_pivot = (
        df.pivot_table(
            index="County",
            columns="Ownership Category",
            values="Facility Code",
            aggfunc="count",
            fill_value=0,
        )
        .reset_index()
    )

    county_data = county_group.merge(ownership_pivot, on="County", how="left")

    county_data = county_data.rename(
        columns={
            "County": "county",
            "Province": "province",
            "Public": "public",
            "Private": "private",
            "Faith-Based": "faith_based",
            "NGO": "ngo",
            "Community": "community",
            "Academic": "academic",
        }
    )

    expected_columns = [
        "county",
        "province",
        "total",
        "public",
        "private",
        "faith_based",
        "ngo",
        "community",
        "academic",
    ]

    for column in expected_columns:
        if column not in county_data.columns:
            county_data[column] = 0

    county_data = county_data[expected_columns]
    county_data = county_data.fillna(0)
    county_data = county_data.sort_values("total", ascending=False)

    count_columns = [
        "total",
        "public",
        "private",
        "faith_based",
        "ngo",
        "community",
        "academic",
    ]

    for column in count_columns:
        county_data[column] = county_data[column].astype(int)

    return _prepare_records(county_data)


def get_service_breakdown():
    county_totals = (
        df.groupby("County")
        .agg(total=("Facility Code", "count"))
        .reset_index()
    )

    service_data = county_totals.copy()

    for original_column, clean_name in SERVICE_COLUMNS.items():
        service_counts = (
            df.assign(
                service_available=_service_available_mask(
                    df[original_column]
                ).astype(int)
            )
            .groupby("County")
            .agg(**{clean_name: ("service_available", "sum")})
            .reset_index()
        )

        service_data = service_data.merge(service_counts, on="County", how="left")

    service_data = service_data.rename(columns={"County": "county"})
    service_data = service_data.fillna(0)
    service_data = service_data.sort_values("total", ascending=False)

    numeric_columns = ["total", *SERVICE_COLUMNS.values()]

    for column in numeric_columns:
        service_data[column] = service_data[column].astype(int)

    return _prepare_records(service_data)


def get_service_gap_score():
    service_data = pd.DataFrame(get_service_breakdown())

    service_columns = list(SERVICE_COLUMNS.values())

    service_data["total"] = pd.to_numeric(
        service_data["total"],
        errors="coerce",
    ).fillna(0)

    for column in service_columns:
        service_data[column] = pd.to_numeric(
            service_data[column],
            errors="coerce",
        ).fillna(0)

        service_data[f"{column}_coverage"] = np.where(
            service_data["total"] > 0,
            service_data[column] / service_data["total"] * 100,
            0,
        ).round(1)

    coverage_columns = [
        "fp_coverage",
        "ipd_coverage",
        "hbc_coverage",
        "c_imci_coverage",
        "art_coverage",
    ]

    service_data["coverage_score"] = (
        service_data[coverage_columns].mean(axis=1).round(1)
    )

    service_data = service_data.sort_values("coverage_score", ascending=True)

    output_columns = [
        "county",
        "total",
        "fp_coverage",
        "ipd_coverage",
        "hbc_coverage",
        "c_imci_coverage",
        "art_coverage",
        "coverage_score",
    ]

    return _prepare_records(service_data[output_columns])


def get_population_data():
    population_data = df_population.copy()
    population_data["county"] = population_data["county_canonical"]

    output_columns = [
        "county",
        "population_2019",
        "households_2019",
        "area_km2",
        "density_per_km2",
    ]

    population_data = population_data[output_columns].sort_values("county")

    return _prepare_records(population_data)


def get_kdhs_indicators():
    kdhs_data = df_kdhs_indicators.copy()

    output_columns = REQUIRED_KDHS_INDICATOR_COLUMNS

    kdhs_data = kdhs_data[output_columns].sort_values("county")

    return _prepare_records(kdhs_data)


def get_access_density():
    access_density = _build_access_density_df()

    output_columns = [
        "county",
        "total_facilities",
        "population_2019",
        "households_2019",
        "area_km2",
        "density_per_km2",
        "facilities_per_100k_population",
        "public_facilities_per_100k_population",
        "art_facilities_per_100k_population",
    ]

    access_density = access_density[output_columns]

    access_density = access_density.sort_values(
        "facilities_per_100k_population",
        ascending=True,
    ).reset_index(drop=True)

    return _prepare_records(access_density)

def _clamp_priority_score(value):
    if value is None or pd.isna(value):
        return 0

    return round(max(0, min(100, float(value))), 2)


def _safe_numeric_value(value):
    if value is None or pd.isna(value):
        return None

    return float(value)


def _calculate_threshold_risk(
    value,
    lower_threshold,
    upper_threshold,
    lower_flag,
    missing_flag,
):
    flags = []

    value = _safe_numeric_value(value)

    if value is None:
        flags.append(missing_flag)
        return 100, flags

    if value <= lower_threshold:
        flags.append(lower_flag)
        return 100, flags

    if value >= upper_threshold:
        return 0, flags

    risk = ((upper_threshold - value) / (upper_threshold - lower_threshold)) * 100
    return _clamp_priority_score(risk), flags


def _calculate_art_facility_risk(value):
    flags = []

    value = _safe_numeric_value(value)

    if value is None:
        flags.append("ART facility density unavailable; maximum ART risk used")
        return 100, flags

    if value == 0:
        flags.append("ART facility density is zero")
        return 100, flags

    if value >= 5:
        return 0, flags

    risk = ((5 - value) / 5) * 100
    return _clamp_priority_score(risk), flags


def _calculate_access_risk(row):
    reason_flags = []

    facility_density_risk, flags = _calculate_threshold_risk(
        row.get("facilities_per_100k_population"),
        lower_threshold=15,
        upper_threshold=30,
        lower_flag="Facilities per 100k below critical threshold",
        missing_flag="Facilities per 100k unavailable; maximum access risk used",
    )
    reason_flags.extend(flags)

    public_facility_risk, flags = _calculate_threshold_risk(
        row.get("public_facilities_per_100k_population"),
        lower_threshold=8,
        upper_threshold=18,
        lower_flag="Public facilities per 100k below minimum planning threshold",
        missing_flag="Public facilities per 100k unavailable; maximum public access risk used",
    )
    reason_flags.extend(flags)

    art_facility_risk, flags = _calculate_art_facility_risk(
        row.get("art_facilities_per_100k_population")
    )
    reason_flags.extend(flags)

    access_risk = (
        facility_density_risk * 0.50
        + public_facility_risk * 0.30
        + art_facility_risk * 0.20
    )

    return _clamp_priority_score(access_risk), reason_flags


def _calculate_service_risk(coverage_score):
    coverage_score = _safe_numeric_value(coverage_score)

    if coverage_score is None:
        return 50, ["Service coverage unavailable; neutral risk used"]

    service_risk = 100 - coverage_score
    reason_flags = []

    if service_risk >= 70:
        reason_flags.append("High service risk from low coverage score")

    return _clamp_priority_score(service_risk), reason_flags


def _calculate_ownership_risk(public_share, private_share, faith_ngo_share):
    reason_flags = []

    if (
        public_share is None
        or private_share is None
        or faith_ngo_share is None
        or pd.isna(public_share)
        or pd.isna(private_share)
        or pd.isna(faith_ngo_share)
    ):
        return 50, ["Ownership mix unavailable; neutral risk used"]

    public_share = float(public_share)
    private_share = float(private_share)
    faith_ngo_share = float(faith_ngo_share)

    if public_share < 60:
        public_dependence_risk = 0
    elif public_share >= 85:
        public_dependence_risk = 100
        reason_flags.append("High public-sector dependence")
    else:
        public_dependence_risk = ((public_share - 60) / 25) * 100

    if private_share < 50:
        private_concentration_risk = 0
    elif private_share >= 75:
        private_concentration_risk = 100
        reason_flags.append("High private-market concentration")
    else:
        private_concentration_risk = ((private_share - 50) / 25) * 100

    if faith_ngo_share < 20:
        faith_ngo_dependence_risk = 0
    elif faith_ngo_share >= 40:
        faith_ngo_dependence_risk = 70
        reason_flags.append("Strong faith-based/NGO dependence")
    else:
        faith_ngo_dependence_risk = ((faith_ngo_share - 20) / 20) * 70

    ownership_risk = max(
        public_dependence_risk,
        private_concentration_risk,
        faith_ngo_dependence_risk,
    )

    return _clamp_priority_score(ownership_risk), reason_flags


def _calculate_population_pressure(row):
    population_pressure = row.get("population_pressure")

    if population_pressure is None or pd.isna(population_pressure):
        return 50, ["Population data unavailable; neutral pressure used"]

    return _clamp_priority_score(population_pressure), []


def _get_priority_level(priority_score):
    if priority_score >= 70:
        return "High"

    if priority_score >= 40:
        return "Medium"

    return "Low"


def _calculate_percentile_scores(source_df, value_column, output_column):
    ranked_df = source_df.copy()
    numeric_values = pd.to_numeric(ranked_df[value_column], errors="coerce")

    valid_count = numeric_values.notna().sum()

    if valid_count <= 1:
        ranked_df[output_column] = 50
        return ranked_df

    ranked_df[output_column] = (
        (numeric_values.rank(method="min") - 1) / (valid_count - 1) * 100
    ).round(2)

    return ranked_df


def get_planning_priority_index():
    access_density = pd.DataFrame(get_access_density())
    service_scores = pd.DataFrame(get_service_gap_score())
    county_data = pd.DataFrame(get_county_breakdown())

    access_density["_county_key"] = access_density["county"].apply(normalize_county_name)
    service_scores["_county_key"] = service_scores["county"].apply(normalize_county_name)
    county_data["_county_key"] = county_data["county"].apply(normalize_county_name)

    service_scores = service_scores[["_county_key", "coverage_score"]]

    ownership_columns = [
        "public",
        "private",
        "faith_based",
        "ngo",
        "community",
        "academic",
    ]

    for column in ownership_columns:
        if column not in county_data.columns:
            county_data[column] = 0

        county_data[column] = pd.to_numeric(county_data[column], errors="coerce").fillna(0)

    county_data["ownership_total"] = county_data[ownership_columns].sum(axis=1)

    county_data["public_share"] = np.where(
        county_data["ownership_total"] > 0,
        county_data["public"] / county_data["ownership_total"] * 100,
        np.nan,
    )

    county_data["private_share"] = np.where(
        county_data["ownership_total"] > 0,
        county_data["private"] / county_data["ownership_total"] * 100,
        np.nan,
    )

    county_data["faith_ngo_share"] = np.where(
        county_data["ownership_total"] > 0,
        (county_data["faith_based"] + county_data["ngo"])
        / county_data["ownership_total"]
        * 100,
        np.nan,
    )

    ownership_data = county_data[
        [
            "_county_key",
            "public_share",
            "private_share",
            "faith_ngo_share",
        ]
    ]

    priority_data = (
        access_density.merge(service_scores, on="_county_key", how="left")
        .merge(ownership_data, on="_county_key", how="left")
    )

    priority_data = _calculate_percentile_scores(
        priority_data,
        "population_2019",
        "population_size_percentile",
    )

    priority_data = _calculate_percentile_scores(
        priority_data,
        "density_per_km2",
        "population_density_percentile",
    )

    priority_data["population_pressure"] = (
        priority_data["population_size_percentile"] * 0.60
        + priority_data["population_density_percentile"] * 0.40
    ).round(2)

    output = []

    for _, row in priority_data.iterrows():
        reason_flags = []

        access_risk, flags = _calculate_access_risk(row)
        reason_flags.extend(flags)

        service_risk, flags = _calculate_service_risk(row.get("coverage_score"))
        reason_flags.extend(flags)

        ownership_risk, flags = _calculate_ownership_risk(
            row.get("public_share"),
            row.get("private_share"),
            row.get("faith_ngo_share"),
        )
        reason_flags.extend(flags)

        population_pressure, flags = _calculate_population_pressure(row)
        reason_flags.extend(flags)

        priority_score = (
            access_risk * 0.40
            + service_risk * 0.30
            + ownership_risk * 0.20
            + population_pressure * 0.10
        )

        total_facilities = row.get("total_facilities")

        if total_facilities == 0:
            access_risk = 100
            service_risk = 100
            priority_score = max(priority_score, 85)
            reason_flags.append("Zero facilities recorded")

        priority_score = _clamp_priority_score(priority_score)
        priority_level = _get_priority_level(priority_score)

        output.append(
            {
                "county": row.get("county"),
                "priority_score": priority_score,
                "priority_level": priority_level,
                "component_scores": {
                    "access_risk": access_risk,
                    "service_risk": service_risk,
                    "ownership_risk": ownership_risk,
                    "population_pressure": population_pressure,
                },
                "input_metrics": {
                    "facilities_per_100k": row.get(
                        "facilities_per_100k_population"
                    ),
                    "public_facilities_per_100k": row.get(
                        "public_facilities_per_100k_population"
                    ),
                    "art_facilities_per_100k": row.get(
                        "art_facilities_per_100k_population"
                    ),
                    "coverage_score": row.get("coverage_score"),
                    "public_share": _clamp_priority_score(row.get("public_share")),
                    "private_share": _clamp_priority_score(row.get("private_share")),
                    "faith_ngo_share": _clamp_priority_score(
                        row.get("faith_ngo_share")
                    ),
                    "population_2019": row.get("population_2019"),
                    "population_density": row.get("density_per_km2"),
                },
                "reason_flags": sorted(set(reason_flags)),
            }
        )

    return sorted(output, key=lambda item: item["priority_score"], reverse=True)


def apply_facility_filters(
    source_df,
    county=None,
    ownership=None,
    facility_type=None,
    status=None,
    search=None,
):
    filtered_df = source_df.copy()

    county = _clean_filter_value(county)
    ownership = _clean_filter_value(ownership)
    facility_type = _clean_filter_value(facility_type)
    status = _clean_filter_value(status)
    search = _clean_search_value(search)

    if county:
        filtered_df = filtered_df[
            _safe_text_series(filtered_df, "County") == county
        ]

    if ownership:
        filtered_df = filtered_df[
            _safe_text_series(filtered_df, "Ownership Category") == ownership
        ]

    if facility_type:
        filtered_df = filtered_df[
            _safe_text_series(filtered_df, "Facility Category") == facility_type
        ]

    if status:
        filtered_df = filtered_df[
            _safe_text_series(filtered_df, "Operational Status") == status
        ]

    if search:
        filtered_df = filtered_df[
            filtered_df["Facility Name"]
            .fillna("")
            .astype(str)
            .str.lower()
            .str.contains(search, na=False, regex=False)
        ]

    return filtered_df


def get_facilities(
    county=None,
    ownership=None,
    facility_type=None,
    status=None,
    search=None,
    page=DEFAULT_PAGE,
    page_size=DEFAULT_PAGE_SIZE,
):
    page, page_size = _validate_pagination(page, page_size)

    filtered_df = apply_facility_filters(
        df,
        county=county,
        ownership=ownership,
        facility_type=facility_type,
        status=status,
        search=search,
    )

    total = int(len(filtered_df))

    start = (page - 1) * page_size
    end = start + page_size

    results_df = filtered_df.iloc[start:end]
    results_df = results_df[OUTPUT_FACILITY_COLUMNS].copy()
    results_df = results_df.rename(columns=OUTPUT_FACILITY_RENAME_MAP)
    results_df = results_df.fillna("")

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "results": _prepare_records(results_df),
    }


def get_facilities_export(
    county=None,
    ownership=None,
    facility_type=None,
    status=None,
    search=None,
):
    filtered_df = apply_facility_filters(
        df,
        county=county,
        ownership=ownership,
        facility_type=facility_type,
        status=status,
        search=search,
    )

    export_df = filtered_df[OUTPUT_FACILITY_COLUMNS].copy()
    export_df = export_df.fillna("")

    export_df = export_df.apply(lambda column: column.map(_escape_csv_formula))

    return export_df