import { CartProvider } from '@/lib/cart-store';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
