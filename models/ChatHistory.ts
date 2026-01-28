import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    coinId?: string;
    coinSymbol?: string;
    priceAtTime?: number;
    analysisType?: string;
  };
}

export interface IChatHistory extends Document {
  userId: string;
  sessionId: string;
  messages: IChatMessage[];
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  role: { type: String, required: true, enum: ['user', 'assistant', 'system'] },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: {
    coinId: String,
    coinSymbol: String,
    priceAtTime: Number,
    analysisType: String,
  },
}, { _id: true }); // Ensure each message gets an _id

const ChatHistorySchema = new Schema<IChatHistory>(
  {
    userId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, unique: true, index: true },
    messages: [ChatMessageSchema],
    title: { type: String },
  },
  { timestamps: true }
);

// Create compound index for efficient queries
ChatHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.ChatHistory || 
  mongoose.model<IChatHistory>('ChatHistory', ChatHistorySchema);
