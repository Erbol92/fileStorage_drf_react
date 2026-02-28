// InfoAlert.jsx
import { useEffect, useState } from "react";

export const InfoAlert = ({ message = "Информация", error='', timeout = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), timeout);
    return () => clearTimeout(t);
  }, [timeout]);

  if (!visible) return null;

  return (
    <div className="position-fixed top-0 start-50 translate-middle-x mt-3" style={{ zIndex: 1080 }}>
      <div className="alert alert-info alert-dismissible fade show" role="alert">
        <h3>Информация</h3>
        {message} <br />
        {error}
        <button type="button" className="btn-close" aria-label="Close" onClick={() => setVisible(false)}></button>
      </div>
    </div>
  );
}
