
# 🏠 Household Services Application V2 - MAD II (Jan 2025)
A multi-role home services platform built as part of the **Modern Application Development II** course at **IIT Madras**. This web application enables users to book and manage household services efficiently, with roles for **Admin**, **Customers**, and **Service Professionals**.
problem statement link(https://docs.google.com/document/u/1/d/1g-TDnTHgpAcgMIdMYC2ePBgasJfOIkjRXvjkHjEHiqk/pub)

---

## 📌 Project Overview

The application offers a platform for:
- Customers to request household services
- Service Professionals to accept/reject assigned jobs
- Admins to monitor and manage users, services, and requests

### 👥 Key Roles:
- **Admin**: Superuser to manage the platform.
- **Service Professional**: Provides one type of service and manages requests.
- **Customer**: Books and reviews services.

---

## 🚀 Tech Stack

### 🧱 Backend:
- **Flask**: For REST API development
- **SQLite**: Database (mandatory)
- **Redis**: Caching layer
- **Celery**: Background and scheduled jobs
- **Flask-Login / JWT**: Role-based access control (RBAC)

### 🎨 Frontend:
- **VueJS**: UI rendering
- **Bootstrap**: Styling (No other CSS framework allowed)

### 📬 Communication:
- **Email**: For reminders and reports

---

## 🧩 Core Features

### 🔐 Authentication (RBAC):
- Single Admin (no registration)
- Login/Registration for Professionals and Customers
- Role-specific dashboards

### 🛠 Admin Panel:
- Approve/reject professional profiles
- Block/unblock users
- Create/Update/Delete services
- Export closed service requests to CSV
- Monitor platform activity

### 📞 Customer Dashboard:
- Search for services (by name, pin code)
- Create/edit/close service requests
- Post reviews and remarks

### 👷‍♂️ Professional Dashboard:
- Accept/reject service requests
- Mark services as completed
- View own service history

### ⏱ Scheduled Jobs (via Celery):
- **Daily Reminder** to professionals about pending visits
- **Monthly Activity Report** for customers via email (HTML/PDF)
- **Admin-triggered CSV export** of service request data

### ⚡ Performance:
- Redis caching with expiry to boost API performance

---

## 🗃 Database Structure
> 📌 **ER Diagram**  
> ![db](https://github.com/user-attachments/assets/cb2dacbb-4e4d-409d-baff-c9ff44afef29)

---

## 📂 Project Structure
```
├── app.py
├── backend
│   ├── api
│   │   ├── customers.py
│   │   ├── __init__.py
│   │   ├── professionals.py
│   │   ├── review.py
│   │   └── service.py
│   ├── celery
│   │   ├── celery_fac.py
│   │   ├── celery_schedule.py
│   │   ├── mail_service.py
│   │   ├── task.py
│   │   └── user-downloads
│   ├── config.py
│   ├── create_initial_data.py
│   ├── models.py
│   └── routes.py
├── frontend
│   ├── app.js
│   ├── components
│   │   └── Navbar.js
│   ├── index.html
│   ├── pages
│   │   ├── AdminDash.js
│   │   ├── CusDash.js
│   │   ├── CusStats.js
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── ProfDash.js
│   │   ├── ProfStats.js
│   │   └── Register.js
│   ├── styles.css
│   └── utils
│       ├── router.js
│       └── store.js
├── README.md
└── req.txt
```
---

## 📬 Email & Notifications

- **Reminders**: Daily reminders for professionals with pending tasks
- **Reports**: Monthly HTML/PDF summary to customers
- **Export CSV**: Admin-triggered async batch job for exporting data

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/hillhack/homemate-mad2-
cd homemate-mad2-
```

### 2. Create Virtual Environment

```bash
python3 -m venv .env
source .env/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r req.txt
```

### 4. Start Redis Server (Ensure Redis is installed)

```bash
redis-server
```

### 5. Run the Flask App

```bash
python3 app.py
```

> App will start at: [http://localhost:5000](http://localhost:5000)

---

## 🌟 Celery Setup

> Open **two separate terminals** for the following:

### 1. Celery Beat (Scheduler)

```bash
celery -A app.celery_app beat -l info
```

### 2. Celery Worker

```bash
celery -A app.celery_app worker --loglevel=info
```

---

## 📬 Email Testing with MailHog

Install MailHog:

```bash
brew install mailhog         # macOS
# OR
go install github.com/mailhog/MailHog@latest
```

Run MailHog:

```bash
~/go/bin/MailHog
```

View emails at: [http://localhost:8025](http://localhost:8025)

---

## 👩‍💻 Contributors

- Roll Number: **22f3001795**  
- Name: Jyoti Sharma  
- Program: **BS in Data Science**, IITM Online Degree  

---

## 📝 Project Report

📄 [Read Full Project Report](https://drive.google.com/file/d/1d9mPXddwKyoDmkUBr7__Zfe59EYLvu_X/view?usp=drive_link)

---

## 📜 License

This project is intended for educational use as part of the **Modern Application Development II** course at **IIT Madras**.

---
