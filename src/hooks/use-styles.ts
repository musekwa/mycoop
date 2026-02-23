import { useColorScheme } from "react-native"

export const useStyles = () => {
    const isDarkMode = useColorScheme() === 'dark'
    const headerStyle = {
        backgroundColor: isDarkMode ? 'black' : 'white',
    }
    const headerTitleStyle = {
        color: isDarkMode ? 'white' : 'black',
        fontSize: 14,
        fontWeight: 'bold' as const,
    }
    return {
        isDarkMode,
        headerStyle,
        headerTitleStyle
    }
}