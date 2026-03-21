import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ForecastWithMaterial {
  materialId: string;
  month: Date;
  forecastDemand: number;
  actualDemand: number | null;
  forecastAccuracy: number | null;
  modelUsed: string;
  material: {
    id: string;
    description: string;
  };
}

interface MonthlyData {
  forecast: number;
  actual: number;
  count: number;
}

export async function GET() {
  try {
    // Fetch forecast records with material info
    const forecasts = await prisma.forecastRecord.findMany({
      orderBy: [{ materialId: 'asc' }, { month: 'desc' }],
      include: {
        material: true,
      },
    });

    // Group by material
    const groupedByMaterial: Record<string, any[]> = {};
    forecasts.forEach((f: ForecastWithMaterial) => {
      if (!groupedByMaterial[f.materialId]) {
        groupedByMaterial[f.materialId] = [];
      }
      groupedByMaterial[f.materialId].push({
        month: f.month.toISOString(),
        forecastDemand: f.forecastDemand,
        actualDemand: f.actualDemand,
        accuracy: f.forecastAccuracy,
        modelUsed: f.modelUsed,
      });
    });

    // Calculate overall accuracy
    const recordsWithActual = forecasts.filter((f: ForecastWithMaterial) => f.actualDemand !== null);
    const overallAccuracy = recordsWithActual.length > 0
      ? recordsWithActual.reduce((sum: number, f: ForecastWithMaterial) => sum + (f.forecastAccuracy || 0), 0) / recordsWithActual.length
      : 0;

    // Calculate monthly trends
    const monthlyData: Record<string, MonthlyData> = {};
    forecasts.forEach((f: ForecastWithMaterial) => {
      const monthKey = f.month.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { forecast: 0, actual: 0, count: 0 };
      }
      monthlyData[monthKey].forecast += f.forecastDemand;
      monthlyData[monthKey].actual += f.actualDemand || 0;
      monthlyData[monthKey].count += 1;
    });

    const trends = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]: [string, MonthlyData]) => ({
        month,
        forecast: data.forecast,
        actual: data.actual,
        accuracy: data.actual > 0 
          ? Math.round((1 - Math.abs(data.forecast - data.actual) / data.actual) * 100)
          : null,
      }));

    return NextResponse.json({
      success: true,
      forecasts: groupedByMaterial,
      overallAccuracy: Math.round(overallAccuracy * 10) / 10,
      trends,
      totalRecords: forecasts.length,
    });
  } catch (error) {
    console.error('Error fetching forecasts:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch forecasts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Create or update forecast
    const forecast = await prisma.forecastRecord.upsert({
      where: {
        materialId_month: {
          materialId: body.materialId,
          month: new Date(body.month),
        },
      },
      update: {
        forecastDemand: body.forecastDemand,
        modelUsed: body.modelUsed || 'manual',
      },
      create: {
        materialId: body.materialId,
        month: new Date(body.month),
        forecastDemand: body.forecastDemand,
        modelUsed: body.modelUsed || 'manual',
      },
    });

    return NextResponse.json({
      success: true,
      forecast,
    });
  } catch (error) {
    console.error('Error creating forecast:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create forecast' },
      { status: 500 }
    );
  }
}
