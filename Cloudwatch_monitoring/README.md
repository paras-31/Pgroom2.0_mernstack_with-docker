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
```

Configuration notes:

- `region` is the AWS region where metrics/logs are sent.
- `namespace` groups host metrics under `DockerOnPrem`.
- `logs.collect_list` uses container ID patterns to match Docker log files and route them to logical CloudWatch Log Groups and Streams.

---

## Container Metrics Script

Create `/usr/local/bin/send-container-metrics.sh` with the following content and make it executable.

```bash
#!/bin/bash

# Get container count
CONTAINER_COUNT=$(docker ps -q | wc -l)

# Send container count
aws cloudwatch put-metric-data \
  --namespace "DockerContainers" \
  --metric-name "ContainerCount" \
  --value $CONTAINER_COUNT \
  --unit "Count" \
  --dimensions Hostname=$(hostname) \
  --region us-east-1

echo "$(date): Sent container count: $CONTAINER_COUNT"

# Get basic container stats
echo "=== Container Metrics ==="
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | tail -n +2 | while read name cpu mem; do
    if [ ! -z "$name" ] && [ "$name" != "NAME" ]; then
        # Parse CPU percentage (remove '%' and handle decimal)
        cpu_pct=$(echo $cpu | sed 's/%//' | awk '{print $1}')

        # Parse memory usage - handle both MiB and GiB
        mem_value=$(echo $mem | awk '{print $1}')
        mem_unit=$(echo $mem | awk '{print $2}')

        # Convert to MB
        if [ "$mem_unit" = "GiB" ]; then
            mem_mb=$(echo "$mem_value * 1024" | bc 2>/dev/null | awk '{printf "%.2f", $1}')
        elif [ "$mem_unit" = "MiB" ]; then
            mem_mb=$(echo "$mem_value" | awk '{printf "%.2f", $1}')
        else
            mem_mb="0"
        fi

        # Send CPU percentage (convert to number for comparison)
        cpu_num=$(echo "$cpu_pct" | awk '{printf "%.2f", $1}')
        if [ ! -z "$cpu_num" ] && [ "$(echo "$cpu_num > 0" | bc -l 2>/dev/null)" = "1" ]; then
            aws cloudwatch put-metric-data \
              --namespace "DockerContainers" \
              --metric-name "ContainerCPUPercent" \
              --value $cpu_num \
              --unit "Percent" \
              --dimensions Hostname=$(hostname),ContainerName=$name \
              --region us-east-1
            echo "  ✅ $name - CPU: ${cpu_num}%"
        else
            echo "  ⚠️  $name - CPU: ${cpu_num}% (skipped)"
        fi

        # Send memory usage
        if [ ! -z "$mem_mb" ] && [ "$(echo "$mem_mb > 0" | bc -l 2>/dev/null)" = "1" ]; then
            aws cloudwatch put-metric-data \
              --namespace "DockerContainers" \
              --metric-name "ContainerMemoryMB" \
              --value $mem_mb \
              --unit "Megabytes" \
              --dimensions Hostname=$(hostname),ContainerName=$name \
              --region us-east-1
            echo "  ✅ $name - Memory: ${mem_mb}MB"
        else
            echo "  ⚠️  $name - Memory: ${mem_value}${mem_unit} (skipped)"
        fi
    fi
done

echo "$(date): Completed sending container metrics"
```

Make it executable:

```bash
sudo chmod +x /usr/local/bin/send-container-metrics.sh
```

---

## Deployment

1. Start or reload the CloudWatch Agent with the configuration file:

```bash
sudo systemctl stop amazon-cloudwatch-agent || true
sudo pkill -f cloudwatch-agent || true

sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config -m onPremise -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json

sudo systemctl status amazon-cloudwatch-agent --no-pager
```

2. Schedule the metrics script to run (every 2 minutes example):

```bash
(crontab -l 2>/dev/null; echo "*/2 * * * * /usr/local/bin/send-container-metrics.sh >> /var/log/container-metrics.log 2>&1") | crontab -
sudo touch /var/log/container-metrics.log
sudo chown $(whoami) /var/log/container-metrics.log
```

---

## Verification Steps

1. Check agent status and logs:

```bash
sudo systemctl status amazon-cloudwatch-agent
tail -n 200 /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log
```

2. Verify container log files exist and are readable:

```bash
docker ps --format "{{.Names}}" | while read container; do
  container_id=$(docker inspect -f '{{.Id}}' $container)
  echo "Container: $container"
  find /var/lib/docker/containers/ -name "*${container_id}*-json.log" 2>/dev/null | while read file; do
    echo "  Log file: $(basename $file)"
    echo "  Size: $(stat --printf="%s" $file) bytes"
  done
done
```

3. Generate a test log entry in each container (optional):

```bash
for container in $(docker ps --format "{{.Names}}"); do
  docker exec $container sh -c "echo 'TEST: CloudWatch verification log from $container at $(date)'" 2>/dev/null || true
done
```

4. Run the metrics script manually to confirm metrics are sent:

```bash
/usr/local/bin/send-container-metrics.sh
tail -n 200 /var/log/container-metrics.log
```

5. Inspect CloudWatch (allow 5–10 minutes for data to appear):

```bash
aws logs describe-log-groups --log-group-name-prefix "DockerOnPrem" --region us-east-1 --output table

for log_group in "DockerOnPrem/Infrastructure/Monitoring" "DockerOnPrem/Applications/PGRooms" "DockerOnPrem/Data/Databases"; do
  echo "=== $log_group ==="
  aws logs describe-log-streams --log-group-name "$log_group" --region us-east-1 --output table 2>/dev/null || echo "No streams yet"
done

aws cloudwatch list-metrics --namespace "DockerOnPrem" --region us-east-1 --output table | head -n 20
aws cloudwatch list-metrics --namespace "DockerContainers" --region us-east-1 --output table | head -n 20
```

---

## Example CloudWatch Dashboard (JSON)

Create a dashboard JSON (example) to visualize container CPU utilization.

```json
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
```

Put the dashboard in CloudWatch:

```bash
aws cloudwatch put-dashboard --dashboard-name "DockerMonitoring" --dashboard-body file:///tmp/dashboard.json --region us-east-1
```

---

## Troubleshooting

- Agent not starting:

```bash
sudo journalctl -u amazon-cloudwatch-agent.service -n 50
tail -n 200 /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log
```

- No logs in CloudWatch:

```bash
# Ensure container IDs in the config match running containers
docker ps --format "{{.ID}}\t{{.Names}}"

# Check Docker log file permissions
ls -l /var/lib/docker/containers/*/*-json.log
```

- JSON configuration validation:

```bash
python3 -m json.tool /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
```

- Script troubleshooting:

```bash
crontab -l
tail -n 200 /var/log/container-metrics.log
```

---

## Maintenance

- Monitor the CloudWatch Agent logs regularly.
- Update container ID patterns in the CloudWatch Agent config if containers are recreated.
- Review CloudWatch costs and retention settings in the AWS Console.
- Rotate or truncate `/var/log/container-metrics.log` periodically to avoid disk growth.

---

## Notes

- Container IDs used in the example config are placeholders. Use current container IDs or patterns that match your environment.
- The metrics script example sends metrics every 2 minutes via cron; adjust frequency according to your needs and cost considerations.

---

## Support

If you encounter issues, start by checking the agent logs and verifying AWS permissions for CloudWatch Logs and CloudWatch metrics.

### Local agent configuration and metrics script

Metrics are fetched via the bash script and logs are collected via the CloudWatch agent.

**Agent configuration (file_amazon-cloudwatch-agent.json):**

```json
{
  "agent": {
    "region": "us-east-1"
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
```

**Metrics script (/usr/local/bin/send-container-metrics.sh):**

```bash
#!/bin/bash

# Get container count
CONTAINER_COUNT=$(docker ps -q | wc -l)

# Send container count
aws cloudwatch put-metric-data \
  --namespace "DockerContainers" \
  --metric-name "ContainerCount" \
  --value $CONTAINER_COUNT \
  --unit "Count" \
  --dimensions Hostname=$(hostname) \
  --region us-east-1

echo "$(date): Sent container count: $CONTAINER_COUNT"

# Get basic container stats
echo "=== Container Metrics ==="
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | tail -n +2 | while read name cpu mem; do
    if [ ! -z "$name" ] && [ "$name" != "NAME" ]; then
        # Parse CPU percentage (remove '%' and handle decimal)
        cpu_pct=$(echo $cpu | sed 's/%//' | awk '{print $1}')

        # Parse memory usage - handle both MiB and GiB
        mem_value=$(echo $mem | awk '{print $1}')
        mem_unit=$(echo $mem | awk '{print $2}')

        # Convert to MB
        if [ "$mem_unit" = "GiB" ]; then
            mem_mb=$(echo "$mem_value * 1024" | bc 2>/dev/null | awk '{printf "%.2f", $1}')
        elif [ "$mem_unit" = "MiB" ]; then
            mem_mb=$(echo "$mem_value" | awk '{printf "%.2f", $1}')
        else
            mem_mb="0"
        fi

        # Send CPU percentage (convert to number for comparison)
        cpu_num=$(echo "$cpu_pct" | awk '{printf "%.2f", $1}')
        if [ ! -z "$cpu_num" ] && [ "$(echo "$cpu_num > 0" | bc -l 2>/dev/null)" = "1" ]; then
            aws cloudwatch put-metric-data \
              --namespace "DockerContainers" \
              --metric-name "ContainerCPUPercent" \
              --value $cpu_num \
              --unit "Percent" \
              --dimensions Hostname=$(hostname),ContainerName=$name \
              --region us-east-1
            echo "  ✅ $name - CPU: ${cpu_num}%"
        else
            echo "  ⚠️  $name - CPU: ${cpu_num}% (skipped)"
        fi

        # Send memory usage
        if [ ! -z "$mem_mb" ] && [ "$(echo "$mem_mb > 0" | bc -l 2>/dev/null)" = "1" ]; then
            aws cloudwatch put-metric-data \
              --namespace "DockerContainers" \
              --metric-name "ContainerMemoryMB" \
              --value $mem_mb \
              --unit "Megabytes" \
              --dimensions Hostname=$(hostname),ContainerName=$name \
              --region us-east-1
            echo "  ✅ $name - Memory: ${mem_mb}MB"
        else
            echo "  ⚠️  $name - Memory: ${mem_value}${mem_unit} (skipped)"
        fi
    fi
done

echo "$(date): Completed sending container metrics"
```

### Agent-only metrics configuration

If you don't want to use the metrics script, you can use the CloudWatch Agent configuration below to collect metrics for all containers running inside Docker.

```json
{
  "agent": {
    "metrics_collection_interval": 60,
    "logfile": "/opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log",
    "region": "us-east-1",
    "debug": false
  },
  "metrics": {
    "namespace": "DockerContainers",
    "aggregation_dimensions": [["Hostname"], ["Hostname", "ContainerName"]],
    "metrics_collected": {
      "docker": {
        "measurement": [
          "container_cpu_usage_percent",
          "container_memory_usage",
          "container_memory_max_usage"
        ],
        "metrics_collection_interval": 30,
        "totalcpu": true,
        "perdevice": true
      },
      "cpu": {
        "measurement": [
          "cpu_usage_idle",
          "cpu_usage_user",
          "cpu_usage_system"
        ],
        "metrics_collection_interval": 30
      },
      "mem": {
        "measurement": [
          "mem_used_percent"
        ],
        "metrics_collection_interval": 30
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
```



