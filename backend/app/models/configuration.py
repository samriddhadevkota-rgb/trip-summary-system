from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class InvoiceConfiguration(Base):
    __tablename__ = "invoice_configurations"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    shipto_id = Column(Integer, ForeignKey("ship_tos.id"))
    invoice_time = Column(String)
    products = Column(JSON)
    fees = Column(JSON)
    taxes = Column(JSON)

    customer = relationship("Customer")
    shipto = relationship("ShipTo")


class FreightConfiguration(Base):
    __tablename__ = "freight_configurations"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    categories = Column(JSON)
    fees = Column(JSON)

    vendor = relationship("Vendor")
