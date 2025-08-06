"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Item {
  name: string;
  price: number;
  id: string;
  assignedTo?: string[];
}

interface Person {
  id: string;
  name: string;
}

export default function AssignItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [newPersonName, setNewPersonName] = useState("");
  const [tip, setTip] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    // Load data from localStorage
    const receiptItems = localStorage.getItem("receiptItems");
    const receiptTip = localStorage.getItem("receiptTip");
    const receiptTax = localStorage.getItem("receiptTax");

    if (receiptItems) {
      try {
        const parsedItems = JSON.parse(receiptItems);
        const itemsWithAssignment = parsedItems.map((item: any) => ({
          ...item,
          assignedTo: [],
        }));
        setItems(itemsWithAssignment);
      } catch (error) {
        console.error("Failed to parse receipt items:", error);
      }
    }

    if (receiptTip) {
      setTip(parseFloat(receiptTip) || 0);
    }

    if (receiptTax) {
      setTax(parseFloat(receiptTax) || 0);
    }
  }, []);

  const addPerson = () => {
    if (newPersonName.trim()) {
      const newPerson: Person = {
        id: `person-${Date.now()}`,
        name: newPersonName.trim(),
      };
      setPeople([...people, newPerson]);
      setNewPersonName("");
    }
  };

  const removePerson = (personId: string) => {
    setPeople(people.filter((p) => p.id !== personId));
    // Remove this person from all item assignments
    setItems(
      items.map((item) => ({
        ...item,
        assignedTo: item.assignedTo?.filter((id) => id !== personId) || [],
      }))
    );
  };

  const toggleItemAssignment = (itemId: string, personId: string) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const currentAssignments = item.assignedTo || [];
          const isAssigned = currentAssignments.includes(personId);

          return {
            ...item,
            assignedTo: isAssigned
              ? currentAssignments.filter((id) => id !== personId)
              : [...currentAssignments, personId],
          };
        }
        return item;
      })
    );
  };

  const splitEvenly = () => {
    if (people.length === 0) {
      alert("Please add at least one person first");
      return;
    }

    setItems(
      items.map((item) => ({
        ...item,
        assignedTo: people.map((p) => p.id),
      }))
    );
  };

  const getPersonName = (personId: string) => {
    const person = people.find((p) => p.id === personId);
    return person ? person.name : "Unknown";
  };

  const handleContinue = () => {
    if (people.length === 0) {
      alert("Please add at least one person");
      return;
    }

    const hasUnassignedItems = items.some(
      (item) => !item.assignedTo || item.assignedTo.length === 0
    );
    if (hasUnassignedItems) {
      const confirmContinue = confirm(
        "Some items are not assigned to anyone. Continue anyway?"
      );
      if (!confirmContinue) return;
    }

    // Store assignment data for the summary page
    localStorage.setItem("finalItems", JSON.stringify(items));
    localStorage.setItem("finalPeople", JSON.stringify(people));
    localStorage.setItem("finalTip", tip.toString());
    localStorage.setItem("finalTax", tax.toString());

    router.push("/split-summary");
  };

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <main className="p-4 max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-4 text-orange-600 hover:text-orange-800 hover:underline font-medium"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-2">Assign Items</h1>
      <p className="text-gray-500 mb-6">Type all the names and assign items</p>

      {/* Add Person Section */}
      <div className="mb-6 p-6 border-2 border-orange-200 rounded-xl bg-gradient-to-br from-orange-50 to-indigo-50 shadow-sm">
        <h3 className="font-bold mb-4 text-orange-800 text-lg">Add People</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newPersonName}
            onChange={(e) => setNewPersonName(e.target.value)}
            placeholder="Enter person's name"
            className="flex-1 p-3 border-2 border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm"
            onKeyPress={(e) => e.key === "Enter" && addPerson()}
          />
          <button
            onClick={addPerson}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
          >
            + Add Person
          </button>
        </div>

        {/* People List */}
        <div className="space-y-2">
          {people.map((person) => (
            <div
              key={person.id}
              className="flex justify-between items-center p-3 bg-white border-2 border-orange-100 rounded-lg shadow-sm"
            >
              <span className="font-medium text-black">{person.name}</span>
              <button
                onClick={() => removePerson(person.id)}
                className="px-3 py-1 text-orange-600 hover:bg-orange-50 rounded-md transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Assign Items Section */}
      {people.length > 0 && (
        <>
          <hr className="mb-6 border-purple-200" />
          <div className="mb-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-purple-800">
                Assign Items
              </h3>
              <button
                onClick={splitEvenly}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                Split Evenly
              </button>
            </div>

            {/* Item Cards */}
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border-2 border-purple-200 rounded-xl p-5 bg-gradient-to-br from-white to-purple-25 shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="font-bold text-black text-lg">
                        {item.name}
                      </h4>
                      <p className="text-black font-semibold text-lg">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-full font-medium">
                      {item.assignedTo?.length || 0} / {people.length} people
                    </div>
                  </div>

                  {/* Assignment checkboxes */}
                  <div className="grid grid-cols-2 gap-3">
                    {people.map((person) => (
                      <label
                        key={person.id}
                        className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-orange-50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={
                            item.assignedTo?.includes(person.id) || false
                          }
                          onChange={() =>
                            toggleItemAssignment(item.id, person.id)
                          }
                          className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 focus:ring-2"
                        />
                        <span className="text-sm font-medium text-black">
                          {person.name}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Show who's assigned */}
                  {item.assignedTo && item.assignedTo.length > 0 && (
                    <div className="mt-3 text-sm text-orange-700 bg-orange-50 p-2 rounded-lg">
                      <span className="font-medium">Assigned to:</span>{" "}
                      {item.assignedTo
                        .map((id) => getPersonName(id))
                        .join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Summary */}
      {people.length > 0 && items.length > 0 && (
        <div className="mb-6 p-6 bg-gradient-to-br from-orange-50 to-indigo-50 rounded-xl border-2 border-orange-200 shadow-sm">
          <h3 className="font-bold mb-3 text-orange-800 text-lg">Summary</h3>
          <div className="text-sm text-black space-y-2">
            <div className="flex justify-between">
              <span className="text-black">Subtotal:</span>
              <span className="font-semibold text-black">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            {tip > 0 && (
              <div className="flex justify-between">
                <span className="text-black">Tip:</span>
                <span className="font-semibold text-black">
                  ${tip.toFixed(2)}
                </span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between">
                <span className="text-black">Tax:</span>
                <span className="font-semibold text-black">
                  ${tax.toFixed(2)}
                </span>
              </div>
            )}
            <hr className="border-orange-200" />
            <div className="flex justify-between font-bold text-lg text-black">
              <span>Total:</span>
              <span>${(subtotal + tip + tax).toFixed(2)}</span>
            </div>
            <div className="mt-3 text-center text-orange-600 font-medium">
              {people.length} People • {items.length} Items
            </div>
          </div>
        </div>
      )}

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        disabled={people.length === 0}
        className="w-full bg-gradient-to-r from-orange-600 to-indigo-600 text-white px-6 py-4 rounded-xl shadow-lg hover:from-orange-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-bold text-lg hover:shadow-xl"
      >
        Continue to Summary
      </button>

      {people.length === 0 && (
        <p className="text-center text-orange-600 text-sm mt-3 font-medium">
          Add at least one person to continue
        </p>
      )}
    </main>
  );
}
