"""Authentication API Router for Enlight Sales OS."""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models import User
from app.auth.security import hash_password, verify_password, create_access_token, decode_access_token, oauth2_scheme

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


class UserRegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "Dispatch"  # Admin, Accountant, Dispatch


class UserLoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    x_user_role: Optional[str] = Header("Admin", alias="X-User-Role"),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """Dependency that extracts user from JWT Bearer token, falling back to header role for dev mode."""
    if token:
        try:
            payload = decode_access_token(token)
            email: str = payload.get("sub")
            role: str = payload.get("role", "Dispatch")
            if email:
                result = await db.execute(select(User).where(User.email == email))
                user = result.scalar_one_or_none()
                if user:
                    return {
                        "id": str(user.id),
                        "email": user.email,
                        "full_name": user.full_name,
                        "role": user.role,
                    }
        except Exception:
            pass

    # Fallback to dev header or default Admin
    role = (x_user_role or "Admin").strip()
    return {
        "id": "dev-user-id",
        "email": "admin@enlightsales.com",
        "full_name": "System Admin",
        "role": role,
    }


def require_roles(allowed_roles: list):
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user['role']}' is not authorized. Required: {allowed_roles}"
            )
        return current_user
    return role_checker


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="User email already registered")

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": user.email, "role": user.role, "id": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": str(user.id), "email": user.email, "full_name": user.full_name, "role": user.role}
    }


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    token = create_access_token({"sub": user.email, "role": user.role, "id": str(user.id)})
    return TokenResponse(
        access_token=token,
        user={"id": str(user.id), "email": user.email, "full_name": user.full_name, "role": user.role}
    )


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
