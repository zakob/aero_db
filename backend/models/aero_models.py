from pydantic import BaseModel, Field
from typing import Optional
from datetime import date as type_date
from .base import BaseResponse

# Source models
class SourceCreate(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    remark: Optional[str] = None

class SourceUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    remark: Optional[str] = None

class SourceResponse(BaseResponse):
    name: str
    description: Optional[str] = None
    remark: Optional[str] = None

# Object models
class ObjectCreate(BaseModel):
    name: str = Field(..., max_length=100)
    photo: Optional[str] = None
    description: Optional[str] = None

class ObjectResponse(BaseResponse):
    name: str
    photo: Optional[str] = None
    description: Optional[str] = None

# People models
class PeopleCreate(BaseModel):
    first_name: str = Field(..., max_length=45)
    second_name: str = Field(..., max_length=45)
    patronymic: Optional[str] = Field(None, max_length=45)

class PeopleResponse(BaseResponse):
    first_name: str
    second_name: str
    patronymic: Optional[str] = None

# Geometry models
class GeometryCreate(BaseModel):
    path_to_geometry: str
    name: str
    id_people: Optional[int] = None
    charateristic_area: Optional[float] = None
    charateristic_length: Optional[float] = None
    producer: Optional[str] = Field(None, max_length=128)

class GeometryResponse(BaseResponse):
    path_to_geometry: str
    name: str
    id_people: Optional[int] = None
    charateristic_area: Optional[float] = None
    charateristic_length: Optional[float] = None
    producer: Optional[str] = None

# Report models
class ReportCreate(BaseModel):
    name: str
    date: type_date
    path_to_report: Optional[str] = None
    id_people: Optional[int] = None

class ReportResponse(BaseResponse):
    name: str
    date: type_date
    path_to_report: Optional[str] = None
    id_people: Optional[int] = None

# Start (Experiment) models
class StartCreate(BaseModel):
    id_source: int
    id_source_version: Optional[int] = None
    id_object: int
    id_object_version: Optional[int] = None
    id_geometry: int
    id_geometry_version: Optional[int] = None
    id_report: int
    id_report_version: Optional[int] = None
    type: Optional[str] = Field(None, max_length=45)
    mach: Optional[float] = None
    reynolds_number: Optional[float] = None
    date: Optional[type_date] = None

class StartResponse(BaseResponse):
    id_source: int
    id_source_version: Optional[int] = None
    id_object: int
    id_object_version: Optional[int] = None
    id_geometry: int
    id_geometry_version: Optional[int] = None
    id_report: int
    id_report_version: Optional[int] = None
    type: Optional[str] = None
    mach: Optional[float] = None
    reynolds_number: Optional[float] = None
    date: Optional[type_date] = None

# Base (Conditions) models
class BaseCreate(BaseModel):
    id_start: int
    alpha: Optional[float] = None
    beta: Optional[float] = None
    alpha_p: Optional[float] = None
    phi_p: Optional[float] = None

class BaseResponse(BaseResponse):
    id_start: int
    alpha: Optional[float] = None
    beta: Optional[float] = None
    alpha_p: Optional[float] = None
    phi_p: Optional[float] = None

# Total aerodynamic coefficients models
class TotalAdhCreate(BaseModel):
    id_base: int
    cx: float
    cy: float
    cz: float
    cxa: Optional[float] = None
    cya: Optional[float] = None
    cza: Optional[float] = None
    mx: float
    my: float
    mz: float
    k: float

class TotalAdhResponse(BaseResponse):
    id_base: int
    cx: float
    cy: float
    cz: float
    cxa: Optional[float] = None
    cya: Optional[float] = None
    cza: Optional[float] = None
    mx: float
    my: float
    mz: float
    k: float

# Drainage points models
class DrainagePointCreate(BaseModel):
    id_geometry: int
    n: Optional[int] = None
    x: float
    y: float
    z: float

class DrainagePointResponse(BaseResponse):
    id_geometry: int
    n: Optional[int] = None
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
    mach: Optional[float]
    reynolds_number: Optional[float]
    alpha_p: Optional[float]
    phi_p: Optional[float]
    cx: float
    cy: float
    mz: float