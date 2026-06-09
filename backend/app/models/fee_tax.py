from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class Fee(Base):
    __tablename__ = "fees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    default_rate = Column(Float)


class Tax(Base):
    __tablename__ = "taxes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    percentage = Column(Float)
