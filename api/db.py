from sqlalchemy import create_engine

DATABASE_URL = "sqlite:///db.db" 

engine = create_engine(DATABASE_URL)


def get_db():
    from sqlalchemy.orm import sessionmaker
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        yield db
    finally:
        db.close()