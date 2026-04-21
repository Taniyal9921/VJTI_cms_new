from pydantic import BaseModel, ConfigDict


class LocationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    location_id: int
    building_name: str
    floor_number: str
    room_number: str
    department_id: int
    location_type: str
