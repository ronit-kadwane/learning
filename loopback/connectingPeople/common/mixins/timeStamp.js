'use strict';

module.exports = function(Model, options) {
  Model.defineProperty('createdAt', {type: Date, default: '$now'});
  Model.defineProperty('updatedAt', {type: Date, default: '$now'});

  Model.observe('before save', function event(ctx, next) {
    if (ctx.instance) {
      ctx.instance.updatedAt = new Date();
    } else {
      ctx.data.updatedAt = new Date();
    }
    next();
  });
};
