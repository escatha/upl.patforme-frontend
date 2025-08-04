import { useState } from "react";

interface ToastOptions {
  title: string;
  description?: string;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastOptions | null>(null);

  const showToast = (options: ToastOptions) => {
    setToast(options);
    setTimeout(() => setToast(null), 4000); // Disparaît après 4s
  };

  return {
    toast: showToast,
    ToastComponent: () =>
      toast ? (
        <div className="fixed bottom-5 right-5 bg-white shadow-lg border border-gray-200 p-4 rounded">
          <strong className="block text-lg">{toast.title}</strong>
          {toast.description && <p>{toast.description}</p>}
        </div>
      ) : null,
  };
};
