import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';

const DrawerLayout = () => {
    const { isDarkColorScheme } = useColorScheme();
    const theme = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;
    return (
        <Drawer screenOptions={{
            drawerType: 'slide',
            headerTitleStyle: { fontFamily: "Montserrat_700Bold" },
            headerTintColor: theme.text,
            headerStyle: { backgroundColor: theme.background },
            drawerActiveTintColor: theme.primary,
            drawerInactiveTintColor: theme.text,
            drawerStyle: { backgroundColor: theme.background },
            headerShadowVisible: false,
        }}>
            <Drawer.Screen
                name="(tabs)"
                options={{
                    headerTitle: 'Creda',
                    drawerLabel: 'Home',
                    drawerIcon: ({ size, color }) => (
                        <MaterialIcons name="border-bottom" size={size} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="voice"
                options={{
                    headerTitle: 'Creda',
                    drawerLabel: 'Voice Assistant',
                    drawerIcon: ({ size, color }) => <Ionicons name="mic-outline" size={size} color={color} />,
                }}
            />
            <Drawer.Screen
                name="insurance"
                options={{
                    headerTitle: 'Creda',
                    drawerLabel: 'Insurance & Claims',
                    drawerIcon: ({ size, color }) => <Ionicons name="document-text-outline" size={size} color={color} />,
                }}
            />
            <Drawer.Screen
                name="fraud"
                options={{
                    headerTitle: 'Creda',
                    drawerLabel: 'Fraud Alerts history',
                    drawerIcon: ({ size, color }) => <Ionicons name="warning-outline" size={size} color={color} />,
                }}
            />
            <Drawer.Screen
                name="knowledge"
                options={{
                    headerTitle: 'Creda',
                    drawerLabel: 'Knowledge/Sources',
                    drawerIcon: ({ size, color }) => <Ionicons name="library-outline" size={size} color={color} />,
                }}
            />
        <Drawer.Screen
            name="goals"
            options={{
                headerTitle: 'Creda',
                drawerLabel: 'Goals',
                drawerIcon: ({ size, color }) => <Ionicons name="trophy-outline" size={size} color={color} />,
            }}
        />
        <Drawer.Screen
            name="budgets"
            options={{
                headerTitle: 'Creda',
                drawerLabel: 'Budgets',
                drawerIcon: ({ size, color }) => <Ionicons name="wallet-outline" size={size} color={color} />,
            }}
        />
            <Drawer.Screen
                name="settings"
                options={{
                    headerTitle: 'Settings & Profile',
                    drawerLabel: 'Settings & Profile',
                    drawerIcon: ({ size, color }) => <Ionicons name="settings-outline" size={size} color={color} />,
                }}
            />
        </Drawer>
    );
}

export default DrawerLayout;

