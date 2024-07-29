export async function loadEnvConfig() {
    try {
        let response = await fetch('.env.json');
        if (!response.ok) {
            response = await fetch('env.example.json');
            if (!response.ok) {
                throw new Error('Impossible de charger la configuration');
            }
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
}