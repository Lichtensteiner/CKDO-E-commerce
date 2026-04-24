import { GoogleGenAI, Type } from "@google/genai";
import { Product, Order } from "../types";

// Initialize Gemini API
const genAI = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

const model = "gemini-3-flash-preview";

export interface ShoppingPlan {
  recipeName: string;
  servings: number;
  description: string;
  suggestedItems: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    reason: string;
  }[];
  totalEstimatedPrice: number;
}

export const geminiService = {
  /**
   * Functionality 1: Intelligent Shopping Assistant
   * Proposes recipes and creates a shopping list based on user prompt and catalog.
   */
  async planShopping(prompt: string, catalog: Product[]): Promise<ShoppingPlan> {
    const ai = genAI;
    
    // Create a simplified version of the catalog for the prompt
    const catalogBrief = catalog.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price
    }));

    const response = await ai.models.generateContent({
      model,
      contents: `
        You are an intelligent shopping assistant for a supermarket in Gabon (CKDO).
        Your goal is to help users find ingredients for their meals and create a shopping list.
        
        USER REQUEST: "${prompt}"
        
        AVAILABLE CATALOG:
        ${JSON.stringify(catalogBrief.slice(0, 50))} // Limit size to avoid token overflow
        
        INSTRUCTIONS:
        1. Suggest a relevant recipe based on local Gabonese habits (e.g. Poulet à la Nyembwe, Coupé-Coupé, sauces locales).
        2. Select the best matching items from the AVAILABLE CATALOG.
        3. Calculate the necessary quantities for the requested number of people.
        4. Return a JSON object with the specified schema.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipeName: { type: Type.STRING },
            servings: { type: Type.NUMBER },
            description: { type: Type.STRING },
            suggestedItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productId: { type: Type.STRING },
                  productName: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  price: { type: Type.NUMBER },
                  reason: { type: Type.STRING }
                },
                required: ["productId", "productName", "quantity", "price", "reason"]
              }
            },
            totalEstimatedPrice: { type: Type.NUMBER }
          },
          required: ["recipeName", "servings", "description", "suggestedItems", "totalEstimatedPrice"]
        }
      }
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      throw new Error("Erreur de l'assistant intelligent. Veuillez réessayer.");
    }
  },

  /**
   * Functionality 2: Behavioral Recommendations
   * Recommends products based on history and current cart.
   */
  async getRecommendations(
    cart: Product[], 
    history: Order[], 
    catalog: Product[]
  ): Promise<Product[]> {
    const ai = genAI;

    // Filter catalog to avoid sending too much data
    const featuredCatalog = catalog.filter(p => p.isActive).slice(0, 30);

    const response = await ai.models.generateContent({
      model,
      contents: `
        You are a recommendation engine for a supermarket.
        CURRENT CART: ${JSON.stringify(cart.map(p => p.name))}
        PAST ORDERS: ${JSON.stringify(history.slice(0, 5).map(o => o.items.map((i: any) => i.name)))}
        CATALOG SAMPLES: ${JSON.stringify(featuredCatalog.map(p => ({ id: p.id, name: p.name })))}
        
        TASK:
        Return a list of up to 4 product IDs from the CATALOG SAMPLES that the user might have forgotten or that pair well with their cart/history.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["recommendedIds"]
        }
      }
    });

    try {
      const data = JSON.parse(response.text || '{"recommendedIds": []}');
      return catalog.filter(p => data.recommendedIds.includes(p.id));
    } catch (e) {
      return [];
    }
  },

  /**
   * Functionality 3: Monthly Course Prediction
   */
  async predictMonthlyCourses(history: Order[], catalog: Product[]): Promise<Product[]> {
    // Basic logic: high frequency items from last month
    const ai = genAI;
    
    const allItemNames = history.flatMap(o => o.items.map((i: any) => i.name));
    
    // We could use Gemini to identify the "Essential" recurrence
    const response = await ai.models.generateContent({
      model,
      contents: `
        Analyze these historical purchases: ${JSON.stringify(allItemNames)}
        Identify the top 6 recurring essential items (staples) that this user likely needs every month.
        Return their names as an array.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            staples: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["staples"]
        }
      }
    });

    try {
      const data = JSON.parse(response.text || '{"staples": []}');
      // Find matches in catalog (fuzzy match)
      return catalog.filter(p => 
        data.staples.some((s: string) => p.name.toLowerCase().includes(s.toLowerCase()))
      ).slice(0, 10);
    } catch (e) {
      return [];
    }
  }
};
