from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
import os
from datetime import datetime

OUTPUT_DIR = "generated_documents"
LOGO_PATH = "assets/logo.png"
os.makedirs(OUTPUT_DIR, exist_ok=True)

styles = getSampleStyleSheet()


def _add_logo(elements):
    if os.path.exists(LOGO_PATH):
        logo = Image(LOGO_PATH, width=1.5*inch, height=0.6*inch)
        logo.hAlign = "LEFT"
        elements.append(logo)
        elements.append(Spacer(1, 0.1 * inch))


def generate_invoice_pdf(config, invoice_number, db=None, template=None):
    filename = f"{OUTPUT_DIR}/invoice_{invoice_number}.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter)
    elements = []

    show_logo = template.show_logo if template else True
    show_fees = template.show_fees if template else True
    show_taxes = template.show_taxes if template else True
    show_due_date = template.show_due_date if template else True
    show_delivery_date = template.show_delivery_date if template else True
    show_ship_to = template.show_ship_to if template else True

    if show_logo:
        _add_logo(elements)

    elements.append(Paragraph("PRODUCT INVOICE", styles["Title"]))
    elements.append(Spacer(1, 0.2 * inch))
    elements.append(Paragraph(f"Invoice Number: {invoice_number}", styles["Normal"]))
    elements.append(Paragraph(f"Invoice Date: {datetime.now().strftime('%Y-%m-%d')}", styles["Normal"]))
    if show_due_date:
        elements.append(Paragraph(f"Due Date: {datetime.now().strftime('%Y-%m-%d')}", styles["Normal"]))
    elements.append(Paragraph(f"Customer: {config.customer.name}", styles["Normal"]))
    elements.append(Paragraph(f"Billing Address: {config.customer.billing_address}", styles["Normal"]))
    if show_ship_to:
        elements.append(Paragraph(f"Ship To: {config.shipto.name}", styles["Normal"]))
        elements.append(Paragraph(f"Delivery Address: {config.shipto.address}", styles["Normal"]))
    if show_delivery_date:
        elements.append(Paragraph(f"Delivery Date: {datetime.now().strftime('%Y-%m-%d')}", styles["Normal"]))
    elements.append(Spacer(1, 0.3 * inch))

    elements.append(Paragraph("Products", styles["Heading2"]))
    product_data = [["Product", "Quantity", "Rate", "Total"]]
    subtotal = 0
    for p in config.products:
        product_name = _get_product_name(db, p["product_id"]) if db else f"Product {p['product_id']}"
        total = p["quantity"] * p["rate"]
        subtotal += total
        product_data.append([product_name, str(p["quantity"]), f"${p['rate']:.2f}", f"${total:.2f}"])
    product_table = Table(product_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
    product_table.setStyle(_table_style())
    elements.append(product_table)
    elements.append(Spacer(1, 0.2 * inch))

    total_fees = 0
    if show_fees and config.fees:
        elements.append(Paragraph("Fees", styles["Heading2"]))
        fee_data = [["Fee", "Quantity", "Rate", "Total"]]
        for f in config.fees:
            fee_name = _get_fee_name(db, f["fee_id"]) if db else f"Fee {f['fee_id']}"
            total = f["quantity"] * f["rate"]
            total_fees += total
            fee_data.append([fee_name, str(f["quantity"]), f"${f['rate']:.2f}", f"${total:.2f}"])
        fee_table = Table(fee_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
        fee_table.setStyle(_table_style())
        elements.append(fee_table)
        elements.append(Spacer(1, 0.2 * inch))

    total_tax = 0
    if show_taxes and config.taxes:
        elements.append(Paragraph("Taxes", styles["Heading2"]))
        tax_data = [["Tax", "Percentage", "Amount"]]
        for t in config.taxes:
            tax_info = _get_tax_info(db, t["tax_id"]) if db else {"name": f"Tax {t['tax_id']}", "percentage": t.get("percentage", 0)}
            tax_amount = subtotal * (tax_info["percentage"] / 100)
            total_tax += tax_amount
            tax_data.append([tax_info["name"], f"{tax_info['percentage']}%", f"${tax_amount:.2f}"])
        tax_table = Table(tax_data, colWidths=[2.5*inch, 2*inch, 2*inch])
        tax_table.setStyle(_table_style())
        elements.append(tax_table)
        elements.append(Spacer(1, 0.2 * inch))

    grand_total = subtotal + total_fees + total_tax
    footer_data = [
        ["Subtotal", f"${subtotal:.2f}"],
        ["Total Fees", f"${total_fees:.2f}"],
        ["Total Tax", f"${total_tax:.2f}"],
        ["Grand Total", f"${grand_total:.2f}"],
    ]
    footer_table = Table(footer_data, colWidths=[4*inch, 2*inch])
    footer_table.setStyle(TableStyle([
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("LINEABOVE", (0, -1), (-1, -1), 1, colors.black),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
    ]))
    elements.append(footer_table)
    doc.build(elements)
    return filename


def generate_delivery_ticket_pdf(config, delivery_number, db=None, template=None):
    filename = f"{OUTPUT_DIR}/delivery_ticket_{delivery_number}.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter)
    elements = []

    show_logo = template.show_logo if template else True
    show_delivery_address = template.show_delivery_address if template else True
    show_delivery_timestamp = template.show_delivery_timestamp if template else True

    if show_logo:
        _add_logo(elements)

    elements.append(Paragraph("DELIVERY TICKET", styles["Title"]))
    elements.append(Spacer(1, 0.2 * inch))
    elements.append(Paragraph(f"Delivery Number: {delivery_number}", styles["Normal"]))
    elements.append(Paragraph(f"Delivery Date: {datetime.now().strftime('%Y-%m-%d')}", styles["Normal"]))
    elements.append(Paragraph(f"Customer: {config.customer.name}", styles["Normal"]))
    if show_delivery_address:
        elements.append(Paragraph(f"Delivery Location: {config.shipto.name}", styles["Normal"]))
        elements.append(Paragraph(f"Delivery Address: {config.shipto.address}", styles["Normal"]))
    elements.append(Spacer(1, 0.3 * inch))

    elements.append(Paragraph("Products", styles["Heading2"]))
    product_data = [["Product", "Quantity Delivered"]]
    for p in config.products:
        product_name = _get_product_name(db, p["product_id"]) if db else f"Product {p['product_id']}"
        product_data.append([product_name, str(p["quantity"])])
    product_table = Table(product_data, colWidths=[4*inch, 3*inch])
    product_table.setStyle(_table_style())
    elements.append(product_table)

    if show_delivery_timestamp:
        elements.append(Spacer(1, 0.2 * inch))
        elements.append(Paragraph(f"Delivery Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles["Normal"]))

    doc.build(elements)
    return filename


def generate_freight_invoice_pdf(config, invoice_number, db=None, template=None):
    filename = f"{OUTPUT_DIR}/freight_invoice_{invoice_number}.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter)
    elements = []

    show_logo = template.show_logo if template else True
    show_vendor_address = template.show_vendor_address if template else True

    if show_logo:
        _add_logo(elements)

    elements.append(Paragraph("FREIGHT INVOICE", styles["Title"]))
    elements.append(Spacer(1, 0.2 * inch))
    elements.append(Paragraph(f"Invoice Number: {invoice_number}", styles["Normal"]))
    elements.append(Paragraph(f"Invoice Date: {datetime.now().strftime('%Y-%m-%d')}", styles["Normal"]))
    elements.append(Paragraph(f"Due Date: {datetime.now().strftime('%Y-%m-%d')}", styles["Normal"]))
    elements.append(Paragraph(f"Vendor: {config.vendor.name}", styles["Normal"]))
    if show_vendor_address:
        elements.append(Paragraph(f"Vendor Address: {config.vendor.address}", styles["Normal"]))
    elements.append(Spacer(1, 0.3 * inch))

    elements.append(Paragraph("Freight Charges", styles["Heading2"]))
    category_data = [["Category", "Quantity", "Freight Rate", "Total"]]
    subtotal = 0
    for c in config.categories:
        cat_name = _get_category_name(db, c["category_id"]) if db else f"Category {c['category_id']}"
        total = c["quantity"] * c["freight_rate"]
        subtotal += total
        category_data.append([cat_name, str(c["quantity"]), f"${c['freight_rate']:.4f}", f"${total:.2f}"])
    category_table = Table(category_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
    category_table.setStyle(_table_style())
    elements.append(category_table)
    elements.append(Spacer(1, 0.2 * inch))

    total_fees = 0
    if config.fees:
        elements.append(Paragraph("Fees", styles["Heading2"]))
        fee_data = [["Fee", "Quantity", "Rate", "Total"]]
        for f in config.fees:
            fee_name = _get_fee_name(db, f["fee_id"]) if db else f"Fee {f['fee_id']}"
            total = f["quantity"] * f["rate"]
            total_fees += total
            fee_data.append([fee_name, str(f["quantity"]), f"${f['rate']:.2f}", f"${total:.2f}"])
        fee_table = Table(fee_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
        fee_table.setStyle(_table_style())
        elements.append(fee_table)

    grand_total = subtotal + total_fees
    footer_data = [
        ["Subtotal", f"${subtotal:.2f}"],
        ["Total Fees", f"${total_fees:.2f}"],
        ["Grand Total", f"${grand_total:.2f}"],
    ]
    footer_table = Table(footer_data, colWidths=[4*inch, 2*inch])
    footer_table.setStyle(TableStyle([
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("LINEABOVE", (0, -1), (-1, -1), 1, colors.black),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
    ]))
    elements.append(footer_table)
    doc.build(elements)
    return filename


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

def _table_style():
    return TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
    ])
