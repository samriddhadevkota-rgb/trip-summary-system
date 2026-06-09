from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    billing_address = Column(String)
    email = Column(String)

    ship_tos = relationship("ShipTo", back_populates="customer")


class ShipTo(Base):
    __tablename__ = "ship_tos"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    name = Column(String)
    address = Column(String)

    customer = relationship("Customer", back_populates="ship_tos")
