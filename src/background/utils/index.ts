import { NetRequestIDMap } from '~/common/constants';

export const updateSessionRules = (rules: any): void => {
  browser.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [NetRequestIDMap.WikiAPI, NetRequestIDMap.ProjectAPI, NetRequestIDMap.StipeAPI],
    addRules: rules,
  });
};

export const handleBatchRequest = async (data: any) => {
  const { url, body, start, count, reqCountOneTime } = data;

  let newData: string;
  let successCount = 0;
  let failCount = 0;
  const contexts = body.match(/\{\{.*?\}\}/g); // 找出所有花括号地方

  for (let i = start; i < count + start; ) {
    const promiseList = [];
    while (promiseList.length < reqCountOneTime) {
      if (contexts) {
        contexts.forEach((context: string) => {
          const scope = {} as any;
          scope.index = i;
          scope.count = count;
          const sourceStr = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
          scope.uuid = function generateUUID(userId: string, stringLength = 8) {
            const uuidStrings = [];
            for (let i = 0; i < stringLength; i += 1) {
              const digit = Math.floor(Math.random() * (sourceStr.length - 1));
              uuidStrings.push(sourceStr.charAt(digit));
            }
            return (userId || '') + uuidStrings.join('');
          };

          const expression = context.replace(/\{\{(.*?)\}\}/, '$1'); // 去掉花括号 得到表达式
          const fn = new Function(`
                               with (this) {
                               try {
                                    this.result = ${expression};
                               } catch (e) {
                                  console.log(e);
                               } finally {
                                  // none
                               }
                               }`);
          fn.call(scope);
          const formatReg = context
            .replace('+', '\\+')
            .replace('?', '\\?')
            .replace('.', '\\.')
            .replace('(', '\\(')
            .replace(')', '\\)');
          newData = (newData || body).replace(new RegExp(formatReg, 'g'), scope.result); // 把结果替换到当前字符
        });
      }
      promiseList.push(
        new Promise((resolve) =>
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: newData || body,
          })
            .then(async (res) => await res)
            .then((res) => {
              resolve(res.status === 200);
            })
            .catch(() => {
              resolve(false);
            })
        )
      );
      ++i;
    }

    const res = await Promise.all(promiseList);
    successCount += res.filter((item) => item).length;
    failCount += res.filter((item) => !item).length;

    browser.runtime.sendMessage({
      type: 'batchRequest-tip',
      data: `当前进度 ${i - start}/${count}`,
    });
  }

  browser.runtime.sendMessage({
    type: 'batchRequest-tip',
    status: 'done',
    failCount,
    data: ['执行完成，', `成功：${successCount}，`, `失败：${failCount}`].join(' '),
  });
};
