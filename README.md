# HRMS Lite

A lightweight Human Resource Management System built as a full-stack web application.

## Live Demo
https://hrms-lite-kohl-five.vercel.app

## Tech Stack
- **Frontend:** React.js, Axios
- **Backend:** Django, Django REST Framework
- **Database:** PostgreSQL (hosted on Render)
- **Deployment:** Frontend on Vercel, Backend on Render

## Features
- Employee management (Add, View, Delete)
- Attendance tracking (Mark, View, Filter)
- Dashboard with summary stats
- Filter attendance by date and status
- Search employees by name, ID, or email

## Run Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Environment Variables

### Backend (.env)
```
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=your-postgresql-url
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000/api
```

## Assumptions & Limitations
- Single admin user, no authentication required
- Leave management and payroll are out of scope
