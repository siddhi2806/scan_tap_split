"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Item {
  name: string;
  price: number;
  id: string;
}

export default function ManualEntry() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [tip, setTip] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const router = useRouter();

  // Common preset items
  const presetItems = [
    { name: "Coffee", price: 4.5 },
    { name: "Sandwich", price: 12.99 },
    { name: "Salad", price: 14.5 },
    { name: "Burger", price: 16.99 },
    { name: "Pizza (slice)", price: 3.5 },
    { name: "Soda", price: 2.99 },
    { name: "Beer", price: 6.5 },
    { name: "Appetizer", price: 8.99 },
  ];

  const addItem = () => {
    if (newItemName.trim() && newItemPrice.trim()) {
      const price = parseFloat(newItemPrice);
      if (isNaN(price) || price < 0) {
        alert("Please enter a valid price");
        return;
      }

      const newItem: Item = {
        id: `item-${Date.now()}`,
        name: newItemName.trim(),
        price: price,
      };

      setItems([...items, newItem]);
      setNewItemName("");
      setNewItemPrice("");
    } else {
      alert("Please enter both item name and price");
    }
  };

  const addPresetItem = (presetItem: { name: string; price: number }) => {
    const newItem: Item = {
      id: `item-${Date.now()}`,
      name: presetItem.name,
      price: presetItem.price,
    };
    setItems([...items, newItem]);
  };

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

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal + tip + tax;

  const handleContinue = () => {
    if (items.length === 0) {
      alert("Please add at least one item");
      return;
    }

    // Store items for the next page (same as edit-receipt page)
    localStorage.setItem("receiptItems", JSON.stringify(items));
    localStorage.setItem("receiptTip", tip.toString());
    localStorage.setItem("receiptTax", tax.toString());
    router.push("/assign-items");
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action();
    }
  };

  return (
    <main className="p-4 max-w-xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-4 text-orange-500 hover:underline"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-2">Enter Items Manually</h1>
      <p className="text-gray-500 mb-6">Add items and their prices manually</p>

      {/* Add New Item Section */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <h3 className="font-semibold mb-3">Add New Item</h3>
        <div className="space-y-3">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Item name (e.g., Coffee, Sandwich)"
            className="w-full p-3 border rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            onKeyPress={(e) => handleKeyPress(e, addItem)}
          />
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="number"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="Price (e.g., 4.50)"
                step="0.01"
                min="0"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onKeyPress={(e) => handleKeyPress(e, addItem)}
              />
            </div>
            <button
              onClick={addItem}
              className="px-6 py-3 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            >
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Items List */}
      {items.length > 0 && (
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold">Items ({items.length})</h3>
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-2 items-center p-3 border rounded-lg bg-white"
            >
              <div className="flex-1">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, "name", e.target.value)}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="w-28">
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    updateItem(
                      item.id,
                      "price",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  step="0.01"
                  min="0"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="px-3 py-2 text-orange-500 hover:bg-orange-50 rounded transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tip and Tax Section */}
      <div className="mb-6">
        <hr className="mb-4" />
        <h3 className="font-semibold mb-3">Additional Charges</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-gray-700 font-medium">Tip:</label>
            <input
              type="number"
              value={tip}
              onChange={(e) => setTip(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-28 p-2 border rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="flex justify-between items-center">
            <label className="text-gray-700 font-medium">Tax:</label>
            <input
              type="number"
              value={tax}
              onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-28 p-2 border rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Total Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {tip > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tip:</span>
              <span>${tip.toFixed(2)}</span>
            </div>
          )}
          {tax > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
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
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        disabled={items.length === 0}
        className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg shadow hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        Continue to Assign Items
      </button>

      {items.length === 0 && (
        <p className="text-center text-gray-500 text-sm mt-2">
          Add at least one item to continue
        </p>
      )}
    </main>
  );
}
