<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>
          {{ $t("wallet.wallet") }}
          <div
            v-if="dateRangeText !== $t('wallet.allTime')"
            class="date-range-badge"
          >
            {{ dateRangeText }}
          </div>
        </ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showDateRangePicker">
            <ion-icon :icon="calendarOutline"></ion-icon>
          </ion-button>
          <ion-button @click="loadWalletData">
            <ion-icon :icon="refresh"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-grid class="wallet-container">
        <ion-row>
          <ion-col
            size-lg="8"
            size-md="10"
            size-sm="12"
            offset-lg="2"
            offset-md="1"
          >
            <!-- Wallet Balance Card -->
            <ion-card class="wallet-card">
              <ion-card-content>
                <div class="wallet-header">
                  <div class="wallet-icon">
                    <ion-icon :icon="walletOutline"></ion-icon>
                  </div>
                  <h3>{{ $t("wallet.currentBalance") }}</h3>
                </div>

                <div class="balance-amount">
                  <span class="currency">UZS</span>
                  <span class="amount">{{ formatBalance(balance) }}</span>
                </div>

                <div class="wallet-footer">
                  <div class="wallet-info">
                    <ion-icon :icon="timeOutline"></ion-icon>
                    <span
                      >{{ $t("wallet.lastUpdated") }}: {{ lastUpdated }}</span
                    >
                  </div>
                </div>
              </ion-card-content>
            </ion-card>

            <!-- Transactions Section -->
            <div class="transactions-section">
              <div class="section-header">
                <h2>{{ $t("wallet.transactions") }}</h2>
                <ion-badge color="primary">{{ transactions.length }}</ion-badge>
              </div>

              <ion-spinner
                v-if="isLoading"
                name="crescent"
                class="loading-spinner"
              ></ion-spinner>

              <div v-else-if="transactions.length === 0" class="empty-state">
                <ion-icon :icon="receiptOutline" class="empty-icon"></ion-icon>
                <p>{{ $t("wallet.noTransactions") }}</p>
              </div>

              <ion-list v-else class="transactions-list">
                <ion-item
                  v-for="transaction in transactions"
                  :key="transaction.id"
                  class="transaction-item"
                >
                  <div
                    class="transaction-icon"
                    slot="start"
                    :class="getTransactionTypeClass(transaction.type)"
                  >
                    <ion-icon
                      :icon="getTransactionIcon(transaction.type)"
                    ></ion-icon>
                  </div>

                  <ion-label>
                    <h3>
                      {{
                        transaction.description ||
                        getTransactionTypeName(transaction.type)
                      }}
                    </h3>
                    <p>{{ formatDate(transaction.created_at) }}</p>
                    <p v-if="transaction.status" class="transaction-status">
                      Status: {{ transaction.status }}
                    </p>
                  </ion-label>

                  <div
                    slot="end"
                    class="transaction-amount"
                    :class="getAmountClass(transaction.type)"
                  >
                    <span class="amount-sign">{{
                      getAmountSign(transaction.type)
                    }}</span>
                    <span class="amount-value">{{
                      formatAmount(transaction.amount)
                    }}</span>
                    <span class="currency-small">UZS</span>
                  </div>
                </ion-item>
              </ion-list>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
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
  IonItem,
  IonLabel,
  IonIcon,
  IonBadge,
  IonSpinner,
  IonButton,
  IonButtons,
  IonRefresher,
  IonRefresherContent,
  toastController,
  actionSheetController,
  alertController,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/vue";
import {
  walletOutline,
  timeOutline,
  receiptOutline,
  arrowUpCircle,
  arrowDownCircle,
  cashOutline,
  refresh,
  calendarOutline,
} from "ionicons/icons";
// @ts-expect-error - API module doesn't have type definitions
import { teacherAPI } from "@/utils/api.js";

const router = useRouter();
const { t } = useI18n();
const balance = ref(0);
const transactions = ref<any[]>([]);
const isLoading = ref(false);
const startDate = ref<string>("");
const endDate = ref<string>("");
const dateRangeText = ref<string>(t("wallet.allTime"));

const lastUpdated = computed(() => {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
});

const loadWalletData = async () => {
  isLoading.value = true;

  try {
    const userString = localStorage.getItem("user");
    if (!userString) {
      router.replace("/login");
      return;
    }

    const user = JSON.parse(userString);
    const teacherId = user.id;

    // Load balance
    try {
      const balanceData = await teacherAPI.getBalance(teacherId);
      balance.value = balanceData?.amount || 0;
    } catch (error) {
      console.error("Error loading balance:", error);
      balance.value = 0;
    }

    // Load transactions
    try {
      const transactionData = await teacherAPI.getTransactionHistory(teacherId);
      let allTransactions = transactionData || [];

      // Filter by date range if selected
      if (startDate.value && endDate.value) {
        const start = new Date(startDate.value);
        const end = new Date(endDate.value);
        end.setHours(23, 59, 59, 999); // Include the entire end date

        allTransactions = allTransactions.filter((transaction: any) => {
          const transDate = new Date(transaction.created_at);
          return transDate >= start && transDate <= end;
        });
      }

      transactions.value = allTransactions;
    } catch (error) {
      console.error("Error loading transactions:", error);
      transactions.value = [];
    }
  } catch (error: any) {
    console.error("Error loading wallet data:", error);

    const toast = await toastController.create({
      message: error.message || "Failed to load wallet data",
      duration: 3000,
      color: "danger",
    });
    await toast.present();
  } finally {
    isLoading.value = false;
  }
};

const handleRefresh = async (event: any) => {
  await loadWalletData();
  event.target.complete();
};

const formatBalance = (amount: number) => {
  return new Intl.NumberFormat("en-US").format(amount);
};

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat("en-US").format(Math.abs(amount));
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTransactionIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "oylik":
      return arrowDownCircle;
    case "avans":
    case "jarima":
      return arrowUpCircle;
    default:
      return cashOutline;
  }
};

const getTransactionTypeClass = (type: string) => {
  switch (type?.toLowerCase()) {
    case "oylik":
      return "type-income";
    case "avans":
    case "jarima":
      return "type-expense";
    default:
      return "type-neutral";
  }
};

const getAmountClass = (type: string) => {
  switch (type?.toLowerCase()) {
    case "oylik":
      return "amount-positive";
    case "avans":
    case "jarima":
      return "amount-negative";
    default:
      return "";
  }
};

const getAmountSign = (type: string) => {
  switch (type?.toLowerCase()) {
    case "oylik":
      return "+";
    case "avans":
    case "jarima":
      return "-";
    default:
      return "";
  }
};

const getTransactionTypeName = (type: string) => {
  if (!type) return "Transaction";
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const showDateRangePicker = async () => {
  const actionSheet = await actionSheetController.create({
    header: t("wallet.selectDateRange"),
    buttons: [
      {
        text: t("wallet.customRange"),
        icon: calendarOutline,
        handler: () => {
          showCustomDateRange();
        },
      },
      {
        text: t("wallet.last7Days"),
        handler: () => {
          const end = new Date();
          const start = new Date();
          start.setDate(start.getDate() - 7);
          applyDateRange(start, end, t("wallet.last7Days"));
        },
      },
      {
        text: t("wallet.last30Days"),
        handler: () => {
          const end = new Date();
          const start = new Date();
          start.setDate(start.getDate() - 30);
          applyDateRange(start, end, t("wallet.last30Days"));
        },
      },
      {
        text: t("wallet.last3Months"),
        handler: () => {
          const end = new Date();
          const start = new Date();
          start.setMonth(start.getMonth() - 3);
          applyDateRange(start, end, t("wallet.last3Months"));
        },
      },
      {
        text: t("wallet.thisYear"),
        handler: () => {
          const end = new Date();
          const start = new Date(end.getFullYear(), 0, 1);
          applyDateRange(start, end, t("wallet.thisYear"));
        },
      },
      {
        text: t("wallet.allTime"),
        handler: () => {
          startDate.value = "";
          endDate.value = "";
          dateRangeText.value = t("wallet.allTime");
          loadWalletData();
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

const showCustomDateRange = async () => {
  const today = new Date().toISOString().split("T")[0];
  const defaultStart = startDate.value || today;
  const defaultEnd = endDate.value || today;

  const alert = await alertController.create({
    header: t("wallet.selectDateRange"),
    message: t("wallet.chooseStartEndDates"),
    inputs: [
      {
        name: "startDate",
        type: "date",
        value: defaultStart,
        attributes: {
          max: today,
        },
      },
      {
        name: "endDate",
        type: "date",
        value: defaultEnd,
        attributes: {
          max: today,
        },
      },
    ],
    buttons: [
      {
        text: t("common.cancel"),
        role: "cancel",
      },
      {
        text: t("common.apply"),
        handler: (data) => {
          if (data.startDate && data.endDate) {
            const start = new Date(data.startDate);
            const end = new Date(data.endDate);

            if (start > end) {
              toastController
                .create({
                  message: t("wallet.startDateBeforeEndDate"),
                  duration: 2000,
                  color: "warning",
                })
                .then((toast) => toast.present());
              return false;
            }

            const startFormatted = formatDateShort(data.startDate);
            const endFormatted = formatDateShort(data.endDate);
            applyDateRange(start, end, `${startFormatted} - ${endFormatted}`);
          }
        },
      },
    ],
  });

  await alert.present();
};

const formatDateShort = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const applyDateRange = async (start: Date, end: Date, label: string) => {
  startDate.value = start.toISOString().split("T")[0];
  endDate.value = end.toISOString().split("T")[0];
  dateRangeText.value = label;
  await loadWalletData();
};

onMounted(() => {
  loadWalletData();
});
</script>

<style scoped>
ion-title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.date-range-badge {
  font-size: 11px;
  font-weight: 500;
  color: var(--ion-color-primary);
  margin-top: 2px;
}

.wallet-container {
  padding: 16px;
  min-height: 100%;
}

.wallet-card {
  background: linear-gradient(
    135deg,
    var(--ion-color-primary) 0%,
    var(--ion-color-primary-shade) 100%
  );
  color: white;
  margin: 0;
  margin-bottom: 24px;
}

.wallet-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.wallet-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.wallet-icon ion-icon {
  font-size: 24px;
  color: white;
}

.wallet-header h3 {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  opacity: 0.9;
}

.balance-amount {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 16px;
}

.currency {
  font-size: 18px;
  font-weight: 600;
  opacity: 0.8;
}

.amount {
  font-size: 36px;
  font-weight: 700;
}

.wallet-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.wallet-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  opacity: 0.8;
}

.wallet-info ion-icon {
  font-size: 14px;
}

.transactions-section {
  margin-top: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px 12px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.loading-spinner {
  display: block;
  margin: 40px auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 60px;
  color: var(--ion-color-medium);
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin: 0;
}

.transactions-list {
  background: transparent;
  padding: 0;
}

.transaction-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 8px;
}

.transaction-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.transaction-icon ion-icon {
  font-size: 24px;
}

.type-income {
  background: rgba(var(--ion-color-success-rgb), 0.1);
  color: var(--ion-color-success);
}

.type-expense {
  background: rgba(var(--ion-color-danger-rgb), 0.1);
  color: var(--ion-color-danger);
}

.type-neutral {
  background: rgba(var(--ion-color-medium-rgb), 0.1);
  color: var(--ion-color-medium);
}

.transaction-item h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px;
}

.transaction-item p {
  font-size: 13px;
  color: var(--ion-color-medium);
  margin: 0;
}

.transaction-status {
  font-size: 12px;
  margin-top: 4px !important;
}

.transaction-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.amount-sign {
  font-size: 14px;
  font-weight: 600;
}

.amount-value {
  font-size: 16px;
  font-weight: 700;
}

.currency-small {
  font-size: 11px;
  color: var(--ion-color-medium);
  font-weight: 500;
}

.amount-positive {
  color: var(--ion-color-success);
}

.amount-negative {
  color: var(--ion-color-danger);
}
</style>
