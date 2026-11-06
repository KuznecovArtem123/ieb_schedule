import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.sample.schemas.dto import ItemCreateDTO, ItemUpdateDTO
from app.modules.sample.schemas.rdo import ItemRDO
from app.modules.sample.service import SampleService

router = APIRouter(prefix="/sample", tags=["Sample Module"])


def get_sample_service(db: AsyncSession = Depends(get_db)) -> SampleService:
    return SampleService(db)


@router.get("/items", response_model=list[ItemRDO])
async def list_items(service: SampleService = Depends(get_sample_service)):
    return await service.get_all()


@router.post("/items", response_model=ItemRDO, status_code=status.HTTP_201_CREATED)
async def create_item(
    dto: ItemCreateDTO,
    service: SampleService = Depends(get_sample_service),
):
    return await service.create(dto)


@router.get("/items/{item_id}", response_model=ItemRDO)
async def get_item(
    item_id: uuid.UUID,
    service: SampleService = Depends(get_sample_service),
):
    item = await service.get_by_id(item_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item


@router.patch("/items/{item_id}", response_model=ItemRDO)
async def update_item(
    item_id: uuid.UUID,
    dto: ItemUpdateDTO,
    service: SampleService = Depends(get_sample_service),
):
    item = await service.update(item_id, dto)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item
