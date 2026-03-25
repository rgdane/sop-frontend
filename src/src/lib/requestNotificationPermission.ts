export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      return;
    }

    return true;
  } catch (error) {
    console.error("Error Requesting Notification Permission:", error);
    return;
  }
};
