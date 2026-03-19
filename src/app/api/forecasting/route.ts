import { NextRequest, NextResponse } from 'next/server';
import {
  generateForecast,
  analyzeTrend,
  calculateAggregateMetrics,
  calculateForecastAccuracy,
  calculateMAPE,
  calculateRMSE,
  calculateBias,
  type ForecastMethod,
} from '@/lib/forecasting';

/**
 * POST /api/forecasting
 * Generate forecasts using various algorithms
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      historicalSales,
      method = 'holt',
      periods = 3,
      alpha = 0.3,
      beta = 0.1,
      seasonLength = 12,
    } = body;

    if (!historicalSales || !Array.isArray(historicalSales)) {
      return NextResponse.json(
        { success: false, message: 'Historical sales data is required' },
        { status: 400 }
      );
    }

    // Generate forecast
    const forecast = generateForecast(historicalSales, {
      method: method as ForecastMethod,
      periods,
      alpha,
      beta,
      seasonLength,
    });

    // Analyze trend
    const trend = analyzeTrend(historicalSales);

    // Generate multi-period forecasts
    const forecasts = Array.from({ length: periods }, (_, i) =>
      generateForecast(historicalSales, {
        method: method as ForecastMethod,
        periods: i + 1,
        alpha,
        beta,
        seasonLength,
      })
    );

    return NextResponse.json({
      success: true,
      forecast,
      forecasts,
      trend,
      method,
      confidence: calculateConfidence(historicalSales, trend),
    });
  } catch (error) {
    console.error('Forecasting error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Forecasting failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/forecasting/methods
 * Get available forecasting methods and their descriptions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'methods') {
      const methods = [
        {
          id: 'sma',
          name: 'Simple Moving Average',
          description: 'Average of recent periods, good for stable demand',
          complexity: 'low',
          useCases: ['Stable demand', 'Short-term forecasting'],
        },
        {
          id: 'wma',
          name: 'Weighted Moving Average',
          description: 'Weighted average favoring recent data',
          complexity: 'low',
          useCases: ['Recent trends matter', 'Gradual changes'],
        },
        {
          id: 'ses',
          name: 'Simple Exponential Smoothing',
          description: 'Exponential decay weighting, responsive to changes',
          complexity: 'medium',
          useCases: ['No trend or seasonality', 'Responsive forecasting'],
        },
        {
          id: 'holt',
          name: "Holt's Method",
          description: 'Trend-adjusted exponential smoothing',
          complexity: 'medium',
          useCases: ['Trending data', 'Medium-term forecasting'],
        },
        {
          id: 'linear',
          name: 'Linear Regression',
          description: 'Linear trend projection using least squares',
          complexity: 'medium',
          useCases: ['Strong linear trends', 'Statistical analysis'],
        },
        {
          id: 'seasonal',
          name: 'Seasonal Decomposition',
          description: 'Accounts for seasonal patterns',
          complexity: 'high',
          useCases: ['Seasonal products', 'Annual cycles'],
        },
      ];

      return NextResponse.json({
        success: true,
        methods,
      });
    }

    // Calculate metrics endpoint
    if (action === 'metrics') {
      const historicalSalesParam = searchParams.get('historical');
      const forecastsParam = searchParams.get('forecasts');

      if (!historicalSalesParam || !forecastsParam) {
        return NextResponse.json(
          { success: false, message: 'Historical and forecast data required' },
          { status: 400 }
        );
      }

      const historicalSales = JSON.parse(historicalSalesParam);
      const forecasts = JSON.parse(forecastsParam);

      const mape = calculateMAPE(historicalSales, forecasts);
      const rmse = calculateRMSE(historicalSales, forecasts);
      const bias = calculateBias(historicalSales, forecasts);

      return NextResponse.json({
        success: true,
        metrics: {
          mape,
          rmse,
          bias,
          accuracy: Math.max(0, 100 - mape),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Forecasting API - Use ?action=methods or POST to generate forecasts',
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Request failed' },
      { status: 500 }
    );
  }
}

// Helper function to calculate confidence score
function calculateConfidence(historicalSales: number[], trend: any): number {
  if (historicalSales.length < 3) return 50;
  
  // Base confidence on data length and trend strength
  const dataQualityScore = Math.min(historicalSales.length / 12, 1) * 40;
  const trendScore = trend.strength * 0.4;
  const varianceScore = calculateVarianceScore(historicalSales) * 20;
  
  return Math.round(Math.min(95, dataQualityScore + trendScore + varianceScore));
}

function calculateVarianceScore(data: number[]): number {
  if (data.length < 2) return 0;
  
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const cv = Math.sqrt(variance) / mean;
  
  // Lower CV = higher score
  return Math.max(0, 1 - cv);
}
