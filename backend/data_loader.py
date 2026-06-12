import numpy as np
import pandas as pd
from pathlib import Path

from utils import normalize_county_name

DATA_FILE = Path(__file__).parent / "data" / "cleaned_health_facilities_kenya.xlsx"
POPULATION_FILE = Path(__file__).parent / "data" / "county_population.csv"

REQUIRED_POPULATION_COLUMNS = [
    "county",
    "population_2019",
    "households_2019",
    "area_km2",
    "density_per_km2",
]

df = pd.read_excel(DATA_FILE)

# Keep the original County column unchanged for existing Version 1 endpoints.
# Use this separate canonical column only for Version 2 population joins.
df["_county_canonical"] = df["County"].apply(normalize_county_name)


def _validate_required_columns(source_df, required_columns, source_name):
    missing_columns = [
        column for column in required_columns if column not in source_df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"{source_name} is missing required columns: "
            f"{', '.join(missing_columns)}"
        )


def _service_available_mask(series):
    """Return a boolean mask for service availability columns such as ART."""
    if pd.api.types.is_bool_dtype(series):
        return series.fillna(False)

    numeric_values = pd.to_numeric(series, errors="coerce")

    if numeric_values.notna().any():
        return numeric_values.fillna(0) > 0

    return (
        series.fillna("")
        .astype(str)
        .str.strip()
        .str.lower()
        .isin(["true", "yes", "y", "1"])
    )


def load_population_data():
    population_df = pd.read_csv(POPULATION_FILE)
    _validate_required_columns(
        population_df,
        REQUIRED_POPULATION_COLUMNS,
        "Population dataset",
    )

    population_df = population_df[REQUIRED_POPULATION_COLUMNS].copy()

    # Keep the source county name auditable while adding a join-safe name.
    population_df["county_source"] = population_df["county"].apply(
        lambda value: " ".join(str(value).strip().split())
    )
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
        raise ValueError(
            "Population dataset has non-numeric or missing values: "
            f"{bad_rows.to_dict(orient='records')}"
        )

    duplicate_counties = population_df[
        population_df.duplicated(subset=["county_canonical"], keep=False)
    ]["county_canonical"].tolist()

    if duplicate_counties:
        raise ValueError(
            "Population dataset has duplicate normalized county names: "
            f"{duplicate_counties}"
        )

    if len(population_df) != 47:
        raise ValueError(f"Expected 47 population rows, found {len(population_df)}")

    population_total = int(population_df["population_2019"].sum())
    if population_total != 47564296:
        raise ValueError(
            "Population total does not match KNBS 2019 county total. "
            f"Expected 47,564,296, found {population_total:,}."
        )

    return population_df.reset_index(drop=True)


df_population = load_population_data()


def _build_access_density_df():
    facility_totals = (
        df.groupby("_county_canonical")
        .agg(total_facilities=("Facility Code", "count"))
        .reset_index()
        .rename(columns={"_county_canonical": "county"})
    )

    public_facilities = (
        df[
            df["Ownership Category"]
            .fillna("")
            .astype(str)
            .str.strip()
            == "Public"
        ]
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
        raise ValueError(
            "Population join failed. Counties missing population data: "
            f"{unmatched['county'].tolist()}"
        )

    access_density["public_facilities"] = access_density[
        "public_facilities"
    ].fillna(0)
    access_density["art_facilities"] = access_density["art_facilities"].fillna(0)

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
        raise ValueError("Access-density calculation produced NaN values.")

    if not np.isfinite(access_density[metric_columns].to_numpy(dtype=float)).all():
        raise ValueError("Access-density calculation produced infinite values.")

    return access_density


def _validate_startup_data():
    facility_counties = sorted(df["_county_canonical"].dropna().unique().tolist())
    population_counties = sorted(
        df_population["county_canonical"].dropna().unique().tolist()
    )

    if len(facility_counties) != 47:
        raise ValueError(
            f"Expected 47 facility counties, found {len(facility_counties)}: "
            f"{facility_counties}"
        )

    if len(population_counties) != 47:
        raise ValueError(
            f"Expected 47 population counties, found {len(population_counties)}: "
            f"{population_counties}"
        )

    missing_in_population = sorted(set(facility_counties) - set(population_counties))
    extra_in_population = sorted(set(population_counties) - set(facility_counties))

    if missing_in_population or extra_in_population:
        raise ValueError(
            "County normalization mismatch. "
            f"Missing in population: {missing_in_population}. "
            f"Extra in population: {extra_in_population}."
        )

    ownership_values = sorted(
        df["Ownership Category"].dropna().astype(str).str.strip().unique().tolist()
    )

    if "Public" not in ownership_values:
        raise ValueError(
            "Expected 'Public' in Ownership Category values. Found: "
            f"{ownership_values}"
        )

    if "ART" not in df.columns:
        raise ValueError("Expected ART column in facilities dataset.")

    if not pd.api.types.is_bool_dtype(df["ART"]):
        raise ValueError(f"Expected ART column to be boolean. Found: {df['ART'].dtype}")

    access_density = _build_access_density_df()

    if len(access_density) != 47:
        raise ValueError(
            f"Expected 47 access-density rows, found {len(access_density)}"
        )

    print(f"✓ Facilities loaded: {len(df)} records, {len(facility_counties)} counties")
    print(f"✓ Population loaded: {len(population_counties)} counties")
    print("✓ County join: 47/47 matched, 0 unmatched")
    print("✓ Public ownership category confirmed")
    print("✓ ART boolean column confirmed")
    print("✓ Access density calculated")


_validate_startup_data()




def get_summary():
    return {
        "total_facilities": len(df),
        "counties_covered": int(df["County"].nunique()),
        "provinces_covered": int(df["Province"].nunique()),
        "facility_types": int(df["Facility Category"].nunique()),
        "ownership_categories": int(df["Ownership Category"].nunique()),
    }


def get_ownership_breakdown():
    ownership_counts = df["Ownership Category"].value_counts().reset_index()
    ownership_counts.columns = ["category", "count"]
    return ownership_counts.to_dict(orient="records")


def get_facility_type_breakdown():
    facility_type_counts = df["Facility Category"].value_counts().reset_index()
    facility_type_counts.columns = ["category", "count"]
    return facility_type_counts.to_dict(orient="records")


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
    county_data = county_data.sort_values("total", ascending=False)

    return county_data.to_dict(orient="records")


def get_service_breakdown():
    service_columns = {
        "FP": "fp",
        "IPD": "ipd",
        "HBC": "hbc",
        "C-IMCI": "c_imci",
        "ART": "art",
    }

    county_totals = (
        df.groupby("County")
        .agg(total=("Facility Code", "count"))
        .reset_index()
    )

    service_data = county_totals.copy()

    for original_column, clean_name in service_columns.items():
        service_counts = (
            df.groupby("County")[original_column]
            .sum()
            .reset_index()
            .rename(columns={original_column: clean_name})
        )

        service_data = service_data.merge(service_counts, on="County", how="left")

    service_data = service_data.rename(columns={"County": "county"})
    service_data = service_data.fillna(0)
    service_data = service_data.sort_values("total", ascending=False)

    return service_data.to_dict(orient="records")

def get_service_gap_score():
    service_data = pd.DataFrame(get_service_breakdown())

    service_columns = ["fp", "ipd", "hbc", "c_imci", "art"]

    for column in service_columns:
        service_data[f"{column}_coverage"] = (
            service_data[column] / service_data["total"] * 100
        ).round(1)

    service_data["coverage_score"] = (
        service_data[
            [
                "fp_coverage",
                "ipd_coverage",
                "hbc_coverage",
                "c_imci_coverage",
                "art_coverage",
            ]
        ]
        .mean(axis=1)
        .round(1)
    )

    service_data = service_data.sort_values("coverage_score", ascending=True)

    return service_data[
        [
            "county",
            "total",
            "fp_coverage",
            "ipd_coverage",
            "hbc_coverage",
            "c_imci_coverage",
            "art_coverage",
            "coverage_score",
        ]
    ].to_dict(orient="records")



def get_population_data():
    population_data = df_population.copy()
    population_data["county"] = population_data["county_canonical"]

    return population_data[
        [
            "county",
            "population_2019",
            "households_2019",
            "area_km2",
            "density_per_km2",
        ]
    ].sort_values("county").to_dict(orient="records")


def get_access_density():
    access_density = _build_access_density_df()

    access_density = access_density[
        [
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
    ]

    access_density = access_density.sort_values(
        "facilities_per_100k_population",
        ascending=True,
    ).reset_index(drop=True)

    return access_density.to_dict(orient="records")


def apply_facility_filters(
    source_df,
    county=None,
    ownership=None,
    facility_type=None,
    status=None,
    search=None,
):
    filtered_df = source_df.copy()

    if county:
        filtered_df = filtered_df[
            filtered_df["County"].str.lower() == county.lower()
        ]

    if ownership:
        filtered_df = filtered_df[
            filtered_df["Ownership Category"].str.lower() == ownership.lower()
        ]

    if facility_type:
        filtered_df = filtered_df[
            filtered_df["Facility Category"].str.lower() == facility_type.lower()
        ]

    if status:
        filtered_df = filtered_df[
            filtered_df["Operational Status"].str.lower() == status.lower()
        ]

    if search:
        filtered_df = filtered_df[
            filtered_df["Facility Name"]
            .str.lower()
            .str.contains(search.lower(), na=False)
        ]

    return filtered_df


def get_facilities(
    county=None,
    ownership=None,
    facility_type=None,
    status=None,
    search=None,
    page=1,
    page_size=20,
):
    filtered_df = apply_facility_filters(
        df,
        county=county,
        ownership=ownership,
        facility_type=facility_type,
        status=status,
        search=search,
    )

    total = len(filtered_df)

    start = (page - 1) * page_size
    end = start + page_size

    results_df = filtered_df.iloc[start:end]

    columns_to_return = [
        "Facility Code",
        "Facility Name",
        "County",
        "District",
        "Facility Category",
        "Ownership Category",
        "Beds",
        "Operational Status",
    ]

    results_df = results_df[columns_to_return].copy()

    results_df = results_df.rename(
        columns={
            "Facility Code": "facility_code",
            "Facility Name": "facility_name",
            "County": "county",
            "District": "district",
            "Facility Category": "facility_category",
            "Ownership Category": "ownership_category",
            "Beds": "beds",
            "Operational Status": "operational_status",
        }
    )

    results_df = results_df.fillna("")

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "results": results_df.to_dict(orient="records"),
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

    columns_to_export = [
        "Facility Code",
        "Facility Name",
        "County",
        "District",
        "Facility Category",
        "Ownership Category",
        "Beds",
        "Operational Status",
    ]

    export_df = filtered_df[columns_to_export].copy()
    export_df = export_df.fillna("")

    return export_df