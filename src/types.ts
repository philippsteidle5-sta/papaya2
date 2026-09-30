export type CommunicationScope = "ALL" | "THE_BIG_3" | "SINGLE" | "AGENT_SYNC";

export interface AgentMultiResponse {
  agentId: string;
  name: string;
  badge: string;
  color: string;
  thought?: string;
  response: string;
  imageUrl?: string;
  imageUrls?: string[];
}

export interface AgentPerspective {
  agentId: string;
  agentName: string;
  color: string;
  roleTag: string;
  keyContribution: string;
  actionableInsight: string;
  priorityScore?: number;
}

export interface ActionPlanStep {
  step: number;
  title: string;
  owner: string;
  ownerColor?: string;
  description: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "MAX";
}

export interface AgentSyncSynthesis {
  id: string;
  topic: string;
  timestamp: string;
  consensusScore: number; // e.g. 98%
  executiveSummary: string;
  strategicDirective: string;
  corePerspectives: AgentPerspective[];
  masterActionPlan: ActionPlanStep[];
  rawResponses?: AgentMultiResponse[];
}

export interface Message {
  id: string;
  role: "user" | "syntax" | "maze" | "jarvis" | "neo" | "vega" | "apex" | "odin" | "pulse" | "chronos" | "oracle" | "globe" | string;
  content: string;
  thought?: string;
  imageUrl?: string;
  imageUrls?: string[];
  videoUrl?: string;
  videoUrls?: string[];
  isCompare?: boolean;
  compareResult?: {
    claude: string;
    gemini: string;
    claudeThought?: string;
    geminiThought?: string;
  };
  isMultiAgent?: boolean;
  scope?: CommunicationScope;
  multiResponses?: AgentMultiResponse[];
  isAgentSync?: boolean;
  agentSyncSynthesis?: AgentSyncSynthesis;
  timestamp: string;
}

export interface VoiceConferenceTurn {
  id: string;
  agentId: string;
  agentName: string;
  roleTag: string;
  color: string;
  thought?: string;
  speechText: string;
  topicAngle: string;
  durationEstimateSec?: number;
}

export interface AgentConfig {
  id: string;
  name: string;
  tag: string;
  short: string;
  railLetter: string;
  color: string;
  badgeColor: string;
  greeting: string;
  shape: "sphere" | "torus-knot" | "gyroscope" | "fusion" | "network" | "hourglass" | "chart";
}

