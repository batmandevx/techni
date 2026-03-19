import { NextRequest, NextResponse } from 'next/server';

interface MessageHistory {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, language, userInfo, history, context } = await request.json();
    
    // Get context data
    const kpis = context?.kpis || {};
    const orders = context?.orders || [];
    const customers = context?.customers || [];
    const materials = context?.materials || [];
    const historicalData = context?.historicalData || {};
    
    const targetLanguage = language || 'English';
    const userRole = userInfo?.role || 'User';
    const userName = userInfo?.name || 'Admin';
    const localTime = userInfo?.currentTime || new Date().toLocaleString();

    // Try Gemini if API key exists
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.length > 10 && !apiKey.includes('your-api-key')) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        const hasData = orders.length > 0 || customers.length > 0;
        
        const prompt = buildAIPrompt(message, {
          targetLanguage,
          userName,
          userRole,
          localTime,
          hasData,
          kpis,
          orders,
          customers,
          materials,
          history: history || []
        });

        const result = await model.generateContent(prompt);
        const response = result.response.text();
        return NextResponse.json({ response, source: 'gemini' });
        
      } catch (geminiError) {
        console.log('Gemini failed, using enhanced fallback');
      }
    }

    // Enhanced Fallback AI Response
    const response = generateAIResponse(message, {
      targetLanguage,
      userName,
      userRole,
      localTime,
      kpis,
      orders,
      customers,
      materials,
      historicalData,
      history: history || []
    });

    return NextResponse.json({ response, source: 'ai-fallback' });
    
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({
      response: `❌ I apologize, but I encountered an error. Please try again in a moment.`,
      source: 'error'
    }, { status: 500 });
  }
}

function buildAIPrompt(message: string, context: any): string {
  const { targetLanguage, userName, hasData, kpis, orders, customers, materials, history } = context;
  
  return `You are Tenchi AI, an intelligent Supply Chain & Operations Planning assistant. 

CONTEXT:
- User: ${userName}
- Language: ${targetLanguage}
- Time: ${context.localTime}
- Data Available: ${hasData ? 'Yes' : 'No'}

BUSINESS DATA:
${hasData ? `
- Orders: ${orders.length} (Revenue: $${kpis.totalRevenue?.toLocaleString() || 0})
- Customers: ${customers.length}
- Materials: ${materials.length}
- Fill Rate: ${kpis.fillRate || 0}%
- Forecast Accuracy: ${kpis.forecastAccuracy || 0}%
- Inventory Turns: ${kpis.inventoryTurns || 0}x
` : '- No business data uploaded yet'}

CONVERSATION HISTORY:
${history.slice(-3).map((h: MessageHistory) => `${h.role}: ${h.content.substring(0, 100)}`).join('\n')}

USER MESSAGE: ${message}

INSTRUCTIONS:
1. Respond in ${targetLanguage} language
2. Be conversational, professional, and helpful
3. Use markdown formatting with relevant emojis
4. Reference actual data when available
5. If no data, guide user to upload data
6. Keep response under 200 words
7. Show personality - be friendly but professional

RESPOND:`;
}

function generateAIResponse(message: string, context: any): string {
  const { targetLanguage, userName, kpis, orders, customers, materials, history } = context;
  const lowerMsg = message.toLowerCase();
  const hasData = orders.length > 0 || customers.length > 0 || (kpis.totalRevenue && kpis.totalRevenue > 0);
  
  // Greeting detection
  const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening|greetings|howdy|hola|bonjour|ciao)/i.test(message.trim());
  
  // Question classification
  const isQuestion = message.includes('?') || /^(what|how|why|when|where|who|which|can|could|would|will|is|are|do|does|did)/i.test(message);
  
  // Topic detection
  const topics = {
    orders: /order|sale|revenue|purchase|transaction/i.test(message),
    customers: /customer|client|buyer|account/i.test(message),
    inventory: /inventory|stock|material|product|sku|warehouse/i.test(message),
    forecast: /forecast|predict|future|trend|projection/i.test(message),
    kpi: /kpi|metric|performance|dashboard|analytics|report/i.test(message),
    help: /help|assist|support|guide|how to/i.test(message),
    joke: /joke|funny|humor|laugh/i.test(message),
    thanks: /thank|thanks|appreciate|grateful/i.test(message)
  };

  // Generate contextual greeting
  const greetings: Record<string, string> = {
    English: 'Hello',
    Spanish: '¡Hola',
    French: 'Bonjour',
    German: 'Hallo',
    Japanese: 'こんにちは',
    Mandarin: '你好'
  };
  const greeting = greetings[targetLanguage] || greetings.English;

  // Response generators
  if (topics.joke) {
    const jokes = [
      "Why did the supply chain manager bring a ladder to work? Because they heard the inventory was in the cloud! ☁️😄",
      "What do you call a nervous shipment? A freight train! 🚂😂",
      "Why don't supply chains ever play hide and seek? Because good luck hiding when everything is tracked in real-time! 📍🤣",
      "What's a warehouse's favorite game? Stock-er! 📦🎮"
    ];
    return `😄 **Here's one for you:**

${jokes[Math.floor(Math.random() * jokes.length)]}

Need any *serious* supply chain insights? I'm here to help! 💼`;
  }

  if (topics.thanks) {
    return `🙏 **You're very welcome, ${userName}!** 

I'm always here to help you optimize your supply chain operations. Feel free to ask about:
• 📊 Performance metrics and KPIs
• 📦 Order management
• 👥 Customer insights
• 📈 Forecasting and planning

Have a productive day! 🚀`;
  }

  if (isGreeting || (!isQuestion && !Object.values(topics).some(t => t))) {
    return `👋 **${greeting}, ${userName}!** 

I'm **Tenchi AI**, your supply chain intelligence partner. 🤖

${hasData 
  ? `Great to see you! I have access to your current business data:

📊 **Quick Snapshot:**
• 📦 **${orders.length}** orders processed
• 💰 **$${(kpis.totalRevenue || 0).toLocaleString()}** total revenue
• 👥 **${customers.length}** active customers
• 📈 **${kpis.fillRate || 0}%** fill rate

What would you like to dive deeper into? 💡`
  : `I notice you haven't uploaded any data yet. Here's how to get started:

🚀 **Quick Setup:**
1. Go to **Upload Data** page
2. Import your orders, customers, or materials
3. Start getting AI-powered insights!

Or just ask me anything about S&OP best practices! 📚`
}`;
  }

  if (topics.orders) {
    if (!hasData) {
      return `📦 **Orders Analysis**

I'd love to help analyze your orders, but I don't see any data yet. 

**To get order insights:**
1. Navigate to **Upload Data** 📤
2. Upload your order history (Excel/CSV)
3. I'll analyze trends, top customers, and revenue patterns

Once uploaded, I can tell you about:
• Top-selling products
• Revenue trends
• Customer buying patterns
• Seasonal variations

Ready to upload? 🚀`;
    }
    
    const topOrders = orders.slice(0, 5);
    const avgOrderValue = orders.length > 0 
      ? Math.round((kpis.totalRevenue || 0) / orders.length).toLocaleString() 
      : 0;
    
    return `📦 **Orders Intelligence for ${userName}**

**Key Performance:**
• 📊 **${orders.length.toLocaleString()}** total orders
• 💰 **$${(kpis.totalRevenue || 0).toLocaleString()}** revenue generated
• 📈 **$${avgOrderValue}** average order value
• ✅ **${kpis.fillRate || 0}%** fill rate

${topOrders.length > 0 ? `**Recent High-Value Orders:**
${topOrders.map((o: any, i: number) => 
  `${i + 1}. **${o.orderId || o.id}** — ${o.customer?.name || 'Customer'} — $${(o.totalAmount || 0).toLocaleString()}`
).join('\n')}` : ''}

💡 **Insight:** ${kpis.fillRate && kpis.fillRate < 95 
  ? `Your fill rate is at ${kpis.fillRate}%. Consider reviewing safety stock levels for high-velocity items.` 
  : kpis.fillRate && kpis.fillRate >= 98 
    ? 'Excellent fulfillment performance! You\'re exceeding industry standards.' 
    : 'Your order fulfillment is performing well. Keep monitoring lead times!'
}

Want me to analyze specific order patterns or trends? 📊`;
  }

  if (topics.customers) {
    if (!hasData) {
      return `👥 **Customer Insights**

No customer data detected. Upload your customer master data to unlock:

• Geographic distribution 🌍
• Purchase behavior analysis 🛒
• Customer segmentation 👤
• Lifetime value predictions 💎

Go to **Upload Data** to get started! 📤`;
    }
    
    const topCustomers = customers.slice(0, 5);
    
    return `👥 **Customer Intelligence**

**Portfolio Overview:**
• 👤 **${customers.length}** active customers
• 🎯 **${kpis.activeCustomers || customers.length}** engaged accounts
• 💎 **${topCustomers.length}** top-tier customers

${topCustomers.length > 0 ? `**Key Accounts:**
${topCustomers.map((c: any, i: number) => 
  `${i + 1}. **${c.name}** (${c.id}) — ${c.country || 'N/A'}${c.industry ? ` — ${c.industry}` : ''}`
).join('\n')}` : ''}

💡 **Recommendation:** Regular customer segmentation analysis helps identify growth opportunities and churn risks. Would you like me to analyze any specific customer metrics? 📈`;
  }

  if (topics.inventory) {
    if (!hasData) {
      return `📦 **Inventory Management**

I can help optimize your inventory, but I need your materials data first.

**Upload to see:**
• Stock coverage analysis 📊
• Reorder recommendations 📋
• Stockout risk alerts ⚠️
• ABC classification 🎯

Head to **Upload Data** and import your materials master! 📤`;
    }
    
    return `📦 **Inventory Intelligence**

**Current Position:**
• 📦 **${materials.length}** SKUs in portfolio
• 🔄 **${kpis.inventoryTurns || 0}x** inventory turnover
• 📅 **${kpis.stockCoverage || 0}** days of coverage
• ⚠️ **${kpis.stockoutRisk || 0}%** stockout risk

${materials.length > 0 ? `**Key Materials:**
${materials.slice(0, 3).map((m: any, i: number) => 
  `• **${m.name || m.id}** — Stock: ${m.currentStock || 0} ${m.unit || 'units'}${m.reorderPoint ? ` (ROP: ${m.reorderPoint})` : ''}`
).join('\n')}` : ''}

🚨 **Action Required:** ${kpis.stockoutRisk && kpis.stockoutRisk > 20 
  ? `High stockout risk detected (${kpis.stockoutRisk}%)! Review safety stock immediately.` 
  : kpis.stockCoverage && kpis.stockCoverage < 14 
    ? 'Low stock coverage. Consider expediting critical materials.' 
    : 'Inventory levels are healthy. Monitor for seasonal fluctuations.'
}

Need specific material analysis or reorder recommendations? 🔍`;
  }

  if (topics.kpi || topics.forecast) {
    if (!hasData) {
      return `📊 **Performance Analytics**

I'd love to show you KPIs and forecasts, but I need your data first!

**Upload to see:**
• Forecast accuracy trends 📈
• Inventory optimization metrics 📊
• Service level performance ✅
• Financial impact analysis 💰

Visit **Upload Data** to unlock your analytics dashboard! 🚀`;
    }
    
    return `📊 **Performance Dashboard**

**Operational Excellence:**
• 🎯 Forecast Accuracy: **${kpis.forecastAccuracy || 0}%**
• 🔄 Inventory Turns: **${kpis.inventoryTurns || 0}x**
• ✅ Fill Rate: **${kpis.fillRate || 0}%**
• 📅 Stock Coverage: **${kpis.stockCoverage || 0} days**
• ⚠️ Stockout Risk: **${kpis.stockoutRisk || 0}%**

**Business Impact:**
• 💰 Revenue: **$${(kpis.totalRevenue || 0).toLocaleString()}**
• 📦 Orders: **${orders.length}**
• 👥 Customers: **${customers.length}**

${kpis.forecastAccuracy && kpis.forecastAccuracy > 90 
  ? '🌟 **Excellent!** Your forecast accuracy is top-tier.' 
  : kpis.forecastAccuracy && kpis.forecastAccuracy < 80 
    ? '⚠️ **Attention:** Forecast accuracy needs improvement. Review demand planning parameters.' 
    : '💡 **Trend:** Performance is within normal range. Continue monitoring.'
}

Want deeper analysis on any specific KPI? 📈`;
  }

  if (topics.help) {
    return `🆘 **How Can I Help You?**

I'm Tenchi AI, your S&OP assistant. Here's what I can do:

📊 **Data Analysis**
• Analyze orders, customers, and inventory
• Calculate KPIs and performance metrics
• Identify trends and patterns

🔮 **Planning Support**
• Demand forecasting insights
• Inventory optimization recommendations
• Replenishment suggestions

📋 **Reporting**
• Summarize business performance
• Generate insights from your data
• Answer questions in multiple languages

💡 **Getting Started**
${hasData 
  ? 'You have data uploaded! Try asking:\n• "Show me my orders"\n• "What\'s my inventory status?"\n• "Analyze my KPIs"'
  : 'Upload your data first:\n1. Go to Upload Data page\n2. Import orders/customers/materials\n3. Start asking questions!'
}

What would you like to explore? 🚀`;
  }

  // Default intelligent response
  return `🤔 **I understand you're asking about:** *"${message}"*

${hasData 
  ? `Based on your current data, here's what I know:

📊 **Business Snapshot:**
• 📦 **${orders.length}** orders | 💰 **$${(kpis.totalRevenue || 0).toLocaleString()}** revenue
• 👥 **${customers.length}** customers | 📦 **${materials.length}** materials
• ✅ **${kpis.fillRate || 0}%** fill rate | 📈 **${kpis.forecastAccuracy || 0}%** forecast accuracy

To give you a more specific answer, try rephrasing with keywords like:
• "orders" — for sales analysis
• "customers" — for client insights  
• "inventory" — for stock management
• "KPIs" — for performance metrics
• "forecast" — for planning insights`
  : `I'd love to help, but I don't have any data to analyze yet. 

🚀 **Get Started:**
1. Visit **Upload Data** page
2. Import your business data (orders, customers, materials)
3. Ask me anything!

I'm ready to provide AI-powered insights once your data is uploaded. 📊`
}

What else can I help you with? 💬`;
}
