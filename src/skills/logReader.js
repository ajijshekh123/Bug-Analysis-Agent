/**
 * Log-Reading Guide Skill Engine
 * Parses, cleanses, analyzes and extracts diagnostic signals from application logs.
 */

export function parseAndAnalyzeLogs(rawLogs) {
  if (!rawLogs || !rawLogs.trim()) {
    return {
      lines: [],
      errorCount: 0,
      warnCount: 0,
      extractedTraceIds: [],
      primaryException: null,
      suspectLocation: null,
      callStack: [],
      insights: []
    };
  }

  const rawLines = rawLogs.split('\n');
  const parsedLines = [];
  const traceIds = new Set();
  const callStack = [];
  let primaryException = null;
  let suspectLocation = null;
  let errorCount = 0;
  let warnCount = 0;

  // Regex patterns
  const traceIdRegex = /\[?(?:TraceID|trace_id|req_id|request_id)[:=]\s*([a-zA-Z0-9_-]+)\]?/i;
  const exceptionRegex = /(?:([a-zA-Z0-9_.]+(?:Exception|Error|Failure|Panic)):?\s*(.*))/;
  const stackFrameRegex = /^\s*at\s+([a-zA-Z0-9_$.]+)\.([a-zA-Z0-9_$]+)\(([^:]+):(\d+)\)/;
  const logLevelRegex = /\b(FATAL|CRITICAL|ERROR|WARN|WARNING|INFO|DEBUG|TRACE)\b/;

  rawLines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Detect Log Level
    const levelMatch = line.match(logLevelRegex);
    let level = "INFO";
    if (levelMatch) {
      level = levelMatch[1].toUpperCase();
      if (level === "WARNING") level = "WARN";
      if (level === "CRITICAL") level = "FATAL";
    }

    if (level === "ERROR" || level === "FATAL") errorCount++;
    if (level === "WARN") warnCount++;

    // Extract Trace IDs
    const traceMatch = line.match(traceIdRegex);
    if (traceMatch) {
      traceIds.add(traceMatch[1]);
    }

    // Extract Exception
    if (!primaryException) {
      const excMatch = line.match(exceptionRegex);
      if (excMatch && (excMatch[1].includes("Exception") || excMatch[1].includes("Error"))) {
        primaryException = {
          type: excMatch[1],
          message: excMatch[2] || "Unspecified cause",
          rawLine: line
        };
      }
    }

    // Extract Stack Frames
    const stackMatch = line.match(stackFrameRegex);
    if (stackMatch) {
      const isThirdParty = 
        stackMatch[1].startsWith("java.") || 
        stackMatch[1].startsWith("jdk.") || 
        stackMatch[1].startsWith("org.springframework.") ||
        stackMatch[1].startsWith("org.apache.") ||
        stackMatch[1].startsWith("com.auth0.") ||
        stackMatch[1].startsWith("io.lettuce.");

      const frame = {
        className: stackMatch[1],
        methodName: stackMatch[2],
        fileName: stackMatch[3],
        lineNumber: parseInt(stackMatch[4], 10),
        isAppCode: stackMatch[1].includes("com.company") || !isThirdParty
      };
      callStack.push(frame);

      // Top-most application stack frame is our prime suspect
      if (!suspectLocation && frame.isAppCode) {
        suspectLocation = frame;
      }
    }

    parsedLines.push({
      lineNo: index + 1,
      content: line,
      level,
      isStackFrame: Boolean(stackMatch)
    });
  });

  // Extract Diagnostic Insights
  const insights = [];
  if (primaryException) {
    insights.push(`Primary Root Exception: ${primaryException.type}`);
  }
  if (suspectLocation) {
    insights.push(`Suspect Application Origin: ${suspectLocation.fileName}:${suspectLocation.lineNumber} in ${suspectLocation.className}.${suspectLocation.methodName}()`);
  }
  if (traceIds.size > 0) {
    insights.push(`Correlated Trace ID: ${Array.from(traceIds).join(", ")}`);
  }
  if (rawLogs.toLowerCase().includes("connection pool exhausted")) {
    insights.push("Infrastructure Bottleneck: Downstream connection pool saturation detected.");
  }
  if (rawLogs.toLowerCase().includes("cant be used before") || rawLogs.toLowerCase().includes("nbf")) {
    insights.push("Timing Anomaly: Distributed clock skew between issuer and verifier node.");
  }

  return {
    lines: parsedLines,
    errorCount,
    warnCount,
    extractedTraceIds: Array.from(traceIds),
    primaryException,
    suspectLocation,
    callStack,
    insights
  };
}
