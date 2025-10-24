CloudWatch Monitoring Setup for On-Premise Docker Containers
📋 Overview
This guide provides complete setup instructions for monitoring Docker containers running on an on-premise Ubuntu server using AWS CloudWatch. The setup includes:

✅ Container logs collection with separate log streams

✅ Container metrics (CPU, memory, network)

✅ Host-level metrics (CPU, memory, disk)

✅ Automated monitoring via cron jobs

✅ Real-time dashboards in CloudWatch

🚀 Prerequisites
Ubuntu server with Docker installed

AWS account with CloudWatch access

AWS CLI configured with appropriate permissions

📥 Installation Steps
1. Install CloudWatch Agent
bash
# Download and install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i -E ./amazon-cloudwatch-agent.deb

# Verify installation
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -h
2. Configure AWS Credentials
bash
# Configure AWS CLI
aws configure
# Enter: AWS Access Key, Secret Key, Region (us-east-1), Output (json)

# Or set environment variables
export AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
export AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
export AWS_REGION=us-east-1
⚙️ Configuration Files
CloudWatch Agent Configuration
Create file: /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json

json
{
  "agent": {
    "region": "us-east-1",
    "logfile": "/opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log"
  },
  "metrics": {
    "namespace": "DockerOnPrem",
    "metrics_collected": {
      "cpu": {
        "measurement": [
          {"name": "cpu_usage_idle", "unit": "Percent"},
          {"name": "cpu_usage_system", "unit": "Percent"},
          {"name": "cpu_usage_user", "unit": "Percent"}
        ],
        "metrics_collection_interval": 60,
        "totalcpu": true
      },
      "mem": {
        "measurement": [
          {"name": "mem_used_percent", "unit": "Percent"}
        ],
        "metrics_collection_interval": 60
      },
      "disk": {
        "measurement": [
          {"name": "used_percent", "unit": "Percent"}
        ],
        "metrics_collection_interval": 60,
        "resources": ["/"]
      }
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/lib/docker/containers/1daf2aff34b0*/*-json.log",
            "log_group_name": "DockerOnPrem/Infrastructure/Monitoring",
            "log_stream_name": "cadvisor",
            "timezone": "UTC"
          },
          {
            "file_path": "/var/lib/docker/containers/7bf791c11710*/*-json.log",
            "log_group_name": "DockerOnPrem/Infrastructure/Monitoring",
            "log_stream_name": "prometheus",
            "timezone": "UTC"
          },
          {
            "file_path": "/var/lib/docker/containers/63b93a70efea*/*-json.log",
            "log_group_name": "DockerOnPrem/Applications/PGRooms",
            "log_stream_name": "backend",
            "timezone": "UTC"
          },
          {
            "file_path": "/var/lib/docker/containers/5e11f46e967f*/*-json.log",
            "log_group_name": "DockerOnPrem/Applications/PGRooms",
            "log_stream_name": "pgroom-app",
            "timezone": "UTC"
          },
          {
            "file_path": "/var/lib/docker/containers/0e78209cb90d*/*-json.log",
            "log_group_name": "DockerOnPrem/Applications/PGRooms",
            "log_stream_name": "prism",
            "timezone": "UTC"
          },
          {
            "file_path": "/var/lib/docker/containers/496426e8dc94*/*-json.log",
            "log_group_name": "DockerOnPrem/Data/Databases",
            "log_stream_name": "postgresql",
            "timezone": "UTC"
          }
        ]
      }
    }
  }
}
Configuration Explanation
Agent Section:

region: AWS region for CloudWatch

logfile: CloudWatch agent's own log location

Metrics Section:

namespace: Groups all host metrics under "DockerOnPrem"

Collects CPU, memory, and disk usage at 60-second intervals

Logs Section:

Uses container ID patterns to match Docker log files

Organizes logs into logical groups:

Infrastructure/Monitoring: cadvisor, prometheus

Applications/PGRooms: backend, pgroom-app, prism

Data/Databases: postgresql

Each container has its own log stream

Container Metrics Script
Create file: /usr/local/bin/send-container-metrics.sh

bash
#!/bin/bash

echo "$(date): Starting container metrics collection"

# Container count
CONTAINER_COUNT=$(docker ps -q | wc -l)
aws cloudwatch put-metric-data \
  --namespace "DockerContainers" \
  --metric-name "ContainerCount" \
  --value $CONTAINER_COUNT \
  --unit "Count" \
  --dimensions Hostname=$(hostname) \
  --region us-east-1
echo "Container count: $CONTAINER_COUNT"

# Get detailed container stats
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" | tail -n +2 | while read line; do
    if [ ! -z "$line" ]; then
        name=$(echo "$line" | awk '{print $1}')
        cpu=$(echo "$line" | awk '{print $2}' | sed 's/%//')
        mem_usage=$(echo "$line" | awk '{print $3}')
        
        # Parse memory value
        mem_value=$(echo "$mem_usage" | sed 's/MiB//' | sed 's/GiB//' | awk '{print $1}')
        
        # Convert GiB to MiB if needed
        if echo "$mem_usage" | grep -q "GiB"; then
            mem_value=$(echo "$mem_value * 1024" | bc 2>/dev/null || echo "$mem_value")
        fi
        
        # Send CPU utilization
        if [ ! -z "$cpu" ] && [ "$cpu" != "0.00" ]; then
            aws cloudwatch put-metric-data \
              --namespace "DockerContainers" \
              --metric-name "CPUUtilization" \
              --value $cpu \
              --unit "Percent" \
              --dimensions Hostname=$(hostname),ContainerName=$name \
              --region us-east-1
        fi
        
        # Send memory usage
        if [ ! -z "$mem_value" ] && [ "$mem_value" != "0" ]; then
            aws cloudwatch put-metric-data \
              --namespace "DockerContainers" \
              --metric-name "MemoryUsage" \
              --value $mem_value \
              --unit "Megabytes" \
              --dimensions Hostname=$(hostname),ContainerName=$name \
              --region us-east-1
        fi
        
        echo "Processed: $name (CPU: ${cpu}%, Memory: ${mem_value}MB)"
    fi
done

echo "$(date): Container metrics collection completed"
Make it executable:

bash
chmod +x /usr/local/bin/send-container-metrics.sh
🚀 Deployment
1. Start CloudWatch Agent
bash
# Stop any running agent
systemctl stop amazon-cloudwatch-agent
pkill -f cloudwatch-agent

# Start with configuration
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m onPremise -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json

# Check status
systemctl status amazon-cloudwatch-agent
2. Set Up Automated Metrics Collection
bash
# Add to crontab to run every 2 minutes
(crontab -l 2>/dev/null; echo "*/2 * * * * /usr/local/bin/send-container-metrics.sh >> /var/log/container-metrics.log 2>&1") | crontab -

# Create log file
touch /var/log/container-metrics.log
✅ Verification Steps
1. Check Agent Status
bash
systemctl status amazon-cloudwatch-agent
tail -f /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log
2. Verify Container Log Files
bash
docker ps --format "{{.Names}}" | while read container; do
    container_id=$(docker inspect -f '{{.Id}}' $container)
    echo "Container: $container"
    find /var/lib/docker/containers/ -name "*${container_id}*-json.log" 2>/dev/null | while read file; do
        echo "  Log file: $(basename $file)"
        echo "  Size: $(ls -la $file | awk '{print $5}') bytes"
    done
done
3. Generate Test Logs
bash
for container in $(docker ps --format "{{.Names}}"); do
    docker exec $container sh -c "echo 'TEST: CloudWatch verification log from $container at $(date)'" 2>/dev/null
done
4. Test Metrics Script
bash
/usr/local/bin/send-container-metrics.sh
tail -f /var/log/container-metrics.log
5. Check CloudWatch (Wait 5-10 minutes)
Check Log Groups:

bash
aws logs describe-log-groups --log-group-name-prefix "DockerOnPrem" --region us-east-1 --output table
Check Log Streams:

bash
for log_group in "DockerOnPrem/Infrastructure/Monitoring" "DockerOnPrem/Applications/PGRooms" "DockerOnPrem/Data/Databases"; do
    echo "=== $log_group ==="
    aws logs describe-log-streams --log-group-name "$log_group" --region us-east-1 --output table 2>/dev/null || echo "No streams yet"
done
Check Metrics:

bash
# Host metrics
aws cloudwatch list-metrics --namespace "DockerOnPrem" --region us-east-1 --output table | head -10

# Container metrics  
aws cloudwatch list-metrics --namespace "DockerContainers" --region us-east-1 --output table | head -10
6. Load Testing
bash
# Install Apache Bench
apt install -y apache2-utils

# Generate load
ab -n 1000 -c 10 http://localhost:8080/

# Monitor during load
watch -n 2 'docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"'
🎯 Expected Results
When working correctly, you should see in CloudWatch:

Log Groups
DockerOnPrem/Infrastructure/Monitoring

DockerOnPrem/Applications/PGRooms

DockerOnPrem/Data/Databases

Log Streams (one per container)
cadvisor, prometheus

backend, pgroom-app, prism

postgresql

Metrics Namespaces
DockerOnPrem - Host metrics

DockerContainers - Container metrics

🔧 Troubleshooting
Common Issues
Agent not starting

bash
journalctl -u amazon-cloudwatch-agent.service -n 20
tail -f /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log
No logs in CloudWatch

Verify container IDs in config match running containers

Check file permissions on Docker log files

Verify AWS credentials have CloudWatch logs permissions

No metrics in CloudWatch

Check if metrics script is running: crontab -l

Check script logs: tail -f /var/log/container-metrics.log

Verify AWS credentials have CloudWatch metrics permissions

JSON configuration errors

bash
python3 -m json.tool /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
Update Container IDs
If containers are recreated, update the config with new container IDs:

bash
# Get current container IDs
docker ps --format "{{.ID}}\t{{.Names}}"

# Update the file_path patterns in amazon-cloudwatch-agent.json
📊 Monitoring Dashboard
Create a CloudWatch dashboard to visualize all metrics:

bash
cat > /tmp/dashboard.json << 'EOF'
{
    "widgets": [
        {
            "type": "metric",
            "x": 0,
            "y": 0,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
                    [ "DockerContainers", "CPUUtilization", "ContainerName", "pgroom-con" ],
                    [ "...", "backend_con_pgrooms" ],
                    [ "...", "cadvisor" ]
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "us-east-1",
                "period": 300,
                "title": "Container CPU %"
            }
        }
    ]
}
EOF

aws cloudwatch put-dashboard --dashboard-name "DockerMonitoring" --dashboard-body file:///tmp/dashboard.json --region us-east-1
🛠 Maintenance
Monitor CloudWatch agent logs regularly

Update container IDs in config if containers are recreated

Review CloudWatch costs in AWS console

Rotate container-metrics.log file periodically

📝 Notes
Container IDs in the config must match your actual running containers

Metrics are sent every 2 minutes via cron job

Logs are collected in near real-time by CloudWatch agent

All data is stored in AWS CloudWatch with retention policies

This setup provides comprehensive monitoring for Docker containers on-premise with automated collection of both logs and metrics.

📞 Support: For issues, check agent logs and verify AWS permissions first.



