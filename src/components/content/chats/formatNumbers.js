export const formatTime = (isoString) => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

export const formatDateToISO = (date) => {
    return date.toISOString().replace('T', ' ').replace('Z', '');
};
