import logging
from pathlib import Path

import numpy as np
import pandas as pd

from utils import normalize_county_name


logger = logging.getLogger(__name__)


DATA_FILE = Path(__file__).parent / "data" / "cleaned_health_facilities_kenya.xlsx"
POPULATION_FILE = Path(__file__).parent / "data" / "county_population.csv"

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

        return facilities_df, population_df

    except Exception as exc:
        logger.exception("Application data failed to load.")
        raise RuntimeError("Application data failed to load.") from exc


df, df_population = _load_app_data()

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