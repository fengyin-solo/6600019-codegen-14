from fastapi import APIRouter, UploadFile, File, Query
from app.services.seismic_service import process_waveform

router = APIRouter()

EVENTS_CATALOG = [
    {"id": "1", "magnitude": 4.2, "depth": 12.5, "origin_time": "2025-01-15T08:23:41Z", "location": "四川雅安"},
    {"id": "2", "magnitude": 3.8, "depth": 8.3, "origin_time": "2025-01-14T14:12:05Z", "location": "云南大理"},
    {"id": "3", "magnitude": 5.1, "depth": 25.0, "origin_time": "2025-01-13T02:45:33Z", "location": "台湾花莲"},
    {"id": "4", "magnitude": 6.0, "depth": 35.0, "origin_time": "2025-01-12T19:08:17Z", "location": "四川康定"},
    {"id": "5", "magnitude": 2.5, "depth": 5.0, "origin_time": "2025-01-11T11:30:00Z", "location": "河北唐山"},
    {"id": "6", "magnitude": 4.8, "depth": 18.6, "origin_time": "2025-01-10T06:55:22Z", "location": "台湾台东"},
    {"id": "7", "magnitude": 3.1, "depth": 10.2, "origin_time": "2025-01-09T22:14:08Z", "location": "云南丽江"},
    {"id": "8", "magnitude": 5.6, "depth": 42.0, "origin_time": "2025-01-08T15:42:51Z", "location": "新疆喀什"},
    {"id": "9", "magnitude": 2.9, "depth": 6.8, "origin_time": "2025-01-07T09:20:33Z", "location": "广东河源"},
    {"id": "10", "magnitude": 4.5, "depth": 15.0, "origin_time": "2025-01-06T03:11:47Z", "location": "四川宜宾"},
    {"id": "11", "magnitude": 3.6, "depth": 22.3, "origin_time": "2025-01-05T17:38:19Z", "location": "甘肃兰州"},
    {"id": "12", "magnitude": 5.3, "depth": 30.0, "origin_time": "2025-01-04T12:05:55Z", "location": "台湾宜兰"},
]


@router.post("/waveform/upload")
async def upload_waveform(file: UploadFile = File(...)):
    content = await file.read()
    result = process_waveform(content, file.filename or "unknown")
    return result


@router.get("/waveform/stations")
def get_stations():
    return [
        {"id": "STA01", "name": "BJI", "latitude": 39.9, "longitude": 116.4, "elevation": 45},
        {"id": "STA02", "name": "SSE", "latitude": 31.2, "longitude": 121.5, "elevation": 10},
    ]


@router.get("/waveform/events")
def get_events(
    min_magnitude: float = Query(None, description="最小震级"),
    max_magnitude: float = Query(None, description="最大震级"),
    min_depth: float = Query(None, description="最小深度(km)"),
    max_depth: float = Query(None, description="最大深度(km)"),
    location: str = Query(None, description="地区关键词"),
):
    results = EVENTS_CATALOG
    if min_magnitude is not None:
        results = [e for e in results if e["magnitude"] >= min_magnitude]
    if max_magnitude is not None:
        results = [e for e in results if e["magnitude"] <= max_magnitude]
    if min_depth is not None:
        results = [e for e in results if e["depth"] >= min_depth]
    if max_depth is not None:
        results = [e for e in results if e["depth"] <= max_depth]
    if location:
        results = [e for e in results if location in e["location"]]
    return results
