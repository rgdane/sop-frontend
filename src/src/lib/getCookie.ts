export function getUser(cookies: any) {
  try {
    const parsed =
      typeof cookies.user === "string"
        ? JSON.parse(cookies.user)
        : cookies.user;

    const firstName = parsed.name.split(" ")[0].toLowerCase();
    parsed.name = firstName.charAt(0).toUpperCase() + firstName.slice(1);

    return parsed;
  } catch (error) {
    console.warn("Gagal parse user dari cookie:", error);
  }
}
