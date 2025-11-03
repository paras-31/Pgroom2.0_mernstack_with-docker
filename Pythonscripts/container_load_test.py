#!/usr/bin/env python3
import docker
import argparse
import sys

def run_stress(container, mode, duration):
    # First, detect if stress-ng is available in the container
    try:
        exec_check = container.exec_run("which stress-ng")
        has_stress_ng = exec_check.exit_code == 0
    except Exception as e:
        print(f"⚠️  Could not check stress-ng in {container.name}: {e}")
        has_stress_ng = False

    if has_stress_ng:
        print(f"✅ stress-ng found in {container.name}")
        if mode == "cpu":
            cmd = f"stress-ng --cpu 4 --timeout {duration}"
        elif mode == "mem":
            cmd = f"stress-ng --vm 2 --vm-bytes 90% --timeout {duration}"
        else:  # both
            cmd = f"stress-ng --cpu 4 --vm 2 --vm-bytes 90% --timeout {duration}"
    else:
        print(f"⚠️  stress-ng not found in {container.name}, falling back to Python loop (may fail if Python missing).")
        if mode == "cpu":
            cmd = f"python3 -c 'import threading,math;[threading.Thread(target=lambda: [math.sqrt(i) for i in range(10**7)]).start() for _ in range(4)]'"
        elif mode == "mem":
            cmd = f"python3 -c 'a=[]\nwhile True: a.append(" + '"x"*10**6' + ")'"
        else:
            cmd = f"python3 -c 'import threading,math;[threading.Thread(target=lambda: [math.sqrt(i) for i in range(10**7)]).start() for _ in range(4)]'"

    print(f"🔥 Starting {mode.upper()} stress on {container.name} for {duration}s...")

    try:
        exec_result = container.exec_run(cmd, detach=True)
        if exec_result.exit_code not in (0, None):
            print(f"❌ Failed to stress {container.name}: {exec_result.output.decode(errors='ignore')}")
        else:
            print(f"✅ Stress command executed successfully in {container.name}")
    except Exception as e:
        print(f"❌ Failed to stress {container.name}: {e}")


def main():
    parser = argparse.ArgumentParser(description="Run CPU and/or Memory stress test inside containers")
    parser.add_argument("--containers", "-c", nargs="+", required=True, help="Container name(s) or ID(s)")
    parser.add_argument("--mode", choices=["cpu", "mem", "both"], default="cpu", help="Stress type")
    parser.add_argument("--duration", type=int, default=60, help="Duration in seconds")

    args = parser.parse_args()
    client = docker.from_env()

    for name in args.containers:
        try:
            container = client.containers.get(name)
            print(f"\n🧩 Target Container: {container.name} ({container.short_id})")
            run_stress(container, args.mode, args.duration)
        except Exception as e:
            print(f"❌ Could not access container {name}: {e}")

    print("\n✅ Stress tests launched successfully. Monitor via `docker stats`.")


if __name__ == "__main__":
    main()