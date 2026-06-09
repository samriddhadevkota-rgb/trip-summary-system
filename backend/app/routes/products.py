from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.product import Product, ProductCategory
from pydantic import BaseModel

router = APIRouter(prefix="/products", tags=["products"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ProductCategoryCreate(BaseModel):
    name: str

class ProductCreate(BaseModel):
    name: str
    product_category_id: int

@router.post("/categories")
def create_category(category: ProductCategoryCreate, db: Session = Depends(get_db)):
    db_category = ProductCategory(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    return db.query(ProductCategory).all()

@router.post("")
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("")
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()

@router.get("/{id}")
def get_product(id: int, db: Session = Depends(get_db)):
    return db.query(Product).filter(Product.id == id).first()

@router.put("/{id}")
def update_product(id: int, product: ProductCreate, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == id).first()
    for key, value in product.dict().items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/{id}")
def delete_product(id: int, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == id).first()
    db.delete(db_product)
    db.commit()
    return {"message": "Deleted"}