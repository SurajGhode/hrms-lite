# HRMS Lite – Human Resource Management System

A lightweight, production-ready HRMS application for managing employees and daily attendance.

## Tech Stack

| Layer     | Technology               |
|-----------|--------------------------|
| Frontend  | React 18, React Router 6 |
| Backend   | Django 4.x + DRF         |
| Database  | PostgreSQL                |
| Styling   | Custom CSS (no library)   |

---

## Project Structure

```
hrms-lite/
├── hrms_backend/          # Django project
│   ├── hrms_backend/      # Settings, urls
│   └── core/              # App: models, views, serializers, urls
├── hrms-frontend/         # React app
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
└── README.md
```

---

## Running Locally

### Backend

```bash
cd hrms_backend

# Install dependencies
pip install django djangorestframework django-cors-headers psycopg2-binary python-dotenv

# Create .env file
cat > .env << EOF
SECRET_KEY=your-secret-key
DB_NAME=hrms_db
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
EOF

# Create PostgreSQL database
createdb hrms_db

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
```

### Frontend

```bash
cd hrms-frontend

# Install dependencies
npm install

# Create .env
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env

# Start dev server
npm start
```

Visit http://localhost:3000

---

## API Endpoints

| Method | Endpoint                                | Description                  |
|--------|----------------------------------------|------------------------------|
| GET    | /api/employees/                        | List employees (search/filter)|
| POST   | /api/employees/                        | Create employee               |
| GET    | /api/employees/:id/                    | Get employee details          |
| PUT    | /api/employees/:id/                    | Update employee               |
| DELETE | /api/employees/:id/                    | Delete employee               |
| GET    | /api/employees/:id/attendance/         | Employee attendance history   |
| GET    | /api/attendance/                       | List attendance (filterable)  |
| POST   | /api/attendance/                       | Mark attendance               |
| PUT    | /api/attendance/:id/                   | Update attendance record      |
| DELETE | /api/attendance/:id/                   | Delete attendance record      |
| GET    | /api/dashboard/                        | Dashboard stats               |

---

## Deployment

### Backend (Render / Railway)
1. Add all env vars (SECRET_KEY, DB_*, DEBUG=False, ALLOWED_HOSTS=yourdomain.com)
2. Add `gunicorn` to requirements
3. Build command: `pip install -r requirements.txt && python manage.py migrate`
4. Start command: `gunicorn hrms_backend.wsgi`

### Frontend (Netlify / Vercel)
1. Set `REACT_APP_API_URL=https://your-backend.onrender.com/api`
2. Build command: `npm run build`
3. Publish directory: `build`

---

## Features
- ✅ Employee CRUD (add, view, delete, search, filter by department)
- ✅ Attendance marking with Present/Absent status
- ✅ Attendance filtering by date, date range, status
- ✅ Dashboard with live stats (total employees, departments, today's present/absent)
- ✅ Per-employee attendance history with summary stats
- ✅ Server-side validation with meaningful error messages
- ✅ Duplicate employee/attendance prevention
- ✅ Clean, dark-themed professional UI

## Assumptions / Limitations
- Single admin user, no authentication required
- No leave management, payroll, or multi-role support
- Attendance is limited to Present/Absent (no half-day, late, etc.)
