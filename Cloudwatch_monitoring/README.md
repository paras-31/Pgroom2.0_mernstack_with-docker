Docker Container Monitoring with AWS CloudWatch
📋 Table of Contents
Overview

Prerequisites

Installation Steps

Configuration Files

Verification

Troubleshooting

Monitoring Dashboard

Maintenance

🎯 Overview
This guide provides complete instructions to set up monitoring for Docker containers using AWS CloudWatch. The setup collects:

Container Metrics: CPU, memory, network usage for each Docker container

System Metrics: Host machine CPU, memory, disk, network usage

Container Logs: Application logs from all Docker containers

Centralized Monitoring: All data sent to AWS CloudWatch for visualization and alerting

Why Monitor?

Detect performance issues before they affect users

Understand resource usage patterns

Troubleshoot application problems quickly

Capacity planning and optimization

🔧 Prerequisites
1. AWS Account Setup
bash
# Install AWS CLI (if not already installed)
sudo apt update
sudo apt install awscli -y

# Configure AWS credentials
aws configure
Enter these details when prompted:

AWS Access Key ID: [Your AWS Access Key]

AWS Secret Access Key: [Your AWS Secret Key]

Default region: [e.g., us-east-1, eu-west-1]

Default output format: json

Why? CloudWatch agent needs AWS credentials to send metrics and logs to your AWS account.

2. Required IAM Permissions
Ensure your AWS user has these permissions in IAM:

json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cloudwatch:PutMetricData",
                "logs:PutLogEvents",
                "logs:DescribeLogStreams",
                "logs:DescribeLogGroups",
                "logs:CreateLogStream",
                "logs:CreateLogGroup"
            ],
            "Resource": "*"
        }
    ]
}
Why? These permissions allow the agent to create log groups and send metrics to CloudWatch.

🚀 Installation Steps
Step 1: Install CloudWatch Agent
bash
# Download CloudWatch agent package
wget https://amazoncloudwatch-agent.s3.amazonaws.com/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb

# Install the package
sudo dpkg -i amazon-cloudwatch-agent.deb

# Verify installation
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -v
Why? CloudWatch agent is the software that collects and sends metrics/logs to AWS.

Step 2: Create Configuration Directory
bash
# Create configuration directory
sudo mkdir -p /opt/aws/amazon-cloudwatch-agent/etc

# Create subdirectory for additional configs
sudo mkdir -p /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.d
Why? The agent needs a dedicated directory for configuration files.

Step 3: Create Common Configuration File
bash
sudo nano /opt/aws/amazon-cloudwatch-agent/etc/common-config.toml
Add this content:

toml
[credentials]
shared_credential_profile = "default"

[logs]
region = "us-east-1"  # Change to your preferred AWS region
Why? This file contains common settings like AWS region and credential profile that are shared across configurations.

Step 4: Create Main Configuration File
bash
sudo nano /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
Copy and paste this complete configuration:

json
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "root",
    "logfile": "/opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log"
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/lib/docker/containers/**/*.log",
            "log_group_name": "DockerContainers",
            "log_stream_name": "{container_name}",
            "timestamp_format": "%Y-%m-%dT%H:%M:%S.%fZ",
            "timezone": "UTC"
          }
        ]
      }
    }
  },
  "metrics": {
    "metrics_collected": {
      "docker": {
        "measurement": [
          "container_cpu_usage_percent",
          "container_memory_usage_bytes",
          "container_memory_max_usage_bytes",
          "container_memory_rss",
          "container_network_receive_bytes",
          "container_network_transmit_bytes"
        ],
        "metrics_collection_interval": 60
      },
      "cpu": {
        "measurement": [
          "cpu_usage_idle",
          "cpu_usage_iowait",
          "cpu_usage_user",
          "cpu_usage_system"
        ],
        "metrics_collection_interval": 60,
        "totalcpu": true
      },
      "mem": {
        "measurement": [
          "mem_used_percent"
        ],
        "metrics_collection_interval": 60
      },
      "disk": {
        "measurement": [
          "used_percent",
          "inodes_free"
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "/",
          "/var/lib/docker"
        ]
      },
      "net": {
        "measurement": [
          "bytes_sent",
          "bytes_recv",
          "packets_sent",
          "packets_recv"
        ],
        "metrics_collection_interval": 60
      },
      "swap": {
        "measurement": [
          "swap_used_percent"
        ],
        "metrics_collection_interval": 60
      }
    },
    "aggregation_dimensions": [
      ["InstanceId"],
      []
    ],
    "append_dimensions": {
      "InstanceId": "${aws:InstanceId}"
    }
  }
}
Step 5: Start CloudWatch Agent
bash
# Start agent in on-premise mode
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m onPremise -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json

# Check agent status
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a status
Why on-premise mode? We're not running on AWS EC2, so we use on-premise mode which doesn't try to query EC2 metadata service.

🔍 Configuration Explained
What Each Section Does:
1. Agent Configuration
json
"agent": {
  "metrics_collection_interval": 60,  // Collect metrics every 60 seconds
  "run_as_user": "root",              // Run with root privileges
  "logfile": "/opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log"  // Agent's own logs
}
Why? Root privileges are needed to access system metrics and Docker daemon.

2. Logs Configuration
json
"logs": {
  "logs_collected": {
    "files": {
      "collect_list": [
        {
          "file_path": "/var/lib/docker/containers/**/*.log",  // Docker container log location
          "log_group_name": "DockerContainers",                // CloudWatch log group name
          "log_stream_name": "{container_name}",               // Use container name as stream name
          "timestamp_format": "%Y-%m-%dT%H:%M:%S.%fZ",         // Standard timestamp format
          "timezone": "UTC"                                    // Use UTC timezone
        }
      ]
    }
  }
}
Why this path? Docker stores container logs in /var/lib/docker/containers/ by default.

3. Metrics Configuration
Docker Metrics:

container_cpu_usage_percent: CPU usage as percentage

container_memory_usage_bytes: Actual memory used

container_memory_rss: Resident Set Size memory

container_network_receive_bytes: Network incoming traffic

container_network_transmit_bytes: Network outgoing traffic

System Metrics:

CPU: Overall system CPU utilization

Memory: Total system memory usage

Disk: Root filesystem and Docker storage

Network: System-wide network traffic

Swap: Swap space usage

✅ Verification Steps
1. Check Agent Status
bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a status
Expected Output:

text
{
  "status": "running",
  "starttime": "2025-01-21T10:43:13+00:00",
  "version": "1.300033.0"
}
2. Check Agent Logs
bash
# View real-time agent logs
sudo tail -f /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log
Look for these success messages:

"Config validation passed"

"Starting Amazon CloudWatch Agent"

No ERROR messages

3. Verify Docker Integration
bash
# Check running containers
docker ps

# Check real-time container stats
docker stats

# Verify container log files exist
sudo find /var/lib/docker/containers/ -name "*.log" | head -5
4. Verify in AWS CloudWatch Console
Logs Verification:

Go to CloudWatch → Log groups

Look for "DockerContainers" log group

Inside, you should see log streams for each container

Metrics Verification:

Go to CloudWatch → Metrics

Look for "CWAgent" namespace

You should see Docker and system metrics

🐛 Troubleshooting Guide
Common Issues and Solutions
Issue 1: Agent Fails to Start
bash
# Check detailed status
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a status -v

# Check configuration errors
sudo tail -f /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log | grep -i error
Solution: Check AWS credentials and configuration file syntax.

Issue 2: No Docker Metrics
bash
# Check if Docker is running
sudo systemctl status docker

# Check Docker socket permissions
sudo ls -la /var/run/docker.sock

# Test Docker API
docker ps
Solution: Ensure Docker is running and the agent has access to Docker socket.

Issue 3: No Logs in CloudWatch
bash
# Check if container logs exist
sudo find /var/lib/docker/containers/ -name "*.log" | wc -l

# Check container log configuration
docker inspect <container_name> | grep -A 10 LogConfig
Solution: Verify Docker is using JSON-file logging driver.

Issue 4: AWS Permission Errors
bash
# Test AWS connectivity
aws cloudwatch list-metrics --namespace AWS/Logs --max-items 1

# Check AWS credentials
aws sts get-caller-identity
Solution: Verify IAM permissions and AWS credentials.

📊 Monitoring Dashboard
Creating CloudWatch Dashboard
Go to CloudWatch → Dashboards → Create dashboard

Add widgets for:

Container CPU Usage

Container Memory Usage

System Resources

Log Insights

Sample Dashboard Queries
Container CPU Usage:

text
SEARCH('{CWAgent,ContainerName} MetricName="container_cpu_usage_percent"', 'Average', 300)
Container Memory Usage:

text
SEARCH('{CWAgent,ContainerName} MetricName="container_memory_usage_bytes"', 'Average', 300)
System CPU:

text
SEARCH('{CWAgent} MetricName="cpu_usage_user"', 'Average', 300)
🛠️ Maintenance
Regular Checks
bash
# Check agent status weekly
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a status

# Monitor agent logs
sudo tail -100 /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log

# Check CloudWatch costs
# Go to AWS Billing Console → Cost Explorer
Updating Configuration
bash
# Stop agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a stop

# Update config file
sudo nano /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json

# Restart agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m onPremise -s -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
Log Rotation
CloudWatch handles log retention automatically. Configure retention policy in CloudWatch Log Groups:

Default: Never expire

Recommended: 30-90 days based on requirements

📝 Summary
This setup provides:

✅ Real-time monitoring of all Docker containers

✅ System-level resource monitoring

✅ Centralized logging in CloudWatch

✅ Scalable and managed solution

✅ Cost-effective monitoring (pay for what you use)

The monitoring data will help you:

Identify performance bottlenecks

Troubleshoot application issues

Plan capacity requirements

Maintain system health

For additional help, refer to:

AWS CloudWatch Agent Documentation

Docker Logging Drivers

