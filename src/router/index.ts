import { createRouter, createWebHashHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";
import TabsPage from "../views/TabsPage.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/language-select",
  },
  {
    path: "/language-select",
    component: () => import("@/views/LanguageSelectPage.vue"),
  },
  {
    path: "/login",
    component: () => import("@/views/LoginPage.vue"),
  },
  {
    path: "/group/:id",
    component: () => import("@/views/GroupDetailsPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/group/:id/add-student",
    component: () => import("@/views/AddStudentPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile-update",
    component: () => import("@/views/ProfileUpdatePage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/tabs/",
    component: TabsPage,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        redirect: "/tabs/main",
      },
      {
        path: "main",
        component: () => import("@/views/MainPage.vue"),
      },
      {
        path: "wallet",
        component: () => import("@/views/WalletPage.vue"),
      },
      {
        path: "profile",
        component: () => import("@/views/ProfilePage.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation guard for language selection and authentication
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const languageSelected = localStorage.getItem("languageSelected");
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  // If language not selected and not already on language select page
  if (!languageSelected && to.path !== "/language-select") {
    next("/language-select");
  } else if (requiresAuth && !token) {
    next("/login");
  } else if (to.path === "/login" && token) {
    next("/tabs/main");
  } else if (to.path === "/language-select" && languageSelected) {
    // If language already selected, redirect appropriately
    if (token) {
      next("/tabs/main");
    } else {
      next("/login");
    }
  } else {
    next();
  }
});

export default router;
