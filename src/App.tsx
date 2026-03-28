/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, FormEvent } from 'react';
import { Heart, Search, Plus, Utensils, Sparkles, Trash2, Pencil, X, Wand2, Loader2, Lock, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { initialFoodData, FoodItem } from './data/foodData';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [mood, setMood] = useState('');
  
  // AI state
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Add state
  const [newItemName, setNewItemName] = useState('');
  const [newItemTags, setNewItemTags] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editTags, setEditTags] = useState('');

  // Delete confirmation state
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  // Check auth status on load
  useEffect(() => {
    fetch('/api/auth/status')
      .then(res => res.json())
      .then(data => setIsAuthenticated(data.authenticated))
      .catch(() => setIsAuthenticated(false));
  }, []);

  // Load data from localStorage or initial data
  useEffect(() => {
    if (isAuthenticated) {
      const savedFoods = localStorage.getItem('sunny_foods');
      if (savedFoods) {
        setFoods(JSON.parse(savedFoods));
      } else {
        setFoods(initialFoodData);
      }
    }
  }, [isAuthenticated]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (foods.length > 0 && isAuthenticated) {
      localStorage.setItem('sunny_foods', JSON.stringify(foods));
    }
  }, [foods, isAuthenticated]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      if (data.success) {
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error);
      }
    } catch (error) {
      setLoginError('Hic, không kết nối được với server rồi...');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
  };

  const filteredFoods = useMemo(() => {
    if (!mood.trim()) return foods;
    const searchTerms = mood.toLowerCase().split(',').map(s => s.trim()).filter(s => s !== '');
    
    return foods.filter(food => {
      const foodName = food.name.toLowerCase();
      const foodTags = food.tags.map(t => t.toLowerCase());
      
      return searchTerms.every(term => 
        foodName.includes(term) || foodTags.some(tag => tag.includes(term))
      );
    });
  }, [foods, mood]);

  const getAiSuggestion = async () => {
    if (!mood.trim()) return;
    setIsAiLoading(true);
    setAiSuggestion('');
    
    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, foods })
      });
      
      if (response.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      
      const data = await response.json();
      if (data.suggestion) {
        setAiSuggestion(data.suggestion);
      } else if (data.error) {
        setAiSuggestion('Hic, có lỗi gì đó rồi em bé ơi. Thử lại sau nhé!');
      }
    } catch (error) {
      setAiSuggestion('Hic, không kết nối được với trái tim AI rồi...');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddFood = (e: FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newFood: FoodItem = {
      name: newItemName.trim(),
      tags: newItemTags.split(',').map(t => t.trim()).filter(t => t !== ''),
    };

    setFoods(prev => [...prev, newFood]);
    setNewItemName('');
    setNewItemTags('');
    setShowAddForm(false);
  };

  const startEditing = (index: number) => {
    const food = foods[index];
    setEditingIndex(index);
    setEditName(food.name);
    setEditTags(food.tags.join(', '));
  };

  const handleUpdateFood = (e: FormEvent) => {
    e.preventDefault();
    if (editingIndex === null || !editName.trim()) return;

    const updatedFoods = [...foods];
    updatedFoods[editingIndex] = {
      name: editName.trim(),
      tags: editTags.split(',').map(t => t.trim()).filter(t => t !== ''),
    };

    setFoods(updatedFoods);
    setEditingIndex(null);
  };

  const removeFood = (index: number) => {
    setFoods(prev => prev.filter((_, i) => i !== index));
    setDeletingIndex(null);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-bg">
        <Loader2 className="w-8 h-8 text-olive animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-bg px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[48px] shadow-2xl max-w-md w-full text-center border border-olive/10"
        >
          <div className="w-20 h-20 bg-warm-bg rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-olive" />
          </div>
          <h1 className="serif text-3xl text-olive mb-2">Sunny iu ơi!</h1>
          <p className="text-gray-500 mb-8 italic">Nhập mật khẩu bí mật để vào xem món ngon nhó</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Mật khẩu của em bé..."
              className="w-full px-6 py-4 bg-warm-bg rounded-2xl border-none focus:ring-2 focus:ring-olive/20 outline-none text-center text-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {loginError && (
              <p className="text-red-400 text-sm italic">{loginError}</p>
            )}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-4 bg-olive text-white font-medium rounded-2xl hover:bg-olive/90 transition-all shadow-lg shadow-olive/20 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5 fill-white" />}
              Vào với anh Nhím
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 px-4 md:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="py-12 text-center relative">
        <button 
          onClick={handleLogout}
          className="absolute top-4 right-0 p-3 text-gray-400 hover:text-olive transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <LogOut className="w-4 h-4" /> Thoát
        </button>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="serif text-5xl md:text-6xl text-olive mb-2">Sunny iu ơi!</h1>
          <p className="text-gray-600 italic flex items-center justify-center gap-2">
            Hôm nay em bé muốn ăn gì nào? <Heart className="w-4 h-4 text-red-400 fill-red-400" />
          </p>
        </motion.div>
      </header>

      {/* Mood Input Section */}
      <section className="mb-8">
        <div className="relative group flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Sparkles className="w-5 h-5 text-olive/50 group-focus-within:text-olive transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Em bé đang cảm thấy thế nào? (vd: thèm cay, ăn no, đồ hàn...)"
              className="w-full pl-12 pr-4 py-5 bg-white rounded-3xl shadow-sm border border-transparent focus:border-olive/30 focus:ring-4 focus:ring-olive/5 outline-none transition-all text-lg"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
            />
          </div>
          <button
            onClick={getAiSuggestion}
            disabled={isAiLoading || !mood.trim()}
            className="px-6 bg-olive text-white rounded-3xl shadow-lg hover:bg-olive/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            <span className="hidden md:inline">Hỏi AI</span>
          </button>
        </div>
      </section>

      {/* AI Suggestion Box */}
      <AnimatePresence>
        {aiSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-12 bg-white/80 backdrop-blur-md p-8 rounded-[40px] border border-olive/10 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-olive/30" />
            <h3 className="serif text-xl text-olive mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4 fill-olive" /> Gợi ý từ anh Nhím iu:
            </h3>
            <div className="text-gray-700 leading-relaxed italic whitespace-pre-wrap">
              {aiSuggestion}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Food List Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="serif text-2xl text-olive flex items-center gap-2">
            <Utensils className="w-5 h-5" /> Gợi ý cho em bé
          </h2>
          <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
            {filteredFoods.length} món phù hợp
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredFoods.map((food, index) => {
              const originalIndex = foods.findIndex(f => f === food);
              
              return (
                <motion.div
                  key={food.name + index}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white p-6 rounded-[32px] shadow-sm border border-black/5 hover:shadow-md transition-shadow group relative"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="serif text-xl text-gray-800 mb-2">{food.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {food.tags.map((tag, i) => (
                          <span 
                            key={i} 
                            className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-warm-bg text-olive/70 rounded-full border border-olive/10"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => startEditing(originalIndex)}
                        className="p-2 text-gray-300 hover:text-olive transition-all"
                        title="Sửa món"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeletingIndex(originalIndex)}
                        className="p-2 text-gray-300 hover:text-red-400 transition-all"
                        title="Xóa món"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {filteredFoods.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center bg-white/50 rounded-[32px] border border-dashed border-olive/20"
            >
              <p className="text-gray-400 italic">Hic, không tìm thấy món nào như vậy cả...</p>
              <p className="text-gray-400 italic">Em bé thử tìm từ khác xem sao?</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md p-8 rounded-[40px] shadow-2xl relative"
            >
              <button 
                onClick={() => setEditingIndex(null)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <form onSubmit={handleUpdateFood} className="space-y-6">
                <h3 className="serif text-2xl text-olive text-center">Chỉnh sửa món ăn</h3>
                
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Tên món ăn</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-3 bg-warm-bg rounded-2xl border-none focus:ring-2 focus:ring-olive/20 outline-none text-lg"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Tags (cách nhau bởi dấu phẩy)</label>
                  <textarea
                    rows={3}
                    className="w-full px-5 py-3 bg-warm-bg rounded-2xl border-none focus:ring-2 focus:ring-olive/20 outline-none resize-none"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-4 bg-olive text-white font-medium rounded-2xl hover:bg-olive/90 transition-colors shadow-lg shadow-olive/20"
                >
                  Lưu thay đổi
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-sm p-8 rounded-[40px] shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="serif text-2xl text-gray-800 mb-2">Xóa món này hả em?</h3>
              <p className="text-gray-500 mb-8 italic">Em bé có chắc muốn xóa món "{foods[deletingIndex]?.name}" không nhó?</p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingIndex(null)}
                  className="flex-1 py-4 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-2xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => removeFood(deletingIndex)}
                  className="flex-1 py-4 bg-red-400 text-white text-sm font-medium rounded-2xl hover:bg-red-500 transition-colors shadow-lg shadow-red-400/20"
                >
                  Xóa luôn
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add New Food Section */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40">
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white p-6 rounded-[32px] shadow-2xl border border-olive/10 mb-4"
            >
              <form onSubmit={handleAddFood} className="space-y-4">
                <h3 className="serif text-lg text-olive text-center">Thêm món mới cho em bé</h3>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1 block">Tên món ăn</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 bg-warm-bg rounded-xl border-none focus:ring-2 focus:ring-olive/20 outline-none"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1 block">Tags (cách nhau bởi dấu phẩy)</label>
                  <input
                    type="text"
                    placeholder="vd: ăn no, thèm cay, đồ việt"
                    className="w-full px-4 py-2 bg-warm-bg rounded-xl border-none focus:ring-2 focus:ring-olive/20 outline-none"
                    value={newItemTags}
                    onChange={(e) => setNewItemTags(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-2xl transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-olive text-white text-sm font-medium rounded-2xl hover:bg-olive/90 transition-colors shadow-lg shadow-olive/20"
                  >
                    Thêm ngay
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full py-4 bg-white rounded-full shadow-xl border border-olive/10 flex items-center justify-center gap-3 text-olive font-medium hover:bg-gray-50 transition-all group"
        >
          <Plus className={`w-5 h-5 transition-transform duration-300 ${showAddForm ? 'rotate-45' : ''}`} />
          <span>em bé có muốn món gì mới vào dữ liệu không ?</span>
        </button>
      </div>

      {/* Footer Decoration */}
      <footer className="mt-20 text-center opacity-30 pointer-events-none">
        <Heart className="w-8 h-8 mx-auto text-olive" />
      </footer>
    </div>
  );
}
