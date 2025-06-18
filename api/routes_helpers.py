from fastapi import Depends
from sqlalchemy.orm import Session
from api.db import get_db
from api.auth import check_token
from api.models import (
    User,
)
from typing import NamedTuple


class RequestContext(NamedTuple):
    db: Session
    user: User


class RequestPubContext(NamedTuple):
    db: Session


def get_context(
    db: Session = Depends(get_db), user: User = Depends(check_token)
) -> RequestContext:
    return RequestContext(db=db, user=user)


def get_pub_context(
    db: Session = Depends(get_db),
) -> RequestContext:
    return RequestPubContext(db=db)
