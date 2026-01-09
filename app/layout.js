import { ToastProvider } from "./context/ToastContext";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { OrderProvider } from "@/app/context/OrderContext";
import { InventoryProvider } from "@/app/context/InventoryContext";
import { ShopProvider } from "./context/ShopContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata = {
  title: "HeartToPetals",
  description: "Florist Marketplace",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <ToastProvider>
          <AuthProvider>
            <ShopProvider>
              <CartProvider>
                <InventoryProvider>
                  <OrderProvider>{children}</OrderProvider>
                </InventoryProvider>
              </CartProvider>
            </ShopProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
