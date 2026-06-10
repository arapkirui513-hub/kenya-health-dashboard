from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from data_loader import (
    get_summary,
    get_ownership_breakdown,
    get_facility_type_breakdown,
    get_county_breakdown,
    get_service_breakdown,
    get_facilities,
)

app = FastAPI(
    title="Kenya Health Facilities API",
    description="API for analysing Kenya health facilities data",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Kenya Health Facilities API is running"
    }


@app.get("/summary")
def summary():
    return get_summary()


@app.get("/ownership")
def ownership():
    return get_ownership_breakdown()


@app.get("/facility-types")
def facility_types():
    return get_facility_type_breakdown()


@app.get("/counties")
def counties():
    return get_county_breakdown()


@app.get("/services")
def services():
    return get_service_breakdown()


@app.get("/facilities")
def facilities(
    county: str | None = Query(default=None),
    ownership: str | None = Query(default=None),
    facility_type: str | None = Query(default=None),
    status: str | None = Query(default=None),
    search: str | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
):
    return get_facilities(
        county=county,
        ownership=ownership,
        facility_type=facility_type,
        status=status,
        search=search,
        page=page,
        page_size=page_size,
    )