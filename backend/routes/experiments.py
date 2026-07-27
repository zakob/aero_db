
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from logger.setup import logger

from backend.database.database import db
from backend.models.aero_models import (
    AerodynamicDataView,
    BaseCreate,
    BaseResponse,
    # ObjectCreate,
    GeometryCreate,
    SourceCreate,
    StartCreate,
    StartResponse,
    TotalAdhCreate,
    TotalAdhResponse,
)
from backend.models.base import PaginatedResponse, SearchParams

# from backend.routes.objects import create_object
from backend.routes.geometries import create_geometry
from backend.routes.sources import create_source
from backend.staff.parse_aero_csv import parse_content_csv

router = APIRouter(prefix="/experiments", tags=["experiments"])

# Start (Experiment) endpoints
@router.get("/starts", response_model=PaginatedResponse[StartResponse])
async def get_starts(params: SearchParams = Depends()):  # noqa: B008
# async def get_starts(params: SearchParams):
    """Get paginated list of experiments (starts)"""
    offset = (params.page - 1) * params.page_size
    
    query = """
        SELECT s.*,
               src.name as source_name,
               obj.name as object_name,
               geo.name as geometry_name,
               rpt.name as report_name
        FROM aero_db.start s
        LEFT JOIN aero_db.source src ON s.id_source = src.id
        LEFT JOIN aero_db.object obj ON s.id_object = obj.id
        LEFT JOIN aero_db.geometry geo ON s.id_geometry = geo.id
        LEFT JOIN aero_db.report rpt ON s.id_report = rpt.id
    """
    
    count_query = """
        SELECT COUNT(*)
        FROM aero_db.start s
        LEFT JOIN aero_db.source src ON s.id_source = src.id
        LEFT JOIN aero_db.object obj ON s.id_object = obj.id
        LEFT JOIN aero_db.geometry geo ON s.id_geometry = geo.id
        LEFT JOIN aero_db.report rpt ON s.id_report = rpt.id
    """
    
    if params.search:
        where_clause = """
            WHERE src.name ILIKE $1
               OR obj.name ILIKE $1
               OR geo.name ILIKE $1
               OR rpt.name ILIKE $1
        """
        search_term = f"%{params.search}%"
        total = await db.fetchval(count_query + where_clause, search_term)
        query += where_clause
        query += f" ORDER BY s.{params.sort_by or 'id'} {params.sort_order or 'DESC'}"
        query += " LIMIT $2 OFFSET $3"
        items = await db.fetch(query, search_term, params.page_size, offset)
    else:
        total = await db.fetchval(count_query)
        query += f" ORDER BY s.{params.sort_by or 'id'} {params.sort_order or 'DESC'}"
        query += " LIMIT $1 OFFSET $2"
        items = await db.fetch(query, params.page_size, offset)
    
    return PaginatedResponse[StartResponse](
        items=[StartResponse(**dict(item)) for item in items],
        total=total,
        page=params.page,
        page_size=params.page_size,
        total_pages=(total + params.page_size - 1) // params.page_size
    )

@router.get("/starts/{start_id}", response_model=StartResponse)
async def get_start(start_id: int):
    """Get a specific experiment by ID"""
    query = """
        SELECT s.*, 
               src.name as source_name,
               obj.name as object_name,
               geo.name as geometry_name,
               rpt.name as report_name
        FROM aero_db.start s
        LEFT JOIN aero_db.source src ON s.id_source = src.id
        LEFT JOIN aero_db.object obj ON s.id_object = obj.id
        LEFT JOIN aero_db.geometry geo ON s.id_geometry = geo.id
        LEFT JOIN aero_db.report rpt ON s.id_report = rpt.id
        WHERE s.id = $1
    """
    start = await db.fetchrow(query, start_id)
    
    if not start:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    return StartResponse(**dict(start))

@router.post("/starts", response_model=StartResponse)
async def create_start(start: StartCreate):
    """Create a new experiment"""
    query = """
        INSERT INTO aero_db.start (
            id_source, id_source_version, id_object, id_object_version,
            id_geometry, id_geometry_version, id_report, id_report_version,
            type, mach, reynolds_number, date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
    """
    try:
        result = await db.fetchrow(
            query,
            start.id_source, start.id_source_version,
            start.id_object, start.id_object_version,
            start.id_geometry, start.id_geometry_version,
            start.id_report, start.id_report_version,
            start.type, start.mach, start.reynolds_number, start.date
        )
        return StartResponse(**dict(result))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Base (Conditions) endpoints
@router.get("/bases/{base_id}", response_model=BaseResponse)
async def get_base(base_id: int):
    """Get base conditions by ID"""
    query = "SELECT * FROM aero_db.base WHERE id = $1"
    base = await db.fetchrow(query, base_id)
    
    if not base:
        raise HTTPException(status_code=404, detail="Base conditions not found")
    
    return BaseResponse(**dict(base))

@router.post("/bases", response_model=BaseResponse)
async def create_base(base: BaseCreate):
    """Create new base conditions"""
    query = """
        INSERT INTO aero_db.base (id_start, alpha, beta, alpha_p, phi_p)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    """
    try:
        result = await db.fetchrow(
            query, base.id_start, base.alpha, base.beta, 
            base.alpha_p, base.phi_p
        )
        return BaseResponse(**dict(result))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Total aerodynamic coefficients endpoints
@router.get("/total-adh/{total_adh_id}", response_model=TotalAdhResponse)
async def get_total_adh(total_adh_id: int):
    """Get total aerodynamic coefficients by ID"""
    query = "SELECT * FROM aero_db.total_adh WHERE id = $1"
    total_adh = await db.fetchrow(query, total_adh_id)
    
    if not total_adh:
        raise HTTPException(status_code=404, detail="Aerodynamic coefficients not found")
    
    return TotalAdhResponse(**dict(total_adh))

@router.post("/total-adh", response_model=TotalAdhResponse)
async def create_total_adh(total_adh: TotalAdhCreate):
    """Create new aerodynamic coefficients"""
    query = """
        INSERT INTO aero_db.total_adh (
            id_base, cx, cy, cz, cxa, cya, cza, mx, my, mz, k
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
    """
    try:
        result = await db.fetchrow(
            query,
            total_adh.id_base, total_adh.cx, total_adh.cy, total_adh.cz,
            total_adh.cxa, total_adh.cya, total_adh.cza,
            total_adh.mx, total_adh.my, total_adh.mz, total_adh.k
        )
        return TotalAdhResponse(**dict(result))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Aerodynamic data views
@router.get("/aerodynamic-data", response_model=list[AerodynamicDataView])
async def get_aerodynamic_data(
    object_id: int | None = None,
    min_mach: float | None = None,
    max_mach: float | None = None
):
    """Get aerodynamic data for visualization"""
    query = """
        SELECT 
            start.id as start_id,
            base.id as base_id,
            start.mach,
            start.reynolds_number,
            base.alpha_p,
            base.phi_p,
            total_adh.cx,
            total_adh.cy,
            total_adh.mz
        FROM aero_db.base
        INNER JOIN aero_db.start ON base.id_start = start.id
        INNER JOIN aero_db.total_adh ON total_adh.id_base = base.id
        WHERE 1=1
    """
    
    params = []
    param_index = 1
    
    if object_id:
        query += f" AND start.id_object = ${param_index}"
        params.append(object_id)
        param_index += 1
    
    if min_mach is not None:
        query += f" AND start.mach >= ${param_index}"
        params.append(min_mach)
        param_index += 1
    
    if max_mach is not None:
        query += f" AND start.mach <= ${param_index}"
        params.append(max_mach)
        param_index += 1
    
    query += " ORDER BY start.mach, base.alpha_p"
    
    items = await db.fetch(query, *params)
    return [AerodynamicDataView(**dict(item)) for item in items]

@router.get("/statistics")
async def get_statistics():
    """Get database statistics"""
    stats = {}
    
    # Count records in main tables
    tables = ['source', 'object', 'geometry', 'report', 'start', 'base', 'total_adh']
    
    for table in tables:
        count = await db.fetchval(f"SELECT COUNT(*) FROM aero_db.{table}")
        stats[table] = count
    
    # Get experiment count by object
    query = """
        SELECT obj.name, COUNT(s.id) as experiment_count
        FROM aero_db.start s
        JOIN aero_db.object obj ON s.id_object = obj.id
        GROUP BY obj.id, obj.name
        ORDER BY experiment_count DESC
        LIMIT 10
    """
    top_objects = await db.fetch(query)
    stats['top_objects'] = [dict(item) for item in top_objects]
    
    # Get mach number range
    mach_stats = await db.fetchrow("""
        SELECT MIN(mach) as min_mach, MAX(mach) as max_mach, AVG(mach) as avg_mach
        FROM aero_db.start WHERE mach IS NOT NULL
    """)
    stats['mach_range'] = dict(mach_stats) if mach_stats else {}
    
    return stats


@router.post("/import_data_from_csv", response_model=bool)
async def import_data_from_csv(
    object_id: int,
    file: UploadFile = File(...)
):
    try:
        # Читаем содержимое файла
        content = await file.read()

        # Проверяем размер файла (например, не более 10 МБ)
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=413,
                detail="Файл слишком большой. Максимальный размер: 10 МБ"
            )

        # Декодируем содержимое
        text_content = content.decode("utf-8")

        metadata, data = parse_content_csv(text_content)

        logger.debug(f"metadata:\n{metadata}")
        # logger.debug(f"data:\n{data}")

        source = await create_source(
            source=SourceCreate(
                name=metadata["Source"],
                description=metadata.get("version", None),
                remark=metadata.get("Tipe", None)
            )
        )

        # object = await create_object(
        #     object=ObjectCreate(
        #         ...
        #     )
        # )

        L = metadata.get("L", None)
        if L:
            try:
                L = float(L)
            except Exception:
                L = None
        else:
            L = None

        S = metadata.get("S", None)
        if S:
            try:
                S = float(S)
            except Exception:
                S = None
        else:
            S = None

        geometry = await create_geometry(
            geometry=GeometryCreate(
                path_to_geometry="",
                name=metadata.get("Geometry", ""),
                charateristic_area=S,
                charateristic_length=L
            )
        )

        # TODO: geometry, report и подумать мб report сделать необязательным ...

        start = await create_start(
            start=StartCreate(
                id_source=source.id,
                id_object=object_id,
                id_geometry=geometry.id,
                mach=metadata.get("M", None),
                reynolds_number=metadata.get("Re_L", None),
                date=metadata.get("Date", None)
            )
        )

        for d in data:
            base = await create_base(
                base=BaseCreate(
                    id_start=start.id,
                    alpha=d.get("Alpha"),
                    beta=d.get("Beta"),
                    alpha_p=d.get("Alpha_p"),
                    phi_p=d.get("Fi")
                )
            )
            adh = await create_total_adh(
                total_adh=TotalAdhCreate(
                    id_base=base.id,
                    cx=d.get("Cx", 0),
                    cy=d.get("Cy", 0),
                    cz=d.get("Cz", 0),
                    cxa=d.get("Cxa"),
                    cya=d.get("Cya"),
                    cza=d.get("Cza"),
                    mx=d.get("mx", 0),
                    my=d.get("my", 0),
                    mz=d.get("mz", 0),
                    k=d.get("K", 0)
                )
            )
            logger.debug(f"adh: {adh}")

        # Логируем информацию о файле
        logger.debug(f"Файл: {file.filename}, Размер: {len(content)} байт, Кодировка: utf-8")

        return True

    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Файл не является текстовым или имеет неподдерживаемую кодировку"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка при обработке файла: {e!s}"
        )
