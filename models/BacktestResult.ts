import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBacktestResult extends Document {
    userId: mongoose.Types.ObjectId;
    coinId: string;
    coinSymbol: string;
    strategyName: string;
    strategyParams: any;
    startDate: Date;
    endDate: Date;
    initialCapital: number;
    finalCapital: number;
    totalReturn: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    maxDrawdown: number;
    sharpeRatio?: number;
    tradeHistory: Array<{
        type: 'buy' | 'sell';
        price: number;
        date: Date;
        confidence: number;
        profit?: number;
    }>;
    createdAt: Date;
}

const BacktestResultSchema = new Schema<IBacktestResult>(
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
        strategyName: {
            type: String,
            required: true,
        },
        strategyParams: {
            type: Schema.Types.Mixed,
            default: {},
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        initialCapital: {
            type: Number,
            required: true,
            default: 10000,
        },
        finalCapital: {
            type: Number,
            required: true,
        },
        totalReturn: {
            type: Number,
            required: true,
        },
        totalTrades: {
            type: Number,
            required: true,
            default: 0,
        },
        winningTrades: {
            type: Number,
            required: true,
            default: 0,
        },
        losingTrades: {
            type: Number,
            required: true,
            default: 0,
        },
        winRate: {
            type: Number,
            required: true,
            default: 0,
        },
        maxDrawdown: {
            type: Number,
            default: 0,
        },
        sharpeRatio: {
            type: Number,
        },
        tradeHistory: [
            {
                type: {
                    type: String,
                    enum: ['buy', 'sell'],
                    required: true,
                },
                price: {
                    type: Number,
                    required: true,
                },
                date: {
                    type: Date,
                    required: true,
                },
                confidence: {
                    type: Number,
                    required: true,
                },
                profit: {
                    type: Number,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Compound indexes
BacktestResultSchema.index({ userId: 1, coinId: 1, createdAt: -1 });

const BacktestResult: Model<IBacktestResult> =
    mongoose.models.BacktestResult ||
    mongoose.model<IBacktestResult>('BacktestResult', BacktestResultSchema);

export default BacktestResult;
