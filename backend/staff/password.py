import hashlib
import hmac
import os


def hash_password(password: str) -> tuple:
    """
    Хэширует пароль с использованием PBKDF2.

    Args:
        password: Пароль в открытом виде

    Returns:
        tuple: (salt_hex, hash_hex)
    """
    salt = os.urandom(32)
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode(),
        salt,
        600000,
        dklen=32
    )
    return salt.hex(), key.hex()


def verify_password(password: str, salt_hex: str, key_hex: str) -> bool:
    """
    Проверяет пароль на соответствие хэшу.

    Args:
        password: Проверяемый пароль
        salt_hex: Соль в hex-формате
        key_hex: Хэш в hex-формате

    Returns:
        bool: True, если пароль верный
    """
    salt = bytes.fromhex(salt_hex)
    key = bytes.fromhex(key_hex)
    new_key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 600000, dklen=32)

    # БЕЗОПАСНОЕ сравнение - всегда выполняется за одинаковое время
    return hmac.compare_digest(new_key, key)
