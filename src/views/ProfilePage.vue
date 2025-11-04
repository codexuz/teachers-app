<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ $t("profile.profile") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-grid class="profile-container">
        <ion-row>
           <ion-col size-lg="8" size-md="10" size-sm="12" offset-lg="2" offset-md="1">
        <!-- User Info Card -->
        <ion-card class="user-card">
          <ion-card-content>
            <div class="user-info">
              <div class="avatar">
                <ion-icon :icon="personCircleOutline"></ion-icon>
              </div>
              <div class="user-details">
                <h2>{{ userName }}</h2>
                <p>{{ userPhone }}</p>
                <ion-badge color="primary">{{
                  $t("profile.teacher")
                }}</ion-badge>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Profile Actions List -->
        <ion-list class="profile-actions">
          <ion-list-header>
            <ion-label>{{ $t("profile.accountSettings") }}</ion-label>
          </ion-list-header>

          <ion-item button @click="editAccount" detail>
            <ion-icon
              :icon="createOutline"
              slot="start"
              color="primary"
            ></ion-icon>
            <ion-label>
              <h3>{{ $t("profile.editAccount") }}</h3>
              <p>{{ $t("profile.updateYourProfile") }}</p>
            </ion-label>
          </ion-item>

          <ion-list-header>
            <ion-label>{{ $t("profile.app") }}</ion-label>
          </ion-list-header>

          <ion-item button @click="rateApp" detail>
            <ion-icon
              :icon="starOutline"
              slot="start"
              color="warning"
            ></ion-icon>
            <ion-label>
              <h3>{{ $t("profile.rateApp") }}</h3>
              <p>{{ $t("profile.shareYourFeedback") }}</p>
            </ion-label>
          </ion-item>

          <ion-item button @click="changeLanguage" detail>
            <ion-icon
              :icon="languageOutline"
              slot="start"
              color="tertiary"
            ></ion-icon>
            <ion-label>
              <h3>{{ $t("profile.changeLanguage") }}</h3>
              <p>{{ getCurrentLanguageName() }}</p>
            </ion-label>
          </ion-item>

          <ion-item button @click="shareApp" detail>
            <ion-icon
              :icon="shareOutline"
              slot="start"
              color="secondary"
            ></ion-icon>
            <ion-label>
              <h3>{{ $t("profile.share") }}</h3>
              <p>{{ $t("profile.inviteOtherTeachers") }}</p>
            </ion-label>
          </ion-item>

          <ion-list-header>
            <ion-label>{{ $t("profile.session") }}</ion-label>
          </ion-list-header>

          <ion-item button @click="confirmLogout" detail lines="none">
            <ion-icon
              :icon="logOutOutline"
              slot="start"
              color="danger"
            ></ion-icon>
            <ion-label color="danger">
              <h3>{{ $t("profile.logout") }}</h3>
              <p>{{ $t("profile.signOutOfYourAccount") }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
        
           </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonList,
  IonListHeader,
  IonItem,
  IonLabel,
  IonIcon,
  IonBadge,
  alertController,
  toastController,
  actionSheetController,
  IonGrid,
  IonRow,
  IonCol
} from "@ionic/vue";
import {
  personCircleOutline,
  createOutline,
  starOutline,
  shareOutline,
  logOutOutline,
  languageOutline,
} from "ionicons/icons";
// @ts-expect-error - API module doesn't have type definitions
import { authAPI } from "@/utils/api.js";
import { Share } from '@capacitor/share';

const router = useRouter();
const { t, locale } = useI18n();
const userName = ref("");
const userPhone = ref("");

const loadUserInfo = () => {
  const userString = localStorage.getItem("user");
  if (userString) {
    try {
      const user = JSON.parse(userString);
      userName.value = `${user.first_name} ${user.last_name}` || "Teacher";
      userPhone.value = user.phone || "No phone number";
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }
};

const editAccount = async () => {
  router.push("/profile-update");
};

const rateApp = async () => {
  const actionSheet = await actionSheetController.create({
    header: t("profile.rateThisApp"),
    buttons: [
      {
        text: t("profile.excellent"),
        handler: () => {
          showRatingToast(t("profile.thankYou5Star"));
        },
      },
      {
        text: t("profile.good"),
        handler: () => {
          showRatingToast(t("profile.thankYou4Star"));
        },
      },
      {
        text: t("profile.average"),
        handler: () => {
          showRatingToast(t("profile.thankYouFeedback"));
        },
      },
      {
        text: t("common.cancel"),
        role: "cancel",
      },
    ],
  });

  await actionSheet.present();
};

const showRatingToast = async (message: string) => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color: "success",
  });
  await toast.present();
};

const getCurrentLanguageName = () => {
  const languages: { [key: string]: string } = {
    en: "English",
    uz: "O'zbekcha",
    ru: "Русский",
  };
  return languages[locale.value] || "English";
};

const changeLanguage = async () => {
  const actionSheet = await actionSheetController.create({
    header: t("language.title"),
    buttons: [
      {
        text: "English",
        handler: () => {
          setLanguage("en");
        },
      },
      {
        text: "O'zbekcha",
        handler: () => {
          setLanguage("uz");
        },
      },
      {
        text: "Русский",
        handler: () => {
          setLanguage("ru");
        },
      },
      {
        text: t("common.cancel"),
        role: "cancel",
      },
    ],
  });

  await actionSheet.present();
};

const setLanguage = async (lang: string) => {
  locale.value = lang;
  localStorage.setItem("language", lang);

  const toast = await toastController.create({
    message: t("language.languageChanged"),
    duration: 2000,
    color: "success",
  });
  await toast.present();
};

const shareApp = async () => {
  const shareText = "Check out this amazing Teachers App!";

    try {
      await Share.share({
        title: "Teachers App",
        text: shareText,
        url: "https://app-teachers.impulselc.uz",
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
};

const confirmLogout = async () => {
  const alert = await alertController.create({
    header: t("profile.logout"),
    message: t("profile.confirmLogout"),
    buttons: [
      {
        text: t("common.cancel"),
        role: "cancel",
      },
      {
        text: t("profile.logout"),
        role: "destructive",
        handler: () => {
          handleLogout();
        },
      },
    ],
  });

  await alert.present();
};

const handleLogout = async () => {
  try {
    // Call logout API
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with local logout even if API fails
    }

    // Clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("session_id");
    localStorage.removeItem("user");
    localStorage.removeItem("token_expires_at");

    const toast = await toastController.create({
      message: t("profile.loggedOutSuccessfully"),
      duration: 2000,
      color: "success",
    });
    await toast.present();

    // Navigate to login
    router.replace("/login");
  } catch (error: any) {
    console.error("Logout error:", error);

    const toast = await toastController.create({
      message: t("profile.logoutFailed"),
      duration: 3000,
      color: "danger",
    });
    await toast.present();
  }
};

onMounted(() => {
  loadUserInfo();
});
</script>

<style scoped>
.profile-container {
  padding: 16px;
  min-height: 100%;
}

.user-card {
  margin: 0;
  margin-bottom: 24px;
  box-shadow: none;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--ion-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar ion-icon {
  font-size: 80px;
  color: var(--ion-color-primary);
}

.user-details h2 {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 4px;
  color: black;
}

.user-details p {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin: 0 0 8px;
}

.profile-actions {
  border-radius: 12px;
  overflow: hidden;
}

.profile-actions ion-list-header {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--ion-color-medium);
  padding-top: 16px;
  padding-bottom: 8px;
}

.profile-actions ion-item {
  --padding-start: 16px;
  --inner-padding-end: 16px;
  margin-bottom: 4px;
}

.profile-actions ion-item h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px;
}

.profile-actions ion-item p {
  font-size: 13px;
  color: var(--ion-color-medium);
  margin: 0;
}

.profile-actions ion-icon {
  font-size: 24px;
  margin-right: 12px;
}

.app-version {
  text-align: center;
  padding: 24px 0;
  margin-top: 20px;
}

.app-version p {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin: 0;
}
</style>
