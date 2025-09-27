import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { View } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import { Text } from "./ui/text";
import { StyleSheet } from "react-native";

export default function BottomSheetComponent({ isOpen, onClose, children, snapPoints, enableDynamicSizing }: { isOpen: boolean, onClose: () => void, children?: React.ReactNode, snapPoints?: string[] | number[] | undefined, enableDynamicSizing?: boolean }) {
  const { isDarkColorScheme } = useColorScheme();

  const safeArea = useSafeAreaInsets()
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    if (isOpen) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [isOpen]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );


  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        enableTouchThrough={false}
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      onChange={handleSheetChanges}
      snapPoints={snapPoints}
      enableContentPanningGesture={false}
      backdropComponent={renderBackdrop}
      enableDynamicSizing={enableDynamicSizing ?? true}

      backgroundStyle={{
        backgroundColor: isDarkColorScheme
          ? NAV_THEME.dark.card
          : NAV_THEME.light.card,
      }}
      style={{
        backgroundColor: isDarkColorScheme
          ? NAV_THEME.dark.card
          : NAV_THEME.light.card,
        marginTop: safeArea.top,
        borderColor: isDarkColorScheme
          ? NAV_THEME.dark.border
          : NAV_THEME.light.border,
        borderWidth: 1,
        borderRadius: 8,
        shadowColor: isDarkColorScheme
          ? NAV_THEME.dark.text
          : NAV_THEME.light.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}
      handleIndicatorStyle={
        isDarkColorScheme
          ? styles.darkHandleIndicator
          : styles.lightHandleIndicator
      }
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      {children ? children : (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>No content provided</Text>
        </View>
      )}
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  darkHandleIndicator: {
    backgroundColor: NAV_THEME.light.card,
  },
  lightHandleIndicator: {
    backgroundColor: NAV_THEME.dark.card,
  },
});
