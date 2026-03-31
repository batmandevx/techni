'use client';

import { DataSummary, UploadedData, DashboardData } from './DataContext';
import { getUploadedData, UploadedData as StoreUploadedData } from './uploadDataStore';

const GEMINI_API_URL = '/api/gemini';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'model';
  content: string;
  timestamp?: Date;
}

export interface SOPDataContext {
  uploadedFiles: UploadedData[];
  currentData: UploadedData | null;
  summary?: DataSummary;
  dashboardData?: DashboardData;
  storeData?: StoreUploadedData | null;
}

// Comprehensive S&OP system prompt
const SOP_SYSTEM_PROMPT = `You are TenchiOne AI, an expert S&OP (Sales & Operations Planning) analyst. You have been given a specific dataset uploaded by the user.

CRITICAL INSTRUCTIONS:
1. You MUST answer EVERY question using ONLY the data provided in the context below.
2. Do NOT give generic definitions, templates, or advice. The user wants facts from their file.
3. Always cite specific numbers, SKUs, months, and categories from the data.
4. If the user asks a question and the exact answer isn't in the data, calculate it from the data provided (e.g., sums, averages, percentages) and state your calculation.
5. Only say "data not available" if the uploaded context truly lacks the necessary columns/values.
6. Use markdown tables for comparisons and lists.
7. Be concise but specific. Start with the direct answer, then add 1-2 sentences of insight.`;

// Build context from uploaded data
function buildDataContext(context: SOPDataContext): string {
  if (!context.currentData && (!context.uploadedFiles || context.uploadedFiles.length === 0)) {
    return 'No data has been uploaded yet.';
  }

  const data = context.currentData || context.uploadedFiles[0];
  if (!data) return 'No data available.';

  const rows = data.rows || [];
  const headers = data.headers || [];
  const db = context.dashboardData;
  const store = context.storeData;

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
  let contextStr = `UPLOADED FILE: ${data.name}
TOTAL ROWS: ${rows.length.toLocaleString()}
DATE RANGE: ${dateRange}
COLUMNS: ${headers.join(', ')}

KEY METRICS:
- Total Revenue: $${totalRevenue.toLocaleString()}
- Total Profit: $${totalProfit.toLocaleString()}
- Total Quantity: ${totalQuantity.toLocaleString()}
- Total Target: $${totalTarget.toLocaleString()}
- Unique Products: ${uniqueProducts.size}
- Unique Customers: ${uniqueCustomers.size}
- Unique Countries/Markets: ${uniqueCountries.size}
- Unique Categories: ${uniqueCategories.size}
`;

  // Add parsed material/store data if available
  if (store) {
    contextStr += `\n--- PARSED INVENTORY / SKU DATA ---\n`;
    contextStr += `- Total SKUs: ${store.kpis.totalSKUs}\n`;
    contextStr += `- Total Revenue: $${Math.round(store.kpis.totalRevenue).toLocaleString()}\n`;
    contextStr += `- Forecast Accuracy: ${store.kpis.forecastAccuracy.toFixed(1)}%\n`;
    contextStr += `- Avg Stock Coverage: ${store.kpis.avgCoverage.toFixed(1)} months\n`;
    contextStr += `- Total Orders: ${store.kpis.totalOrders.toLocaleString()}\n`;
    if (store.materials.length > 0) {
      contextStr += `\nMATERIALS:\n`;
      store.materials.forEach(m => {
        contextStr += `- ${m.id}: ${m.description} | Category: ${m.category} | Total Sales: ${m.totalSales.toLocaleString()} | Avg/Month: ${Math.round(m.avgMonthlySales)} | Stock: ${m.currentStock} | Price: $${m.price}\n`;
      });
    }
    if (store.monthlyTrend.length > 0) {
      contextStr += `\nMONTHLY TREND:\n`;
      store.monthlyTrend.forEach(m => {
        contextStr += `- ${m.month}: Actual ${m.actual.toLocaleString()}, Forecast ${m.forecast.toLocaleString()}, Orders ${m.orders}\n`;
      });
    }
    if (store.abcDistribution.length > 0) {
      contextStr += `\nABC CLASSIFICATION:\n`;
      store.abcDistribution.forEach(a => {
        contextStr += `- ${a.name}: ${a.value} SKUs\n`;
      });
    }
    if (store.topCategories.length > 0) {
      contextStr += `\nTOP CATEGORIES:\n`;
      store.topCategories.forEach(c => {
        contextStr += `- ${c.name}: $${Math.round(c.value).toLocaleString()}\n`;
      });
    }
  }

  // Add dashboard data if available
  if (db && db.totalOrders > 0) {
    contextStr += `\n--- DASHBOARD KPIs ---\n`;
    contextStr += `- Total Orders: ${db.totalOrders.toLocaleString()}\n`;
    contextStr += `- Revenue: $${db.revenue.toLocaleString()}\n`;
    contextStr += `- Customers: ${db.customers.toLocaleString()}\n`;
    contextStr += `- Products: ${db.products.toLocaleString()}\n`;
    contextStr += `- Forecast Accuracy: ${db.forecastAccuracy}%\n`;
    contextStr += `- Inventory Value: $${db.inventoryValue.toLocaleString()}\n`;
    if (db.topProducts.length > 0) {
      contextStr += `\nTOP PRODUCTS:\n`;
      db.topProducts.forEach(p => {
        contextStr += `- ${p.name}: Sales $${p.sales.toLocaleString()}, Qty ${p.quantity.toLocaleString()}, Growth ${p.growth}%\n`;
      });
    }
    if (db.categoryDistribution.length > 0) {
      contextStr += `\nCATEGORY DISTRIBUTION:\n`;
      db.categoryDistribution.forEach(c => {
        contextStr += `- ${c.name}: ${c.value} (${c.percentage || 0}%)\n`;
      });
    }
    if (db.abcClassification.length > 0) {
      contextStr += `\nDASHBOARD ABC CLASSIFICATION:\n`;
      db.abcClassification.forEach(a => {
        contextStr += `- ${a.name}: ${a.value} (${a.percentage}%)\n`;
      });
    }
    if (db.inventoryByCategory.length > 0) {
      contextStr += `\nINVENTORY BY CATEGORY:\n`;
      db.inventoryByCategory.forEach(i => {
        contextStr += `- ${i.category}: Value $${i.value.toLocaleString()}, Turnover ${i.turnover}\n`;
      });
    }
  }

  // Add monthly data if available
  if (Object.keys(monthlyData).length > 0) {
    contextStr += '\n--- MONTHLY BREAKDOWN ---\n';
    Object.entries(monthlyData).forEach(([month, data]) => {
      contextStr += `${month}: Revenue $${data.revenue.toLocaleString()}, Profit $${data.profit.toLocaleString()}, Qty ${data.quantity.toLocaleString()}\n`;
    });
  }

  // Add country data if available
  if (Object.keys(countryData).length > 0) {
    contextStr += '\n--- COUNTRY/MARKET BREAKDOWN ---\n';
    Object.entries(countryData).slice(0, 10).forEach(([country, data]) => {
      contextStr += `${country}: Revenue $${data.revenue.toLocaleString()}, Profit $${data.profit.toLocaleString()}\n`;
    });
  }

  // Add category data if available
  if (Object.keys(categoryData).length > 0) {
    contextStr += '\n--- CATEGORY BREAKDOWN ---\n';
    Object.entries(categoryData).slice(0, 10).forEach(([cat, data]) => {
      contextStr += `${cat}: Revenue $${data.revenue.toLocaleString()}, Profit $${data.profit.toLocaleString()}, Count ${data.count}\n`;
    });
  }

  // Add sample rows
  contextStr += '\n--- SAMPLE ROWS (First 3) ---\n';
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

    if (dataContext === 'No data has been uploaded yet.') {
      return 'No data has been uploaded yet. Please upload an Excel or CSV file first.';
    }

    const validHistory = chatHistory.filter(msg => msg.id !== 'welcome');
    
    let formattedHistory = validHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Ensure alternating roles (API requirement)
    // If the last message in history is a 'user', and we are about to append another 'user',
    // we should combine them or drop the previous user message, but normally history alternates.
    if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === 'user') {
      // Remove the last pending user message from history if there was no model response
      formattedHistory.pop();
    }

    const currentPrompt = `${SOP_SYSTEM_PROMPT}

${dataContext}

USER QUESTION: ${userMessage}

IMPORTANT: Answer using ONLY the data above. Cite specific numbers and names from the dataset.`;

    const contents = [
      ...formattedHistory,
      {
        role: 'user',
        parts: [{ text: currentPrompt }]
      }
    ];

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.2,
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
  const store = context.storeData;
  const db = context.dashboardData;

  if (!data && !store) {
    return `No data has been uploaded yet. Please upload your Excel or CSV files first.`;
  }

  const rows = data?.rows || [];
  const headers = data?.headers || [];

  // Revenue / profit helpers
  const revenueCol = headers.find(h =>
    h.toLowerCase().includes('revenue') || h.toLowerCase().includes('sales') || h.toLowerCase().includes('amount')
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

  let totalRevenue = 0;
  let totalProfit = 0;
  let totalTarget = 0;
  rows.forEach(row => {
    if (revenueCol) totalRevenue += parseFloat(row[revenueCol]) || 0;
    if (profitCol) totalProfit += parseFloat(row[profitCol]) || 0;
    if (targetCol) totalTarget += parseFloat(row[targetCol]) || 0;
  });

  // If we have parsed store data, use it for most inventory/forecasting questions
  if (store) {
    // ABC / classification
    if (lowerMsg.includes('abc') || lowerMsg.includes('classification')) {
      const abcRows = store.abcDistribution.map(a => `| ${a.name} | ${a.value} |`).join('\n');
      return `## ABC Classification

| Class | SKU Count |
|-------|-----------|
${abcRows}

**Total SKUs:** ${store.kpis.totalSKUs}

**Top Materials by Revenue:**
${store.materials.slice(0, 5).map(m => `- **${m.id}** (${m.description}): $${Math.round(m.totalSales * Math.max(m.price, 1)).toLocaleString()}`).join('\n')}`;
    }

    // Coverage / stock
    if (lowerMsg.includes('coverage') || lowerMsg.includes('stock coverage')) {
      const lowCoverage = store.materials.filter(m => m.avgMonthlySales > 0 && (m.currentStock / m.avgMonthlySales) < 1);
      return `## Stock Coverage

**Average Coverage:** ${store.kpis.avgCoverage.toFixed(1)} months

**Low Coverage Alerts (< 1 month):**
${lowCoverage.length > 0 ? lowCoverage.map(m => `- **${m.id}** (${m.description}): ${(m.currentStock / m.avgMonthlySales).toFixed(1)} months (Stock: ${m.currentStock}, Avg Sales: ${Math.round(m.avgMonthlySales)})`).join('\n') : '- None'}

**Top 5 by Coverage:**
${store.materials.filter(m => m.avgMonthlySales > 0).sort((a, b) => (b.currentStock / b.avgMonthlySales) - (a.currentStock / a.avgMonthlySales)).slice(0, 5).map(m => `- **${m.id}**: ${(m.currentStock / m.avgMonthlySales).toFixed(1)} months`).join('\n')}`;
    }

    // Forecast accuracy
    if (lowerMsg.includes('forecast accuracy')) {
      return `## Forecast Accuracy

**Overall:** ${store.kpis.forecastAccuracy.toFixed(1)}%

| Month | Actual | Forecast | Variance |
|-------|--------|----------|----------|
${store.monthlyTrend.map(m => `| ${m.month} | ${m.actual.toLocaleString()} | ${m.forecast.toLocaleString()} | ${Math.abs(m.actual - m.forecast).toLocaleString()} |`).join('\n')}`;
    }

    // Inventory / stock value
    if (lowerMsg.includes('inventory') || lowerMsg.includes('stock')) {
      return `## Inventory Summary

- **Total SKUs:** ${store.kpis.totalSKUs}
- **Total Revenue:** $${Math.round(store.kpis.totalRevenue).toLocaleString()}
- **Avg Stock Coverage:** ${store.kpis.avgCoverage.toFixed(1)} months
- **Forecast Accuracy:** ${store.kpis.forecastAccuracy.toFixed(1)}%

**Top Categories:**
${store.topCategories.slice(0, 5).map(c => `- **${c.name}**: $${Math.round(c.value).toLocaleString()}`).join('\n')}

**Highest Stock Levels:**
${store.materials.sort((a, b) => b.currentStock - a.currentStock).slice(0, 5).map(m => `- **${m.id}** (${m.description}): ${m.currentStock} units`).join('\n')}`;
    }

    // Materials / SKUs / products
    if (lowerMsg.includes('material') || lowerMsg.includes('sku') || lowerMsg.includes('product')) {
      return `## Material Summary

**Total SKUs:** ${store.kpis.totalSKUs}

**Top 10 by Sales Volume:**
${store.materials.sort((a, b) => b.totalSales - a.totalSales).slice(0, 10).map((m, i) => `${i + 1}. **${m.id}** — ${m.description}
   - Category: ${m.category} | Total Sales: ${m.totalSales.toLocaleString()} | Avg/Month: ${Math.round(m.avgMonthlySales)} | Stock: ${m.currentStock} | Price: $${m.price}`).join('\n\n')}`;
    }

    // Trends / monthly
    if (lowerMsg.includes('trend') || lowerMsg.includes('monthly')) {
      return `## Monthly Trends

${store.monthlyTrend.map(m => `- **${m.month}**: Actual ${m.actual.toLocaleString()}, Forecast ${m.forecast.toLocaleString()}, Orders ${m.orders.toLocaleString()}`).join('\n')}

**Total Orders:** ${store.kpis.totalOrders.toLocaleString()}
**Forecast Accuracy:** ${store.kpis.forecastAccuracy.toFixed(1)}%`;
    }

    // Categories
    if (lowerMsg.includes('category')) {
      return `## Category Breakdown

${store.topCategories.map(c => `- **${c.name}**: $${Math.round(c.value).toLocaleString()}`).join('\n')}

**Total Categories:** ${store.topCategories.length}`;
    }

    // Default data-driven response when store exists
    return `## Data Summary

Based on your uploaded file (**${data?.name || store.fileName}**):

### Key Metrics
- **Total SKUs:** ${store.kpis.totalSKUs}
- **Total Revenue:** $${Math.round(store.kpis.totalRevenue).toLocaleString()}
- **Forecast Accuracy:** ${store.kpis.forecastAccuracy.toFixed(1)}%
- **Avg Stock Coverage:** ${store.kpis.avgCoverage.toFixed(1)} months
- **Total Orders:** ${store.kpis.totalOrders.toLocaleString()}

### Top 5 Materials
${store.materials.sort((a, b) => b.totalSales - a.totalSales).slice(0, 5).map(m => `- **${m.id}** (${m.description}): ${m.totalSales.toLocaleString()} units sold, $${Math.round(m.totalSales * m.price).toLocaleString()} revenue`).join('\n')}

### Monthly Trend
${store.monthlyTrend.map(m => `- **${m.month}**: Actual ${m.actual.toLocaleString()}, Forecast ${m.forecast.toLocaleString()}`).join('\n')}

*Ask me about ABC classification, stock coverage, forecast accuracy, or specific materials for more details.*`;
  }

  // Raw-data fallback (no parsed store)
  if (lowerMsg.includes('order value') && (lowerMsg.includes('month') || lowerMsg.includes('ytd'))) {
    return `**Total Revenue (YTD):** $${totalRevenue.toLocaleString()}\n\nBased on ${rows.length.toLocaleString()} records.`;
  }

  if (lowerMsg.includes('target') && (lowerMsg.includes('sales') || lowerMsg.includes('order'))) {
    const gap = totalTarget - totalRevenue;
    const achievement = totalTarget > 0 ? (totalRevenue / totalTarget * 100).toFixed(1) : 'N/A';
    return `| Target | $${totalTarget.toLocaleString()} |\n| Actual | $${totalRevenue.toLocaleString()} |\n| Gap | $${gap.toLocaleString()} |\n| Achievement | ${achievement}% |`;
  }

  if (lowerMsg.includes('forecast') || lowerMsg.includes('full year') || lowerMsg.includes('projection')) {
    const monthlyAvg = totalRevenue / 12;
    return `**Projected Revenue:** $${(monthlyAvg * 12).toLocaleString()} (based on current average of $${monthlyAvg.toLocaleString()}/month)`;
  }

  if (lowerMsg.includes('country') || lowerMsg.includes('market') || lowerMsg.includes('region')) {
    if (!countryCol) return `No country/region column found in your data. Available columns: ${headers.join(', ')}`;
  }

  if (lowerMsg.includes('container') || lowerMsg.includes('transit') || lowerMsg.includes('shipment')) {
    return `Container tracking requires shipment-specific columns (Container, ETD, ETA, Destination). Your current columns: ${headers.join(', ')}`;
  }

  if (lowerMsg.includes('p&l') || lowerMsg.includes('profit and loss') || lowerMsg.includes('margin')) {
    const margin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 'N/A';
    return `| Revenue | $${totalRevenue.toLocaleString()} | 100% |\n${profitCol ? `| Gross Profit | $${totalProfit.toLocaleString()} | ${margin}% |` : ''}`;
  }

  // Ultimate default
  return `## Analysis Results

Based on **${data?.name || 'uploaded data'}** (${rows.length.toLocaleString()} rows):

${revenueCol ? `- **Total Revenue:** $${totalRevenue.toLocaleString()}` : ''}
${profitCol ? `- **Total Profit:** $${totalProfit.toLocaleString()}` : ''}
${targetCol ? `- **Total Target:** $${totalTarget.toLocaleString()}` : ''}

**Columns detected:** ${headers.join(', ')}

Try asking about revenue, targets, forecasts, or upload a file with material/SKU columns for inventory insights.`;
}

// Check if API key is configured
export function isGeminiConfigured(): boolean {
  return true; // Config validation now happens server-side
}

export default {
  generateGeminiResponse,
  isGeminiConfigured,
  buildDataContext,
};
