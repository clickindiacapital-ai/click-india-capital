export const submitToWeb3Forms = async (data: Record<string, any>, formName: string) => {
  const accessKey = "cb13d526-674f-4b95-a69e-57c349f0a14b";
  
  if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
    console.warn("Web3Forms Access Key is missing. Submission simulated.");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: "Simulated success" };
  }

  try {
    const response = await fetch("https://formsubmit.co/ajax/support@clickindiacapital.in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _subject: `New Lead from Click India Capital: ${formName}`,
        _template: "table",
        ...data,
      }),
    });
    const result = await response.json();
    if (!result.success) {
      console.error("Web3Forms error response:", result);
    }
    return { success: result.success, message: result.message || "Unknown error" };
  } catch (error: any) {
    console.error("Web3Forms submission error:", error);
    return { success: false, message: error.message || "Network error" };
  }
};
