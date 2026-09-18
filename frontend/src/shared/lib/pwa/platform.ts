function detectIOS(): boolean {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) return true;
    return /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
}

export const isIOS = detectIOS();
