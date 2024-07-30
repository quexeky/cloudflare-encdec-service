function isHex(str: string) {
    return /[0-9A-Fa-f]{6}/g.test(str);
}