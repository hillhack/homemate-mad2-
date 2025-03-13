import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


SMTP_SERVER = "localhost"
SMTP_PORT = 1025
SENDER_EMAIL = 'admin@gmail.com'
SENDER_PASSWORD = ''

def send_email(email, subject, body):

    msg = MIMEMultipart()
    msg['To'] = email
    msg['Subject'] = subject
    msg['From'] = SENDER_EMAIL

    msg.attach(MIMEText(body,'html'))

    with smtplib.SMTP(host=SMTP_SERVER, port=SMTP_PORT) as client:
        client.send_message(msg)
        client.quit()

# send_email('aditya@example', 'Test Email', '<h1> Welcome to AppDev </h1>')