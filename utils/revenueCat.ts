import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

// API keys for different platforms
const APIKeys = {
  apple: "appl_wrvIhdMrpFrolpAHpXqaQmtxBEZ",
};

// Initialize RevenueCat SDK
export const initializeRevenueCat = async () => {
  try {
    console.log("Configuring RevenueCat with API key:", APIKeys.apple);
    await Purchases.configure({ apiKey: APIKeys.apple });
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    Purchases.setDebugLogsEnabled(true);
    
    return true;
  } catch (error) {
    console.error("Failed to initialize RevenueCat:", error);
    return false;
  }
};

// Present the paywall and return whether a purchase was made
export const presentPaywall = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    const currentOffering = offerings.current;


    
    if (currentOffering) {
      console.log('Presenting paywall with offering:', {
        identifier: currentOffering.identifier,
        packages: currentOffering.availablePackages.map(pkg => ({
          identifier: pkg.identifier,
          product: {
            identifier: pkg.product.identifier,
            title: pkg.product.title,
            description: pkg.product.description,
            price: pkg.product.price,
            priceString: pkg.product.priceString,
            period: pkg.product.subscriptionPeriod,
          }
        }))
      });
    }

    const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();

    switch (paywallResult) {
      case PAYWALL_RESULT.NOT_PRESENTED:
      case PAYWALL_RESULT.ERROR:
      case PAYWALL_RESULT.CANCELLED:
        return false;
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        return true;
      default:
        return false;
    }
  } catch (error) {
    console.error('Error presenting paywall:', error);
    return false;
  }
};

// Check if user has premium access
export const checkPremiumStatus = async () => {
  try {
    const customer = await Purchases.getCustomerInfo();
    
    console.log("Customer",customer)
    
    // Check if user has any active entitlements
    const hasActiveEntitlements = Object.keys(customer.entitlements.active).length > 0;
    console.log("Active entitlements", hasActiveEntitlements)
    
    // Get expiration date if available
    let expirationDate = null;
    if (hasActiveEntitlements) {
      const activeEntitlement = Object.values(customer.entitlements.active)[0];
      expirationDate = activeEntitlement.expirationDate;
      console.log("Expiration date:", expirationDate)
    }
    
    // Save premium status to storage
    
    return {
      isPremium: hasActiveEntitlements,
      customerInfo: customer,
      expirationDate: expirationDate
    };
  } catch (error) {
    console.error('Error checking premium status:', error);
    return {
      isPremium: false,
      customerInfo: null,
      expirationDate: null
    };
  }
};