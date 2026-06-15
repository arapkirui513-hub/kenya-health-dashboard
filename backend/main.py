import io

from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from data_loader import (
    get_summary,
    get_ownership_breakdown,
    get_facility_type_breakdown,
    get_county_breakdown,
    get_service_breakdown,
    get_facilities,
    get_facilities_export,
    get_service_gap_score,
    get_population_data,
    get_kdhs_indicators,
    get_access_density,
    get_planning_priority_index,
    get_health_need_index,
)


API_VERSION = "v3.0.0"

ALLOWED_ORIGINS = [
    "https://kenya-health-dashboard.vercel.app",
    "http://localhost:5173",
]


limiter = Limiter(key_func=get_remote_address)


app = FastAPI(
    title="Kenya Health Facilities API",
    description="API for analysing Kenya health facilities data",
    version=API_VERSION,
)


app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=[
        "Accept",
        "Content-Type",
    ],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    is_https = request.url.scheme == "https"

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    if is_https:
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
    response.headers["Permissions-Policy"] = (
        "camera=(), microphone=(), geolocation=()"
    )
    response.headers["Cross-Origin-Resource-Policy"] = "same-site"

    return response


@app.get("/")
@limiter.limit("120/minute")
def home(request: Request):
    return {
        "message": "Kenya Health Facilities API is running",
        "version": API_VERSION,
    }


@app.get("/health")
@limiter.limit("120/minute")
def health(request: Request):
    return {
        "status": "ok",
        "service": "Kenya Health Facilities Dashboard API",
        "version": API_VERSION,
    }


@app.get("/summary")
@limiter.limit("60/minute")
def summary(request: Request):
    return get_summary()


@app.get("/ownership")
@limiter.limit("60/minute")
def ownership(request: Request):
    return get_ownership_breakdown()


@app.get("/facility-types")
@limiter.limit("60/minute")
def facility_types(request: Request):
    return get_facility_type_breakdown()


@app.get("/counties")
@limiter.limit("60/minute")
def counties(request: Request):
    return get_county_breakdown()


@app.get("/services")
@limiter.limit("60/minute")
def services(request: Request):
    return get_service_breakdown()


@app.get("/service-gap-score")
@limiter.limit("60/minute")
def service_gap_score(request: Request):
    return get_service_gap_score()


@app.get("/population")
@limiter.limit("60/minute")
def population(request: Request):
    return get_population_data()


@app.get("/kdhs-indicators")
@limiter.limit("60/minute")
def kdhs_indicators(request: Request):
    return get_kdhs_indicators()


@app.get("/health-need-index")
@limiter.limit("60/minute")
def health_need_index(request: Request):
    return get_health_need_index()


@app.get("/access-density")
@limiter.limit("60/minute")
def access_density(request: Request):
    return get_access_density()

@app.get("/planning-priority-index")
@limiter.limit("60/minute")
def planning_priority_index(request: Request):
    return get_planning_priority_index()

@app.get("/facilities/export")
@limiter.limit("10/minute")
def export_facilities(
    request: Request,
    county: str | None = Query(default=None, max_length=100),
    ownership: str | None = Query(default=None, max_length=100),
    facility_type: str | None = Query(default=None, max_length=100),
    status: str | None = Query(default=None, max_length=100),
    search: str | None = Query(default=None, max_length=100),
):
    export_df = get_facilities_export(
        county=county,
        ownership=ownership,
        facility_type=facility_type,
        status=status,
        search=search,
    )

    buffer = io.StringIO()
    export_df.to_csv(buffer, index=False)
    buffer.seek(0)

    headers = {
        "Content-Disposition": (
            'attachment; filename="kenya_health_facilities.csv"'
        ),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store",
    }

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers=headers,
    )


@app.get("/facilities")
@limiter.limit("60/minute")
def facilities(
    request: Request,
    county: str | None = Query(default=None, max_length=100),
    ownership: str | None = Query(default=None, max_length=100),
    facility_type: str | None = Query(default=None, max_length=100),
    status: str | None = Query(default=None, max_length=100),
    search: str | None = Query(default=None, max_length=100),
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
