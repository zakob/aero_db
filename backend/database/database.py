from contextlib import asynccontextmanager

import asyncpg
from logger.setup import logger

from backend.config import settings

# TODO: нужно добавить поддержку транзакций,
# чтобы была возможность релизовывать бизнес логику внутри транзакции


class Database:
    def __init__(self):
        self.pool: asyncpg.Pool | None = None

    async def connect(self):
        """Create a connection pool to the database"""
        self.pool = await asyncpg.create_pool(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            database=settings.DB_NAME,
            min_size=1,
            max_size=10
        )
        logger.info(f"Connected to database {settings.DB_NAME} on {settings.DB_HOST}:{settings.DB_PORT}")

    async def disconnect(self):
        """Close the connection pool"""
        if self.pool:
            await self.pool.close()
            logger.info("Database connection closed")

    @asynccontextmanager
    async def get_connection(self):
        """Get a database connection from the pool"""
        if not self.pool:
            await self.connect()

        async with self.pool.acquire() as connection:
            yield connection

    async def execute(self, query: str, *args):
        """Execute a query"""
        async with self.get_connection() as conn:
            return await conn.execute(query, *args)

    async def fetch(self, query: str, *args):
        """Fetch multiple rows"""
        async with self.get_connection() as conn:
            return await conn.fetch(query, *args)

    async def fetchrow(self, query: str, *args):
        """Fetch a single row"""
        async with self.get_connection() as conn:
            return await conn.fetchrow(query, *args)

    async def fetchval(self, query: str, *args):
        """Fetch a single value"""
        async with self.get_connection() as conn:
            return await conn.fetchval(query, *args)


# Global database instance
db = Database()
