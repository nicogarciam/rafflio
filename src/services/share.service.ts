import { Raffle } from "../types";

// Versión alternativa con menos emojis (más segura)
export function getWhatsappShareMessageSafe(raffle: Raffle): string {
    const url = `${window.location.origin}/raffle/view/${raffle.id}`;
    const drawDate = new Date(raffle.drawDate).toLocaleDateString('es-AR');

    let message = `🎉 *${raffle.title}* 🎉\n`;
    message += `${raffle.description}\n\n`;
    message += `📅 *Sorteo:* ${drawDate}\n\n`;

    // Premios
    if (raffle.prizes && raffle.prizes.length > 0) {
        message += `🏆 *PREMIOS:*\n`;
        raffle.prizes.forEach((prize, index) => {
            const position = index === 0 ? '• 1er Premio: Premio Mayor' : `• ${index + 1}° Premio`;
            const description = prize.description ? ` - ${prize.description}` : '';
            message += `${position}: ${prize.name}${description}\n`;
        });
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