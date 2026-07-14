from fastapi import APIRouter, HTTPException, Depends
from backend.models.aero_models import ReportCreate, ReportUpdate, ReportResponse
from backend.models.base import PaginatedResponse, SearchParams
from backend.database.database import db

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/", response_model=PaginatedResponse[ReportResponse])
async def get_reports(params: SearchParams = Depends()):
    """Get paginated list of reports"""
    offset = (params.page - 1) * params.page_size
    
    # Build query
    query = "SELECT * FROM aero_db.report"
    count_query = "SELECT COUNT(*) FROM aero_db.report"
    
    if params.search:
        query += " WHERE name ILIKE $1 OR path_to_report ILIKE $1"
        count_query += " WHERE name ILIKE $1 OR path_to_report ILIKE $1"
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
    
    responses = [ReportResponse(**dict(item)) for item in items]
    
    return PaginatedResponse[ReportResponse](
        items=responses,
        total=total,
        page=params.page,
        page_size=params.page_size,
        total_pages=(total + params.page_size - 1) // params.page_size
    )

@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: int):
    """Get a specific report by ID"""
    query = "SELECT * FROM aero_db.report WHERE id = $1"
    source = await db.fetchrow(query, report_id)
    
    if not source:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return ReportResponse(**dict(source))

@router.post("/", response_model=ReportResponse)
async def create_report(report: ReportCreate):
    """Create a new report"""
    query = """
        INSERT INTO aero_db.report (name, date, path_to_report, id_people)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name)
        DO NOTHING
        RETURNING *
    """
    try:
        result = await db.fetchrow(
            query,
            report.name,
            report.date,
            report.path_to_report,
            report.id_people
        )
        if result is None:
            results = await get_reports(params=SearchParams(search=report.name))
            result = results.items[0].model_dump()
            result["error_msg"] = "already exists"
        return ReportResponse(**dict(result))
    except Exception as e:
        # if "unique constraint" in str(e).lower():
        #     raise HTTPException(status_code=400, detail="Report with this name already exists")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{report_id}", response_model=ReportResponse)
async def update_report(object_id: int, report: ReportUpdate):
    """Update an existing report"""
    # Check if source exists
    check_query = "SELECT id FROM aero_db.report WHERE id = $1"
    existing = await db.fetchrow(check_query, object_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Build update query dynamically
    updates = []
    values = []
    index = 1
    
    if report.name is not None:
        updates.append(f"name = ${index}")
        values.append(report.name)
        index += 1
    if report.date is not None:
        updates.append(f"date = ${index}")
        values.append(report.date)
        index += 1
    if report.path_to_report is not None:
        updates.append(f"path_to_report = ${index}")
        values.append(report.path_to_report)
        index += 1
    if report.id_people is not None:
        updates.append(f"id_people = ${index}")
        values.append(report.id_people)
        index += 1
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    values.append(object_id)
    query = f"""
        UPDATE aero_db.report
        SET {', '.join(updates)}
        WHERE id = ${index}
        RETURNING *
    """
    
    try:
        result = await db.fetchrow(query, *values)
        return ReportResponse(**dict(result))
    except Exception as e:
        if "unique constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="Report with this name already exists")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{report_id}")
async def delete_report(report_id: int):
    """Delete a report"""
    query = "DELETE FROM aero_db.report WHERE id = $1 RETURNING id"
    result = await db.fetchrow(query, report_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {"message": "Report deleted successfully"}