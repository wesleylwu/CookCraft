"use client";

import { useEffect, useState } from "react";
import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "@/database/api/ingredients";
import { Ingredient } from "@/types/database";
import { INGREDIENT_CATEGORIES, UNITS } from "@/types/database";
import { motion } from "motion/react";

const InventoryPage = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    quantity: 0,
    unit: "pieces",
    category: "Other",
    notes: "",
  });

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      const data = await getIngredients();
      setIngredients(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateIngredient(editingId, formData);
      } else {
        await createIngredient(formData);
      }
      await loadIngredients();
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingId(ingredient.id);
    setFormData({
      name: ingredient.name,
      quantity: Number(ingredient.quantity),
      unit: ingredient.unit,
      category: ingredient.category || "Other",
      notes: ingredient.notes || "",
    });
    setShowForm(true);
    setExpandedId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this ingredient?")) {
      try {
        await deleteIngredient(id);
        await loadIngredients();
        setExpandedId(null);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleQuickAdd = async (ingredient: Ingredient) => {
    try {
      await updateIngredient(ingredient.id, {
        quantity: Number(ingredient.quantity) + 1,
      });
      await loadIngredients();
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      quantity: 0,
      unit: "pieces",
      category: "Other",
      notes: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredIngredients = ingredients.filter((ing) => {
    const matchesSearch = ing.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory
      ? ing.category === filterCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const groupedIngredients = filteredIngredients.reduce(
    (acc, ing) => {
      const category = ing.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push(ing);
      return acc;
    },
    {} as Record<string, Ingredient[]>,
  );

  if (loading) {
    return (
      <div className="bg-cookcraft-white text-cookcraft-olive flex h-screen w-screen flex-col items-center justify-center">
        <div className="border-cookcraft-olive h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
        <p className="mt-4 text-xl font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-cookcraft-white flex min-h-screen w-screen flex-col items-center py-20">
      <div className="w-full max-w-4xl px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-cookcraft-olive text-4xl font-bold">
            My Inventory
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-cookcraft-red hover:bg-cookcraft-yellow cursor-pointer rounded-2xl px-6 py-3 text-lg font-bold text-white transition-colors"
          >
            {showForm ? "Cancel" : "Add Ingredient"}
          </button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="border-cookcraft-olive bg-cookcraft-white mb-8 rounded-2xl border-3 p-6"
          >
            <h2 className="text-cookcraft-olive mb-4 text-2xl font-bold">
              {editingId ? "Edit Ingredient" : "Add Ingredient"}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-cookcraft-olive text-sm font-medium">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="border-cookcraft-olive mt-1 w-full rounded-2xl border-3 p-3"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-cookcraft-olive text-sm font-medium">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                    className="border-cookcraft-olive mt-1 w-full rounded-2xl border-3 p-3"
                  />
                </div>

                <div className="flex-1">
                  <label className="text-cookcraft-olive text-sm font-medium">
                    Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="border-cookcraft-olive mt-1 w-full rounded-2xl border-3 p-3"
                  >
                    {UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-cookcraft-olive text-sm font-medium">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="border-cookcraft-olive mt-1 w-full rounded-2xl border-3 p-3"
                >
                  {INGREDIENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-cookcraft-olive text-sm font-medium">
                  Notes
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="border-cookcraft-olive mt-1 w-full rounded-2xl border-3 p-3"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-cookcraft-red hover:bg-cookcraft-yellow flex-1 cursor-pointer rounded-2xl p-3 text-lg font-bold text-white transition-colors"
                >
                  {editingId ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="border-cookcraft-olive text-cookcraft-olive hover:bg-cookcraft-green flex-1 cursor-pointer rounded-2xl border-3 p-3 text-lg font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-cookcraft-olive flex-1 rounded-2xl border-3 p-3"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border-cookcraft-olive hover:border-cookcraft-red cursor-pointer rounded-2xl border-3 p-3"
          >
            <option value="">All Categories</option>
            {INGREDIENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {ingredients.length === 0 ? (
          <div className="border-cookcraft-olive bg-cookcraft-white rounded-2xl border-3 p-12 text-center">
            <p className="text-cookcraft-olive text-xl">
              No ingredients yet. Add your first one!
            </p>
          </div>
        ) : filteredIngredients.length === 0 ? (
          <div className="border-cookcraft-olive bg-cookcraft-white rounded-2xl border-3 p-12 text-center">
            <p className="text-cookcraft-olive text-xl">
              No ingredients match your search.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {Object.entries(groupedIngredients).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-cookcraft-olive mb-3 text-2xl font-bold">
                  {category}
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((ingredient) => {
                    const isExpanded = expandedId === ingredient.id;
                    return (
                      <motion.div
                        key={ingredient.id}
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="border-cookcraft-olive bg-cookcraft-white rounded-2xl border-3 p-4"
                      >
                        <div
                          className="cursor-pointer"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : ingredient.id)
                          }
                        >
                          <h3 className="text-cookcraft-olive text-lg font-bold">
                            {ingredient.name}
                          </h3>
                          <p className="text-cookcraft-olive mt-1 text-xl font-medium">
                            {ingredient.quantity} {ingredient.unit}
                          </p>
                        </div>

                        {isExpanded && ingredient.notes && (
                          <p className="text-cookcraft-olive mt-2 text-sm">
                            {ingredient.notes}
                          </p>
                        )}

                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => handleQuickAdd(ingredient)}
                            className="bg-cookcraft-green hover:bg-cookcraft-yellow flex-1 cursor-pointer rounded-2xl p-2 text-sm font-bold text-white transition-colors"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleEdit(ingredient)}
                            className="text-cookcraft-red hover:text-cookcraft-yellow flex-1 cursor-pointer rounded-2xl border-3 p-2 text-sm font-bold transition-colors"
                          >
                            Edit
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="mt-2">
                            <button
                              onClick={() => handleDelete(ingredient.id)}
                              className="bg-cookcraft-red hover:bg-cookcraft-yellow w-full rounded-2xl p-2 text-sm font-bold text-white transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
