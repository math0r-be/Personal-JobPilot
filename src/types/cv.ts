export interface CVContent {
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    job: string;
    period: string;
    achievements: string[];
  }>;
  education: Array<{
    school: string;
    degree: string;
    year: string;
  }>;
  skills: {
    hard: string[];
    soft: string[];
  };
  languages: Array<{
    lang: string;
    level: string;
  }>;
}

export interface CV {
  id: string;
  userId: string;
  title: string;
  content: CVContent;
  templateId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Template {
  id: string;
  name: string;
  accent: string;
}
