<template>

    <!--#ifdef H5 -->
    <up-input v-bind="{...$attrs,...props}" ref="myInputRef" v-on="listeners">
        <!-- H5 支持动态插槽 -->
        <template v-for="slot in columnSlots" :key="slot" #[slot]>
            <slot :name="slot" v-bind="propsData" />
        </template>
    </up-input>
    <!--#endif -->


    <!-- 微信小程序 不支持v-on -->
    <!--#ifdef MP-WEIXIN -->
    <up-input v-bind="{...$attrs,...props}" ref="myInputRef">
        <!-- 微信小程序显式处理插槽 -->
        <template #prefix>
            <slot name="prefix" />
        </template>
    </up-input>
    <!--#endif -->
</template>

<script setup>
    // 1.props穿透
    // 2.插槽穿透
    // 3.组件方法暴露出去
    // 4.组件事件暴露出去
    import { ref, onMounted, useAttrs } from 'vue';

    const props = defineProps({
        data: Array,
    })
    // 获取所有插槽
    const slots = useSlots();

    // 定义 ref 获取子组件实例
    const myInputRef = ref(null);

    console.log('slots========', slots)

    // 计算需要透传的插槽（排除不需要透传的插槽）
    const columnSlots = computed(() => {
        const excludeSlots = ['default']; // 排除不需要透传的插槽
        return Object.keys(slots).filter(slotName => !excludeSlots.includes(slotName));
    });


    const propsData = computed(() => {
        const row = props.data[0];
        return {
            row: row || '', // 防止数据为空时出错
        };
    });

    const attrs = useAttrs(); // 获取所有属性

    const listeners = Object.keys(attrs)
        .filter(key => key.startsWith('on'))
        .reduce((acc, key) => {
            acc[key] = attrs[key];
            return acc;
        }, {});

    console.log('Object.keys(attrs)========', attrs)

    // 创建 expose 对象，用于暴露子组件方法
    const expose = {}

    // 在 onMounted 生命周期中确保子组件已挂载
    onMounted(() => {
        if (myInputRef.value) {
            // 遍历子组件实例的所有属性和方法
            const entries = Object.entries(myInputRef.value);
            for (const [key, value] of entries) {
                // 仅保留方法（通过 typeof 判断）
                if (typeof value === 'function') {
                    expose[key] = value;
                }
            }

            // nextTick(() => {

            //     myInputRef.value.doFocus();
            // })
            console.log('expose===', expose)
        }
    });

    // 暴露所有方法
    defineExpose(expose);
</script>

<style lang="scss" scoped>
</style>