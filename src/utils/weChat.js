import { useUserStore } from '@/store/index';

// 小程序更新检测
export const weChatCheckUpdate = () => {
  // #ifdef MP-WEIXIN
  const updateManager = uni.getUpdateManager();

  updateManager.onCheckForUpdate(function (res) {
    // 请求完新版本信息的回调
  });

  updateManager.onUpdateReady(function (res) {
    uni.showModal({
      title: '更新提示',
      content: '新版本已经准备好，是否重启应用？',
      success(res) {
        if (res.confirm) {
          // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
          updateManager.applyUpdate();
        }
      },
    });
  });

  updateManager.onUpdateFailed(function (res) {
    // 新的版本下载失败
  });
  // #endif
};

/**
 * @description 小程序 订阅通知
 * @param type 订阅场景类型（clockIn：打卡；approval：审批；auditResult：审批结果）
 * @param judge_department_super 是否判断部门负责人
 */
export const weChatSubscribeMessage = (
  type = '',
  judge_department_super = false
) => {
  let userStore = useUserStore();
  let template_ids = userStore?.userInfo?.no_subscribe_template_ids || {};
  let admin_info = userStore?.userInfo?.admin_info || {};

  console.log('template_ids', template_ids);
  return new Promise((resolve, reject) => {
    console.log('订阅消息授权', type);
    // #ifndef MP-WEIXIN
    resolve(true);
    // #endif
    // #ifdef MP-WEIXIN
    let tmplIds = [];
    switch (type) {
      // 打卡
      case 'clockIn':
        tmplIds = template_ids?.click_in_notify || [];
        break;
      // 审批
      case 'audit':
        if ((judge_department_super && admin_info.is_department_super == 1) || !judge_department_super) {
          tmplIds = template_ids?.audit_notify || [];
        }
        break;
      // 审批结果
      case 'auditResult':
        tmplIds = template_ids?.result_notify || [];
        break;
    }

    if (tmplIds?.length === 0) {
      resolve(true);
      return;
    }

    uni.requestSubscribeMessage({
      tmplIds,
      success(sqRes) {
        console.log('订阅消息授权成功', sqRes);
        resolve(true);
        let agreeItems = [];
        Object.keys(sqRes)?.map((item) => {
          if (sqRes[item] === 'accept') {
            agreeItems.push(item);
          }
        });
        if (agreeItems?.length > 0) {
          let url = uni.$urls.user.appletPushSubscriber;
          let postData = {
            template_ids: agreeItems.join(','),
          };
          uni.$doHttp.post(url, postData, { load: false }).then((res) => {
            console.log(`提交订阅成功`);
          });
        }
      },
      fail(err) {
        console.log('订阅消息授权失败', err);
        resolve(false);
      },
    });
    // #endif
  });
};
