import { checkPremiumStatus, initializeRevenueCat, presentPaywall } from '@/utils/revenueCat';
import { useCallback, useEffect, useState } from 'react';
import Purchases, { CustomerInfo } from 'react-native-purchases';

interface PremiumState {
  isPremium: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  expirationDate: string | null;
}

export const usePremium = () => {
  const [premiumState, setPremiumState] = useState<PremiumState>({
    isPremium: false,
    isLoading: true,
    customerInfo: null,
    expirationDate: null,
  });

  const checkStatus = useCallback(async () => {
    try {
      setPremiumState(prev => ({ ...prev, isLoading: true }));
      const status = await checkPremiumStatus();
      setPremiumState({
        isPremium: status.isPremium,
        isLoading: false,
        customerInfo: status.customerInfo,
        expirationDate: status.expirationDate,
      });
    } catch (error) {
      console.error('Error checking premium status:', error);
      setPremiumState({
        isPremium: false,
        isLoading: false,
        customerInfo: null,
        expirationDate: null,
      });
    }
  }, []);

  const handlePresentPaywall = useCallback(async () => {
    try {
      const purchaseSuccessful = await presentPaywall();
      if (purchaseSuccessful) {
        // Refresh premium status after successful purchase
        await checkStatus();
      }
      return purchaseSuccessful;
    } catch (error) {
      console.error('Error presenting paywall:', error);
      return false;
    }
  }, [checkStatus]);

  useEffect(() => {
    // Initialize RevenueCat and check status
    const initialize = async () => {
      await initializeRevenueCat();
      await checkStatus();
    };
    
    initialize();

    // Set up listener for purchase updates
    const customerInfoUpdateListener = (customerInfo: CustomerInfo) => {
      console.log('Customer info updated:', customerInfo);
      const hasActiveEntitlements = Object.keys(customerInfo.entitlements.active).length > 0;
      let expirationDate = null;
      if (hasActiveEntitlements) {
        const activeEntitlement = Object.values(customerInfo.entitlements.active)[0];
        expirationDate = activeEntitlement.expirationDate;
      }
      
      setPremiumState({
        isPremium: hasActiveEntitlements,
        isLoading: false,
        customerInfo,
        expirationDate,
      });
    };

    Purchases.addCustomerInfoUpdateListener(customerInfoUpdateListener);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(customerInfoUpdateListener);
    };
  }, [checkStatus]);

  return {
    ...premiumState,
    checkStatus,
    presentPaywall: handlePresentPaywall,
    refreshStatus: checkStatus,
  };
};