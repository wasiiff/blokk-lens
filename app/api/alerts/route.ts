import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import PriceAlert from '@/models/PriceAlert';
import User from '@/models/User';

// GET - Fetch user's alerts
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const coinId = searchParams.get('coinId');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const query: any = { userId: user._id };
    if (coinId) query.coinId = coinId;
    if (activeOnly) query.isActive = true;

    const alerts = await PriceAlert.find(query).sort({ createdAt: -1 });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

// POST - Create new alert
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      coinId,
      coinSymbol,
      coinName,
      alertType,
      targetPrice,
      percentChange,
      technicalSignal,
      currentPrice,
    } = body;

    // Validation
    if (!coinId || !coinSymbol || !coinName || !alertType || !currentPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (alertType === 'price_above' || alertType === 'price_below') {
      if (!targetPrice) {
        return NextResponse.json({ error: 'Target price required' }, { status: 400 });
      }
    }

    if (alertType === 'percent_change' && !percentChange) {
      return NextResponse.json({ error: 'Percent change required' }, { status: 400 });
    }

    if (alertType === 'technical_signal' && !technicalSignal) {
      return NextResponse.json({ error: 'Technical signal required' }, { status: 400 });
    }

    const alert = await PriceAlert.create({
      userId: user._id,
      coinId,
      coinSymbol,
      coinName,
      alertType,
      targetPrice,
      percentChange,
      technicalSignal,
      currentPrice,
      isActive: true,
      isTriggered: false,
      notificationSent: false,
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
  }
}

// PATCH - Update alert (toggle active status)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const { alertId, isActive } = body;

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID required' }, { status: 400 });
    }

    const alert = await PriceAlert.findOneAndUpdate(
      { _id: alertId, userId: user._id },
      { isActive },
      { new: true }
    );

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
  }
}

// DELETE - Delete alert
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const alertId = searchParams.get('alertId');

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID required' }, { status: 400 });
    }

    const alert = await PriceAlert.findOneAndDelete({
      _id: alertId,
      userId: user._id,
    });

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 });
  }
}
