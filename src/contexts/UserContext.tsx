import React, { createContext, useContext, useState } from "react";

export interface User {
  id: string;
  name: string;
  username: string;
  matricule: string;
  role: "student" | "teacher" | "admin";
  faculty: string;
}

export interface UserContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void; 
    setUser: (user: User | null) => void; // ✅ AJOUTÉ ICI
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
    console.log("User connecté :", userData)
    
  };

  const logout = () => {
    setUser(null);
    // éventuellement supprimer le token localStorage ici
  };

  return (
    <UserContext.Provider value={{ user, login, logout,setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
