<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="main" href="/tabs/main">
          <ion-icon aria-hidden="true" :icon="home" />
          <ion-label>{{ $t("tabs.main") }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="homeworks" href="/tabs/homeworks">
          <ion-icon aria-hidden="true" :icon="libraryOutline" />
          <ion-label>{{ $t("tabs.homeworks") }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="wallet" href="/tabs/wallet">
          <ion-icon aria-hidden="true" :icon="wallet" />
          <ion-label>{{ $t("tabs.wallet") }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="profile" href="/tabs/profile">
          <ion-icon aria-hidden="true" :icon="person" />
          <ion-label>{{ $t("tabs.profile") }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonLabel,
  IonIcon,
  IonPage,
  IonRouterOutlet,
} from "@ionic/vue";
import { home, wallet, person, libraryOutline } from "ionicons/icons";
</script>
