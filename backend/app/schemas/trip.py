from pydantic import BaseModel

class TripCreate(BaseModel):
    driver_name: str
    total_gallons: float
    total_stops: int
    status: str

class TripResponse(BaseModel):
    id: int
    driver_name: str
    total_gallons: float
    total_stops: int
    status: str

    class Config:
        from_attributes = True