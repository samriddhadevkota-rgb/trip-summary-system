from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
import os
from datetime import datetime

OUTPUT_DIR = "generated_documents"
os.makedirs(OUTPUT_DIR, exist_ok=True)

styles = getSampleStyleSheet()

def generate_invoice_pdf(config, invoice_number):
    filename = f"{OUTPUT_DIR}/invoice_{invoice_number}.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter)
    elements = []

    # Header
    elements.append(Paragraph("PRODUCT INVOICE", styles["Title"]))
    elements.append(Spacer(1, 0.2 * inch))
    elements.append(Paragraph(f"Invoice Number: {invoice_number}", styles["Normal"]))
    elements.append(Paragraph(f"Invoice Date: {datetime.now().strftime('%Y-%m-%d')}", styles["Normal"]))
    elements.append(Paragraph(f"Customer: {config.customer.name}", styles["Normal"]))
    elements.append(Paragraph(f"Billing Address: {config.customer.billing_address}", styles["Normal"]))
    elements.append(Paragraph(f"Ship To: {config.shipto.name}", styles["Normal"]))
    elements.append(Paragraph(f"Delivery Address: {config.shipto.address}", styles["Normal"]))
    elements.append(Spacer(1, 0.3 * inch))

    # Products Table
    elements.append(Paragraph("Products", styles["Heading2"]))
    product_data = [["Product", "Quantity", "Rate", "Total"]]
    subtotal = 0
    for p in config.products:
        total = p["quantity"] * p["rate"]
        subtotal += total
        product_data.append([
            f"Product {p['product_id']}",
            str(p["quantity"]),
            f"${p['rate']}",
            f"${total:.2f}"
        ])

    product_table = Table(product_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
    product_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
    ]))
    elements.append(product_table)
    elements.append(Spacer(1, 0.2 * inch))

    # Fees Table
    if config.fees:
        elements.append(Paragraph("Fees", styles["Heading2"]))
        fee_data = [["Fee", "Quantity", "Rate", "Total"]]
        total_fees = 0
        for f in config.fees:
            total = f["quantity"] * f["rate"]
            total_fees += total
            fee_data.append([
                f"Fee {f['fee_id']}",
                str(f["quantity"]),
                f"${f['rate']}",
                f"${total:.2f}"
            ])
        fee_table = Table(fee_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
        fee_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(fee_table)
        elements.append(Spacer(1, 0.2 * inch))
    else:
        total_fees = 0

    # Taxes
    total_tax = 0
    if config.taxes:
        elements.append(Paragraph("Taxes", styles["Heading2"]))
        tax_data = [["Tax", "Percentage", "Amount"]]
        for t in config.taxes:
            tax_amount = subtotal * (t.get("percentage", 0) / 100)
            total_tax += tax_amount
            tax_data.append([
                f"Tax {t['tax_id']}",
                f"{t.get('percentage', 0)}%",
                f"${tax_amount:.2f}"
            ])
        tax_table = Table(tax_data, colWidths=[2.5*inch, 2*inch, 2*inch])
        tax_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        elements.append(tax_table)
        elements.append(Spacer(1, 0.2 * inch))

    # Footer
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


def generate_delivery_ticket_pdf(config, delivery_number):
    filename = f"{OUTPUT_DIR}/delivery_ticket_{delivery_number}.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter)
    elements = []

    elements.append(Paragraph("DELIVERY TICKET", styles["Title"]))
    elements.append(Spacer(1, 0.2 * inch))
    elements.append(Paragraph(f"Delivery Number: {delivery_number}", styles["Normal"]))
    elements.append(Paragraph(f"Delivery Date: {datetime.now().strftime('%Y-%m-%d')}", styles["Normal"]))
    elements.append(Paragraph(f"Customer: {config.customer.name}", styles["Normal"]))
    elements.append(Paragraph(f"Delivery Address: {config.shipto.address}", styles["Normal"]))
    elements.append(Spacer(1, 0.3 * inch))

    elements.append(Paragraph("Products", styles["Heading2"]))
    product_data = [["Product", "Quantity Delivered"]]
    for p in config.products:
        product_data.append([
            f"Product {p['product_id']}",
            str(p["quantity"])
        ])

    product_table = Table(product_data, colWidths=[4*inch, 3*inch])
    product_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    elements.append(product_table)
    elements.append(Spacer(1, 0.2 * inch))
    elements.append(Paragraph(f"Delivery Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles["Normal"]))

    doc.build(elements)
    return filename


def generate_freight_invoice_pdf(config, invoice_number):
    filename = f"{OUTPUT_DIR}/freight_invoice_{invoice_number}.pdf"
    doc = SimpleDocTemplate(filename, pagesize=letter)
    elements = []

    elements.append(Paragraph("FREIGHT INVOICE", styles["Title"]))
    elements.append(Spacer(1, 0.2 * inch))
    elements.append(Paragraph(f"Invoice Number: {invoice_number}", styles["Normal"]))
    elements.append(Paragraph(f"Invoice Date: {datetime.now().strftime('%Y-%m-%d')}", styles["Normal"]))
    elements.append(Paragraph(f"Vendor: {config.vendor.name}", styles["Normal"]))
    elements.append(Paragraph(f"Vendor Address: {config.vendor.address}", styles["Normal"]))
    elements.append(Spacer(1, 0.3 * inch))

    elements.append(Paragraph("Freight Charges", styles["Heading2"]))
    category_data = [["Category", "Quantity", "Freight Rate", "Total"]]
    subtotal = 0
    for c in config.categories:
        total = c["quantity"] * c["freight_rate"]
        subtotal += total
        category_data.append([
            f"Category {c['category_id']}",
            str(c["quantity"]),
            f"${c['freight_rate']}",
            f"${total:.2f}"
        ])

    category_table = Table(category_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
    category_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    elements.append(category_table)
    elements.append(Spacer(1, 0.2 * inch))

    total_fees = 0
    if config.fees:
        elements.append(Paragraph("Fees", styles["Heading2"]))
        fee_data = [["Fee", "Quantity", "Rate", "Total"]]
        for f in config.fees:
            total = f["quantity"] * f["rate"]
            total_fees += total
            fee_data.append([
                f"Fee {f['fee_id']}",
                str(f["quantity"]),
                f"${f['rate']}",
                f"${total:.2f}"
            ])
        fee_table = Table(fee_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
        fee_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.darkblue),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
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