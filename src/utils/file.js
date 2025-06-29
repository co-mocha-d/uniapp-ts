// base64转blob
export const parseBlob = (base64) => {
    let arr = base64?.split(',');
    let mime = arr[0]?.match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr?.length;
    let u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
        u8arr[i] = bstr?.charCodeAt(i);
    }
    let url = URL || webkitURL;
    return url?.createObjectURL(
        new Blob([u8arr], {
            type: mime,
        })
    );
};

// Base64编码到File对象
export const base64ToFile = (base64String, fileName) => {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], fileName, {
        type: mime,
    });
};
