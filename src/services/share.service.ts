import { Raffle } from "../types";

// Versión alternativa con menos emojis (más segura)
export function getWhatsappShareMessageSafe(raffle: Raffle): string {
    const url = `${window.location.origin}/raffle/view/${raffle.id}`;
    const drawDate = new Date(raffle.drawDate).toLocaleDateString('es-AR');

    let message = `🎉 *${raffle.title}* \n`;
    message += `${raffle.descriptionShort}\n\n`;
    message += `📅 *Sorteo:* ${drawDate}\n\n`;

    // Premios (mostrar solo los 3 primeros y leyenda si hay más)
    if (raffle.prizes && raffle.prizes.length > 0) {
        const totalPrizes = raffle.prizes.length;
        const topPrizes = raffle.prizes.slice(0, 3);

        message += `🏆 *PREMIOS:*\n`;
        topPrizes.forEach((prize, index) => {
            const position = index === 0 ? '• 1er Premio' : `• ${index + 1}° Premio`;
            message += `${position}: ${prize.name}\n`;
        });
        if (totalPrizes > 3) {
            message += `… y ${totalPrizes - 3} premios MAS, no podes perder\n`;
        }
        message += '\n';
    }

    // Precios
    if (raffle.priceTiers && raffle.priceTiers.length > 0) {
        message += `💰 *PRECIOS:*\n`;
        raffle.priceTiers.forEach(tier => {
            message += `• ${tier.ticketCount} números x $${tier.amount}\n`;
        });
        message += '\n';
    }

    message += `🔗 ${url}\n`;
    message += '👋🎉😊';

    return message;
}