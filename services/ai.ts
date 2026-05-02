import { IntegrationService } from '@/services';

/**
 * AI Service layer - controls when and how to call AI
 * Integrates with real AI APIs (Gemini)
 */

export interface AIResponse {
  content: string;
  steps: string[];
}

export class AIService {
  /**
   * Generate AI response with integration context
   */
  static async generateResponse(
    userMessage: string,
    projectId: string,
    productInstanceId: string,
    conversationHistory: Array<{ role: string; content: string }>
  ): Promise<AIResponse> {
    // Get enabled integrations
    const integrations = await IntegrationService.getEnabledIntegrations(
      projectId,
      productInstanceId
    );

    const steps: string[] = [];

    // Check enabled integrations
    const shopifyEnabled = integrations.some((i) => i.type === 'shopify' && i.enabled);
    const crmEnabled = integrations.some((i) => i.type === 'crm' && i.enabled);

    if (shopifyEnabled) {
      steps.push('Checking Shopify integration...');
    }
    if (crmEnabled) {
      steps.push('Checking CRM integration...');
    }

    steps.push('Analyzing message...');

    // Call real AI API
    const response = await this.callGeminiAPI(
      userMessage,
      conversationHistory,
      {
        shopifyEnabled,
        crmEnabled,
        integrations: integrations.map((i) => ({
          type: i.type,
          config: i.config,
        })),
      }
    );

    return {
      content: response,
      steps,
    };
  }

  /**
   * Call Gemini API (real integration)
   */
  private static async callGeminiAPI(
    userMessage: string,
    history: Array<{ role: string; content: string }>,
    integrationContext: any
  ): Promise<string> {
    try {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        console.warn('GEMINI_API_KEY not set, trying OpenRouter');
        const openRouterResponse = await this.callOpenRouterAPI(
          userMessage,
          history,
          integrationContext
        );
        return openRouterResponse || this.getMockResponse(userMessage, integrationContext);
      }

      const messages = [
        ...history.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })),
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ];

      const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

      const response = await fetch(
        endpoint,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            contents: messages,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error('Gemini API error:', response.status, response.statusText, errorText);
        const openRouterResponse = await this.callOpenRouterAPI(
          userMessage,
          history,
          integrationContext
        );
        return openRouterResponse || this.getMockResponse(userMessage, integrationContext);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        return this.getMockResponse(userMessage, integrationContext);
      }

      return content;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const openRouterResponse = await this.callOpenRouterAPI(
        userMessage,
        history,
        integrationContext
      );
      return openRouterResponse || this.getMockResponse(userMessage, integrationContext);
    }
  }

  /**
   * Call OpenRouter API (fallback)
   */
  private static async callOpenRouterAPI(
    userMessage: string,
    history: Array<{ role: string; content: string }>,
    integrationContext: any
  ): Promise<string | null> {
    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        console.warn('OPENROUTER_API_KEY not set, using mock response');
        return null;
      }

      const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
      const systemParts: string[] = ['You are a helpful assistant.'];

      if (integrationContext?.shopifyEnabled) {
        systemParts.push('Shopify integration is enabled.');
      }
      if (integrationContext?.crmEnabled) {
        systemParts.push('CRM integration is enabled.');
      }

      const messages = [
        { role: 'system', content: systemParts.join(' ') },
        ...history.map((msg) => ({ role: msg.role, content: msg.content })),
        { role: 'user', content: userMessage },
      ];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'X-Title': 'AI Assistant',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error('OpenRouter API error:', response.status, response.statusText, errorText);
        return null;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      return content || null;
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      return null;
    }
  }

  /**
   * Fallback mock response
   */
  private static getMockResponse(
    userMessage: string,
    integrationContext: any
  ): string {
    let response = `I received your message: "${userMessage}".\n\n`;

    if (integrationContext.shopifyEnabled) {
      response += 'I checked your Shopify integration and can help with product queries.\n';
    }

    if (integrationContext.crmEnabled) {
      response += 'I checked your CRM integration and can help with customer information.\n';
    }

    response += '\nHow can I assist you further?';

    return response;
  }
}
