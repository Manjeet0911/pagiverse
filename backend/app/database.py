from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_size=15,
    max_overflow=25,
    pool_recycle=600,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        print(f"!!! Operational database query stream exception interlinked: {str(e)} !!!")
        raise
    finally:
        try:
            db.close()
        except Exception:
            pass