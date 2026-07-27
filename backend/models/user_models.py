from pydantic import BaseModel, Field
from typing import Optional
from .base import CommonResponse


# Схемы для пользователей
class UserBase(BaseModel):
    email: str = Field(..., min_length=3, max_length=100)  # TODO: валидатор почты
    first_name: str = Field(..., min_length=3, max_length=100)
    last_name: str = Field(..., min_length=3, max_length=100)
    middle_name: Optional[str] = Field(None, min_length=3, max_length=100)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserUpdate(UserCreate):
    ...


class UserResponse(UserBase, CommonResponse):
    is_active: bool


# Схемы для аутентификации
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
