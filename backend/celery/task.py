from backend.models import ServiceRequest
from backend.celery.mail_service import send_email
from flask import current_app as app 
import flask_excel
celery = app.extensions["celery"]

@celery.task(bind=True)
def export_service_requests(self):
    """
    Export all service requests to a CSV file asynchronously.
    """
    data = ServiceRequest.query.all()
    if not data:
        return "No service requests found."
    task_id = self.request.id
    filename = f'requests_data_{task_id}.csv'
    column_names = [column.name for column in ServiceRequest.__table__.columns]
    csv_out = flask_excel.make_response_from_query_sets(data, column_names = column_names, file_type='csv' )

    with open(f'./backend/celery/user-downloads/{filename}', 'wb') as file:
        file.write(csv_out.data)

    return filename

@celery.task
def email_reminder(email, subject, body):
    send_email(email, subject, body)