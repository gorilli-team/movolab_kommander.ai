export interface Message {
    content: string;
    createdAt: Date;
    type: "text" | "audio";
    userId?: string;     
  }