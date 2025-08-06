"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Item {
  name: string;
  price: number;
  id?: string;
}

export default function EditReceipt() {
  const [items, setItems] = useState<Item[]>([]);
  const [tip, setTip] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    // Load extracted items from localStorage
    const extractedItems = localStorage.getItem("extractedItems");
    if (extractedItems) {
      try {
        const parsedItems = JSON.parse(extractedItems);
        // Add unique IDs to items
        const itemsWithIds = parsedItems.map((item: Item, index: number) => ({
          ...item,
          id: `item-${index}`,
        }));
        setItems(itemsWithIds);
      } catch (error) {
        console.error("Failed to parse extracted items:", error);
      }
    }
  }, []);

  const updateItem = (
    id: string,
    field: "name" | "price",
    value: string | number
  ) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const addNewItem = () => {
    const newItem: Item = {
      id: `item-${Date.now()}`,
      name: "",
      price: 0,
    };
    setItems([...items, newItem]);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal + tip + tax;

  const handleContinue = () => {
    // Store items for the next page
    localStorage.setItem("receiptItems", JSON.stringify(items));
    localStorage.setItem("receiptTip", tip.toString());
    localStorage.setItem("receiptTax", tax.toString());
    router.push("/assign-items");
  };

  return (
    <main className="p-4 max-w-xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-4 text-orange-500 hover:underline"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-2">Receipt Items</h1>
      <p className="text-gray-500 mb-6">List all the items on your receipt</p>

      {/* Items List */}
      <div className="space-y-3 mb-6">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex gap-2 items-center p-3 border rounded-lg"
          >
            <div className="flex-1">
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(item.id!, "name", e.target.value)}
                placeholder="Item name"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="w-24">
              <input
                type="number"
                value={item.price}
                onChange={(e) =>
                  updateItem(item.id!, "price", parseFloat(e.target.value) || 0)
                }
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => removeItem(item.id!)}
              className="px-3 py-2 text-orange-500 hover:bg-orange-50 rounded transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Add New Item Button */}
      <button
        onClick={addNewItem}
        className="w-full mb-6 p-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-orange-400 hover:text-orange-600 transition-colors"
      >
        + Add Item
      </button>

      {/* Tip and Tax Section */}
      <hr className="mb-4" />
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <label className="text-gray-700">Tip:</label>
          <input
            type="number"
            value={tip}
            onChange={(e) => setTip(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-24 p-2 border rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div className="flex justify-between items-center">
          <label className="text-gray-700">Tax:</label>
          <input
            type="number"
            value={tax}
            onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-24 p-2 border rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Total Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        {tip > 0 && (
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Tip:</span>
            <span>${tip.toFixed(2)}</span>
          </div>
        )}
        {tax > 0 && (
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Tax:</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        )}
        <hr className="my-2" />
        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        disabled={items.length === 0}
        className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg shadow hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        Continue
      </button>
    </main>
  );
}
