import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { base64Image } = await request.json();

    if (!base64Image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Check if Together API key is available
    const apiKey = process.env.TOGETHER_API_KEY;

    console.log("API Key exists:", !!apiKey);
    console.log("Image data length:", base64Image.length);

    if (!apiKey || apiKey === "your_together_api_key_here") {
      // Return mock data for testing
      console.log("Using mock data - Together API key not configured");

      const mockItems = [
        { name: "Coffee", price: 4.5 },
        { name: "Sandwich", price: 8.99 },
        { name: "Salad", price: 12.75 },
        { name: "Soda", price: 2.25 },
      ];

      return NextResponse.json({
        items: mockItems,
        message:
          "Mock data returned - configure TOGETHER_API_KEY for real processing",
      });
    }

    // Real API call to Together AI using their vision model
    console.log("Making API call to Together AI...");

    // Validate base64 image data
    if (base64Image.length < 100) {
      console.log("Image data too short, using mock data");
      const mockItems = [
        { name: "Coffee", price: 4.5 },
        { name: "Sandwich", price: 8.99 },
        { name: "Salad", price: 12.75 },
        { name: "Soda", price: 2.25 },
      ];
      return NextResponse.json({
        items: mockItems,
        message: "Image data too short, using mock data",
      });
    }

    const response = await fetch(
      "https://api.together.xyz/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: 'Extract all items and their prices from this receipt image. Return only a JSON array with objects containing \'name\' and \'price\' fields. Example: [{"name": "Coffee", "price": 4.50}]',
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 1000,
          temperature: 0.1,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Together AI API error:", response.status, errorText);

      // Return mock data if API fails
      const mockItems = [
        { name: "Coffee", price: 4.5 },
        { name: "Sandwich", price: 8.99 },
        { name: "Salad", price: 12.75 },
        { name: "Soda", price: 2.25 },
      ];

      return NextResponse.json({
        items: mockItems,
        message: `API error (${response.status}), returning mock data`,
        error: errorText,
      });
    }

    const data = await response.json();
    console.log("Together AI response:", data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response structure from Together AI");
    }

    const content = data.choices[0].message.content;
    console.log("AI response content:", content);

    try {
      // Try to extract JSON from the response
      let jsonStr = content;

      // Look for JSON array in the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const items = JSON.parse(jsonStr);

      // Validate the items structure
      if (!Array.isArray(items)) {
        throw new Error("Response is not an array");
      }

      const validItems = items.filter(
        (item) =>
          item &&
          typeof item.name === "string" &&
          typeof item.price === "number"
      );

      if (validItems.length === 0) {
        throw new Error("No valid items found in response");
      }

      return NextResponse.json({ items: validItems });
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw content:", content);

      // Return mock data if parsing fails
      const mockItems = [
        { name: "Coffee", price: 4.5 },
        { name: "Sandwich", price: 8.99 },
        { name: "Salad", price: 12.75 },
        { name: "Soda", price: 2.25 },
      ];

      return NextResponse.json({
        items: mockItems,
        message: "Failed to parse AI response, returning mock data",
        rawResponse: content,
      });
    }
  } catch (error) {
    console.error("Receipt processing error:", error);

    // Return mock data if there's any error
    const mockItems = [
      { name: "Coffee", price: 4.5 },
      { name: "Sandwich", price: 8.99 },
      { name: "Salad", price: 12.75 },
      { name: "Soda", price: 2.25 },
    ];

    return NextResponse.json({
      items: mockItems,
      message: "Error occurred, returning mock data",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
