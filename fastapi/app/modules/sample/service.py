import uuid
from collections.abc import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.sample.models import Item
from app.modules.sample.schemas.dto import ItemCreateDTO, ItemUpdateDTO


class SampleService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> Sequence[Item]:
        result = await self.db.execute(select(Item).order_by(Item.created_at.desc()))
        return result.scalars().all()

    async def get_by_id(self, item_id: uuid.UUID) -> Item | None:
        return await self.db.get(Item, item_id)

    async def create(self, dto: ItemCreateDTO) -> Item:
        item = Item(**dto.model_dump())
        self.db.add(item)
        await self.db.commit()
        await self.db.refresh(item)
        return item

    async def update(self, item_id: uuid.UUID, dto: ItemUpdateDTO) -> Item | None:
        item = await self.get_by_id(item_id)
        if not item:
            return None

        update_data = dto.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(item, key, value)

        await self.db.commit()
        await self.db.refresh(item)
        return item
