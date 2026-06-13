from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
import os
from datetime import datetime

OUTPUT_DIR = "generated_documents"
LOGO_PATH = "assets/logo.png"
TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Jinja2 environment — loads templates from the templates/ folder
env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))


def _render_pdf(template_name, context, output_path):
    """Render a Jinja2 HTML template and convert it to PDF using WeasyPrint."""
    template = env.get_template(template_name)
    html_string = template.render(**context)
    HTML(string=html_string, base_url=os.path.abspath(".")).write_pdf(output_path)
    return output_path


def generate_invoice_pdf(config, invoice_number, db=None, template=None):
    filename = f"{OUTPUT_DIR}/invoice_{invoice_number}.pdf"

    show_logo       = template.show_logo          if template else True
    show_fees       = template.show_fees          if template else True
    show_taxes      = template.show_taxes         if template else True
    show_due_date   = template.show_due_date      if template else True
    show_delivery_date = template.show_delivery_date if template else True
    show_customer_name = template.show_customer_name if template else True
    show_ship_to    = template.show_ship_to       if template else True

    # Build products list with real names
    products = []
    subtotal = 0
    for p in config.products:
        name  = _get_product_name(db, p["product_id"]) if db else f"Product {p['product_id']}"
        total = p["quantity"] * p["rate"]
        subtotal += total
        products.append({"name": name, "quantity": p["quantity"], "rate": p["rate"], "total": total})

    # Build fees list
    fees = []
    total_fees = 0
    if show_fees and config.fees:
        for f in config.fees:
            name  = _get_fee_name(db, f["fee_id"]) if db else f"Fee {f['fee_id']}"
            total = f["quantity"] * f["rate"]
            total_fees += total
            fees.append({"name": name, "quantity": f["quantity"], "rate": f["rate"], "total": total})

    # Build taxes list
    taxes = []
    total_tax = 0
    if show_taxes and config.taxes:
        for t in config.taxes:
            info   = _get_tax_info(db, t["tax_id"]) if db else {"name": f"Tax {t['tax_id']}", "percentage": 0}
            amount = subtotal * (info["percentage"] / 100)
            total_tax += amount
            taxes.append({"name": info["name"], "percentage": info["percentage"], "amount": amount})

    context = {
        "show_logo":           show_logo,
        "show_fees":           show_fees,
        "show_taxes":          show_taxes,
        "show_due_date":       show_due_date,
        "show_delivery_date":  show_delivery_date,
        "show_customer_name":  show_customer_name,
        "show_ship_to":        show_ship_to,
        "logo_path":           os.path.abspath(LOGO_PATH) if os.path.exists(LOGO_PATH) else None,
        "invoice_number":      invoice_number,
        "invoice_date":        datetime.now().strftime("%Y-%m-%d"),
        "due_date":            datetime.now().strftime("%Y-%m-%d"),
        "delivery_date":       datetime.now().strftime("%Y-%m-%d"),
        "customer":            config.customer,
        "shipto":              config.shipto,
        "products":            products,
        "fees":                fees,
        "taxes":               taxes,
        "subtotal":            subtotal,
        "total_fees":          total_fees,
        "total_tax":           total_tax,
        "grand_total":         subtotal + total_fees + total_tax,
    }

    return _render_pdf("invoice.html", context, filename)


def generate_delivery_ticket_pdf(config, delivery_number, db=None, template=None):
    filename = f"{OUTPUT_DIR}/delivery_ticket_{delivery_number}.pdf"

    show_logo               = template.show_logo               if template else True
    show_delivery_address   = template.show_delivery_address   if template else True
    show_delivery_timestamp = template.show_delivery_timestamp if template else True

    products = []
    for p in config.products:
        name = _get_product_name(db, p["product_id"]) if db else f"Product {p['product_id']}"
        products.append({"name": name, "quantity": p["quantity"]})

    context = {
        "show_logo":               show_logo,
        "show_delivery_address":   show_delivery_address,
        "show_delivery_timestamp": show_delivery_timestamp,
        "logo_path":               os.path.abspath(LOGO_PATH) if os.path.exists(LOGO_PATH) else None,
        "delivery_number":         delivery_number,
        "delivery_date":           datetime.now().strftime("%Y-%m-%d"),
        "delivery_timestamp":      datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "customer":                config.customer,
        "shipto":                  config.shipto,
        "products":                products,
    }

    return _render_pdf("delivery_ticket.html", context, filename)


def generate_freight_invoice_pdf(config, invoice_number, db=None, template=None):
    filename = f"{OUTPUT_DIR}/freight_invoice_{invoice_number}.pdf"

    show_logo           = template.show_logo           if template else True
    show_vendor_address = template.show_vendor_address if template else True

    categories = []
    subtotal = 0
    for c in config.categories:
        name  = _get_category_name(db, c["category_id"]) if db else f"Category {c['category_id']}"
        total = c["quantity"] * c["freight_rate"]
        subtotal += total
        categories.append({"name": name, "quantity": c["quantity"], "freight_rate": c["freight_rate"], "total": total})

    fees = []
    total_fees = 0
    for f in config.fees:
        name  = _get_fee_name(db, f["fee_id"]) if db else f"Fee {f['fee_id']}"
        total = f["quantity"] * f["rate"]
        total_fees += total
        fees.append({"name": name, "quantity": f["quantity"], "rate": f["rate"], "total": total})

    context = {
        "show_logo":           show_logo,
        "show_vendor_address": show_vendor_address,
        "logo_path":           os.path.abspath(LOGO_PATH) if os.path.exists(LOGO_PATH) else None,
        "invoice_number":      invoice_number,
        "invoice_date":        datetime.now().strftime("%Y-%m-%d"),
        "due_date":            datetime.now().strftime("%Y-%m-%d"),
        "vendor":              config.vendor,
        "categories":          categories,
        "fees":                fees,
        "subtotal":            subtotal,
        "total_fees":          total_fees,
        "grand_total":         subtotal + total_fees,
    }

    return _render_pdf("freight_invoice.html", context, filename)


# --- DB lookup helpers ---

def _get_product_name(db, product_id):
    from app.models.product import Product
    p = db.query(Product).filter(Product.id == product_id).first()
    return p.name if p else f"Product {product_id}"

def _get_fee_name(db, fee_id):
    from app.models.fee_tax import Fee
    f = db.query(Fee).filter(Fee.id == fee_id).first()
    return f.name if f else f"Fee {fee_id}"

def _get_tax_info(db, tax_id):
    from app.models.fee_tax import Tax
    t = db.query(Tax).filter(Tax.id == tax_id).first()
    return {"name": t.name, "percentage": t.percentage} if t else {"name": f"Tax {tax_id}", "percentage": 0}

def _get_category_name(db, category_id):
    from app.models.product import ProductCategory
    c = db.query(ProductCategory).filter(ProductCategory.id == category_id).first()
    return c.name if c else f"Category {category_id}"
