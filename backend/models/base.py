from datetime import datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar('T')


class CommonResponse(BaseModel):
    id: int
    error_msg: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class SearchParams(BaseModel):
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
    search: str | None = None
    sort_by: str | None = None
    sort_order: str | None = "asc"