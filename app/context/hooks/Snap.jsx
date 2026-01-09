import { useEffect, useState } from "react";

const useSnap = () => {
  const [snap, setSnap] = useState(null);

  useEffect(() => {
    const myMidtransClientKey = process.env.MIDTRANS_CLIENT_KEY;
    const scriptId = "midtrans-script";
    
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement("script");
      script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
      script.setAttribute("data-client-key", myMidtransClientKey);
      script.id = scriptId;
      script.onload = () => {
        setSnap(window.snap);
      };
      document.body.appendChild(script);
    } else {
      setSnap(window.snap);
    }

    return () => {
    };
  }, []);

  return snap;
};

export default useSnap;