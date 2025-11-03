import docker
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ---------------- CONFIGURATION ----------------
CPU_THRESHOLD = 70.0
MEM_THRESHOLD = 70.0

SMTP_SERVER = "smtp.gmail.com"  # your email SMTP server
SMTP_PORT = 587
EMAIL_SENDER = "paraskamboj454@gmail.com"
EMAIL_PASSWORD = "Jaishreeram@12345"
EMAIL_RECEIVER = "paraskamboj281@gmail.com"
# ------------------------------------------------

def send_email_alert(container_name, cpu_usage, mem_usage):
    subject = f"⚠️ Docker Container Alert: {container_name}"
    body = (
        f"Container: {container_name}\n"
        f"CPU Usage: {cpu_usage:.2f}%\n"
        f"Memory Usage: {mem_usage:.2f}%\n\n"
        "Action Required: Please check the container's performance immediately."
    )

    msg = MIMEMultipart()
    msg["From"] = EMAIL_SENDER
    msg["To"] = EMAIL_RECEIVER
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_SENDER, EMAIL_PASSWORD)
            server.send_message(msg)
            print(f"📧 Alert email sent for container: {container_name}")
    except Exception as e:
        print(f"❌ Failed to send email: {e}")

def get_container_stats(container):
    stats = container.stats(stream=False)
    cpu_delta = (
        stats["cpu_stats"]["cpu_usage"]["total_usage"]
        - stats["precpu_stats"]["cpu_usage"]["total_usage"]
    )
    system_delta = (
        stats["cpu_stats"]["system_cpu_usage"]
        - stats["precpu_stats"]["system_cpu_usage"]
    )

    cpu_usage = 0.0
    if system_delta > 0.0 and cpu_delta > 0.0:
        cpu_usage = (cpu_delta / system_delta) * len(stats["cpu_stats"]["cpu_usage"]["percpu_usage"]) * 100.0

    mem_usage = (
        stats["memory_stats"]["usage"] / stats["memory_stats"]["limit"]
    ) * 100.0

    return cpu_usage, mem_usage

def monitor_containers():
    client = docker.from_env()
    containers = client.containers.list()

    for container in containers:
        try:
            cpu_usage, mem_usage = get_container_stats(container)
            print(f"Container: {container.name}")
            print(f"  CPU: {cpu_usage:.2f}%")
            print(f"  Memory: {mem_usage:.2f}%")

            if cpu_usage > CPU_THRESHOLD or mem_usage > MEM_THRESHOLD:
                send_email_alert(container.name, cpu_usage, mem_usage)
            else:
                print("  ✅ Healthy\n")
        except Exception as e:
            print(f"❌ Error fetching stats for {container.name}: {e}")

if __name__ == "__main__":
    monitor_containers()
