import { defineConfig } from "vite";
import _uni from "@dcloudio/vite-plugin-uni";
import AutoImport from 'unplugin-auto-import/vite'
import UnoCSS from 'unocss/vite';

console.log("uni module:", _uni);
const uni = typeof _uni === 'function' ? _uni : (_uni.default || Object.values(_uni)[0]);
console.log("uni function:", uni);

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        uni(),
        UnoCSS(),
        AutoImport({
            imports: ["vue", "uni-app", "pinia"],
            dts: true,
        })
    ]
});


