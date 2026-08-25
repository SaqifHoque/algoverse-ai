def apply_rlimits(memory_mb: int, cpu_seconds: int) -> None:
    """Applied via subprocess.run(preexec_fn=...) in the parent, taking effect in the child
    right after fork. RLIMIT_AS is best-effort: on macOS/Darwin the kernel rejects setrlimit
    calls for RLIMIT_AS outright (confirmed on this host), so it's wrapped and skipped there --
    the Docker container's own mem_limit/cpus is the authoritative memory backstop in every
    deployed environment (see sandbox.py docstring). The other limits are enforced everywhere."""
    import resource

    memory_bytes = memory_mb * 1024 * 1024
    try:
        resource.setrlimit(resource.RLIMIT_AS, (memory_bytes, memory_bytes))
    except (ValueError, OSError):
        pass
    resource.setrlimit(resource.RLIMIT_CPU, (cpu_seconds, cpu_seconds))
    resource.setrlimit(resource.RLIMIT_NOFILE, (32, 32))
    resource.setrlimit(resource.RLIMIT_NPROC, (1, 1))
