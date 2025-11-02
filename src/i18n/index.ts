import { createI18n } from "vue-i18n";
import en from "./locales/en.json";
import uz from "./locales/uz.json";
import ru from "./locales/ru.json";

export type MessageSchema = typeof en;

const i18n = createI18n<[MessageSchema], "en" | "uz" | "ru">({
  legacy: false,
  locale: localStorage.getItem("language") || "en",
  fallbackLocale: "en",
  messages: {
    en,
    uz,
    ru,
  },
});

export default i18n;
