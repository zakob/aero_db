from pydantic import BaseModel, EmailStr, Field, field_validator

from .base import CommonResponse


# Схемы для пользователей
class UserBase(BaseModel):
    # email: str = Field(..., min_length=3, max_length=100)  # TODO: валидатор почты
    email: EmailStr = Field(..., min_length=3, max_length=100)
    first_name: str = Field(..., min_length=3, max_length=100)
    last_name: str = Field(..., min_length=3, max_length=100)
    middle_name: str | None = Field(None, min_length=3, max_length=100)

    @field_validator("first_name", "last_name", "middle_name")
    def validate_name(cls, v: str | None):
        if v is None:
            return v
        if not v.replace('_', '').isalnum():
            raise ValueError('Username must contain only letters, numbers and underscore')
        return v

    # @field_validator("email")
    # def validate_email(cls, v: str):
    #     if not v.isemail():
    #         raise ValueError('Invalid email address')
    #     return v


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
    email: str | None = None
