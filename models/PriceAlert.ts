import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPriceAlert extends Document {
  userId: mongoose.Types.ObjectId;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  alertType: 'price_above' | 'price_below' | 'percent_change' | 'technical_signal';
  targetPrice?: number;
  percentChange?: number;
  technicalSignal?: 'buy' | 'sell' | 'rsi_oversold' | 'rsi_overbought';
  currentPrice: number;
  isActive: boolean;
  isTriggered: boolean;
  triggeredAt?: Date;
  notificationSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PriceAlertSchema = new Schema<IPriceAlert>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coinId: {
      type: String,
      required: true,
      index: true,
    },
    coinSymbol: {
      type: String,
      required: true,
    },
    coinName: {
      type: String,
      required: true,
    },
    alertType: {
      type: String,
      enum: ['price_above', 'price_below', 'percent_change', 'technical_signal'],
      required: true,
    },
    targetPrice: {
      type: Number,
    },
    percentChange: {
      type: Number,
    },
    technicalSignal: {
      type: String,
      enum: ['buy', 'sell', 'rsi_oversold', 'rsi_overbought'],
    },
    currentPrice: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isTriggered: {
      type: Boolean,
      default: false,
      index: true,
    },
    triggeredAt: {
      type: Date,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
PriceAlertSchema.index({ userId: 1, isActive: 1 });
PriceAlertSchema.index({ coinId: 1, isActive: 1 });

const PriceAlert: Model<IPriceAlert> =
  mongoose.models.PriceAlert || mongoose.model<IPriceAlert>('PriceAlert', PriceAlertSchema);

export default PriceAlert;
