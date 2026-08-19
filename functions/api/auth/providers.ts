import { json, providerConfig } from "./_utils";

export async function onRequest(context: any) {
  const env = context.env as Record<string, string | undefined>;
  const configured = (provider: "github" | "google" | "apple") => {
    const { clientId, clientSecret, sessionSecret } = providerConfig(
      env,
      provider
    );
    return Boolean(clientId && clientSecret && sessionSecret);
  };

  return json({
    providers: {
      google: configured("google"),
      github: configured("github"),
      apple: configured("apple"),
    },
  });
}
