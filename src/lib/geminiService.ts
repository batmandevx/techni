'use client';

import { DataSummary, UploadedData } from './DataContext';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface SOPDataContext {
  uploadedFiles: UploadedData[];
  currentData: UploadedData | null;
  summary?: DataSummary;
}

// Comprehensive S&OP system prompt
const SOP_SYSTEM_PROMPT = `You are an expert S&OP (Sales & Operations Planning) AI Assistant for Tenchi. You have access to uploaded sales, inventory, and operational data.

Your capabilities include:
1. Sales Analysis: Order values, revenue, profit margins, trends
2. Forecasting: Demand predictions, full-year projections
3. Inventory Management: Stock levels, ABC classification, coverage analysis
4. Target vs Actual: Performance tracking, gap analysis
5. Geographic Analysis: Country-wise, region-wise performance
6. Container/Logistics: In-transit tracking, ETA, destination analysis
7. Financial Analysis: P&L breakdowns, cost analysis
8. Market Intelligence: Competition, pricing, demand hotspots
9. Supply Chain: Port congestion, freight forecasts, vendor analysis

When responding:
- Use markdown formatting for readability
- Present data in tables when comparing multiple values
- Provide actionable insights and recommendations
- Reference specific data points from the context
- Suggest next steps or follow-up questions
- Be professional yet conversational

If data is not available, clearly state what information would be needed to answer the question.`;

// Build context from uploaded data
function buildDataContext(context: SOPDataContext): string {
  if (!context.currentData && (!context.uploadedFiles || context.uploadedFiles.length === 0)) {
    return 'No data has been uploaded yet. The user needs to upload Excel/CSV files first.';
  }

  const data = context.currentData || context.uploadedFiles[0];
  if (!data) return 'No data available.';

  const rows = data.rows || [];
  const headers = data.headers || [];
  
  // Find key columns
  const revenueCol = headers.find(h => 
    h.toLowerCase().includes('revenue') || h.toLowerCase().includes('sales') || 
    h.toLowerCase().includes('amount') || h.toLowerCase().includes('total')
  );
  const quantityCol = headers.find(h => 
    h.toLowerCase().includes('quantity') || h.toLowerCase().includes('qty') || 
    h.toLowerCase().includes('count') || h.toLowerCase().includes('units')
  );
  const productCol = headers.find(h => 
    h.toLowerCase().includes('product') || h.toLowerCase().includes('item') || 
    h.toLowerCase().includes('sku') || h.toLowerCase().includes('name')
  );
  const categoryCol = headers.find(h => 
    h.toLowerCase().includes('category') || h.toLowerCase().includes('type') || 
    h.toLowerCase().includes('group')
  );
  const dateCol = headers.find(h => 
    h.toLowerCase().includes('date') || h.toLowerCase().includes('month') || 
    h.toLowerCase().includes('year')
  );
  const customerCol = headers.find(h => 
    h.toLowerCase().includes('customer') || h.toLowerCase().includes('client') || 
    h.toLowerCase().includes('buyer')
  );
  const countryCol = headers.find(h => 
    h.toLowerCase().includes('country') || h.toLowerCase().includes('region') || 
    h.toLowerCase().includes('market')
  );
  const profitCol = headers.find(h => 
    h.toLowerCase().includes('profit') || h.toLowerCase().includes('margin') || 
    h.toLowerCase().includes('gp')
  );
  const costCol = headers.find(h => 
    h.toLowerCase().includes('cost') || h.toLowerCase().includes('cogs')
  );
  const targetCol = headers.find(h => 
    h.toLowerCase().includes('target') || h.toLowerCase().includes('budget') || 
    h.toLowerCase().includes('plan')
  );
  const containerCol = headers.find(h => 
    h.toLowerCase().includes('container') || h.toLowerCase().includes('shipment') || 
    h.toLowerCase().includes('etd') || h.toLowerCase().includes('eta')
  );
  const inventoryCol = headers.find(h => 
    h.toLowerCase().includes('inventory') || h.toLowerCase().includes('stock') || 
    h.toLowerCase().includes('coverage')
  );

  // Calculate basic statistics
  let totalRevenue = 0;
  let totalProfit = 0;
  let totalQuantity = 0;
  let totalTarget = 0;
  const uniqueProducts = new Set();
  const uniqueCustomers = new Set();
  const uniqueCountries = new Set();
  const uniqueCategories = new Set();

  rows.forEach(row => {
    if (revenueCol) totalRevenue += parseFloat(row[revenueCol]) || 0;
    if (profitCol) totalProfit += parseFloat(row[profitCol]) || 0;
    if (quantityCol) totalQuantity += parseFloat(row[quantityCol]) || 0;
    if (targetCol) totalTarget += parseFloat(row[targetCol]) || 0;
    if (productCol) uniqueProducts.add(row[productCol]);
    if (customerCol) uniqueCustomers.add(row[customerCol]);
    if (countryCol) uniqueCountries.add(row[countryCol]);
    if (categoryCol) uniqueCategories.add(row[categoryCol]);
  });

  // Get date range
  let dateRange = 'Unknown';
  if (dateCol) {
    const dates = rows.map(r => new Date(r[dateCol])).filter(d => !isNaN(d.getTime()));
    if (dates.length > 0) {
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
      dateRange = `${minDate.toLocaleDateString()} to ${maxDate.toLocaleDateString()}`;
    }
  }

  // Calculate monthly aggregations if date column exists
  const monthlyData: Record<string, { revenue: number; profit: number; quantity: number; target: number }> = {};
  if (dateCol && revenueCol) {
    rows.forEach(row => {
      const date = new Date(row[dateCol]);
      if (!isNaN(date.getTime())) {
        const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, profit: 0, quantity: 0, target: 0 };
        }
        monthlyData[monthKey].revenue += parseFloat(row[revenueCol]) || 0;
        if (profitCol) monthlyData[monthKey].profit += parseFloat(row[profitCol]) || 0;
        if (quantityCol) monthlyData[monthKey].quantity += parseFloat(row[quantityCol]) || 0;
        if (targetCol) monthlyData[monthKey].target += parseFloat(row[targetCol]) || 0;
      }
    });
  }

  // Country-wise data
  const countryData: Record<string, { revenue: number; profit: number; quantity: number; target: number }> = {};
  if (countryCol) {
    rows.forEach(row => {
      const country = row[countryCol];
      if (country) {
        if (!countryData[country]) {
          countryData[country] = { revenue: 0, profit: 0, quantity: 0, target: 0 };
        }
        if (revenueCol) countryData[country].revenue += parseFloat(row[revenueCol]) || 0;
        if (profitCol) countryData[country].profit += parseFloat(row[profitCol]) || 0;
        if (quantityCol) countryData[country].quantity += parseFloat(row[quantityCol]) || 0;
        if (targetCol) countryData[country].target += parseFloat(row[targetCol]) || 0;
      }
    });
  }

  // Category-wise data
  const categoryData: Record<string, { revenue: number; profit: number; count: number }> = {};
  if (categoryCol) {
    rows.forEach(row => {
      const cat = row[categoryCol];
      if (cat) {
        if (!categoryData[cat]) {
          categoryData[cat] = { revenue: 0, profit: 0, count: 0 };
        }
        if (revenueCol) categoryData[cat].revenue += parseFloat(row[revenueCol]) || 0;
        if (profitCol) categoryData[cat].profit += parseFloat(row[profitCol]) || 0;
        categoryData[cat].count += 1;
      }
    });
  }

  // Build context string
  let contextStr = `UPLOADED DATA SUMMARY:
File: ${data.name}
Total Rows: ${rows.length.toLocaleString()}
Date Range: ${dateRange}
Columns: ${headers.join(', ')}

KEY METRICS:
- Total Revenue: $${totalRevenue.toLocaleString()}
- Total Profit: $${totalProfit.toLocaleString()}
- Total Quantity: ${totalQuantity.toLocaleString()}
- Total Target: $${totalTarget.toLocaleString()}
- Unique Products: ${uniqueProducts.size}
- Unique Customers: ${uniqueCustomers.size}
- Unique Countries/Markets: ${uniqueCountries.size}
- Unique Categories: ${uniqueCategories.size}

DETECTED COLUMNS:
- Revenue/Sales: ${revenueCol || 'Not found'}
- Profit/Margin: ${profitCol || 'Not found'}
- Cost/COGS: ${costCol || 'Not found'}
- Quantity: ${quantityCol || 'Not found'}
- Target/Budget: ${targetCol || 'Not found'}
- Product/SKU: ${productCol || 'Not found'}
- Category: ${categoryCol || 'Not found'}
- Date: ${dateCol || 'Not found'}
- Customer: ${customerCol || 'Not found'}
- Country/Region: ${countryCol || 'Not found'}
- Container/Shipment: ${containerCol || 'Not found'}
- Inventory/Stock: ${inventoryCol || 'Not found'}
`;

  // Add monthly data if available
  if (Object.keys(monthlyData).length > 0) {
    contextStr += '\nMONTHLY BREAKDOWN:\n';
    Object.entries(monthlyData).forEach(([month, data]) => {
      contextStr += `${month}: Revenue $${data.revenue.toLocaleString()}, Profit $${data.profit.toLocaleString()}, Qty ${data.quantity.toLocaleString()}\n`;
    });
  }

  // Add country data if available
  if (Object.keys(countryData).length > 0) {
    contextStr += '\nCOUNTRY/MARKET BREAKDOWN:\n';
    Object.entries(countryData).slice(0, 10).forEach(([country, data]) => {
      contextStr += `${country}: Revenue $${data.revenue.toLocaleString()}, Profit $${data.profit.toLocaleString()}\n`;
    });
  }

  // Add category data if available
  if (Object.keys(categoryData).length > 0) {
    contextStr += '\nCATEGORY BREAKDOWN:\n';
    Object.entries(categoryData).slice(0, 10).forEach(([cat, data]) => {
      contextStr += `${cat}: Revenue $${data.revenue.toLocaleString()}, Profit $${data.profit.toLocaleString()}, Count ${data.count}\n`;
    });
  }

  // Add sample rows
  contextStr += '\nSAMPLE DATA (First 3 rows):\n';
  rows.slice(0, 3).forEach((row, i) => {
    contextStr += `Row ${i + 1}: ${JSON.stringify(row)}\n`;
  });

  return contextStr;
}

// Generate response using Gemini API
export async function generateGeminiResponse(
  userMessage: string,
  context: SOPDataContext,
  chatHistory: ChatMessage[] = []
): Promise<string> {
  try {
    const dataContext = buildDataContext(context);
    
    const prompt = `${SOP_SYSTEM_PROMPT}

${dataContext}

USER QUESTION: ${userMessage}

Provide a comprehensive answer based on the available data. If specific data is not available, clearly state what information is missing and provide general guidance or calculations based on available data.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
          topP: 0.8,
          topK: 40,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Unexpected response format from Gemini API');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Return a fallback response with calculated data
    return generateFallbackResponse(userMessage, context);
  }
}

// Generate fallback response when API fails
function generateFallbackResponse(userMessage: string, context: SOPDataContext): string {
  const lowerMsg = userMessage.toLowerCase();
  const data = context.currentData || context.uploadedFiles?.[0];
  
  if (!data) {
    return `I apologize, but no data has been uploaded yet. Please upload your Excel or CSV files first so I can analyze your S&OP data and answer your questions.

You can upload files from the Upload page. Once uploaded, I'll be able to help you with:
- Sales and order analysis
- Profit and margin calculations
- Forecasting and projections
- Target vs actual comparisons
- Inventory analysis
- And much more!`;
  }

  const rows = data.rows || [];
  const headers = data.headers || [];
  
  // Find columns
  const revenueCol = headers.find(h => 
    h.toLowerCase().includes('revenue') || h.toLowerCase().includes('sales') || 
    h.toLowerCase().includes('amount')
  );
  const profitCol = headers.find(h => 
    h.toLowerCase().includes('profit') || h.toLowerCase().includes('margin')
  );
  const targetCol = headers.find(h => 
    h.toLowerCase().includes('target') || h.toLowerCase().includes('budget')
  );
  const countryCol = headers.find(h => 
    h.toLowerCase().includes('country') || h.toLowerCase().includes('region')
  );
  const dateCol = headers.find(h => 
    h.toLowerCase().includes('date') || h.toLowerCase().includes('month')
  );

  // Calculate totals
  let totalRevenue = 0;
  let totalProfit = 0;
  let totalTarget = 0;
  
  rows.forEach(row => {
    if (revenueCol) totalRevenue += parseFloat(row[revenueCol]) || 0;
    if (profitCol) totalProfit += parseFloat(row[profitCol]) || 0;
    if (targetCol) totalTarget += parseFloat(row[targetCol]) || 0;
  });

  // Handle specific query types
  if (lowerMsg.includes('order value') && (lowerMsg.includes('month') || lowerMsg.includes('ytd'))) {
    return `## Order Value Analysis

**Total Revenue (YTD):** $${totalRevenue.toLocaleString()}

Based on your uploaded data of ${rows.length.toLocaleString()} records:
${revenueCol ? `- Revenue column detected: "${revenueCol}"` : '- No revenue column found'}
${profitCol ? `- Profit column detected: "${profitCol}"` : '- No profit column found'}

**Recommendations:**
1. Upload data with monthly breakdown for month-wise analysis
2. Ensure target/budget columns are included for comparison
3. Add country/region columns for geographic analysis`;
  }

  if (lowerMsg.includes('target') && (lowerMsg.includes('sales') || lowerMsg.includes('order'))) {
    const gap = totalTarget - totalRevenue;
    const achievement = totalTarget > 0 ? (totalRevenue / totalTarget * 100).toFixed(1) : 'N/A';
    
    return `## Target vs Sales Analysis

| Metric | Value |
|--------|-------|
| Target | $${totalTarget.toLocaleString()} |
| Actual Sales | $${totalRevenue.toLocaleString()} |
| Gap | $${gap.toLocaleString()} |
| Achievement | ${achievement}% |

**Status:** ${parseFloat(achievement) >= 100 ? '[OK] Target Achieved!' : parseFloat(achievement) >= 80 ? '[WARN] Close to Target' : '[ALERT] Below Target'}

**Action Items:**
${gap > 0 ? `- Need $${gap.toLocaleString()} more to reach target` : '- Target exceeded! Great performance!'}
- Review underperforming regions/products
- Consider promotional activities`;
  }

  if (lowerMsg.includes('forecast') || lowerMsg.includes('full year') || lowerMsg.includes('projection')) {
    const currentMonth = new Date().getMonth() + 1;
    const monthlyAvg = totalRevenue / (dateCol ? 12 : 1);
    const fullYearProjected = monthlyAvg * 12;
    
    return `## Full Year Forecast

**Current Performance:**
- Revenue to date: $${totalRevenue.toLocaleString()}
- Monthly Average: $${monthlyAvg.toLocaleString()}

**Full Year Projection:**
- **Projected Revenue: $${fullYearProjected.toLocaleString()}**
- Based on current trends and ${rows.length.toLocaleString()} data points

**Growth Scenarios:**
| Scenario | Projected Revenue |
|----------|------------------|
| Conservative (5% growth) | $${(fullYearProjected * 1.05).toLocaleString()} |
| Moderate (10% growth) | $${(fullYearProjected * 1.1).toLocaleString()} |
| Aggressive (15% growth) | $${(fullYearProjected * 1.15).toLocaleString()} |

**Note:** For more accurate forecasts, upload historical data from previous years.`;
  }

  if (lowerMsg.includes('inventory')) {
    return `## Inventory Analysis

**Note:** Detailed inventory analysis requires specific inventory columns in your data.

From your current data:
- Total Records: ${rows.length.toLocaleString()}
${revenueCol ? `- Total Revenue: $${totalRevenue.toLocaleString()}` : ''}
${profitCol ? `- Total Profit: $${totalProfit.toLocaleString()}` : ''}

**To get inventory insights, please ensure your data includes:**
- Current stock levels
- Stock coverage days
- ABC classification
- Slow/moving inventory flags
- Warehouse locations

Would you like me to analyze specific products or categories?`;
  }

  if (lowerMsg.includes('country') || lowerMsg.includes('market') || lowerMsg.includes('region')) {
    if (!countryCol) {
      return `## Country/Market Analysis

I don't see a country/region column in your data. To perform country-wise analysis, please ensure your data includes:
- Country names
- Region codes
- Market identifiers

**Current Available Data:**
- Total Revenue: $${totalRevenue.toLocaleString()}
- Total Records: ${rows.length.toLocaleString()}
- Columns: ${headers.join(', ')}

Please upload data with geographic information for country-wise breakdowns.`;
    }
  }

  if (lowerMsg.includes('container') || lowerMsg.includes('transit') || lowerMsg.includes('shipment')) {
    return `## Container/Shipment Status

**Note:** Container tracking requires shipment-specific data.

Please ensure your data includes:
- Container numbers
- ETD (Estimated Time of Departure)
- ETA (Estimated Time of Arrival)
- Destination ports
- Shipment values
- SKU details

**Current Data Summary:**
- Total Records: ${rows.length.toLocaleString()}
${revenueCol ? `- Total Shipment Value: $${totalRevenue.toLocaleString()}` : ''}

Would you like to upload shipment tracking data?`;
  }

  if (lowerMsg.includes('p&l') || lowerMsg.includes('profit and loss') || lowerMsg.includes('margin')) {
    const margin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 'N/A';
    
    return `## P&L Breakdown

| Line Item | Amount | % of Revenue |
|-----------|--------|-------------|
| Revenue | $${totalRevenue.toLocaleString()} | 100% |
${profitCol ? `| Gross Profit | $${totalProfit.toLocaleString()} | ${margin}% |` : '| Gross Profit | N/A | N/A |'}
| COGS | ${profitCol ? `$${(totalRevenue - totalProfit).toLocaleString()}` : 'N/A'} | ${profitCol ? `${(100 - parseFloat(margin)).toFixed(1)}%` : 'N/A'} |

**Key Metrics:**
${profitCol ? `- Gross Margin: ${margin}%` : '- Profit data not available'}
- Revenue per Record: $${(totalRevenue / rows.length).toFixed(2)}

**To complete the P&L analysis, please include:**
- Cost of Goods Sold (COGS)
- Operating expenses
- Logistics costs
- Marketing expenses
- Tax amounts`;
  }

  // Default response
  return `## Analysis Results

Based on your uploaded data (**${data.name}**):

### Data Overview
- **Total Records:** ${rows.length.toLocaleString()}
- **Columns:** ${headers.length} (${headers.join(', ')})

### Key Metrics
${revenueCol ? `- **Total Revenue:** $${totalRevenue.toLocaleString()}` : ''}
${profitCol ? `- **Total Profit:** $${totalProfit.toLocaleString()}` : ''}
${targetCol ? `- **Total Target:** $${totalTarget.toLocaleString()}` : ''}

### Available Analysis
I can help you with:
1. **Sales Analysis** - Revenue trends, growth rates
2. **Forecasting** - Full year projections
3. **Target vs Actual** - Performance gaps
4. **Geographic Analysis** - Country/region performance
5. **Inventory Insights** - Stock analysis
6. **P&L Breakdown** - Profitability analysis

**What specific aspect would you like to explore?** Try asking:
- "Show me target vs sales YTD"
- "What's my full year forecast?"
- "Show country-wise profit"
- "What's my inventory status?"`;
}

// Check if API key is configured
export function isGeminiConfigured(): boolean {
  return !!GEMINI_API_KEY && GEMINI_API_KEY.length > 10;
}

export default {
  generateGeminiResponse,
  isGeminiConfigured,
  buildDataContext,
};
