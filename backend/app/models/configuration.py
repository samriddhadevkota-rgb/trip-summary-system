from sqlalchemy import Column, Integer, String, ForeignKey, JSON, Boolean, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
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


class DocumentTemplate(Base):
    __tablename__ = "document_templates"

    id = Column(Integer, primary_key=True, index=True)
    document_type = Column(String)  # invoice, delivery_ticket, freight_invoice
    show_logo = Column(Boolean, default=True)
    show_fees = Column(Boolean, default=True)
    show_taxes = Column(Boolean, default=True)
    show_due_date = Column(Boolean, default=True)
    show_delivery_date = Column(Boolean, default=True)
    show_customer_name = Column(Boolean, default=True)
    show_ship_to = Column(Boolean, default=True)
    show_vendor_address = Column(Boolean, default=True)
    show_product_category = Column(Boolean, default=True)
    show_delivery_timestamp = Column(Boolean, default=True)
    show_delivery_address = Column(Boolean, default=True)


class GeneratedDocument(Base):
    __tablename__ = "generated_documents"

    id = Column(Integer, primary_key=True, index=True)
    document_type = Column(String)
    filename = Column(String)
    config_id = Column(Integer)
    generated_at = Column(DateTime, server_default=func.now())
    email_sent = Column(Boolean, default=False)
    email_to = Column(String, nullable=True)
