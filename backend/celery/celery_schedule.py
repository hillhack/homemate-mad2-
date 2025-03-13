from celery.schedules import crontab
from flask import current_app as app
from backend.celery.task import email_reminder
from backend.models import Professional, ServiceRequest, User
from celery import shared_task
from backend.models import db

celery_app = app.extensions['celery']

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Schedule it to run every 5 seconds (for testing) or adjust as needed
    sender.add_periodic_task(3600.0, send_email_reminders.s())

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

    for professional, email in professionals:
        if email:
            subject = "Pending Service Request Reminder"
            body = f"""
            <h1>Hello {professional.name},</h1>
            <p>You have pending service requests that require your attention.</p>
            <p>Please log in and check your dashboard for more details.</p>
            <p>Thank you!</p>
            """
            print(f"Sending email to {email}")  # Debugging line
            email_reminder.delay(email, subject, body)

    print(f"Sent {len(professionals)} reminder emails.")
