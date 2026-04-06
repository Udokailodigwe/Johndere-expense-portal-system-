import { useEffect, useRef } from "react";

function useOutsideClick(isOpen, onClose) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isOpen, onClose]);

  return ref;
}

export default useOutsideClick;
