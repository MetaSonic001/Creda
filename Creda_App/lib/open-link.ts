import { Linking } from "react-native";

const openLink = async (url) => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.log("Don't know how to open URI: " + url);
    }
  } catch (error) {
    console.error('An error occurred', error);
  }
};

export default openLink;
