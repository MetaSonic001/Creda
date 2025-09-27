import { Pressable, View } from 'react-native';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import { MoonStar } from '~/lib/icons/MoonStar';
import { Sun } from '~/lib/icons/Sun';
import { useColorScheme } from '~/lib/useColorScheme';
import { cn } from '~/lib/utils';
import { Text } from './ui/text';

export function ThemeToggle() {
  const { isDarkColorScheme, setColorScheme } = useColorScheme();

  function toggleColorScheme() {
    const newTheme = isDarkColorScheme ? 'light' : 'dark';
    setColorScheme(newTheme);
    //setAndroidNavigationBar(newTheme);
  }

  return (
    <Pressable
      onPress={toggleColorScheme}
      className="w-full rounded-lg bg-background border border-border shadow-sm active:bg-muted/50"
    >
      {({ pressed }) => (
        <View
          className={cn(
            'px-6 py-5 relative overflow-hidden',
            pressed && 'opacity-90'
          )}
        >
          {/* Subtle background pattern */}
          <View className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />

          {/* Main content */}
          <View className="relative flex-row items-center justify-between">
            {/* Left side - Text content */}
            <View className="flex-1 pr-6">
              <View className="flex-row items-center gap-3 mb-2">
                <View className={cn(
                  "w-2 h-2 rounded-full",
                  isDarkColorScheme ? "bg-blue-400" : "bg-yellow-500"
                )} />
                <Text className="text-lg font-semibold text-foreground">
                  {isDarkColorScheme ? 'Dark Mode' : 'Light Mode'}
                </Text>
              </View>
              <Text className="text-sm text-muted-foreground ml-5">
                Currently using {isDarkColorScheme ? 'dark' : 'light'} theme
              </Text>
            </View>

            {/* Right side - Toggle switch */}
            <View className="items-center">
              {/* Toggle track */}
              <View className="w-16 h-8 rounded-full bg-muted border border-border relative mb-2">
                {/* Active indicator */}
                <View className={cn(
                  "absolute top-0.5 w-7 h-7 rounded-full shadow-sm border border-border/50",
                  isDarkColorScheme ? "right-0.5 bg-primary" : "left-0.5 bg-background"
                )}>
                  <View className="flex-1 items-center justify-center">
                    {isDarkColorScheme ? (
                      <MoonStar className="text-primary-foreground" size={14} strokeWidth={2} />
                    ) : (
                      <Sun className="text-foreground" size={14} strokeWidth={2} />
                    )}
                  </View>
                </View>

                {/* Background icons */}
                <View className="absolute inset-0 flex-row items-center justify-between px-2">
                  <Sun className={cn(
                    "text-yellow-500",
                    !isDarkColorScheme ? "opacity-0" : "opacity-30"
                  )} size={12} strokeWidth={2} />
                  <MoonStar className={cn(
                    "text-blue-300",
                    isDarkColorScheme ? "opacity-0" : "opacity-30"
                  )} size={12} strokeWidth={2} />
                </View>
              </View>

              {/* Action text */}
              <Text className="text-xs font-medium text-primary">
                Tap to switch
              </Text>
            </View>
          </View>

        </View>
      )}
    </Pressable>
  );
}

