-- -----------------------------------------------------
-- Schema aero_db
-- -----------------------------------------------------

CREATE SCHEMA IF NOT EXISTS aero_db;
SET search_path TO aero_db;

-- -----------------------------------------------------
-- Table aero_db.source
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS source (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  remark TEXT,
  CONSTRAINT source_name_unique UNIQUE (name)
);

COMMENT ON TABLE source IS 'Таблица источников';
COMMENT ON COLUMN source.id IS 'Идентификатор источника';
COMMENT ON COLUMN source.name IS 'Название источника';
COMMENT ON COLUMN source.description IS 'Описание источника';
COMMENT ON COLUMN source.remark IS 'Заметка';


-- -----------------------------------------------------
-- Table aero_db.object
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS "object" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  photo TEXT,
  description TEXT,
  CONSTRAINT object_name_unique UNIQUE (name)
);

COMMENT ON TABLE "object" IS '';
COMMENT ON COLUMN object.id IS '';
COMMENT ON COLUMN object.name IS '';
COMMENT ON COLUMN object.photo IS '';
COMMENT ON COLUMN object.description IS '';


-- -----------------------------------------------------
-- Table aero_db.people
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS people (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(45) NOT NULL,
  second_name VARCHAR(45) NOT NULL,
  patronymic VARCHAR(45)
);

COMMENT ON TABLE people IS 'Таблица людей';
COMMENT ON COLUMN people.id IS 'Идентификатор человека';
COMMENT ON COLUMN people.first_name IS 'Имя';
COMMENT ON COLUMN people.second_name IS 'Фамилия';
COMMENT ON COLUMN people.patronymic IS 'Отчество';


-- -----------------------------------------------------
-- Table aero_db.geometry
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS geometry (
  id SERIAL PRIMARY KEY,
  path_to_geometry TEXT NOT NULL,
  name TEXT NOT NULL,
  id_people INT,
  charateristic_area FLOAT,
  charateristic_length FLOAT,
  producer VARCHAR(128),
  CONSTRAINT geometry_name_unique UNIQUE (name),
  CONSTRAINT fk_geometry_people
    FOREIGN KEY (id_people)
    REFERENCES people (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE INDEX idx_geometry_people ON geometry (id_people);

COMMENT ON TABLE geometry IS 'Таблица геометрических моделей';
COMMENT ON COLUMN geometry.id IS 'Идентификатор записи о геометрической модели';
COMMENT ON COLUMN geometry.path_to_geometry IS 'Путь до геометрии';
COMMENT ON COLUMN geometry.name IS 'Название геометрии';
COMMENT ON COLUMN geometry.id_people IS 'Идентификатор человека';
COMMENT ON COLUMN geometry.charateristic_area IS 'Характерная площадь';
COMMENT ON COLUMN geometry.charateristic_length IS 'Характерный размер';
COMMENT ON COLUMN geometry.producer IS 'Производитель';


-- -----------------------------------------------------
-- Table aero_db.report
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS report (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  path_to_report TEXT,
  id_people INT,
  CONSTRAINT fk_report_people
    FOREIGN KEY (id_people)
    REFERENCES people (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE INDEX idx_report_people ON report (id_people);

COMMENT ON TABLE report IS '';
COMMENT ON COLUMN report.id IS '';
COMMENT ON COLUMN report.name IS '';
COMMENT ON COLUMN report.date IS '';
COMMENT ON COLUMN report.path_to_report IS '';
COMMENT ON COLUMN report.id_people IS '';


-- -----------------------------------------------------
-- Table aero_db.source_version
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS source_version (
  id SERIAL PRIMARY KEY,
  id_source INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  remark TEXT,
  CONSTRAINT source_version_name_unique UNIQUE (name),
  CONSTRAINT fk_source_version_source
    FOREIGN KEY (id_source)
    REFERENCES source (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE INDEX idx_source_version_source ON source_version (id_source);

COMMENT ON TABLE source_version IS '';
COMMENT ON COLUMN source_version.id IS '';
COMMENT ON COLUMN source_version.id_source IS '';
COMMENT ON COLUMN source_version.name IS '';
COMMENT ON COLUMN source_version.description IS '';
COMMENT ON COLUMN source_version.remark IS '';


-- -----------------------------------------------------
-- Table aero_db.geometry_version
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS geometry_version (
  id SERIAL PRIMARY KEY,
  id_geometry INT NOT NULL,
  path_to_geometry_version TEXT NOT NULL,
  name VARCHAR(45) NOT NULL,
  remark TEXT,
  CONSTRAINT fk_geometry_version
    FOREIGN KEY (id_geometry)
    REFERENCES geometry (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE INDEX idx_geometry_version_geometry ON geometry_version (id_geometry);

COMMENT ON TABLE geometry_version IS '';
COMMENT ON COLUMN geometry_version.id IS '';
COMMENT ON COLUMN geometry_version.id_geometry IS '';
COMMENT ON COLUMN geometry_version.path_to_geometry_version IS '';
COMMENT ON COLUMN geometry_version.name IS '';
COMMENT ON COLUMN geometry_version.remark IS '';


-- -----------------------------------------------------
-- Table aero_db.object_version
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS object_version (
  id SERIAL PRIMARY KEY,
  id_object INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  remark TEXT,
  CONSTRAINT object_version_name_unique UNIQUE (name),
  CONSTRAINT fk_object_version_object
    FOREIGN KEY (id_object)
    REFERENCES object (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE INDEX idx_object_version_object ON object_version (id_object);

COMMENT ON TABLE object_version IS '';
COMMENT ON COLUMN object_version.id IS '';
COMMENT ON COLUMN object_version.id_object IS '';
COMMENT ON COLUMN object_version.name IS '';
COMMENT ON COLUMN object_version.description IS '';
COMMENT ON COLUMN object_version.remark IS '';


-- -----------------------------------------------------
-- Table aero_db.report_version
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS report_version (
  id SERIAL PRIMARY KEY,
  id_report INT NOT NULL,
  Name TEXT NOT NULL,
  CONSTRAINT fk_report_version_report
    FOREIGN KEY (id_report)
    REFERENCES report (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE INDEX idx_report_version_report ON report_version (id_report);

COMMENT ON TABLE report_version IS '';
COMMENT ON COLUMN report_version.id IS '';
COMMENT ON COLUMN report_version.id_report IS '';
COMMENT ON COLUMN report_version.name IS '';


-- -----------------------------------------------------
-- Table aero_db.start
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS "start" (
  id SERIAL PRIMARY KEY,
  id_source INT NOT NULL,
  id_source_version INT,
  id_object INT NOT NULL,
  id_object_version INT,
  id_geometry INT NOT NULL,
  id_geometry_version INT,
  id_report INT,
  id_report_version INT,
  type VARCHAR(45),
  mach FLOAT,
  reynolds_number FLOAT,
  date DATE,
  CONSTRAINT fk_start_source
    FOREIGN KEY (id_source)
    REFERENCES source (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_start_object
    FOREIGN KEY (id_object)
    REFERENCES object (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_start_geomtry
    FOREIGN KEY (id_geometry)
    REFERENCES geometry (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_start_report
    FOREIGN KEY (id_report)
    REFERENCES report (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_start_source_version
    FOREIGN KEY (id_source_version)
    REFERENCES source_version (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_start_geometry_version
    FOREIGN KEY (id_geometry_version)
    REFERENCES geometry_version (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_start_object_version
    FOREIGN KEY (id_object_version)
    REFERENCES object_version (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_start_report_version
    FOREIGN KEY (id_report_version)
    REFERENCES report_version (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE INDEX idx_start_source ON start (id_source);
CREATE INDEX idx_start_object ON start (id_object);
CREATE INDEX idx_start_geometry ON start (id_geometry);
CREATE INDEX idx_start_report ON start (id_report);
CREATE INDEX idx_start_source_version ON start (id_source_version);
CREATE INDEX idx_start_geometry_version ON start (id_geometry_version);
CREATE INDEX idx_start_object_version ON start (id_object_version);
CREATE INDEX idx_start_report_version ON start (id_report_version);

COMMENT ON TABLE start IS '';
COMMENT ON COLUMN start.id IS '';
COMMENT ON COLUMN start.id_source IS '';
COMMENT ON COLUMN start.id_source_version IS '';
COMMENT ON COLUMN start.id_object IS '';
COMMENT ON COLUMN start.id_object_version IS '';
COMMENT ON COLUMN start.id_geometry IS '';
COMMENT ON COLUMN start.id_geometry_version IS '';
COMMENT ON COLUMN start.id_report IS '';
COMMENT ON COLUMN start.id_report_version IS '';
COMMENT ON COLUMN start.type IS '';
COMMENT ON COLUMN start.mach IS '';
COMMENT ON COLUMN start.reynolds_number IS '';
COMMENT ON COLUMN start.date IS '';


-- -----------------------------------------------------
-- Table aero_db.base
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS base (
  id SERIAL PRIMARY KEY,
  id_start INT NOT NULL,
  alpha FLOAT,
  beta FLOAT,
  alpha_p FLOAT,
  phi_p FLOAT,
  CONSTRAINT fk_base_start
    FOREIGN KEY (id_start)
    REFERENCES start (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE INDEX idx_base_start ON base (id_start);

COMMENT ON TABLE base IS '';
COMMENT ON COLUMN base.id IS '';
COMMENT ON COLUMN base.id_start IS '';
COMMENT ON COLUMN base.alpha IS '';
COMMENT ON COLUMN base.beta IS '';
COMMENT ON COLUMN base.alpha_p IS '';
COMMENT ON COLUMN base.phi_p IS '';


-- -----------------------------------------------------
-- Table aero_db.total_adh
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS total_adh (
  id SERIAL PRIMARY KEY,
  id_base INT NOT NULL,
  cx FLOAT NOT NULL,
  cy FLOAT NOT NULL,
  cz FLOAT NOT NULL,
  cxa FLOAT,
  cya FLOAT,
  cza FLOAT,
  mx FLOAT NOT NULL,
  my FLOAT NOT NULL,
  mz FLOAT NOT NULL,
  k FLOAT NOT NULL,
  CONSTRAINT fk_total_adh_base
    FOREIGN KEY (id_base)
    REFERENCES base (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE INDEX idx_total_adh_base ON total_adh (id_base);

COMMENT ON TABLE total_adh IS '';
COMMENT ON COLUMN total_adh.id IS '';
COMMENT ON COLUMN total_adh.id_base IS '';
COMMENT ON COLUMN total_adh.cx IS '';
COMMENT ON COLUMN total_adh.cy IS '';
COMMENT ON COLUMN total_adh.cz IS '';
COMMENT ON COLUMN total_adh.cxa IS '';
COMMENT ON COLUMN total_adh.cya IS '';
COMMENT ON COLUMN total_adh.cza IS '';
COMMENT ON COLUMN total_adh.mx IS '';
COMMENT ON COLUMN total_adh.my IS '';
COMMENT ON COLUMN total_adh.mz IS '';
COMMENT ON COLUMN total_adh.k IS '';


-- -----------------------------------------------------
-- Table aero_db.drainage_points
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS drainage_points (
  id SERIAL PRIMARY KEY,
  id_geometry INT NOT NULL,
  n INT,
  x FLOAT NOT NULL,
  y FLOAT NOT NULL,
  z FLOAT NOT NULL,
  CONSTRAINT fk_drainage_points_geometry
    FOREIGN KEY (id_geometry)
    REFERENCES geometry (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE INDEX fk_drainage_points_geometry ON drainage_points (id_geometry);

COMMENT ON TABLE drainage_points IS '';
COMMENT ON COLUMN drainage_points.id IS '';
COMMENT ON COLUMN drainage_points.id_geometry IS '';
COMMENT ON COLUMN drainage_points.n IS '';
COMMENT ON COLUMN drainage_points.x IS '';
COMMENT ON COLUMN drainage_points.y IS '';
COMMENT ON COLUMN drainage_points.z IS '';


-- -----------------------------------------------------
-- Table aero_db.pressure_coeff
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS pressure_coeff (
  id SERIAL PRIMARY KEY,
  id_base INT NOT NULL,
  id_drainage_points INT NOT NULL,
  value FLOAT NOT NULL,
  CONSTRAINT fk_pressure_coeff_drainage_points
    FOREIGN KEY (id_drainage_points)
    REFERENCES drainage_points (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_pressure_coeff_base
    FOREIGN KEY (id_base)
    REFERENCES base (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE INDEX idx_pressure_coeff_base_drainage_points ON pressure_coeff (id_drainage_points);
CREATE INDEX idx_pressure_coeff_base ON pressure_coeff (id_base);

COMMENT ON TABLE pressure_coeff IS '';
COMMENT ON COLUMN pressure_coeff.id IS '';
COMMENT ON COLUMN pressure_coeff.id_base IS '';
COMMENT ON COLUMN pressure_coeff.id_drainage_points IS '';
COMMENT ON COLUMN pressure_coeff.value IS '';


-- -----------------------------------------------------
-- Table aero_db.total_adh_other
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS total_adh_other (
  id SERIAL PRIMARY KEY,
  id_base INT NOT NULL,
  name VARCHAR(45) NOT NULL,
  value FLOAT NOT NULL,
  description VARCHAR(45) NOT NULL,
  CONSTRAINT fk_total_adh_other_base
    FOREIGN KEY (id_base)
    REFERENCES base (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE INDEX idx_total_adh_other_base ON total_adh_other (id_base);

COMMENT ON TABLE total_adh_other IS '';
COMMENT ON COLUMN total_adh_other.id IS '';
COMMENT ON COLUMN total_adh_other.id_base IS '';
COMMENT ON COLUMN total_adh_other.name IS '';
COMMENT ON COLUMN total_adh_other.value IS '';
COMMENT ON COLUMN total_adh_other.description IS '';


-- -----------------------------------------------------
-- Table aero_db.center_mass
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS center_mass (
  id SERIAL PRIMARY KEY,
  id_object INT NOT NULL,
  id_start INT,
  x FLOAT NOT NULL,
  y FLOAT NOT NULL,
  z FLOAT NOT NULL,
  date DATE,
  date_start DATE,
  date_end DATE,
  CONSTRAINT fk_center_mass_object
    FOREIGN KEY (id_object)
    REFERENCES object (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_center_mass_start
    FOREIGN KEY (id_start)
    REFERENCES start (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE INDEX fk_center_mass_object ON center_mass (id_object);
CREATE INDEX fk_center_mass_start ON center_mass (id_start);

COMMENT ON TABLE center_mass IS '';
COMMENT ON COLUMN center_mass.id IS '';
COMMENT ON COLUMN center_mass.id_object IS '';
COMMENT ON COLUMN center_mass.id_start IS '';
COMMENT ON COLUMN center_mass.x IS '';
COMMENT ON COLUMN center_mass.y IS '';
COMMENT ON COLUMN center_mass.z IS '';
COMMENT ON COLUMN center_mass.date IS '';
COMMENT ON COLUMN center_mass.date_start IS '';
COMMENT ON COLUMN center_mass.date_end IS '';


-- -----------------------------------------------------
-- Table aero_db.users
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_salt VARCHAR(64) NOT NULL,   -- соль в hex (32 байта = 64 символа)
  password_hash VARCHAR(64) NOT NULL,   -- хэш в hex (32 байта = 64 символа)
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  middle_name VARCHAR(100),
  is_suoeruser BOOLEAN DEFAULT FALSE,
  is_checked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'Пользователи';
COMMENT ON COLUMN users.email IS 'Электронная почта';
COMMENT ON COLUMN users.password_salt IS 'Хэш соли';
COMMENT ON COLUMN users.password_hash IS 'Хэш пароля';
COMMENT ON COLUMN users.first_name IS 'Имя';
COMMENT ON COLUMN users.last_name IS 'Фамилия';
COMMENT ON COLUMN users.middle_name IS 'Отчество';


-- -----------------------------------------------------
-- View aero_db.source_version_view_1
-- -----------------------------------------------------
CREATE OR REPLACE VIEW source_version_view_1 AS
SELECT 
  source_version.id,
  source.name,
  source_version.name AS version,
  source.description AS d1,
  source_version.description AS d2
FROM source_version
INNER JOIN source ON source_version.id_source = source.id;


-- -----------------------------------------------------
-- View aero_db.view_1
-- -----------------------------------------------------
CREATE OR REPLACE VIEW view_1 AS
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
FROM base
INNER JOIN start ON base.id_start = start.id
INNER JOIN total_adh ON total_adh.id_base = base.id;


-- -----------------------------------------------------
-- View aero_db.view_2
-- -----------------------------------------------------
CREATE OR REPLACE VIEW view_2 AS
SELECT 
  start.id as start_id,
  base.id as base_id,
  start.mach,
  start.reynolds_number,
  base.alpha_p,
  base.phi_p,
  total_adh.cx,
  total_adh.cy,
  total_adh.mz,
  pressure_coeff.value AS Cp
FROM base
INNER JOIN start ON base.id_start = start.id
INNER JOIN total_adh ON total_adh.id_base = base.id
INNER JOIN pressure_coeff ON pressure_coeff.id_base = base.id;


-- TODO: какая-то странная вьюха, надо разобраться
-- -----------------------------------------------------
-- View aero_db.cp_view_1
-- -----------------------------------------------------
-- CREATE OR REPLACE VIEW cp_view_1 AS
-- SELECT id_drainage_points
-- FROM pressure_coeff
-- GROUP BY id_drainage_points;


-- -----------------------------------------------------
-- View aero_db.adh_view_1
-- -----------------------------------------------------
CREATE OR REPLACE VIEW adh_view_1 AS
SELECT 
  start.id AS start_id,
  base.id AS base_id,
  total_adh.id AS total_adh_id,
  start.mach,
  start.reynolds_number,
  base.alpha AS a,
  base.beta AS b,
  total_adh.cx,
  total_adh.cy,
  total_adh.mz,
  total_adh.k,
  report.name AS report,
  report_version.name AS protocol,
  start.date
FROM base
INNER JOIN start ON base.id_start = start.id
INNER JOIN total_adh ON base.id = total_adh.id_base
INNER JOIN report ON report.id = start.id_report
INNER JOIN report_version ON report_version.id = start.id_report_version;


-- TODO: какая-то странная функция, надо разобраться, и вообще функции и процедуры надо вынести отдельно
-- -----------------------------------------------------
-- Function CpRotate (converted from MySQL PROCEDURE)
-- -----------------------------------------------------
-- CREATE OR REPLACE FUNCTION CpRotate()
-- RETURNS TABLE(id_base INT, Cp_columns TEXT) AS $$
-- DECLARE
--   v_id INT;
--   v_cn INT;
--   v_st TEXT;
--   rec RECORD;
-- BEGIN
--   v_id := 0;
--   SELECT COUNT(*) INTO v_cn FROM CpView1;
--   v_st := 'SELECT Base_idBase';

--   FOR rec IN SELECT DrenajPoints_idDrenajPoints FROM CpView1 LOOP
--     v_id := v_id + 1;
--     v_st := v_st || ',SUM(CASE WHEN DrenajPoints_idDrenajPoints=' || v_id || ' THEN Cp ELSE NULL END) AS Cp' || v_id;
--   END LOOP;

--   v_st := v_st || ' FROM CpBase GROUP BY Base_idBase';

--   RETURN QUERY EXECUTE v_st;
-- END;
-- $$ LANGUAGE plpgsql;


-- TODO: подумать, может быть и вьюхи вынести отдельно от схем