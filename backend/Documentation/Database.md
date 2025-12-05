# Nextkraft Smart Parking — Database Schema

## users
Authentication and role identity.

| Column        | Type        | Notes                                      |
|--------------|-------------|--------------------------------------------|
| id           | UUID (PK)   | Auto-generated                             |
| username     | TEXT UNIQUE | Login identity                             |
| password_hash| TEXT        | Stored via bcrypt                          |
| role         | TEXT        | 'admin', 'operator', 'customer'            |
| role_ref_id  | TEXT        | Reference to corresponding profile table   |
| created_at   | TIMESTAMPTZ | Default now                                |
| last_login   | TIMESTAMPTZ | Updated on login                           |

---

## admins
Admin profile details.

| Column        | Type        |
|--------------|-------------|
| id           | TEXT (PK)   |
| user_id      | UUID (FK → users.id) |
| name         | TEXT        |
| created_at   | TIMESTAMPTZ |

---

## operators
Operator profile and assigned projects.

| Column        | Type        |
|--------------|-------------|
| id           | TEXT (PK)   |
| user_id      | UUID (FK)   |
| name         | TEXT        |
| email        | TEXT        |
| phone        | TEXT        |
| project_ids  | JSONB       |
| has_pallet_power | BOOLEAN |
| is_active    | BOOLEAN     |
| created_at   | TIMESTAMPTZ |

---

## customers
Customer profile and KYC.

| Column        | Type        |
|--------------|-------------|
| id           | TEXT (PK)   |
| user_id      | UUID (FK)   |
| project_id   | TEXT (FK → projects.id) |
| name         | TEXT        |
| surname      | TEXT        |
| phone        | TEXT        |
| email        | TEXT        |
| society_name | TEXT        |
| wing_name    | TEXT        |
| flat_number  | TEXT        |
| profession   | TEXT        |
| comments     | TEXT        |
| status       | TEXT        |
| submitted_at | TIMESTAMPTZ |
| approved_at  | TIMESTAMPTZ |
| approved_by  | UUID (FK → users.id) |

---

## projects
Parking site or system.

| Column         | Type   |
|----------------|--------|
| id             | TEXT (PK) |
| name           | TEXT UNIQUE |
| society_name   | TEXT |
| system_type    | TEXT | 
| sub_type       | TEXT |
| levels         | INT |
| cars_per_level | INT |
| total_capacity | INT |
| occupied_slots | INT |
| status         | TEXT |
| layout_json    | JSONB |
| location       | TEXT |
| created_at     | TIMESTAMPTZ |
| updated_at     | TIMESTAMPTZ |

---

## pallets
Physical parking pallets.

| Column              | Type        |
|--------------------|-------------|
| id                 | TEXT (PK)   |
| project_id         | TEXT (FK → projects.id) |
| pallet_number      | TEXT UNIQUE(project_id) |
| floor              | INT         |
| row                | INT         |
| col                | INT         |
| is_assigned        | BOOLEAN     |
| assigned_customer_id | TEXT (FK → customers.id) |
| assigned_car_id    | TEXT (FK → customer_cars.id) |
| retrieval_time_seconds | INT    |
| status             | TEXT        |

---

## customer_cars
Multiple cars per customer.

| Column            | Type     |
|------------------|----------|
| id               | TEXT (PK) |
| customer_id      | TEXT (FK → customers.id) |
| car_model        | TEXT     |
| car_type         | TEXT     |
| car_number_full  | TEXT UNIQUE |
| car_number_key   | TEXT     |
| pallet_id        | TEXT (FK → pallets.id) |
| is_primary       | BOOLEAN  |

---

## requests
Parking & retrieval queue operations.

| Column            | Type        |
|------------------|-------------|
| id               | TEXT (PK)   |
| project_id       | TEXT (FK → projects.id) |
| customer_id      | TEXT (FK → customers.id) |
| car_id           | TEXT (FK → customer_cars.id) |
| pallet_id        | TEXT (FK → pallets.id) |
| type             | TEXT ('retrieve','park','call_empty_pallet') |
| status           | TEXT ('pending','queued','approved','in_progress','completed','rejected','cancelled') |
| queue_position   | INT |
| request_time     | TIMESTAMPTZ |
| approval_time    | TIMESTAMPTZ |
| start_time       | TIMESTAMPTZ |
| completion_time  | TIMESTAMPTZ |
| estimated_seconds| INT |
| operator_id      | UUID (FK → users.id) |
| operator_note    | TEXT |
| rejection_reason | TEXT |

---

## project_status_logs
PLC status and feedback.

| Column            | Type        |
|------------------|-------------|
| id               | TEXT (PK)   |
| project_id       | TEXT (FK → projects.id) |
| status           | TEXT |
| active_request_id| TEXT (FK → requests.id) |
| active_pallet_id | TEXT (FK → pallets.id) |
| from_plc         | BOOLEAN |
| created_at       | TIMESTAMPTZ |

---
