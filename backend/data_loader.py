import pandas as pd
from pathlib import Path

DATA_FILE = Path(__file__).parent / "data" / "cleaned_health_facilities_kenya.xlsx"

df = pd.read_excel(DATA_FILE)


def get_summary():
    return {
        "total_facilities": len(df),
        "counties_covered": int(df["County"].nunique()),
        "provinces_covered": int(df["Province"].nunique()),
        "facility_types": int(df["Facility Category"].nunique()),
        "ownership_categories": int(df["Ownership Category"].nunique()),
    }


def get_ownership_breakdown():
    ownership_counts = (
        df["Ownership Category"]
        .value_counts()
        .reset_index()
    )

    ownership_counts.columns = ["category", "count"]

    return ownership_counts.to_dict(orient="records")

def get_facility_type_breakdown():
    facility_type_counts = (
        df["Facility Category"]
        .value_counts()
        .reset_index()
    )

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
            fill_value=0
        )
        .reset_index()
    )

    county_data = county_group.merge(
        ownership_pivot,
        on="County",
        how="left"
    )

    county_data = county_data.rename(columns={
        "County": "county",
        "Province": "province",
        "Public": "public",
        "Private": "private",
        "Faith-Based": "faith_based",
        "NGO": "ngo",
        "Community": "community",
        "Academic": "academic",
    })

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

        service_data = service_data.merge(
            service_counts,
            on="County",
            how="left"
        )

    service_data = service_data.rename(columns={
        "County": "county"
    })

    service_data = service_data.fillna(0)
    service_data = service_data.sort_values("total", ascending=False)

    return service_data.to_dict(orient="records")

def get_facilities(
    county=None,
    ownership=None,
    facility_type=None,
    status=None,
    search=None,
    page=1,
    page_size=20
):
    filtered_df = df.copy()

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

    results_df = results_df.rename(columns={
        "Facility Code": "facility_code",
        "Facility Name": "facility_name",
        "County": "county",
        "District": "district",
        "Facility Category": "facility_category",
        "Ownership Category": "ownership_category",
        "Beds": "beds",
        "Operational Status": "operational_status",
    })

    results_df = results_df.fillna("")

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "results": results_df.to_dict(orient="records")
    }