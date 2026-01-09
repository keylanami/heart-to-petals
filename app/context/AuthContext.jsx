"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";
import { SHOPS } from "@/app/utils/shop";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { showToast } = useToast();

  const getStorage = (key) =>
    typeof window !== "undefined" ? localStorage.getItem(key) : null;
  const setStorage = (key, value) =>
    typeof window !== "undefined" && localStorage.setItem(key, value);
  const removeStorage = (key) =>
    typeof window !== "undefined" && localStorage.removeItem(key);

  useEffect(() => {
    try {
      const loggedInUser = getStorage("currentUser");
      if (loggedInUser) setUser(JSON.parse(loggedInUser));
    } catch (error) {
      removeStorage("currentUser");
    }

    const rawUsers = getStorage("users");
    let existingUsers = [];
    try {
        existingUsers = rawUsers ? JSON.parse(rawUsers) : [];
    } catch (e) {
        existingUsers = [];
    }

    const isSeeded = existingUsers.some(u => u.email === "user@gmail.com");

    if (!isSeeded || existingUsers.length === 0) {
        console.log("⚠️ Data Users Corrupt/Kosong. Melakukan Seeding Ulang...");
        
        const dummyTenants = SHOPS.map(shop => ({
            id: `tenant-${shop.id}`,
            name: `Admin ${shop.name}`,
            email: `admin@${shop.name.toLowerCase().replace(/\s+/g, '')}.com`, 
            password: "123", 
            role: "tenant",
            status: "active",
            shop: shop 
        }));

        const dummyUsers = [
            {
                id: 101,
                name: "User Demo",
                email: "user@gmail.com",
                password: "123",
                role: "user",
                status: "active",
                address: {
                    street: "Jl. Mawar No. 5",
                    city: "Bandung",
                    label: "Rumah"
                }
            }
        ];

        const initialUsers = [...dummyTenants, ...dummyUsers];
        setStorage("users", JSON.stringify(initialUsers));
        console.log("✅ Database Users Berhasil Diperbaiki:", initialUsers);
    }
  }, []);

  const register = (name, email, password, role = "user", shopData = null) => {
    try {
      const rawData = getStorage("users");
      const existingUsers = rawData ? JSON.parse(rawData) : [];

      if (existingUsers.find((u) => u.email === email)) {
        showToast("Email sudah terdaftar!", "error");
        return false;
      }

      const newId = Date.now();

      const newUser = {
        id: newId,
        name,
        email,
        password,
        role,
        status: role === "tenant" ? "pending" : "active",
        phone: "",
        address: {
          street: "",
          city: "",
          province: "",
          zip: "",
          label: "Rumah",
        },

        ...(role === "tenant" && shopData
          ? {
              shop: {
                id: shopData.id || `SHOP-${newId}`,
                name: shopData.name,
                location: shopData.location,
                image:
                  shopData.image || "/assets/flowershop/placeholder_store.png",
                rating: 0,
                can_customize: shopData.can_customize,
                desc: shopData.desc,
                openTime: shopData.openTime,
              },
            }
          : {}),
      };

      existingUsers.push(newUser);
      setStorage("users", JSON.stringify(existingUsers));

      if (role === "tenant") {
        showToast(
          "Pendaftaran Berhasil! Menunggu persetujuan Admin. Silakan cek dengan login secara berkala!",
          "success"
        );
        router.push("/login");
      } else {
        showToast("Register Berhasil! Silakan Login.", "success");
        router.push("/login");
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const login = (email, password) => {
    try {
      const rawData = getStorage("users");
      const existingUsers = rawData ? JSON.parse(rawData) : [];

      if (email === "super@admin.com" && password === "admin123") {
        const superAdmin = {
          id: 999,
          name: "Super Admin",
          email,
          role: "superadmin",
          status: "active",
        };
        setStorage("currentUser", JSON.stringify(superAdmin));
        setUser(superAdmin);
        router.push("/admin/super");
        return true;
      }

      const validUser = existingUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (validUser) {
        if (validUser.role === "tenant" && validUser.status === "pending") {
          showToast("Akun Toko Anda sedang ditinjau Superadmin.", "warning");
          return false;
        }

        setStorage("currentUser", JSON.stringify(validUser));
        setUser(validUser);

        if (validUser.role === "tenant") {
          router.push("/admin/florist");
        } else if (validUser.role === "superadmin") {
             router.push("/admin/super");
        } else {
          router.push("/toko");
        }
        return true;
      } else {
        showToast("Email atau Password salah!", "error");
        return false;
      }
    } catch (e) {
      return false;
    }
  };

  const logout = () => {
    removeStorage("currentUser");
    setUser(null);
    if (typeof window !== "undefined") {
        localStorage.removeItem("myCart"); 
        window.dispatchEvent(new Event("reset-cart"));
    }

    router.push("/get-started");
  };

  const updateUser = (newUserData) => {
    if (!user) return;
    try {
      const updatedUser = { ...user, ...newUserData };
      setUser(updatedUser);
      setStorage("currentUser", JSON.stringify(updatedUser));

      const rawData = getStorage("users");
      if (rawData) {
        const users = JSON.parse(rawData);
        const userIndex = users.findIndex((u) => u.email === user.email);
        if (userIndex !== -1) {
          users[userIndex] = updatedUser;
          setStorage("users", JSON.stringify(users));
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);