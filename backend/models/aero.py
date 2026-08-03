from datetime import date as type_date

from pydantic import BaseModel, Field

from .base import CommonResponse


# Source models
class SourceCreate(BaseModel):
    name: str = Field(..., max_length=100)
    description: str | None = None
    remark: str | None = None

class SourceUpdate(SourceCreate):
    ...

class SourceResponse(CommonResponse):
    name: str
    description: str | None = None
    remark: str | None = None

# Object models
class ObjectCreate(BaseModel):
    name: str = Field(..., max_length=100)
    photo: str | None = None
    description: str | None = None

class ObjectUpdate(ObjectCreate):
    ...

class ObjectResponse(CommonResponse):
    name: str
    photo: str | None = None
    description: str | None = None

# People models
class PeopleCreate(BaseModel):
    first_name: str = Field(..., max_length=45)
    second_name: str = Field(..., max_length=45)
    patronymic: str | None = Field(None, max_length=45)

class PeopleUpdate(PeopleCreate):
    ...

class PeopleResponse(CommonResponse):
    first_name: str
    second_name: str
    patronymic: str | None = None

# Geometry models
class GeometryCreate(BaseModel):
    path_to_geometry: str
    name: str
    id_people: int | None = None
    charateristic_area: float | None = None
    charateristic_length: float | None = None
    producer: str | None = Field(None, max_length=128)

class GeometryUpdate(GeometryCreate):
    ...

class GeometryResponse(CommonResponse):
    path_to_geometry: str
    name: str
    id_people: int | None = None
    charateristic_area: float | None = None
    charateristic_length: float | None = None
    producer: str | None = None

# Report models
class ReportCreate(BaseModel):
    name: str
    date: type_date
    path_to_report: str | None = None
    id_people: int | None = None

class ReportUpdate(ReportCreate):
    ...

class ReportResponse(CommonResponse):
    name: str
    date: type_date
    path_to_report: str | None = None
    id_people: int | None = None

# Start (Experiment) models
class StartCreate(BaseModel):
    id_source: int
    id_source_version: int | None = None
    id_object: int
    id_object_version: int | None = None
    id_geometry: int
    id_geometry_version: int | None = None
    id_report: int | None = None
    id_report_version: int | None = None
    type: str | None = Field(None, max_length=45)
    mach: float | None = None
    reynolds_number: float | None = None
    date: type_date | None = None

class StartResponse(CommonResponse):
    id_source: int
    id_source_version: int | None = None
    id_object: int
    id_object_version: int | None = None
    id_geometry: int
    id_geometry_version: int | None = None
    id_report: int | None = None
    id_report_version: int | None = None
    type: str | None = None
    mach: float | None = None
    reynolds_number: float | None = None
    date: type_date | None = None

# Base (Conditions) models
class BaseCreate(BaseModel):
    id_start: int
    alpha: float | None = None
    beta: float | None = None
    alpha_p: float | None = None
    phi_p: float | None = None

class BaseResponse(CommonResponse):
    id_start: int
    alpha: float | None = None
    beta: float | None = None
    alpha_p: float | None = None
    phi_p: float | None = None

# Total aerodynamic coefficients models
class TotalAdhCreate(BaseModel):
    id_base: int
    cx: float
    cy: float
    cz: float
    cxa: float | None = None
    cya: float | None = None
    cza: float | None = None
    mx: float
    my: float
    mz: float
    k: float

class TotalAdhResponse(CommonResponse):
    id_base: int
    cx: float
    cy: float
    cz: float
    cxa: float | None = None
    cya: float | None = None
    cza: float | None = None
    mx: float
    my: float
    mz: float
    k: float

# Drainage points models
class DrainagePointCreate(BaseModel):
    id_geometry: int
    n: int | None = None
    x: float
    y: float
    z: float

class DrainagePointResponse(BaseResponse):
    id_geometry: int
    n: int | None = None
    x: float
    y: float
    z: float

# Pressure coefficient models
class PressureCoeffCreate(BaseModel):
    id_base: int
    id_drainage_points: int
    value: float

class PressureCoeffResponse(BaseResponse):
    id_base: int
    id_drainage_points: int
    value: float

# View models for complex queries
class AerodynamicDataView(BaseModel):
    start_id: int
    base_id: int
    mach: float | None
    reynolds_number: float | None
    alpha_p: float | None
    phi_p: float | None
    cx: float
    cy: float
    mz: float