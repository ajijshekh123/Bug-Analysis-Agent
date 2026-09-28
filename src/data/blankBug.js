export const BLANK_BUG_TEMPLATE = {
  title: "",
  objective: "",
  description: "",
  preconditions: [
    "Application deployed and accessible in target environment.",
    "User navigation workflow initialized."
  ],
  stepsToReproduce: [
    "1. Access the target application module.",
    "2. Execute the user workflow action.",
    "3. Observe system behavior and exception output."
  ],
  actualResult: "",
  expectedResult: "",
  component: "web-app",
  moduleName: "CoreWorkflowModule",
  impactedSprint: "Sprint 42 (Q3-Core)",
  priority: "High",
  severity: "P1 - High",
  criticalOutageLevel: "⚠️ HIGH SEVERITY DEGRADATION (Core Functionality Impaired)",
  impactedModules: ["CoreWorkflowModule", "ApiGateway"],
  attachment: null,
  isCustom: true
};
