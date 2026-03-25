"use client";

import { useAppSelector } from "@/store/hook";
import { App, ConfigProvider, theme } from "antd";
import type { ThemeConfig } from "antd/es/config-provider/context";
import React, { useEffect, useState } from "react";

interface AntdConfigProviderProps {
  children: React.ReactNode;
}

const lightTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    // Brand Colors - Coda.io inspired
    colorPrimary: "#ff6757", // Coda's signature coral/orange
    colorSuccess: "#34d399", // Modern green
    colorWarning: "#fbbf24", // Warm yellow
    colorError: "#ef4444", // Clean red
    colorInfo: "#3b82f6", // Blue

    // Background Colors
    colorBgBase: "#ffffff",
    colorBgContainer: "#ffffff",
    colorBgElevated: "#ffffff",
    colorBgLayout: "#fafbfc", // Very light gray like Coda
    colorBgSpotlight: "#ffffff",
    colorBgMask: "rgba(0, 0, 0, 0.45)",

    // Text Colors
    colorTextBase: "#1f2937", // Darker gray for better readability
    colorText: "#1f2937",
    colorTextSecondary: "#6b7280", // Medium gray
    colorTextTertiary: "#9ca3af", // Lighter gray
    colorTextQuaternary: "#d1d5db", // Very light gray

    // Border Colors
    colorBorder: "#e5e7eb", // Light gray borders
    colorBorderSecondary: "#f3f4f6", // Even lighter

    // Fill Colors
    colorFill: "#f9fafb", // Very light fill
    colorFillSecondary: "#f3f4f6", // Light fill
    colorFillTertiary: "#e5e7eb", // Medium fill
    colorFillQuaternary: "#d1d5db", // Darker fill

    // Typography
    fontFamily: "var(--font-inter)",
    fontSize: 14,
    fontSizeSM: 12,
    fontSizeLG: 16,
    fontSizeXL: 20,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    fontWeightStrong: 600,

    // Line Heights
    lineHeight: 1.5714285714285714,
    lineHeightLG: 1.5,
    lineHeightSM: 1.66,
    lineHeightHeading1: 1.2105263157894737,
    lineHeightHeading2: 1.2666666666666666,
    lineHeightHeading3: 1.3333333333333333,
    lineHeightHeading4: 1.4,
    lineHeightHeading5: 1.5,

    // Border Radius - Coda uses more rounded corners
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    borderRadiusXS: 4,
    borderRadiusOuter: 8,

    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,

    margin: 16,
    marginLG: 24,
    marginSM: 12,
    marginXS: 8,
    marginXXS: 4,

    // Control Heights
    controlHeight: 36, // Slightly taller for modern look
    controlHeightLG: 44,
    controlHeightSM: 28,
    controlHeightXS: 20,

    // Motion
    motionDurationFast: "0.1s",
    motionDurationMid: "0.2s",
    motionDurationSlow: "0.3s",
    motionEaseInOut: "cubic-bezier(0.645, 0.045, 0.355, 1)",
    motionEaseInOutCirc: "cubic-bezier(0.78, 0.14, 0.15, 0.86)",
    motionEaseOut: "cubic-bezier(0.215, 0.61, 0.355, 1)",
    motionEaseInQuint: "cubic-bezier(0.755, 0.05, 0.855, 0.06)",
    motionEaseOutQuint: "cubic-bezier(0.23, 1, 0.32, 1)",

    // Shadows - Softer shadows like Coda
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.08)",
    boxShadowSecondary:
      "0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.08)",
    boxShadowTertiary:
      "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",

    // Z-Index
    zIndexBase: 0,
    zIndexPopupBase: 1000,

    // Opacity
    opacityLoading: 0.65,

    // Wireframe
    wireframe: false,

    // Screen Breakpoints
    screenXS: 480,
    screenSM: 576,
    screenMD: 768,
    screenLG: 992,
    screenXL: 1200,
    screenXXL: 1600,

    // Grid
    sizeUnit: 4,
    sizeStep: 4,
    sizePopupArrow: 16,

    // Control
    controlPaddingHorizontal: 16,
    controlPaddingHorizontalSM: 12,
    controlInteractiveSize: 16,
    controlItemBgHover: "rgba(255, 103, 87, 0.5)", // Coda primary color with low opacity
    controlItemBgActive: "#fff5f4", // Very light coral
    controlItemBgActiveHover: "#fef2f2", // Even lighter
    controlItemBgActiveDisabled: "rgba(0, 0, 0, 0.15)",
    controlTmpOutline: "rgba(255, 103, 87, 0.04)",
    controlOutlineWidth: 2,
    controlOutline: "rgba(255, 103, 87, 0.2)",
  },
  components: {
    Table: {
      headerBg: "#fafbfc",
      borderColor: "#f2f6fa",
      rowExpandedBg: "#f9fafb",
      headerBorderRadius: 10,
      rowSelectedHoverBg: "#e4e6eb",
      rowHoverBg: "#e4e6eb",
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedBg: "#fff5f4",
      itemHoverBg: "rgba(255, 103, 87, 0.1)",
      itemActiveBg: "#fff5f4",
      subMenuItemBg: "#ffffff",
      darkItemBg: "#ffffff",
      darkItemSelectedBg: "#fff5f4",
      darkItemHoverBg: "#f9fafb",
    },
    Card: {
      headerBg: "#e9edf2",
      actionsBg: "#f9fafb",
    },
    Modal: {
      headerBg: "#ffffff",
      footerBg: "#ffffff",
      contentBg: "#ffffff",
    },
    Layout: {
      headerBg: "#ffffff",
      footerBg: "#f9fafb",
      siderBg: "#ffffff",
      triggerBg: "#f9fafb",
    },
    Tabs: {
      cardBg: "#ffffff",
      inkBarColor: "#ff6757", // Warna indikator garis
      itemSelectedColor: "#ff6757", // Warna text tab aktif
      itemHoverColor: "#ff6757", // Warna text tab hover
      itemColor: "#6b7280", // Warna text tab default
    },
    Collapse: {
      headerBg: "#f9fafb",
      contentBg: "#ffffff",
    },
    ColorPicker: {
      colorBorder: "#aeaeae",
    },
    DatePicker: {
      cellBgDisabled: "#f9fafb",
      colorBorder: "#aeaeae",
    },
    Input: {
      addonBg: "#f9fafb",
      colorBorder: "#aeaeae",
      colorTextQuaternary: "#6b7280",
    },
    Select: {
      selectorBg: "#ffffff",
      colorBorder: "#aeaeae",
      optionSelectedBg: "#fff5f4",
      colorTextQuaternary: "#6b7280",
    },
    Pagination: {
      itemBg: "#ffffff",
      itemActiveBg: "#fff5f4",
    },
    Tree: {
      nodeHoverBg: "#f9fafb",
      nodeSelectedBg: "#fff5f4",
    },
    Transfer: {
      listHeight: 200,
      itemHeight: 32,
    },
    Upload: {
      actionsColor: "#1f2937",
    },
    Anchor: {
      linkPaddingBlock: 4,
      linkPaddingInlineStart: 16,
    },
    Breadcrumb: {
      fontSize: 16,
      linkColor: "#6b7280",
      linkHoverColor: "#1f2937",
      separatorColor: "#9ca3af",
    },
    Button: {
      ghostBg: "transparent",
      colorTextLightSolid: "#ffffff",
      colorBorder: "#aeaeae",
    },
    Calendar: {
      fullBg: "#ffffff",
    },
    Cascader: {
      optionSelectedBg: "#fff5f4",
    },
    Rate: {
      colorFillContent: "#fbbf24",
    },
    Slider: {
      colorBgElevated: "#ffffff",
    },
    Spin: {
      colorBgContainer: "#ffffff",
    },
    Statistic: {
      colorTextDescription: "#6b7280",
    },
    Tag: {
      colorFillAlter: "#f9fafb",
    },
    Timeline: {
      tailColor: "#e5e7eb",
    },
    Typography: {
      colorTextDescription: "#6b7280",
    },
    Divider: {
      colorBorderBg: "#e5e7eb",
    },
    Empty: {
      colorTextDescription: "#6b7280",
    },
    Result: {
      colorTextDescription: "#6b7280",
    },
    Skeleton: {
      gradientFromColor: "#f9fafb",
      gradientToColor: "#f3f4f6",
    },
    Alert: {
      colorInfoBg: "#eff6ff",
      colorInfoBorder: "#3b82f6",
      colorSuccessBg: "#ecfdf5",
      colorSuccessBorder: "#34d399",
      colorWarningBg: "#fffbeb",
      colorWarningBorder: "#fbbf24",
      colorErrorBg: "#fef2f2",
      colorErrorBorder: "#ef4444",
    },
    Tooltip: {
      colorBgSpotlight: "#ffffff",
      colorTextLightSolid: "#1a1a1a",
      borderRadius: 8,
      paddingXS: 8,
      paddingSM: 12,
      fontSize: 13,
      fontSizeSM: 12,
      lineHeight: 1.4,
      zIndexPopup: 1070,
      boxShadowSecondary:
        "0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    Message: {
      contentBg: "#ffffff",
    },
    Notification: {
      fontSizeLG: 15,
      paddingMD: 16,
      colorSuccessBg: "#ffffff",
      colorInfoBg: "#ffffff",
      colorErrorBg: "#ffffff",
      colorWarningBg: "#ffffff",
    },
    Progress: {
      colorBgContainer: "#f9fafb",
    },
    Descriptions: {
      labelBg: "#f9fafb",
    },
    Form: {
      labelColor: "#1f2937",
      labelRequiredMarkColor: "#ef4444",
    },
    Image: {
      previewOperationColor: "#1f2937",
    },
    List: {
      headerBg: "#f9fafb",
      footerBg: "#f9fafb",
      emptyTextPadding: 16,
    },
    Tour: {
      colorBgElevated: "#ffffff",
    },
    FloatButton: {
      colorBgElevated: "#ffffff",
    },
    QRCode: {
      colorBgElevated: "#ffffff",
    },
    Segmented: {
      itemSelectedBg: "#fff5f4",
    },
    Affix: {
      zIndexPopup: 1010,
    },
    App: {
      colorBgElevated: "#ffffff",
    },
    Checkbox: {
      colorBorder: "#aeaeae", // Lighter border for checkboxes in dark theme
      colorBorderSecondary: "#b3b3b3", // Even lighter secondary border
    },
  },
};

const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    // Brand Colors - Coda.io actual dark theme
    colorPrimary: "#ff6757", // Keep the signature coral
    colorSuccess: "#00d084", // Coda's bright green
    colorWarning: "#ffb02e", // Coda's orange/yellow
    colorError: "#ff4757", // Coda's red
    colorInfo: "#5352ed", // Coda's blue/purple

    // Background Colors - Based on Coda's actual dark interface
    colorBgBase: "#1a1a1a", // Main dark background
    colorBgContainer: "#242424", // Card/container background
    colorBgElevated: "#2a2a2a", // Elevated elements
    colorBgLayout: "#141414", // Layout background (darker)
    colorBgSpotlight: "#2a2a2a",
    colorBgMask: "rgba(0, 0, 0, 0.7)",

    // Text Colors - Coda's text hierarchy
    colorTextBase: "#ffffff", // Primary white text
    colorText: "#ffffff",
    colorTextSecondary: "#b3b3b3", // Secondary gray text
    colorTextTertiary: "#808080", // Tertiary gray text
    colorTextQuaternary: "#4d4d4d", // Quaternary dark gray

    // Border Colors - Coda's subtle borders
    colorBorder: "#3a3a3a", // Main border color
    colorBorderSecondary: "#2a2a2a", // Subtle borders

    // Fill Colors - Coda's fill hierarchy
    colorFill: "#2a2a2a", // Primary fill
    colorFillSecondary: "#1f1f1f", // Secondary fill
    colorFillTertiary: "#3a3a3a", // Tertiary fill
    colorFillQuaternary: "#4a4a4a", // Quaternary fill

    // Typography
    fontFamily: "var(--font-inter)",
    fontSize: 14,
    fontSizeSM: 12,
    fontSizeLG: 16,
    fontSizeXL: 20,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    fontWeightStrong: 600,

    // Line Heights
    lineHeight: 1.5714285714285714,
    lineHeightLG: 1.5,
    lineHeightSM: 1.66,
    lineHeightHeading1: 1.2105263157894737,
    lineHeightHeading2: 1.2666666666666666,
    lineHeightHeading3: 1.3333333333333333,
    lineHeightHeading4: 1.4,
    lineHeightHeading5: 1.5,

    // Border Radius - Consistent with light theme
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    borderRadiusXS: 4,
    borderRadiusOuter: 8,

    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,

    margin: 16,
    marginLG: 24,
    marginSM: 12,
    marginXS: 8,
    marginXXS: 4,

    // Control Heights
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,
    controlHeightXS: 20,

    // Motion
    motionDurationFast: "0.1s",
    motionDurationMid: "0.2s",
    motionDurationSlow: "0.3s",
    motionEaseInOut: "cubic-bezier(0.645, 0.045, 0.355, 1)",
    motionEaseInOutCirc: "cubic-bezier(0.78, 0.14, 0.15, 0.86)",
    motionEaseOut: "cubic-bezier(0.215, 0.61, 0.355, 1)",
    motionEaseInQuint: "cubic-bezier(0.755, 0.05, 0.855, 0.06)",
    motionEaseOutQuint: "cubic-bezier(0.23, 1, 0.32, 1)",

    // Shadows - Coda's subtle dark shadows
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.4)",
    boxShadowSecondary:
      "0 2px 8px rgba(0, 0, 0, 0.5), 0 1px 2px rgba(0, 0, 0, 0.3)",
    boxShadowTertiary:
      "0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.2)",

    // Z-Index
    zIndexBase: 0,
    zIndexPopupBase: 1000,

    // Opacity
    opacityLoading: 0.65,

    // Wireframe
    wireframe: false,

    // Screen Breakpoints
    screenXS: 480,
    screenSM: 576,
    screenMD: 768,
    screenLG: 992,
    screenXL: 1200,
    screenXXL: 1600,

    // Grid
    sizeUnit: 4,
    sizeStep: 4,
    sizePopupArrow: 16,

    // Control
    controlPaddingHorizontal: 16,
    controlPaddingHorizontalSM: 12,
    controlInteractiveSize: 16,
    controlItemBgHover: "rgba(255, 255, 255, 0.08)", // Subtle white hover
    controlItemBgActive: "#333333", // Active state
    controlItemBgActiveHover: "#3d3d3d", // Active hover
    controlItemBgActiveDisabled: "rgba(255, 255, 255, 0.15)",
    controlTmpOutline: "rgba(255, 103, 87, 0.08)",
    controlOutlineWidth: 2,
    controlOutline: "rgba(255, 103, 87, 0.4)",
  },
  components: {
    Table: {
      headerBg: "#2a2a2a",
      borderColor: "#3a3a3a",
      headerBorderRadius: 10,
      rowExpandedBg: "#2a2a2a",
      colorBgContainer: "#1f1f1f",
      colorFillContent: "#1f1f1f",
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedBg: "#333333",
      itemHoverBg: "#2a2a2a",
      itemActiveBg: "#333333",
      subMenuItemBg: "#242424",
      darkItemBg: "#242424",
      darkItemSelectedBg: "#333333",
      darkItemHoverBg: "#2a2a2a",
    },
    Card: {
      headerBg: "#2a2a2a",
      actionsBg: "#2a2a2a",
    },
    Modal: {
      headerBg: "#242424",
      footerBg: "#242424",
      contentBg: "#242424",
    },
    Layout: {
      headerBg: "#242424",
      footerBg: "#242424",
      siderBg: "#242424",
      triggerBg: "#2a2a2a",
    },
    Tabs: {
      cardBg: "#242424",
      inkBarColor: "#ff6757", // Warna indikator garis
      itemSelectedColor: "#ff6757", // Warna text tab aktif
      itemHoverColor: "#ff6757", // Warna text tab hover
      itemColor: "#b3b3b3", // Warna text tab default
    },
    Collapse: {
      headerBg: "#2a2a2a",
      contentBg: "#242424",
    },
    DatePicker: {
      cellBgDisabled: "#2a2a2a",
      colorBorder: "#545454",
    },
    Input: {
      addonBg: "#2a2a2a",
      colorBorder: "#545454",
    },
    Select: {
      selectorBg: "#242424",
      colorBorder: "#545454",
      optionSelectedBg: "#333333",
      colorTextQuaternary: "#808080",
    },
    Pagination: {
      itemBg: "#242424",
      itemActiveBg: "#333333",
    },
    Tree: {
      nodeHoverBg: "#2a2a2a",
      nodeSelectedBg: "#333333",
    },
    Transfer: {
      listHeight: 200,
      itemHeight: 32,
    },
    Upload: {
      actionsColor: "#ffffff",
    },
    Anchor: {
      linkPaddingBlock: 4,
      linkPaddingInlineStart: 16,
    },
    Breadcrumb: {
      fontSize: 16,
      linkColor: "#b3b3b3",
      linkHoverColor: "#ffffff",
      separatorColor: "#808080",
    },
    Button: {
      ghostBg: "transparent",
      colorTextLightSolid: "#ffffff",
      colorBorder: "#545454",
    },
    Calendar: {
      fullBg: "#242424",
    },
    Cascader: {
      optionSelectedBg: "#333333",
    },
    Rate: {
      colorFillContent: "#ffb02e",
    },
    Slider: {
      colorBgElevated: "#242424",
    },
    Spin: {
      colorBgContainer: "#242424",
    },
    Statistic: {
      colorTextDescription: "#b3b3b3",
    },
    Tag: {
      colorFillAlter: "#2a2a2a",
    },
    Timeline: {
      tailColor: "#3a3a3a",
    },
    Typography: {
      colorTextDescription: "#b3b3b3",
    },
    Divider: {
      colorBorderBg: "#3a3a3a",
    },
    Empty: {
      colorTextDescription: "#b3b3b3",
    },
    Result: {
      colorTextDescription: "#b3b3b3",
    },
    Skeleton: {
      gradientFromColor: "#2a2a2a",
      gradientToColor: "#3a3a3a",
    },
    Alert: {
      colorInfoBg: "#1f1f1f",
      colorInfoBorder: "#3a3a3a",
      colorSuccessBg: "#001a0e",
      colorSuccessBorder: "#00d084",
      colorWarningBg: "#2e1a00",
      colorWarningBorder: "#ffb02e",
      colorErrorBg: "#2e0a0a",
      colorErrorBorder: "#ff4757",
    },
    Tooltip: {
      colorBgSpotlight: "#3a3a3a", // Slightly lighter than dark containers
      colorTextLightSolid: "#ffffff", // White text
      borderRadius: 8,
      paddingXS: 8,
      paddingSM: 12,
      fontSize: 13,
      fontSizeSM: 12,
      lineHeight: 1.4,
      zIndexPopup: 1070, // Higher z-index
      boxShadowSecondary:
        "0 4px 16px rgba(0, 0, 0, 0.8), 0 2px 8px rgba(0, 0, 0, 0.6)",
    },
    Message: {
      contentBg: "#242424",
    },
    Notification: {
      fontSizeLG: 15,
      paddingMD: 16,
      colorSuccessBg: "#242424",
      colorInfoBg: "#242424",
      colorErrorBg: "#242424",
      colorWarningBg: "#242424",
    },
    Progress: {
      colorBgContainer: "#2a2a2a",
    },
    Descriptions: {
      labelBg: "#2a2a2a",
    },
    Form: {
      labelColor: "#ffffff",
      labelRequiredMarkColor: "#ff4757",
    },
    Image: {
      previewOperationColor: "#ffffff",
    },
    List: {
      headerBg: "#2a2a2a",
      footerBg: "#2a2a2a",
      emptyTextPadding: 16,
    },
    Tour: {
      colorBgElevated: "#242424",
    },
    FloatButton: {
      colorBgElevated: "#242424",
    },
    QRCode: {
      colorBgElevated: "#242424",
    },
    Segmented: {
      itemSelectedBg: "#333333",
    },

    Affix: {
      zIndexPopup: 1010,
    },
    App: {
      colorBgElevated: "#242424",
    },
    Checkbox: {
      colorBorder: "#545454",
    },
  },
};

export const AntdProvider: React.FC<AntdConfigProviderProps> = ({
  children,
}) => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <ConfigProvider theme={isDark ? darkTheme : lightTheme}>
      <App>{children}</App>
    </ConfigProvider>
  );
};
