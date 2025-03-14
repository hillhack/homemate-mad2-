from celery.schedules import crontab
from flask import current_app as app
from backend.celery.task import email_reminder
from backend.models import Professional, ServiceRequest, User ,Customer
from celery import shared_task
from backend.models import db

celery_app = app.extensions['celery']

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(60.0, send_email_reminders.s())
    sender.add_periodic_task(crontab(day_of_month=1, hour=9,minute=0),send_monthly_report.s() )

@shared_task
def send_email_reminders():
    pending_requests = ServiceRequest.query.filter(
        ServiceRequest.status == 'Pending',
        ServiceRequest.seen == False
    ).all()

    professional_ids = {req.professional_id for req in pending_requests}

    if not professional_ids:
        print('No unseen requests. No emails to send.')
        return

    professionals = (
        db.session.query(Professional, User.email)
        .join(User, Professional.user_id == User.id)
        .filter(Professional.id.in_(professional_ids))
        .all()
    )

    for professional, email in professionals:
        if email:
            subject = "Pending Service Request Reminder"
            body = f"""
            <h1>Hello {professional.name},</h1>
            <p>You have pending service requests that require your attention.</p>
            <p>Please log in and check your dashboard for more details.</p>
            <p>Thank you!</p>
            """
            try:
                email_reminder.delay(email=email, subject=subject, body=body)
            except TypeError as e:
                print(f"Failed to send email to {email}: {e}")

    print(f"Sent {len(professionals)} reminder emails.")

@shared_task
def send_monthly_report():
    total_request = ServiceRequest.query.count()
    closed_request = ServiceRequest.query.filter_by(status = "closed").count()
    customers = db.session.query(Customer , User.email).join(User, Customer.user_id==User.id).all()
    
    for customer, email in customers:
        if email:
            subject = f"{customer.name}'s Monthly Report Card"
            body = f"""
            <h1>{customer.name}'s Monthly Report</h1>
            <p>Total service requests this month: {total_request}</p>
            <p>Closed service requests this month: {closed_request}</p>
            <p>Thank you for using our services!</p>
            """

            try:
                email_reminder.delay(email=email, subject=subject, body=body)
            except TypeError as e:
                print(f"Failed to send email to {email}: {e}")

    print(f"Sent {len(customers)} monthly reports.")
   