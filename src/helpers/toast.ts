import Toast from "react-native-root-toast";

import { lottieAnimations } from '@/utils/lottie';

export const getToastStyles = (type: string) => {
	switch (type) {
		case 'success':
			return {
				backgroundColor: '#def1d7',
				titleColor: '#1f8722',
				descriptionColor: '#1f8722',
                animationSource: lottieAnimations.success,
			}
		case 'error':
			return {
				backgroundColor: '#fae1db',
				titleColor: '#d9108a',
				descriptionColor: '#d9108a',
                animationSource: lottieAnimations.error,
			}
		case 'warning':
			return {
				backgroundColor: '#fef7ec',
				titleColor: '#f08135',
				descriptionColor: '#f08135',
                animationSource: lottieAnimations.warning,
			}
        case 'info':
            return {
                backgroundColor: '#e8f4fd',
                titleColor: '#0d6efd',
                descriptionColor: '#0d6efd',
                animationSource: lottieAnimations.info,
            }
		default:
			return {
				backgroundColor: 'white',
				titleColor: 'black',
				descriptionColor: 'gray',
                animationSource: lottieAnimations.success,
			}
	}
}


export const showToast = (message: string, color: string) => {
  const toast = Toast.show(message, {
    duration: Toast.durations.LONG,
    position: -100,
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 100,
    backgroundColor: color,
  });

  setTimeout(() => {
    Toast.hide(toast);
  }, 3000);
};
