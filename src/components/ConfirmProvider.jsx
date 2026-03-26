import { useCallback, useMemo, useRef, useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import { ConfirmContext } from "./ConfirmContext";

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "default",
    isLoading: false,
  });

  const resolverRef = useRef(null);

  const confirm = useCallback((options) => {
    const {
      title,
      description,
      confirmText = "Confirm",
      cancelText = "Cancel",
      variant = "default",
    } = options || {};

    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({
        open: true,
        title: title || "",
        description: description || "",
        confirmText,
        cancelText,
        variant,
        isLoading: false,
      });
    });
  }, []);

  const close = useCallback((result) => {
    const resolve = resolverRef.current;
    resolverRef.current = null;
    setState((s) => ({ ...s, open: false }));
    if (resolve) resolve(result);
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={state.open}
        title={state.title}
        description={state.description}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        variant={state.variant}
        onCancel={() => close(false)}
        onConfirm={() => close(true)}
      />
    </ConfirmContext.Provider>
  );
}

