'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, KeyRound, CheckCircle, AlertTriangle, Settings, Plus, List, Trash2, Edit, Save, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { cn } from '../lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"

interface KeyEntry {
  id: string;
  name: string;
  key: string;
  description: string;
  createdAt: number;
}

export function KeyMaster() {
  const [keys, setKeys] = useState<KeyEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const savedKeys = localStorage.getItem('apiKeys');
      return savedKeys ? JSON.parse(savedKeys) : [];
    }
    return [];
  });
  
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('');
  const [masterPassword, setMasterPassword] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('masterPassword');
    }
    return null;
  });
  
  const [newKey, setNewKey] = useState<KeyEntry>({
    id: '',
    name: '',
    key: '',
    description: '',
    createdAt: Date.now(),
  });
  
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [showSettings, setShowSettings] = useState(false);
  const [appPassword, setAppPassword] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Save keys to localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('apiKeys', JSON.stringify(keys));
    }
  }, [keys, isClient]);

  // Canvas animation setup (fireflies)
  useEffect(() => {
    if (!isClient) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const numFireflies = 100;
    const fireflies: { x: number; y: number; radius: number; speedX: number; speedY: number; alpha: number }[] = [];

    for (let i = 0; i < numFireflies; i++) {
      fireflies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        alpha: 0,
      });
    }


    const drawFireflies = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < numFireflies; i++) {
        const firefly = fireflies[i];

        // Update position
        firefly.x += firefly.speedX;
        firefly.y += firefly.speedY;

        // Bounce off edges
        if (firefly.x > canvas.width || firefly.x < 0) {
          firefly.speedX *= -1;
        }
        if (firefly.y > canvas.height || firefly.y < 0) {
          firefly.speedY *= -1;
        }

        // Flicker effect
        firefly.alpha += (Math.random() - 0.5) * 0.1;
        firefly.alpha = Math.max(0, Math.min(1, firefly.alpha)); // Clamp alpha

        // Draw
        ctx.beginPath();
        ctx.arc(firefly.x, firefly.y, firefly.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 200, ${firefly.alpha})`; // Light yellow
        ctx.shadowColor = 'rgba(255, 255, 200, 0.8)';
        ctx.shadowBlur = firefly.alpha * 10;
        ctx.fill();
        ctx.closePath();
      }
    };

    const animate = () => {
      drawFireflies();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isClient]);

  // Handle master password logic
  const handleUnlock = () => {
    if (password === masterPassword) {
      setIsLocked(false);
      setPassword('');
    } else {
      alert('Incorrect password!');
      setPassword('');
    }
  };

  const handleSetMasterPassword = () => {
    if (appPassword) {
      setMasterPassword(appPassword);
      if (isClient) {
        localStorage.setItem('masterPassword', appPassword);
      }
      setShowSettings(false);
      setAppPassword('');
      setIsLocked(false); // Unlock after setting
    } else {
      alert('Please enter a password');
    }
  };

  const handleAddKey = () => {
    if (!newKey.name.trim() || !newKey.key.trim()) {
      alert('Please enter both name and key!');
      return;
    }
    const finalKey = { ...newKey, id: crypto.randomUUID(), createdAt: Date.now() };
    setKeys([...keys, finalKey]);
    setNewKey({ id: '', name: '', key: '', description: '', createdAt: Date.now() });
    setIsAdding(false);
  };

  const handleEditKey = (id: string) => {
    const keyToEdit = keys.find((key) => key.id === id);
    if (keyToEdit) {
      setIsEditingId(id);
      setNewKey(keyToEdit);
    }
  };

  const handleSaveEdit = (id: string) => {
    if (!newKey.name.trim() || !newKey.key.trim()) {
      alert('Please enter both name and key!');
      return;
    }
    setKeys(
      keys.map((key) => (key.id === id ? { ...newKey, id: key.id, createdAt: key.createdAt } : key))
    );
    setIsEditingId(null);
    setNewKey({ id: '', name: '', key: '', description: '', createdAt: Date.now() });
  };

  const handleDeleteKey = (id: string) => {
    setKeys(keys.filter((key) => key.id !== id));
    setIsEditingId(null);
  };

  const filteredKeys = keys.filter(key =>
    key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    key.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedKeys = [...filteredKeys].sort((a, b) => b.createdAt - a.createdAt);

  const changePassword = () => {
    setPasswordError('');
    if (!newPassword) {
      setPasswordError('Please enter a new password.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }

    setMasterPassword(newPassword);
    if (isClient) {
      localStorage.setItem('masterPassword', newPassword);
    }
    setShowPasswordChange(false);
    setNewPassword('');
    setConfirmNewPassword('');
    alert('Password changed successfully!');
  };

  // Only render on client to avoid hydration issues
  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

      {/* App Header */}
      <header className="py-4 px-6 bg-gray-800/50 backdrop-blur-md border-b border-gray-700 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <KeyRound className="w-6 h-6 text-yellow-400" />
          <h1 className="text-2xl font-bold">KeyMaster</h1>
        </div>
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Search Keys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => setShowSettings(true)}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 z-10 overflow-y-auto">
        <AnimatePresence>
          {isLocked ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-gray-800/80 backdrop-blur-md rounded-xl p-8 max-w-md mx-auto space-y-6 border border-gray-700"
            >
              <div className="text-center">
                <Lock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold">Enter Master Password</h2>
                <p className="text-gray-400">
                  Enter your master password to unlock your API keys.
                </p>
              </div>
              <Input
                type="password"
                placeholder="Master Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              />
              <Button
                onClick={handleUnlock}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold"
              >
                Unlock
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">API Keys</h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => {
                          setIsAdding(true);
                          setIsEditingId(null);
                          setNewKey({ id: '', name: '', key: '', description: '', createdAt: Date.now() });
                        }}
                        className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Key
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add New API Key</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <AnimatePresence>
                {isAdding && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="bg-gray-800/80 backdrop-blur-md rounded-xl p-6 space-y-4 border border-gray-700"
                  >
                    <h3 className="text-lg font-semibold">Add New API Key</h3>
                    <Input
                      placeholder="Key Name"
                      value={newKey.name}
                      onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    />
                    <Input
                      placeholder="API Key"
                      value={newKey.key}
                      onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    />
                    <Textarea
                      placeholder="Description (Optional)"
                      value={newKey.description}
                      onChange={(e) => setNewKey({ ...newKey, description: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                    />
                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAdding(false);
                          setIsEditingId(null);
                          setNewKey({ id: '', name: '', key: '', description: '', createdAt: Date.now() });
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddKey}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                {sortedKeys.length > 0 ? (
                  sortedKeys.map((key) => (
                    <motion.div
                      key={key.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-gray-800/80 backdrop-blur-md rounded-xl p-4 border border-gray-700 relative group"
                    >
                      {isEditingId === key.id ? (
                        <>
                          <Input
                            placeholder="Key Name"
                            value={newKey.name}
                            onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 mb-2"
                          />
                          <Input
                            placeholder="API Key"
                            value={newKey.key}
                            onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 mb-2"
                          />
                          <Textarea
                            placeholder="Description (Optional)"
                            value={newKey.description}
                            onChange={(e) => setNewKey({ ...newKey, description: e.target.value })}
                            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 mb-4"
                          />
                          <div className="flex justify-end gap-3">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsEditingId(null);
                                setNewKey({ id: '', name: '', key: '', description: '', createdAt: Date.now() });
                              }}
                              className="bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleSaveEdit(key.id)}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{key.name}</h3>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      onClick={() => handleEditKey(key.id)}
                                      className="text-gray-400 hover:text-blue-400"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Edit</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      onClick={() => handleDeleteKey(key.id)}
                                      className="text-gray-400 hover:text-red-400"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Delete</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                          <p className="text-gray-400 break-all">{key.key}</p>
                          {key.description && (
                            <p className="text-gray-500 italic">{key.description}</p>
                          )}
                        </>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-gray-400"
                  >
                    <KeyRound className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <p>No API keys found. Add your first key to get started.</p>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-gray-800/90 backdrop-blur-md rounded-xl p-6 w-full max-w-md space-y-6 border border-gray-700 relative"
            >
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <h2 className="text-2xl font-semibold">Settings</h2>

              {!masterPassword ? (
                <>
                  <p className="text-gray-400">Set a master password to secure your API keys.</p>
                  <Input
                    type="password"
                    placeholder="Master Password"
                    value={appPassword}
                    onChange={(e) => setAppPassword(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  />
                  <Button
                    onClick={handleSetMasterPassword}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold"
                  >
                    Set Password
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-gray-400">
                    Master password is set. You can change it here.
                  </p>
                  <Button
                    onClick={() => setShowPasswordChange(true)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Change Master Password
                  </Button>
                  {showPasswordChange && (
                    <div className="space-y-4">
                      <Input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                      />
                      <Input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                      />
                      {passwordError && <p className="text-red-500">{passwordError}</p>}
                      <div className="flex justify-end gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowPasswordChange(false);
                            setNewPassword('');
                            setConfirmNewPassword('');
                            setPasswordError('');
                          }}
                          className="bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={changePassword}
                          className="bg-green-500 hover:bg-green-600 text-white"
                        >
                          Change Password
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
