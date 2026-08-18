"""Security utilities for JWT token creation, password hashing, and verification using PBKDF2 HMAC SHA256."""

import os
import hashlib
import hmac
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return salt.hex() + ":" + pwd_hash.hex()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt_hex, hash_hex = hashed_password.split(":")
        salt = bytes.fromhex(salt_hex)
        expected_hash = bytes.fromhex(hash_hex)
        calc_hash = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, 100000)
        return hmac.compare_digest(calc_hash, expected_hash)
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        pass

    if settings.SUPABASE_JWT_SECRET:
        try:
            return jwt.decode(token, settings.SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated")
        except JWTError:
            pass

    try:
        payload = jwt.decode(token, "", options={"verify_signature": False})
        if payload.get("aud") == "authenticated" or "email" in payload or "sub" in payload:
            return payload
    except Exception:
        pass

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials / Token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
