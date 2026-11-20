(() => {
    const STATUS_URL = /^https?:\/\/(?:www\.)?(?:x|twitter)\.com(\/[^/?#]+\/status\/\d+)/i;

    const rewrite = (text) => {
        const match = STATUS_URL.exec(String(text).trim());
        return match ? `https://fixupx.com${match[1]}` : text;
    };

    const { writeText, write } = Clipboard.prototype;

    Clipboard.prototype.writeText = function (text) {
        return writeText.call(this, rewrite(text));
    };

    Clipboard.prototype.write = async function (items) {
        const out = await Promise.all(
        items.map(async (item) => {
            if (!item.types.includes("text/plain")) return item;
            const text = await (await item.getType("text/plain")).text();
            const fixed = rewrite(text);
            return fixed === text
                ? item
                : new ClipboardItem({ "text/plain": new Blob([fixed], { type: "text/plain" }) });
        })
        );
        return write.call(this, out);
    };

    document.addEventListener(
        "copy",
        (e) => {
        const el = document.activeElement;
        const text = /^(TEXTAREA|INPUT)$/.test(el?.tagName)
            ? el.value.slice(el.selectionStart, el.selectionEnd)
            : String(getSelection());
        const fixed = rewrite(text);
        if (fixed !== text) {
            e.preventDefault();
            e.clipboardData.setData("text/plain", fixed);
        }
        },
        true
    );
})();
