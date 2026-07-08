from fastapi import APIRouter, HTTPException, Depends
from backend.models.aero_models import GeometryCreate, GeometryUpdate, GeometryResponse
from backend.models.base import PaginatedResponse, SearchParams
from backend.database.database import db

router = APIRouter(prefix="/geometries", tags=["geometries"])

@router.get("/", response_model=PaginatedResponse[GeometryResponse])
async def get_geometries(params: SearchParams = Depends()):
    """Get paginated list of geometries"""
    offset = (params.page - 1) * params.page_size
    
    # Build query
    query = "SELECT * FROM aero_db.geometry"
    count_query = "SELECT COUNT(*) FROM aero_db.geometry"
    
    if params.search:
        query += " WHERE name ILIKE $1 OR path_to_geometry ILIKE $1"
        count_query += " WHERE name ILIKE $1 OR path_to_geometry ILIKE $1"
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
    
    responses = [GeometryResponse(**dict(item)) for item in items]
    
    return PaginatedResponse[GeometryResponse](
        items=responses,
        total=total,
        page=params.page,
        page_size=params.page_size,
        total_pages=(total + params.page_size - 1) // params.page_size
    )

@router.get("/{geometry_id}", response_model=GeometryResponse)
async def get_geometry(geometry_id: int):
    """Get a specific geometry by ID"""
    query = "SELECT * FROM aero_db.geometry WHERE id = $1"
    source = await db.fetchrow(query, geometry_id)
    
    if not source:
        raise HTTPException(status_code=404, detail="Geometry not found")
    
    return GeometryResponse(**dict(source))

@router.post("/", response_model=GeometryResponse)
async def create_geometry(geometry: GeometryCreate):
    """Create a new geometry"""
    query = """
        INSERT INTO aero_db.geometry
        (name, path_to_geometry, id_people, charateristic_area, charateristic_length, producer)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    """
    try:
        result = await db.fetchrow(
            query,
            geometry.name,
            geometry.path_to_geometry,
            geometry.id_people,
            geometry.charateristic_area,
            geometry.charateristic_length,
            geometry.producer
        )
        return GeometryResponse(**dict(result))
    except Exception as e:
        if "unique constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="Geometry with this name already exists")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{geometry_id}", response_model=GeometryResponse)
async def update_geometry(geometry_id: int, geometry: GeometryUpdate):
    """Update an existing geometry"""
    # Check if source exists
    check_query = "SELECT id FROM aero_db.geometry WHERE id = $1"
    existing = await db.fetchrow(check_query, geometry_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Geometry not found")
    
    # Build update query dynamically
    updates = []
    values = []
    index = 1
    
    if geometry.name is not None:
        updates.append(f"name = ${index}")
        values.append(geometry.name)
        index += 1
    if geometry.path_to_geometry is not None:
        updates.append(f"path_to_geometry = ${index}")
        values.append(geometry.path_to_geometry)
        index += 1
    if geometry.id_people is not None:
        updates.append(f"id_people = ${index}")
        values.append(geometry.id_people)
        index += 1
    if geometry.charateristic_area is not None:
        updates.append(f"charateristic_area  = ${index}")
        values.append(geometry.charateristic_area )
        index += 1
    if geometry.charateristic_length is not None:
        updates.append(f"charateristic_length = ${index}")
        values.append(geometry.charateristic_length)
        index += 1
    if geometry.producer is not None:
        updates.append(f"producer  = ${index}")
        values.append(geometry.producer )
        index += 1
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    values.append(geometry_id)
    query = f"""
        UPDATE aero_db.geometry
        SET {', '.join(updates)}
        WHERE id = ${index}
        RETURNING *
    """
    
    try:
        result = await db.fetchrow(query, *values)
        return GeometryResponse(**dict(result))
    except Exception as e:
        if "unique constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="Geometry with this name already exists")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{geometry_id}")
async def delete_geometry(geometry_id: int):
    """Delete a geometry"""
    query = "DELETE FROM aero_db.geometry WHERE id = $1 RETURNING id"
    result = await db.fetchrow(query, geometry_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Geometry not found")
    
    return {"message": "Geometry deleted successfully"}