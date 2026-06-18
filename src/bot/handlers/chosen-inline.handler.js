const { incrementUsageCount } = require('../../services/voice.service');

async function handleChosenInlineResult(ctx) {
  await incrementUsageCount(ctx.chosenInlineResult.result_id);
}

module.exports = {
  handleChosenInlineResult,
};
