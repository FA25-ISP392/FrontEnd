// export const HOME = "/home";
// export const HOME_ROUTES = {
//   ABOUT: "/home/vechungtoi",
//   LOGIN: "/home/dangnhap",
//   REGISTER: "/home/dangky",
//   FORGOT: "/home/quenmatkhau",
//   MENU_PREVIEW: "/home/xemtruocthucdon",
//   BOOKING: "/home/datban",
//   HISTORY: "/home/lichsudatban",
//   EDIT: "/home/suathongtin",
//   CHANGE_PWD: "/home/doimatkhau",
// };

// export const TABLE_LOGIN_ROUTES = {
//   TABLE_1: "/home/dangnhap?tableId=1",
//   TABLE_2: "/home/dangnhap?tableId=2",
//   TABLE_3: "/home/dangnhap?tableId=3",
//   TABLE_4: "/home/dangnhap?tableId=4",
//   TABLE_5: "/home/dangnhap?tableId=5",
//   TABLE_6: "/home/dangnhap?tableId=6",
//   TABLE_7: "/home/dangnhap?tableId=7",
//   TABLE_8: "/home/dangnhap?tableId=8",
// };
// export const NEED_AUTH = [
//   HOME_ROUTES.HISTORY,
//   HOME_ROUTES.EDIT,
//   HOME_ROUTES.CHANGE_PWD,
// ];

export const APP_ORIGIN =
  import.meta.env.VITE_PUBLIC_ORIGIN ||
  (import.meta.env.PROD
    ? "https://moncuaban.vercel.app"
    : "http://localhost:5173");

const joinUrl = (origin, path) =>
  `${origin}${path.startsWith("/") ? "" : "/"}${path}`;

export const HOME = "/home";
export const HOME_ROUTES = {
  ABOUT: "/home/vechungtoi",
  LOGIN: "/home/dangnhap",
  REGISTER: "/home/dangky",
  FORGOT: "/home/quenmatkhau",
  MENU_PREVIEW: "/home/xemtruocthucdon",
  BOOKING: "/home/datban",
  HISTORY: "/home/lichsudatban",
  EDIT: "/home/suathongtin",
  CHANGE_PWD: "/home/doimatkhau",
};

export const NEED_AUTH = [
  HOME_ROUTES.HISTORY,
  HOME_ROUTES.EDIT,
  HOME_ROUTES.CHANGE_PWD,
];

export const TABLE_LOGIN_ROUTES = {
  TABLE_1: "/home/dangnhap?tableId=1",
  TABLE_2: "/home/dangnhap?tableId=2",
  TABLE_3: "/home/dangnhap?tableId=3",
  TABLE_4: "/home/dangnhap?tableId=4",
  TABLE_5: "/home/dangnhap?tableId=5",
  TABLE_6: "/home/dangnhap?tableId=6",
  TABLE_7: "/home/dangnhap?tableId=7",
  TABLE_8: "/home/dangnhap?tableId=8",
};

export const TABLE_LOGIN_URLS = Object.fromEntries(
  Object.entries(TABLE_LOGIN_ROUTES).map(([k, v]) => [
    k,
    joinUrl(APP_ORIGIN, v),
  ])
);

export const qrUrlForTable = (id) =>
  joinUrl(APP_ORIGIN, `${HOME_ROUTES.LOGIN}?tableId=${Number(id)}`);
