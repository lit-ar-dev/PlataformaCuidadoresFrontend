import api, { setAuthToken } from "@/src/api/api";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useReducer } from "react";

type User = { id: number; nombre: string; email: string } | null | undefined;

type State = {
  user: User;
  token: string | null;
  restoring: boolean;
};

type Action =
  | { type: "RESTORE"; token: string | null; user: User | null }
  | { type: "SIGN_IN"; token: string; user: User | undefined }
  | { type: "SIGN_OUT" };

const initialState: State = { user: null, token: null, restoring: true };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "RESTORE":
      return {
        ...state,
        token: action.token,
        user: action.user,
        restoring: false,
      };
    case "SIGN_IN":
      return { ...state, token: action.token, user: action.user };
    case "SIGN_OUT":
      return { ...state, token: null, user: null };
    default:
      return state;
  }
}

const AuthContext = createContext<{
  state: State;
  signIn: (token: string, user?: User | undefined) => Promise<void>;
  signOut: () => Promise<void>;
} | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // restore token on app start
    (async () => {
      try {
        const token = await SecureStore.getItemAsync("authToken");
        if (token) {
          setAuthToken(token);
          const res = await api.get("/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          dispatch({ type: "RESTORE", token, user: res.data });
        } else {
          dispatch({ type: "RESTORE", token: null, user: null });
        }
      } catch (e) {
        console.warn("Error restoring token", e);
        dispatch({ type: "RESTORE", token: null, user: null });
      }
    })();
  }, []);

  const signIn = async (token: string, user: User | undefined) => {
    await SecureStore.setItemAsync("authToken", token);
    setAuthToken(token);
    if (!user) {
      const res = await api.get("/auth/me");
      user = res.data;
      dispatch({ type: "SIGN_IN", token, user });
    }
    dispatch({ type: "SIGN_IN", token, user });
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync("authToken");
    setAuthToken(null);
    dispatch({ type: "SIGN_OUT" });
  };

  return (
    <AuthContext.Provider value={{ state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
