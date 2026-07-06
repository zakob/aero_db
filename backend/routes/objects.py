from fastapi import APIRouter, HTTPException, Depends
from backend.models.aero_models import ObjectCreate, ObjectUpdate, ObjectResponse
from backend.models.base import PaginatedResponse, SearchParams
from backend.database.database import db

router = APIRouter(prefix="/objects", tags=["objects"])

@router.get("/", response_model=PaginatedResponse[ObjectResponse])
async def get_objects(params: SearchParams = Depends()):
    """Get paginated list of objects"""
    offset = (params.page - 1) * params.page_size
    
    # Build query
    query = "SELECT * FROM aero_db.object"
    count_query = "SELECT COUNT(*) FROM aero_db.object"
    
    if params.search:
        query += " WHERE name ILIKE $1 OR description ILIKE $1"
        count_query += " WHERE name ILIKE $1 OR description ILIKE $1"
        search_term = f"%{params.search}%"
        total = await db.fetchval(count_query, search_term)
        query += f" ORDER BY {params.sort_by or 'id'} {params.sort_order or 'ASC'}"
        query += " LIMIT $2 OFFSET $3"
        items = await db.fetch(query, search_term, params.page_size, offset)
    else:
        total = await db.fetchval(count_query)
        query += f" ORDER BY {params.sort_by or 'id'} {params.sort_order or 'ASC'}"
        query += " LIMIT $1 OFFSET $2"
        items = await db.fetch(query, params.page_size, offset)
    
    responses = [ObjectResponse(**dict(item)) for item in items]
    
    return PaginatedResponse[ObjectResponse](
        items=responses,
        total=total,
        page=params.page,
        page_size=params.page_size,
        total_pages=(total + params.page_size - 1) // params.page_size
    )

@router.get("/{source_id}", response_model=ObjectResponse)
async def get_object(object_id: int):
    """Get a specific object by ID"""
    query = "SELECT * FROM aero_db.object WHERE id = $1"
    source = await db.fetchrow(query, object_id)
    
    if not source:
        raise HTTPException(status_code=404, detail="Object not found")
    
    return ObjectResponse(**dict(source))

@router.post("/", response_model=ObjectResponse)
async def create_object(object: ObjectCreate):
    """Create a new object"""
    query = """
        INSERT INTO aero_db.object (name, photo, description)
        VALUES ($1, $2, $3)
        RETURNING *
    """
    try:
        result = await db.fetchrow(
            query,
            object.name,
            object.photo,
            object.description
        )
        return ObjectResponse(**dict(result))
    except Exception as e:
        if "unique constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="Object with this name already exists")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{source_id}", response_model=ObjectResponse)
async def update_source(object_id: int, object: ObjectUpdate):
    """Update an existing object"""
    # Check if source exists
    check_query = "SELECT id FROM aero_db.object WHERE id = $1"
    existing = await db.fetchrow(check_query, object_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Object not found")
    
    # Build update query dynamically
    updates = []
    values = []
    index = 1
    
    if object.name is not None:
        updates.append(f"name = ${index}")
        values.append(object.name)
        index += 1
    if object.photo is not None:
        updates.append(f"object = ${index}")
        values.append(object.photo)
        index += 1
    if object.description is not None:
        updates.append(f"description = ${index}")
        values.append(object.description)
        index += 1
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    values.append(object_id)
    query = f"""
        UPDATE aero_db.source 
        SET {', '.join(updates)}
        WHERE id = ${index}
        RETURNING *
    """
    
    try:
        result = await db.fetchrow(query, *values)
        return ObjectResponse(**dict(result))
    except Exception as e:
        if "unique constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="Source with this name already exists")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{source_id}")
async def delete_source(object_id: int):
    """Delete a source"""
    query = "DELETE FROM aero_db.object WHERE id = $1 RETURNING id"
    result = await db.fetchrow(query, object_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Object not found")
    
    return {"message": "Object deleted successfully"}