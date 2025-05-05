import os
from fastapi import Depends, Form, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm.session import Session
from passlib.context import CryptContext
from jose import ExpiredSignatureError, JWTError, jwt
from datetime import datetime, timedelta
from api import app
from api.db import get_db
from api.models import User

# Хэширование паролей
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Указание на то, где искать токен
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# JWT настройки
SECRET_KEY = os.environ["SECRET"]
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str):
    return pwd_context.hash(password)


def get_user(db: Session, username: str) -> User | None:
    user = db.query(User).filter(User.username == username).first()

    return user


def authenticate_user(db: Session, username: str, password: str) -> User | None:
    user = get_user(db, username)

    if user is None or not verify_password(password, user.hashed_password):
        return None

    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@app.post("/register")
async def register(
    username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)
):
    user = get_user(db=db, username=username)

    if user is not None:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = hash_password(password)

    new_user = User(username=username, hashed_password=hashed_password)

    db.add(new_user)
    db.commit()

    return {"msg": "User registered successfully"}


@app.post("/token")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    access_token = create_access_token(data={"sub": user.username})

    return {"access_token": access_token, "token_type": "bearer"}


def check_token(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")

        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = get_user(db, username)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@app.get("/me")
async def read_users_me(user: User = Depends(check_token)):
    return {"username": user.username}
