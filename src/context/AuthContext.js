import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentStudent, setCurrentStudent] = useState(null);

  const login  = (student) => setCurrentStudent(student);
  const logout = ()        => setCurrentStudent(null);

  return (
    <AuthContext.Provider value={{ currentStudent, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
