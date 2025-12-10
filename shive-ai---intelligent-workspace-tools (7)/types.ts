import { LucideIcon } from 'lucide-react';

export enum ToolCategory {
  AI_WRITER = 'AI Writer',
  PRODUCTIVITY = 'Productivity',
  MARKETING = 'Marketing',
  CODING = 'Coding & Dev',
  IMAGE_TOOLS = 'Image Tools',
  VIDEO_TOOLS = 'Video Tools',
  PDF_TOOLS = 'PDF Tools',
  UTILITIES = 'Utilities',
  LIFESTYLE = 'Lifestyle'
}

export interface Tool {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: ToolCategory;
  path: string;
  color: string;
}

export enum AIActionType {
  ESSAY = 'essay',
  SUMMARIZE = 'summarize',
  PARAPHRASE = 'paraphrase',
  ASSIGNMENT = 'assignment',
  GRAMMAR = 'grammar',
  EMAIL = 'email',
}

export interface NavItem {
  label: string;
  id: string;
}

export type ToolMode = string;