import { useState } from "react";

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number
  variant?: 'default' | 'destructive' // ⬅ ajoute ç

}

export const useToast = () => {
  const [toast, setToast] = useState<ToastOptions | null>(null);

  const showToast = (options: ToastOptions) => {
    setToast(options);
    setTimeout(() => setToast(null), 3000); // disparaît après 3 secondes
  };

  return {
    toast: showToast,
    ToastComponent: () =>
      toast ? (
        <div className="fixed bottom-5 right-5 bg-white text-black shadow-lg border border-gray-300 p-4 rounded z-50">
          <strong>{toast.title}</strong>
          {toast.description && <div>{toast.description}</div>}
        </div>
      ) : null,
  };
};
