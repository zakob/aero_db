from fastapi import APIRouter, HTTPException, Depends
from backend.models.aero_models import SourceCreate, SourceUpdate, SourceResponse
from backend.models.base import PaginatedResponse, SearchParams
from backend.database.database import db

router = APIRouter(prefix="/sources", tags=["sources"])

@router.get("/", response_model=PaginatedResponse[SourceResponse])
async def get_sources(params: SearchParams = Depends()):
    """Get paginated list of sources"""
    offset = (params.page - 1) * params.page_size
    
    # Build query
    query = "SELECT * FROM aero_db.source"
    count_query = "SELECT COUNT(*) FROM aero_db.source"
    
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
    
    responses = [SourceResponse(**dict(item)) for item in items]
    
    return PaginatedResponse[SourceResponse](
        items=responses,
        total=total,
        page=params.page,
        page_size=params.page_size,
        total_pages=(total + params.page_size - 1) // params.page_size
    )

@router.get("/{source_id}", response_model=SourceResponse)
async def get_source(source_id: int):
    """Get a specific source by ID"""
    query = "SELECT * FROM aero_db.source WHERE id = $1"
    source = await db.fetchrow(query, source_id)
    
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    
    return SourceResponse(**dict(source))

@router.post("/", response_model=SourceResponse)
async def create_source(source: SourceCreate):
    """Create a new source"""
    query = """
        INSERT INTO aero_db.source (name, description, remark)
        VALUES ($1, $2, $3)
        ON CONFLICT (name)
        DO NOTHING
        RETURNING *
    """
    try:
        result = await db.fetchrow(
            query, 
            source.name, 
            source.description, 
            source.remark
        )
        if result is None:
            results = await get_sources(params=SearchParams(search=source.name))
            result = results.items[0].model_dump()
            print(result)
            print(dict(result))
            result["error_msg"] = "already exists"
        return SourceResponse(**dict(result))
    except Exception as e:
        # if "unique constraint" in str(e).lower():
        #     raise HTTPException(status_code=400, detail="Source with this name already exists")
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{source_id}", response_model=SourceResponse)
async def update_source(source_id: int, source: SourceUpdate):
    """Update an existing source"""
    # Check if source exists
    check_query = "SELECT id FROM aero_db.source WHERE id = $1"
    existing = await db.fetchrow(check_query, source_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Source not found")
    
    # Build update query dynamically
    updates = []
    values = []
    index = 1
    
    if source.name is not None:
        updates.append(f"name = ${index}")
        values.append(source.name)
        index += 1
    if source.description is not None:
        updates.append(f"description = ${index}")
        values.append(source.description)
        index += 1
    if source.remark is not None:
        updates.append(f"remark = ${index}")
        values.append(source.remark)
        index += 1
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    values.append(source_id)
    query = f"""
        UPDATE aero_db.source 
        SET {', '.join(updates)}
        WHERE id = ${index}
        RETURNING *
    """
    
    try:
        result = await db.fetchrow(query, *values)
        return SourceResponse(**dict(result))
    except Exception as e:
        if "unique constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="Source with this name already exists")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{source_id}")
async def delete_source(source_id: int):
    """Delete a source"""
    query = "DELETE FROM aero_db.source WHERE id = $1 RETURNING id"
    result = await db.fetchrow(query, source_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Source not found")
    
    return {"message": "Source deleted successfully"}