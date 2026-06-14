import os
import base64
from cryptography.fernet import Fernet
from dotenv import load_dotenv

load_dotenv()

# Derive a Fernet key from SECRET_KEY so no extra env var is needed
def _get_fernet() -> Fernet:
    secret = os.getenv("SECRET_KEY", "fallback-secret-key-32chars!!!!!")
    # Fernet needs exactly 32 url-safe base64 bytes
    key = base64.urlsafe_b64encode(secret.encode().ljust(32)[:32])
    return Fernet(key)


def encrypt_token(plain_text: str) -> str:
    """Encrypt a refresh token before storing in DB."""
    if not plain_text:
        return plain_text
    return _get_fernet().encrypt(plain_text.encode()).decode()


def decrypt_token(cipher_text: str) -> str:
    """Decrypt a refresh token retrieved from DB."""
    if not cipher_text:
        return cipher_text
    return _get_fernet().decrypt(cipher_text.encode()).decode()
