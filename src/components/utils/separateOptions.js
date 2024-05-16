function separateOptions(stringOptions) {
    if (!stringOptions.trim()) {
        return [];
    }
    const stringComAspas = stringOptions.replace(/([^;]+ )/g, '"$1"');
    const lista = stringComAspas.split(';');
    const listaFinal = lista.map(item => item.trim().replace(/^"|"$/g, ''));
    return listaFinal;
}

export default separateOptions;