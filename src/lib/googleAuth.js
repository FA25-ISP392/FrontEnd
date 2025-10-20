// import apiConfig from "../api/apiConfig";
// import { parseJWT } from "./auth";

// const apiOrigin = new URL(apiConfig.defaults.baseURL).origin;

// function openPopup(url, name = "google_oauth", w = 520, h = 640) {
//   const left =
//     (window.screenX || window.screenLeft || 0) + (window.innerWidth - w) / 2;
//   const top =
//     (window.screenY || window.screenTop || 0) + (window.innerHeight - h) / 2;
//   const features = `scrollbars=yes,width=${w},height=${h},top=${top},left=${left}`;
//   const popup = window.open(url, name, features);
//   if (!popup)
//     throw new Error(
//       "Trình duyệt đang chặn popup. Hãy cho phép popup và thử lại."
//     );
//   popup.focus();
//   return popup;
// }

// export async function loginWithGooglePopup() {
//   const loginUrl = `${apiConfig.defaults.baseURL}/oauth2/authorization/google`;
//   const popup = openPopup(loginUrl);

//   return new Promise((resolve, reject) => {
//     let finished = false;
//     const cleanup = () => {
//       window.removeEventListener("message", onMessage);
//       clearInterval(pollClosed);
//       clearTimeout(timeout);
//     };

//     const finish = (token) => {
//       if (finished) return;
//       finished = true;
//       try {
//         popup.close();
//       } catch {}
//       try {
//         localStorage.setItem("token", `Bearer ${token}`);
//         const user = parseJWT(token) || {};
//         localStorage.setItem("user", JSON.stringify(user));
//       } catch {}
//       window.dispatchEvent(new Event("auth:changed"));
//       cleanup();
//       resolve({ token });
//     };

//     const onMessage = (ev) => {
//       console.log("msg from:", ev.origin, ev.data);
//       const allowedOrigins = [window.location.origin, apiOrigin];
//       if (!allowedOrigins.includes(ev.origin)) return;
//       const msg = ev.data || {};
//       if (msg.type === "OAUTH_SUCCESS" && msg.token) {
//         finish(msg.token);
//       }
//     };
//     window.addEventListener("message", onMessage);
//     const pollClosed = setInterval(() => {
//       if (popup.closed && !finished) {
//         cleanup();
//         reject(new Error("Bạn đã đóng cửa sổ đăng nhập Google."));
//       }
//     }, 400);

//     const timeout = setTimeout(() => {
//       cleanup();
//       try {
//         popup.close();
//       } catch {}
//       reject(new Error("Hết thời gian xác thực Google."));
//     }, 2 * 60 * 1000);
//   });
// }

// src/lib/googleAuth.js
import apiConfig from "../api/apiConfig";
import { parseJWT } from "./auth";

function getAbsoluteApiBase() {
  const raw = String(apiConfig?.defaults?.baseURL || "").trim() || "/api";
  const abs = new URL(raw, window.location.origin).toString();
  return abs.replace(/\/$/, "");
}

const apiBase = getAbsoluteApiBase();
const apiOrigin = new URL(apiBase).origin;

function openPopup(url, name = "google_oauth", w = 520, h = 640) {
  const left =
    (window.screenX || window.screenLeft || 0) +
    Math.max(0, (window.innerWidth - w) / 2);
  const top =
    (window.screenY || window.screenTop || 0) +
    Math.max(0, (window.innerHeight - h) / 2);
  const features = `scrollbars=yes,width=${w},height=${h},top=${top},left=${left}`;
  const popup = window.open(url, name, features);
  if (!popup) {
    throw new Error(
      "Trình duyệt đang chặn popup. Hãy cho phép popup và thử lại."
    );
  }
  try {
    popup.focus();
  } catch {}
  return popup;
}

export async function loginWithGooglePopup() {
  const loginUrl = `${apiBase}/oauth2/authorization/google`;
  const popup = openPopup(loginUrl);

  return new Promise((resolve, reject) => {
    let finished = false;

    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      clearInterval(pollClosed);
      clearTimeout(timeout);
    };

    const finish = (token) => {
      if (finished) return;
      finished = true;
      try {
        popup.close();
      } catch {}
      try {
        localStorage.setItem("token", `Bearer ${token}`);
        const user = parseJWT(token) || {};
        localStorage.setItem("user", JSON.stringify(user));
      } catch {}
      window.dispatchEvent(new Event("auth:changed"));
      cleanup();
      resolve({ token });
    };

    const onMessage = (ev) => {
      const allowedOrigins = [window.location.origin, apiOrigin];
      if (!allowedOrigins.includes(ev.origin)) return;

      const msg = ev.data || {};
      if (msg.type === "OAUTH_SUCCESS" && msg.token) {
        finish(msg.token);
      } else if (msg.type === "OAUTH_ERROR" && msg.error) {
        cleanup();
        try {
          popup.close();
        } catch {}
        reject(new Error(String(msg.error)));
      }
    };

    window.addEventListener("message", onMessage);

    const pollClosed = setInterval(() => {
      if (popup.closed && !finished) {
        cleanup();
        reject(new Error("Bạn đã đóng cửa sổ đăng nhập Google."));
      }
    }, 400);

    const timeout = setTimeout(() => {
      cleanup();
      try {
        popup.close();
      } catch {}
      reject(new Error("Hết thời gian xác thực Google."));
    }, 2 * 60 * 1000);
  });
}

export function postOauthResultToOpenerSuccess(token) {
  window.opener?.postMessage(
    { type: "OAUTH_SUCCESS", token },
    window.origin || "*"
  );
}
export function postOauthResultToOpenerError(error) {
  window.opener?.postMessage(
    { type: "OAUTH_ERROR", error },
    window.origin || "*"
  );
}
