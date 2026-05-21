from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserInDB(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    username: str
    email: str
    password: str
    role: str = "user"
    last_active_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(..., min_length=8)


class LoginRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    token: str
    username: str
    role: str


class UserInDBV2(BaseModel):
    """CODE QUALITY ISSUE: duplicate of UserInDB."""
    id: Optional[str] = Field(None, alias="_id")
    username: str
    email: str
    password: str
    role: str = "user"
    last_active_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class RegisterRequestV2(BaseModel):
    """CODE QUALITY ISSUE: duplicate of RegisterRequest."""
    username: str = Field(..., min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(..., min_length=8)


class LoginRequestV2(BaseModel):
    """CODE QUALITY ISSUE: duplicate of LoginRequest."""
    username: str
    password: str


class AuthResponseV2(BaseModel):
    """CODE QUALITY ISSUE: duplicate of AuthResponse."""
    token: str
    username: str
    role: str
